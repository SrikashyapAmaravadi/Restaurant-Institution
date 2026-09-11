import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import api from '../services/api';
import {
  Calendar,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  Utensils,
  QrCode,
  ShieldCheck,
  Sun,
  Moon,
  Plus,
  Minus,
  Check,
  Zap,
  MapPin,
  Star,
  Info
} from 'lucide-react';

const LUNCH_SLOTS = [
  { time: '12:00 PM', badge: 'Instant Confirm', popular: false },
  { time: '12:30 PM', badge: 'Fast Filling', popular: true },
  { time: '1:00 PM', badge: 'Peak Campus Hour', popular: true },
  { time: '1:30 PM', badge: 'Instant Confirm', popular: false },
  { time: '2:00 PM', badge: 'Available', popular: false },
  { time: '2:30 PM', badge: 'Instant Confirm', popular: false },
  { time: '3:00 PM', badge: 'Late Lunch', popular: false }
];

const DINNER_SLOTS = [
  { time: '7:00 PM', badge: 'Instant Confirm', popular: false },
  { time: '7:30 PM', badge: 'Evening Rush', popular: true },
  { time: '8:00 PM', badge: 'Fast Filling', popular: true },
  { time: '8:30 PM', badge: 'Instant Confirm', popular: false },
  { time: '9:00 PM', badge: 'Campus Special', popular: true },
  { time: '9:30 PM', badge: 'Available', popular: false },
  { time: '10:00 PM', badge: 'Late Bites', popular: false }
];

const OCCASIONS = [
  'Casual Dining',
  'Study Group',
  'Birthday Celebration',
  'Faculty / Club Meet',
  'Date Night',
  'Exam Treat'
];

