import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { getAccessTokenFromRequest } from '../lib/cookies.js';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return secret;
}

export async function authenticateToken(req, res, next) {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: No authentication token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session: User not found'
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired authentication token'
    });
  }
}

export async function optionalAuth(req, res, next) {
  const token = getAccessTokenFromRequest(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded.userId
      ? await prisma.user.findUnique({ where: { id: decoded.userId } })
      : null;
  } catch {
    req.user = null;
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
}

export function requireVerified(req, res, next) {
  if (!req.user?.verified) {
    return res.status(403).json({
      success: false,
      error: 'Institutional verification required before using this feature'
    });
  }
  next();
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

export function requireRestaurantScope(paramKey = 'id') {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required'
      });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const rawTarget =
      req.params[paramKey] ||
      req.params.restaurantId ||
      req.body.restaurantId ||
      req.query.restaurantId;

    if (!rawTarget) {
      return next();
    }

    const targetRestaurantId = parseInt(rawTarget, 10);
    const userRestaurantId = parseInt(req.user.restaurantId, 10);

    if (!isNaN(userRestaurantId) && userRestaurantId === targetRestaurantId) {
      return next();
    }

    try {
      const membership = await prisma.restaurantMember.findFirst({
        where: {
          userId: req.user.id,
          restaurantId: targetRestaurantId,
          status: 'ACTIVE'
        }
      });
      if (membership) {
        return next();
      }
    } catch {
      // membership table may be empty on older databases
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden (IDOR Prevention): You do not have permissions to access or mutate resources for this restaurant'
    });
  };
}

export async function userCanOperateRestaurant(user, restaurantId) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const target = Number(restaurantId);
  if (
    (user.role === 'RESTAURANT_STAFF' || user.role === 'RESTAURANT_ADMIN') &&
    Number(user.restaurantId) === target
  ) {
    return true;
  }
  const membership = await prisma.restaurantMember.findFirst({
    where: {
      userId: user.id,
      restaurantId: target,
      status: 'ACTIVE'
    }
  });
  return Boolean(membership);
}

export async function recordAuditLog(req, { action, entityType, entityId, details = null }) {
  try {
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        userName: req.user?.name || null,
        userRole: req.user?.role || null,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        detailsJson: details ? (typeof details === 'object' ? JSON.stringify(details) : String(details)) : null,
        ipAddress
      }
    });
  } catch (err) {
    console.error('Failed to write audit log entry:', err.message);
  }
}
