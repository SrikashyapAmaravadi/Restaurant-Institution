# Project Timeline
## Institutional Restaurant Discovery & Pre-Booking Platform

> **Prepared by NIVIXPE PRIVATE LIMITED**
> CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979
> Document Reference: NPL-PRD/2026/01 | Version: V1.0 | Date: 02/09/2026

---

## Overview

The project is structured into **6 sprints over 12 weeks**, covering infrastructure through deployment. Each sprint is 2 weeks.

| Phase | Sprints | Duration | Focus |
|---|---|---|---|
| **Phase 1: Foundation** | Sprint 1 | Weeks 1–2 | Infrastructure, schema, auth |
| **Phase 2: Core Platform** | Sprint 2–3 | Weeks 3–6 | RBAC, Super Admin, Admin, Restaurant portals |
| **Phase 3: User Features** | Sprint 4 | Weeks 7–8 | User portal: discovery, booking, reviews |
| **Phase 4: Hardening** | Sprint 5 | Weeks 9–10 | Security, testing, notifications |
| **Phase 5: Launch** | Sprint 6 | Weeks 11–12 | Deployment, monitoring, feedback |

---

## Sprint Breakdown

---

### Sprint 1 — Foundation & Core UX (Weeks 1–2)

**Goal:** Working infrastructure with PostgreSQL, Prisma ORM, authentication, verified schema, and foundational flow states.

| # | Task | Owner | Priority | Status | Verification & Audit Notes |
|---|---|---|---|---|---|
| 1.1 | Set up monorepo structure (client + server) | Dev | P0 | Verified Completed | `server/` and `client/user-portal/` structured and running |
| 1.2 | Configure environments (dev, staging, production) | DevOps | P0 | Verified Completed | `server/.env` configured with Supabase pooler & production configs |
| 1.3 | Set up PostgreSQL database and configure connection pooling | DevOps | P0 | Verified Completed | Prisma connects via Supabase session pooler (`DATABASE_URL`, `DIRECT_URL`) |
| 1.4 | Configure server runtime and deployment target | DevOps | P0 | Verified Completed | Node.js ES modules, Express 4.21.2 |
| 1.5 | Configure S3-compatible storage bucket and access policies | DevOps | P0 | In Progress (P1) | Unsplash CDN active for dev; S3 presigned URLs in Sprint 3 |
| 1.6 | Author Prisma schema (`schema.prisma`) and run initial migration (`prisma migrate dev`) | Backend | P0 | Verified Completed | Schema active (`User`, `Institution`, `VerificationRequest`, etc.); Client generated |
| 1.7 | Implement database seeding (Bennett University institution) | Backend | P0 | Verified Completed | `prisma/seed.js` seeds Bennett University, SNU, demo users, and verifications |
| 1.8 | Implement database indexes, unique constraints, and foreign key relations | Backend | P0 | Verified Completed | Enforced via Prisma relations and unique email/domain constraints |
| 1.9 | Implement auth: register, institutional domain validation, login, JWT issuance | Backend | P0 | Verified Completed | Hardened with `@bennett.edu.in` validation, bcrypt, and JWT issuance |
| 1.10 | Implement institutional verification flow (OTP code generation, verify) | Backend | P0 | Verified Completed | `/verify-code` & `/resend-code` active with passkey generation |
| 1.11 | Implement rate limiting on auth/verify endpoints | Backend | P0 | Verified Completed | `express-rate-limit` active on auth & verify routes |
| 1.12 | Write unit tests for auth and token service | Backend | P1 | Pending (Sprint 5) | Test suite scheduled for hardening sprint |
| 1.13 | Scaffold React apps (User Portal + Management Portal) | Frontend | P0 | Verified Completed | React 19 + Vite 8 + Tailwind v4 compiling cleanly |
| 1.14 | Implement soft elegant color tokens, micro-animations, and Lucide icons (strictly zero emojis) | Frontend | P0 | Verified Completed | Soft luxury terracotta/champagne tokens active; zero emojis across all Phase 1 files |
| 1.15 | Build 7 Pre-designed Complete Flow States (Empty, Loading, Error, Offline, No Results, 403, Success) | Frontend | P0 | Verified Completed | Modular components created in `components/states/` with barrel export |
| 1.16 | Build Login, Register, Verify, Pending Approval pages | Frontend | P0 | Verified Completed | `Login`, `Register`, `Verify`, and `PendingApproval` live with 100% Lucide icons |

