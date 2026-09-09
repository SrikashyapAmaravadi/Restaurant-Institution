# Frontend PRD
## Institutional Restaurant Discovery & Pre-Booking Platform

> **Prepared by NIVIXPE PRIVATE LIMITED**
> CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979
> Document Reference: NPL-PRD/2026/01 | Version: V1.0 | Date: 02/09/2026

---

## 1. Overview

The frontend consists of two React single-page applications served from a single monorepo:
- **User Portal** — for verified Bennett University members
- **Unified Management Portal** — for Super Admin, Admin, and Restaurant roles

Both portals share a component library and design system, but have separate routing, layouts, and feature sets.

| Item | Detail |
|---|---|
| **Framework** | React 18+ |
| **Language** | JavaScript (or TypeScript) |
| **Routing** | React Router v6 |
| **State Management** | React Context + Zustand (or Redux Toolkit) |
| **Data Fetching** | React Query (TanStack Query) |
| **Forms** | React Hook Form + Zod validation |
| **Map** | Google Maps or Mapbox GL JS |
| **Styling** | Tailwind CSS / CSS with design tokens |
| **Build** | Vite |
| **Deployment** | Vercel / Netlify / CDN |

---

## 2. Project Structure

```
/frontend
├── apps/
│   ├── user-portal/             # Bennett user-facing app
│   └── management-portal/       # Admin/Super Admin/Restaurant app
├── packages/
│   ├── ui/                      # Shared component library
│   ├── api-client/              # Axios-based API client with interceptors
│   ├── auth/                    # Auth context, hooks, token management
│   └── utils/                   # Shared helpers (distance, date, format)
├── public/
└── vite.config.js
```

---

## 3. Design System

### 3.1 Aesthetic Principles: Soft Luxury & Subtle Elegance
The platform eschews harsh, oversaturated primaries in favor of a **calm, prestigious institutional aesthetic**. High-contrast typography is paired with warm, tactile neutrals, velvety card elevations, and gentle micro-animations.

### 3.2 Color Palette (Soft & Subtle Tones)

```css
/* Primary Accent — Soft Midnight Slate / Classic Indigo */
--color-primary: hsl(222, 47%, 42%);         /* Dignified, muted slate blue */
--color-primary-hover: hsl(222, 47%, 35%);
--color-primary-subtle: hsl(222, 35%, 94%);   /* Soft tint for badges/toggles */
--color-primary-glow: hsla(222, 47%, 42%, 0.12);

/* Secondary Accent — Warm Champagne / Soft Sand */
--color-accent: hsl(38, 35%, 55%);
--color-accent-subtle: hsl(38, 40%, 95%);

/* Semantic (Soft, non-jarring tones) */
--color-success: hsl(152, 40%, 42%);        /* Soft Sage Green */
--color-success-bg: hsl(152, 45%, 95%);
--color-warning: hsl(38, 70%, 50%);         /* Warm Muted Amber */
--color-warning-bg: hsl(38, 85%, 96%);
--color-error: hsl(356, 45%, 54%);          /* Dusty Rose / Terracotta */
--color-error-bg: hsl(356, 50%, 96%);
--color-info: hsl(205, 45%, 52%);           /* Soft Slate Sky */
--color-info-bg: hsl(205, 55%, 96%);

/* Neutrals (Warm Stone & Crisp Charcoal) */
--color-gray-50: hsl(40, 20%, 99%);         /* Warm Alabaster */
--color-gray-100: hsl(214, 20%, 96%);       /* Soft Slate */
--color-gray-200: hsl(214, 16%, 90%);
--color-gray-300: hsl(214, 14%, 82%);
--color-gray-400: hsl(215, 14%, 62%);
--color-gray-500: hsl(215, 14%, 46%);
--color-gray-700: hsl(215, 25%, 25%);
--color-gray-900: hsl(222, 47%, 11%);       /* Obsidian Deep Charcoal */

/* Surfaces & Glassmorphism */
--color-bg: hsl(40, 20%, 99%);
--color-surface: hsl(0, 0%, 100%);
--color-surface-raised: hsl(214, 20%, 97%);
--color-border-subtle: hsl(214, 16%, 91%);
--glass-bg: rgba(255, 255, 255, 0.82);
--glass-border: rgba(226, 232, 240, 0.7);

/* Typography Contrast */
--color-text-primary: hsl(222, 47%, 11%);
--color-text-secondary: hsl(215, 14%, 46%);
--color-text-muted: hsl(215, 14%, 62%);
```

