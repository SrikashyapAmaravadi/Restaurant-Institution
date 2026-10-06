# ✅ Edge Functions Deployed Successfully!

Both edge functions are now live on your Supabase project.

## 🎯 Deployed Functions

1. ✅ **send-booking-reminder** - Sends email reminders 1 hour before booking
2. ✅ **cleanup-expired-bookings** - Auto-cancels past-date bookings

---

## 🔐 CRITICAL: Set Environment Variables

### Step 1: Go to Supabase Dashboard
https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/secrets

### Step 2: Add These Secrets

Click **"Add new secret"** for each:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `RESEND_API_KEY` | `re_YOUR_RESEND_API_KEY` | Get from Resend dashboard |
| `SUPABASE_URL` | `https://wwlyizwrrtaziosuwswh.supabase.co` | Already known |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Get from Step 3 below |

### Step 3: Get Service Role Key

1. Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/api
2. Scroll to **"Project API keys"**
3. Copy the **"service_role"** key (NOT the anon key)
4. Add it as `SUPABASE_SERVICE_ROLE_KEY` secret

⚠️ **Important:** Service role key bypasses Row Level Security - keep it secret!

---

## ⏰ Schedule Functions (Choose One Method)

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/functions
2. Click on **"send-booking-reminder"**
3. Scroll to **"Cron Jobs"**
4. Click **"Add Cron Trigger"**
5. Set schedule: `0 * * * *` (every hour)
6. Click **"Create"**

Repeat for **cleanup-expired-bookings** with schedule: `0 2 * * *` (daily at 2 AM)

### Method 2: Using pg_cron (Advanced)

Run this in Supabase SQL Editor:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Get your anon key from: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/api
-- Replace YOUR_ANON_KEY below

-- Schedule booking reminders (every hour)
SELECT cron.schedule(
  'send-booking-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/send-booking-reminder',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule cleanup (daily at 2 AM)
SELECT cron.schedule(
  'cleanup-expired-bookings',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/cleanup-expired-bookings',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}'::jsonb
  ) as request_id;
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- To remove a job (if needed)
-- SELECT cron.unschedule('send-booking-reminders');
```

---

## 🧪 Test Your Functions

### Get Your Anon Key
https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/api
(Copy the "anon public" key)

### Test Booking Reminder

```bash
curl -i --location --request POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/send-booking-reminder' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "remindersSent": 0
}
```
(0 because no bookings are exactly 1 hour away right now)

### Test Cleanup Function

```bash
curl -i --location --request POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/cleanup-expired-bookings' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "cancelledCount": 0
}
```

---

## 📊 Monitor Function Logs

### View Logs in Dashboard
https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/logs/functions

### View Logs via CLI

```bash
# Real-time logs for booking reminder
supabase functions logs send-booking-reminder --project-ref wwlyizwrrtaziosuwswh

# Real-time logs for cleanup
supabase functions logs cleanup-expired-bookings --project-ref wwlyizwrrtaziosuwswh
```

---

## 🎨 Cron Expression Guide

| Expression | Description | Use Case |
|------------|-------------|----------|
| `0 * * * *` | Every hour at :00 | Booking reminders |
| `0 2 * * *` | Every day at 2 AM | Cleanup expired |
| `*/30 * * * *` | Every 30 minutes | Frequent checks |
| `0 9 * * 1` | Every Monday at 9 AM | Weekly reports |
| `0 0 1 * *` | 1st of every month | Monthly tasks |

Test your cron expressions: https://crontab.guru/

---

## ✅ Quick Checklist

- [ ] Set `RESEND_API_KEY` in Supabase secrets
- [ ] Set `SUPABASE_URL` in Supabase secrets
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in Supabase secrets
- [ ] Schedule `send-booking-reminder` to run every hour
- [ ] Schedule `cleanup-expired-bookings` to run daily
- [ ] Test both functions manually with curl
- [ ] Monitor logs to verify execution
- [ ] Set up alerts for function errors (optional)

---

## 🚀 What's Next?

### More Edge Functions You Can Build:

1. **QR Code Generator** - Generate QR codes for bookings
2. **Payment Webhook Handler** - Process Razorpay/Stripe webhooks
3. **Daily Analytics Report** - Email daily stats to admins
4. **Review Moderation** - Auto-flag inappropriate content
5. **Capacity Optimizer** - Analyze and suggest optimal slots
6. **Offer Campaign Manager** - Auto-enable/disable offers
7. **SMS Notifications** - Integration with Twilio/MSG91

---

## 📚 Resources

- **Dashboard**: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh
- **Functions**: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/functions
- **Logs**: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/logs/functions
- **Secrets**: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/secrets
- **API Keys**: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/api

Need help? Check `SUPABASE_EDGE_FUNCTIONS_GUIDE.md` for detailed documentation!