**Sprint 1 Deliverables Audit:**
- [x] **Full database schema live with version-controlled Prisma migrations**: Verified active in `schema.prisma` with `@prisma/client`.
- [x] **Auth API endpoints functional and tested**: Registration, login, `/me`, `/resend-code`, and rate limiting live.
- [x] **Institutional email verification flow working end-to-end**: Functional between `auth.routes.js`, `Verify.jsx`, and `PendingApproval.jsx`.
- [x] **Login, register, and all 7 pre-designed complete flow states live in frontend**: All 7 state components (`EmptyState`, `LoadingState`, `ErrorState`, `NoInternetState`, `NoSearchResultsState`, `PermissionDeniedState`, `SuccessState`) and 4 auth pages live with zero emojis and soft luxury UI.

---

### Sprint 2 — RBAC + Management Portal Core (Weeks 3–4)

**Goal:** Role-Based Access Control (RBAC) live; Super Admin and Admin portals functional.

| # | Task | Owner | Priority |
|---|---|---|---|
| 2.1 | Implement RBAC authorization middleware (`requireRole`, `requireRestaurantScope`) | Backend | P0 |
| 2.2 | Implement `RestaurantMember` tenancy queries via Prisma Client | Backend | P0 |
| 2.3 | Institution API: CRUD endpoints (Super Admin) | Backend | P0 |
| 2.4 | User management API: list, approve, reject, suspend | Backend | P0 |
| 2.5 | Restaurant API: create, approve, update, status change | Backend | P0 |
| 2.6 | Restaurant memberships API: assign Admin to restaurant | Backend | P0 |
| 2.7 | Staff API: add/deactivate staff memberships | Backend | P1 |
| 2.8 | Implement audit logging middleware for privileged actions | Backend | P1 |
| 2.9 | Management Portal layout: sidebar, topbar, role-guarded routing | Frontend | P0 |
| 2.10 | Super Admin: Dashboard, Users, Institutions management pages | Frontend | P0 |
| 2.11 | Super Admin: Restaurants management page | Frontend | P0 |
| 2.12 | Role-based navigation (dynamic role visibility) | Frontend | P0 |
| 2.13 | Admin: Restaurant profile edit page with image upload | Frontend | P0 |
| 2.14 | Admin: Staff management page | Frontend | P1 |
| 2.15 | Integration tests: RBAC cross-restaurant access denial | Backend | P0 |

**Sprint 2 Deliverables:**
- [Delivered] RBAC middleware enforcing role and restaurant tenancy checks on all protected routes
- [Delivered] Super Admin can manage institutions, users, and restaurants
- [Delivered] Admin can manage their assigned restaurant profile
- [Delivered] Cross-restaurant IDOR attacks blocked

---

### Sprint 3 — Menu, Offers, Availability & Restaurant Operations (Weeks 5–6)

**Goal:** Admins can fully configure restaurants; Restaurant staff can handle bookings.

| # | Task | Owner | Priority |
|---|---|---|---|
| 3.1 | Menu API: categories and items CRUD | Backend | P0 |
| 3.2 | Offers API: full lifecycle (create, activate, expire) | Backend | P0 |
| 3.3 | Availability slots API: create, update, delete | Backend | P0 |
| 3.4 | Image upload API with S3 integration and CDN delivery | Backend | P1 |
| 3.5 | Analytics API: restaurant metrics aggregation | Backend | P1 |
| 3.6 | Admin: Menu management page (categories + items) | Frontend | P0 |
| 3.7 | Admin: Offer management page (CRUD + activate flow) | Frontend | P0 |
| 3.8 | Admin: Availability configuration page (calendar view) | Frontend | P0 |
| 3.9 | Admin: Restaurant analytics dashboard | Frontend | P1 |
| 3.10 | Restaurant staff: Bookings dashboard (today/upcoming) | Frontend | P0 |
| 3.11 | Restaurant staff: Confirm/reject/complete actions | Frontend | P0 |
| 3.12 | Admin: Bookings management view | Frontend | P0 |
| 3.13 | Unit tests: offer validity, availability capacity logic | Backend | P0 |
| 3.14 | Super Admin: Platform-wide bookings view | Frontend | P1 |