### 3.3 Micro-Animations & Hover Tokens

```css
/* Transitions */
--transition-instant: 100ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-snappy: 180ms cubic-bezier(0.16, 1, 0.3, 1);
--transition-smooth: 280ms cubic-bezier(0.16, 1, 0.3, 1);
--transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);

/* Hover & Elevation Effects */
--card-hover-transform: translateY(-2px) scale(1.006);
--card-hover-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
--button-active-transform: scale(0.98);

/* Keyframe Animations */
@keyframes softPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@keyframes shimmerWave {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes floatGentle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
```

### 3.4 Strict Iconography Standards (Zero Emojis in Code)
- **Strict Rule:** Emojis are strictly banned from all component source code, JSX markup, toasts, alerts, and badges.
- **Lucide Icons:** All icons must be imported as SVG React components from `lucide-react`:

| Context | Lucide Icon Component |
|---|---|
| Success Confirmation | `<CheckCircle2 className="w-5 h-5 text-success" />` |
| Danger / Error | `<AlertCircle className="w-5 h-5 text-error" />` |
| Warning / Expiry | `<AlertTriangle className="w-5 h-5 text-warning" />` |
| Offline / Network Loss | `<WifiOff className="w-5 h-5 text-muted" />` |
| No Search Results | `<SearchX className="w-8 h-8 text-muted" />` |
| Permission Denied / 403 | `<ShieldAlert className="w-8 h-8 text-error" />` |
| Pre-Booking Time / Calendar | `<Calendar className="w-4 h-4" />`, `<Clock className="w-4 h-4" />` |
| Campus Location / Map | `<MapPin className="w-4 h-4 text-primary" />` |
| Star Rating | `<Star className="w-4 h-4 fill-amber-400 text-amber-400" />` |
| Close / Cancel | `<X className="w-4 h-4" />` |

---

## 4. User Portal

### 4.1 Routing Structure

```
/                         → Redirect to /login or /dashboard
/login                    → Login page
/register                 → Registration page
/verify                   → Verification code entry
/pending                  → Awaiting approval screen
/unauthorized             → 403 Permission Denied page
/offline                  → Full offline recovery screen

/dashboard                → Main dashboard (authenticated)
/discover                 → Restaurant discovery (list + map)
/restaurants/:id          → Restaurant detail page
/restaurants/:id/book     → Booking flow
/bookings                 → My bookings list
/bookings/:id             → Booking detail
/profile                  → User profile
/notifications            → Notifications list
```

### 4.2 Page Specifications

---

#### `LoginPage`
- Fields: email, password
- Link to register / forgot password
- Error state for unverified accounts (shows pending/rejected message)
- Redirect to `/dashboard` on success

---

#### `RegisterPage`
- Fields: full name, institutional email, password, confirm password
- Real-time domain validation (shows error if not `@bennett.edu.in`)
- Password strength indicator
- On success: show "Pending approval" state with illustration

---

#### `VerifyPage`
- OTP / code input (6-digit)
- Resend code option (rate-limited UI)
- Countdown timer for code expiry
- Error messages for invalid/expired codes
- Max attempt warning

---

#### `DashboardPage`
Layout: Hero section → Sections grid

| Section | Content |
|---|---|
| **Welcome Banner** | Personalized greeting, upcoming booking preview |
| **Featured Restaurants** | Top-rated or curated partner restaurants (horizontal scroll cards) |
| **Active Offers** | Current running offers (carousel or grid) |
| **Nearby Restaurants** | Distance-sorted from Bennett (up to 5, "View all" → discover) |
| **Popular Now** | High-booking-volume restaurants |

---

#### `DiscoverPage`
Layout: Sidebar filters + Main content (list/map toggle)

