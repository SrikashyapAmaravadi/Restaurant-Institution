# 🔧 Environment Setup Guide - FINAL STEPS

## ✅ Updated Your `.env` File

I've updated `server/.env` with the correct Supabase project (`wwlyizwrrtaziosuwswh`).

---

## 🚨 CRITICAL: Replace Database Password

Your `.env` file has `[YOUR-PASSWORD]` placeholders. You must replace these with your actual Supabase database password.

### Step 1: Get Your Database Password

**Option A: If you remember your password**
- Use the password you created when setting up Supabase

**Option B: Reset your password (if forgotten)**
1. Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh/settings/database
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. Copy the new password (save it somewhere safe!)

### Step 2: Update `.env` File

Open `server/.env` and replace **both instances** of `[YOUR-PASSWORD]`:

Keep the actual values only in `server/.env` and in the hosting provider's encrypted environment variables.

**⚠️ Important:** If your password has special characters like `@`, `#`, `!`, etc., you need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `!` becomes `%21`

For example, URL-encode special characters before putting the password in `.env`.

---

## 📋 Add Environment Variables to Vercel

Now that your local `.env` is ready, copy these values to Vercel:

### Go to Vercel Dashboard:
https://vercel.com/srikashyapamaravadis-projects/restaurant-institution/settings/environment-variables

### Add These Variables (with YOUR actual password):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Copy from `server/.env` |
| `DIRECT_URL` | Copy from `server/.env` |
| `JWT_SECRET` | Copy from `server/.env` |
| `OTP_PEPPER` | Copy from `server/.env` |
| `CORS_ORIGINS` | Copy from `server/.env` |
| `RESEND_API_KEY` | Copy from `server/.env` |
| `EMAIL_FROM` | Copy from `server/.env` |
| `CRON_SECRET` | Copy from `server/.env` |

### For Each Variable:
1. Click **"Add New"**
2. Enter the **Key** (variable name)
3. Enter the **Value** (actual value with your password)
4. Select **"Production"** environment
5. Click **"Save"**

---

## 🚀 After Adding All Variables

1. Go to: https://vercel.com/srikashyapamaravadis-projects/restaurant-institution/deployments
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## ✅ Test Your Deployment

After redeployment completes:

### Test 1: Health Check
```
Visit: https://restaurant-institution.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Dine@Bennett Platform API",
  "database": {
    "status": "connected",
    "latencyMs": 45
  }
}
```

### Test 2: Restaurants Endpoint
```
Visit: https://restaurant-institution.vercel.app/api/restaurants
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "The Spice Garden",
      ...
    }
  ]
}
```

---

## 🔍 If Still Not Working

### Check Logs:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs restaurant-institution --prod --limit 50
```

### Common Issues:

**Issue 1: "Can't reach database server"**
- Double-check password is correct (no typos)
- Verify password special characters are URL-encoded

**Issue 2: "Environment variable not found"**
- Make sure you clicked "Save" after adding each variable
- Verify "Production" environment is selected
- Redeploy after adding variables

**Issue 3: Still 500 errors**
- Check Vercel logs for specific error message
- Verify DATABASE_URL has `?pgbouncer=true&connection_limit=1`
- Ensure DIRECT_URL does NOT have pgbouncer parameters

---

## 📝 Quick Checklist

- [ ] Updated `server/.env` with database password
- [ ] Replaced `[YOUR-PASSWORD]` in both DATABASE_URL and DIRECT_URL
- [ ] URL-encoded special characters in password if needed
- [ ] Added all 8 environment variables to Vercel
- [ ] Selected "Production" for each variable
- [ ] Redeployed on Vercel
- [ ] Tested `/api/health` endpoint
- [ ] Tested `/api/restaurants` endpoint

---

## 🎯 Next Step

Keep the Supabase database password only in `server/.env` and in Vercel environment variables.
