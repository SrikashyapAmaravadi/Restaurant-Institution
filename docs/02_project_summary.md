# Project Summary
## Institutional Restaurant Discovery & Pre-Booking Platform

> **Prepared by NIVIXPE PRIVATE LIMITED**
> CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979
> Document Reference: NPL-PRD/2026/01 | Version: V1.0 | Date: 02/09/2026

---

## Project Identity

| Item | Details |
|---|---|
| **Project Name** | Institutional Restaurant Discovery & Pre-Booking Platform |
| **Institution** | Bennett University (initial) |
| **Primary Users** | Students and Faculty (`@bennett.edu.in`) |
| **Tech Stack** | PERN — PostgreSQL, Express.js, React, Node.js |
| **ORM Layer** | Prisma ORM (`@prisma/client`) with typed migrations |
| **Database** | PostgreSQL |
| **UI & Styling** | Vanilla CSS / Tailwind CSS — Soft, subtle, elegant luxury palette with micro-animations & hover effects |
| **Iconography** | Lucide Icons (`lucide-react`) exclusively — strictly zero emojis in code or UI |
| **Architecture** | Stateless Node.js / Express backend with Prisma ORM connection pooling |
| **Authorization** | Role-Based Access Control (RBAC) with resource scoping |
| **Portals** | User Portal; Unified Management Portal |
| **Roles** | `USER`, `RESTAURANT_STAFF`, `RESTAURANT_ADMIN`, `SUPER_ADMIN` |
| **Flow Resilience** | Pre-designed states: Empty, Loading, Error, Offline, No Results, 403 Forbidden, Success |

---

## Project Description

This platform is a **closed, institution-exclusive restaurant ecosystem** built for Bennett University. It connects verified institutional members (students and faculty) with nearby partner restaurants, offering restaurant discovery, menu browsing, offer viewing, review reading, and advance reservation pre-booking.

Unlike public food platforms, this product is designed around **institutional trust**: only verified `@bennett.edu.in` email holders can use the platform, and all restaurants are curated and approved by the platform's Super Admin. The visual design prioritizes high elegance, soft subtle tones, tactile micro-animations, and complete flow state resilience so users never encounter broken UX loops.

---

## Core Features

### User Portal
- Institutional registration, verification workflow, and login
- Restaurant discovery: search, cuisine/price/rating/distance filters, pagination
- Map view with distance calculated from Bennett University reference point
- Full restaurant detail pages: menus, offers, ratings, reviews
- Pre-booking: restaurant + date + time + guest count (no table selection)
- Booking management: upcoming, history, cancellation
- Ratings and reviews (eligibility-gated to completed bookings)
- Notifications: verification, booking updates, reminders
- Pre-designed complete flow states (empty states, loading skeletons, network recovery, permission gates)

### Management Portal
| Role | Core Responsibilities |
|---|---|
| **Super Admin** (`SUPER_ADMIN`) | Institution management, user approval, restaurant governance, platform analytics, review moderation |
| **Admin** (`RESTAURANT_ADMIN`) | Restaurant profile, menu, offers, staff allocation, booking management, analytics |
| **Restaurant Staff** (`RESTAURANT_STAFF`) | Daily booking operations: confirm, reject, complete, no-show |

---

## Data Model Highlights (Prisma Schema)

| Model | Purpose |
|---|---|
| `Institution` | Manages approved institutions and their institutional email domains |
| `User` | Platform accounts with role (`USER`, `RESTAURANT_STAFF`, `RESTAURANT_ADMIN`, `SUPER_ADMIN`) and verification status |
| `Restaurant` | Restaurant profiles including geolocation (latitude/longitude) and operating details |
| `RestaurantMember` | Scopes staff and admins to their assigned restaurant for RBAC checks |
| `Booking` | Core transactional entity with strict status lifecycle and concurrency control |
| `AvailabilitySlot` | Capacity-controlled time slots for pre-booking with date/time parameters |
| `Offer` | Admin-controlled time-limited restaurant promotional offers |
| `Review` | Booking-eligible verified ratings and textual reviews |
| `Notification` | System and event-driven notifications for users and staff |
| `AuditLog` | Immutable audit trail for all privileged administrative and operational actions |

---

## Authorization Model (Role-Based Access Control)

The platform enforces **Role-Based Access Control (RBAC)** paired with resource-level tenancy scoping. Access is validated systematically through centralized middleware:

- **Super Admin (`SUPER_ADMIN`)**: Platform-wide governance across all institutions, restaurants, and user accounts.
- **Restaurant Admin (`RESTAURANT_ADMIN`)**: Scoped to manage restaurant profiles, menus, availability slots, offers, and staff for their assigned restaurant (`restaurantId`).
- **Restaurant Staff (`RESTAURANT_STAFF`)**: Scoped to execute daily operational booking status transitions (confirm, reject, complete, mark no-show) strictly for their assigned restaurant.
- **User (`USER`)**: Scoped to create and view their own pre-bookings, notifications, profile, and eligible reviews.

All protected API endpoints verify the caller's verified JWT role and validate that resource IDs match the authenticated user's assigned scope.

---

## Security Principles

- Passwords hashed with Argon2id or bcrypt (cost factor 12)
- Verification codes: single-use, 6-digit, 10-minute expiry, hashed, rate-limited
- All protected endpoints enforce RBAC and resource scoping server-side
- Prisma ORM parameterized queries preventing SQL injection vulnerabilities
- Immutable audit logs capturing all administrative and staff state modifications
- HTTPS, secure HTTP-only cookies, and hardened secrets management in production

---

## Booking Lifecycle

```
PENDING → CONFIRMED → COMPLETED
           ↓               ↓
        REJECTED       CANCELLED / NO_SHOW
```

- User creates a booking → status: **PENDING**
- Restaurant/Admin confirms or rejects → **CONFIRMED** or **REJECTED**
- After visit → **COMPLETED**, **CANCELLED**, or **NO_SHOW**
- Capacity validation is **transactional** at the database level to prevent overbooking

---

## Out of Scope

| Excluded Feature | Reason |
|---|---|
| Online payments | Not part of the booking flow |
| Coupon codes | Not supported |
| Waitlists | No demand queuing |
| QR-based check-in | Out of scope |
| User table selection | Deliberately excluded |
| Personalized offers | Not supported |
| Super Admin offer management | Offer control belongs to Admin only |
| AI-controlled booking decisions | Explicitly excluded |

---

## Scalability Intent

Although launching with **Bennett University**, the data model is institution-agnostic. All institution-specific data (domain, name, etc.) is stored in the `institutions` table, making onboarding new universities a configuration operation rather than a code change.

---

## Future Roadmap

1. **Multi-institution Expansion** — Onboard additional universities using the institution entity model
2. **Advanced Analytics** — Richer dashboards for Admin and Super Admin
3. **Mobile App** — Native mobile experience for students

---

*Document version: V1.0 | Date: 02/09/2026*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
