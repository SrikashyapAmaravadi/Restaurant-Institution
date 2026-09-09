import prisma from '../config/db.js';

/**
 * Async Notification Dispatch Service
 * Persists in-app notifications and prepares email/SMS webhooks
 */
export async function dispatchNotification({
  userId = null,
  type = 'info', // 'info' | 'success' | 'warning' | 'alert' | 'system'
  title,
  body,
  metadata = null
}) {
  try {
    if (!title || !body) {
      console.warn('[NOTIFICATION_WARN] Missing title or body for notification dispatch');
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        read: false
      }
    });

    console.log(`[NOTIFICATION_DISPATCHED] Type: [${type.toUpperCase()}] To User: ${userId || 'BROADCAST'} | Title: "${title}"`);
    return notification;
  } catch (err) {
    console.error('[NOTIFICATION_DISPATCH_ERROR]', err.message);
    return null;
  }
}

export default {
  dispatchNotification
};
