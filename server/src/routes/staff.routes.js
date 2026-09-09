import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, requireRestaurantScope, recordAuditLog } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

/**
 * GET /api/restaurants/:restaurantId/staff
 * List all staff members assigned to this restaurant
 */
router.get(
  '/',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('restaurantId'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId, 10);

      const staff = await prisma.user.findMany({
        where: {
          restaurantId,
          role: { in: ['RESTAURANT_ADMIN', 'RESTAURANT_STAFF'] }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          verified: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: staff
      });
    } catch (err) {
      console.error('Error fetching staff list:', err);
      res.status(500).json({ success: false, error: 'Internal server error fetching staff' });
    }
  }
);

/**
 * POST /api/restaurants/:restaurantId/staff
 * Add existing user to restaurant staff or create new staff account
 */
router.post(
  '/',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('restaurantId'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId, 10);
      const { email, name, role = 'RESTAURANT_STAFF', password, department } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Staff email is required' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });

      let staffMember;
      if (existingUser) {
        staffMember = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            restaurantId,
            role: role === 'RESTAURANT_ADMIN' ? 'RESTAURANT_ADMIN' : 'RESTAURANT_STAFF'
          },
          select: { id: true, name: true, email: true, role: true, restaurantId: true, verified: true }
        });
      } else {
        if (!password || !name) {
          return res.status(400).json({
            success: false,
            error: 'Name and temporary password are required when creating a new staff account'
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        staffMember = await prisma.user.create({
          data: {
            name,
            email,
            passwordHash: hashedPassword,
            department: department || 'Dining Operations',
            role: role === 'RESTAURANT_ADMIN' ? 'RESTAURANT_ADMIN' : 'RESTAURANT_STAFF',
            restaurantId,
            verified: true
          },
          select: { id: true, name: true, email: true, role: true, restaurantId: true, verified: true }
        });
      }

      await recordAuditLog(req, {
        action: 'STAFF_MEMBER_ASSIGNED',
        entityType: 'USER',
        entityId: staffMember.id,
        details: { email: staffMember.email, role: staffMember.role, restaurantId }
      });

      res.status(201).json({
        success: true,
        data: staffMember,
        message: 'Staff member added to outlet team successfully'
      });
    } catch (err) {
      console.error('Error adding staff member:', err);
      res.status(500).json({ success: false, error: 'Internal server error adding staff member' });
    }
  }
);

/**
 * DELETE /api/restaurants/:restaurantId/staff/:userId
 * Unassign staff member from restaurant
 */
router.delete(
  '/:userId',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  requireRestaurantScope('restaurantId'),
  async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId, 10);
      const { userId } = req.params;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.restaurantId !== restaurantId) {
        return res.status(404).json({ success: false, error: 'Staff member not found in this restaurant' });
      }

      // Prevent unassigning self
      if (req.user.id === userId) {
        return res.status(400).json({ success: false, error: 'Cannot remove your own administrative access' });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          restaurantId: null,
          role: 'STUDENT'
        }
      });

      await recordAuditLog(req, {
        action: 'STAFF_MEMBER_REMOVED',
        entityType: 'USER',
        entityId: userId,
        details: { restaurantId }
      });

      res.json({
        success: true,
        message: 'Staff member removed from outlet team'
      });
    } catch (err) {
      console.error('Error removing staff member:', err);
      res.status(500).json({ success: false, error: 'Internal server error removing staff member' });
    }
  }
);

export default router;
