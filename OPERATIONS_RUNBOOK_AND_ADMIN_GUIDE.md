# 📖 Institutional Dining Platform — Operations Runbook & Support Manual

## 1. System Overview & Architecture
The Institutional Dining Platform provides multi-tenant dining discovery, table pre-booking, and menu ordering for university campuses and corporate institutions.

### Infrastructure Topology
- **Frontend**: React + Vite (Hosted on Vercel)
- **Backend API**: Express + Node.js (Hosted on Vercel Serverless / Docker)
- **Database**: Supabase PostgreSQL (PgBouncer connection pooler on Port `6543`, direct access on Port `5432`)
- **Transactional Email**: Resend API (`sahith@nivixpe.com` domain verified)
- **Payments**: Razorpay HMAC-SHA256 verified checkout

---

## 2. SuperAdmin Operational Procedures

### A. Onboarding a New Campus / Institution
1. Log into SuperAdmin Portal -> Institutions.
2. Click **Add New Institution**.
3. Specify Name, Primary Domain (e.g. `bennett.edu.in`), and Student Discount Percentage (e.g. `20%`).
4. Click Save. Students with `@bennett.edu.in` emails will immediately be eligible for sign-in and institutional discounts.

### B. Onboarding a New Restaurant Outlet & Staff
1. Go to SuperAdmin Portal -> Outlets -> Add Restaurant.
2. Input outlet name, capacity tables, operating hours, and location.
3. Navigate to **User Management** -> Find or Invite Staff Email.
4. Update Role to `RESTAURANT_ADMIN` or `RESTAURANT_STAFF` and select the assigned `restaurantId`.

---

## 3. Incident Response & Support Runbook

### Incident A: Student Not Receiving OTP Email
1. Check **Resend Dashboard** (`https://resend.com/emails`) for status of recipient email.
2. Verify recipient domain is an approved institution domain in SuperAdmin -> Institutions.
3. Check Server Logs for `[EMAIL_SERVICE_ERROR]`.
4. Workaround: SuperAdmin can verify student status directly via `PATCH /api/users/:id/verify`.

### Incident B: Razorpay Payment Confirmation Pending
1. Check Razorpay Dashboard for Payment ID status.
2. If payment is `Captured` on Razorpay but `PENDING` on Platform, run manual sync:
   `POST /api/payments/verify` with `razorpay_payment_id` & `razorpay_signature`.

### Incident C: Database Connection Limits Reached
1. Confirm backend is using `DATABASE_URL` with PgBouncer enabled (`port: 6543`, `?pgbouncer=true`).
2. Verify Supabase connection pool size settings in Supabase Console.

---

## 4. DPDPA & GDPR Data Privacy Requests
- **Data Export Request**: `GET /api/users/privacy/export-data` (Generates JSON dump of user profile, bookings, and reviews).
- **Right to be Forgotten Request**: `POST /api/users/privacy/anonymize-account` (Anonymizes user name, email, roll number while retaining transaction logs for statutory financial accounting).
