# 🗄️ Supabase Database Setup Instructions

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/wwlyizwrrtaziosuwswh
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

## Step 2: Run the Setup Script

1. **Open the file**: `SUPABASE_SETUP.sql`
2. **Copy ALL the SQL code** (Ctrl+A, Ctrl+C)
3. **Paste into Supabase SQL Editor**
4. Click **"Run"** button (or press F5)
5. Wait for completion (~5-10 seconds)

You should see: ✅ **Success. No rows returned**

## Step 3: Verify Tables Were Created

1. Click **"Table Editor"** in left sidebar
2. You should see these 16 tables:
   - Institution
   - User
   - VerificationRequest
   - RefreshToken
   - Restaurant
   - RestaurantMember
   - AvailabilitySlot
   - RestaurantTable
   - MenuItem
   - Booking
   - BookingOrder
   - Payment
   - Notification
   - Offer
   - AuditLog
   - Review

3. Click on **"Institution"** table - you should see 2 rows:
   - Bennett University
   - Shiv Nadar University

4. Click on **"User"** table - you should see 5 rows (Super Admin + 4 students)

## Step 4: Test Database Connection

Now test if your app can connect:

```bash
# In your terminal, run:
cd server
npm run prisma:generate
node -e "import('./src/config/db.js').then(m => m.default.$queryRaw\`SELECT 1\`.then(() => console.log('✅ Database connected!')))"
```

If you see **"✅ Database connected!"** - your database is ready!

## 🔑 Login Credentials (All use password: `password123`)

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@bennett.edu.in | password123 |
| **Student (Verified)** | priya.sharma@bennett.edu.in | password123 |
| **Student SSO** | student@bennett.edu.in | password123 |
| **Student (Unverified)** | rohan.deshmukh@bennett.edu.in | password123 |
| **Faculty (Unverified)** | radhika.nair@bennett.edu.in | password123 |

## Step 5: Update Your .env File

Now that database is ready, update `server/.env`:

1. **Get your database password** from Supabase:
   - Go to: Settings → Database → Reset Password (if needed)
   - Copy the password

2. **Update `.env`**:
   - Replace `[YOUR-PASSWORD]` with your actual password in both URLs
   - If password has special characters, URL-encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `!` → `%21`

Example:
```bash
# If password is: Pass@123
# Encode it as: Pass%40123

DATABASE_URL="postgresql://postgres.wwlyizwrrtaziosuwswh:Pass%40123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

## Step 6: Test Locally

```bash
# Start the server
cd server
npm start

# In another terminal, test the API
curl http://localhost:3000/api/health
curl http://localhost:3000/api/restaurants
curl http://localhost:3000/api/institutions
```

All should return 200 OK with data!

## Step 7: Deploy to Vercel

Once local testing works:

1. Add the same environment variables to **Vercel**:
   - DATABASE_URL (with your password)
   - DIRECT_URL (with your password)
   - JWT_SECRET
   - OTP_PEPPER
   - CORS_ORIGINS
   - RESEND_API_KEY
   - EMAIL_FROM
   - CRON_SECRET

2. **Redeploy** on Vercel

3. Test: https://restaurant-institution.vercel.app/api/health

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
**Solution:** Double-check your password in DATABASE_URL is correct and URL-encoded

### Error: "relation does not exist"
**Solution:** Re-run the SQL script in Supabase SQL Editor

### Tables not showing up
**Solution:** Make sure you clicked "Run" and saw "Success" message

### Need to reset everything
**Solution:** Run the SQL script again - it drops and recreates all tables

---

## ✅ Success Checklist

- [ ] SQL script ran successfully in Supabase
- [ ] 16 tables visible in Table Editor
- [ ] Institution table has 2 rows
- [ ] User table has 5 rows
- [ ] Updated `.env` with database password
- [ ] Local server starts without errors
- [ ] `/api/health` returns 200 OK
- [ ] `/api/institutions` returns data
- [ ] Added environment variables to Vercel
- [ ] Vercel deployment successful
- [ ] Production API working

---

**Next:** Once database is working locally, we'll fix Vercel deployment!
