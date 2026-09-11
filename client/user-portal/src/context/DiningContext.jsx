import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DiningContext = createContext(null);

export function DiningProvider({ children }) {
  const { user, setUser } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [reservations, setReservations] = useState(() => {
    try {
      const saved = localStorage.getItem('dine_bennett_reservations');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [tables, setTables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [offers, setOffers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  const openScanner = () => setScannerModalOpen(true);
  const closeScanner = () => setScannerModalOpen(false);

  // 1. Fetch initial data from backend API
  const refreshAllData = async () => {
    setLoading(true);
    try {
      // Fetch restaurants
      const restRes = await api.restaurants.getAll().catch(() => null);
      if (restRes?.success && restRes.data) {
        setRestaurants(restRes.data);
      }

      // Fetch offers
      const offerRes = await api.offers.getAll({ all: 'true' }).catch(() => null);
      if (offerRes?.success && offerRes.data) {
        setOffers(offerRes.data);
      }

      // Fetch institutions
      const instRes = await api.institutions.getAll().catch(() => null);
      if (instRes?.success && instRes.data) {
        setInstitutions(instRes.data);
      }

      // Fetch tables
      const tableRes = await api.tables.getAll(1).catch(() => null);
      if (tableRes?.success && tableRes.data) {
        setTables(tableRes.data.map(t => ({
          ...t,
          occupied: t.isOccupied,
          cap: t.capacity,
          guest: t.currentGuest
        })));
      }

      // Fetch bookings (role-aware: getMy() for users/students, getAll() for owner/admin/staff)
      let bookRes = null;
      if (user) {
        if (
          user.role === 'ADMIN' ||
          user.role === 'SUPER_ADMIN' ||
          user.role === 'RESTAURANT_STAFF' ||
          user.role === 'RESTAURANT_ADMIN'
        ) {
          bookRes = await api.bookings.getAll().catch(() => null);
        } else {
          bookRes = await api.bookings.getMy().catch(() => null);
        }
      }
      if (bookRes?.success && bookRes.data) {
        const mapped = bookRes.data.map(b => ({
          ...b,
          orders: b.orders?.map(o => ({ ...o, qty: o.quantity || o.qty })) || []
        }));
        setReservations(mapped);
        try {
          localStorage.setItem('dine_bennett_reservations', JSON.stringify(mapped));
        } catch {
          // ignore
        }
      } else {
        try {
          const cached = localStorage.getItem('dine_bennett_reservations');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReservations(parsed);
            }
          }
        } catch {
          // ignore
        }
      }

      // Fetch clearance queue (if user has SUPER_ADMIN role or as public overview)
      if (user?.role === 'SUPER_ADMIN') {
        const clearRes = await api.superadmin.getClearanceQueue().catch(() => null);
        if (clearRes?.success && clearRes.data) {
          setVerifications(clearRes.data);
        }
      }

      // Fetch notifications
      const notifRes = await api.notifications.getAll().catch(() => null);
      if (notifRes?.success && notifRes.data) {
        setNotifications(notifRes.data);
      }
    } catch (err) {
      console.warn('Backend fetch failed, using cached state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();

    // Listen for local and cross-tab/window reservation synchronization
    const handleSync = () => {
      try {
        const raw = localStorage.getItem('dine_bennett_reservations');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReservations(parsed);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('dining_reservations_updated', handleSync);

    // Real-time synchronization heartbeat: refreshes state every 15s when window is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshAllData();
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('dining_reservations_updated', handleSync);
    };
  }, [user]);

  // --- REAL BACKEND ACTIONS ---

  /**
   * Super Admin sends a 6-digit verification code to user
   */
  const sendVerificationCode = async (applicantId) => {
    try {
      const res = await api.superadmin.sendCode(applicantId);
      if (res.success && res.data) {
        const { code, applicant } = res.data;

        // Update local state
        setVerifications(prev => prev.map(v => 
          (v.id === applicant.id || v.email === applicant.email)
            ? { ...v, status: 'CODE_SENT', verificationCode: code }
            : v
        ));

        // Add local notification
        setNotifications(prev => [
          {
            id: `ntf-${Date.now()}`,
            type: 'success',
            title: 'Verification Code Issued!',
            body: `Super Admin issued clearance passkey: ${code}.`,
            code,
            read: false
          },
          ...prev
        ]);

        return { code, applicant };
      }
      throw new Error(res?.error || 'Failed to issue verification code');
    } catch (err) {
      console.error('API sendVerificationCode failed:', err.message);
      throw err;
    }
  };

  /**
   * User verifies with the 6-digit code
   */
  const verifyUserWithCode = async (code, userEmail) => {
    try {
      const res = await api.auth.verifyCode(code, userEmail || user?.email);
      if (res.success && res.data) {
        if (setUser) {
          setUser(res.data);
          localStorage.setItem('dine_bennett_user', JSON.stringify(res.data));
        }

        // Update local verification status
        setVerifications(prev => prev.map(v => 
          v.email?.toLowerCase() === (userEmail || user?.email)?.toLowerCase()
            ? { ...v, status: 'VERIFIED' }
            : v
        ));

        return { success: true };
      }
      return { success: false, message: res?.error || 'Invalid verification code.' };
    } catch (err) {
      console.warn('API verifyUserWithCode error:', err.message);
      return { success: false, message: err.message || 'Verification failed.' };
    }
  };

  /**
   * User creates a table reservation
   */
  const createReservation = async (bookingData) => {
    try {
      const res = await api.bookings.create(bookingData);
      if (res.success && res.data) {
        const complete = {
          ...res.data,
          orders: res.data.orders?.map(o => ({ ...o, qty: o.quantity || o.qty })) || []
        };
        setReservations(prev => {
          const next = [complete, ...prev.filter(b => b.id !== complete.id)];
          try {
            localStorage.setItem('dine_bennett_reservations', JSON.stringify(next));
            window.dispatchEvent(new Event('dining_reservations_updated'));
          } catch {
            // ignore
          }
          return next;
        });
        return complete;
      }
      throw new Error(res.error || 'Failed to create reservation in database');
    } catch (err) {
      console.error('API createReservation failed:', err.message);
      throw err;
    }
  };

  /**
   * Restaurant Staff checks in and seats the guest
   */
  const staffCheckInGuest = async (bookingId, assignedTableId) => {
    const booking = reservations.find(b => b.id === bookingId);
    const tableId = assignedTableId || booking?.tableAssigned || 'T-01';

    try {
      await api.bookings.updateStatus(bookingId, 'SEATED', tableId);
    } catch (err) {
      console.warn('API check-in failed, updating local state:', err.message);
    }

    setReservations(prev => {
      const next = prev.map(b => 
        b.id === bookingId ? { ...b, status: 'SEATED', tableAssigned: tableId } : b
      );
      try {
        localStorage.setItem('dine_bennett_reservations', JSON.stringify(next));
        window.dispatchEvent(new Event('dining_reservations_updated'));
      } catch {
        // ignore
      }
      return next;
    });

    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, occupied: true, isOccupied: true, guest: booking?.guestName || 'Seated Guest' } : t
    ));
  };

  /**
   * Restaurant Staff adds dishes to a table's bill
   */
  const staffAddOrderItem = async (bookingId, item) => {
    try {
      await api.bookings.addOrder(bookingId, {
        name: item.name,
        price: item.price,
        quantity: 1
      });
    } catch (err) {
      console.warn('API add order failed:', err.message);
    }

    setReservations(prev => {
      const next = prev.map(b => {
        if (b.id === bookingId) {
          const existing = (b.orders || []).find(o => o.name === item.name);
          let updatedOrders;
          if (existing) {
            updatedOrders = b.orders.map(o => o.name === item.name ? { ...o, qty: o.qty + 1 } : o);
          } else {
            updatedOrders = [...(b.orders || []), { id: `ord-${Date.now()}`, ...item, qty: 1 }];
          }
          return { ...b, orders: updatedOrders };
        }
        return b;
      });
      try {
        localStorage.setItem('dine_bennett_reservations', JSON.stringify(next));
        window.dispatchEvent(new Event('dining_reservations_updated'));
      } catch {
        // ignore
      }
      return next;
    });
  };

  /**
   * Sync complete orders array for a booking tab (used during bill settlement & tab updates)
   */
  const syncBookingOrders = async (bookingId, updatedOrders) => {
    setReservations(prev => {
      const next = prev.map(b => 
        b.id === bookingId ? { ...b, orders: updatedOrders } : b
      );
      try {
        localStorage.setItem('dine_bennett_reservations', JSON.stringify(next));
        window.dispatchEvent(new Event('dining_reservations_updated'));
      } catch {
        // ignore
      }
      return next;
    });
  };

  /**
   * Settle payment with 3 options: UPI, CASH, or CARD
   */
  const staffCompletePayment = async (bookingId, paymentDetails) => {
    const booking = reservations.find(b => b.id === bookingId);

    try {
      const res = await api.payments.settle(bookingId, paymentDetails);
      if (res.success && res.data) {
        const payment = res.data.payment;

        setReservations(prev => {
          const next = prev.map(b => 
            b.id === bookingId ? { ...b, status: 'COMPLETED', payment } : b
          );
          try {
            localStorage.setItem('dine_bennett_reservations', JSON.stringify(next));
            window.dispatchEvent(new Event('dining_reservations_updated'));
          } catch {
            // ignore
          }
          return next;
        });

        const tableId = booking?.tableAssigned;
        if (tableId) {
          setTables(prev => prev.map(t => 
            t.id === tableId ? { ...t, occupied: false, isOccupied: false, guest: null } : t
          ));
        }

        return payment;
      }
      throw new Error(res.error || 'Failed to settle payment on server');
    } catch (err) {
      console.error('API settle payment failed:', err.message);
      throw err;
    }
  };

  /**
   * Super Admin onboards a new restaurant
   */
  const onboardRestaurant = async (restaurantData) => {
    try {
      const res = await api.superadmin.createRestaurant(restaurantData);
      if (res.success && res.data) {
        setRestaurants(prev => [res.data, ...prev]);
        return res.data;
      }
    } catch (err) {
      console.error('onboardRestaurant error:', err);
      throw err;
    }
  };

  /**
   * Super Admin toggles restaurant status
   */
  const toggleRestaurantStatus = async (restaurantId, isOpen) => {
    try {
      await api.superadmin.toggleRestaurantStatus(restaurantId, isOpen);
      setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isOpen } : r));
    } catch (err) {
      console.error('toggleRestaurantStatus error:', err);
      setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isOpen } : r));
    }
  };

  /**
   * Super Admin deletes a partner restaurant
   */
  const deleteRestaurant = async (restaurantId) => {
    try {
      await api.superadmin.deleteRestaurant(restaurantId);
      setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    } catch (err) {
      console.error('deleteRestaurant error:', err);
      setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    }
  };

  /**
   * Restaurant Owner adds a menu item
   */
  const addMenuItem = async (restaurantId, itemData) => {
    try {
      const res = await api.restaurants.addMenuItem(restaurantId, itemData);
      return res.data;
    } catch (err) {
      console.error('addMenuItem error:', err);
      throw err;
    }
  };

  /**
   * Restaurant Owner updates a menu item or availability
   */
  const updateMenuItem = async (restaurantId, itemId, data) => {
    try {
      const res = await api.restaurants.updateMenuItem(restaurantId, itemId, data);
      return res.data;
    } catch (err) {
      console.error('updateMenuItem error:', err);
      throw err;
    }
  };

  /**
   * Restaurant Owner deletes a menu item
   */
  const deleteMenuItem = async (restaurantId, itemId) => {
    try {
      await api.restaurants.deleteMenuItem(restaurantId, itemId);
      return true;
    } catch (err) {
      console.error('deleteMenuItem error:', err);
      throw err;
    }
  };

  /**
   * Restaurant Owner or Super Admin creates a promotional offer
   */
  const createOffer = async (offerData) => {
    try {
      const res = await api.offers.create(offerData);
      if (res.success && res.data) {
        setOffers(prev => [res.data, ...prev]);
        return res.data;
      }
    } catch (err) {
      console.error('createOffer error:', err);
      throw err;
    }
  };

  /**
   * Toggle offer status (ACTIVE / INACTIVE)
   */
  const toggleOfferStatus = async (offerId, newStatus) => {
    try {
      await api.offers.toggleStatus(offerId, newStatus);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('toggleOfferStatus error:', err);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: newStatus } : o));
    }
  };

  /**
   * Delete an offer
   */
  const deleteOffer = async (offerId) => {
    try {
      await api.offers.delete(offerId);
      setOffers(prev => prev.filter(o => o.id !== offerId));
    } catch (err) {
      console.error('deleteOffer error:', err);
      setOffers(prev => prev.filter(o => o.id !== offerId));
    }
  };

  /**
   * Cancel booking and release table capacity
   */
  const cancelBooking = async (bookingId) => {
    try {
      const res = await api.bookings.cancel(bookingId);
      if (res?.success) {
        setReservations(prev => {
          const next = prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b);
          try {
            localStorage.setItem('dine_bennett_reservations', JSON.stringify(next));
            window.dispatchEvent(new Event('dining_reservations_updated'));
          } catch {
            // ignore
          }
          return next;
        });
        return res.data;
      }
    } catch (err) {
      console.error('cancelBooking error:', err);
      throw err;
    }
  };

  /**
   * Submit verified student / faculty review
   */
  const submitReview = async (restaurantId, reviewData) => {
    try {
      const res = await api.reviews.create(restaurantId, reviewData);
      if (res?.success && res.data) {
        const restRes = await api.restaurants.getAll().catch(() => null);
        if (restRes?.success && restRes.data) {
          setRestaurants(restRes.data);
        }
        return res.data;
      }
    } catch (err) {
      console.error('submitReview error:', err);
      throw err;
    }
  };

  const value = {
    restaurants,
    setRestaurants,
    verifications,
    reservations,
    tables,
    notifications,
    setNotifications,
    offers,
    setOffers,
    institutions,
    setInstitutions,
    loading,
    refreshAllData,
    sendVerificationCode,
    verifyUserWithCode,
    createReservation,
    cancelBooking,
    submitReview,
    staffCheckInGuest,
    staffAddOrderItem,
    syncBookingOrders,
    staffCompletePayment,
    setReservations,
    onboardRestaurant,
    toggleRestaurantStatus,
    deleteRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    createOffer,
    toggleOfferStatus,
    deleteOffer,
    scannerModalOpen,
    setScannerModalOpen,
    openScanner,
    closeScanner
  };

  return (
    <DiningContext.Provider value={value}>
      {children}
    </DiningContext.Provider>
  );
}

export function useDining() {
  const context = useContext(DiningContext);
  if (!context) {
    throw new Error('useDining must be used within a DiningProvider');
  }
  return context;
}