**Left Sidebar:**
- Search bar (name/cuisine)
- Cuisine type filter (checkbox list)
- Price range filter (radio: $, $$, $$$)
- Minimum rating filter (star selector)
- Max distance slider (km)
- Availability toggle (open now / available today)
- Sort: Distance | Rating | Name

**Main Content — List View:**
- Paginated restaurant cards
- Each card: image, name, cuisine, price range, distance, rating, open status, quick-book CTA

**Main Content — Map View:**
- Leaflet map centered on Bennett University
- Custom pin markers for restaurants
- Click pin → popover with restaurant name, rating, distance, "View" button
- Sidebar still available for filtering

---

#### `RestaurantDetailPage`
URL: `/restaurants/:id`

**Sections:**
1. **Header:** Hero image gallery (carousel), name, cuisine, price range, rating summary, hours, address
2. **Quick Actions:** Pre-book button, save/favorite, share
3. **About:** Description, contact info, map embed
4. **Offers:** Active offer cards with validity and terms (accordion)
5. **Menu:** Category tabs → item cards (image, name, description, price, availability badge)
6. **Reviews:** Average rating breakdown (5/4/3/2/1 bar chart), review list with pagination

**Sticky Footer (mobile):** Pre-book button

---

#### `BookingPage`
URL: `/restaurants/:id/book`

**Step-by-step flow:**

```
Step 1: Select Date
  → Calendar picker
  → Only dates with available slots enabled

Step 2: Select Time Slot
  → Filtered available time slots for selected date
  → Show remaining capacity

Step 3: Guest Count
  → Number input (min 1, max restaurant capacity)

Step 4: Special Request (Optional)
  → Text area, 500 char limit

Step 5: Confirm
  → Summary card: restaurant, date, time, guests, special request
  → "Confirm Booking" button
  → Legal disclaimer (no payment, no table selection)
```

**Post-booking:**
- Success screen with booking code
- Links to "View Booking" and "Back to restaurant"

---

#### `BookingsPage`
Tabs: **Upcoming** | **Past** | **Cancelled**

Each booking card shows:
- Booking code, restaurant name, date/time, guest count
- Status badge (color-coded)
- Action buttons based on status (Cancel if PENDING/CONFIRMED)

---

#### `BookingDetailPage`
- Full booking information
- Status timeline visualization
- Special request display
- Cancel button (if eligible)
- Link to leave a review (if COMPLETED and eligible)

---

#### `ProfilePage`
- Display name, email (read-only), institution
- Edit: display name (allowed)
- Change password section
- Verification status badge

---

#### `NotificationsPage`
- List of all notifications
- Unread indicator
- Mark all as read button
- Filter by type (booking, offer, verification)
- Click → navigate to relevant page

---

### 4.3 Component Library (User Portal)

| Component | Description |
|---|---|
| `RestaurantCard` | Discovery list card with image, name, rating, distance, status |
| `MapView` | Leaflet map wrapper with restaurant pins |
| `BookingStatusBadge` | Color-coded status pill |
| `StarRating` | Display and interactive star rating component |
| `ReviewCard` | User review with rating, text, date, author |
| `OfferCard` | Offer title, discount, validity, terms accordion |
| `MenuItemCard` | Menu item with image, name, price, availability |
| `TimeSlotPicker` | Available slot grid for booking |
| `DatePicker` | Calendar with available date highlighting |
| `NotificationItem` | Notification row with type icon and timestamp |
| `FilterSidebar` | Collapsible discovery filter panel |
| `PageLoader` | Full-page loading skeleton |
| `EmptyState` | Illustrated empty state with CTA |
| `ErrorBoundary` | Graceful error display |
| `Toast` | Success/error/info toast notifications |

---

## 5. Management Portal

### 5.1 Layout

```
┌─────────────────────────────────────────┐
│  Sidebar (role-aware nav)               │
│  ┌──────────────────────────────────┐   │
│  │  Logo + Role badge               │   │
│  │  Nav items (role-filtered)       │   │
│  │  ...                             │   │
│  │  Logout                          │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Main Content Area                      │
│  [Topbar: breadcrumb, notifications,    │
│           user avatar]                  │
│                                         │
│  [Page Content]                         │
└─────────────────────────────────────────┘
```

