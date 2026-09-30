import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, recordAuditLog } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createBookingSchema, cancelBookingSchema } from '../validators/index.js';
import { generateQrDataUrl } from '../services/qr.service.js';
import { sendBookingConfirmationEmail } from '../services/email.service.js';

const router = Router();

/**
 * Helper: Sanitize string against basic XSS
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
}

/**
 * GET /api/bookings
 * Get bookings scoped to authenticated user or restaurant staff tenancy
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let whereClause = {};

    if (user.role === 'STUDENT') {
      whereClause = {
        OR: [
          { userId: user.id },
          { guestEmail: user.email.toLowerCase() }
        ]
      };
    } else if (user.role === 'RESTAURANT_STAFF' || user.role === 'RESTAURANT_ADMIN') {
      const targetRestId = req.query.restaurantId ? Number(req.query.restaurantId) : Number(user.restaurantId);
      if (!targetRestId) {
        return res.status(403).json({ success: false, error: 'Restaurant staff account must be linked to a valid outlet' });
      }
      whereClause = { restaurantId: targetRestId };
    } else if (user.role === 'SUPER_ADMIN') {
      if (req.query.restaurantId) {
        whereClause = { restaurantId: Number(req.query.restaurantId) };
      }
    } else {
      return res.status(403).json({ success: false, error: 'Unauthorized role' });
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        orders: true,
        payment: true,
        restaurant: {
          select: { id: true, name: true, image: true, phone: true, address: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    console.error('[GET_BOOKINGS_ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings: ' + err.message });
  }
});

/**
 * GET /api/bookings/my
 * Get current authenticated user's personal bookings
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { userId: user.id },
          { guestEmail: user.email.toLowerCase() }
        ]
      },
      include: {
        orders: true,
        payment: true,
        restaurant: {
          select: { id: true, name: true, image: true, address: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    console.error('[GET_MY_BOOKINGS_ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch personal bookings: ' + err.message });
  }
});

/**
 * GET /api/bookings/:id
 * Retrieve a specific booking with access authorization check
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        orders: true,
        payment: true,
        restaurant: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking reservation not found' });
    }

    // Access authorization check
    const isOwner = (booking.userId === user.id || booking.guestEmail.toLowerCase() === user.email.toLowerCase());
    const isRestStaff = (user.role === 'RESTAURANT_STAFF' || user.role === 'RESTAURANT_ADMIN') && Number(user.restaurantId) === booking.restaurantId;
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    if (!isOwner && !isRestStaff && !isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to view this reservation' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve booking: ' + err.message });
  }
});

/**
 * POST /api/bookings
 * Create a new table reservation with transactional capacity lock & validation
 */
