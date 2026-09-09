# System Design Document
## Institutional Restaurant Discovery & Pre-Booking Platform

> **Prepared by NIVIXPE PRIVATE LIMITED**
> CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979
> Document Reference: NPL-PRD/2026/01 | Version: V1.0 | Date: 02/09/2026

---

## 1. System Overview

The platform follows a **layered, stateless PERN architecture**. All backend services are stateless, enabling horizontal scaling and flexible deployment. The system is split into two client-facing portals, a unified Express REST API layer with Prisma ORM, and a PostgreSQL database as the single source of truth.

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│   React User Portal        │   React Management Portal   │
│   (Soft Luxury UI, Micro-  │   (Role-Gated Dashboards,   │
│    Animations, Lucide)     │    Pre-Built Flow States)   │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTPS / REST
┌────────────────────────────▼─────────────────────────────┐
│                 API GATEWAY / EDGE LAYER                 │
│        Rate Limiting · CORS · TLS Termination            │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                 NODE.JS / EXPRESS REST API               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │   Auth Middleware (JWT Validation & Context)       │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                             │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │   RBAC Authorization Layer                         │  │
│  │   Role Check + Restaurant Tenancy Scoping          │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                             │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │   Domain Services (Auth, Restaurant, Booking, etc) │  │
│  └─────────────────────────┬──────────────────────────┘  │
│                            │                             │
│  ┌─────────────────────────▼──────────────────────────┐  │
│  │   Prisma ORM Layer (@prisma/client)                │  │
│  └─────────────────────────┬──────────────────────────┘  │
└────────────────────────────┼─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                        DATA LAYER                        │
│   PostgreSQL (Transactional System of Record)            │
│   S3-Compatible Storage (Restaurant/Menu Images with CDN)│
│   Async Processing (Notifications & Background Tasks)    │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Layers

### 2.1 Frontend Layer

| Component | Technology | Responsibility |
|---|---|---|
| User Portal | React.js (Vite) | Discovery, booking, reviews, profile, institutional verification |
| Management Portal | React.js (Vite) | Scoped Admin, Restaurant Staff, and Super Admin interfaces |
| UI & Styling | Vanilla CSS / Tailwind CSS | Soft, subtle luxury palette, micro-animations, tactile hover effects |
| Iconography | Lucide Icons (`lucide-react`) | Standardized icons — strictly zero emojis in code or UI markup |
| Flow Resilience | 7 Pre-Designed State Views | Empty, Loading, Error, Offline, No Search Results, 403, Success |
| Routing | React Router v6 | SPA navigation and role-based route guards (`RoleGuard`) |
| State Management | React Context + Zustand / TanStack Query | Client state, cache invalidation, and server synchronization |
| Maps | Leaflet / Google Maps / Mapbox GL JS | Restaurant map markers, clustering, and distance calculation |
| HTTP Client | Axios | API communication with automated token refresh interceptors |

### 2.2 API Layer

- **Runtime:** Node.js with Express.js
- **Architecture:** Stateless REST API
- **Protocol:** REST over HTTPS
- **Validation:** Zod request schema validation
- **Middleware stack:**
  1. Rate limiter (auth/verify endpoints)
  2. CORS policy
  3. Body parser & JSON sanitizer
  4. Authentication middleware (`authenticateToken` verifying JWT)
  5. RBAC authorization middleware (`requireRole`, `requireRestaurantScope`)
  6. Request validator (Zod schema runner)
  7. Domain route handler
  8. Centralized error handler
  9. Audit logger (for all privileged actions)

### 2.3 Authentication Layer

| Component | Design |
|---|---|
| Token type | JWT (short-lived access token: 15 min + refresh token: 7 days) |
| Password hashing | Argon2id (preferred) or bcrypt (cost factor 12) |
| Verification codes | Cryptographically secure 6-digit OTP, hashed with bcrypt, 10-min TTL |
| Rate limiting | Per-IP & per-email on auth and verify endpoints |
| Session strategy | Stateless JWT with HTTP-only, secure, SameSite cookies |

### 2.4 Role-Based Access Control (RBAC) Layer

Authorization is evaluated deterministically per request using **Role-Based Access Control (RBAC)** paired with resource tenancy scoping:

```
authenticate(request)
  → identify user and role from verified JWT (USER, RESTAURANT_STAFF, RESTAURANT_ADMIN, SUPER_ADMIN)
  → check route role requirement via requireRole([allowedRoles])
  → if restaurant-scoped route:
      verify req.user.restaurantId matches target :restaurantId
      or verify membership record in database
  → if user-scoped route:
      verify req.user.id matches target resource owner
  → grant or deny (403 Forbidden with clear diagnostic code)
```

