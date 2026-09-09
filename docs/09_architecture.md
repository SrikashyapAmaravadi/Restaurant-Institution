# Architecture Document
## Institutional Restaurant Discovery & Pre-Booking Platform

> **Prepared by NIVIXPE PRIVATE LIMITED**
> CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979
> Document Reference: NPL-PRD/2026/01 | Version: V1.0 | Date: 02/09/2026

---

## 1. Architecture Overview

The platform uses a **layered, stateless PERN architecture** with two React frontends, a Node.js/Express REST API with Prisma ORM, and PostgreSQL as the single system of record.

```
╔══════════════════════════════════════════════════════════════════╗
║                        CLIENT TIER                               ║
║  ┌──────────────────────┐    ┌───────────────────────────────┐   ║
║  │    User Portal       │    │    Management Portal          │   ║
║  │    (React SPA)       │    │    (React SPA)                │   ║
║  │                      │    │                               │   ║
║  │ • Discovery          │    │ • Super Admin                 │   ║
║  │ • Booking            │    │ • Admin (Restaurant Owner)    │   ║
║  │ • Reviews            │    │ • Restaurant Staff            │   ║
║  │ • Notifications      │    │                               │   ║
║  │ • Soft Luxury UI     │    │ • 7 Pre-Built Flow States     │   ║
║  │ • Lucide Icons Only  │    │ • Lucide Icons Only           │   ║
║  └──────────┬───────────┘    └────────────┬──────────────────┘   ║
╚═════════════╪════════════════════════════╪════════════════════════╝
              │ HTTPS/REST                 │ HTTPS/REST
╔═════════════▼════════════════════════════▼════════════════════════╗
║                         EDGE / GATEWAY TIER                       ║
║          Rate Limiting · CORS · TLS Termination · CDN             ║
╚══════════════════════════════════╤═══════════════════════════════╝
                                   │
╔══════════════════════════════════▼═══════════════════════════════╗
║                       APPLICATION TIER                           ║
║                   Node.js / Express.js REST API                  ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │              Middleware Pipeline                          │   ║
║  │  Rate Limiter → CORS → Auth (JWT) → RBAC → Validator     │   ║
║  └──────────────────────────┬───────────────────────────────┘   ║
║                              │                                   ║
║  ┌───────────────────────────▼───────────────────────────────┐  ║
║  │                   Domain Services                          │  ║
║  │                                                           │  ║
║  │  AuthService    │  RestaurantService  │  BookingService   │  ║
║  │  MenuService    │  OfferService       │  ReviewService    │  ║
║  │  AnalyticsService│ NotifService       │  StaffService     │  ║
║  │  InstitutionService│ UserService      │  AvailabilityService│ ║
║  └───────────────────────────┬───────────────────────────────┘  ║
║                              │                                   ║
║  ┌───────────────────────────▼───────────────────────────────┐  ║
║  │                   Prisma ORM Layer                         │  ║
║  │                   @prisma/client                          │  ║
║  └───────────────────────────┬───────────────────────────────┘  ║
╚══════════════════════════════╪══════════════════════════════════╝
                               │
╔══════════════════════════════▼══════════════════════════════════╗
║                         DATA TIER                               ║
║  ┌───────────────┐  ┌─────────────┐  ┌──────────────────────┐ ║
║  │  PostgreSQL   │  │  Object     │  │  Async Queue         │ ║
║  │  (Primary DB) │  │  Storage    │  │  (Notifications /    │ ║
║  │               │  │  (S3 / R2)  │  │   Analytics Events)  │ ║
║  └───────────────┘  └─────────────┘  └──────────────────────┘ ║
╚═════════════════════════════════════════════════════════════════╝
```

---

## 2. Architectural Decisions

### 2.1 Stateless REST Backend

**Decision:** All API handlers are stateless functions — no in-memory session state, no local file writes.

**Rationale:**
- Enables horizontal scaling without sticky sessions
- Compatible with containerized and serverless platforms (Docker, Railway, AWS, Vercel)
- Simplifies deployment and reduces infrastructure management overhead

**Consequences:**
- JWT-based auth (stateless tokens) instead of server sessions
- Prisma connection pooler / PgBouncer manages database connection pooling
- Image uploads route directly to S3-compatible cloud storage, not local disk

---

### 2.2 Single PostgreSQL Database with Prisma ORM

**Decision:** PostgreSQL as the sole system of record with Prisma ORM (`@prisma/client`) as the typed data access layer.

**Rationale:**
- PostgreSQL supports row-level locking for transactional booking safety
- Prisma provides compile-time type safety, automated migrations, and connection pooling
- Reduces operational complexity for the initial institution without requiring separate cache stores

