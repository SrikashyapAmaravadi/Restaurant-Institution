import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, requireRestaurantScope, recordAuditLog } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/offers
 * List active offers across platform or for a specific restaurant
 */
router.get('/', async (req, res) => {
  try {
    const { restaurantId, all } = req.query;

    const where = {};
    if (restaurantId) {
      where.restaurantId = parseInt(restaurantId, 10);
    }
    if (all !== 'true') {
      where.status = 'ACTIVE';
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        restaurant: {
          select: { id: true, name: true, address: true, rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: offers
    });
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ success: false, error: 'Internal server error fetching offers' });
  }
});

/**
 * GET /api/offers/:id
 * Get single offer details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: { id: true, name: true }
        }
      }
    });

    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }

    res.json({ success: true, data: offer });
  } catch (err) {
    console.error('Error fetching offer:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/offers
 * Create new offer (Super Admin or Restaurant Admin for their restaurant)
 */
router.post(
  '/',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('restaurantId'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        discountPercent,
        promoCode,
        startDate,
        endDate,
        minOrderAmount = 0,
        restaurantId
      } = req.body;

      const targetRestaurantId = req.user.role === 'SUPER_ADMIN'
        ? parseInt(restaurantId, 10)
        : parseInt(req.user.restaurantId, 10);

      if (!title || discountPercent === undefined || !promoCode || isNaN(targetRestaurantId)) {
        return res.status(400).json({
          success: false,
          error: 'Title, discountPercent, promoCode, and valid restaurantId are required'
        });
      }

      const formattedPromo = promoCode.toUpperCase().trim();
      const existingPromo = await prisma.offer.findUnique({ where: { promoCode: formattedPromo } });
      if (existingPromo) {
        return res.status(409).json({ success: false, error: 'Promo code is already in use by another offer' });
      }

      const offer = await prisma.offer.create({
        data: {
          restaurantId: targetRestaurantId,
          title,
          description: description || null,
          discountPercent: parseInt(discountPercent, 10),
          promoCode: formattedPromo,
          startDate: startDate || null,
          endDate: endDate || null,
          minOrderAmount: parseFloat(minOrderAmount) || 0,
          status: 'ACTIVE'
        },
        include: {
          restaurant: { select: { id: true, name: true } }
        }
      });

      await recordAuditLog(req, {
        action: 'OFFER_CREATED',
        entityType: 'OFFER',
        entityId: offer.id,
        details: { title: offer.title, promoCode: offer.promoCode, restaurantId: targetRestaurantId }
      });

      res.status(201).json({
        success: true,
        data: offer,
        message: 'Promotional offer created successfully'
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      res.status(500).json({ success: false, error: 'Internal server error creating offer' });
    }
  }
);

/**
 * PATCH /api/offers/:id/status
 * Toggle offer status (ACTIVE / INACTIVE)
 */
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const offer = await prisma.offer.findUnique({ where: { id } });
      if (!offer) {
        return res.status(404).json({ success: false, error: 'Offer not found' });
      }

      if (req.user.role === 'RESTAURANT_ADMIN' && req.user.restaurantId !== offer.restaurantId) {
        return res.status(403).json({ success: false, error: 'Forbidden: Cannot edit offer belonging to another dining outlet' });
      }

      const newStatus = status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      const updated = await prisma.offer.update({
        where: { id },
        data: { status: newStatus }
      });

      await recordAuditLog(req, {
        action: newStatus === 'ACTIVE' ? 'OFFER_ACTIVATED' : 'OFFER_PAUSED',
        entityType: 'OFFER',
        entityId: id,
        details: { status: newStatus }
      });

      res.json({
        success: true,
        data: updated,
        message: `Offer status updated to ${newStatus}`
      });
    } catch (err) {
      console.error('Error updating offer status:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/offers/:id
 * Delete offer
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const offer = await prisma.offer.findUnique({ where: { id } });
      if (!offer) {
        return res.status(404).json({ success: false, error: 'Offer not found' });
      }

      if (req.user.role === 'RESTAURANT_ADMIN' && req.user.restaurantId !== offer.restaurantId) {
        return res.status(403).json({ success: false, error: 'Forbidden: Cannot delete offer for another restaurant' });
      }

      await prisma.offer.delete({ where: { id } });

      await recordAuditLog(req, {
        action: 'OFFER_DELETED',
        entityType: 'OFFER',
        entityId: id,
        details: { title: offer.title, promoCode: offer.promoCode }
      });

      res.json({
        success: true,
        message: 'Offer deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting offer:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

export default router;
