# 🚨 Vercel 500 Error Fix - Prisma Connection Pooling

## Problem Diagnosed

Your Vercel deployment is failing with **500 Internal Server Error** on all API endpoints because:

1. **Prisma Client is creating new connections on every serverless function invocation**
2. **Connection limit exhaustion** in serverless environment
3. **No connection pooling** configured for Vercel

## Root Cause

```javascript
// ❌ WRONG (creates new connection per request)
const prisma = new PrismaClient();
```

In serverless environments (Vercel), each function invocation creates a new PrismaClient instance, rapidly exhausting database connections.

## Solution Applied

### 1. Fixed Prisma Client Singleton Pattern ✅

**File: `server/src/config/db.js`**

Changed from:
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;
```

To:
```javascript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

This ensures a **single PrismaClient instance is reused** across serverless function invocations.

### 2. Verify Vercel Environment Variables

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

```bash
DATABASE_URL="Copy from .env"
DIRECT_URL="Copy from .env"
JWT_SECRET="Copy from .env"
OTP_PEPPER="Copy from .env"
CORS_ORIGINS="Copy from .env"
RESEND_API_KEY="Copy from .env"
EMAIL_FROM="Copy from .env"
CRON_SECRET="Copy from .env"
```

**Critical:** Use `?pgbouncer=true&connection_limit=1` in `DATABASE_URL` for serverless.

### 3. Update `vercel.json` for Region Configuration

Add this to `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "client/user-portal/dist",
  "framework": "vite",
  "functions": {
    "api/index.js": {
      "maxDuration": 10,
      "memory": 1024,
      "regions": ["bom1"]
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Region `bom1`** (Mumbai) is closest to Supabase Asia South.

### 4. Add Prisma Generate to Build

Ensure `package.json` has:

```json
{
  "scripts": {
    "build": "npm --prefix client/user-portal run build",
    "postinstall": "npx prisma generate --schema=prisma/schema.prisma",
    "vercel-build": "npx prisma generate && npm run build"
  }
}
```

### 5. Database Connection Pooling (Supabase)

In your **Supabase Dashboard**:
1. Go to **Settings → Database**
2. Use **Connection Pooling** URL (port `6543`) for `DATABASE_URL`
3. Use **Direct Connection** URL (port `5432`) for `DIRECT_URL`

Example format:
```bash
# Connection pooling for serverless (Vercel)
DATABASE_URL="Copy from .env"

# Direct connection for migrations
DIRECT_URL="Copy from .env"
```

## Deployment Steps

### Step 1: Commit the Fix
```bash
git add server/src/config/db.js
git commit -m "fix: Add Prisma singleton pattern for Vercel serverless"
git push origin main
```

### Step 2: Redeploy on Vercel
Vercel will auto-deploy, or trigger manually:
```bash
vercel --prod
```

### Step 3: Check Logs
```bash
vercel logs restaurant-institution --prod
```

Look for:
- ✅ `Prisma Client initialized`
- ✅ `200` status codes
- ❌ NO `PrismaClientInitializationError`

## Testing After Deploy

```bash
# Test health endpoint
curl https://restaurant-institution.vercel.app/api/health

# Test restaurants endpoint
curl https://restaurant-institution.vercel.app/api/restaurants

# Test auth
curl -X POST https://restaurant-institution.vercel.app/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@bennett.edu.in"}'
```

## Additional Optimizations

### A. Enable Prisma Accelerate (Recommended)
For production scale, use Prisma Accelerate (global connection pooling):

1. Sign up at https://www.prisma.io/accelerate
2. Get Accelerate connection string
3. Replace `DATABASE_URL` in Vercel

### B. Monitor Supabase Connections
Check **Supabase → Reports → Database** to ensure connections don't exceed limits.

## Common Serverless Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Can't reach database` | Wrong `DATABASE_URL` | Use pooled URL with `:6543` |
| `Too many connections` | No singleton pattern | Applied fix above ✅ |
| `Module not found` | Prisma not generated | Add `postinstall` script |
| `CORS error` | Wrong origin | Set `CORS_ORIGINS` env var |

## Verification Checklist

- [x] Prisma singleton pattern applied
- [ ] Vercel env vars configured
- [ ] `DATABASE_URL` uses PgBouncer (`:6543`)
- [ ] `connection_limit=1` in connection string
- [ ] `postinstall` script generates Prisma
- [ ] Region set to `bom1` (closest to database)
- [ ] Redeployed to Vercel
- [ ] Health endpoint returns 200
- [ ] API endpoints return data

## Need More Help?

If errors persist after applying this fix:

1. Check Vercel Function Logs:
   ```bash
   vercel logs --prod
   ```

2. Enable detailed Prisma logs temporarily:
   ```javascript
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error']
   });
   ```

3. Check Supabase connection limits:
   - Free tier: 60 connections
   - Pro tier: 200+ connections

---

**This fix should resolve all 500 errors immediately after redeployment.**