**Consequences:**
- All booking operations use `prisma.$transaction` with row-level locks
- Distance calculations use server-side Haversine SQL formula
- If caching is required in v2, Redis can be introduced for discovery search results

---

### 2.3 Scoped Role-Based Access Control (RBAC)

**Decision:** Use Role-Based Access Control (RBAC) coupled with resource tenancy validation.

**Rationale:**
- Explicit role hierarchy (`SUPER_ADMIN`, `RESTAURANT_ADMIN`, `RESTAURANT_STAFF`, `USER`)
- Restaurant tenancy scoping (`restaurantId` check) ensures Admins and Staff operate strictly on their assigned restaurant
- User ownership scoping ensures students and faculty only manipulate their personal bookings and profile data
- Simpler, more predictable, and easier to audit than complex graph-based access control while providing zero IDOR vulnerability

**Consequences:**
- Centralized RBAC middleware (`requireRole`, `requireRestaurantScope`) validates every protected route
- `restaurant_memberships` table stores user-to-restaurant administrative allocations

---

### 2.4 Two Separate React SPAs with Modern UX Architecture

**Decision:** User Portal and Management Portal are separate React applications utilizing a shared component library, soft luxury palette, micro-animations, and complete pre-designed flow states.

**Rationale:**
- Separation of concerns — students discovering food vs. staff processing live table reservations
- Optimized bundle sizes and independent deployment lifecycles
- Guaranteed UX resilience through pre-designed flow states (Empty, Loading, Error, Offline, No Search Results, 403, Success)
- Strict visual elegance with soft, non-jarring colors and Lucide icons (strictly zero emojis in code)

**Consequences:**
- Shared component library maintained as a monorepo package
- Two separate deployment configurations

---

## 3. Component Architecture

### 3.1 Backend Module Structure

```
Application Entry (app.js)
│
├── Middleware Layer
│   ├── rateLimiter          → express-rate-limit, configurable per route group
│   ├── cors                 → origin whitelist from env
│   ├── authenticate         → JWT decode → attach req.user
│   ├── rbac                 → Role verification & restaurant tenancy scoping
│   ├── validate(schema)     → Zod schema validation
│   └── errorHandler         → Unified error response formatter
│
├── Route Layer
│   └── /api/auth, /api/users, /api/restaurants, /api/bookings, ...
│
├── Service Layer (Domain Logic)
│   ├── AuthService          → register, login, verify, token ops
│   ├── InstitutionService   → CRUD, domain validation
│   ├── UserService          → profile, approval lifecycle
│   ├── RestaurantService    → CRUD, discovery, distance sort
│   ├── MenuService          → categories, items
│   ├── OfferService         → lifecycle, visibility filter
│   ├── AvailabilityService  → slot management, capacity
│   ├── BookingService       → transactional engine, status machine
│   ├── ReviewService        → eligibility, CRUD, avg rating
│   ├── NotificationService  → event dispatch, in-app + email
│   ├── AnalyticsService     → metric aggregation queries
│   └── StaffService         → membership management
│
└── Data Layer (Prisma ORM)
    ├── prisma.js            → PrismaClient singleton instance
    ├── schema.prisma        → PostgreSQL models & relations
    └── migrations/          → Version-controlled SQL migration history
```

---

### 3.2 Frontend Architecture (Per Portal)

```
App
├── Router (React Router v6)
├── AuthContext / AuthProvider
│   ├── user state
│   ├── token management (access + refresh)
│   └── auto-refresh interceptor
│
├── QueryClient (TanStack React Query)
│   ├── useRestaurants(filters)
│   ├── useRestaurant(id)
│   ├── useBookings(filters)
│   ├── useOffers(restaurantId)
│   └── ... (all server state)
│
├── Pages (route-level components)
│   └── Each page: data fetching → layout → components
│
├── Components
│   ├── /ui          → Design system primitives (Button, Input, Card, Badge)
│   ├── /domain      → Domain components (RestaurantCard, BookingStatusBadge)
│   └── /layout      → Sidebar, Topbar, PageWrapper
│
└── API Client (Axios)
    ├── Base URL from env
    ├── Request interceptor: attach Bearer token
    └── Response interceptor: 401 → token refresh → retry
```

---

## 4. Data Architecture

### 4.1 Entity Relationship Overview

