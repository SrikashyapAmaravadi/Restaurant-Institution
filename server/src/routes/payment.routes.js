import { Router } from 'express';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { authenticateToken, requireRole, recordAuditLog, userCanOperateRestaurant } from '../middleware/auth.js';

const router = Router();

/**
 * Helper: Calculate bill figures from booking orders
 */
function calculateBill(booking, institutionDiscountPercent = 0) {
  const subtotal = (booking.orders || []).reduce(
    (sum, o) => sum + (Number(o.price) || 0) * (Number(o.quantity) || 1),
    0
  );
  const percent = Math.min(100, Math.max(0, Number(institutionDiscountPercent) || 0));
  const discount = Math.round(subtotal * (percent / 100));
  const tax = Math.round((subtotal - discount) * 0.05);
  const totalAmount = Math.max(0, subtotal - discount + tax);
  return { subtotal, discount, tax, totalAmount, discountPercent: percent };
}

async function institutionDiscountForUser(userId) {
  if (!userId) return 0;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { institutionRecord: true }
  });
  return user?.institutionRecord?.discountPercent || 0;
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

    const discountPercent = await institutionDiscountForUser(booking.userId);
    const { subtotal, discount, tax, totalAmount } = calculateBill(booking, discountPercent);
    const amountInPaise = Math.round(totalAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(503).json({
        success: false,
        error: 'Online payments are not configured. Pay at the restaurant via UPI QR or ask staff to settle cash.'
      });
    }

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
    if (!rzResponse.ok || !rzData.id) {
      console.error('[RAZORPAY_ORDER_FAIL]', rzData);
      return res.status(502).json({ success: false, error: 'Payment gateway rejected the order' });
    }

    res.json({
      success: true,
      data: {
        orderId: rzData.id,
        amount: totalAmount,
        amountInPaise,
        currency: 'INR',
        keyId,
        isLiveGateway: true,
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
    if (!keySecret || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Payment signature is required'
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid =
      generatedSignature.length === String(razorpay_signature).length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(String(razorpay_signature))
      );

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        error: 'Cryptographic signature verification failed: Payment may be tampered'
      });
    }

    const discountPercent = await institutionDiscountForUser(booking.userId);
    const { subtotal, discount, tax, totalAmount } = calculateBill(booking, discountPercent);

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
        method = 'CASH',
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
      const isStaffOfOutlet = await userCanOperateRestaurant(req.user, booking.restaurantId);
      if (!isStaffOfOutlet) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You can only settle bills for tables in your assigned restaurant outlet'
        });
      }

      const discountPercent = await institutionDiscountForUser(booking.userId);
      const {
        subtotal: calcSubtotal,
        discount: calcDiscount,
        tax: calcTax,
        totalAmount: finalAmount
      } = calculateBill(booking, discountPercent);

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
    const isStaffOfOutlet = await userCanOperateRestaurant(user, payment.booking.restaurantId);

    if (!isOwner && !isStaffOfOutlet) {
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
