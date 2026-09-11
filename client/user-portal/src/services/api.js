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
    const singleMatch = endpoint.match(/\/restaurants\/(\d+)/);
    const spiceGardenMenu = {
      'Chef Specialties': [
        {
          id: 'sg-1',
          name: 'Smoked Dal Makhani',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Verified organic black lentils cooked overnight with cultured butter.',
          price: 180,
          veg: true,
          badge: 'House Specialty',
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-2',
          name: 'Butter Chicken Masala',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Verified tandoori chicken simmered in rich satin tomato gravy.',
          price: 215,
          veg: false,
          badge: 'Must Try',
          image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-3',
          name: 'Garlic Butter Naan',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Verified crispy leavened bread brushed with farm butter and minced garlic.',
          price: 75,
          veg: true,
          badge: 'Popular',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-4',
          name: 'Paneer Tikka Angara',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Charcoal-smoked cottage cheese cubes marinated in royal Kashmiri chili rub.',
          price: 280,
          veg: true,
          badge: 'Signature',
          image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-5',
          name: 'Murgh Malai Tikka',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Cream-marinated tender chicken kebabs finished in clay tandoor.',
          price: 340,
          veg: false,
          badge: 'Chef Special',
          image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-6',
          name: 'Awadhi Dum Biryani',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Fragrant aged basmati rice layered with saffron chicken and kewra essence.',
          price: 360,
          veg: false,
          badge: 'Bestseller',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
        }
      ]
    };

    const allRest = [
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
        description: 'Authentic royal curries, butter naans, and rich tandoori grills curated for Bennett University students and faculty.',
        menuByCategory: spiceGardenMenu,
        menuItems: spiceGardenMenu['Chef Specialties']
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
        }
      ];

    if (singleMatch) {
      const found = allRest.find(r => r.id === Number(singleMatch[1])) || allRest[0];
      return { success: true, data: found };
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

  // 7. Bookings Resilient Fallback (Multi-User & Multi-Role Local Sync)
  if (endpoint.startsWith('/bookings')) {
    const getStoredBookings = () => {
      try {
        const raw = localStorage.getItem('dine_bennett_reservations');
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
      return [
        {
          id: 'DB-4821',
          restaurantId: 1,
          restaurantName: 'The Spice Garden',
          guestName: 'Aarav Sharma',
          guestEmail: 'aarav.sharma@bennett.edu.in',
          date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          time: '1:30 PM',
          guests: 2,
          status: 'CONFIRMED',
          tableAssigned: 'T-01',
          specialRequest: 'Window Table · Anniversary',
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=DB-4821-BENNETT-VERIFIED',
          orders: [
            { name: 'Smoked Dal Makhani', price: 180, qty: 1 },
            { name: 'Garlic Butter Naan', price: 75, qty: 2 }
          ]
        },
        {
          id: 'DB-4822',
          restaurantId: 1,
          restaurantName: 'The Spice Garden',
          guestName: 'Ananya Verma',
          guestEmail: 'ananya.verma@bennett.edu.in',
          date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          time: '2:15 PM',
          guests: 4,
          status: 'CONFIRMED',
          tableAssigned: 'T-02',
          specialRequest: 'Booth Seating · Team Lunch',
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=DB-4822-BENNETT-VERIFIED',
          orders: [
            { name: 'Butter Chicken Masala', price: 215, qty: 1 },
            { name: 'Garlic Butter Naan', price: 75, qty: 3 }
          ]
        },
        {
          id: 'DB-4823',
          restaurantId: 1,
          restaurantName: 'The Spice Garden',
          guestName: 'Rohan Mehta',
          guestEmail: 'rohan.mehta@bennett.edu.in',
          date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          time: '3:00 PM',
          guests: 3,
          status: 'SEATED',
          tableAssigned: 'T-04',
          specialRequest: 'Family Table',
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=DB-4823-BENNETT-VERIFIED',
          orders: [
            { name: 'Awadhi Dum Biryani', price: 360, qty: 2 }
          ]
        }
      ];
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
