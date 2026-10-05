/**
 * Dine@Bennett Central API Client
 * Connects frontend to Express + SQLite backend with JWT authentication
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  return {};
}

let refreshInFlight = null;

async function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = request('/auth/refresh', { method: 'POST', _skipRefresh: true })
      .catch((err) => {
        throw err;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function handleOfflineFallback(endpoint, options = {}) {
  // Authentication, payment, and booking state mutations must NEVER have offline fallbacks or hardcoded credentials
  if (endpoint.startsWith('/auth') || options.method === 'POST' || options.method === 'PATCH' || options.method === 'DELETE') {
    return null;
  }

  let body = {};
  if (options.body) {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  // 6. Data Endpoints Fallbacks (Offline & Static Hosting Mode)
  if (endpoint.startsWith('/restaurants')) {
    const singleMatch = endpoint.match(/\/restaurants\/(\d+)/);
    let allRest = [];
    try {
      allRest = JSON.parse(localStorage.getItem('dine_bennett_restaurants') || '[]');
    } catch {
      allRest = [];
    }

    if (singleMatch) {
      const restId = Number(singleMatch[1]);
      const found = allRest.find(r => Number(r.id) === restId);
      if (found) {
        return { success: true, data: found };
      }
      return { success: false, error: 'Restaurant not found' };
    }

    return {
      success: true,
      data: allRest
    };
  }

  if (endpoint.startsWith('/offers')) {
    return {
      success: true,
      data: [
        {
          id: 'off-1',
          code: 'BENNETT20',
          title: 'Flat 20% Off for Verified Students',
          description: 'Show Bennett Student passkey to redeem 20% discount on total billing across all partner restaurants.',
          discountPercentage: 20,
          maxDiscount: 150,
          minBill: 300,
          active: true,
          expiryDate: '2026-12-31'
        },
        {
          id: 'off-2',
          code: 'FARM15',
          title: 'Farm-to-Table Seasonal Special',
          description: '15% instant off on organic bowls and seasonal farm specials.',
          discountPercentage: 15,
          maxDiscount: 100,
          minBill: 250,
          active: true,
          expiryDate: '2026-12-31'
        }
      ]
    };
  }

  if (endpoint.startsWith('/institutions')) {
    return {
      success: true,
      data: [
        {
          id: 'inst-1',
          name: 'Bennett University',
          domain: '@bennett.edu.in',
          location: 'Plot 8-11, TechZone II, Greater Noida, UP 201310',
          activeUsers: 3420,
          status: 'ACTIVE'
        }
      ]
    };
  }

  if (endpoint.startsWith('/tables')) {
    return {
      success: true,
      data: [
        { id: 1, tableNumber: 'T1', capacity: 2, isOccupied: false, currentGuest: null },
        { id: 2, tableNumber: 'T2', capacity: 4, isOccupied: true, currentGuest: 'Aarav Sharma' },
        { id: 3, tableNumber: 'T3', capacity: 4, isOccupied: false, currentGuest: null },
        { id: 4, tableNumber: 'T4', capacity: 6, isOccupied: false, currentGuest: null },
        { id: 5, tableNumber: 'T5', capacity: 2, isOccupied: false, currentGuest: null },
        { id: 6, tableNumber: 'T6', capacity: 8, isOccupied: false, currentGuest: null }
      ]
    };
  }

  if (endpoint.startsWith('/notifications')) {
    return {
      success: true,
      data: []
    };
  }

  if (endpoint.startsWith('/superadmin/clearance-queue')) {
    return {
      success: true,
      data: [
        {
          id: 'clear-1',
          email: 'sahith@bennett.edu.in',
          name: 'Sahith',
          program: 'B.Tech CSE',
          rollNumber: 'E22CSEU0482',
          institution: 'Bennett University',
          status: 'PENDING',
          submittedAt: new Date().toISOString()
        }
      ]
    };
  }

  if (endpoint.startsWith('/superadmin/stats')) {
    return {
      success: true,
      data: {
        totalUsers: 3420,
        verifiedStudents: 2940,
        activeReservations: 18,
        totalBookings: 840,
        partnerRestaurants: 4,
        totalRevenue: 245000
      }
    };
  }

  if (endpoint === '/superadmin/restaurants' && options.method === 'POST') {
    const newRest = {
      id: Date.now(),
      name: body?.name,
      cuisine: body?.cuisine,
      price: body?.price || '₹₹',
      address: body?.address,
      phone: body?.phone,
      hours: body?.hours || '11:00 AM – 11:00 PM',
      capacity: Number(body?.capacity) || 40,
      image: body?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      heroImage: body?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reviews: 1,
      isOpen: true,
      hasOffer: true,
      offerLabel: '15% Off',
      ownerEmail: body?.ownerEmail,
      ownerName: body?.ownerName || `${body?.name} Owner`
    };

    try {
      const existingRests = JSON.parse(localStorage.getItem('dine_bennett_restaurants') || '[]');
      localStorage.setItem('dine_bennett_restaurants', JSON.stringify([newRest, ...existingRests]));
    } catch {
      // ignore
    }

    if (body?.ownerEmail) {
      try {
        const users = JSON.parse(localStorage.getItem('dine_bennett_all_users') || '[]');
        const newOwner = {
          id: `usr-owner-${Date.now()}`,
          name: body.ownerName || `${body.name} Owner`,
          email: body.ownerEmail.toLowerCase().trim(),
          password: body.ownerPassword || 'password123',
          role: 'RESTAURANT_ADMIN',
          department: body.name,
          restaurantId: newRest.id,
          verified: true
        };
        localStorage.setItem('dine_bennett_all_users', JSON.stringify([newOwner, ...users]));
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      message: `Restaurant "${newRest.name}" successfully onboarded.`,
      data: newRest
    };
  }

  // 7. Bookings Resilient Fallback (Multi-User & Multi-Role Local Sync)
  if (endpoint.startsWith('/bookings')) {
    const getStoredBookings = () => {
      try {
        const raw = localStorage.getItem('dine_bennett_reservations');
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
      return [];
    };

    const saveStoredBookings = (list) => {
      try {
        localStorage.setItem('dine_bennett_reservations', JSON.stringify(list));
        window.dispatchEvent(new Event('dining_reservations_updated'));
      } catch {
        // ignore
      }
    };

    // POST /bookings
    if (options.method === 'POST') {
      const current = getStoredBookings();
      const randomCode = `DB-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking = {
        ...body,
        id: body.id || randomCode,
        status: body.status || 'CONFIRMED',
        createdAt: new Date().toISOString(),
        tableAssigned: null,
        orders: (body.orders || []).map(o => ({ ...o, qty: o.quantity || o.qty || 1 })),
        qrCode: body.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${body.id || randomCode}-BENNETT-VERIFIED`
      };
      const updated = [newBooking, ...current.filter(b => b.id !== newBooking.id)];
      saveStoredBookings(updated);
      return { success: true, data: newBooking };
    }

    // PATCH /bookings/:id/status
    const statusMatch = endpoint.match(/\/bookings\/([^/]+)\/status/);
    if (statusMatch) {
      const targetId = statusMatch[1];
      const current = getStoredBookings();
      let matched = null;
      const updated = current.map(b => {
        if (b.id === targetId) {
          matched = { ...b, status: body.status || 'SEATED', tableAssigned: null };
          return matched;
        }
        return b;
      });
      saveStoredBookings(updated);
      return { success: true, data: matched || { id: targetId, status: body.status } };
    }

    // PATCH /bookings/:id/cancel
    const cancelMatch = endpoint.match(/\/bookings\/([^/]+)\/cancel/);
    if (cancelMatch) {
      const targetId = cancelMatch[1];
      const current = getStoredBookings();
      const updated = current.map(b => b.id === targetId ? { ...b, status: 'CANCELLED' } : b);
      saveStoredBookings(updated);
      return { success: true, data: { id: targetId, status: 'CANCELLED' } };
    }

    // POST /bookings/:id/orders
    const ordersMatch = endpoint.match(/\/bookings\/([^/]+)\/orders/);
    if (ordersMatch) {
      const targetId = ordersMatch[1];
      const current = getStoredBookings();
      let matched = null;
      const updated = current.map(b => {
        if (b.id === targetId) {
          const existing = (b.orders || []).find(o => o.name === body.name);
          let updatedOrders;
          if (existing) {
            updatedOrders = b.orders.map(o => o.name === body.name ? { ...o, qty: (o.qty || o.quantity || 1) + (body.quantity || 1) } : o);
          } else {
            updatedOrders = [...(b.orders || []), { id: `ord-${Date.now()}`, name: body.name, price: Number(body.price), qty: Number(body.quantity || 1) }];
          }
          matched = { ...b, orders: updatedOrders };
          return matched;
        }
        return b;
      });
      saveStoredBookings(updated);
      return { success: true, data: matched || { id: targetId } };
    }

    // GET /bookings or GET /bookings/my
    return {
      success: true,
      data: getStoredBookings()
    };
  }

  // 7b. Payments Settle Fallback
  if (endpoint.startsWith('/payments/')) {
    const settleMatch = endpoint.match(/\/payments\/([^/]+)\/settle/);
    if (settleMatch) {
      const bookingId = settleMatch[1];
      const raw = localStorage.getItem('dine_bennett_reservations');
      let bookings = [];
      try {
        if (raw) bookings = JSON.parse(raw);
      } catch {
        // ignore
      }
      const txnId = `TXN-${body?.method || 'UPI'}-${Math.floor(100000 + Math.random() * 900000)}`;
      const updatedBookings = bookings.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'COMPLETED',
            payment: {
              method: body?.method || 'UPI',
              amount: body?.totalAmount,
              transactionId: txnId,
              billedBy: body?.billedBy
            }
          };
        }
        return b;
      });
      try {
        localStorage.setItem('dine_bennett_reservations', JSON.stringify(updatedBookings));
        window.dispatchEvent(new Event('dining_reservations_updated'));
      } catch {
        // ignore
      }
      return {
        success: true,
        message: 'Payment settled successfully',
        data: {
          payment: {
            bookingId,
            method: body?.method || 'UPI',
            transactionId: txnId,
            status: 'PAID',
            totalAmount: body?.totalAmount,
            billedBy: body?.billedBy
          }
        }
      };
    }
  }

  // 7. Profile Updates Fallback
  if (endpoint === '/users/profile') {
    try {
      const rawUser = localStorage.getItem('dine_bennett_user');
      const currentUser = rawUser ? JSON.parse(rawUser) : {};
      const updatedUser = {
        ...currentUser,
        ...(body.name ? { name: body.name } : {}),
        ...(body.avatar !== undefined ? { avatar: body.avatar } : {}),
        ...(body.department !== undefined ? { department: body.department } : {}),
        ...(body.rollNumber !== undefined ? { rollNumber: body.rollNumber } : {})
      };
      localStorage.setItem('dine_bennett_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
      return { success: true, data: updatedUser, message: 'Profile updated successfully' };
    } catch {
      return { success: true, data: body, message: 'Profile updated' };
    }
  }

  // 8. Payment QRs Fallback
  if (endpoint.includes('/payment-qrs')) {
    const restMatch = endpoint.match(/\/restaurants\/(\d+)\/payment-qrs/);
    const restId = restMatch ? restMatch[1] : '1';
    const storageKey = `dine_bennett_payment_qrs_${restId}`;

    const getDefaultQrs = () => [
      {
        id: 'qr-spicegarden-1',
        label: 'Primary Counter UPI (GPay / PhonePe / Paytm)',
        upiId: 'spicegarden.dining@icici',
        image: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=spicegarden.dining@icici&pn=The%20Spice%20Garden',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'qr-spicegarden-2',
        label: 'Express Self-Kiosk UPI',
        upiId: 'spicegarden.kiosk@icici',
        image: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=spicegarden.kiosk@icici&pn=Spice%20Garden%20Express',
        isActive: false,
        createdAt: new Date().toISOString()
      }
    ];

    const getStoredQrs = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
      return getDefaultQrs();
    };

    const saveQrs = (list) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(list));
      } catch {
        // ignore
      }
    };

    // GET /restaurants/:id/payment-qrs
    if (!options.method || options.method === 'GET') {
      return { success: true, data: getStoredQrs() };
    }

    // POST .../set-active
    const setActiveMatch = endpoint.match(/\/payment-qrs\/([^/]+)\/set-active/);
    if (setActiveMatch) {
      const qrId = setActiveMatch[1];
      const qrs = getStoredQrs().map(q => ({ ...q, isActive: q.id === qrId }));
      saveQrs(qrs);
      return { success: true, message: 'Active payment QR updated', data: qrs.find(q => q.id === qrId) };
    }

    // POST /restaurants/:id/payment-qrs (create)
    if (options.method === 'POST') {
      const current = getStoredQrs();
      const isFirst = current.length === 0;
      const makeActive = body.isActive !== undefined ? Boolean(body.isActive) : isFirst;
      if (makeActive) {
        current.forEach(q => q.isActive = false);
      }
      const newQr = {
        id: `qr-${restId}-${Date.now().toString(36)}`,
        label: body.label || 'Dining Counter QR',
        upiId: body.upiId || 'dining@upi',
        image: body.image || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(body.upiId || 'dining@upi')}`,
        isActive: makeActive,
        createdAt: new Date().toISOString()
      };
      const updated = [newQr, ...current];
      saveQrs(updated);
      return { success: true, message: 'Payment QR added successfully', data: newQr };
    }

    // PATCH /restaurants/:id/payment-qrs/:qrId
    const editMatch = endpoint.match(/\/payment-qrs\/([^/]+)$/);
    if (options.method === 'PATCH' && editMatch) {
      const qrId = editMatch[1];
      const current = getStoredQrs();
      let edited = null;
      if (body.isActive) {
        current.forEach(q => q.isActive = false);
      }
      const updated = current.map(q => {
        if (q.id === qrId) {
          edited = {
            ...q,
            ...(body.label ? { label: body.label } : {}),
            ...(body.upiId ? { upiId: body.upiId } : {}),
            ...(body.image ? { image: body.image } : {}),
            ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {})
          };
          return edited;
        }
        return q;
      });
      saveQrs(updated);
      return { success: true, message: 'Payment QR updated successfully', data: edited };
    }

    // DELETE /restaurants/:id/payment-qrs/:qrId
    if (options.method === 'DELETE' && editMatch) {
      const qrId = editMatch[1];
      let current = getStoredQrs();
      const wasActive = current.find(q => q.id === qrId)?.isActive;
      current = current.filter(q => q.id !== qrId);
      if (wasActive && current.length > 0) {
        current[0].isActive = true;
      }
      saveQrs(current);
      return { success: true, message: 'Payment QR deleted successfully' };
    }
  }

  // 9. Staff Fallback
  if (endpoint.includes('/staff')) {
    let storedStaff = [];
    try {
      storedStaff = JSON.parse(localStorage.getItem('dine_bennett_staff') || '[]');
    } catch {
      storedStaff = [];
    }
    return {
      success: true,
      data: storedStaff
    };
  }

  // 10. Analytics Fallback
  if (endpoint.includes('/analytics')) {
    return {
      success: true,
      data: {
        totalRevenue: 28450,
        completedBookings: 18,
        activeDiners: 6,
        popularDishes: ['Butter Chicken', 'Paneer Tikka', 'Garlic Naan'],
        peakHour: '1:30 PM'
      }
    };
  }

  // 11. Reviews Fallback
  if (endpoint.includes('/reviews')) {
    return {
      success: true,
      count: 0,
      total: 0,
      avgRating: 4.8,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      data: []
    };
  }

  return null;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const { _skipRefresh, ...fetchOptions } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...fetchOptions.headers
  };

  let response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include'
    });
  } catch (networkErr) {
    if (endpoint.startsWith('/auth') || fetchOptions.method === 'POST' || fetchOptions.method === 'PATCH' || fetchOptions.method === 'DELETE') {
      throw new Error('Unable to connect to the dining server. Please verify your network connection.');
    }
    const fallback = handleOfflineFallback(endpoint, fetchOptions);
    if (fallback) return fallback;
    throw new Error('Unable to reach the campus dining server. Please verify your connection.');
  }

  if (response.status === 401 && !_skipRefresh && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    try {
      await refreshSession();
      return request(endpoint, { ...options, _skipRefresh: true });
    } catch {
      // Refresh also failed — the server already cleared cookies via clearAuthCookies().
      // AuthContext's validateSession catch will update UI state on next render.
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    throw new Error(`Server returned non-JSON response (${response.status})`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Failed to parse response from server');
  }

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}: Request failed`);
  }

  return data;
}

export const api = {
  // Authentication & RBAC
  auth: {
    login: (email, password, roleHint) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, roleHint }) }),
    sendOtp: (email) =>
      request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyOtp: (email, otp, name) =>
      request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp, name }) }),
    googleLogin: (userData) =>
      request('/auth/google', { method: 'POST', body: JSON.stringify(userData || {}) }),
    logout: () =>
      request('/auth/logout', { method: 'POST' }),
    refresh: () =>
      request('/auth/refresh', { method: 'POST', _skipRefresh: true }),
    register: (userData) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () =>
      request('/auth/me'),
    verifyCode: (code, email) =>
      request('/auth/verify-code', { method: 'POST', body: JSON.stringify({ code, email }) }),
    switchRole: (role) =>
      request('/auth/switch-role', { method: 'POST', body: JSON.stringify({ role }) })
  },

  // Super Admin Governance
  superadmin: {
    getClearanceQueue: () =>
      request('/superadmin/clearance-queue'),
    sendCode: (applicantId) =>
      request('/superadmin/send-code', { method: 'POST', body: JSON.stringify({ applicantId }) }),
    approveApplicant: (id) =>
      request(`/superadmin/approve/${id}`, { method: 'POST' }),
    getStats: () =>
      request('/superadmin/stats'),
    getInstitutions: () =>
      request('/superadmin/institutions'),
    getAuditLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/superadmin/audit-logs${query ? `?${query}` : ''}`);
    },
    getPlatformAnalytics: () =>
      request('/superadmin/analytics/platform'),
    createRestaurant: (data) =>
      request('/superadmin/restaurants', { method: 'POST', body: JSON.stringify(data) }),
    toggleRestaurantStatus: (id, isOpen) =>
      request(`/superadmin/restaurants/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isOpen }) }),
    deleteRestaurant: (id) =>
      request(`/superadmin/restaurants/${id}`, { method: 'DELETE' }),
    getAllReviews: () =>
      request('/reviews'),
    moderateReview: (id, status) =>
      request(`/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  },

  // Users Directory & Role Management
  users: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/users${query ? `?${query}` : ''}`);
    },
    getById: (id) =>
      request(`/users/${id}`),
    toggleVerify: (id, verified) =>
      request(`/users/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ verified }) }),
    updateRole: (id, role, restaurantId = null) =>
      request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role, restaurantId }) }),
    updateProfile: (data) =>
      request('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) =>
      request(`/users/${id}`, { method: 'DELETE' })
  },

  // Institutions Management
  institutions: {
    getAll: () =>
      request('/institutions'),
    getById: (id) =>
      request(`/institutions/${id}`),
    create: (data) =>
      request('/institutions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) =>
      request(`/institutions/${id}`, { method: 'DELETE' })
  },

  // Offers & Promotions Lifecycle
  offers: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/offers${query ? `?${query}` : ''}`);
    },
    getById: (id) =>
      request(`/offers/${id}`),
    create: (data) =>
      request('/offers', { method: 'POST', body: JSON.stringify(data) }),
    toggleStatus: (id, status) =>
      request(`/offers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id) =>
      request(`/offers/${id}`, { method: 'DELETE' })
  },

  // Restaurant Staff Management
  staff: {
    getByRestaurant: (restaurantId) =>
      request(`/restaurants/${restaurantId}/staff`),
    assign: (restaurantId, data) =>
      request(`/restaurants/${restaurantId}/staff`, { method: 'POST', body: JSON.stringify(data) }),
    remove: (restaurantId, userId) =>
      request(`/restaurants/${restaurantId}/staff/${userId}`, { method: 'DELETE' })
  },

  // Operational & Platform Analytics
  analytics: {
    getRestaurant: (restaurantId) =>
      request(`/restaurants/${restaurantId}/analytics`),
    getPlatform: () =>
      request('/superadmin/analytics/platform')
  },

  // Restaurants & Menus
  restaurants: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/restaurants${query ? `?${query}` : ''}`);
    },
    getById: (id) =>
      request(`/restaurants/${id}`),
    getAnalytics: (id) =>
      request(`/restaurants/${id}/analytics`),
    addMenuItem: (restaurantId, itemData) =>
      request(`/restaurants/${restaurantId}/menu`, { method: 'POST', body: JSON.stringify(itemData) }),
    updateMenuItem: (restaurantId, itemId, data) =>
      request(`/restaurants/${restaurantId}/menu/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteMenuItem: (restaurantId, itemId) =>
      request(`/restaurants/${restaurantId}/menu/${itemId}`, { method: 'DELETE' })
  },

  // Tables
  tables: {
    getAll: (restaurantId = 1) =>
      request(`/tables?restaurantId=${restaurantId}`),
    updateOccupancy: (id, data) =>
      request(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  },

  // Bookings & Lifecycle
  bookings: {
    getAll: () =>
      request('/bookings'),
    getMy: () =>
      request('/bookings/my'),
    create: (bookingData) =>
      request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
    cancel: (id) =>
      request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
    updateStatus: (id, status, tableAssigned) =>
      request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, tableAssigned }) }),
    addOrder: (bookingId, item) =>
      request(`/bookings/${bookingId}/orders`, { method: 'POST', body: JSON.stringify(item) })
  },

  // Verified Institutional Reviews
  reviews: {
    getByRestaurant: (restaurantId) =>
      request(`/restaurants/${restaurantId}/reviews`),
    create: (restaurantId, data) =>
      request(`/restaurants/${restaurantId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
    markHelpful: (reviewId) =>
      request(`/reviews/${reviewId}/helpful`, { method: 'PATCH' }),
    updateStatus: (reviewId, status) =>
      request(`/reviews/${reviewId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (reviewId) =>
      request(`/reviews/${reviewId}`, { method: 'DELETE' })
  },

  // Payments (3 Options: UPI, Cash, Card)
  payments: {
    settle: (bookingId, paymentData) =>
      request(`/payments/${bookingId}/settle`, { method: 'POST', body: JSON.stringify(paymentData) }),
    getReceipt: (bookingId) =>
      request(`/payments/${bookingId}`)
  },

  // Payment QRs (UPI Counter Codes)
  paymentQrs: {
    getByRestaurant: (restaurantId = 1) =>
      request(`/restaurants/${restaurantId}/payment-qrs`),
    create: (restaurantId, data) =>
      request(`/restaurants/${restaurantId}/payment-qrs`, { method: 'POST', body: JSON.stringify(data) }),
    update: (restaurantId, qrId, data) =>
      request(`/restaurants/${restaurantId}/payment-qrs/${qrId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    setActive: (restaurantId, qrId) =>
      request(`/restaurants/${restaurantId}/payment-qrs/${qrId}/set-active`, { method: 'POST' }),
    delete: (restaurantId, qrId) =>
      request(`/restaurants/${restaurantId}/payment-qrs/${qrId}`, { method: 'DELETE' })
  },

  // Notifications
  notifications: {
    getAll: () =>
      request('/notifications'),
    markRead: (id) =>
      request(`/notifications/${id}/read`, { method: 'PATCH' })
  }
};

export default api;
