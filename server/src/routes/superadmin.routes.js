import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, recordAuditLog } from '../middleware/auth.js';

const router = Router();

// Protect ALL routes in this file with RBAC: SUPER_ADMIN role only!
router.use(authenticateToken, requireRole('SUPER_ADMIN'));

/**
 * GET /api/superadmin/audit-logs
 * System-wide audit log trail for governance & compliance
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, entityType, limit = 50 } = req.query;
    const where = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10)
    });

    res.json({
      success: true,
      data: logs,
      total: logs.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/superadmin/analytics/platform
 * Comprehensive institutional and operational analytics
 */
router.get('/analytics/platform', async (req, res) => {
  try {
    const [
      totalUsers,
      totalRestaurants,
      totalBookings,
      totalInstitutions,
      activeOffers,
      auditEventsCount,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.booking.count(),
      prisma.institution.count(),
      prisma.offer.count({ where: { status: 'ACTIVE' } }),
      prisma.auditLog.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, verified: true, createdAt: true }
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRestaurants,
        totalBookings,
        totalInstitutions,
        activeOffers,
        auditEventsCount,
        recentUsers,
        recentBookings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/superadmin/clearance-queue
 * Get all pending student/faculty verification requests
 */
router.get('/clearance-queue', async (req, res) => {
  try {
    const queue = await prisma.verificationRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: queue
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/superadmin/send-code
 * Super Admin generates & dispatches a 6-digit verification passkey to user
 */
router.post('/send-code', async (req, res) => {
  try {
    const { applicantId } = req.body;

    if (!applicantId) {
      return res.status(400).json({ success: false, error: 'Applicant ID is required' });
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Find applicant
    let applicant = await prisma.verificationRequest.findFirst({
      where: {
        OR: [
          { id: applicantId },
          { email: applicantId }
        ]
      }
    });

    if (!applicant) {
      // If user exists without a request, create one
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id: applicantId }, { email: applicantId }]
        }
      });

      if (user) {
        applicant = await prisma.verificationRequest.create({
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.department || 'Student',
            idProof: `BU-${Date.now().toString().slice(-6)}`,
            status: 'CODE_SENT',
            verificationCode: randomCode
          }
        });
      } else {
        return res.status(404).json({ success: false, error: 'Applicant not found' });
      }
    } else {
      applicant = await prisma.verificationRequest.update({
        where: { id: applicant.id },
        data: {
          status: 'CODE_SENT',
          verificationCode: randomCode
        }
      });
    }

    // Add notification for the user
    if (applicant.userId) {
      await prisma.notification.create({
        data: {
          userId: applicant.userId,
          type: 'success',
          title: 'Super Admin Clearance Passkey Issued',
          body: `Dr. A. K. Sharma (Super Admin) has issued your clearance code: ${randomCode}. Enter this to verify your account.`,
          code: randomCode,
          read: false
        }
      });
    }

    await recordAuditLog(req, {
      action: 'PASSKEY_DISPATCHED',
      entityType: 'VERIFICATION_REQUEST',
      entityId: applicant.id,
      details: { email: applicant.email, applicantName: applicant.name }
    });

    res.json({
      success: true,
      message: `Verification code ${randomCode} generated and sent to ${applicant.name} (${applicant.email})`,
      data: {
        code: randomCode,
        applicant
      }
    });
  } catch (err) {
    console.error('Send code error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/superadmin/approve/:id
 * Direct approval of applicant
 */
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const applicant = await prisma.verificationRequest.findUnique({
      where: { id }
    });

    if (!applicant) {
      return res.status(404).json({ success: false, error: 'Applicant not found' });
    }

    await prisma.verificationRequest.update({
      where: { id },
      data: { status: 'VERIFIED' }
    });

    if (applicant.email) {
      await prisma.user.updateMany({
        where: { email: applicant.email },
        data: { verified: true }
      });
    }

    await recordAuditLog(req, {
      action: 'APPLICANT_VERIFIED_DIRECT',
      entityType: 'VERIFICATION_REQUEST',
      entityId: id,
      details: { email: applicant.email, applicantName: applicant.name }
    });

    res.json({
      success: true,
      message: `Applicant ${applicant.name} approved and activated.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/superadmin/institutions
 * List institutions
 */
router.get('/institutions', async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { isPrimary: 'desc' }
    });
    res.json({ success: true, data: institutions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/superadmin/stats
 * Platform metrics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { verified: true } });
    const partnerRestaurants = await prisma.restaurant.count();
    const totalBookings = await prisma.booking.count();
    const pendingVerifications = await prisma.verificationRequest.count({ where: { status: 'PENDING' } });

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        partnerRestaurants,
        totalBookings,
        pendingVerifications
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/superadmin/restaurants
 * Onboard a new partner restaurant with initial seating tables
 */
router.post('/restaurants', async (req, res) => {
  try {
    const {
      name,
      tagline,
      cuisine,
      price = '₹₹',
      address,
      phone,
      hours = '11:00 AM – 11:00 PM',
      capacity = 40,
      image,
      heroImage,
      description,
      tags = [],
      features = [],
      popularDishes = [],
      ownerEmail,
      ownerName,
      ownerPassword = 'password123'
    } = req.body;

    if (!name || !cuisine || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant name, cuisine, address, and phone are required.'
      });
    }

    const defaultImage = image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        tagline: tagline || `${cuisine} Specialties & Campus Partner`,
        cuisine,
        price,
        rating: 4.8,
        reviews: 1,
        distance: 0.9,
        isOpen: true,
        hasOffer: true,
        offerLabel: '15% Off',
        address,
        phone,
        hours,
        capacity: Number(capacity) || 40,
        image: defaultImage,
        heroImage: heroImage || defaultImage,
        description: description || `Welcome to ${name}, proud institutional dining partner for Bennett University.`,
        tagsJson: JSON.stringify(tags.length ? tags : [cuisine, 'Campus Partner', 'Instant Booking']),
        featuresJson: JSON.stringify(features.length ? features : ['Air Conditioned', 'Campus WiFi', 'Group Seating']),
        popularDishesJson: JSON.stringify(popularDishes.length ? popularDishes : ['House Special Platter'])
      }
    });

    // Create 4 initial tables for reservation
    const tablesData = [
      { id: `T${restaurant.id}-01`, restaurantId: restaurant.id, capacity: 2, type: 'Couple Booth' },
      { id: `T${restaurant.id}-02`, restaurantId: restaurant.id, capacity: 4, type: 'Standard Table' },
      { id: `T${restaurant.id}-03`, restaurantId: restaurant.id, capacity: 4, type: 'Window Seating' },
      { id: `T${restaurant.id}-04`, restaurantId: restaurant.id, capacity: 6, type: 'Party Booth' }
    ];

    await prisma.restaurantTable.createMany({
      data: tablesData
    });

    // Optionally create restaurant owner user if provided
    if (ownerEmail) {
      const emailLower = ownerEmail.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({ where: { email: emailLower } });
      if (!existingUser) {
        const bcrypt = await import('bcryptjs');
        const passwordHash = bcrypt.default.hashSync(ownerPassword, 10);
        await prisma.user.create({
          data: {
            name: ownerName || `${name} Manager`,
            email: emailLower,
            passwordHash,
            role: 'RESTAURANT_ADMIN',
            roleLabel: `${name} Owner & Manager`,
            department: name,
            restaurantId: restaurant.id,
            verified: true,
            homePath: '/management/admin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
          }
        });
      } else {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { restaurantId: restaurant.id }
        });
      }
    }

    await recordAuditLog(req, {
      action: 'RESTAURANT_ONBOARDED',
      entityType: 'RESTAURANT',
      entityId: restaurant.id,
      details: { name: restaurant.name, cuisine: restaurant.cuisine }
    });

    res.status(201).json({
      success: true,
      message: `Restaurant "${restaurant.name}" successfully onboarded.`,
      data: {
        ...restaurant,
        tags: tags.length ? tags : [cuisine, 'Campus Partner', 'Instant Booking'],
        features: features.length ? features : ['Air Conditioned', 'Campus WiFi', 'Group Seating'],
        popularDishes: popularDishes.length ? popularDishes : ['House Special Platter']
      }
    });
  } catch (err) {
    console.error('Create restaurant error:', err);
    res.status(500).json({ success: false, error: 'Failed to onboard restaurant: ' + err.message });
  }
});

/**
 * PATCH /api/superadmin/restaurants/:id/status
 * Toggle restaurant active / suspended state
 */
router.patch('/restaurants/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { isOpen } = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { isOpen }
    });

    await recordAuditLog(req, {
      action: isOpen ? 'RESTAURANT_RESUMED' : 'RESTAURANT_SUSPENDED',
      entityType: 'RESTAURANT',
      entityId: id,
      details: { isOpen }
    });

    res.json({
      success: true,
      message: `Restaurant status set to ${isOpen ? 'Open' : 'Suspended'}`,
      data: restaurant
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/superadmin/restaurants/:id
 * Remove a partner restaurant and all associated tables/menus
 */
router.delete('/restaurants/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.restaurant.findUnique({ where: { id } });

    await prisma.restaurant.delete({
      where: { id }
    });

    await recordAuditLog(req, {
      action: 'RESTAURANT_DELETED',
      entityType: 'RESTAURANT',
      entityId: id,
      details: { name: existing?.name }
    });

    res.json({
      success: true,
      message: 'Restaurant deleted successfully.'
    });
  } catch (err) {
    console.error('Delete restaurant error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete restaurant: ' + err.message });
  }
});

export default router;