| Role | Scope | Authorized Resources |
|---|---|---|
| `SUPER_ADMIN` | Global | Complete platform governance across institutions, users, restaurants, and reviews |
| `RESTAURANT_ADMIN` | Scoped (`restaurantId`) | Restaurant profile, menus, offers, staff roster, availability slots, analytics |
| `RESTAURANT_STAFF` | Scoped (`restaurantId`) | Operational booking workflow (confirm, reject, complete, mark no-show) |
| `USER` | Scoped (`userId`) | Pre-booking creation, personal booking history, eligible review submission |

### 2.5 Domain Services Layer

| Service | Responsibilities |
|---|---|
| `AuthService` | Registration, login, verification, JWT issuance and rotation |
| `InstitutionService` | Domain validation, institution CRUD, whitelist management |
| `UserService` | Profile management, institutional verification and approvals |
| `RestaurantService` | Restaurant CRUD, discovery, search, Haversine distance |
| `MenuService` | Category and dish item management |
| `OfferService` | Offer lifecycle management (active/inactive/expired) |
| `AvailabilityService` | Slot management, capacity definition and tracking |
| `BookingService` | Transactional booking engine, status lifecycle, concurrency |
| `ReviewService` | Review eligibility checking, ratings aggregation |
| `NotificationService` | Event-driven notification dispatch (email and in-app) |
| `AnalyticsService` | Metrics aggregation for restaurant and platform |
| `StaffService` | Restaurant staff allocation and membership management |

### 2.6 Database Layer — PostgreSQL + Prisma ORM

See [Section 4: Database Design](#4-database-design) for full schema.

- **Engine:** PostgreSQL (version 15+)
- **ORM Client:** Prisma ORM (`@prisma/client`) with type-safe generated queries
- **Migrations:** Version-controlled migrations via `npx prisma migrate dev`
- **Connection Management:** Connection pooling via PgBouncer or direct pool configuration
- **Transactions:** High-isolation transactions (`prisma.$transaction`) with row-level locks (`SELECT ... FOR UPDATE`) to guarantee zero overbooking under concurrency

### 2.7 Storage Layer

| Use Case | Solution |
|---|---|
| Restaurant & menu images | S3-Compatible Object Storage (AWS S3 / Cloudflare R2) with CDN delivery |
| Upload security | Server-side MIME validation, 5MB file cap, signed upload URLs |
| CDN caching | Edge caching with cache-control headers |

### 2.8 Async Processing Layer

| Task | Processing |
|---|---|
| Email/notification dispatch | Background queue (BullMQ, AWS SQS, or async worker) |
| Analytics event collection | Non-blocking async write or event queue |
| Audit log writes | Async append after response |
| Analytics event collection | Non-blocking async write or event queue |
| Audit log writes | Async append after response |

---

## 3. API Design

### 3.1 REST Conventions

| Convention | Standard |
|---|---|
| Base path | `/api/v1/` |
| Resource naming | Plural nouns (`/restaurants`, `/bookings`) |
| HTTP methods | GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove) |
| Response format | `{ success, data, error, meta }` |
| Pagination | `?page=1&limit=20`, `meta: { total, page, limit }` |
| Error format | `{ success: false, error: { code, message } }` |
| HTTP status codes | 200, 201, 400, 401, 403, 404, 409, 422, 429, 500 |

### 3.2 Authentication Flow

```
POST /api/auth/register
  → validate domain → create user (PENDING)

POST /api/auth/login
  → verify credentials → issue JWT pair

POST /api/auth/verify
  → validate code → mark VERIFIED

POST /api/auth/refresh
  → validate refresh token → issue new access token

POST /api/auth/logout
  → invalidate refresh token
```

### 3.3 Key Endpoint Groups

```
/api/auth/*              — Public registration/verification
/api/institutions/*      — Super Admin only
/api/users/*             — Super Admin + authenticated self
/api/restaurants/*       — Discovery public; management role-gated
/api/restaurants/:id/menu/*     — Admin (write), public (read)
/api/restaurants/:id/offers/*   — Admin (write), user (read)
/api/restaurants/:id/availability/* — Admin/Restaurant (write)
/api/bookings/*          — User (create/view own), Staff/Admin (manage)
/api/restaurants/:id/reviews/*  — User (write eligible), public (read)
/api/restaurants/:id/staff/*    — Admin only
/api/analytics/*         — Admin + Super Admin
/api/recommendations/*   — Authenticated user
```

### 3.4 Distance Calculation

Restaurant locations are stored as `DECIMAL(9,6)` latitude/longitude in PostgreSQL.

Distance from Bennett University reference point is computed server-side using the **Haversine formula** (or PostGIS `ST_Distance` for precision):

```sql
-- Haversine in PostgreSQL
SELECT *, 
  6371 * acos(
    cos(radians(:refLat)) * cos(radians(latitude)) *
    cos(radians(longitude) - radians(:refLng)) +
    sin(radians(:refLat)) * sin(radians(latitude))
  ) AS distance_km
FROM restaurants
WHERE status = 'active'
ORDER BY distance_km ASC;
```

---

## 4. Database Design

### 4.1 Schema Diagram (Conceptual)

