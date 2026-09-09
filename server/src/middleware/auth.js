import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dine_bennett_super_secret_jwt_key_2026_rbac';

/**
 * Middleware: Authenticate Bearer JWT Token
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: No authentication token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session: User not found in database'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired authentication token'
    });
  }
}

/**
 * Middleware: Optional Authentication (attaches user if present)
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}

/**
 * Middleware: Require specific RBAC roles
 * @param  {...string} allowedRoles (e.g. 'SUPER_ADMIN', 'RESTAURANT_STAFF')
 */
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

/**
 * Helper: Generate JWT Token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Middleware: Enforce Tenancy / Restaurant Scoping (Anti-IDOR)
 * Ensures restaurant admins and staff can only access data belonging to their assigned restaurant.
 * Super Admins are granted global scope.
 */
export function requireRestaurantScope(paramKey = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required'
      });
    }

    // Super Admin has global bypass privileges
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

    if (isNaN(userRestaurantId) || userRestaurantId !== targetRestaurantId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden (IDOR Prevention): You do not have permissions to access or mutate resources for this restaurant'
      });
    }

    next();
  };
}

/**
 * Helper: Non-blocking Audit Logger
 * Asynchronously logs administrative and operational events to the AuditLog table.
 */
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