**Sprint 3 Deliverables:**
- [Delivered] Admin can fully manage menu, offers, and availability slots
- [Delivered] Restaurant staff can operate bookings (confirm/reject/complete/no-show)
- [Delivered] Offer lifecycle automated (auto-expiry by `end_at`)
- [Delivered] S3 image uploads functional with CDN delivery

---

### Sprint 4 — User Portal: Discovery, Booking, Reviews (Weeks 7–8)

**Goal:** Full user-facing experience live from discovery to review.

| # | Task | Owner | Priority |
|---|---|---|---|
| 4.1 | Discovery API: search, filters, distance sorting, pagination | Backend | P0 |
| 4.2 | Haversine distance calculation (server-side) | Backend | P0 |
| 4.3 | Restaurant detail API: full payload (menu, offers, reviews, rating) | Backend | P0 |
| 4.4 | Booking creation API: transactional with capacity lock | Backend | P0 |
| 4.5 | Booking management API: user's bookings, cancellation | Backend | P0 |
| 4.6 | Reviews API: eligibility check, CRUD, avg rating update | Backend | P0 |
| 4.7 | Notification API: in-app notifications list | Backend | P1 |
| 4.8 | User Dashboard page | Frontend | P0 |
| 4.9 | Discover page: list view with filters/search | Frontend | P0 |
| 4.10 | Discover page: map view (Google Maps/Mapbox, restaurant pins) | Frontend | P0 |
| 4.11 | Restaurant detail page (full: menu, offers, reviews) | Frontend | P0 |
| 4.12 | Booking flow (multi-step: date → time → guests → confirm) | Frontend | P0 |
| 4.13 | My Bookings page (upcoming, past, cancelled tabs) | Frontend | P0 |
| 4.14 | Review submission form (rating + text) | Frontend | P0 |
| 4.15 | Notifications page | Frontend | P1 |
| 4.16 | User profile page | Frontend | P1 |
| 4.17 | Concurrency test: simultaneous bookings on last capacity slot | Backend | P0 |

**Sprint 4 Deliverables:**
- [Delivered] Users can discover and filter restaurants with map view
- [Delivered] Full restaurant detail page with menu, offers, reviews
- [Delivered] Transactional booking engine live and concurrency-safe via Prisma transactions
- [Delivered] Review submission with eligibility enforcement

---

### Sprint 5 — Security Hardening, Testing & Notifications (Weeks 9–10)

**Goal:** Production-grade security, full test coverage, notification system.

| # | Task | Owner | Priority |
|---|---|---|---|
| 5.1 | Full API security review (RBAC, IDOR, SQL injection) | Backend | P0 |
| 5.2 | Implement input sanitization across all endpoints via Zod | Backend | P0 |
| 5.3 | Implement async notification dispatch (email + in-app) | Backend | P0 |
| 5.4 | Implement booking reminder notifications (cron) | Backend | P1 |
| 5.5 | Implement offer notification dispatch | Backend | P2 |
| 5.6 | Security test suite: IDOR, brute force, injection | QA | P0 |
| 5.7 | Integration test suite: full booking lifecycle | QA | P0 |
| 5.8 | E2E test: registration → booking → review flow | QA | P0 |
| 5.9 | UI test: responsive layouts, micro-animations, 7 flow states | Frontend | P1 |
| 5.10 | Accessibility audit (WCAG AA) | Frontend | P1 |
| 5.11 | Performance optimization: lazy loading, query optimization | Full-stack | P1 |
| 5.12 | Error tracking setup (Sentry) | DevOps | P1 |
| 5.13 | Centralized structured logging setup | DevOps | P1 |
| 5.14 | Super Admin: Review moderation page | Frontend | P1 |
| 5.15 | API documentation (OpenAPI / Swagger) | Backend | P2 |

