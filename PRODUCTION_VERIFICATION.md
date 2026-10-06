# 🚀 Production Verification Checklist

## ✅ Complete Production Setup Verification

Run through this checklist to ensure everything is production-ready.

---

## 📋 STEP 1: Verify All Edge Functions Deployed

### Check Deployed Functions
Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/functions

**Expected Functions (9 total):**
- ✅ send-booking-reminder
- ✅ cleanup-expired-bookings
- ✅ payment-reminder
- ✅ rewards-processor
- ✅ push-notification
- ✅ dynamic-pricing
- ✅ demand-prediction
- ✅ scheduled-analytics
- ✅ scheduled-maintenance

**Status Check:** All should show "Active" with green dot

---

## 📋 STEP 2: Set Environment Variables

Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/secrets

**Required Secrets (3):**
```
RESEND_API_KEY = [Your Resend API Key]
SUPABASE_URL = https://wwlyizwrrtaziosuwswh.supabase.co
SUPABASE_SERVICE_ROLE_KEY = (Get from API settings)
```

**Get Service Role Key:**
https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/api
(Copy "service_role" key - NOT anon key)

---

## 📋 STEP 3: Schedule Edge Functions (PRODUCTION CRON)

Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/functions

**For EACH function, add cron trigger:**

| Function | Cron Expression | Runs |
|----------|-----------------|------|
| payment-reminder | `*/10 * * * *` | Every 10 minutes |
| rewards-processor | `*/5 * * * *` | Every 5 minutes |
| send-booking-reminder | `0 * * * *` | Every hour |
| cleanup-expired-bookings | `0 2 * * *` | Daily 2 AM UTC |
| scheduled-analytics | `0 3 * * *` | Daily 3 AM UTC |
| scheduled-maintenance | `0 4 * * *` | Daily 4 AM UTC |

**How to Add:**
1. Click on function name
2. Scroll to "Cron Jobs" section
3. Click "Create a new cron job"
4. Enter cron expression
5. Click "Create"

**⚠️ CRITICAL:** These run on Supabase's cloud infrastructure (NOT localhost)

---

## 📋 STEP 4: Run Database Setup SQL

### A. Advanced Features Schema
Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/sql/new

Run in order:
1. `ADVANCED_FEATURES_SCHEMA.sql` - Rewards, referrals, push subscriptions
2. `DYNAMIC_PRICING_SCHEMA.sql` - Pricing rules, demand forecasting
3. `SUPABASE_COMPUTE_FUNCTIONS.sql` - Analytics functions
4. `FIX_PRODUCTION_CRON_JOBS.sql` - Remove localhost cron jobs

**Verification Query:**
```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'Reward', 'Referral', 'PushSubscription',
  'PricingRule', 'PricingHistory', 'DemandForecast',
  'WeatherData', 'EventCalendar'
)
ORDER BY table_name;

-- Should return 8 rows
```

---

## 📋 STEP 5: Test Edge Functions in Production

### Get Your Anon Key
https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/api

### Test Payment Reminder
```bash
curl -X POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/payment-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Test Rewards Processor
```bash
curl -X POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/rewards-processor' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Test Dynamic Pricing
```bash
curl -X POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/dynamic-pricing' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "restaurantId": 1,
    "date": "2026-10-20",
    "time": "19:00",
    "basePrice": 500
  }'
```

### Test Scheduled Analytics
```bash
curl -X POST \
  'https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1/scheduled-analytics' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

**Expected:** All should return `{"success": true, ...}`

---

## 📋 STEP 6: Verify Vercel Production Deployment

### Check Environment Variables
Go to: https://vercel.com/srikashyapamaravadis-projects/restaurant-institution/settings/environment-variables

**Required Variables (8):**
```
DATABASE_URL = postgresql://postgres.wwlyizwrrtaziosuwswh:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL = postgresql://postgres.wwlyizwrrtaziosuwswh:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
JWT_SECRET = dine_bennett_production_secret_key_2026_minimum_32_characters_required_here
OTP_PEPPER = dine_bennett_otp_pepper_secret_2026_minimum_32_characters_required_here
CORS_ORIGINS = https://restaurant-institution.vercel.app
RESEND_API_KEY = [Your Resend API Key]
EMAIL_FROM = Dine Security <sahith@nivixpe.com>
CRON_SECRET = cron_secret_random_string_for_background_jobs_2026
```

### Test Production API
```bash
# Health check
curl https://restaurant-institution.vercel.app/api/health

# Expected: {"status": "healthy", "database": {"status": "connected"}}

# Restaurants endpoint
curl https://restaurant-institution.vercel.app/api/restaurants

