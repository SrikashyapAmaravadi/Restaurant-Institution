import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/tables
 * List all floor tables (defaults to restaurant 1 if not specified)
 */
router.get('/', async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId || '1', 10);
    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId },
      orderBy: { id: 'asc' }
    });

    res.json({
      success: true,
      data: tables
    });
  } catch (err) {
    console.warn('Table fetch error, returning fallback:', err.message);
    res.json({ success: true, data: [] });
  }
});

/**
 * PATCH /api/tables/:id
 * Update table occupancy & guest (Staff or Admin only)
 */
router.patch('/:id', authenticateToken, requireRole('RESTAURANT_STAFF', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isOccupied, currentGuest, currentBookingId } = req.body;

    const updated = await prisma.restaurantTable.update({
      where: { id },
      data: {
        isOccupied: typeof isOccupied === 'boolean' ? isOccupied : undefined,
        currentGuest: currentGuest !== undefined ? currentGuest : undefined,
        currentBookingId: currentBookingId !== undefined ? currentBookingId : undefined
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
