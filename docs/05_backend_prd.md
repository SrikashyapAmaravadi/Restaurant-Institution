# Backend PRD
## Institutional Restaurant Discovery & Pre-Booking Platform

> **Prepared by NIVIXPE PRIVATE LIMITED**
> CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979
> Document Reference: NPL-PRD/2026/01 | Version: V1.0 | Date: 02/09/2026

---

## 1. Overview

The backend is a **stateless REST API** built with Node.js, Express.js, and Prisma ORM, backed by PostgreSQL. It serves both the User Portal and the Unified Management Portal. All business logic, role-based authorization (RBAC), and transactional data integrity are enforced server-side.

| Item | Detail |
|---|---|
| **Runtime** | Node.js (LTS v20+) |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM / Query Builder** | Prisma ORM (`@prisma/client`) |
| **Schema & Migrations** | Prisma Schema (`prisma/schema.prisma`) + `prisma migrate` |
| **Auth** | JWT (access token: 15m, refresh token: 7d) |
| **Authorization** | Role-Based Access Control (RBAC) with restaurant & user tenancy scoping |
| **Deployment** | Stateless deployment (Vercel / Railway / AWS / Docker) |
| **Connection Pooling** | Prisma Client connection pool / PgBouncer |
| **Image Storage** | S3-Compatible Cloud Storage (AWS S3 / Cloudflare R2) + CDN |
| **Async Processing** | Message queue (BullMQ / AWS SQS) or async workers for notifications |

---

## 2. Project Structure

```
/backend
├── prisma/
│   ├── schema.prisma           # Prisma data models, enums & relations
│   ├── migrations/             # Version-controlled SQL migration history
│   └── seed.js                 # Seeding script for institutions & admin accounts
├── src/
│   ├── config/
│   │   ├── prisma.js           # PrismaClient singleton instance
│   │   ├── env.js              # Environment variable validation (Zod)
│   │   └── constants.js        # App-wide constants (roles, booking statuses)
│   ├── middleware/
│   │   ├── authenticate.js     # JWT extraction and verification
│   │   ├── rbac.js             # Role-Based Access Control & tenancy check
│   │   ├── rateLimiter.js      # Rate limiting (Express-rate-limit)
│   │   ├── validate.js         # Request schema validation (Zod)
│   │   └── errorHandler.js     # Global error handler
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── institution.service.js
│   │   ├── user.service.js
│   │   ├── restaurant.service.js
│   │   ├── menu.service.js
│   │   ├── offer.service.js
│   │   ├── availability.service.js
│   │   ├── booking.service.js
│   │   ├── review.service.js
│   │   ├── notification.service.js
│   │   ├── analytics.service.js
│   │   └── staff.service.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── institution.routes.js
│   │   ├── user.routes.js
│   │   ├── restaurant.routes.js
│   │   ├── menu.routes.js
│   │   ├── offer.routes.js
│   │   ├── availability.routes.js
│   │   ├── booking.routes.js
│   │   ├── review.routes.js
│   │   ├── analytics.routes.js
│   │   └── staff.routes.js
│   ├── validators/
│   │   └── *.validator.js      # Zod schemas per domain
│   ├── utils/
│   │   ├── haversine.js        # Distance calculation
│   │   ├── bookingCode.js      # Unique booking code generator
│   │   ├── logger.js           # Structured logger
│   │   └── auditLog.js         # Audit trail helper
│   └── app.js                  # Express app setup
├── migrations/                 # SQL migration files
├── seeds/                      # Seed data scripts
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── api/
│   └── security/
├── .env.example
└── package.json
```

---

## 3. API Specification