### 5.2 Role-Based Navigation

| Nav Item | Super Admin | Admin | Restaurant Staff |
|---|---|---|---|
| Dashboard | Allowed | Allowed | Allowed |
| Institutions | Allowed | — | — |
| Users | Allowed | — | — |
| Restaurants | Allowed | Allowed (Assigned) | — |
| Menu | — | Allowed | — |
| Offers | — | Allowed | — |
| Bookings | Allowed | Allowed | Allowed |
| Staff | — | Allowed | — |
| Analytics | Allowed | Allowed | — |
| Reviews | Allowed | Allowed (View) | — |
| Platform Settings | Allowed | — | — |

---

### 5.3 Super Admin Pages

#### `SuperAdmin/DashboardPage`
- Platform stats: total users, restaurants, bookings today
- Pending user approvals queue (quick actions: approve/reject)
- Pending restaurant approvals queue
- Recent platform activity log
- Key metrics cards

#### `SuperAdmin/InstitutionsPage`
- Table: institution name, domain, status, restaurants count, user count
- Actions: Add institution, edit, activate/suspend
- Per-institution detail drawer/modal

#### `SuperAdmin/UsersPage`
- Searchable, filterable user table
- Filters: status (pending/verified/suspended), role, institution
- Row actions: approve, reject, suspend, reactivate
- Bulk actions: bulk approve pending users

#### `SuperAdmin/RestaurantsPage`
- All restaurants with status filter
- Actions per restaurant: approve, reject, suspend, view detail
- Restaurant creation form (owner assignment)

#### `SuperAdmin/BookingsPage`
- Platform-wide booking list with filters
- Filters: date range, status, restaurant, institution

#### `SuperAdmin/ReviewsModerationPage`
- All reviews with status filter
- Remove/hide review action

#### `SuperAdmin/AnalyticsPage`
- Platform-level metrics: registrations, bookings, conversion rates
- Charts: registrations over time, bookings over time, top restaurants

---

### 5.4 Admin Pages

#### `Admin/DashboardPage`
- My restaurant(s) summary cards
- Today's bookings count + pending confirmations
- Recent analytics snapshot (bookings this week, avg rating)
- Quick links: manage menu, manage offers

#### `Admin/RestaurantProfilePage`
- Edit: name, description, images, cuisine, address, phone, hours, price range
- Image upload (gallery)
- Operating hours editor (day × open/close time)

#### `Admin/MenuPage`
- Category tabs with drag-and-drop reorder
- Item cards per category: image, name, price, availability toggle
- Add/Edit/Delete category and item modals
- Bulk availability toggle

#### `Admin/OffersPage`
- Offer cards with status badge (Draft/Active/Inactive/Expired)
- Create/Edit offer form: title, description, discount type/value, validity dates, terms
- Activate/deactivate/delete actions

#### `Admin/AvailabilityPage`
- Weekly calendar view
- Per-slot configuration: start time, end time, capacity
- Bulk slot creation tool (repeat pattern)

#### `Admin/BookingsPage`
- Restaurant-scoped booking list
- Filters: date, status
- Row actions: confirm, reject, mark complete, mark no-show

#### `Admin/StaffPage`
- Staff list (name, email, status)
- Add staff (link existing user or create account)
- Activate/deactivate staff membership

#### `Admin/AnalyticsPage`
- Date range picker
- Charts:
  - Booking volume over time (line chart)
  - Booking status breakdown (donut chart)
  - Popular time slots (heat map)
  - Restaurant views over time (line chart)
  - Offer engagement (bar chart)
- KPI cards: total bookings, completion rate, avg rating, no-show rate

#### `Admin/ReviewsPage`
- Review list for restaurant (read-only view)
- Rating summary visualization

---

### 5.5 Restaurant (Staff) Pages

#### `Restaurant/DashboardPage`
- Today's date headline
- Today's bookings: count, upcoming, pending confirmations
- Quick filter: pending vs all

#### `Restaurant/BookingsPage`
- Booking list: filtered to assigned restaurant
- Default view: today's bookings
- Tabs: Pending | Upcoming | Today | All
- Each row: booking code, user name, time, guest count, special request, status, actions
- Actions (role-permitted): Confirm, Reject, Complete, No-Show

