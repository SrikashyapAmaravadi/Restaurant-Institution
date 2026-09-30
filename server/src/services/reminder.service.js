import prisma from '../config/db.js';
import { dispatchNotification } from './notification.service.js';

/**
 * Background Reminder Service
 * Scans upcoming bookings and dispatches reminder notifications
 */
export async function checkAndSendReminders() {
  try {
    const batchSize = 50;
    let skip = 0;
    let hasMore = true;
    let totalScanned = 0;
    let remindersSent = 0;

    while (hasMore) {
      const activeBookings = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'SEATED'] }
        },
        include: {
          restaurant: {
            select: { name: true }
          }
        },
        skip,
        take: batchSize,
        orderBy: { createdAt: 'asc' }
      });

      if (activeBookings.length === 0) {
        hasMore = false;
        break;
      }

      totalScanned += activeBookings.length;

      for (const booking of activeBookings) {
        if (!booking.userId) continue;

        const existingReminder = await prisma.notification.findFirst({
          where: {
            userId: booking.userId,
            title: { contains: `Dining Reminder: ${booking.restaurantName}` }
          }
        });

        if (!existingReminder) {
          await dispatchNotification({
            userId: booking.userId,
            type: 'info',
            title: `Dining Reminder: ${booking.restaurantName}`,
            body: `Your table reservation #${booking.id} for ${booking.guests} guests is confirmed for ${booking.date} at ${booking.time}. Table: ${booking.tableAssigned || 'T-01'}. Access your digital QR pass anytime in My Bookings.`
          });
          remindersSent++;
        }
      }

      if (activeBookings.length < batchSize) {
        hasMore = false;
      } else {
        skip += batchSize;
      }
    }

    console.log(`[REMINDER_SERVICE] Scanned ${totalScanned} active bookings across batches, dispatched ${remindersSent} new dining reminders.`);
    return {
      scanned: totalScanned,
      remindersSent
    };
  } catch (err) {
    console.error('[REMINDER_SERVICE_ERROR]', err.message);
    return { scanned: 0, remindersSent: 0, error: err.message };
  }
}

/**
 * Start periodic reminder cron loop (every 30 minutes)
 */
export function startReminderScheduler(intervalMinutes = 30) {
  const intervalMs = intervalMinutes * 60 * 1000;
  console.log(`[REMINDER_SCHEDULER] Background reminder job scheduled every ${intervalMinutes} minutes.`);

  // Initial run after 5 seconds
  setTimeout(() => {
    checkAndSendReminders().catch(e => console.error('Initial reminder check failed:', e));
  }, 5000);

  // Periodic interval
  const intervalId = setInterval(() => {
    checkAndSendReminders().catch(e => console.error('Periodic reminder check failed:', e));
  }, intervalMs);

  return intervalId;
}

export default {
  checkAndSendReminders,
  startReminderScheduler
};
