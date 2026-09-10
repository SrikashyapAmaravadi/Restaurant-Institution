import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, requireRestaurantScope, recordAuditLog } from '../middleware/auth.js';

const router = Router();

function formatRestaurant(r) {
  return {
    ...r,
    tags: r.tagsJson ? JSON.parse(r.tagsJson) : [],
    features: r.featuresJson ? JSON.parse(r.featuresJson) : [],
    popularDishes: r.popularDishesJson ? JSON.parse(r.popularDishesJson) : [],
    gallery: r.galleryJson ? JSON.parse(r.galleryJson) : [r.image]
  };
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * GET /api/restaurants
 * List partner establishments with discovery filters & Haversine distance
 */
router.get('/', async (req, res) => {
  try {
    const { search, cuisine, price, minRating, openOnly, hasOffer, userLat, userLng, maxDist } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cuisine: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (cuisine) {
      const cuisineList = cuisine.split(',').map(c => c.trim());
      where.cuisine = { in: cuisineList };
    }

    if (price) {
      const priceList = price.split(',').map(p => p.trim());
      where.price = { in: priceList };
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (openOnly === 'true') {
      where.isOpen = true;
    }

    if (hasOffer === 'true') {
      where.hasOffer = true;
    }

    let restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        offers: {
          where: { status: 'ACTIVE' }
        }
      },
      orderBy: { rating: 'desc' }
    });

    let formatted = restaurants.map(formatRestaurant);

    // Compute server-side Haversine distance if coordinates are provided
    if (userLat && userLng) {
      const uLat = parseFloat(userLat);
      const uLng = parseFloat(userLng);
      formatted = formatted.map(r => {
        if (r.lat && r.lng) {
          const calcDist = calculateHaversineDistance(uLat, uLng, r.lat, r.lng);
          return { ...r, distance: calcDist };
        }
        return r;
      });

      if (maxDist) {
        const mDist = parseFloat(maxDist);
        formatted = formatted.filter(r => r.distance <= mDist);
      }

      formatted.sort((a, b) => a.distance - b.distance);
    }

    res.json({
      success: true,
      total: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('[API] Error in GET /restaurants:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/restaurants/:id/analytics
 * Operational analytics for a specific dining outlet
 */
router.get(
  '/:id/analytics',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'RESTAURANT_STAFF'),
  requireRestaurantScope('id'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id, 10);

      const [restaurant, tables, bookings, menuItems] = await Promise.all([
        prisma.restaurant.findUnique({ where: { id: restaurantId } }),
        prisma.restaurantTable.findMany({ where: { restaurantId } }),
        prisma.booking.findMany({ where: { restaurantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
        prisma.menuItem.findMany({ where: { restaurantId } })
      ]);

      if (!restaurant) {
        return res.status(404).json({ success: false, error: 'Restaurant outlet not found' });
      }

      const totalTables = tables.length;
      const occupiedTables = tables.filter((t) => t.isOccupied).length;
      const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;
      const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
      const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;

      // Calculate gross revenue from completed orders (estimated from guests * avg ticket or fixed)
      const estimatedRevenue = completedBookings * 420 + confirmedBookings * 280;

      res.json({
        success: true,
        data: {
          restaurantId,
          restaurantName: restaurant.name,
          occupancy: {
            totalTables,
            occupiedTables,
            availableTables: totalTables - occupiedTables,
            occupancyRate
          },
          orders: {
            total: totalBookings,
            confirmed: confirmedBookings,
            completed: completedBookings,
            cancelled: cancelledBookings,
            estimatedRevenue
          },
          menu: {
            totalDishes: menuItems.length,
            inStock: menuItems.filter((m) => m.isAvailable).length,
            outOfStock: menuItems.filter((m) => !m.isAvailable).length
          },
          recentBookings: bookings.slice(0, 8)
        }
      });
    } catch (err) {
      console.error('Restaurant analytics error:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch restaurant analytics' });
    }
  }
);

/**
 * GET /api/restaurants/:id
 * Get restaurant by ID with menus and tables
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        tables: true,
        menuItems: true,
        offers: {
          where: { status: 'ACTIVE' }
        },
        studentReviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Group menu items by category
    const menuByCategory = {};
    for (const item of restaurant.menuItems) {
      if (!menuByCategory[item.category]) {
        menuByCategory[item.category] = [];
      }
      menuByCategory[item.category].push(item);
    }

    res.json({
      success: true,
      data: {
        ...formatRestaurant(restaurant),
        menuByCategory,
        tables: restaurant.tables,
        menuItems: restaurant.menuItems,
        offers: restaurant.offers,
        reviewsCount: typeof restaurant.reviews === 'number' ? restaurant.reviews : (restaurant.studentReviews?.length || 0),
        reviews: typeof restaurant.reviews === 'number' ? restaurant.reviews : (restaurant.studentReviews?.length || 0),
        studentReviews: restaurant.studentReviews || [],
        reviewsList: restaurant.studentReviews || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/restaurants/:id/menu
 * Add a new dish to the restaurant's menu
 */
router.post(
  '/:id/menu',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('id'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id, 10);
      const {
        name,
        category = 'Main Course',
        desc,
        price,
        isVeg = true,
        badge,
        calories = '320 kcal',
        image
      } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({ success: false, error: 'Dish name and price are required' });
      }

      const uniqueId = `m-${restaurantId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;

      const newItem = await prisma.menuItem.create({
        data: {
          id: uniqueId,
          restaurantId,
          category,
          name,
          desc: desc || '',
          price: parseFloat(price),
          isVeg: Boolean(isVeg),
          isAvailable: true,
          badge: badge || null,
          calories: calories || null,
          image: image || null
        }
      });

      await recordAuditLog(req, {
        action: 'MENU_ITEM_CREATED',
        entityType: 'MENU_ITEM',
        entityId: newItem.id,
        details: { name: newItem.name, price: newItem.price, restaurantId }
      });

      res.status(201).json({
        success: true,
        message: `Dish "${newItem.name}" added to menu successfully.`,
        data: newItem
      });
    } catch (err) {
      console.error('Add menu item error:', err);
      res.status(500).json({ success: false, error: 'Failed to add menu item: ' + err.message });
    }
  }
);

/**
 * PATCH /api/restaurants/:id/menu/:itemId
 * Update dish details or toggle stock availability
 */
router.patch(
  '/:id/menu/:itemId',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('id'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id, 10);
      const { itemId } = req.params;
      const { name, category, desc, price, isVeg, isAvailable, badge, calories, image } = req.body;

      const existing = await prisma.menuItem.findUnique({ where: { id: itemId } });
      if (!existing || existing.restaurantId !== restaurantId) {
        return res.status(404).json({ success: false, error: 'Menu item not found in this outlet' });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (category !== undefined) updateData.category = category;
      if (desc !== undefined) updateData.desc = desc;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (isVeg !== undefined) updateData.isVeg = Boolean(isVeg);
      if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
      if (badge !== undefined) updateData.badge = badge;
      if (calories !== undefined) updateData.calories = calories;
      if (image !== undefined) updateData.image = image;

      const updatedItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: updateData
      });

      await recordAuditLog(req, {
        action: 'MENU_ITEM_UPDATED',
        entityType: 'MENU_ITEM',
        entityId: itemId,
        details: { changes: updateData, restaurantId }
      });

      res.json({
        success: true,
        message: `Dish "${updatedItem.name}" updated successfully.`,
        data: updatedItem
      });
    } catch (err) {
      console.error('Update menu item error:', err);
      res.status(500).json({ success: false, error: 'Failed to update menu item: ' + err.message });
    }
  }
);

/**
 * DELETE /api/restaurants/:id/menu/:itemId
 * Remove a dish from the menu
 */
router.delete(
  '/:id/menu/:itemId',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('id'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id, 10);
      const { itemId } = req.params;

      const existing = await prisma.menuItem.findUnique({ where: { id: itemId } });
      if (!existing || existing.restaurantId !== restaurantId) {
        return res.status(404).json({ success: false, error: 'Menu item not found in this outlet' });
      }

      await prisma.menuItem.delete({
        where: { id: itemId }
      });

      await recordAuditLog(req, {
        action: 'MENU_ITEM_DELETED',
        entityType: 'MENU_ITEM',
        entityId: itemId,
        details: { name: existing.name, restaurantId }
      });

      res.json({
        success: true,
        message: 'Menu item deleted successfully.'
      });
    } catch (err) {
      console.error('Delete menu item error:', err);
      res.status(500).json({ success: false, error: 'Failed to delete menu item: ' + err.message });
    }
  }
);

// ── Payment QR Codes CRUD ──────────────────────────────────────────────────
const restaurantPaymentQrs = new Map();
restaurantPaymentQrs.set(1, [
  {
    id: 'qr-spicegarden-1',
    label: 'Primary Counter UPI (GPay / PhonePe / Paytm)',
    upiId: 'spicegarden.dining@icici',
    image: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=spicegarden.dining@icici&pn=The%20Spice%20Garden',
    isActive: true,
    createdAt: new Date().toISOString()
  }
]);

/**
 * GET /api/restaurants/:id/payment-qrs
 * Fetch active or all payment QRs for restaurant
 */
router.get('/:id/payment-qrs', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);
    const qrs = restaurantPaymentQrs.get(restaurantId) || [];
    res.json({ success: true, data: qrs });
  } catch (err) {
    console.error('Error fetching payment QRs:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch payment QR codes' });
  }
});

/**
 * POST /api/restaurants/:id/payment-qrs
 * Add new payment QR code
 */
router.post(
  '/:id/payment-qrs',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('id'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id, 10);
      const { label, upiId, image, isActive } = req.body;

      if (!label || !upiId) {
        return res.status(400).json({ success: false, error: 'Label and UPI ID are required' });
      }

      const qrs = restaurantPaymentQrs.get(restaurantId) || [];
      const isFirst = qrs.length === 0;
      const makeActive = isActive !== undefined ? Boolean(isActive) : isFirst;

      if (makeActive) {
        qrs.forEach((q) => (q.isActive = false));
      }

      const newQr = {
        id: `qr-${restaurantId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        label: label.trim(),
        upiId: upiId.trim(),
        image: image || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(upiId)}`,
        isActive: makeActive,
        createdAt: new Date().toISOString()
      };

      qrs.unshift(newQr);
      restaurantPaymentQrs.set(restaurantId, qrs);

      await recordAuditLog(req, {
        action: 'PAYMENT_QR_CREATED',
        entityType: 'RESTAURANT',
        entityId: String(restaurantId),
        details: { qrId: newQr.id, label: newQr.label, upiId: newQr.upiId }
      });

      res.status(201).json({ success: true, message: 'Payment QR added successfully', data: newQr });
    } catch (err) {
      console.error('Error adding payment QR:', err);
      res.status(500).json({ success: false, error: 'Failed to add payment QR code' });
    }
  }
);

/**
 * PATCH /api/restaurants/:id/payment-qrs/:qrId
 * Edit a payment QR code
 */
router.patch(
  '/:id/payment-qrs/:qrId',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('id'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id, 10);
      const { qrId } = req.params;
      const { label, upiId, image, isActive } = req.body;

      const qrs = restaurantPaymentQrs.get(restaurantId) || [];
      const index = qrs.findIndex((q) => q.id === qrId);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Payment QR not found' });
      }

      if (isActive) {
        qrs.forEach((q) => (q.isActive = false));
      }

      const target = qrs[index];
      if (label !== undefined) target.label = label.trim();
      if (upiId !== undefined) {
        target.upiId = upiId.trim();
        if (!image) {
          target.image = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(upiId)}`;
        }
      }
      if (image !== undefined) target.image = image;
      if (isActive !== undefined) target.isActive = Boolean(isActive);

      restaurantPaymentQrs.set(restaurantId, qrs);

      res.json({ success: true, message: 'Payment QR updated successfully', data: target });
    } catch (err) {
      console.error('Error updating payment QR:', err);
      res.status(500).json({ success: false, error: 'Failed to update payment QR' });
    }
  }
);