#### `Restaurant/BookingDetailPage`
- Full booking detail
- Special request prominently displayed
- Status action buttons

---

### 5.6 Shared Management Components

| Component | Description |
|---|---|
| `DataTable` | Sortable, filterable, paginated table |
| `StatusBadge` | Generic status pill (booking, restaurant, user, offer) |
| `ConfirmDialog` | Confirmation modal for destructive actions |
| `ImageUploader` | Drag-and-drop image uploader with preview |
| `RichDatePicker` | Date range picker for filters/offers |
| `AnalyticsChart` | Recharts/Chart.js wrappers for line, bar, donut charts |
| `FormModal` | Standardized modal with form footer actions |
| `SidebarNav` | Role-filtered navigation sidebar |
| `TopBar` | Breadcrumb + notification bell + avatar menu |
| `QuickStatCard` | KPI metric card with trend indicator |
| `EmptyState` | Illustrated empty state |
| `SkeletonLoader` | Content placeholder during load |

---

## 6. State Management Architecture

```
AuthContext
├── user (id, name, email, role, verificationStatus)
├── tokens (accessToken, refreshToken)
├── isAuthenticated
└── actions: login, logout, refresh

NotificationContext
├── notifications (list)
├── unreadCount
└── actions: markRead, markAllRead

// Server state via React Query
useRestaurants(filters)
useRestaurant(id)
useBookings(filters)
useBooking(id)
useOffers(restaurantId)
useMenu(restaurantId)
useAnalytics(restaurantId, dateRange)
```

---

## 7. API Client Design

```javascript
// packages/api-client/index.js
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401, token refresh
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshAccessToken();
      return apiClient(error.config); // Retry original request
    }
    return Promise.reject(error);
  }
);
```

---

## 8. Responsive Design Requirements

| Breakpoint | Target Devices |
|---|---|
| < 640px | Mobile phones |
| 640–1024px | Tablets |
| > 1024px | Desktop / laptop |

### Mobile Considerations
- Hamburger menu for sidebar navigation
- Map view defaults to list on mobile (map toggleable)
- Booking flow uses full-screen step flow on mobile
- Touch-friendly tap targets (min 44×44px)
- Bottom navigation bar on mobile for User Portal

---

## 9. Accessibility Requirements

- Semantic HTML5 elements throughout
- All interactive elements keyboard-accessible
- Focus management in modals and dialogs
- `aria-label` on icon-only buttons
- Color contrast ratio ≥ 4.5:1 (WCAG AA)
- Screen reader support for status changes
- Form fields with proper `<label>` associations
- Loading states announced via `aria-live`

---

## 10. Performance Requirements

| Metric | Target |
|---|---|
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Bundle size (initial) | < 300KB gzipped |
| Image optimization | WebP format, lazy loading, responsive `srcset` |
| API data caching | React Query stale time: 5 minutes for static data |

---

## 11. SEO (User Portal)

- `<title>` and `<meta name="description">` per page
- Semantic heading hierarchy (single `<h1>` per page)
- Open Graph tags for restaurant pages
- Server-side rendering or static generation for restaurant detail pages (if applicable)
- Sitemap for discoverable restaurant pages

---

## 12. Pre-Designed Complete Flow States (Resilient UX Architecture)

To ensure users never encounter a jarring disruption or broken navigation loop, all views across both portals must implement these seven dedicated state screens built with Lucide icons, soft muted palettes, and micro-animations.

### 12.1 Empty State (`EmptyState`)
- **Visual:** Contained card with soft stone background (`bg-gray-100/60`), muted Lucide icon in subtle primary circle (`bg-primary-subtle`), smooth entry fade-in.
- **Icon:** `<Inbox className="w-8 h-8 text-primary" />` or domain-specific Lucide icon (`<UtensilsCrossed />`, `<Ticket />`, `<BellOff />`).
- **Content:** Warm, encouraging heading (e.g., "No upcoming bookings yet"), supporting two-line description explaining how to get started.
- **Action:** Primary tactile action CTA button (e.g., "Explore Nearby Restaurants") with hover elevation.