router.post('/', authenticateToken, validate(createBookingSchema), async (req, res) => {
  try {
    const {
      restaurantId,
      restaurantName,
      restaurantImage,
      date,
      time,
      guests = 2,
      guestName,
      guestEmail,
      specialRequest,
      tableAssigned,
      orders = []
    } = req.body;

    const user = req.user;
    const restIdNum = Number(restaurantId);
    const numGuests = Number(guests) || 2;
    const finalGuestName = sanitizeInput(guestName || user?.name || 'Institutional Diner');
    const finalGuestEmail = (guestEmail || user?.email).toLowerCase().trim();
    const cleanSpecialRequest = sanitizeInput(specialRequest || 'Table Reservation');

    // Concurrency-safe capacity lock and booking creation inside a transaction
    const bookingResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch restaurant outlet
      const rest = await tx.restaurant.findUnique({
        where: { id: restIdNum },
        include: { tables: true }
      });

      if (!rest) {
        const err = new Error('Restaurant outlet not found');
        err.statusCode = 404;
        throw err;
      }

      if (!rest.isOpen) {
        const err = new Error('This restaurant outlet is currently closed for reservations');
        err.statusCode = 400;
        throw err;
      }

      // 2. Strict Capacity Check
      let targetTable = null;
      if (tableAssigned) {
        targetTable = rest.tables?.find(t => t.id === tableAssigned && !t.isOccupied && t.capacity >= numGuests);
      }
      if (!targetTable) {
        // Find best fit table with suitable capacity
        targetTable = rest.tables?.find(t => !t.isOccupied && t.capacity >= numGuests);
      }

      if (!targetTable) {
        const err = new Error(`Capacity full: No available table for ${numGuests} guests at this outlet. Please select another time or smaller group size.`);
        err.statusCode = 409;
        throw err;
      }

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const bookingCode = `DB-${randomNum}`;
      
      // Generate server-side QR code Data URL (no external dependencies)
      const qrCode = await generateQrDataUrl(`${bookingCode}-BENNETT-VERIFIED`);
      const finalImage = restaurantImage || rest.image;

      // 3. Mark table occupied
      await tx.restaurantTable.update({
        where: { id: targetTable.id },
        data: {
          isOccupied: true,
          currentGuest: finalGuestName,
          currentBookingId: bookingCode
        }
      });

      // 4. Create booking record
      const newBooking = await tx.booking.create({
        data: {
          id: bookingCode,
          restaurantId: restIdNum,
          restaurantName: rest.name || restaurantName,
          restaurantImage: finalImage,
          userId: user.id,
          guestName: finalGuestName,
          guestEmail: finalGuestEmail,
          date,
          time,
          guests: numGuests,
          status: 'CONFIRMED',
          specialRequest: cleanSpecialRequest,
          tableAssigned: targetTable.id,
          qrCode
        }
      });

      // 5. Create initial orders if provided
      if (orders.length > 0) {
        await tx.bookingOrder.createMany({
          data: orders.map(o => ({
            bookingId: newBooking.id,
            name: sanitizeInput(o.name),
            price: Number(o.price) || 0,
            quantity: Number(o.quantity || o.qty || 1)
          }))
        });
      }

      return newBooking;
    });

    // Send confirmation in-app notification
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'booking',
          title: 'Table Reserved Successfully!',
          body: `Confirmed reservation at ${bookingResult.restaurantName} for ${numGuests} guests on ${bookingResult.date} at ${bookingResult.time}. Table ${bookingResult.tableAssigned}.`,
          read: false
        }
      });
    } catch {
      // non-fatal
    }

    // Send confirmation email
    sendBookingConfirmationEmail({
      to: finalGuestEmail,
      name: finalGuestName,
      booking: bookingResult
    }).catch(e => console.warn('[BOOKING_EMAIL_ERROR]', e.message));

    // Audit log
    await recordAuditLog(req, {
      action: 'BOOKING_CREATED',
      entityType: 'BOOKING',
      entityId: bookingResult.id,
      details: { restaurantId: restIdNum, guests: numGuests, date, time }
    });

    const completeBooking = await prisma.booking.findUnique({
      where: { id: bookingResult.id },
      include: { orders: true, payment: true }
    });

    res.status(201).json({
      success: true,
      message: 'Table reservation confirmed successfully!',
      data: completeBooking
    });
  } catch (err) {
    console.error('[CREATE_BOOKING_ERROR]', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message || 'Booking reservation failed' });
  }
});

/**
 * PATCH /api/bookings/:id/cancel
 * Cancel a booking and release table capacity
 */
router.patch('/:id/cancel', authenticateToken, validate(cancelBookingSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking reservation not found' });
    }

    // Authorization: User must be booking owner, restaurant staff, or superadmin
    const isOwner = (booking.userId === user.id || booking.guestEmail.toLowerCase() === user.email.toLowerCase());
    const isRestStaff = (user.role === 'RESTAURANT_STAFF' || user.role === 'RESTAURANT_ADMIN') && Number(user.restaurantId) === booking.restaurantId;
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    if (!isOwner && !isRestStaff && !isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You can only cancel your own reservations' });
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: `Booking is already ${booking.status.toLowerCase()}` });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { orders: true, payment: true }
    });

    // Release table
    if (booking.tableAssigned) {
      await prisma.restaurantTable.updateMany({
        where: { id: booking.tableAssigned },
        data: {
          isOccupied: false,
          currentGuest: null,
          currentBookingId: null
        }
      });
    }

    // Notify user
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'system',
          title: 'Reservation Cancelled',
          body: `Your booking #${id} for ${booking.restaurantName} on ${booking.date} has been cancelled.`,
          read: false
        }
      }).catch(() => {});
    }

    await recordAuditLog(req, {
      action: 'BOOKING_CANCELLED',
      entityType: 'BOOKING',
      entityId: id,
      details: { cancelledBy: user.id, role: user.role }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Reservation cancelled successfully. Table capacity released.'
    });
  } catch (err) {
    console.error('[CANCEL_BOOKING_ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to cancel reservation: ' + err.message });
  }
});

