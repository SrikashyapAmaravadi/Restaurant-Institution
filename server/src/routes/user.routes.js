import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, recordAuditLog } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Super Admin: List all platform users with filtering & search
 */
router.get('/', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { role, verified, search } = req.query;

    const where = {};
    if (role) {
      where.role = role;
    }
    if (verified !== undefined) {
      where.verified = verified === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleLabel: true,
        department: true,
        rollNumber: true,
        institution: true,
        verified: true,
        restaurantId: true,
        createdAt: true,
        _count: {
          select: { bookings: true, notifications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: 'Internal server error fetching users' });
  }
});

/**
 * GET /api/users/:id
 * Super Admin or self: User profile details
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'SUPER_ADMIN' && req.user.id !== id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view user profile' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleLabel: true,
        department: true,
        rollNumber: true,
        institution: true,
        verified: true,
        restaurantId: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PATCH /api/users/:id/verify
 * Super Admin: Toggle user verification status
 */
router.patch('/:id/verify', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { verified: Boolean(verified) },
      select: { id: true, name: true, email: true, role: true, verified: true }
    });

    await recordAuditLog(req, {
      action: updated.verified ? 'USER_VERIFIED' : 'USER_UNVERIFIED',
      entityType: 'USER',
      entityId: id,
      details: { targetEmail: updated.email, verified: updated.verified }
    });

    res.json({
      success: true,
      data: updated,
      message: `User verification status updated to ${updated.verified ? 'Verified' : 'Unverified'}`
    });
  } catch (err) {
    console.error('Error updating user verification:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PATCH /api/users/:id/role
 * Super Admin: Change user role and assign/unassign restaurantId
 */
router.patch('/:id/role', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, restaurantId } = req.body;

    const validRoles = ['SUPER_ADMIN', 'RESTAURANT_ADMIN', 'RESTAURANT_STAFF', 'STUDENT', 'FACULTY', 'GUEST'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const restIdNum = restaurantId ? parseInt(restaurantId, 10) : null;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role,
        restaurantId: ['RESTAURANT_ADMIN', 'RESTAURANT_STAFF'].includes(role) ? restIdNum : null
      },
      select: { id: true, name: true, email: true, role: true, restaurantId: true }
    });

    await recordAuditLog(req, {
      action: 'USER_ROLE_CHANGED',
      entityType: 'USER',
      entityId: id,
      details: { role, restaurantId: restIdNum }
    });

    res.json({
      success: true,
      data: updated,
      message: `User role successfully updated to ${role}`
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/users/:id
 * Super Admin: Delete user
 */
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own Super Admin account' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    await recordAuditLog(req, {
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: id,
      details: { email: targetUser.email, role: targetUser.role }
    });

    res.json({
      success: true,
      message: 'User removed from platform successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