```
institutions
  ↓ (1:N)
users ──────────────────────→ restaurant_memberships ←── restaurants
  ↓ (1:N)                                                    ↓ (1:N)
bookings ←────────────────────────────────────────────── availability_slots
  ↓ (1:1)                                                    ↓ (1:N)
reviews                                                   menu_categories
                                                             ↓ (1:N)
                                                          menu_items
                                                             
restaurants ←──── offers
users ←───── notifications
users ←───── audit_logs
```

### 4.2 Core Table Definitions

```sql
-- Institutions
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email_domain VARCHAR(100) NOT NULL UNIQUE,
  logo TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user','restaurant','admin','super_admin')),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending','approved','verified','rejected','suspended')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Codes
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  phone VARCHAR(20),
  cuisine VARCHAR(100),
  price_range VARCHAR(10),
  opening_hours JSONB,
  capacity INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant Memberships (RBAC Tenancy Scoping)
CREATE TABLE restaurant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('RESTAURANT_ADMIN','RESTAURANT_STAFF')),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id, role)
);

-- Availability Slots
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  booked_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open',
  UNIQUE(restaurant_id, slot_date, start_time)
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(20) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  slot_id UUID REFERENCES availability_slots(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  special_request TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','cancelled','completed','no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, booking_id)
);
```

### 4.3 Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_restaurant ON bookings(restaurant_id);
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX idx_offers_restaurant_status ON offers(restaurant_id, status);
CREATE INDEX idx_offers_validity ON offers(start_at, end_at);
CREATE INDEX idx_memberships_user_restaurant ON restaurant_memberships(user_id, restaurant_id);
CREATE INDEX idx_slots_restaurant_date ON availability_slots(restaurant_id, slot_date);
```

### 4.4 Transactional Booking Logic

Booking creation uses a PostgreSQL transaction with row-level locking to prevent overbooking:

```sql
BEGIN;
  SELECT capacity, booked_count 
  FROM availability_slots 
  WHERE id = :slotId 
  FOR UPDATE;  -- Row lock

  -- Check capacity
  IF (capacity - booked_count) >= :guestCount THEN
    INSERT INTO bookings (...) VALUES (...);
    UPDATE availability_slots 
    SET booked_count = booked_count + :guestCount 
    WHERE id = :slotId;
  ELSE
    RAISE EXCEPTION 'Insufficient capacity';
  END IF;
COMMIT;
```

---

## 5. Security Architecture

### 5.1 Defense Layers

```
Request
  → TLS (transport encryption)
  → Rate limiter (brute force protection)
  → CORS (origin validation)
  → Auth middleware (JWT validation)
  → RBAC middleware (role verification & tenancy validation)
  → Input validator (Zod payload sanitize)
  → Domain service (business logic)
  → Parameterized query (Prisma SQL injection prevention)
  → Response (no sensitive data leakage)
```

### 5.2 Authentication Security

| Control | Implementation |
|---|---|
| Password hashing | Argon2id with salt or bcrypt (cost 12) |
| Access token TTL | 15 minutes |
| Refresh token TTL | 7 days |
| Verification code TTL | 10 minutes |
| Code attempt limit | 5 attempts max |
| Code format | Cryptographically random 6-digit OTP, stored as bcrypt hash |

### 5.3 Authorization Security

- Never trust `role`, `restaurantId`, or `userId` from client request body
- All resource ownership resolved server-side from verified JWT identity
- 403 returned on authorization failure with explicit diagnostic error code
- Audit log written on all privileged mutations

---

## 6. Scalability Design

### 6.1 Serverless & Stateless Compatibility

| Requirement | Solution |
|---|---|
| Stateless API | No server-side sessions; JWT-based auth |
| No in-memory state | External cache (Redis) if caching needed for discovery |
| No filesystem writes | All uploads route to S3-Compatible Storage |
| DB connection pooling | Prisma connection pooler / PgBouncer |
| Cold start mitigation | Keep functions warm or use edge-compatible runtime |

### 6.2 Multi-Institution Scalability

| Concern | Design Decision |
|---|---|
| Hardcoded domain | Stored in `institutions.email_domain` |
| New institution | Add row to `institutions`, configure domain |
| Per-institution data isolation | All entities reference `institution_id` |
| Cross-institution discovery | Platform-level search filters by institution |

---

## 7. Integration Points

| Integration | Purpose |
|---|---|
| SMTP / Transactional Email | Verification codes, booking notifications |
| S3-Compatible Cloud Storage | Restaurant & menu image hosting with CDN delivery |
| Google Maps or Mapbox API | Map display, geocoding and distance on frontend |

---

## 8. Observability

| Layer | Tool/Strategy |
|---|---|
| Application logs | Structured JSON logs (Winston/Pino) |
| Error tracking | Sentry or equivalent |
| Performance metrics | Request latency, DB query time |
| Audit trail | `audit_logs` table (privileged actions) |
| Health checks | `GET /api/health` endpoint |

---

*Document version: V1.0 | Date: 02/09/2026*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