### 3.1 Standard Response Envelope

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You do not have access to this resource."
  }
}
```

---

### 3.2 Authentication Endpoints

#### `POST /api/auth/register`
- **Access:** Public
- **Body:** `{ name, email, password }`
- **Logic:**
  1. Validate email against `institutions.email_domain`
  2. Hash password (Argon2id)
  3. Create user with `verification_status = 'pending'`
  4. Notify Super Admin of new registration
- **Response:** `201 Created` with user (no sensitive fields)

#### `POST /api/auth/login`
- **Access:** Public
- **Body:** `{ email, password }`
- **Logic:**
  1. Lookup user by email
  2. Compare password hash
  3. Check `verification_status = 'verified'`
  4. Issue JWT access token (15min) + refresh token (7d)
- **Response:** `200 OK` with tokens and user info

#### `POST /api/auth/verify`
- **Access:** Public (rate-limited: 5 attempts per code)
- **Body:** `{ email, code }`
- **Logic:**
  1. Find unexpired, unused code for user
  2. Compare code hash
  3. If valid: set `verification_status = 'verified'`, mark code used
  4. If invalid: increment attempt counter; lock if exceeded
- **Response:** `200 OK`

#### `POST /api/auth/refresh`
- **Access:** Authenticated (with refresh token)
- **Response:** New access + refresh token pair

#### `POST /api/auth/logout`
- **Access:** Authenticated
- **Logic:** Invalidate refresh token

---

### 3.3 Institution Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/institutions` | Super Admin | List all institutions |
| POST | `/api/institutions` | Super Admin | Create institution |
| GET | `/api/institutions/:id` | Super Admin | Get institution details |
| PUT | `/api/institutions/:id` | Super Admin | Update institution |
| PATCH | `/api/institutions/:id/status` | Super Admin | Activate/suspend institution |

---

### 3.4 User Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Super Admin | List all users (with filters) |
| GET | `/api/users/:id` | Super Admin / Self | Get user details |
| PATCH | `/api/users/:id` | Self | Update own profile |
| PATCH | `/api/users/:id/status` | Super Admin | Approve/reject/suspend user |

**Query Filters (Super Admin):** `?status=pending&institution=&role=&search=`

---

### 3.5 Restaurant Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants` | Public | List/discover restaurants |
| POST | `/api/restaurants` | Super Admin | Create restaurant |
| GET | `/api/restaurants/:id` | Public | Get restaurant details |
| PUT | `/api/restaurants/:id` | Admin (owner), Super Admin | Update restaurant profile |
| PATCH | `/api/restaurants/:id/status` | Super Admin | Approve/suspend restaurant |

**Discovery Query Params:**
```
?search=        Restaurant name / cuisine keyword
?cuisine=       Filter by cuisine type
?minRating=     Minimum average rating
?maxDistance=   Max distance in km from Bennett reference
?available=     true/false — has open slots today
?page=          Pagination page
?limit=         Results per page
?sort=          distance | rating | name
```

**Response includes:** distance_km (calculated server-side), average_rating, review_count, is_open_now

---

### 3.6 Menu Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants/:id/menu` | Public | Get full menu (categories + items) |
| POST | `/api/restaurants/:id/menu/categories` | Admin | Create menu category |
| PUT | `/api/restaurants/:id/menu/categories/:catId` | Admin | Update category |
| DELETE | `/api/restaurants/:id/menu/categories/:catId` | Admin | Delete category |
| POST | `/api/restaurants/:id/menu/items` | Admin | Create menu item |
| PUT | `/api/restaurants/:id/menu/items/:itemId` | Admin | Update menu item |
| PATCH | `/api/restaurants/:id/menu/items/:itemId/availability` | Admin | Toggle item availability |
| DELETE | `/api/restaurants/:id/menu/items/:itemId` | Admin | Delete menu item |

---

### 3.7 Offer Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants/:id/offers` | Public (active only), Admin (all) | List offers |
| POST | `/api/restaurants/:id/offers` | Admin | Create offer |
| PUT | `/api/offers/:id` | Admin (owner) | Update offer |
| PATCH | `/api/offers/:id/status` | Admin (owner) | Activate/deactivate offer |
| DELETE | `/api/offers/:id` | Admin (owner) | Delete offer |

