# 🚀 Supabase Edge Functions Setup Guide

## Overview
Edge Functions are serverless functions that run on Supabase's global infrastructure. Perfect for background jobs, webhooks, and scheduled tasks.

---

## 📦 What I've Created For You

### 1. **send-booking-reminder** 
- Sends email reminders 1 hour before booking time
- Can run every hour via cron job
- Uses your Resend API for emails

### 2. **cleanup-expired-bookings**
- Auto-cancels expired bookings (past date)
- Can run daily via cron job
- Sends cancellation emails

---

## 🛠️ Setup Instructions

### Step 1: Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
```

### Step 2: Login & Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref wwlyizwrrtaziosuwswh
```

### Step 3: Deploy Edge Functions

```bash
# Deploy the booking reminder function
supabase functions deploy send-booking-reminder \
  --project-ref wwlyizwrrtaziosuwswh

# Deploy the cleanup function
supabase functions deploy cleanup-expired-bookings \
  --project-ref wwlyizwrrtaziosuwswh
```

### Step 4: Set Environment Variables

Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/functions

Add these secrets:
- `RESEND_API_KEY` = `re_YOUR_API_KEY` (your actual key)
- `SUPABASE_URL` = `https://wwlyizwrrtaziosuwswh.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = Get from https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/api

---

## ⏰ Schedule Functions (Cron Jobs)

### Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/functions
2. Click on your function
3. Click **"Create a new cron trigger"**
4. Set schedule:
   - **Booking Reminders**: `0 * * * *` (every hour)
   - **Cleanup Expired**: `0 2 * * *` (daily at 2 AM)

### Using pg_cron (Alternative)

Run in Supabase SQL Editor:

```sql
-- Schedule booking reminders (every hour)
SELECT cron.schedule(
  'send-booking-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/send-booking-reminder',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
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
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

---

## 🧪 Test Edge Functions

### Test Locally

```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve send-booking-reminder --env-file ./supabase/.env.local

# Test with curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/send-booking-reminder' \
  --header 'Authorization: Bearer YOUR_ANON_KEY'
```

### Test in Production

```bash
# Invoke function directly
curl -i --location --request POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/send-booking-reminder' \
  --header 'Authorization: Bearer YOUR_ANON_KEY'
```

---

## 📊 More Edge Function Ideas for Your Project

### 3. **generate-qr-codes**
- Generate QR codes for bookings
- Trigger: On booking creation (webhook)

### 4. **send-otp-email**
- Move OTP sending to edge function
- Better separation of concerns
- Independent scaling

### 5. **analytics-aggregation**
- Daily/weekly analytics reports
- Restaurant performance metrics
- Popular dishes tracking

### 6. **payment-webhook**
- Handle Razorpay/Stripe webhooks
- Update booking payment status

### 7. **review-moderation**
- Auto-flag inappropriate reviews
- Sentiment analysis on reviews

### 8. **capacity-optimizer**
- Analyze booking patterns
- Suggest optimal slot times

---

## 🔐 Security Best Practices

1. **Always use Service Role Key** for admin operations (in edge functions)
2. **Validate webhook signatures** for external webhooks
3. **Rate limit** public-facing edge functions
4. **Use CORS headers** properly
5. **Never expose secrets** in client-side code

---

## 📈 Monitoring & Logs

View logs in real-time:

```bash
# Follow logs for a function
supabase functions logs send-booking-reminder --project-ref wwlyizwrrtaziosuwswh
```

Or in dashboard:
https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/logs/functions

---

## 💡 When to Use Edge Functions vs Your Node.js Server

**Use Edge Functions for:**
- ✅ Scheduled/cron jobs
- ✅ Webhooks from external services
- ✅ Background processing
- ✅ Email/SMS sending
- ✅ Global low-latency needs

**Use Your Node.js Server for:**
- ✅ Complex business logic
- ✅ Multi-step transactions
- ✅ Real-time WebSocket connections
- ✅ Heavy computational tasks
- ✅ Integration with existing auth system

---

## 📚 Resources

- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Deno Deploy**: https://deno.com/deploy
- **Cron Expression Generator**: https://crontab.guru/

---

## ✅ Quick Start Checklist

- [ ] Install Supabase CLI
- [ ] Login and link project
- [ ] Deploy edge functions
- [ ] Set environment variables in Supabase dashboard
- [ ] Schedule cron triggers
- [ ] Test functions manually
- [ ] Monitor logs
- [ ] Set up error alerts (optional)

---

Ready to deploy? Run:

```bash
# Deploy all functions at once
supabase functions deploy --project-ref wwlyizwrrtaziosuwswh
```
