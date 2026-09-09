import { Router } from 'express';
import prisma from '../config/db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const user = req.user;
    const notifications = await prisma.notification.findMany({
      where: user ? { OR: [{ userId: user.id }, { userId: null }] } : {},
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (err) {
    console.warn('Notifications fetch warning, returning fallback:', err.message);
    res.json({ success: true, data: [] });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