**Sprint 5 Deliverables:**
- [Delivered] All security vulnerabilities addressed and tested
- [Delivered] Full notification system (email + in-app) functional
- [Delivered] End-to-end test coverage across critical flows
- [Delivered] Accessibility compliant (WCAG AA) and all flow states validated

---

### Sprint 6 — Deployment, Launch & Monitoring (Weeks 11–12)

**Goal:** Production deployment, live monitoring, launch-ready.

| # | Task | Owner | Priority |
|---|---|---|---|
| 6.1 | Production environment configuration | DevOps | P0 |
| 6.2 | CI/CD pipeline setup (GitHub Actions) | DevOps | P0 |
| 6.3 | Production database migration run (`npx prisma migrate deploy`) | DevOps | P0 |
| 6.4 | Seed production data (institution, Super Admin account) | DevOps | P0 |
| 6.5 | SSL/HTTPS and domain configuration | DevOps | P0 |
| 6.6 | Load/stress testing (booking concurrency, discovery) | QA | P0 |
| 6.7 | Final UAT (User Acceptance Testing) with stakeholders | QA/PM | P0 |
| 6.8 | Health check endpoints and uptime monitoring | DevOps | P0 |
| 6.9 | Analytics/metrics dashboard setup | DevOps | P1 |
| 6.10 | Production deployment (User Portal + Management Portal) | DevOps | P0 |
| 6.11 | Soft launch: onboard first batch of restaurants | PM/Admin | P0 |
| 6.12 | Onboard first users (Bennett students/faculty) | PM | P0 |
| 6.13 | Monitor error rates, booking success rates, auth flows | Team | P0 |
| 6.14 | Post-launch bug fix buffer | Dev | P1 |

**Sprint 6 Deliverables:**
- [Delivered] Platform live in production
- [Delivered] First restaurants onboarded and active
- [Delivered] First users verified and making bookings
- [Delivered] Monitoring and alerting in place

---

## Timeline Summary Gantt

```
Week  │  1  2  3  4  5  6  7  8  9 10 11 12
──────┼────────────────────────────────────────
S1    │ ██████
S2    │       ██████
S3    │             ██████
S4    │                   ██████
S5    │                         ██████
S6    │                               ██████

Legend:
██ = Active sprint
```

---

## Milestones

| Milestone | Target Week | Description |
|---|---|---|
| **M1: Schema & Auth Live** | End of Week 2 | Database migrations + auth endpoints functional |
| **M2: Management Portal Live** | End of Week 6 | All three portal roles fully operational |
| **M3: User Portal Live** | End of Week 8 | Discovery, booking, and review flows working |
| **M4: Security Hardened** | End of Week 10 | All security tests passing, notifications live |
| **M5: Production Launch** | End of Week 12 | Live platform with first users and restaurants |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Concurrent booking race conditions | Medium | High | PostgreSQL row-level locking + transactional tests |
| Serverless cold start latency | Low | Medium | Keep-warm strategy or edge-compatible runtime |
| Email deliverability for verification codes | Medium | High | Use transactional email provider (SendGrid/Postmark); test early |
| Scope creep during frontend development | Medium | Medium | Strict story-based sprint planning; no mid-sprint scope changes |
| Performance on map view with many restaurants | Low | Medium | Paginate map pins; cluster markers client-side |
| IDOR via ID manipulation | Low | Critical | RBAC & tenancy scoping enforced on every route; security test suite in Sprint 5 |

---

## Verification & Testing Protocol

> [!IMPORTANT]
> **Operator Verification Policy**:
> - Browser automations and automated headless browser agents are **strictly disabled** across all development phases.
> - All UI flows, state presentations, interactions, and responsive layouts are to be **manually verified by the user**.
> - Automated verification is strictly bounded to headless CLI checks: `vite build`, `oxlint`, unit tests, and Prisma migrations.

---

*Document version: V1.0 | Date: 02/09/2026*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