export default function BookingModal({ restaurant, onClose, onBookingSuccess }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createReservation } = useDining();

  const [step, setStep] = useState(1);
  const [session, setSession] = useState('lunch'); // 'lunch' | 'dinner'
  const [selectedSlot, setSelectedSlot] = useState('1:00 PM');
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialNotes, setSpecialNotes] = useState('');
  const [customDatePicked, setCustomDatePicked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Pre-order dish state
  const [liveMenu, setLiveMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuFilter, setMenuFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [preOrders, setPreOrders] = useState({}); // { [dishId]: { name, price, qty, isVeg } }

  // Generate 7 consecutive dynamic dates starting from today
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      dates.push({ iso, weekday, dayNum, formatted });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);

  // Load live menu items for pre-ordering
  useEffect(() => {
    if (!restaurant?.id) return;
    if (restaurant.menuItems && restaurant.menuItems.length > 0) {
      setLiveMenu(restaurant.menuItems);
      return;
    }
    setMenuLoading(true);
    api.restaurants.getById(restaurant.id)
      .then(res => {
        if (res.data?.menuItems) {
          setLiveMenu(res.data.menuItems);
        }
      })
      .catch(err => console.warn('Could not load menu items for pre-order:', err))
      .finally(() => setMenuLoading(false));
  }, [restaurant]);

  // Pre-order items total computation
  const preOrderList = Object.values(preOrders).filter(p => p.qty > 0);
  const preOrderTotal = preOrderList.reduce((acc, p) => acc + (p.price * p.qty), 0);

  const handlePreOrderChange = (item, delta) => {
    setPreOrders(prev => {
      const curr = prev[item.id] || { id: item.id, name: item.name, price: item.price, qty: 0, isVeg: item.isVeg ?? item.veg };
      const newQty = Math.max(0, curr.qty + delta);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: { ...curr, qty: newQty } };
    });
  };

  const handleConfirmReservation = async () => {
    if (!user) {
      alert('Please sign in to reserve a table at partner venues.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `DB-${randomNum}`;

    const ordersToSave = preOrderList.map(p => ({
      name: p.name,
      price: p.price,
      quantity: p.qty
    }));

    const bookingPayload = {
      id: bookingCode,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.image,
      userId: user.id,
      date: selectedDate.formatted,
      time: selectedSlot,
      guests: Number(guests),
      guestName: user.name || 'Campus Scholar',
      guestEmail: user.email,
      specialRequest: `${occasion}${specialNotes ? ` · ${specialNotes}` : ''}`,
      tableAssigned: null,
      orders: ordersToSave,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${bookingCode}-BENNETT-VERIFIED`
    };

    try {
      const saved = await createReservation(bookingPayload);

      // Trigger festive confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // safe fallback
      }

      setConfirmedBooking(saved || bookingPayload);
      setStep(3);

      if (onBookingSuccess) {
        onBookingSuccess(saved || bookingPayload);
      }
    } catch (err) {
      alert('Could not confirm reservation: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMenuItems = liveMenu.filter(item => {
    const isVeg = item.isVeg !== undefined ? item.isVeg : item.veg;
    if (menuFilter === 'veg') return isVeg;
    if (menuFilter === 'non-veg') return !isVeg;
    return true;
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-bottom-sheet anim-scale-in" style={{ maxWidth: 660, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Sheet Drag Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.15)', margin: '8px auto 2px', display: 'none' }} className="mobile-only-block" />

        {/* Campus Modal Header */}
        <div className="modal-hd" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={restaurant.image}
              alt={restaurant.name}
              style={{ width: 50, height: 50, borderRadius: 'var(--r-sm)', objectFit: 'cover', border: '1px solid var(--border)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 className="modal-title font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {step === 3 ? 'Reservation Confirmed' : restaurant.name}
                </h3>
                <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Check size={11} /> Verified Outlet
                </span>
              </div>
              <div className="modal-sub" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span>{restaurant.cuisine}</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontWeight: 700 }}>
                  <Star size={12} fill="#f59e0b" /> {restaurant.rating || '4.8'}
                </span>
                <span>·</span>
                <span>{restaurant.distance || '0.8'} km from Campus</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Stepper Bar */}
        {step !== 3 && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <div
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 12.5,
                fontWeight: 700,
                textAlign: 'center',
                cursor: 'pointer',
                color: step === 1 ? 'var(--primary)' : 'var(--t3)',
                borderBottom: `2.5px solid ${step === 1 ? 'var(--primary)' : 'transparent'}`,
                background: step === 1 ? 'var(--bg-surface)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              1. Date, Diners &amp; Slot
            </div>
            <div
              onClick={() => setStep(2)}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 12.5,
                fontWeight: 700,
                textAlign: 'center',
                cursor: 'pointer',
                color: step === 2 ? 'var(--primary)' : 'var(--t3)',
                borderBottom: `2.5px solid ${step === 2 ? 'var(--primary)' : 'transparent'}`,
                background: step === 2 ? 'var(--bg-surface)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              2. Pre-Order Dishes ({preOrderList.length} items)
            </div>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: 22 }}>
          {/* STEP 1: DATE, GUESTS & TIME SLOTS */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {/* 1. Date Selector (Campus Style Chips) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Calendar size={14} className="text-amber-400" />
                    Select Reservation Date
                  </label>
                  <label style={{ fontSize: 11.5, color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>Pick other date</span>
                    <input
                      type="date"
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      min={dateOptions[0].iso}
                      onChange={(e) => {
                        const d = new Date(e.target.value);
                        setSelectedDate({
                          iso: e.target.value,
                          weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
                          dayNum: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                          formatted: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                        });
                        setCustomDatePicked(true);
                      }}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {dateOptions.map((d) => {
                    const isSelected = selectedDate.iso === d.iso;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        className={`slot-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedDate(d);
                          setCustomDatePicked(false);
                        }}
                        style={{
                          minWidth: 78,
                          padding: '10px 8px',
                          borderRadius: 'var(--r-sm)',
                          border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? '#fff' : 'var(--t2)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 3,
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 0 12px rgba(245, 158, 11, 0.25)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? 'var(--accent)' : 'var(--t3)' }}>
                          {d.weekday}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>
                          {d.dayNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Number of Diners (Horizontal Pill Bar) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Users size={14} className="text-emerald-400" />
                    Number of Diners
                  </label>
                  <span style={{ fontSize: 11.5, color: 'var(--t4)' }}>
                    {guests === 1 ? 'Solo Dining' : guests <= 4 ? 'Standard Booth' : 'Social Group Banquet'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(count => {
                    const isSelected = guests === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        className={`slot-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => setGuests(count)}
                        style={{
                          flex: 1,
                          minWidth: 44,
                          height: 44,
                          borderRadius: 'var(--r-sm)',
                          border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                          color: isSelected ? '#fff' : 'var(--t2)',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 12px var(--primary-glow)' : 'none'
                        }}
                      >
                        {count === 8 ? '8+' : count}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Session Windows: Lunch vs Dinner */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Clock size={14} style={{ color: 'var(--primary)' }} />
                    Select Seating Window &amp; Slot
                  </label>
                  <span className="badge badge-accent" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={11} /> Instant Table Lock
                  </span>
                </div>

                {/* Session Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSession('lunch');
                      setSelectedSlot('1:00 PM');
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--r-sm)',
                      border: `1.5px solid ${session === 'lunch' ? 'var(--primary)' : 'var(--border)'}`,
                      background: session === 'lunch' ? '#EFF6FF' : '#F8FAFC',
                      color: session === 'lunch' ? 'var(--primary)' : 'var(--t3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontWeight: 700,
                      fontSize: 13
                    }}
                  >
                    <Sun size={15} style={{ color: session === 'lunch' ? 'var(--primary)' : 'inherit' }} />
                    Lunch (12:00 – 3:30 PM)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSession('dinner');
                      setSelectedSlot('8:00 PM');
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--r-sm)',
                      border: `1.5px solid ${session === 'dinner' ? 'var(--primary)' : 'var(--border)'}`,
                      background: session === 'dinner' ? '#EFF6FF' : '#F8FAFC',
                      color: session === 'dinner' ? 'var(--primary)' : 'var(--t3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontWeight: 700,
                      fontSize: 13
                    }}
                  >
                    <Moon size={15} style={{ color: session === 'dinner' ? 'var(--primary)' : 'inherit' }} />
                    Dinner (7:00 – 11:00 PM)
                  </button>
                </div>

                {/* Slot Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                  {(session === 'lunch' ? LUNCH_SLOTS : DINNER_SLOTS).map(s => {
                    const isSelected = selectedSlot === s.time;
                    return (
                      <button
                        key={s.time}
                        type="button"
                        className={`slot-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedSlot(s.time)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--r-sm)',
                          border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          color: isSelected ? 'var(--primary)' : 'var(--t2)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 3,
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(30, 58, 138, 0.1)' : 'none'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.time}</div>
                        <div style={{ fontSize: 9.5, color: isSelected ? 'var(--primary)' : 'var(--t4)', fontWeight: 600 }}>
                          {s.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dining Occasion Chips */}
              <div>
                <label className="form-label" style={{ marginBottom: 8, display: 'block', fontWeight: 700 }}>
                  Dining Occasion
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {OCCASIONS.map(occ => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccasion(occ)}
                      className={`chip ${occasion === occ ? 'on' : ''}`}
                      style={{ fontSize: 12, padding: '6px 14px' }}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assurance Guarantee Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 'var(--r-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} className="flex-shrink-0" />
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                  <strong>Bennett Dining Assurance:</strong> Zero booking fees. 100% verified institutional reservation with a 15-minute arrival window.
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PRE-ORDER LIVE MENU & KITCHEN NOTES */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Live Menu Pre-Order Section */}
              <div style={{ padding: 16, borderRadius: 'var(--r)', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Utensils size={15} style={{ color: 'var(--primary)' }} />
                      Pre-Order from Live Kitchen Menu
                      <span className="badge badge-accent" style={{ fontSize: 10 }}>Optional</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>
                      Dishes will be prepared fresh upon your check-in!
                    </div>
                  </div>

                  {/* Veg / Non-Veg Quick Filter */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setMenuFilter('all')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        borderRadius: 'var(--r-xs)',
                        border: `1px solid ${menuFilter === 'all' ? 'var(--primary)' : 'var(--border)'}`,
                        background: menuFilter === 'all' ? 'var(--bg-subtle)' : '#FFFFFF',
                        color: menuFilter === 'all' ? 'var(--primary)' : 'var(--t2)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuFilter('veg')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        borderRadius: 'var(--r-xs)',
                        border: `1px solid ${menuFilter === 'veg' ? '#16A34A' : 'var(--border)'}`,
                        background: menuFilter === 'veg' ? '#F0FDF4' : '#FFFFFF',
                        color: '#16A34A',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuFilter('non-veg')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        borderRadius: 'var(--r-xs)',
                        border: `1px solid ${menuFilter === 'non-veg' ? '#DC2626' : 'var(--border)'}`,
                        background: menuFilter === 'non-veg' ? '#FEF2F2' : '#FFFFFF',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>

                {menuLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--t4)' }}>
                    Loading menu items...
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--t4)', textAlign: 'center', padding: '16px 0' }}>
                    No pre-order items available in this category.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                    {filteredMenuItems.slice(0, 10).map(item => {
                      const qty = preOrders[item.id]?.qty || 0;
                      const isVeg = item.isVeg !== undefined ? item.isVeg : item.veg;
                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--r-sm)',
                            background: qty > 0 ? 'var(--bg-subtle)' : '#FFFFFF',
                            border: `1px solid ${qty > 0 ? 'var(--primary)' : 'var(--border)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 14, height: 14, borderRadius: 3, border: isVeg ? '1.5px solid #16A34A' : '1.5px solid #DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isVeg ? '#16A34A' : '#DC2626' }} />
                            </span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{item.name}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--primary)', fontWeight: 600 }}>₹{item.price}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {qty > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', padding: '3px 8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handlePreOrderChange(item, -1)}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                  <Minus size={13} />
                                </button>
                                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handlePreOrderChange(item, 1)}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 12px', fontSize: 11.5 }}
                                onClick={() => handlePreOrderChange(item, 1)}
                              >
                                + Pre-Order
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {preOrderList.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--t2)' }}>
                      Pre-Ordered <strong>{preOrderList.reduce((a, b) => a + b.qty, 0)} items</strong>
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--primary)' }}>
                      Estimated Subtotal: ₹{preOrderTotal}
                    </span>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div>
                <label className="form-label" style={{ marginBottom: 6, display: 'block', fontWeight: 600 }}>
                  Kitchen &amp; Dining Notes <span style={{ color: 'var(--t4)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Mild spice preference, birthday celebration, dietary requirements..."
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  style={{ width: '100%', borderRadius: 'var(--r-sm)', padding: 10, border: '1px solid var(--border)' }}
                />
              </div>

              {/* Summary Card */}
              <div style={{ padding: 14, borderRadius: 'var(--r-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 12.5 }}>
                <div><span style={{ color: 'var(--t4)' }}>Date:</span> <strong>{selectedDate.formatted}</strong></div>
                <div><span style={{ color: 'var(--t4)' }}>Slot:</span> <strong>{selectedSlot}</strong></div>
                <div><span style={{ color: 'var(--t4)' }}>Party:</span> <strong>{guests} {guests === 1 ? 'Guest' : 'Guests'}</strong></div>
                <div><span style={{ color: 'var(--t4)' }}>Occasion:</span> <strong>{occasion}</strong></div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CONFIRMED DIGITAL PASS */}
          {step === 3 && confirmedBooking && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              style={{ textAlign: 'center', padding: '16px 8px' }}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-subtle)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--primary)' }}>
                <CheckCircle2 size={32} />
              </div>

              <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
                Reservation Confirmed!
              </h3>
              <p style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 420, margin: '0 auto 20px' }}>
                Your dining pass is live in the Bennett central network. Present the digital pass or QR code at {confirmedBooking.restaurantName}.
              </p>

              {/* Verified Digital Boarding Pass Card */}
              <div
                style={{
                  maxWidth: 380,
                  margin: '0 auto 20px',
                  background: '#FFFFFF',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r)',
                  padding: 20,
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Accent Ribbon */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Bennett Verified Pass
                    </span>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: 10 }}>
                    ● Confirmed
                  </span>
                </div>

                {/* Scannable Live QR Code */}
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', padding: 8, borderRadius: 'var(--r-xs)', width: 140, height: 140, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={confirmedBooking.qrCode}
                    alt="Booking QR Code"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ fontSize: 11, color: 'var(--t4)', letterSpacing: '0.05em' }}>
                  BOOKING REFERENCE
                </div>
                <div className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.08em', marginBottom: 12 }}>
                  {confirmedBooking.id}
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'left', fontSize: 12 }}>
                  <div><span style={{ color: 'var(--t4)' }}>Date:</span> <strong style={{ color: 'var(--t1)' }}>{confirmedBooking.date}</strong></div>
                  <div><span style={{ color: 'var(--t4)' }}>Time:</span> <strong style={{ color: 'var(--t1)' }}>{confirmedBooking.time}</strong></div>
                  <div><span style={{ color: 'var(--t4)' }}>Guests:</span> <strong style={{ color: 'var(--t1)' }}>{confirmedBooking.guests} Diners</strong></div>
                  <div><span style={{ color: 'var(--t4)' }}>Occasion:</span> <strong style={{ color: 'var(--primary)' }}>{occasion}</strong></div>
                </div>

                {preOrderList.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', textAlign: 'left', fontSize: 11.5 }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 4 }}>Pre-Ordered Kitchen Dishes:</div>
                    {preOrderList.map(p => (
                      <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t2)' }}>
                        <span>{p.qty}x {p.name}</span>
                        <span>₹{p.price * p.qty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11.5, color: 'var(--t3)' }}>
                <Info size={14} className="text-amber-400" />
                Reserved for: <strong>{confirmedBooking.guestName}</strong>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-ft" style={{ borderTop: '1px solid var(--border)', padding: '16px 22px' }}>
          {step === 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                {selectedDate.weekday}, {selectedDate.dayNum} · {selectedSlot} · {guests} Diners
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStep(2)}
                >
                  Next: Pre-Order Dishes <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: 13 }}
                onClick={() => setStep(1)}
              >
                <ChevronLeft size={15} /> Back
              </button>
              <button
                type="button"
                className="btn-accent"
                disabled={isSubmitting}
                onClick={handleConfirmReservation}
              >
                {isSubmitting ? (
                  <>Confirming Reservation...</>
                ) : (
                  <>
                    <Sparkles size={15} /> Confirm Reservation {preOrderList.length > 0 && `(₹${preOrderTotal})`}
                  </>
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
              >
                <QrCode size={15} /> View in My Bookings
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={onClose}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