```
institutions ────────────────────────────────────────────────────────┐
     │ (1:N)                                                          │
     ▼                                                                │
   users ──────────────────────────────┐                             │
     │ (1:N bookings)                  │ (N:M via restaurant_         │
     │ (1:N reviews)                   │  memberships)                │
     │ (1:N notifications)             ▼                              │
     │                          restaurant_memberships                │
     │                                 │ (N:1 restaurants)            │
     └─────────────► bookings          ▼                              │
                          │        restaurants ◄────────────────────┘
                          │ (N:1)      │ (1:N menu_categories)
                          │            │ (1:N offers)
                          ▼            │ (1:N availability_slots)
                    availability       ▼
                      _slots      menu_categories
                                       │ (1:N menu_items)
                                       ▼
                                  menu_items

   reviews ──────────────────────────────────────────────────►  restaurants
   (user_id + booking_id + restaurant_id)
   
   audit_logs (actor_user_id, action, resource_type, resource_id)
```

### 4.2 Booking Concurrency Model

```
Client A                   Client B                  PostgreSQL
   │                           │                          │
   │── POST /bookings ─────────►│                          │
   │   (slotId, guestCount=4)  │── POST /bookings ────────►│
   │                           │   (slotId, guestCount=3) │
   │                           │                          │
   │                           │         BEGIN TRANSACTION (A)
   │                           │         SELECT ... FOR UPDATE → lock row
   │                           │                          │
   │                           │         BEGIN TRANSACTION (B)
   │                           │         SELECT ... FOR UPDATE → WAIT (blocked)
   │                           │                          │
   │                           │         (A) capacity=5, booked=0
   │                           │         (A) 5-0=5 >= 4 [OK]
   │                           │         (A) INSERT booking
   │                           │         (A) UPDATE booked_count = 4
   │                           │         (A) COMMIT → release lock
   │◄── 201 Created ───────────│                          │
   │                           │         (B) unblocked
   │                           │         capacity=5, booked=4
   │                           │         5-4=1 < 3 [EXCEEDED]
   │                           │         ROLLBACK
   │                           │◄── 409 Capacity exceeded ─│
   ▼                           ▼                          ▼
```

---

## 5. Security Architecture

### 5.1 Auth Flow

```
                    ┌─────────────────────────┐
                    │     Login Request        │
                    │  { email, password }     │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  Lookup user by email   │
                    │  Compare Argon2id hash  │
                    │  Check status=verified  │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
     ┌────────▼────────┐                 ┌────────▼────────┐
     │  Issue Access   │                 │  Store Refresh  │
     │  Token (15min)  │                 │  Token (7d)     │
     │  JWT: userId,   │                 │  Hashed in DB   │
     │  role, exp      │                 │  or Redis       │
     └────────┬────────┘                 └─────────────────┘
              │
     ┌────────▼────────┐
     │  Return tokens  │
     │  to client      │
     └─────────────────┘
```

### 5.2 Scoped RBAC Request Guard

```
Every Protected Request:
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. authenticateToken(req)                              │
│     → Decode and verify JWT from Authorization header   │
│     → Attach req.user = { id, role, restaurantId? }     │
│                                                         │
│  2. requireRole(...allowedRoles)                        │
│     → Does req.user.role match allowed roles?           │
│     → If no → 403 Forbidden ("INSUFFICIENT_ROLE")       │
│                                                         │
│  3. requireRestaurantScope()                            │
│     → If route is restaurant-scoped:                    │
│       - SUPER_ADMIN → allow                             │
│       - If req.user.restaurantId === req.params.id → ok │
│       - Or check Prisma restaurantMember for assignment │
│     → If unauthorized → 403 ("ACCESS_DENIED")           │
│                                                         │
│  4. validate(schema)                                    │
│     → Zod schema on req.body/query/params               │
│     → 422 on failure                                    │
│                                                         │
│  5. Handler executes domain logic with Prisma ORM       │
│                                                         │
│  6. Audit log written for privileged administrative ops │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Infrastructure Architecture

### 6.1 Deployment Topology

```
                         DNS / CDN
                (Cloudflare / Vercel Edge)
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       user.app.com   mgmt.app.com   api.app.com
       (User Portal)  (Mgmt Portal)  (REST API)
       React SPA      React SPA      Express / Node
       on Vercel      on Vercel      on Railway/AWS
                            │
              ┌─────────────┼──────────────┐
              │             │              │
              ▼             ▼              ▼
         PostgreSQL     S3 / R2         Async Queue
         (Primary DB)   Storage + CDN   (BullMQ/SQS)
