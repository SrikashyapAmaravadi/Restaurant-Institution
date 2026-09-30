import { Router } from 'express';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, recordAuditLog } from '../middleware/auth.js';

const router = Router();

/**
 * Helper: Calculate bill figures from booking orders
 */
function calculateBill(booking, overrides = {}) {
  const subtotal = overrides.subtotal !== undefined
    ? Number(overrides.subtotal)
    : (booking.orders || []).reduce((sum, o) => sum + (Number(o.price) || 0) * (Number(o.quantity) || 1), 0);

  const discount = overrides.discount !== undefined
    ? Number(overrides.discount)
    : Math.round(subtotal * 0.20); // 20% institutional student discount

  const tax = overrides.tax !== undefined
    ? Number(overrides.tax)
    : Math.round((subtotal - discount) * 0.05); // 5% GST

  const totalAmount = overrides.totalAmount !== undefined
    ? Number(overrides.totalAmount)
    : Math.max(0, subtotal - discount + tax);

  return { subtotal, discount, tax, totalAmount };
}

/**
 * POST /api/payments/create-order
 * Create a real Razorpay payment order for student online checkout
 */
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, error: 'bookingId is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { orders: true, payment: true, restaurant: true }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking reservation not found' });
    }

    // Ensure only booking owner can initiate checkout
    if (booking.userId !== req.user.id && booking.guestEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Access denied: You cannot checkout another user reservation' });
    }

    const { subtotal, discount, tax, totalAmount } = calculateBill(booking);
    const amountInPaise = Math.round(totalAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = `order_${bookingId.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
    let isLiveGateway = false;

    if (keyId && keySecret) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: booking.id,
            notes: {
              restaurantName: booking.restaurantName,
              guestName: booking.guestName,
              guestEmail: booking.guestEmail
            }
          })
        });

        const rzData = await rzResponse.json();
        if (rzResponse.ok && rzData.id) {
          orderId = rzData.id;
          isLiveGateway = true;
        } else {
          console.warn('[RAZORPAY_ORDER_FALLBACK]', rzData);
        }
      } catch (gatewayErr) {
        console.warn('[RAZORPAY_NETWORK_ISSUE] Using resilient sandbox order:', gatewayErr.message);
      }
    }

    res.json({
      success: true,
      data: {
        orderId,
        amount: totalAmount,
        amountInPaise,
        currency: 'INR',
        keyId: keyId || 'rzp_test_campus_dining_sandbox',
        isLiveGateway,
        booking: {
          id: booking.id,
          restaurantName: booking.restaurantName,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail
        },
        bill: { subtotal, discount, tax, totalAmount }
      }
    });
  } catch (err) {
    console.error('[CREATE_ORDER_ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to create payment order: ' + err.message });
  }
});

/**
 * POST /api/payments/verify-signature
 * Cryptographically verify Razorpay payment HMAC-SHA256 signature
 */
router.post('/verify-signature', authenticateToken, async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!bookingId || !razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'bookingId and razorpay_payment_id are required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { orders: true, restaurant: true }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking reservation not found' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify HMAC-SHA256 signature if credentials configured
    if (keySecret && razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

      if (!isSignatureValid) {
        return res.status(400).json({
          success: false,
          error: 'Cryptographic signature verification failed: Payment may be tampered'
        });
      }
    }

    const { subtotal, discount, tax, totalAmount } = calculateBill(booking);

    // Save payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        method: 'UPI',
        transactionId: razorpay_payment_id,
        subtotal,
        discount,
        tax,
        totalAmount,
        detailsJson: JSON.stringify({
          gateway: 'Razorpay',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          verifiedAt: new Date().toISOString()
        }),
        status: 'PAID'
      },
      update: {
        method: 'UPI',
        transactionId: razorpay_payment_id,
        subtotal,
        discount,
        tax,
        totalAmount,
        detailsJson: JSON.stringify({
          gateway: 'Razorpay',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          verifiedAt: new Date().toISOString()
        }),
        status: 'PAID'
      }
    });

    // Mark booking COMPLETED & release table
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' }
    });

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

    // In-app notification
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'success',
          title: 'Payment Confirmed',
          body: `Online payment of ₹${totalAmount} received for ${booking.restaurantName}. Ref: ${razorpay_payment_id}.`,
          read: false
        }
      }).catch(() => {});
    }

    await recordAuditLog(req, {
      action: 'PAYMENT_VERIFIED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: { bookingId, amount: totalAmount, transactionId: razorpay_payment_id }
    });

    res.json({
      success: true,
      message: `Payment of ₹${totalAmount} verified and settled successfully!`,
      data: { payment }
    });
  } catch (err) {
    console.error('[VERIFY_PAYMENT_ERROR]', err);
    res.status(500).json({ success: false, error: 'Payment verification failed: ' + err.message });
  }
});

/**
 * POST /api/payments/:bookingId/settle
 * Settle bill via CASH or Terminal (Strictly restricted to authorized staff/admin of this restaurant)
 */
router.post(
  '/:bookingId/settle',
  authenticateToken,
  requireRole('RESTAURANT_STAFF', 'RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const {
        method = 'CASH', // CASH | CARD | UPI
        subtotal,
        discount,
        tax,
        totalAmount,
        details = {}
      } = req.body;

      if (!['UPI', 'CASH', 'CARD'].includes(method)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment method. Must be UPI, CASH, or CARD.'
        });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { orders: true, payment: true }
      });

      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking reservation not found' });
      }

      // Enforce Restaurant Staff Tenancy Check
      const isStaffOfOutlet =
        (req.user.role === 'RESTAURANT_STAFF' || req.user.role === 'RESTAURANT_ADMIN') &&
        Number(req.user.restaurantId) === booking.restaurantId;
      const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

      if (!isStaffOfOutlet && !isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You can only settle bills for tables in your assigned restaurant outlet'
        });
      }

      const {
        subtotal: calcSubtotal,
        discount: calcDiscount,
        tax: calcTax,
        totalAmount: finalAmount
      } = calculateBill(booking, { subtotal, discount, tax, totalAmount });

      const txnId = `TXN-${method}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const finalDetails = {
        ...details,
        settledByStaffId: req.user.id,
        settledByStaffName: req.user.name,
        settledAt: new Date().toISOString()
      };

      // Create or update payment record
      const payment = await prisma.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          method,
          transactionId: txnId,
          subtotal: calcSubtotal,
          discount: calcDiscount,
          tax: calcTax,
          totalAmount: finalAmount,
          detailsJson: JSON.stringify(finalDetails),
          status: 'PAID'
        },
        update: {
          method,
          transactionId: txnId,
          subtotal: calcSubtotal,
          discount: calcDiscount,
          tax: calcTax,
          totalAmount: finalAmount,
          detailsJson: JSON.stringify(finalDetails),
          status: 'PAID'
        }
      });

      // Mark booking as COMPLETED
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' }
      });

      // Release table on the floor map
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

      // Add notification to diner
      if (booking.userId) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: 'success',
            title: 'Dining Bill Settled',
            body: `Your bill for ${booking.restaurantName} was settled via ${method} (₹${finalAmount}). Invoice: ${txnId}.`,
            read: false
          }
        }).catch(() => {});
      }

      await recordAuditLog(req, {
        action: 'STAFF_BILL_SETTLED',
        entityType: 'PAYMENT',
        entityId: payment.id,
        details: { bookingId, method, amount: finalAmount, staff: req.user.name }
      });

      res.json({
        success: true,
        message: `Payment of ₹${finalAmount} settled successfully via ${method}!`,
        data: {
          payment,
          receipt: {
            invoiceNo: txnId,
            bookingId,
            guestName: booking.guestName,
            restaurantName: booking.restaurantName,
            tableNumber: booking.tableAssigned,
            date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: booking.orders,
            subtotal: calcSubtotal,
            discount: calcDiscount,
            tax: calcTax,
            grandTotal: finalAmount,
            method,
            billedBy: req.user.name
          }
        }
      });
    } catch (err) {
      console.error('[SETTLE_PAYMENT_ERROR]', err);
      res.status(500).json({ success: false, error: 'Payment settlement failed: ' + err.message });
    }
  }
);

/**
 * GET /api/payments/:bookingId
 * Get payment receipt for a booking with access authorization check
 */
router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user = req.user;

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: { orders: true, restaurant: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found for this booking' });
    }

    // Access authorization check
    const isOwner = (payment.booking.userId === user.id || payment.booking.guestEmail.toLowerCase() === user.email.toLowerCase());
    const isStaffOfOutlet = (user.role === 'RESTAURANT_STAFF' || user.role === 'RESTAURANT_ADMIN') && Number(user.restaurantId) === payment.booking.restaurantId;
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    if (!isOwner && !isStaffOfOutlet && !isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to view this receipt' });
    }

    res.json({
      success: true,
      data: {
        ...payment,
        details: payment.detailsJson ? JSON.parse(payment.detailsJson) : {}
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
