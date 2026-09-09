# Workflow Document
## Institutional Restaurant Discovery & Pre-Booking Platform

---

## 1. User Workflows

### 1.1 Registration & Verification Workflow

```
User                    Backend                 Super Admin
  │                        │                        │
  │── Register (email, ────►│                        │
  │   name, password)       │                        │
  │                         │── Validate domain      │
  │                         │   (bennett.edu.in)     │
  │                         │── Create user          │
  │                         │   status: PENDING      │
  │◄── "Pending approval" ──│                        │
  │                         │── Notify Super Admin ──►│
  │                         │                        │── Review user profile
  │                         │                        │
  │                         │                   ┌────┤
  │                         │             Approve│   │Reject
  │                         │                   └────┤
  │                         │◄── Approve/Reject ─────│
  │                         │                        │
  │                     [Approved]               [Rejected]
  │                         │                        │
  │                         │── Generate code        │── Notify user: rejected
  │                         │   (hashed, 30min TTL)  │
  │◄── Verification code ───│                        │
  │   (via email)           │                        │
  │                         │                        │
  │── Submit code ─────────►│                        │
  │                         │── Validate code hash   │
  │                         │── Mark VERIFIED        │
  │◄── "Account verified" ──│                        │
  │                         │                        │
  │── Login ───────────────►│                        │
  │◄── JWT tokens ──────────│                        │
  │                         │                        │
  ▼                         ▼                        ▼
```

---

### 1.2 Restaurant Discovery Workflow

```
User                           Backend
  │                               │
  │── Open /discover ────────────►│
  │                               │── Apply default filters
  │                               │   (active restaurants)
  │                               │── Calculate distance from
  │                               │   Bennett reference point
  │                               │── Apply sort (nearest first)
  │◄── Restaurant list ───────────│
  │                               │
  │── Apply filters ─────────────►│
  │   (cuisine, price, rating,    │── Filter + re-sort results
  │    distance, availability)    │── Paginate
  │◄── Filtered results ──────────│
  │                               │
  │── Toggle map view ───────────►│ (client-side)
  │   (shows pin markers)         │
  │                               │
  │── Click restaurant card ─────►│
  │◄── Restaurant detail page ────│
  │   (profile, menu, offers,     │
  │    reviews)                   │
  ▼                               ▼
```

---

### 1.3 Pre-Booking Workflow

```
User                    Backend                 Restaurant/Admin
  │                        │                         │
  │── Select restaurant ──►│                         │
  │── Click "Book" ────────►│                        │
  │                         │                         │
  │── Select date ─────────►│                         │
  │◄── Available slots ─────│── Query availability    │
  │                         │   for selected date     │
  │── Select time slot ────►│                         │
  │── Enter guest count ───►│                         │
  │── (Optional) Special    │                         │
  │   request               │                         │
  │── Submit booking ──────►│                         │
  │                         │                         │
  │                         │── BEGIN TRANSACTION     │
  │                         │── Lock availability slot│
  │                         │── Check capacity:       │
  │                         │   booked_count +        │
  │                         │   guest_count ≤ capacity│
  │                         │                         │
  │                    [Capacity OK]            [Over capacity]
  │                         │                         │
  │                         │── Insert booking        │── Return 409 error
  │                         │   (status: PENDING)     │
  │                         │── Update booked_count   │◄── "Slot unavailable"
  │                         │── COMMIT                │
  │◄── Booking confirmed ───│                         │
  │    (booking_code,        │── Notify Restaurant ───►│
  │     status: PENDING)     │                         │
  │                         │                    ┌────┤
  │                         │            Confirm │   │ Reject
  │                         │                    └────┤
  │◄── Status update ───────│◄── Update status ───────│
  │   notification           │                         │
  ▼                         ▼                         ▼
```

---

### 1.4 Booking Status Lifecycle

