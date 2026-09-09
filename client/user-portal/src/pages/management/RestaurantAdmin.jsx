import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDining } from '../../context/DiningContext';
import api from '../../services/api';
import CameraScannerModal from '../../components/CameraScannerModal';
import {
  ChefHat,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Tag,
  Plus,
  Sliders,
  Check,
  BarChart3,
  UserCheck,
  Shield,
  Trash2,
  X,
  Sparkles,
  DollarSign,
  Loader2,
  Star,
  RefreshCw,
  QrCode
} from 'lucide-react';

export default function RestaurantAdmin() {
  const { user } = useAuth();
  const {
    restaurants = [],
    reservations = [],
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  } = useDining() || {};

  const restaurant = restaurants.find(r => Number(r.id) === Number(user?.restaurantId || 1)) || restaurants[0] || {
    id: 1,
    name: 'The Spice Garden',
    cuisine: 'North Indian',
    rating: 4.8,
    reviews: 142,
    address: 'Shop 14, Sector Alpha Commercial, Greater Noida'
  };

  const [activeTab, setActiveTab] = useState('Reservations');
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Bookings list from live reservations
  const [bookings, setBookings] = useState(
    reservations.map(r => ({
      id: r.id,
      guest: r.guestName,
      email: r.guestEmail,
      time: r.time,
      date: r.date,
      guests: r.guests,
      status: r.status,
      note: r.specialRequest || 'Table booking'
    }))
  );

  useEffect(() => {
    setBookings(reservations.map(r => ({
      id: r.id,
      guest: r.guestName,
      email: r.guestEmail,
      time: r.time,
      date: r.date,
      guests: r.guests,
      status: r.status,
      note: r.specialRequest || 'Table booking'
    })));
  }, [reservations]);

  // Live menu items loaded from database
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const fetchMenu = async () => {
    if (!restaurant?.id) return;
    setMenuLoading(true);
    try {
      const res = await api.restaurants.getById(Number(restaurant.id));
      if (res.data?.menuItems) {
        setMenuItems(res.data.menuItems);
      }
    } catch (err) {
      console.warn('Could not load live menu for restaurant:', err);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurant?.id]);

  // ================= OFFERS STATE =================
  const [offersList, setOffersList] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const fetchOffers = async () => {
    if (!restaurant?.id) return;
    setLoadingOffers(true);
    try {
      const res = await api.offers.getAll({ restaurantId: restaurant.id, all: 'true' });
      if (res?.success && Array.isArray(res.data)) {
        setOffersList(res.data);
      }
    } catch (err) {
      console.warn('Could not load offers:', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [restaurant?.id]);

  // ================= STAFF ROSTER STATE =================
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const fetchStaff = async () => {
    if (!restaurant?.id) return;
    setLoadingStaff(true);
    try {
      const res = await api.staff.getByRestaurant(restaurant.id);
      if (res?.success && Array.isArray(res.data)) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.warn('Could not load staff roster:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [restaurant?.id]);

  // ================= OPERATIONAL ANALYTICS =================
  const [restaurantStats, setRestaurantStats] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchAnalytics = async () => {
    if (!restaurant?.id) return;
    setLoadingAnalytics(true);
    try {
      const res = await api.analytics.getRestaurant(restaurant.id);
      if (res?.success && res.data) {
        setRestaurantStats(res.data);
      }
    } catch (err) {
      console.warn('Could not load restaurant analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Analytics') {
      fetchAnalytics();
    }
  }, [activeTab, restaurant?.id]);

  // Modal states
  const [showDishModal, setShowDishModal] = useState(false);
  const [dishSaving, setDishSaving] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Starters',
    price: '',
    desc: '',
    veg: true,
    calories: '320 kcal',
    image: ''
  });

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '',
    code: '',
    discountPercent: 20,
    minSpend: '400',
    description: '',
    validTill: '2026-12-31'
  });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: 'RESTAURANT_STAFF',
    shift: 'Lunch (11:00 AM – 4:00 PM)'
  });

  const handleStatusChange = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const toggleAvailability = async (itemId) => {
    const current = menuItems.find(item => item.id === itemId);
    if (!current) return;
    const currentAvail = current.isAvailable !== undefined ? current.isAvailable : current.available;
    const newStatus = !currentAvail;
    setMenuItems(menuItems.map(item => item.id === itemId ? { ...item, isAvailable: newStatus, available: newStatus } : item));
    try {
      if (updateMenuItem) {
        await updateMenuItem(restaurant.id, itemId, { isAvailable: newStatus });
      }
    } catch (err) {
      console.error('Failed to toggle stock status in database:', err);
      setMenuItems(menuItems.map(item => item.id === itemId ? { ...item, isAvailable: currentAvail, available: currentAvail } : item));
      alert('Could not update dish stock: ' + err.message);
    }
  };

  const handleDeleteDish = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this dish from the menu?')) {
      try {
        if (deleteMenuItem) {
          await deleteMenuItem(restaurant.id, itemId);
          setMenuItems(menuItems.filter(item => item.id !== itemId));
        }
      } catch (err) {
        alert('Could not delete dish: ' + err.message);
      }
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) return;
    setDishSaving(true);
    try {
      const newItem = {
        name: dishForm.name,
        category: dishForm.category,
        desc: dishForm.desc || '',
        price: parseFloat(dishForm.price),
        isVeg: Boolean(dishForm.veg),
        calories: dishForm.calories || '320 kcal',
        image: dishForm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
      };

      if (addMenuItem) {
        const created = await addMenuItem(restaurant.id, newItem);
        setMenuItems([...menuItems, created || { ...newItem, id: `dish-${Date.now()}` }]);
      }

      setShowDishModal(false);
      setDishForm({
        name: '',
        category: 'Starters',
        price: '',
        desc: '',
        veg: true,
        calories: '320 kcal',
        image: ''
      });
    } catch (err) {
      alert('Could not add dish: ' + err.message);
    } finally {
      setDishSaving(false);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.title || !offerForm.code) return;
    setOfferSaving(true);
    try {
      const res = await api.offers.create({
        restaurantId: restaurant.id,
        title: offerForm.title,
        promoCode: offerForm.code.toUpperCase().trim(),
        discountPercent: parseInt(offerForm.discountPercent, 10) || 15,
        minOrderAmount: parseFloat(offerForm.minSpend) || 0,
        description: offerForm.description,
        endDate: offerForm.validTill
      });

      if (res?.success && res.data) {
        setOffersList([res.data, ...offersList]);
        setShowOfferModal(false);
        setOfferForm({
          title: '',
          code: '',
          discountPercent: 20,
          minSpend: '400',
          description: '',
          validTill: '2026-12-31'
        });
      }
    } catch (err) {
      alert('Failed to launch offer: ' + err.message);
    } finally {
      setOfferSaving(false);
    }
  };

  const handleToggleOfferStatus = async (offerId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.offers.toggleStatus(offerId, nextStatus);
      setOffersList(offersList.map(o => o.id === offerId ? { ...o, status: nextStatus } : o));
    } catch (err) {
      alert('Failed to toggle offer status: ' + err.message);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (window.confirm('Are you sure you want to remove this promo deal?')) {
      try {
        await api.offers.delete(offerId);
        setOffersList(offersList.filter(o => o.id !== offerId));
      } catch (err) {
        alert('Failed to delete offer: ' + err.message);
      }
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) return;
    setStaffSaving(true);
    try {
      const res = await api.staff.assign(restaurant.id, {
        name: staffForm.name,
        email: staffForm.email,
        role: staffForm.role,
        password: 'password123',
        department: restaurant.name
      });
      if (res?.success && res.data) {
        setStaffList([res.data, ...staffList]);
        setShowStaffModal(false);
        setStaffForm({ name: '', email: '', role: 'RESTAURANT_STAFF', shift: 'Lunch (11:00 AM – 4:00 PM)' });
      }
    } catch (err) {
      alert('Failed to assign staff member: ' + err.message);
    } finally {
      setStaffSaving(false);
    }
  };

  const handleRemoveStaff = async (userId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from this restaurant team?`)) {
      try {
        await api.staff.remove(restaurant.id, userId);
        setStaffList(staffList.filter(s => s.id !== userId));
      } catch (err) {
        alert('Failed to remove staff member: ' + err.message);
      }
    }
  };

  return (
    <div className="page-pad">
      {/* Restaurant Admin Header */}
      <div className="anim-fade-up" style={{
        padding: '24px 28px',
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, #2F5E31 0%, #1E4624 60%, #0F2D1E 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        marginBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--r-sm)', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ChefHat size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-primary" style={{ background: 'rgba(111, 175, 61, 0.2)', color: '#6FAF3D', border: '1px solid rgba(111, 175, 61, 0.4)' }}>Restaurant Admin Hub</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Partner Outlet</span>
            </div>
            <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              {restaurant.name} · Operational Desk
            </h2>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>
              {restaurant.cuisine} Cuisine · Bennett University Approved Dining Partner
            </div>
          </div>
        </div>

        {/* Global Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-primary btn-md"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              fontSize: '0.95rem'
            }}
            onClick={() => setShowDishModal(true)}
          >
            <Plus size={18} strokeWidth={2.5} /> Add New Menu Dish
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div className="tabs-scroll-x" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16, width: '100%' }}>
          <button
            className={`btn btn-sm ${activeTab === 'Reservations' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Reservations' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Reservations' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Reservations' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Reservations')}
          >
            <Calendar size={14} /> Reservations Queue ({bookings.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Menu' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Menu' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Menu' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Menu' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Menu')}
          >
            <ChefHat size={14} /> Menu Catalog ({menuItems.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Offers' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Offers' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Offers' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Offers' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Offers')}
          >
            <Tag size={14} /> Special Offers ({offersList.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Staff' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Staff' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Staff' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Staff' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Staff')}
          >
            <Users size={14} /> Staff Roster ({staffList.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Analytics' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Analytics' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Analytics' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Analytics' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Analytics')}
          >
            <BarChart3 size={14} /> Outlet Analytics
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid-responsive-kpi anim-fade-up delay-1">
        <div className="card" style={{ padding: 18, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Active Reservations</div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
            {bookings.length}
          </div>
          <div style={{ fontSize: 11.5, color: '#10B981' }}>Live dining passes</div>
        </div>

        <div className="card" style={{ padding: 18, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Catalog Dishes</div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', margin: '4px 0' }}>
            {menuItems.length} Dishes
          </div>
          <div style={{ fontSize: 11.5, color: '#10B981' }}>{menuItems.filter(m => m.isAvailable !== false).length} In Stock</div>
        </div>

        <div className="card" style={{ padding: 18, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Active Offers</div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B', margin: '4px 0' }}>
            {offersList.filter(o => o.status === 'ACTIVE').length} Active
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>Student discounts live</div>
        </div>

        <div className="card" style={{ padding: 18, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Staff on Duty</div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', margin: '4px 0' }}>
            {staffList.length} Members
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--primary)' }}>Assigned to outlet</div>
        </div>
      </div>

      {/* ================= TAB 1: RESERVATIONS ================= */}
      {activeTab === 'Reservations' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Live Table Bookings &amp; Service Orders
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Approve, check-in, or manage bookings for {restaurant.name}.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowScannerModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Open camera to scan student digital pass"
              >
                <QrCode size={15} /> Scan Digital Pass
              </button>
              <span className="badge badge-info">{bookings.length} Bookings</span>
            </div>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--t4)', textTransform: 'uppercase', fontSize: 11 }}>
                  <th style={{ padding: '12px 14px' }}>Guest Details</th>
                  <th style={{ padding: '12px 14px' }}>Time &amp; Date</th>
                  <th style={{ padding: '12px 14px' }}>Party Size</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>
                      No table bookings currently in queue.
                    </td>
                  </tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{b.guest}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{b.email}</div>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--t2)' }}>
                        <div>{b.time}</div>
                        <div style={{ fontSize: 11, color: 'var(--t4)' }}>{b.date}</div>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--t2)', fontWeight: 600 }}>
                        {b.guests} Guests
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${
                          b.status === 'CONFIRMED' || b.status === 'SEATED' ? 'badge-success' :
                          b.status === 'COMPLETED' ? 'badge-primary' : 'badge-neutral'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {b.status === 'PENDING' && (
                            <button
                              className="btn btn-xs btn-success"
                              onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                            >
                              <CheckCircle2 size={12} /> Confirm
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                            <button
                              className="btn btn-xs btn-outline"
                              onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MENU CATALOG ================= */}
      {activeTab === 'Menu' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Menu Dishes &amp; Real-Time Kitchen Stock
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Add dishes, toggle availability in real-time, and update dish offerings.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDishModal(true)}>
              <Plus size={14} /> Add New Dish
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
            {menuItems.map(item => {
              const inStock = item.isAvailable !== undefined ? item.isAvailable : item.available !== false;
              return (
                <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    style={{ width: 68, height: 68, borderRadius: 'var(--r-xs)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary)' }}>
                        ₹{item.price}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)', margin: '2px 0' }}>{item.category}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <button
                        className={`btn btn-xs ${inStock ? 'btn-success' : 'btn-outline'}`}
                        style={{ fontSize: 10.5 }}
                        onClick={() => toggleAvailability(item.id)}
                      >
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#EF4444' }}
                        onClick={() => handleDeleteDish(item.id)}
                        title="Delete Dish"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: OFFERS ================= */}
      {activeTab === 'Offers' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Active Bennett Campus Promotions &amp; Discounts
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Configure promo codes, discount percentages, and minimum spends for university diners.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowOfferModal(true)}>
              <Plus size={14} /> Create New Promo Deal
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
            {offersList.map(offer => (
              <div key={offer.id} style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#FEF3C7', border: '1px solid #FCD34D' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="badge badge-warning" style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.05em' }}>
                    {offer.promoCode}
                  </span>
                  <button
                    className={`btn btn-xs ${offer.status === 'ACTIVE' ? 'btn-success' : 'btn-outline'}`}
                    style={{ fontSize: 11 }}
                    onClick={() => handleToggleOfferStatus(offer.id, offer.status)}
                  >
                    {offer.status === 'ACTIVE' ? 'Active' : 'Paused'}
                  </button>
                </div>
                <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#78350F', marginBottom: 4 }}>
                  {offer.title} ({offer.discountPercent}% Off)
                </h4>
                <p style={{ fontSize: 12, color: '#92400E', marginBottom: 12 }}>
                  {offer.description || 'Exclusive campus dining discount for Bennett students and faculty.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#B45309' }}>
                  <span>Min Spend: ₹{offer.minOrderAmount || 0}</span>
                  <button
                    className="btn btn-ghost btn-xs"
                    style={{ color: '#DC2626' }}
                    onClick={() => handleDeleteOffer(offer.id)}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: STAFF TEAM ================= */}
      {activeTab === 'Staff' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Restaurant Service Staff Roster
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Manage team members authorized for reception terminal check-in and table management.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowStaffModal(true)}>
              <Plus size={14} /> Add Team Member
            </button>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--t4)', textTransform: 'uppercase', fontSize: 11 }}>
                  <th style={{ padding: '12px 14px' }}>Staff Name</th>
                  <th style={{ padding: '12px 14px' }}>Role</th>
                  <th style={{ padding: '12px 14px' }}>Department</th>
                  <th style={{ padding: '12px 14px' }}>Terminal Access</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>
                      No staff members currently assigned. Click "Add Team Member" above.
                    </td>
                  </tr>
                ) : (
                  staffList.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{s.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{s.email}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${s.role === 'RESTAURANT_ADMIN' ? 'badge-primary' : 'badge-info'}`}>
                          {s.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--t3)' }}>{s.department || restaurant.name}</td>
                      <td style={{ padding: '14px' }}>
                        <span className="badge badge-success">Terminal Authorized</span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-xs"
                          style={{ color: '#EF4444' }}
                          onClick={() => handleRemoveStaff(s.id, s.name)}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: ANALYTICS ================= */}
      {activeTab === 'Analytics' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Operational &amp; Dining Analytics
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Live metrics covering seating occupancy, completed reservations, and kitchen inventory.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchAnalytics}>
              <RefreshCw size={14} className={loadingAnalytics ? 'spin' : ''} /> Refresh
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Table Occupancy Rate</div>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                {restaurantStats?.occupancy?.occupancyRate ?? 45}%
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                {restaurantStats?.occupancy?.occupiedTables ?? 2} / {restaurantStats?.occupancy?.totalTables ?? 4} Tables Occupied
              </div>
            </div>

            <div style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Completed Orders</div>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginTop: 4 }}>
                {restaurantStats?.orders?.completed ?? bookings.filter(b => b.status === 'COMPLETED').length}
              </div>
              <div style={{ fontSize: 11.5, color: '#10B981' }}>Fulfilled guest sessions</div>
            </div>

            <div style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Menu Stock Level</div>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--t1)', marginTop: 4 }}>
                {menuItems.filter(m => m.isAvailable !== false).length} / {menuItems.length}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>Dishes available for order</div>
            </div>

            <div style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Active Offers</div>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
                {offersList.filter(o => o.status === 'ACTIVE').length}
              </div>
              <div style={{ fontSize: 11.5, color: '#F59E0B' }}>Promotions currently live</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD DISH ================= */}
      {showDishModal && (
        <div className="modal-overlay" onClick={() => setShowDishModal(false)}>
          <div className="modal-card anim-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-title font-display">Add New Menu Dish</h3>
                <div className="modal-sub">Add to {restaurant.name} catalog</div>
              </div>
              <button className="modal-close" onClick={() => setShowDishModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDish}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Dish Name *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. Kashmiri Dum Aloo"
                    value={dishForm.name}
                    onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={dishForm.category}
                      onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                    >
                      <option value="Starters">Starters / Appetizers</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Artisan Breads">Artisan Breads</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Price (₹) *</label>
                    <input
                      className="form-input"
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 320"
                      value={dishForm.price}
                      onChange={e => setDishForm({ ...dishForm, price: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Short Description</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Brief description of flavors and ingredients..."
                    value={dishForm.desc}
                    onChange={e => setDishForm({ ...dishForm, desc: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowDishModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" disabled={dishSaving}>
                  {dishSaving ? 'Saving...' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE OFFER ================= */}
      {showOfferModal && (
        <div className="modal-overlay" onClick={() => setShowOfferModal(false)}>
          <div className="modal-card anim-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-title font-display">Create Promotional Offer</h3>
                <div className="modal-sub">Launch targeted student discount for {restaurant.name}</div>
              </div>
              <button className="modal-close" onClick={() => setShowOfferModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddOffer}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Offer Title *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. 20% Bennett Student Special"
                    value={offerForm.title}
                    onChange={e => setOfferForm({ ...offerForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label">Promo Code *</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. SPICE20"
                      value={offerForm.code}
                      onChange={e => setOfferForm({ ...offerForm, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Discount % *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="5"
                      max="90"
                      required
                      value={offerForm.discountPercent}
                      onChange={e => setOfferForm({ ...offerForm, discountPercent: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label">Min Spend (₹)</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="e.g. 400"
                      value={offerForm.minSpend}
                      onChange={e => setOfferForm({ ...offerForm, minSpend: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Valid Until</label>
                    <input
                      className="form-input"
                      type="date"
                      value={offerForm.validTill}
                      onChange={e => setOfferForm({ ...offerForm, validTill: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Description / Terms</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Valid for Bennett University students with active student ID..."
                    value={offerForm.description}
                    onChange={e => setOfferForm({ ...offerForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowOfferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" disabled={offerSaving}>
                  {offerSaving ? 'Launching...' : 'Launch Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STAFF ================= */}
      {showStaffModal && (
        <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="modal-card anim-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-title font-display">Assign Staff Member</h3>
                <div className="modal-sub">Add team member to {restaurant.name}</div>
              </div>
              <button className="modal-close" onClick={() => setShowStaffModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddStaff}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. Amit Sharma"
                    value={staffForm.name}
                    onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Staff Email *</label>
                  <input
                    className="form-input"
                    type="email"
                    required
                    placeholder="e.g. amit@spicegarden.com"
                    value={staffForm.email}
                    onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={staffForm.role}
                    onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                  >
                    <option value="RESTAURANT_STAFF">Front-Desk Staff</option>
                    <option value="RESTAURANT_ADMIN">Restaurant Admin / Manager</option>
                  </select>
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowStaffModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" disabled={staffSaving}>
                  {staffSaving ? 'Assigning...' : 'Assign Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Digital Pass Scanner Modal */}
      <CameraScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        reservations={reservations}
        onScanSuccess={(code, matched) => {
          if (matched) {
            handleStatusUpdate(matched.id, 'SEATED', matched.tableAssigned || 'T-01');
          }
        }}
      />
    </div>
  );
}
