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
        reviewsCount: restaurant.reviews,
        reviews: restaurant.studentReviews
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
      const { name, category, desc, price, isVeg, isAvailable, badge, calories } = req.body;

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

export default router;

