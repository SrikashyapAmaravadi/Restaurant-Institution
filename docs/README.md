# Documentation Index
## Institutional Restaurant Discovery & Pre-Booking Platform
**Bennett University | PERN (PostgreSQL + Prisma ORM) | Role-Based Access Control (RBAC)**

> **Prepared by NIVIXPE PRIVATE LIMITED**
> CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979
> Document Reference: NPL-PRD/2026/01 | Version: V1.0 | Date: 02/09/2026

---

## Document Suite

| # | Document | Description |
|---|---|---|
| 01 | [Executive Summary](./01_executive_summary.md) | High-level overview for stakeholders: problem, solution, PERN + Prisma stack, and business impact |
| 02 | [Project Summary](./02_project_summary.md) | Condensed project overview: features, Prisma data models, RBAC authorization, and roadmap |
| 03 | [Product Requirements Document (PRD)](./03_product_requirements_document.md) | Complete PRD: goals, roles, features, Prisma schema, UX design system, flow states, acceptance criteria |
| 04 | [System Design](./04_system_design.md) | Full system design: architecture layers, API design, Prisma ORM layer, security, scalability |
| 05 | [Backend PRD](./05_backend_prd.md) | Backend specification: project structure, endpoints, RBAC middleware, Prisma migrations, tests |
| 06 | [Frontend PRD](./06_frontend_prd.md) | Frontend specification: soft elegant design system, micro-animations, Lucide icons, 7 flow states |
| 07 | [Workflow](./07_workflow.md) | All user and system workflows with sequence diagrams, booking transactions, and RBAC checks |
| 08 | [Timeline](./08_timeline.md) | 12-week sprint-by-sprint plan with tasks, Prisma migrations, and launch milestones |
| 09 | [Architecture](./09_architecture.md) | Architecture decisions, component diagrams, deployment topology, ADRs (RBAC, Prisma, S3) |

---

## Quick Reference

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, TanStack Query |
| UI & Styling | Vanilla CSS / Tailwind CSS with soft, subtle elegant palette & micro-animations |
| Iconography | Lucide Icons (`lucide-react`) exclusively — strictly zero emojis in code |
| Flow Coverage | 7 Pre-designed complete flow states: Empty, Loading, Error, Offline, No Results, 403, Success |
| Maps | Leaflet, Google Maps, or Mapbox GL JS |
| Backend | Node.js, Express.js, Zod, Argon2id/bcrypt |
| Database | PostgreSQL |
| ORM | Prisma ORM (`@prisma/client`) |
| Auth | JWT (access 15min + refresh 7d in HTTP-only cookies) |
| Authorization | Role-Based Access Control (RBAC) with restaurant tenancy scoping |
| Storage | S3-Compatible Cloud Storage (AWS S3 / Cloudflare R2) + CDN |
| Migrations | Prisma Migrate (`npx prisma migrate dev / deploy`) |
| Deployment | Stateless Node.js / Express (Railway / AWS / Docker / Vercel) |

### Roles & Portals
| Role | Portal | Key Capability |
|---|---|---|
| `USER` | User Portal | Discovery, pre-booking, reviews, notifications |
| `RESTAURANT_STAFF` | Management Portal | Daily operational booking management (confirm/reject/complete) |
| `RESTAURANT_ADMIN` | Management Portal | Restaurant profile, menus, offers, staff roster, analytics |
| `SUPER_ADMIN` | Management Portal | Platform governance, institutions, user approval, review moderation |

### Booking Status Lifecycle
```
PENDING → CONFIRMED → COMPLETED
           ↓               ↓
        REJECTED    CANCELLED / NO_SHOW
```

### Verification Flow
```
Register → PENDING → Super Admin Approval → Verification Code → VERIFIED
```

### Recommended Project Structure
```
client/
├── user-portal/             — React User Portal (Vite)
├── management-portal/       — React Unified Management Portal (Vite)
├── packages/                — Shared UI (flow states, Lucide icons, soft theme)
server/
├── prisma/                  — Prisma schema (schema.prisma) & SQL migrations
├── src/modules/             — Domain service modules
└── src/middleware/          — Auth, RBAC, and Zod validation middleware
shared/                      — Shared types, schemas, constants
tests/                       — Unit, integration, API and E2E tests
```

---

*Documentation version: V1.0 | Date: 02/09/2026*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