```
                   ┌──────────┐
                   │  PENDING │
                   └────┬─────┘
                        │
           ┌────────────┼────────────┐
           │            │            │
           ▼            ▼            ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │CONFIRMED │  │ REJECTED │  │CANCELLED │
     └────┬─────┘  └──────────┘  └──────────┘
          │
   ┌──────┼──────────────┐
   │      │              │
   ▼      ▼              ▼
┌─────┐ ┌────────┐ ┌─────────┐
│COMP-│ │CANCEL- │ │ NO_SHOW │
│LETED│ │ LLED   │ │         │
└─────┘ └────────┘ └─────────┘

Status Transitions:
PENDING    → CONFIRMED   (Restaurant, Admin, Super Admin)
PENDING    → REJECTED    (Restaurant, Admin, Super Admin)
PENDING    → CANCELLED   (User, Admin, Super Admin)
CONFIRMED  → COMPLETED   (Restaurant, Admin, Super Admin)
CONFIRMED  → CANCELLED   (User, Restaurant, Admin, Super Admin)
CONFIRMED  → NO_SHOW     (Restaurant, Admin)
```

---

### 1.5 Review Submission Workflow

```
User                         Backend
  │                             │
  │── View completed bookings ─►│
  │◄── Bookings list ───────────│
  │                             │
  │── Click "Leave Review" ────►│
  │   (on COMPLETED booking)    │── Check eligibility:
  │                             │   1. booking status = COMPLETED
  │                             │   2. No existing review for booking
  │                             │   3. User is booking owner
  │◄── Review form ─────────────│
  │                             │
  │── Submit (rating, text) ───►│
  │                             │── Insert review
  │                             │── Recalculate restaurant avg rating
  │◄── "Review submitted" ──────│
  ▼                             ▼
```

---

## 2. Admin Workflows

### 2.1 Offer Management Workflow

```
Admin                        Backend
  │                             │
  │── Open Offers page ────────►│
  │◄── Offers list (all status)─│
  │                             │
  │── Create new offer ────────►│
  │   (title, description,      │── Validate: Admin owns restaurant
  │    discount, validity,      │── Create offer (status: DRAFT)
  │    terms)                   │
  │◄── Draft offer created ─────│
  │                             │
  │── Activate offer ──────────►│
  │                             │── status: ACTIVE
  │                             │── Now visible to users
  │◄── Offer activated ─────────│
  │                             │
  │                             │ [Auto-expires after end_at]
  │                             │── status: EXPIRED
  ▼                             ▼
```

---

### 2.2 Staff Management Workflow

```
Admin                        Backend
  │                             │
  │── Open Staff page ─────────►│
  │◄── Current staff list ──────│
  │                             │
  │── Add Staff ───────────────►│
  │   (user email)              │── Find user by email
  │                             │── Verify user belongs to institution
  │                             │── Create restaurant_membership:
  │                             │   relationship_type = 'staff_of'
  │◄── Staff added ─────────────│
  │                             │
  │── Deactivate Staff ────────►│
  │                             │── Update membership status: inactive
  │◄── Staff deactivated ───────│
  │                             │── Staff loses portal access
  ▼                             ▼
```

---

## 3. Super Admin Workflows

### 3.1 Restaurant Onboarding Workflow

```
Admin (Owner)              Super Admin              Backend
  │                             │                      │
  │── Request to onboard ──────►│                      │
  │   (via external channel)    │                      │
  │                             │── Create restaurant ─►│
  │                             │   (status: PENDING)  │
  │                             │                      │── Restaurant exists
  │                             │── Assign Admin ──────►│
  │                             │   (create membership)│
  │                             │                      │
  │                             │── Review & approve ──►│
  │                             │   (status: ACTIVE)   │
  │◄── Notified: active ────────│◄── Notify Admin ──────│
  │                             │                      │
  │── Can now manage restaurant │                      │
  ▼                             ▼                      ▼
```

---

### 3.2 User Approval Workflow

```
New User                  Backend                Super Admin
  │                          │                       │
  │── Register ─────────────►│── status: PENDING     │
  │                          │── Notify Super Admin ─►│
  │◄── "Pending" screen ─────│                       │
  │                          │                  ┌────┤
  │                          │           Approve│   │Reject
  │                          │                  └────┤
  │                          │◄── Decision ──────────│
  │                          │                       │
  │               [Approved] │            [Rejected]  │
  │                          │                       │
  │                          │── Generate verify code │── Notify: rejected
  │◄── Email: verify code ───│                       │
  │── Enter code ───────────►│                       │
  │◄── Verified ─────────────│                       │
  ▼                          ▼                       ▼
```

