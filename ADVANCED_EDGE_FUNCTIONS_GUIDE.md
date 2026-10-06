# 🚀 Advanced Edge Functions Guide
## Payment Reminders, Rewards System & Push Notifications

---

## 📦 New Edge Functions Created

### 1. **payment-reminder** 💳
- Reminds users with PAYMENT_PENDING bookings (older than 10 minutes)
- Sends email reminders with payment details
- Creates in-app notifications
- Auto-cancels if payment not completed in 30 minutes

### 2. **rewards-processor** 🎁
- Automatically calculates and awards points for completed bookings
- Tracks first-time booking bonuses
- Sends congratulations emails with points breakdown
- Creates reward audit logs

### 3. **push-notification** 📲
- Sends push notifications via FCM (Firebase Cloud Messaging)
- Creates in-app notifications
- Falls back to email if push not available
- Supports single or bulk notifications

---

## 🗄️ Database Schema Updates

### Step 1: Run Advanced Features SQL

Go to Supabase SQL Editor and run: `ADVANCED_FEATURES_SCHEMA.sql`

This adds:
- ✅ Rewards tracking (Reward table)
- ✅ Referral system (Referral table)
- ✅ Push subscriptions (PushSubscription table)
- ✅ User reward points field
- ✅ FCM token storage
- ✅ Notification preferences
- ✅ Automatic point calculation triggers

---

## 🚀 Deploy New Functions

```bash
cd server

# Deploy all new functions
supabase functions deploy payment-reminder --project-ref wwlyizwrrtaziosuwswh
supabase functions deploy rewards-processor --project-ref wwlyizwrrtaziosuwswh
supabase functions deploy push-notification --project-ref wwlyizwrrtaziosuwswh
```

---

## 🔐 Environment Variables

Add to Supabase Secrets: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/secrets

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `RESEND_API_KEY` | `re_YOUR_KEY` | Email notifications |
| `SUPABASE_URL` | `https://wwlyizwrrtaziosuwswh.supabase.co` | Database connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Get from API settings | Admin operations |
| `FCM_SERVER_KEY` | Get from Firebase Console | Push notifications (optional) |

---

## ⏰ Schedule Functions

### Dashboard Method (Recommended)

1. Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/functions
2. For each function, add cron schedule:

| Function | Schedule | Description |
|----------|----------|-------------|
| `payment-reminder` | `*/10 * * * *` | Every 10 minutes |
| `rewards-processor` | `*/5 * * * *` | Every 5 minutes |
| `send-booking-reminder` | `0 * * * *` | Every hour |
| `cleanup-expired-bookings` | `0 2 * * *` | Daily at 2 AM |

### SQL Method (Alternative)

```sql
-- Payment reminders (every 10 minutes)
SELECT cron.schedule(
  'payment-reminders',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url:='https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/payment-reminder',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);

-- Rewards processor (every 5 minutes)
SELECT cron.schedule(
  'process-rewards',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/rewards-processor',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## 🎯 Rewards System - How It Works

### Points Structure

| Action | Points Earned |
|--------|---------------|
| 🎫 Complete Booking | 50 points |
| 💳 Complete Payment | 100 points |
| 🌟 First Booking Bonus | 200 points |
| ⭐ Submit Review | 75 points |
| 👥 Successful Referral | 150 points |
| 💰 Spend Bonus | 1% of bill (₹100 = 1 point) |

### Automatic Processing

1. User completes booking
2. Payment is processed
3. `rewards-processor` runs every 5 minutes
4. Detects new completed bookings
5. Calculates total points
6. Updates user's reward balance
7. Sends congratulations email
8. Creates in-app notification
9. Logs transaction in AuditLog

### Example Calculation

**Booking:** ₹1,500 total bill, First-time user

```
Base booking points:        50
Payment completion:        100
First booking bonus:       200
Spend bonus (1%):          15  (₹1,500 × 0.01)
─────────────────────────────
Total points earned:       365 points
```

---

## 📲 Push Notifications Setup

### Option 1: Firebase Cloud Messaging (FCM)

#### Get FCM Server Key:

1. Go to: https://console.firebase.google.com/
2. Create project or select existing
3. Go to **Project Settings** → **Cloud Messaging**
4. Copy **Server Key**
5. Add to Supabase secrets as `FCM_SERVER_KEY`

#### Client-Side Integration (React):

```javascript
// src/services/pushNotifications.js
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export async function requestPushPermission(userId) {
  try {
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      })
      
      // Save token to user profile
      await fetch('/api/users/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fcmToken: token })
      })
      
      return token
    }
  } catch (error) {
    console.error('Push notification error:', error)
  }
}
```

### Option 2: Web Push API (Native)

```javascript
// Request permission and subscribe
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.register('/sw.js')
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
  })
  
  // Save to database
  await supabase.from('PushSubscription').insert({
    userId: currentUser.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth
  })
}
```

---

## 🧪 Testing Edge Functions

### Test Payment Reminder

```bash
curl -X POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/payment-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "pendingBookings": 2,
  "remindersSent": 2,
  "notificationsCreated": 2
}
```

### Test Rewards Processor

```bash
curl -X POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/rewards-processor' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

**Expected Response:**
```json
{
  "success": true,
  "completedBookings": 3,
  "rewardsProcessed": 3,
  "rewardsSummary": [
    {
      "bookingId": "DB-4821",
      "userId": "user-123",
      "points": 365,
      "isFirstBooking": true
    }
  ]
}
```