```

### 6.2 Environments

| Environment | Purpose | Database | Notes |
|---|---|---|---|
| **Development** | Local dev | Local PostgreSQL | `.env.development` |
| **Staging** | Pre-production testing | Staging PostgreSQL | Mirrors production config |
| **Production** | Live platform | Managed PostgreSQL | Secrets via env vault |

### 6.3 CI/CD Pipeline

```
Developer Push to Feature Branch
          │
          ▼
   GitHub Actions Trigger
          │
    ┌─────┴──────────────────┐
    │                        │
    ▼                        ▼
  Lint + Unit Tests     Build (Vite)
    │                        │
    └─────────┬──────────────┘
              │
              ▼
      Integration Tests
      (against staging DB)
              │
         Pass │ Fail
              │      └──► Notify developer, block merge
              ▼
      Merge to main
              │
              ▼
   Auto-deploy to Staging
              │
   Manual Approval Gate
              │
              ▼
   Deploy to Production
              │
              ▼
   Health check verification
   (GET /api/health → 200)
```

---

## 7. Service Communication

### 7.1 Synchronous (Request/Response)

All user-facing features are synchronous REST:
- Authentication
- Restaurant discovery and detail
- Menu and offer retrieval
- Booking creation and management
- Review submission

### 7.2 Asynchronous (Event-Driven)

Non-critical operations use async dispatch to avoid blocking responses:

| Event | Trigger | Async Task |
|---|---|---|
| User registered | POST /auth/register | Notify Super Admin (email/in-app) |
| User approved | PATCH /users/:id/status | Send verification code email |
| Booking created | POST /bookings | Notify restaurant (in-app) |
| Booking confirmed | PATCH /bookings/:id/status | Notify user (email + in-app) |
| Booking reminder | Scheduled cron (24h before) | Send reminder to user |
| Offer activated | PATCH /offers/:id/status | Dispatch to subscribed users |
| Analytics events | Various actions | Async analytics event write |

---

## 8. Scalability Architecture

### 8.1 Horizontal Scaling

| Layer | Scaling Strategy |
|---|---|
| API | Serverless auto-scales (multiple function instances) |
| Database | Managed PostgreSQL read replicas for heavy read workloads |
| Object Storage | S3/R2 auto-scales |
| Async Queue | SQS or equivalent auto-scales |

### 8.2 Multi-Institution Scaling

```
institutions table:
┌────────┬─────────────────────┬──────────────────┬────────┐
│ id     │ name                │ email_domain     │ status │
├────────┼─────────────────────┼──────────────────┼────────┤
│ uuid-1 │ Bennett University  │ bennett.edu.in   │ active │
│ uuid-2 │ Shiv Nadar Univ.    │ snu.edu.in       │ active │  ← future
│ uuid-3 │ Amity University    │ amity.edu        │ active │  ← future
└────────┴─────────────────────┴──────────────────┴────────┘

All entities (users, restaurants, bookings) reference institution_id.
Adding a new institution = INSERT one row + configure domain.
No code changes required.
```

---

## 9. Observability Architecture

```
Application Logs          Error Tracking          Metrics
(Pino / Winston)          (Sentry)                (Prometheus/Grafana
      │                       │                    or Vercel Analytics)
      ▼                       ▼                         ▼
 Log Aggregation         Real-time alerts          Dashboard:
 (Datadog / Loki /       on unhandled             - Request latency
  CloudWatch)            exceptions               - DB query time
                                                  - Booking success rate
                                                  - Auth failure rate

Audit Trail:
audit_logs table
  → actor, action, resource_type, resource_id, metadata, timestamp
  → Queryable by Super Admin in Management Portal
```

---

## 10. Architecture Decision Records (ADR) Summary

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | PERN stack | Team familiarity, strong ecosystem, PostgreSQL ACID compliance |
| ADR-002 | Stateless REST API | Scalability, predictable operations, cost-efficient horizontal scaling |
| ADR-003 | Scoped RBAC | Explicit role hierarchy with restaurant & user tenancy validation; prevents IDOR and simplifies authorization |
| ADR-004 | PostgreSQL for bookings | ACID transactions + row-level locking (`SELECT ... FOR UPDATE`) prevents overbooking |
| ADR-005 | Two separate SPAs | Smaller bundles, independent deployments, clean UX separation |
| ADR-006 | No payment integration (v1) | Out of scope; reduces PCI compliance complexity |
| ADR-007 | Institution-entity model | Makes multi-institution expansion a config operation, not a code change |
| ADR-008 | Async notification dispatch | Avoids blocking booking confirmation response on email delivery |
| ADR-009 | No Redis cache (v1) | Reduces infra complexity; PostgreSQL indexed queries sufficient at v1 scale |
| ADR-010 | Prisma ORM + S3 Storage | Type-safe client, declarative schema migrations (`schema.prisma`), connection pooling, and dedicated cloud object storage |
| ADR-011 | Flow State Resilience & Lucide | 7 mandatory complete flow states (empty, loading, error, offline, no results, 403, success); zero emojis in code |

---

*Document version: V1.0 | Date: 02/09/2026*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