### 12.2 Loading State (`LoadingSkeletonState`)
- **Visual:** Dimension-accurate skeleton blocks matching the final layout geometry to completely eliminate Cumulative Layout Shift (CLS).
- **Animation:** Continuous subtle wave shimmer (`animate-pulse` or CSS `shimmerWave`) on soft gray surfaces (`bg-gray-200/70`).
- **Behavior:** Skeletons for restaurant cards, table rows, and dashboard metrics; spinner restricted strictly to in-button submission spinners (`<Loader2 className="w-4 h-4 animate-spin" />`).

### 12.3 Error State (`ErrorState`)
- **Visual:** Muted terracotta/dusty rose alert panel (`border-error-subtle bg-error-subtle/30`), gentle scale-in transition.
- **Icon:** `<AlertCircle className="w-8 h-8 text-error" />`.
- **Content:** Clear human-friendly error headline ("We couldn't load this information"), technical error reference code in small monospace, and reassuring guidance.
- **Actions:** Dual CTAs: Primary "Try Again" button (retries data fetch) and secondary subtle link "Return to Home".

### 12.4 No Internet / Offline State (`OfflineState` & `OfflineBanner`)
- **Visual:**
  - **Ambient Banner:** Persistent top banner with soft amber/slate tone when `navigator.onLine === false`: `<WifiOff className="w-4 h-4" />` "You are currently offline. Some features may be unavailable."
  - **Full Screen (on failed query):** Clean offline illustration, Lucide `<WifiOff className="w-12 h-12 text-gray-400" />`.
- **Content:** "Connection Lost. Please check your internet connection."
- **Behavior:** Auto-reconnect listener that transparently invalidates queries and refreshes the view the moment connectivity resumes.

### 12.5 No Search Results State (`NoSearchResultsState`)
- **Visual:** Soft, calm feedback panel centered in the discovery grid.
- **Icon:** `<SearchX className="w-10 h-10 text-gray-400" />`.
- **Content:** Heading "No matching restaurants found" with message "Try loosening your filters, changing cuisine, or expanding search radius."
- **Interactive Helpers:** Clickable filter tag pills showing active filters with `<X className="w-3 h-3" />` removal, plus a prominent "Reset All Filters" button.

### 12.6 Permission Denied / 403 State (`PermissionDeniedState`)
- **Visual:** Prestigious institutional boundary screen with high-contrast typography and subtle frosted border.
- **Icon:** `<ShieldAlert className="w-10 h-10 text-primary" />`.
- **Content:** Headline "Access Restricted" with explanation "Your account (`USER` or staff role) is not authorized to access this restaurant management resource."
- **Actions:** "Go to User Dashboard" or "Switch Account / Log In with Different Credentials".

### 12.7 Success State (`SuccessConfirmationState`)
- **Visual:** Elegant celebration card with soft sage green ring (`bg-success-subtle text-success`), tactile elevation, and micro-confetti or soft checkmark draw animation.
- **Icon:** `<CheckCircle2 className="w-10 h-10 text-success" />`.
- **Content:** Booking code prominently highlighted in monospace card (e.g. `BEN-84920`), formatted date, time, guest count, and restaurant address.
- **Actions:** Primary CTA "View My Bookings" and secondary CTA "Back to Restaurant Page" or "Download Booking Slip" (`<Download className="w-4 h-4" />`).

---

## 13. Testing & Verification Policy (Manual Operator Protocol)

> [!IMPORTANT]
> **Strict Project Policy — No Browser Automations**:
> - Automated browser testing subagents / headless browser automations are **strictly prohibited** across all phases of this project.
> - All UI/UX flows, visual layouts, micro-animations, responsive behaviors, and state transitions are **verified manually by the human operator**.
> - Automated tooling is restricted solely to command-line builds (`vite build`), linter checks (`oxlint`), API integration tests, and database schema validation.

---

*Document version: V1.0 | Date: 02/09/2026*
*Prepared by NIVIXPE PRIVATE LIMITED | CIN: U66190TS2025PTC204828 | DPIIT: DIPP233979*
*Document Reference: NPL-PRD/2026/01*
