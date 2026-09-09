/**
 * Dine@Bennett Central API Client
 * Connects frontend to Express + SQLite backend with JWT authentication
 */

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('dine_bennett_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Failed to parse response' }));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
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
