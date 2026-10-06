# 🔍 Vercel 500 Error Debug Checklist

You added environment variables but still getting 500 errors. Let's debug systematically.

## Step 1: Check Vercel Function Logs

**CRITICAL: You must check the actual error messages**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Pull logs
vercel logs restaurant-institution --prod --limit 50
```

**Or check in Vercel Dashboard:**
1. Go to: https://vercel.com/srikashyapamaravadis-projects/restaurant-institution
2. Click **"Logs"** tab
3. Look for the actual error message
4. Share the error message with me

---

## Step 2: Verify Environment Variables Format

### ✅ CORRECT DATABASE_URL Format for Vercel + Supabase:

```bash
# Connection Pooling URL (Port 6543) - REQUIRED for serverless
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct URL (Port 5432) - REQUIRED for migrations
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### ❌ WRONG Formats (will cause 500 errors):
```bash
# Missing ?pgbouncer=true
DATABASE_URL="postgresql://....:6543/postgres"

# Using port 5432 for DATABASE_URL (no pooling)
DATABASE_URL="postgresql://....:5432/postgres"

# Missing connection_limit
DATABASE_URL="postgresql://....:6543/postgres?pgbouncer=true"

# Wrong host format
DATABASE_URL="postgresql://localhost:5432/postgres"
```

---

## Step 3: Get Your Correct Supabase URLs

### Option A: From Supabase Dashboard (RECOMMENDED)

1. Go to: https://supabase.com/dashboard/project/[your-project]/settings/database
2. Scroll to **"Connection string"**
3. Select **"Connection pooling"** tab
4. Copy the **URI** (should have `:6543`)
5. Add `?pgbouncer=true&connection_limit=1` at the end

**Example:**
```
From Supabase: postgresql://postgres.abcdefgh:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

Add to Vercel as DATABASE_URL:
postgresql://postgres.abcdefgh:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### For DIRECT_URL:
1. Go to **"Direct connection"** tab
2. Copy the URI (should have `:5432`)
3. Use as-is (no modifications needed)

---

## Step 4: Verify All Required Environment Variables in Vercel

Go to: https://vercel.com/srikashyapamaravadis-projects/restaurant-institution/settings/environment-variables

### Must Have These 8 Variables:

| Variable | Example | Status |
|----------|---------|--------|
| `DATABASE_URL` | `postgresql://....:6543/postgres?pgbouncer=true&connection_limit=1` | ⬜ |
| `DIRECT_URL` | `postgresql://....:5432/postgres` | ⬜ |
| `JWT_SECRET` | `dine_bennett_secret_production_2026_32chars_minimum` | ⬜ |
| `OTP_PEPPER` | `otp_pepper_secret_2026_32chars_minimum` | ⬜ |
| `CORS_ORIGINS` | `https://restaurant-institution.vercel.app` | ⬜ |
| `RESEND_API_KEY` | `re_123456789abcdefg` (from resend.com) | ⬜ |
| `EMAIL_FROM` | `Dine Security <noreply@yourdomain.com>` | ⬜ |
| `CRON_SECRET` | `cron_secret_random_string_123` | ⬜ |

**Check each one:**
- ✅ Variable exists
- ✅ No typos in variable name (case-sensitive!)
- ✅ Value is not empty
- ✅ Applied to: **Production** (and optionally Preview)

---

## Step 5: Force Redeploy After Fixing Variables

After updating environment variables in Vercel:

1. Go to: https://vercel.com/srikashyapamaravadis-projects/restaurant-institution/deployments
2. Find the latest deployment
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment to complete

---

## Step 6: Test After Redeploy

```bash
# Test health endpoint (should show database status)
curl https://restaurant-institution.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "latencyMs": 45
  }
}

# If you see this, API is working! ✅

# If still 500, check logs:
vercel logs restaurant-institution --prod
```

---

## Common Issues & Solutions

### Issue 1: "Can't reach database server"
**Cause:** Wrong DATABASE_URL or firewall blocking
**Solution:**
- Verify Supabase URL is from "Connection pooling" tab
- Use port `:6543` not `:5432` for DATABASE_URL
- Check Supabase → Settings → Database → Connection pooling is enabled

### Issue 2: "Environment variable not found"
**Cause:** Variable name typo or not set to Production
**Solution:**
- Check exact spelling: `DATABASE_URL` not `DATABASE_URI`
- Ensure applied to "Production" environment
- Redeploy after adding variables

### Issue 3: "Too many connections"
**Cause:** Missing `?pgbouncer=true&connection_limit=1`
**Solution:**
- Add connection parameters to DATABASE_URL
- Use format from Step 2 above

### Issue 4: "PrismaClientInitializationError"
**Cause:** DIRECT_URL missing or wrong format
**Solution:**
- Add DIRECT_URL with port `:5432`
- Different from DATABASE_URL (one for queries, one for migrations)

### Issue 5: Still 500 after everything
**Cause:** Need to see actual logs
**Solution:**
```bash
# Get detailed logs
vercel logs restaurant-institution --prod --limit 100

# Look for lines starting with:
# [ERROR], [SERVER_ERROR], or "PrismaClient"
```

---

## Debug Commands

```bash
# 1. Check if Vercel deployment succeeded
vercel ls restaurant-institution

# 2. Check environment variables are set
vercel env ls --environment production

# 3. Pull production logs
vercel logs restaurant-institution --prod --limit 100

# 4. Test locally with production env
vercel env pull .env.production
npm run dev:server
```

---

## Next Steps

**Please do ONE of these and share the result:**

### Option A: Share Vercel Logs
```bash
vercel logs restaurant-institution --prod --limit 50 > logs.txt
```
Send me the logs.txt content

### Option B: Share Screenshot
Take a screenshot of:
1. Vercel → Logs tab showing error
2. Vercel → Settings → Environment Variables showing DATABASE_URL

### Option C: Share Error Message
Visit https://restaurant-institution.vercel.app/api/health in browser
Share the exact error message shown

---

## Quick Test

Try this in your browser console on the deployed site:

```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Error:', err));
```

Share what you see in the console.

---

**Most likely issue:** Your `DATABASE_URL` is missing `?pgbouncer=true&connection_limit=1` or using wrong port.

**Fix:** Go to Supabase → Connection pooling → Copy URI → Add parameters → Paste in Vercel → Redeploy