**Offer Status Flow:** `DRAFT → ACTIVE → INACTIVE / EXPIRED`

---

### 3.8 Availability Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants/:id/availability` | Public/User | Get available slots for a date |
| POST | `/api/restaurants/:id/availability` | Admin | Create availability slots |
| PUT | `/api/restaurants/:id/availability/:slotId` | Admin | Update slot capacity |
| DELETE | `/api/restaurants/:id/availability/:slotId` | Admin | Remove slot |

**Query:** `?date=2026-09-15`

---

### 3.9 Booking Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/bookings` | Verified User | Create booking |
| GET | `/api/bookings` | User (own) / Admin / Restaurant / Super Admin | List bookings |
| GET | `/api/bookings/:id` | Booking owner / Admin / Restaurant / Super Admin | Get booking detail |
| PATCH | `/api/bookings/:id/status` | Role-dependent (see matrix) | Update booking status |
| DELETE | `/api/bookings/:id` | User (own, if PENDING) | Cancel booking |

**Booking Creation Logic:**
1. Verify user is `verified`
2. Check restaurant is `active`
3. Validate slot exists and has capacity
4. Begin transaction:
   - Lock slot row
   - Check `capacity - booked_count >= guest_count`
   - Insert booking with status `PENDING`
   - Increment `booked_count`
5. Commit
6. Dispatch booking created notification

**Status Transition Rules:**

| From | To | Who |
|---|---|---|
| PENDING | CONFIRMED | Restaurant, Admin, Super Admin |
| PENDING | REJECTED | Restaurant, Admin, Super Admin |
| CONFIRMED | COMPLETED | Restaurant, Admin, Super Admin |
| CONFIRMED | CANCELLED | Restaurant, Admin, Super Admin, User |
| CONFIRMED | NO_SHOW | Restaurant, Admin |
| PENDING | CANCELLED | User, Admin, Super Admin |

---

### 3.10 Review Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants/:id/reviews` | Public | List reviews (paginated) |
| POST | `/api/restaurants/:id/reviews` | Verified User (eligible) | Submit review |
| PUT | `/api/reviews/:id` | Review author | Edit review |
| DELETE | `/api/reviews/:id` | Review author / Super Admin | Delete review |

**Eligibility Check:**
- User must have a `COMPLETED` booking at the restaurant
- One review per booking (enforced by `UNIQUE(user_id, booking_id)`)

---

### 3.11 Analytics Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants/:id/analytics` | Admin (related), Super Admin | Restaurant analytics |
| GET | `/api/analytics/platform` | Super Admin | Platform-wide analytics |

**Restaurant Analytics Response includes:**
- Total bookings (period)
- Breakdown by status (confirmed, completed, cancelled, no-show)
- Bookings by day/week (trend)
- Popular time slots
- Total restaurant views
- Total menu views
- Active offers count / offer engagement
- Average rating + total review count

---

### 3.12 Staff Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants/:id/staff` | Admin (related) | List staff members |
| POST | `/api/restaurants/:id/staff` | Admin (related) | Add staff account |
| PATCH | `/api/restaurants/:id/staff/:userId` | Admin (related) | Activate/deactivate staff |
| DELETE | `/api/restaurants/:id/staff/:userId` | Admin (related) | Remove staff membership |

---

---

## 4. Middleware Specifications

### 4.1 `authenticate.js`

```javascript
// Validates JWT from Authorization: Bearer <token>
// Attaches decoded { userId, role } to req.user
// Returns 401 if missing/invalid/expired
```

### 4.2 `rbac.js` (Role-Based Access Control)

```javascript
// Middleware: requireRole(...allowedRoles)
// Validates that req.user.role matches allowed role(s) (e.g. 'SUPER_ADMIN', 'RESTAURANT_ADMIN')
// Returns 403 FORBIDDEN if role is not permitted

// Middleware: requireRestaurantScope()
// Validates that req.user.restaurantId matches req.params.restaurantId
// Or checks restaurant_memberships for caller's active assignment
// Returns 403 FORBIDDEN if caller attempts to access another restaurant's resources

// Middleware: requireUserScope()
// Validates that req.user.id matches req.params.userId or resource owner ID
```