/**
 * POST /api/restaurants/:id/payment-qrs/:qrId/set-active
 * Set a specific QR as the active payment QR
 */
router.post(
  '/:id/payment-qrs/:qrId/set-active',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('id'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id, 10);
      const { qrId } = req.params;

      const qrs = restaurantPaymentQrs.get(restaurantId) || [];
      const target = qrs.find((q) => q.id === qrId);

      if (!target) {
        return res.status(404).json({ success: false, error: 'Payment QR not found' });
      }

      qrs.forEach((q) => (q.isActive = q.id === qrId));
      restaurantPaymentQrs.set(restaurantId, qrs);

      res.json({ success: true, message: `"${target.label}" is now the active payment QR`, data: target });
    } catch (err) {
      console.error('Error activating payment QR:', err);
      res.status(500).json({ success: false, error: 'Failed to set active payment QR' });
    }
  }
);

/**
 * DELETE /api/restaurants/:id/payment-qrs/:qrId
 * Remove a payment QR code
 */
router.delete(
  '/:id/payment-qrs/:qrId',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('id'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id, 10);
      const { qrId } = req.params;

      let qrs = restaurantPaymentQrs.get(restaurantId) || [];
      const wasActive = qrs.find((q) => q.id === qrId)?.isActive;
      qrs = qrs.filter((q) => q.id !== qrId);

      // If we deleted the active one and have others, make the first one active
      if (wasActive && qrs.length > 0) {
        qrs[0].isActive = true;
      }

      restaurantPaymentQrs.set(restaurantId, qrs);

      res.json({ success: true, message: 'Payment QR deleted successfully' });
    } catch (err) {
      console.error('Error deleting payment QR:', err);
      res.status(500).json({ success: false, error: 'Failed to delete payment QR' });
    }
  }
);

export default router;


