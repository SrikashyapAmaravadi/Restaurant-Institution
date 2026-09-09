# Executive Summary
## Institutional Restaurant Discovery & Pre-Booking Platform
**Bennett University | PERN Stack (PostgreSQL + Prisma ORM) | Role-Based Access Control (RBAC)**

> **Prepared by NIVIXPE PRIVATE LIMITED**
> CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979
> Document Reference: NPL-PRD/2026/01 | Version: V1.0 | Date: 02/09/2026

---

## Overview

The **Institutional Restaurant Discovery & Pre-Booking Platform** is a closed, verified ecosystem that connects Bennett University students and faculty with nearby partner restaurants. It enables users to discover restaurants, explore menus and offers, read verified reviews, and pre-book reservations — all within a trusted institutional boundary.

The platform operates through two portals:
- **User Portal** — for students and faculty
- **Unified Management Portal** — for Super Admins, Admins (restaurant owners/managers), and Restaurant staff

---

## The Problem

Bennett University members currently have no dedicated, trusted channel to:
- Discover and compare nearby partner restaurants
- See verified, institutional reviews and current offers
- Pre-book tables or reserve capacity in advance

Partner restaurants similarly lack a focused channel to serve the institutional community, manage reservation demand, and gain visibility with a captive, verified audience.

---

## The Solution

A purpose-built, institution-exclusive platform that:

| Capability | Description |
|---|---|
| **Institutional Verification** | Only `@bennett.edu.in` email holders can register; accounts are reviewed and approved by Super Admin |
| **Restaurant Discovery** | Map + list view, distance-based sorting from Bennett campus, search & filters |
| **Restaurant Profiles** | Full menus, active offers, ratings, reviews, hours, contact info |
| **Pre-Booking** | Date, time, guest count selection — no table selection, no payment |
| **Management Portal** | Three-tier portal for platform governance, restaurant management, and daily operations |
| **RBAC Authorization** | Role-Based Access Control with scoped resource validation across all endpoints |
| **Premium UX & Design** | Soft elegant color palette, micro-animations, Lucide iconography, and pre-built flow states |

---

## Key Stakeholders

| Stakeholder | Role | Value |
|---|---|---|
| Students & Faculty | End Users (`USER`) | Discover, explore, and pre-book restaurants with ease |
| Restaurant Owners | Admin (`RESTAURANT_ADMIN`) | Manage restaurant, staff, menus, offers, and analytics |
| Restaurant Staff | Staff (`RESTAURANT_STAFF`) | Handle day-to-day booking operations |
| Platform Operator | Super Admin (`SUPER_ADMIN`) | Govern institutions, users, restaurants, and platform health |

---

## Technology Foundation

| Layer | Technology |
|---|---|
| Frontend | React.js (User Portal + Management Portal) |
| Styling & Design | Vanilla CSS / Tailwind CSS with soft, elegant color tokens & micro-animations |
| Iconography | Lucide Icons (`lucide-react`) exclusively — strictly zero emojis in code |
| Backend | Node.js + Express.js (Stateless, RESTful) |
| Database | PostgreSQL |
| ORM | Prisma ORM (`@prisma/client`) with schema migrations |
| Authorization | Role-Based Access Control (RBAC) with restaurant-scoped permissions |
| Maps & Location | Leaflet / Mapbox / Google Maps API |
| Storage | Cloud Object Storage (S3 / R2 compatible) with CDN delivery |
| Flow Coverage | Pre-designed states: Empty, Loading, Error, Offline, No Results, 403, Success |

---

## Business Impact

- **For Users:** A safe, convenient, and trusted way to discover and book at nearby restaurants
- **For Restaurants:** A guaranteed stream of verified institutional customers, better demand management, and analytics
- **For the Institution:** A branded, controlled ecosystem that enhances campus life
- **For the Platform:** Scalable model that can onboard additional universities and institutions

---

## What's In Scope

- Institutional email verification and approval workflow
- Restaurant discovery (search, filter, map, distance)
- Restaurant profiles, menus, and offers
- Ratings and reviews (eligibility-gated)
- Pre-booking engine (no payment, no table selection)
- Management Portal: Super Admin governance, Admin management, Restaurant operations
- Role-Based Access Control (RBAC) model
- Pre-designed complete flow states (Empty, Loading, Error, No Internet, No Results, Denied, Success)
- Notifications and booking lifecycle management
- Analytics dashboard for restaurant Admins and Super Admin

## What's Out of Scope

- Online payments or coupon codes
- Waitlists
- QR-based check-in
- Individual table selection by users
- Personalized offers
- Super Admin managing restaurant offers
- Payment-dependent discount redemption
- AI-controlled booking decisions

---

## Success Metrics (At a Glance)

| Category | Key Metric |
|---|---|
| Acquisition | Verified user count |
| Activation | Verification-to-first-booking rate |
| Discovery | Restaurant views, map/filter usage |
| Booking | Confirmed booking rate, completion rate |
| Retention | Repeat bookings, monthly active users |
| Restaurant Health | Active restaurants, avg. bookings/restaurant |
| Reviews | Review participation, average rating trend |

---

*Document version: V1.0 | Date: 02/09/2026 | Institution: Bennett University*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
