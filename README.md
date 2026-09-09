# Restaurant-Institution

> **Institutional Restaurant Discovery & Pre-Booking Platform**  
> Designed for university campus dining ecosystems (e.g. Bennett University) with Role-Based Access Control (RBAC), live reservations, capacity locking, verified reviews, and management hubs.

---

## Architecture Overview

- **Frontend**: React 19, Vite 8, React Router v7, Lucide Icons, Canvas Confetti.
  - Light monochromatic botanical green design system.
  - Complete pre-designed UX flow states (Empty, Loading, Error, Offline, 403, Success).
  - Four distinct roles: Student/Faculty, Restaurant Staff, Restaurant Manager, Super Admin.
- **Backend**: Node.js ES modules, Express 4.21, Prisma ORM 6, PostgreSQL (Supabase pooler).
  - Institutional domain validation (`@bennett.edu.in`) and instant OTP authentication.
  - Concurrency-safe transactional booking engine.
  - Automated background booking reminder scheduler.
  - Zod input sanitization & strict IDOR defenses.

---

## Project Structure

```
.
├── client/
│   └── user-portal/        # React 19 + Vite 8 frontend application
├── server/                 # Express + Prisma REST API server
│   ├── prisma/             # Database schema & seed scripts
│   ├── scripts/            # Integration and security test suites
│   └── src/                # Express controllers, routes, middleware, validators
└── docs/                   # Full system architecture, PRDs, workflows & timelines
```

---

## Quickstart Guide

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database (or Supabase)

### 2. Environment Setup
Copy the example environment file in `server/`:
```bash
cp server/.env.example server/.env
```
Fill in your database URL and JWT secret in `server/.env`.

### 3. Install Dependencies
```bash
npm --prefix server install
npm --prefix client/user-portal install
```

### 4. Database Setup & Seeding
```bash
npm --prefix server run prisma:generate
npm --prefix server run prisma:push
npm --prefix server run seed
```

### 5. Running the Application
In separate terminal windows:
```bash
# Start backend server (port 3000)
npm run dev:server

# Start frontend application (port 1574)
npm run dev:client
```

---

## Demo Credentials

| Role | Email | Password | Assigned Outlet |
| :--- | :--- | :--- | :--- |
| **Student** | `priya.sharma@bennett.edu.in` | `password123` | Campus Dining |
| **Staff Host** | `staff@spicegarden.com` | `password123` | The Spice Garden (#1) |
| **Restaurant Manager** | `manager@spicegarden.com` | `password123` | The Spice Garden (#1) |
| **Super Admin** | `superadmin@bennett.edu.in` | `password123` | Bennett University |

---

## Testing & Verification

Run the automated integration test suites:
```bash
node server/scripts/test_otp_auth.js
node server/scripts/test_phase3_features.js
node server/scripts/test_phase4_hardening.js
```