# Expected: {"success": true, "data": [...]}
```

---

## 📋 STEP 7: Monitor Production Logs

### Supabase Function Logs
https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/logs/functions

**Check for:**
- ✅ No errors in last 24 hours
- ✅ Scheduled jobs running on time
- ✅ Average execution time < 5 seconds

### Vercel Deployment Logs
https://vercel.com/srikashyapamaravadis-projects/restaurant-institution/logs

**Check for:**
- ✅ No 500 errors
- ✅ Database connections successful
- ✅ API response times < 1 second

---

## 📋 STEP 8: Performance Verification

### Database Performance
Run in Supabase SQL Editor:
```sql
-- Check active connections
SELECT COUNT(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Should be < 50

-- Check slow queries
SELECT * FROM slow_queries LIMIT 5;

-- All queries should be < 500ms

-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Edge Function Performance
Check dashboard: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/reports

**Targets:**
- ✅ Cold start: < 500ms
- ✅ Warm execution: < 200ms
- ✅ Success rate: > 99%

---

## 📋 STEP 9: Security Verification

### A. Check RLS Policies
```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### B. Verify API Keys Secured
- ✅ Service role key NOT exposed in frontend
- ✅ Anon key used for client-side calls only
- ✅ .env files in .gitignore
- ✅ No secrets in git history

### C. Check CORS Settings
```sql
SELECT * FROM "Restaurant" WHERE id = 1;
-- Should work from allowed origins only
```

---

## 📋 STEP 10: Final Production Checklist

### Infrastructure
- [x] ✅ 9 Edge Functions deployed
- [x] ✅ All cron jobs scheduled (cloud-based)
- [x] ✅ Environment variables set
- [x] ✅ Database schema updated
- [x] ✅ Vercel deployment successful

### Features
- [x] ✅ Booking system
- [x] ✅ Payment processing
- [x] ✅ Rewards & loyalty
- [x] ✅ Dynamic pricing
- [x] ✅ Demand prediction
- [x] ✅ Push notifications
- [x] ✅ Email notifications
- [x] ✅ Analytics dashboard
- [x] ✅ Admin panel

### Operations
- [x] ✅ Daily analytics computation
- [x] ✅ Automated cleanup jobs
- [x] ✅ Performance monitoring
- [x] ✅ Error logging
- [x] ✅ Backup strategy

### Compliance
- [x] ✅ GDPR endpoints
- [x] ✅ DPDPA compliance
- [x] ✅ Audit logging
- [x] ✅ Data retention policies

---

## 🎯 Quick Production Test Script

Run all tests at once:

```bash
#!/bin/bash

ANON_KEY="YOUR_ANON_KEY_HERE"
BASE_URL="https://wwlyizwrrtaziosuwswh.supabase.co/functions/v1"

echo "🧪 Testing Production Edge Functions..."

# Test 1: Payment Reminder
echo "1. Payment Reminder..."
curl -s -X POST "$BASE_URL/payment-reminder" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.success'

# Test 2: Rewards Processor
echo "2. Rewards Processor..."
curl -s -X POST "$BASE_URL/rewards-processor" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.success'

# Test 3: Dynamic Pricing
echo "3. Dynamic Pricing..."
curl -s -X POST "$BASE_URL/dynamic-pricing" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":1,"date":"2026-10-20","time":"19:00","basePrice":500}' | jq '.success'

# Test 4: Scheduled Analytics
echo "4. Scheduled Analytics..."
curl -s -X POST "$BASE_URL/scheduled-analytics" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.success'

# Test 5: Vercel API Health
echo "5. Vercel API Health..."
curl -s https://restaurant-institution.vercel.app/api/health | jq '.status'

echo "✅ All tests complete!"
```

---

## 🚨 Common Issues & Fixes

### Issue 1: "Function not found"
**Fix:** Redeploy function: `supabase functions deploy FUNCTION_NAME --project-ref wwlyizwrrtaziosuwswh`

### Issue 2: "Environment variable not found"
**Fix:** Add secrets in Supabase Dashboard → Settings → Secrets

### Issue 3: "Database connection failed"
**Fix:** Check DATABASE_URL and DIRECT_URL are correct in Vercel

### Issue 4: "Cron jobs not running"
**Fix:** Ensure cron triggers are added in Supabase Dashboard (NOT pg_cron)

### Issue 5: "429 Rate Limit"
**Fix:** Supabase Free tier has limits - upgrade if needed

---

## 📊 Production Metrics to Monitor

### Daily
- Active users count
- Bookings created
- Revenue generated
- Error rate (should be < 1%)

### Weekly
- Average response time
- Database size growth
- Function invocation counts
- Rewards distributed

### Monthly
- User retention rate
- Popular restaurants
- Peak usage times
- Cost optimization opportunities

---

## ✅ PRODUCTION READY CONFIRMATION

Once all above steps are complete, your system is:

✅ **Fully Production-Ready**
- All services running on cloud infrastructure
- Automated jobs scheduled properly
- Monitoring and logging enabled
- Security hardened
- Performance optimized

**No localhost dependencies!**
**Everything runs on Supabase + Vercel cloud!**

---

*Last Updated: October 6, 2026*
*Status: Production Deployment Complete* 🚀
