import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useDining } from '../../context/DiningContext';
import api from '../../services/api';
import CameraScannerModal from '../../components/CameraScannerModal';
import PaymentModal from '../../components/PaymentModal';
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
  QrCode,
  Camera,
  Upload,
  Edit3,
  Image as ImageIcon,
  ArrowUpDown,
  Search,
  CheckCircle,
  ExternalLink,
  Receipt,
  Utensils
} from 'lucide-react';

export default function RestaurantAdmin() {
  const { user } = useAuth();
  const {
    restaurants = [],
    reservations = [],
    staffCheckInGuest,
    staffCompletePayment,
    syncBookingOrders,
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
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);

  // Bookings list from live reservations
  const [bookings, setBookings] = useState(
    reservations.map(r => ({
      id: r.id,
      guest: r.guestName || r.guest || 'Campus Diner',
      email: r.guestEmail || r.email || 'student@bennett.edu.in',
      time: r.time || '1:30 PM',
      date: r.date || 'Today',
      guests: r.guests || 2,
      status: r.status || 'CONFIRMED',
      note: r.specialRequest || 'Dining reservation'
    }))
  );

  useEffect(() => {
    setBookings(reservations.map(r => ({
      id: r.id,
      guest: r.guestName || r.guest || 'Campus Diner',
      email: r.guestEmail || r.email || 'student@bennett.edu.in',
      time: r.time || '1:30 PM',
      date: r.date || 'Today',
      guests: r.guests || 2,
      status: r.status || 'CONFIRMED',
      note: r.specialRequest || 'Dining reservation'
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
  const [editingDishId, setEditingDishId] = useState(null);
  const [dishSaving, setDishSaving] = useState(false);
  const dishFileInputRef = useRef(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Starters',
    price: '',
    desc: '',
    veg: true,
    calories: '320 kcal',
    image: ''
  });

  // Menu search, category, and sort state
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState('All');
  const [menuSort, setMenuSort] = useState('default');

  // ================= PAYMENT QR MANAGEMENT STATE =================
  const [paymentQrs, setPaymentQrs] = useState([]);
  const [loadingQrs, setLoadingQrs] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSaving, setQrSaving] = useState(false);
  const qrFileInputRef = useRef(null);
  const [qrForm, setQrForm] = useState({
    id: null,
    label: '',
    upiId: '',
    image: '',
    isActive: true
  });

  const fetchPaymentQrs = async () => {
    if (!restaurant?.id) return;
    setLoadingQrs(true);
    try {
      const res = await api.paymentQrs.getByRestaurant(restaurant.id);
      if (res?.success && Array.isArray(res.data)) {
        setPaymentQrs(res.data);
      }
    } catch (err) {
      console.warn('Could not load payment QRs:', err);
    } finally {
      setLoadingQrs(false);
    }
  };

  useEffect(() => {
    fetchPaymentQrs();
  }, [restaurant?.id]);

  const handleQrFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('QR Code image file size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setQrForm(prev => ({ ...prev, image: uploadEvent.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDishFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Dish photo size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setDishForm(prev => ({ ...prev, image: uploadEvent.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddDish = () => {
    setEditingDishId(null);
    setDishForm({
      name: '',
      category: 'Starters',
      price: '',
      desc: '',
      veg: true,
      calories: '320 kcal',
      image: ''
    });
    setShowDishModal(true);
  };

  const handleOpenEditDish = (item) => {
    setEditingDishId(item.id);
    setDishForm({
      name: item.name || '',
      category: item.category || 'Starters',
      price: item.price !== undefined ? String(item.price) : '',
      desc: item.desc || item.description || '',
      veg: item.isVeg !== undefined ? item.isVeg : true,
      calories: item.calories || '320 kcal',
      image: item.image || ''
    });
    setShowDishModal(true);
  };

  const handleSaveQr = async (e) => {
    e.preventDefault();
    if (!qrForm.label || !qrForm.upiId) {
      alert('Please provide a label and valid UPI ID.');
      return;
    }
    setQrSaving(true);
    try {
      if (qrForm.id) {
        const res = await api.paymentQrs.update(restaurant.id, qrForm.id, {
          label: qrForm.label,
          upiId: qrForm.upiId,
          image: qrForm.image,
          isActive: qrForm.isActive
        });
        if (res?.success) {
          await fetchPaymentQrs();
          setShowQrModal(false);
        }
      } else {
        const res = await api.paymentQrs.create(restaurant.id, {
          label: qrForm.label,
          upiId: qrForm.upiId,
          image: qrForm.image,
          isActive: qrForm.isActive
        });
        if (res?.success) {
          await fetchPaymentQrs();
          setShowQrModal(false);
        }
      }
    } catch (err) {
      alert('Failed to save Payment QR: ' + err.message);
    } finally {
      setQrSaving(false);
    }
  };

  const handleSetActiveQr = async (qrId) => {
    try {
      const res = await api.paymentQrs.setActive(restaurant.id, qrId);
      if (res?.success) {
        setPaymentQrs(prev => prev.map(q => ({ ...q, isActive: q.id === qrId })));
      }
    } catch (err) {
      alert('Failed to activate Payment QR: ' + err.message);
    }
  };

  const handleDeleteQr = async (qrId) => {
    if (!window.confirm('Are you sure you want to remove this Payment QR?')) return;
    try {
      const res = await api.paymentQrs.delete(restaurant.id, qrId);
      if (res?.success) {
        setPaymentQrs(prev => prev.filter(q => q.id !== qrId));
      }
    } catch (err) {
      alert('Failed to delete Payment QR: ' + err.message);
    }
  };

  // Filter and sort menu items
  const filteredMenuItems = useMemo(() => {
    let list = [...menuItems];
    if (menuCategory !== 'All') {
      list = list.filter(item => (item.category || '').toLowerCase() === menuCategory.toLowerCase());
    }
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase().trim();
      list = list.filter(item =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.desc || '').toLowerCase().includes(q)
      );
    }
    if (menuSort === 'price-low') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (menuSort === 'price-high') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (menuSort === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [menuItems, menuCategory, menuSearch, menuSort]);

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

  const handleStatusUpdate = async (id, newStatus) => {
    if (newStatus === 'SEATED') {
      if (staffCheckInGuest) {
        await staffCheckInGuest(id);
      }
    } else {
      try {
        await api.bookings.updateStatus(id, newStatus);
      } catch (err) {
        console.warn('Backend updateStatus failed, updated locally:', err);
      }
    }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleStatusChange = handleStatusUpdate;

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
      const dishPayload = {
        name: dishForm.name,
        category: dishForm.category,
        desc: dishForm.desc || '',
        price: parseFloat(dishForm.price),
        isVeg: Boolean(dishForm.veg),
        calories: dishForm.calories || '320 kcal',
        image: dishForm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
      };

      if (editingDishId) {
        if (updateMenuItem) {
          await updateMenuItem(restaurant.id, editingDishId, dishPayload);
        }
        setMenuItems(prev => prev.map(item => item.id === editingDishId ? { ...item, ...dishPayload } : item));
      } else {
        if (addMenuItem) {
          const created = await addMenuItem(restaurant.id, dishPayload);
          setMenuItems(prev => [...prev, created || { ...dishPayload, id: `dish-${Date.now()}` }]);
        }
      }

      setShowDishModal(false);
      setEditingDishId(null);
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
      alert('Could not save dish: ' + err.message);
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
            onClick={handleOpenAddDish}
          >
            <Plus size={18} strokeWidth={2.5} /> Add New Menu Dish
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div className="tabs-scroll-x" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16, width: '100%' }}>
          <button
            className={`btn btn-sm ${activeTab === 'Reservations' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Reservations' ? '#FFFFFF' : 'var(--t1)',
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
              color: activeTab === 'Menu' ? '#FFFFFF' : 'var(--t1)',
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
            className={`btn btn-sm ${activeTab === 'PaymentQRs' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'PaymentQRs' ? '#FFFFFF' : 'var(--t1)',
              backgroundColor: activeTab === 'PaymentQRs' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'PaymentQRs' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('PaymentQRs')}
          >
            <QrCode size={14} /> Payment QRs ({paymentQrs.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Offers' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Offers' ? '#FFFFFF' : 'var(--t1)',
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
              color: activeTab === 'Staff' ? '#FFFFFF' : 'var(--t1)',
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
              color: activeTab === 'Analytics' ? '#FFFFFF' : 'var(--t1)',
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
                Live Diner Passes &amp; Service Orders
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                1-click admit guests, approve passes, and manage active diners for {restaurant.name}.
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
                      No active reservations currently in queue.
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
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {b.status === 'PENDING' && (
                            <button
                              className="btn btn-xs btn-success"
                              onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                            >
                              <CheckCircle2 size={12} /> Confirm
                            </button>
                          )}
                          {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                            <button
                              className="btn btn-xs btn-primary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                              onClick={() => handleStatusUpdate(b.id, 'SEATED')}
                              title="Admit guest into restaurant"
                            >
                              <CheckCircle2 size={12} /> 1-Click Admit
                            </button>
                          )}
                          {b.status === 'SEATED' && (
                            <>
                              <button
                                className="btn btn-xs btn-outline"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                                onClick={() => {
                                  const fullRes = reservations.find(r => r.id === b.id) || b;
                                  setPaymentModalBooking(fullRes);
                                }}
                                title="Add dishes to table tab"
                              >
                                <Utensils size={12} /> Add Dishes
                              </button>
                              <button
                                className="btn btn-xs btn-accent"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                                onClick={() => {
                                  const fullRes = reservations.find(r => r.id === b.id) || b;
                                  setPaymentModalBooking(fullRes);
                                }}
                                title="Generate bill & settle payment"
                              >
                                <Receipt size={12} /> Settle Bill
                              </button>
                            </>
                          )}
                          {b.status === 'COMPLETED' && (
                            <button
                              className="btn btn-xs btn-secondary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                              onClick={() => {
                                const fullRes = reservations.find(r => r.id === b.id) || b;
                                setPaymentModalBooking(fullRes);
                              }}
                              title="View settled invoice"
                            >
                              <Receipt size={12} /> View Bill
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.status !== 'SEATED' && (
                            <button
                              className="btn btn-xs btn-outline"
                              onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Menu Catalog &amp; Dish Photos
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Upload photos, edit dishes, and toggle live kitchen stock availability.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddDish}>
              <Plus size={14} /> Add New Dish
            </button>
          </div>

          {/* Search and Category Filter Toolbar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18, padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)' }} />
              <input
                type="text"
                placeholder="Search dishes by name or category..."
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: 'var(--r-xs)',
                  border: '1px solid var(--border)',
                  background: '#FFFFFF',
                  color: 'var(--t1)',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {['All', 'Starters', 'Main Course', 'Artisan Breads', 'Desserts', 'Beverages'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMenuCategory(cat)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: menuCategory === cat ? 'var(--primary)' : '#FFFFFF',
                    color: menuCategory === cat ? '#FFFFFF' : 'var(--t1)',
                    borderColor: menuCategory === cat ? 'var(--primary)' : 'var(--border)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpDown size={14} style={{ color: 'var(--t4)' }} />
              <select
                value={menuSort}
                onChange={e => setMenuSort(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--r-xs)',
                  border: '1px solid var(--border)',
                  background: '#FFFFFF',
                  color: 'var(--t1)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {filteredMenuItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
              <ChefHat size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontWeight: 600 }}>No dishes matched your filter.</p>
              <button
                className="btn btn-outline btn-xs"
                style={{ marginTop: 8 }}
                onClick={() => { setMenuSearch(''); setMenuCategory('All'); setMenuSort('default'); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
              {filteredMenuItems.map(item => {
                const inStock = item.isAvailable !== undefined ? item.isAvailable : item.available !== false;
                return (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      padding: 12,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      background: '#FFFFFF',
                      boxShadow: 'var(--shadow-xs)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', borderRadius: 'var(--r-xs)', objectFit: 'cover', border: '1px solid var(--border)' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          width: 14,
                          height: 14,
                          borderRadius: 2,
                          background: '#fff',
                          border: `1.5px solid ${item.isVeg ? '#10B981' : '#EF4444'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.isVeg ? '#10B981' : '#EF4444' }} />
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--t1)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--primary)', flexShrink: 0 }}>
                          ₹{item.price}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', margin: '2px 0' }}>{item.category}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 6 }}>
                        <button
                          className={`btn btn-xs ${inStock ? 'btn-success' : 'btn-outline'}`}
                          style={{ fontSize: 10.5, padding: '3px 8px' }}
                          onClick={() => toggleAvailability(item.id)}
                        >
                          {inStock ? '● In Stock' : '○ Out of Stock'}
                        </button>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-xs"
                            style={{ color: 'var(--primary)', padding: 4 }}
                            onClick={() => handleOpenEditDish(item)}
                            title="Edit Dish & Photo"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            style={{ color: '#EF4444', padding: 4 }}
                            onClick={() => handleDeleteDish(item.id)}
                            title="Delete Dish"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: PAYMENT QRS ================= */}
      {activeTab === 'PaymentQRs' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Payment UPI QR Codes &amp; Cashier Desks
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Upload restaurant UPI QR images to enable seamless instant mobile payments at checkout.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setQrForm({
                  id: null,
                  label: 'Billing Counter UPI',
                  upiId: 'spicegarden@okhdfcbank',
                  image: '',
                  isActive: paymentQrs.length === 0
                });
                setShowQrModal(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Upload size={14} /> Upload New Payment QR
            </button>
          </div>

          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#065F46',
            fontSize: 12.5,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <Sparkles size={18} style={{ flexShrink: 0, color: '#10B981' }} />
            <span>The designated <strong>Active Primary QR</strong> is rendered automatically to diners during checkout when they select UPI payment.</span>
          </div>

          {loadingQrs ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <div>Loading Payment QRs...</div>
            </div>
          ) : paymentQrs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border)', borderRadius: 'var(--r-md)' }}>
              <QrCode size={48} style={{ color: 'var(--t4)', margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>No Payment QRs Uploaded Yet</h4>
              <p style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 420, margin: '0 auto 16px' }}>
                Upload your restaurant UPI QR code image or billing desk scanner so campus students can pay instantly via PhonePe, GPay, or Paytm.
              </p>
              <button
                className="btn btn-primary btn-md"
                onClick={() => {
                  setQrForm({
                    id: null,
                    label: 'Main Billing Desk QR',
                    upiId: 'spicegarden@okhdfcbank',
                    image: '',
                    isActive: true
                  });
                  setShowQrModal(true);
                }}
              >
                <Plus size={16} /> Upload First Payment QR
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 18 }}>
              {paymentQrs.map(qr => (
                <div
                  key={qr.id}
                  style={{
                    border: qr.isActive ? '2px solid #10B981' : '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    padding: 18,
                    background: '#FFFFFF',
                    boxShadow: qr.isActive ? '0 4px 18px rgba(16, 185, 129, 0.15)' : 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  {qr.isActive && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: '#10B981',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 999,
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Check size={11} strokeWidth={3} /> ACTIVE
                    </div>
                  )}

                  <div style={{
                    width: 140,
                    height: 140,
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    padding: 8,
                    background: '#FAFAFA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12
                  }}>
                    {qr.image ? (
                      <img
                        src={qr.image}
                        alt={qr.label}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--r-xs)' }}
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${qr.upiId}&pn=${encodeURIComponent(restaurant.name)}`)}`}
                        alt="Dynamic UPI QR"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </div>

                  <h4 style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', marginBottom: 2 }}>{qr.label}</h4>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    fontFamily: 'monospace',
                    background: 'var(--bg-input)',
                    padding: '3px 10px',
                    borderRadius: 6,
                    marginBottom: 14
                  }}>
                    {qr.upiId}
                  </div>

                  <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 'auto' }}>
                    {!qr.isActive ? (
                      <button
                        className="btn btn-secondary btn-xs"
                        style={{ flex: 1, fontSize: 11, fontWeight: 700 }}
                        onClick={() => handleSetActiveQr(qr.id)}
                      >
                        Set as Active
                      </button>
                    ) : (
                      <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <CheckCircle size={13} /> Active in Checkout
                      </div>
                    )}
                    <button
                      className="btn btn-outline btn-xs"
                      style={{ padding: '4px 8px', color: '#000' }}
                      onClick={() => {
                        setQrForm({
                          id: qr.id,
                          label: qr.label,
                          upiId: qr.upiId,
                          image: qr.image || '',
                          isActive: qr.isActive
                        });
                        setShowQrModal(true);
                      }}
                      title="Edit QR"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs"
                      style={{ color: '#EF4444', padding: '4px 8px' }}
                      onClick={() => handleDeleteQr(qr.id)}
                      title="Delete QR"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <button className="modal-close" onClick={() => { setShowDishModal(false); setEditingDishId(null); }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDish}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Image Upload & Preview */}
                <div>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Dish Photo</span>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>Upload file or enter URL</span>
                  </label>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {dishForm.image ? (
                        <img src={dishForm.image} alt="Dish Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={28} style={{ color: 'var(--t4)' }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                      <input
                        type="file"
                        ref={dishFileInputRef}
                        accept="image/*"
                        onChange={handleDishFileUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
                        onClick={() => dishFileInputRef.current?.click()}
                      >
                        <Camera size={13} /> Upload Dish Photo
                      </button>
                      <input
                        className="form-input"
                        style={{ fontSize: 12, padding: '6px 10px' }}
                        placeholder="Or paste image URL (https://...)"
                        value={dishForm.image}
                        onChange={e => setDishForm({ ...dishForm, image: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

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

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="isVegDish"
                      checked={dishForm.veg === true}
                      onChange={() => setDishForm({ ...dishForm, veg: true })}
                    />
                    <span style={{ color: '#10B981' }}>● Pure Vegetarian</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="isVegDish"
                      checked={dishForm.veg === false}
                      onChange={() => setDishForm({ ...dishForm, veg: false })}
                    />
                    <span style={{ color: '#EF4444' }}>● Non-Vegetarian</span>
                  </label>
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
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowDishModal(false); setEditingDishId(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" disabled={dishSaving}>
                  {dishSaving ? 'Saving...' : (editingDishId ? 'Update Dish' : 'Add to Menu')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PAYMENT QR ================= */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-card anim-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-title font-display">{qrForm.id ? 'Edit Payment QR' : 'Upload Outlet Payment QR'}</h3>
                <div className="modal-sub">Enable direct student UPI payments for {restaurant.name}</div>
              </div>
              <button className="modal-close" onClick={() => setShowQrModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveQr}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* QR Code File Upload & Visual Preview */}
                <div>
                  <label className="form-label">QR Code Image</label>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 'var(--r-sm)',
                    border: '2px dashed var(--border)',
                    background: 'var(--bg-input)',
                    gap: 10
                  }}>
                    <div style={{
                      width: 130,
                      height: 130,
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      padding: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {qrForm.image ? (
                        <img src={qrForm.image} alt="QR Code Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : qrForm.upiId ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${qrForm.upiId}&pn=${encodeURIComponent(restaurant.name)}`)}`}
                          alt="Dynamic QR preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <QrCode size={48} style={{ color: 'var(--t4)' }} />
                      )}
                    </div>

                    <input
                      type="file"
                      ref={qrFileInputRef}
                      accept="image/*"
                      onChange={handleQrFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => qrFileInputRef.current?.click()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Upload size={14} /> Upload QR Image from Device
                    </button>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>PNG, JPG or SVG up to 5MB</span>
                  </div>
                </div>

                <div>
                  <label className="form-label">Counter / Desk Label *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. Main Billing Desk UPI"
                    value={qrForm.label}
                    onChange={e => setQrForm({ ...qrForm, label: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Merchant UPI ID (VPA) *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. spicegarden@okhdfcbank"
                    value={qrForm.upiId}
                    onChange={e => setQrForm({ ...qrForm, upiId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Or Image URL (Optional)</label>
                  <input
                    className="form-input"
                    placeholder="https://... (direct link to QR image)"
                    value={qrForm.image}
                    onChange={e => setQrForm({ ...qrForm, image: e.target.value })}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--r-xs)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <input
                    type="checkbox"
                    id="isActiveQr"
                    checked={qrForm.isActive}
                    onChange={e => setQrForm({ ...qrForm, isActive: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#10B981', cursor: 'pointer' }}
                  />
                  <label htmlFor="isActiveQr" style={{ fontSize: 12.5, fontWeight: 700, color: '#065F46', cursor: 'pointer' }}>
                    Set as Primary Active QR (Shown to diners at checkout)
                  </label>
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowQrModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" disabled={qrSaving}>
                  {qrSaving ? 'Saving...' : (qrForm.id ? 'Update Payment QR' : 'Save Payment QR')}
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
            handleStatusUpdate(matched.id, 'SEATED');
          }
        }}
      />

      {/* Bill Settlement & Order Management Modal (Owner View) */}
      {paymentModalBooking && (
        <PaymentModal
          booking={paymentModalBooking}
          onClose={() => setPaymentModalBooking(null)}
          initialBilledBy={{
            role: 'OWNER',
            name: user?.name ? `${user.name} (Restaurant Owner)` : 'Vikram Singhania (Restaurant Owner)'
          }}
          menuItems={menuItems}
          onOrdersUpdated={(updatedOrders) => {
            if (syncBookingOrders && paymentModalBooking) {
              syncBookingOrders(paymentModalBooking.id, updatedOrders);
            }
          }}
          onPaymentComplete={(paymentResult) => {
            if (staffCompletePayment && paymentModalBooking) {
              staffCompletePayment(paymentModalBooking.id, paymentResult);
            }
          }}
        />
      )}
    </div>
  );
}