### 4.3 `rateLimiter.js`

```javascript
// Auth endpoints: 10 requests/minute per IP
// Verify endpoint: 5 attempts per code per user
// General API: 100 requests/minute per user
```

### 4.4 `validate.js`

```javascript
// Validates req.body, req.params, req.query against Zod schema
// Returns 422 with field-level errors if invalid
```

---

## 5. Prisma ORM & Database Migrations

All schema changes and database relations are managed via **Prisma ORM** with version-controlled migrations:

```
/server/prisma
├── schema.prisma            # Single source of truth for PostgreSQL schema & relations
├── migrations/              # Version-controlled SQL migration history
│   ├── 20260901000001_init/
│   │   └── migration.sql
│   └── ...
└── seed.js                  # Seed script (Bennett University institution, Super Admin)
```

### Essential Prisma Commands
- Apply development migrations: `npx prisma migrate dev --name <migration-name>`
- Generate type-safe client: `npx prisma generate`
- Deploy migrations in production / CI: `npx prisma migrate deploy`
- Inspect database via GUI: `npx prisma studio`
- Seed database: `npx prisma db seed`

---

## 6. Environment Variables

```env
# Database (PostgreSQL via Prisma ORM)
DATABASE_URL="postgresql://postgres:password@localhost:5432/institutional_restaurant?schema=public&connection_limit=10"
DIRECT_URL="postgresql://postgres:password@localhost:5432/institutional_restaurant?schema=public"

# Auth & Security
JWT_SECRET=<secure-random-256bit-secret>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Password Hashing
ARGON2_MEMORY=65536
ARGON2_ITERATIONS=3

# Object Storage (S3-Compatible / Cloudflare R2)
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=restaurant-images
S3_ACCESS_KEY_ID=<access-key>
S3_SECRET_ACCESS_KEY=<secret-key>
S3_PUBLIC_CDN_URL=https://cdn.restaurant.bennett.edu.in

# Email (Transactional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<api-key>
FROM_EMAIL="no-reply@restaurant.bennett.edu.in"

# Application Configuration
NODE_ENV=production
PORT=3000
BENNETT_LAT=28.4517
BENNETT_LNG=77.5840
INSTITUTION_DOMAIN=bennett.edu.in
CLIENT_ORIGIN=http://localhost:1574
```

---

## 7. Error Codes Reference

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request body/params failed schema validation |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Authenticated but role or tenancy scope unauthorized |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate resource (e.g., email already registered) |
| `CAPACITY_EXCEEDED` | 409 | Booking slot capacity exhausted |
| `DOMAIN_NOT_ALLOWED` | 400 | Email domain not from approved institution |
| `VERIFICATION_FAILED` | 400 | Invalid or expired verification code |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## 8. Testing Requirements

### Unit Tests
- Haversine distance calculation correctness
- Booking status transition validation (allowed/disallowed transitions)
- Offer validity check (active, not expired)
- Verification code expiry logic
- RBAC role validation and tenancy scoping logic

### Integration Tests
- Register → approval → verify flow
- Transactional booking creation (capacity check under concurrent requests via Prisma `$transaction`)
- Admin cannot access unrelated restaurant (tenancy protection)
- Restaurant staff cannot access unrelated restaurant's bookings

### API Tests
- All protected endpoints return 401 without token
- All role-restricted endpoints return 403 for insufficient roles
- Validation errors return structured 422 responses
- Cross-restaurant IDOR attempts return 403

### Security Tests
- SQL injection attempts rejected (parameterized by Prisma)
- Password hashes never returned in API responses
- Verification codes not exposed in logs/responses
- Brute force on verify endpoint triggers rate limit

---

*Document version: V1.0 | Date: 02/09/2026*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