---

## 4. System Workflows

### 4.1 Notification Dispatch Workflow

```
Domain Event (e.g., booking confirmed)
          │
          ▼
  BookingService.confirm()
          │
          ▼
  NotificationService.dispatch({
    type: 'BOOKING_CONFIRMED',
    recipientId: booking.userId,
    payload: { bookingCode, restaurantName, date, time }
  })
          │
     ┌────┴────────────────┐
     ▼                     ▼
  Insert to             Send email
  notifications         (async via queue)
  table                      │
     │                       ▼
  User sees             SMTP / SendGrid
  in-app notification
```

---

### 4.2 Availability Slot Capacity Update Flow

```
Booking Created (Transactional):
BEGIN
  SELECT ... FROM availability_slots WHERE id = :slotId FOR UPDATE
  Check: capacity - booked_count >= guest_count
  INSERT INTO bookings (status: PENDING)
  UPDATE availability_slots SET booked_count = booked_count + guest_count
COMMIT

Booking Cancelled:
BEGIN
  UPDATE bookings SET status = 'CANCELLED'
  UPDATE availability_slots SET booked_count = booked_count - guest_count
  WHERE booking's slot_id
COMMIT
```

---

### 4.3 Token Refresh Workflow

```
Client                        API
  │                             │
  │── API Request ─────────────►│ (access token expired)
  │◄── 401 Unauthorized ────────│
  │                             │
  │── POST /auth/refresh ──────►│ (with refresh token)
  │                             │── Validate refresh token
  │                             │── Issue new access + refresh
  │◄── New tokens ──────────────│
  │── Retry original request ──►│
  │◄── 200 OK ──────────────────│
  ▼                             ▼
```

---

## 5. Role-Based Access Control (RBAC) & Tenancy Scoping Workflow

### Per-Request Authorization Flow

```
Incoming Request
      │
      ▼
authenticateToken(req)
  → Decode and verify JWT
  → Attach req.user { id, role, restaurantId? }
      │
      ▼
requireRole(...allowedRoles)
  → Does req.user.role match required role(s)?
      ├─ No → 403 Forbidden ("INSUFFICIENT_ROLE")
      └─ Yes → Continue
      │
      ▼
requireRestaurantScope() (For Restaurant-Scoped Routes)
  → Extract restaurantId from req.params
  ├─ If SUPER_ADMIN → Grant access (Global scope)
  ├─ If req.user.restaurantId === req.params.restaurantId → Grant access
  └─ Otherwise query Prisma:
       prisma.restaurantMember.findFirst({
         where: { userId: req.user.id, restaurantId, status: 'active' }
       })
       ├─ Found → Grant access → Continue to controller handler
       └─ Not found → 403 Forbidden ("RESTAURANT_ACCESS_DENIED")
```

### Example: Admin updates restaurant profile

```
PATCH /api/restaurants/:restaurantId
  → authenticateToken → req.user = { id: "user-99", role: "RESTAURANT_ADMIN", restaurantId: "rest-101" }
  → requireRole('SUPER_ADMIN', 'RESTAURANT_ADMIN') → Role check passes
  → requireRestaurantScope()
      → req.params.restaurantId = "rest-101"
      → matches req.user.restaurantId → Tenancy check passes
      → Proceed to RestaurantService.updateProfile()
```

---

## 4. Quality Assurance & Verification Protocol

```
Developer (Agent)              Operator (User)
      │                               │
      │── Build & Static Checks ──────│
      │   (vite build, oxlint)        │
      │                               │
      │── Schema & API Validations ───│
      │   (prisma generate, tests)    │
      │                               │
      │── Ready for UI Review ────────►│
      │   (No browser automation)     │
      │                               │── Opens browser locally
      │                               │── Manually tests 7 flow states
      │                               │── Manually verifies RBAC gates
      │                               │── Tests registration & OTP
      │◄── Feedback / Approval ───────│
```

> [!IMPORTANT]
> **Strict Policy — Zero Browser Automation**:
> Headless browser subagents and automated browser manipulation tools are strictly prohibited across this project. All front-end verification, visual inspections, micro-animations, and UX workflows are conducted manually by the operator.

---

*Document version: V1.0 | Date: 02/09/2026*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