/**
 * PATCH /api/bookings/:id/status
 * Update booking lifecycle status (CONFIRMED -> SEATED -> PAYMENT_PENDING -> COMPLETED -> CANCELLED)
 * Strictly authorized: Only assigned restaurant staff/admin or superadmin may advance status.
 * Students may only cancel their own reservations.
 */
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tableAssigned } = req.body;
    const user = req.user;

    const allowedStatuses = ['CONFIRMED', 'SEATED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking reservation not found' });
    }

    // Role-based authorization
    const isOwner = (booking.userId === user.id || booking.guestEmail.toLowerCase() === user.email.toLowerCase());
    const isStaffOfRestaurant = (user.role === 'RESTAURANT_STAFF' || user.role === 'RESTAURANT_ADMIN') && Number(user.restaurantId) === booking.restaurantId;
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    if (user.role === 'STUDENT') {
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Access denied: You do not own this reservation' });
      }
      if (status !== 'CANCELLED') {
        return res.status(403).json({
          success: false,
          error: 'Students may only cancel their reservations. Table seating and completion must be performed by restaurant staff.'
        });
      }
    } else if (!isStaffOfRestaurant && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permissions to manage bookings for this restaurant'
      });
    }

    const finalTable = tableAssigned || booking.tableAssigned;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(finalTable ? { tableAssigned: finalTable } : {})
      },
      include: { orders: true, payment: true }
    });

    // Manage floor table occupancy
    if (status === 'SEATED') {
      if (finalTable) {
        await prisma.restaurantTable.updateMany({
          where: { id: finalTable },
          data: {
            isOccupied: true,
            currentGuest: booking.guestName,
            currentBookingId: booking.id
          }
        });
      }
    } else if (status === 'COMPLETED' || status === 'CANCELLED') {
      if (booking.tableAssigned) {
        await prisma.restaurantTable.updateMany({
          where: { id: booking.tableAssigned },
          data: {
            isOccupied: false,
            currentGuest: null,
            currentBookingId: null
          }
        });
      }
    }

    await recordAuditLog(req, {
      action: `BOOKING_STATUS_${status}`,
      entityType: 'BOOKING',
      entityId: id,
      details: { previousStatus: booking.status, newStatus: status, updatedBy: user.id }
    });

    res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      data: updated
    });
  } catch (err) {
    console.error('[STATUS_UPDATE_ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to update reservation status: ' + err.message });
  }
});

/**
 * POST /api/bookings/:id/orders
 * Add kitchen orders to active table tab (by diner or restaurant staff)
 */
router.post('/:id/orders', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity = 1 } = req.body;
    const user = req.user;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Item name and price are required' });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking reservation not found' });
    }

    // Authorization check
    const isOwner = (booking.userId === user.id || booking.guestEmail.toLowerCase() === user.email.toLowerCase());
    const isStaffOfRest = (user.role === 'RESTAURANT_STAFF' || user.role === 'RESTAURANT_ADMIN') && Number(user.restaurantId) === booking.restaurantId;
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    if (!isOwner && !isStaffOfRest && !isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify orders on this reservation' });
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: `Cannot add orders to a ${booking.status.toLowerCase()} reservation` });
    }

    const cleanName = sanitizeInput(name);
    const existing = await prisma.bookingOrder.findFirst({
      where: { bookingId: id, name: cleanName }
    });

    if (existing) {
      await prisma.bookingOrder.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + Number(quantity) }
      });
    } else {
      await prisma.bookingOrder.create({
        data: {
          bookingId: id,
          name: cleanName,
          price: Number(price),
          quantity: Number(quantity)
        }
      });
    }

    const updatedBooking = await prisma.booking.findUnique({
      where: { id },
      include: { orders: true, payment: true }
    });

    res.json({
      success: true,
      message: 'Item added to table tab',
      data: updatedBooking
    });
  } catch (err) {
    console.error('[ADD_ORDER_ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to add order item: ' + err.message });
  }
});

export default router;
