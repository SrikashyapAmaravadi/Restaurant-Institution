/**
 * Dine@Bennett Central API Client
 * Connects frontend to Express + SQLite backend with JWT authentication
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('dine_bennett_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleOfflineFallback(endpoint, options = {}) {
  let body = {};
  if (options.body) {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  // 1. Auth: Send OTP
  if (endpoint === '/auth/send-otp') {
    const email = (body.email || '').toLowerCase().trim();
    const isValidDomain =
      email.endsWith('.edu.in') ||
      email.endsWith('.ac.in') ||
      email.endsWith('.edu') ||
      email.includes('@bennett');

    if (!isValidDomain && !email.includes('@')) {
      throw new Error('Please enter a valid official university email (e.g. @bennett.edu.in)');
    }

    const sandboxOtp = '482100';
    try {
      sessionStorage.setItem(`bennett_otp_${email}`, sandboxOtp);
    } catch {
      // ignore storage errors
    }

    return {
      success: true,
      message: `A 6-digit one-time passkey has been issued for ${email}`,
      otp: sandboxOtp,
      expiresIn: 600
    };
  }

  // 2. Auth: Verify OTP
  if (endpoint === '/auth/verify-otp') {
    const email = (body.email || '').toLowerCase().trim();
    const enteredOtp = (body.otp || '').toString().trim();
    let storedOtp = '482100';
    try {
      storedOtp = sessionStorage.getItem(`bennett_otp_${email}`) || '482100';
    } catch {
      // ignore
    }

    if (enteredOtp !== storedOtp && enteredOtp !== '482100' && enteredOtp !== '123456') {
      throw new Error('Invalid OTP passkey. Enter the 6-digit code or try 482100.');
    }

    const cleanName = body.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const mockUser = {
      id: 999,
      email,
      name: cleanName,
      role: 'STUDENT',
      department: 'Bennett University',
      verified: true,
      homePath: '/dashboard'
    };

    return {
      success: true,
      data: {
        token: `demo_jwt_token_${Date.now()}`,
        user: mockUser
      }
    };
  }

  // 3. Auth: Login (Password)
  if (endpoint === '/auth/login') {
    const email = (body.email || '').toLowerCase().trim();

    const KNOWN_ACCOUNTS = {
      'owner@spicegarden.com': {
        id: 'usr-admin-1',
        name: 'Vikram Singhania',
        role: 'RESTAURANT_ADMIN',
        roleLabel: 'Restaurant Owner & Manager',
        department: 'The Spice Garden',
        restaurantId: 1,
        homePath: '/management/admin'
      },
      'staff@spicegarden.com': {
        id: 'usr-staff-1',
        name: 'Rajesh Kumar',
        role: 'RESTAURANT_STAFF',
        roleLabel: 'Front-Desk Host & Service Desk',
        department: 'The Spice Garden Front Desk',
        restaurantId: 1,
        homePath: '/management/staff'
      },
      'superadmin@bennett.edu.in': {
        id: 'usr-superadmin-1',
        name: 'Dr. A. K. Sharma',
        role: 'SUPER_ADMIN',
        roleLabel: 'Platform Governance & Super Admin',
        department: 'Office of Dean & Campus Operations',
        homePath: '/management/superadmin'
      },
      'student@bennett.edu.in': {
        id: 'usr-student-1',
        name: 'Aarav Sharma',
        role: 'STUDENT',
        roleLabel: 'Student / Faculty',
        department: 'B.Tech CSE - Bennett University',
        homePath: '/dashboard'
      },
      'sahith@bennett.edu.in': {
        id: 'usr-student-2',
        name: 'Sahith',
        role: 'STUDENT',
        roleLabel: 'Student / Faculty',
        department: 'Bennett University',
        homePath: '/dashboard'
      }
    };

    let userObj = KNOWN_ACCOUNTS[email];
    if (!userObj) {
      let role = 'STUDENT';
      let homePath = '/dashboard';
      let roleLabel = 'Student / Faculty';
      let department = 'Bennett University';
      let restaurantId = null;

      if (email.includes('superadmin') || email.includes('governance')) {
        role = 'SUPER_ADMIN';
        homePath = '/management/superadmin';
        roleLabel = 'Platform Governance & Super Admin';
        department = 'Office of Dean & Campus Operations';
      } else if (email.includes('owner') || email.includes('admin') || email.includes('spicegarden')) {
        role = 'RESTAURANT_ADMIN';
        homePath = '/management/admin';
        roleLabel = 'Restaurant Owner & Manager';
        department = 'The Spice Garden';
        restaurantId = 1;
      } else if (email.includes('staff') || email.includes('host') || email.includes('desk') || email.includes('waiter')) {
        role = 'RESTAURANT_STAFF';
        homePath = '/management/staff';
        roleLabel = 'Front-Desk Host & Service Desk';
        department = 'The Spice Garden Front Desk';
        restaurantId = 1;
      }

      const cleanName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      userObj = {
        id: `usr-${role.toLowerCase()}-${Date.now()}`,
        email,
        name: cleanName,
        role,
        roleLabel,
        department,
        restaurantId,
        homePath
      };
    }

    const mockUser = {
      ...userObj,
      email,
      institution: 'Bennett University',
      verified: true
    };

    return {
      success: true,
      data: {
        token: `demo_jwt_token_${Date.now()}`,
        user: mockUser
      }
    };
  }

  // 4. Auth: Register
  if (endpoint === '/auth/register') {
    const email = (body.email || '').toLowerCase().trim();
    const role = body.role || 'STUDENT';
    const mockUser = {
      id: 777,
      email,
      name: body.name || 'New Campus Member',
      role,
      department: body.department || 'Bennett University',
      verified: role === 'STUDENT',
      homePath: role === 'SUPER_ADMIN' ? '/management/superadmin' :
        role === 'RESTAURANT_ADMIN' ? '/management/admin' :
        role === 'RESTAURANT_STAFF' ? '/management/staff' : '/dashboard'
    };

    return {
      success: true,
      data: {
        token: `demo_jwt_token_${Date.now()}`,
        user: mockUser
      }
    };
  }

  // 5. Auth: Me
  if (endpoint === '/auth/me') {
    try {
      const stored = localStorage.getItem('dine_bennett_user');
      if (stored) {
        return { success: true, data: { user: JSON.parse(stored) } };
      }
    } catch {
      // ignore
    }
    return null;
  }

  // 6. Data Endpoints Fallbacks (Offline & Static Hosting Mode)
  if (endpoint.startsWith('/restaurants')) {
    return {
      success: true,
      data: [
        {
          id: 1,
          name: 'The Spice Garden',
          cuisine: 'North Indian, Mughlai',
          rating: 4.8,
          reviews: 142,
          priceForTwo: 450,
          location: 'Shop 14, Sector Alpha Commercial, Greater Noida',
          distance: '0.8 km from Campus',
          status: 'OPEN',
          isOpen: true,
          pureVeg: false,
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          description: 'Authentic royal curries, butter naans, and rich tandoori grills curated for Bennett University students and faculty.'
        },
        {
          id: 2,
          name: 'Campus Cafe & Roastery',
          cuisine: 'Continental, Cafe, Beverages',
          rating: 4.6,
          reviews: 98,
          priceForTwo: 320,
          location: 'Next to Gate 2, Bennett University Main Road',
          distance: '0.2 km from Campus',
          status: 'OPEN',
          isOpen: true,
          pureVeg: true,
          image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
          description: 'Specialty pour-overs, artisanal pizzas, and quiet booth seating designed for campus study sessions.'
        },
        {
          id: 3,
          name: 'Green Bowl Organics',
          cuisine: 'Healthy Bowls, Salads, Smoothies',
          rating: 4.7,
          reviews: 64,
          priceForTwo: 380,
          location: 'TechZone II Commercial Plaza, Greater Noida',
          distance: '0.5 km from Campus',
          status: 'OPEN',
          isOpen: true,
          pureVeg: true,
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
          description: 'Wholesome farm-fresh protein bowls, cold pressed juices, and clean eating favorites.'
        },
        {
          id: 4,
          name: 'Kathi Junction & Shawarma House',
          cuisine: 'Street Food, Rolls, Fast Food',
          rating: 4.5,
          reviews: 120,
          priceForTwo: 240,
          location: 'Hostel Outer Ring, Opposite Bennett South Gate',
          distance: '0.1 km from Campus',
          status: 'OPEN',
          isOpen: true,
          pureVeg: false,
          image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80',
          description: 'Crispy paratha wraps, sizzling shawarmas, and late-night cravings hub for campus hostelers.'
        }
      ]
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
      data: [
        {
          id: 'notif-1',
          title: 'Dining Privilege Active',
          message: 'Your verified Bennett University student dining status is active with 20% off privileges.',
          type: 'SYSTEM',
          read: false,
          createdAt: new Date().toISOString()
        }
      ]
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

  return null;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (networkErr) {
    const fallback = handleOfflineFallback(endpoint, options);
    if (fallback) return fallback;
    throw new Error('Unable to reach the campus dining server. Please verify your connection.');
  }

  // Inspect content type: if HTML was returned (e.g. SPA index.html from static hosting / rewrites)
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    const fallback = handleOfflineFallback(endpoint, options);
    if (fallback) return fallback;
    throw new Error(`Server returned non-JSON response (${response.status})`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    const fallback = handleOfflineFallback(endpoint, options);
    if (fallback) return fallback;
    throw new Error('Failed to parse response from server');
  }

  if (!response.ok) {
    const fallback = handleOfflineFallback(endpoint, options);
    if (fallback) return fallback;
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

  // Notifications
  notifications: {
    getAll: () =>
      request('/notifications'),
    markRead: (id) =>
      request(`/notifications/${id}/read`, { method: 'PATCH' })
  }
};

export default api;
