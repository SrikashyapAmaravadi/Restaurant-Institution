import { Router } from 'express';
import prisma from '../config/db.js';

const router = Router();

/**
 * POST /api/payments/:bookingId/settle
 * Settle booking bill with 3 options: UPI, CASH, or CARD
 */
router.post('/:bookingId/settle', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      method = 'UPI', // UPI | CASH | CARD
      subtotal,
      discount = 0,
      tax = 0,
      totalAmount,
      billedBy,
      details = {}
    } = req.body;

    const finalDetails = {
      ...details,
      ...(billedBy ? { billedBy } : {})
    };

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
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const calculatedSubtotal = subtotal !== undefined ? Number(subtotal)
      : booking.orders.reduce((sum, o) => sum + o.price * o.quantity, 0);
    const calculatedDiscount = discount !== undefined ? Number(discount)
      : Math.round(calculatedSubtotal * 0.20);
    const calculatedTax = tax !== undefined ? Number(tax)
      : Math.round((calculatedSubtotal - calculatedDiscount) * 0.05);
    const finalAmount = totalAmount !== undefined ? Number(totalAmount)
      : calculatedSubtotal - calculatedDiscount + calculatedTax;

    const txnId = `TXN-${method}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        method,
        transactionId: txnId,
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        tax: calculatedTax,
        totalAmount: finalAmount,
        detailsJson: JSON.stringify(finalDetails),
        status: 'PAID'
      },
      update: {
        method,
        transactionId: txnId,
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        tax: calculatedTax,
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

    // Add notification
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'success',
          title: 'Payment Completed & Settled',
          body: `Bill for ${booking.restaurantName} settled via ${method} (₹${finalAmount}). Invoice: ${txnId}.`,
          read: false
        }
      });
    }

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
          subtotal: calculatedSubtotal,
          discount: calculatedDiscount,
          tax: calculatedTax,
          grandTotal: finalAmount,
          method,
          details: finalDetails,
          billedBy: finalDetails.billedBy
        }
      }
    });
  } catch (err) {
    console.error('Payment settlement error:', err);
    res.status(500).json({ success: false, error: 'Payment failed: ' + err.message });
  }
});

/**
 * GET /api/payments/:bookingId
 * Get payment receipt for a booking
 */
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: { orders: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found for this booking' });
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
