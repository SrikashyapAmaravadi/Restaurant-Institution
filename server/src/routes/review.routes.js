import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, recordAuditLog } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createReviewSchema, reviewStatusSchema } from '../validators/index.js';

const router = express.Router({ mergeParams: true });

/**
 * GET /api/restaurants/:id/reviews or GET /api/reviews
 * Fetch verified reviews (scoped to outlet or all reviews for Super Admin moderation)
 */
router.get('/', async (req, res) => {
  try {
    const rawRestId = req.params.id || req.params.restaurantId;
    const restaurantId = rawRestId ? parseInt(rawRestId, 10) : null;

    const whereClause = {};
    if (restaurantId && !isNaN(restaurantId)) {
      whereClause.restaurantId = restaurantId;
      whereClause.status = 'APPROVED';
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        restaurant: {
          select: { id: true, name: true, image: true }
        },
        user: {
          select: { id: true, name: true, role: true, department: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = reviews.length;
    const avgRating = total > 0
      ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1))
      : 4.8;

    const breakdown = {
      5: reviews.filter(r => r.rating >= 4.7).length,
      4: reviews.filter(r => r.rating >= 3.7 && r.rating < 4.7).length,
      3: reviews.filter(r => r.rating >= 2.7 && r.rating < 3.7).length,
      2: reviews.filter(r => r.rating >= 1.7 && r.rating < 2.7).length,
      1: reviews.filter(r => r.rating < 1.7).length
    };

    res.json({
      success: true,
      count: total,
      total,
      avgRating,
      breakdown,
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch restaurant reviews' });
  }
});

/**
 * POST /api/restaurants/:id/reviews
 * Submit a verified student / faculty review with Zod validation
 * Eligibility: User must have completed or seated dining session at this restaurant
 */
router.post('/', authenticateToken, validate(createReviewSchema), async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id || req.params.restaurantId, 10);
    const { rating, comment, dishTried } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, error: 'Rating and comment are required' });
    }

    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be a numeric score between 1 and 5' });
    }

    // Eligibility check: User must have a booking at this restaurant
    const eligibleBooking = await prisma.booking.findFirst({
      where: {
        restaurantId,
        OR: [
          { userId: req.user.id },
          { guestEmail: req.user.email }
        ],
        status: { in: ['COMPLETED', 'SEATED', 'CONFIRMED'] }
      }
    });

    // Super Admin is exempt from booking check; normal users must have booked
    if (!eligibleBooking && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Verified Review Gate: You must have an active or completed table reservation at this restaurant to submit a review.'
      });
    }

    const review = await prisma.review.create({
      data: {
        restaurantId,
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        userDept: req.user.department || req.user.rollNumber || 'Bennett Student Body',
        rating: numRating,
        dishTried: dishTried || null,
        comment: comment.trim(),
        status: 'APPROVED',
        helpfulCount: 0
      }
    });

    // Recalculate restaurant aggregate rating
    const allApproved = await prisma.review.findMany({
      where: { restaurantId, status: 'APPROVED' },
      select: { rating: true }
    });

    const newAvg = parseFloat((allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length).toFixed(1));

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        rating: newAvg,
        reviews: allApproved.length
      }
    });

    await recordAuditLog(req, {
      action: 'REVIEW_SUBMITTED',
      entityType: 'Review',
      entityId: review.id,
      details: { restaurantId, rating: numRating, dishTried }
    });

    res.status(201).json({
      success: true,
      data: {
        ...review,
        isVerified: true
      },
      message: 'Verified review published successfully. Restaurant rating updated.'
    });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ success: false, error: 'Internal server error submitting review' });
  }
});

/**
 * PATCH /api/reviews/:id/helpful
 * Upvote review as helpful
 */
router.patch('/:id/helpful', async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.review.update({
      where: { id },
      data: {
        helpfulCount: { increment: 1 }
      }
    });

    res.json({
      success: true,
      helpfulVotes: updated.helpfulCount,
      data: updated
    });
  } catch (err) {
    console.error('Error upvoting review:', err);
    res.status(500).json({ success: false, error: 'Failed to record helpful vote' });
  }
});

/**
 * PATCH /api/reviews/:id/status
 * Super Admin review moderation (APPROVED / HIDDEN)
 */
router.patch('/:id/status', authenticateToken, requireRole('SUPER_ADMIN'), validate(reviewStatusSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.review.update({
      where: { id },
      data: { status }
    });

    // Recalculate restaurant rating & count based on approved reviews only
    const allApproved = await prisma.review.findMany({
      where: {
        restaurantId: updated.restaurantId,
        status: 'APPROVED'
      }
    });

    const newAvg = allApproved.length > 0
      ? parseFloat((allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length).toFixed(1))
      : 5.0;

    await prisma.restaurant.update({
      where: { id: updated.restaurantId },
      data: {
        rating: newAvg,
        reviews: allApproved.length
      }
    });

    await recordAuditLog(req, {
      action: 'REVIEW_STATUS_MODERATED',
      entityType: 'Review',
      entityId: id,
      details: { newStatus: status, restaurantId: updated.restaurantId, newAvg }
    });

    res.json({
      success: true,
      data: updated,
      message: `Review status changed to ${status}. Restaurant rating updated.`
    });
  } catch (err) {
    console.error('Error moderating review:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete review (Author or Super Admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && req.user.id !== existing.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this review' });
    }

    await prisma.review.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Review removed successfully'
    });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