### Test Push Notification

```bash
curl -X POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/push-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "USER_UUID_HERE",
    "title": "🎉 Test Notification",
    "body": "This is a test push notification",
    "actionUrl": "https://restaurant-institution.vercel.app/bookings"
  }'
```

---

## 📊 View Rewards Dashboard

### SQL Query: User Rewards Summary

```sql
SELECT 
  u.name,
  u.email,
  u."rewardPoints" as "currentPoints",
  COUNT(r.id) as "totalTransactions",
  SUM(CASE WHEN r.type = 'EARNED' THEN r.points ELSE 0 END) as "totalEarned",
  SUM(CASE WHEN r.type = 'REDEEMED' THEN r.points ELSE 0 END) as "totalRedeemed"
FROM "User" u
LEFT JOIN "Reward" r ON r."userId" = u.id
WHERE u.role = 'STUDENT'
GROUP BY u.id, u.name, u.email, u."rewardPoints"
ORDER BY u."rewardPoints" DESC
LIMIT 10;
```

### SQL Query: Recent Rewards Activity

```sql
SELECT 
  r.id,
  u.name as "userName",
  r.type,
  r.source,
  r.points,
  r.description,
  r."createdAt"
FROM "Reward" r
JOIN "User" u ON u.id = r."userId"
ORDER BY r."createdAt" DESC
LIMIT 20;
```

---

## 🎨 Frontend Integration Examples

### Display User Rewards

```jsx
// components/RewardsCard.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export function RewardsCard({ userId }) {
  const [rewards, setRewards] = useState({ points: 0, transactions: [] })

  useEffect(() => {
    async function loadRewards() {
      const { data: user } = await supabase
        .from('User')
        .select('rewardPoints')
        .eq('id', userId)
        .single()

      const { data: transactions } = await supabase
        .from('Reward')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(5)

      setRewards({
        points: user?.rewardPoints || 0,
        transactions: transactions || []
      })
    }
    
    loadRewards()
  }, [userId])

  return (
    <div className="rewards-card">
      <h2>Your Rewards</h2>
      <div className="points-display">
        <span className="points">{rewards.points}</span>
        <span>Points Available</span>
      </div>
      
      <div className="transactions">
        <h3>Recent Activity</h3>
        {rewards.transactions.map(tx => (
          <div key={tx.id} className="transaction">
            <span>{tx.description}</span>
            <span className={tx.type === 'EARNED' ? 'positive' : 'negative'}>
              {tx.type === 'EARNED' ? '+' : '-'}{tx.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Send Custom Push Notification

```jsx
// Admin panel - send custom notification
async function sendCustomNotification(userIds, title, body) {
  const response = await fetch(
    'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/push-notification',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userIds,
        title,
        body,
        actionUrl: '/offers'
      })
    }
  )
  
  return response.json()
}
```

---

## 📈 Analytics & Monitoring

### View Function Logs

```bash
# Payment reminders
supabase functions logs payment-reminder --project-ref wwlyizwrrtaziosuwswh

# Rewards
supabase functions logs rewards-processor --project-ref wwlyizwrrtaziosuwswh

# Push notifications
supabase functions logs push-notification --project-ref wwlyizwrrtaziosuwswh
```

### Dashboard Metrics

https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/logs/functions

Track:
- ✅ Invocation count
- ✅ Success rate
- ✅ Average execution time
- ✅ Error rate
- ✅ Total rewards distributed
- ✅ Notifications sent

---

## ✅ Complete Setup Checklist

**Database:**
- [ ] Run `ADVANCED_FEATURES_SCHEMA.sql` in Supabase SQL Editor
- [ ] Verify Reward, Referral, and PushSubscription tables created
- [ ] Check User table has new columns (rewardPoints, fcmToken, etc.)

**Edge Functions:**
- [ ] Deploy payment-reminder function
- [ ] Deploy rewards-processor function
- [ ] Deploy push-notification function

**Environment Variables:**
- [ ] Set RESEND_API_KEY
- [ ] Set SUPABASE_URL
- [ ] Set SUPABASE_SERVICE_ROLE_KEY
- [ ] Set FCM_SERVER_KEY (optional, for push)

**Cron Schedules:**
- [ ] payment-reminder: Every 10 minutes
- [ ] rewards-processor: Every 5 minutes
- [ ] send-booking-reminder: Every hour
- [ ] cleanup-expired-bookings: Daily at 2 AM

**Testing:**
- [ ] Test payment reminder with curl
- [ ] Test rewards processor with completed booking
- [ ] Test push notification to test user
- [ ] Monitor logs for errors

**Frontend Integration:**
- [ ] Add rewards display component
- [ ] Integrate FCM for push notifications
- [ ] Add push permission request
- [ ] Display notification preferences

---

## 🎯 Next Features to Build

1. **Redeem Rewards** - Let users spend points on discounts
2. **Referral Program** - Share code, earn points
3. **Loyalty Tiers** - Bronze, Silver, Gold based on points
4. **Birthday Rewards** - Auto-send on user birthday
5. **Flash Sales** - Time-limited offers via push
6. **Analytics Dashboard** - Admin view of rewards metrics

---

## 📚 Resources

- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Firebase FCM**: https://firebase.google.com/docs/cloud-messaging
- **Web Push API**: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- **Resend API**: https://resend.com/docs

---

Ready to go live! 🚀
