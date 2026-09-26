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
  Info,
  Leaf,
  MessageSquare
} from 'lucide-react';

const LUNCH_SLOTS = [
  { time: '12:00 PM', badge: 'Instant Confirm' },
  { time: '12:30 PM', badge: 'Fast Filling' },
  { time: '1:00 PM', badge: 'Peak Hour' },
  { time: '1:30 PM', badge: 'Instant Confirm' },
  { time: '2:00 PM', badge: 'Available' },
  { time: '2:30 PM', badge: 'Instant Confirm' },
  { time: '3:00 PM', badge: 'Late Lunch' }
];

const DINNER_SLOTS = [
  { time: '7:00 PM', badge: 'Instant Confirm' },
  { time: '7:30 PM', badge: 'Fast Filling' },
  { time: '8:00 PM', badge: 'Peak Hour' },
  { time: '8:30 PM', badge: 'Instant Confirm' },
  { time: '9:00 PM', badge: 'Campus Special' },
  { time: '9:30 PM', badge: 'Available' },
  { time: '10:00 PM', badge: 'Late Bites' }
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

  const [step, setStep] = useState(1); // 1: Date & Time, 2: Pre-order, 3: Occasion & Notes, 4: Confirmed
  const [session, setSession] = useState('lunch');
  const [selectedSlot, setSelectedSlot] = useState('1:00 PM');
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Pre-order dish state
  const [liveMenu, setLiveMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuFilter, setMenuFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [menuSearch, setMenuSearch] = useState('');
  const [preOrders, setPreOrders] = useState({});

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
      const curr = prev[item.id] || { id: item.id, name: item.name, price: item.price, qty: 0, isVeg: item.isVeg ?? item.veg ?? true };
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
      setStep(4);

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
    const isVeg = item.isVeg !== undefined ? item.isVeg : (item.veg !== undefined ? item.veg : true);
    if (menuFilter === 'veg' && !isVeg) return false;
    if (menuFilter === 'non-veg' && isVeg) return false;
    if (menuSearch && !item.name.toLowerCase().includes(menuSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-card modal-bottom-sheet anim-scale-in"
        style={{
          maxWidth: 620,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          borderRadius: 18,
          border: '1px solid #E8E2D5',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
          color: '#11120D'
        }}
      >
        {/* ── Modal Header ── */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid #E8E2D5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={restaurant.image}
              alt={restaurant.name}
              style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', border: '1px solid #E8E2D5' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif", fontSize: '1.25rem', fontWeight: 600, color: '#11120D', margin: 0 }}>
                  {step === 4 ? 'Reservation Confirmed' : restaurant.name}
                </h3>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: '#F6F2EA',
                  color: '#11120D',
                  border: '1px solid #E8E2D5',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Check size={11} /> Bennett Partner
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#565449', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span>{restaurant.cuisine}</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#11120D', fontWeight: 600 }}>
                  <Star size={11} fill="#11120D" /> {restaurant.rating || '4.8'}
                </span>
                <span>·</span>
                <span>{restaurant.distance || '0.8'} km</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              color: '#565449',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Stepper Navigation Bar (Steps 1 to 3) ── */}
        {step !== 4 && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E8E2D5',
            background: '#F6F2EA'
          }}>
            {[
              { num: 1, label: '1. Date & Time' },
              { num: 2, label: `2. Pre-Order ${preOrderList.length > 0 ? `(${preOrderList.length})` : ''}` },
              { num: 3, label: '3. Occasion & Notes' }
            ].map(s => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? '#11120D' : (isPast ? '#27272A' : '#565449'),
                    borderBottom: `2px solid ${isActive ? '#11120D' : 'transparent'}`,
                    background: isActive ? '#FFFFFF' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 22, background: '#FFFFFF' }}>
          <AnimatePresence mode="wait">
            {/* STEP 1: DATE, GUESTS & TIME */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                {/* 1. Date Selector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#11120D', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="#11120D" />
                      Select Dining Date
                    </label>
                    <span style={{ fontSize: 12, color: '#565449', fontWeight: 600 }}>
                      {selectedDate.formatted}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    {dateOptions.map(d => {
                      const isSelected = selectedDate.iso === d.iso;
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          style={{
                            minWidth: 74,
                            padding: '8px 4px',
                            borderRadius: 8,
                            border: `1px solid ${isSelected ? '#11120D' : '#E8E2D5'}`,
                            background: isSelected ? '#11120D' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#565449',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: isSelected ? '#FFFFFF' : '#565449' }}>
                            {d.weekday}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>
                            {d.dayNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Number of Diners */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#11120D', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} color="#11120D" />
                      Number of Diners
                    </label>
                    <span style={{ fontSize: 11.5, color: '#565449' }}>
                      {guests === 1 ? 'Solo Dining' : guests <= 4 ? 'Standard Table' : 'Large Group'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(count => {
                      const isSelected = guests === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setGuests(count)}
                          style={{
                            flex: 1,
                            minWidth: 40,
                            height: 40,
                            borderRadius: 8,
                            border: `1px solid ${isSelected ? '#11120D' : '#E8E2D5'}`,
                            background: isSelected ? '#11120D' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#11120D',
                            fontWeight: 600,
                            fontSize: 13.5,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {count === 8 ? '8+' : count}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Session & Time Slot Selector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#11120D', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="#11120D" />
                      Seating Window &amp; Slot
                    </label>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: '#F0FDF4',
                      color: '#16A34A',
                      border: '1px solid #BBF7D0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Zap size={11} /> Instant Seating
                    </span>
                  </div>

                  {/* Lunch vs Dinner Pill Toggle */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSession('lunch');
                        setSelectedSlot('1:00 PM');
                      }}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: `1px solid ${session === 'lunch' ? '#11120D' : '#E8E2D5'}`,
                        background: session === 'lunch' ? '#11120D' : '#FFFFFF',
                        color: session === 'lunch' ? '#FFFFFF' : '#565449',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        fontWeight: 600,
                        fontSize: 12.5,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Sun size={14} />
                      Lunch (12:00 – 3:30 PM)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSession('dinner');
                        setSelectedSlot('8:00 PM');
                      }}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: `1px solid ${session === 'dinner' ? '#11120D' : '#E8E2D5'}`,
                        background: session === 'dinner' ? '#11120D' : '#FFFFFF',
                        color: session === 'dinner' ? '#FFFFFF' : '#565449',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        fontWeight: 600,
                        fontSize: 12.5,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Moon size={14} />
                      Dinner (7:00 – 11:00 PM)
                    </button>
                  </div>

                  {/* Slot Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6 }}>
                    {(session === 'lunch' ? LUNCH_SLOTS : DINNER_SLOTS).map(s => {
                      const isSelected = selectedSlot === s.time;
                      return (
                        <button
                          key={s.time}
                          type="button"
                          onClick={() => setSelectedSlot(s.time)}
                          style={{
                            padding: '8px 6px',
                            borderRadius: 8,
                            border: `1px solid ${isSelected ? '#11120D' : '#E8E2D5'}`,
                            background: isSelected ? '#11120D' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#11120D',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.time}</div>
                          <div style={{ fontSize: 9.5, color: isSelected ? '#E8E2D5' : '#565449', fontWeight: 500 }}>
                            {s.badge}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PRE-ORDER SPECIALTIES */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, color: '#11120D', margin: 0 }}>
                        Pre-Order Kitchen Dishes
                      </h4>
                      <p style={{ fontSize: 12, color: '#565449', margin: '2px 0 0' }}>
                        Optional: Order in advance so food is ready when you arrive.
                      </p>
                    </div>

                    {preOrderTotal > 0 && (
                      <span style={{
                        background: '#11120D',
                        color: '#FFFFFF',
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 99,
                      }}>
                        Total: ₹{preOrderTotal}
                      </span>
                    )}
                  </div>

                  {/* Filter and Search Bar */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, padding: '7px 10px', fontSize: 12.5 }}
                      placeholder="Search menu items..."
                      value={menuSearch}
                      onChange={e => setMenuSearch(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => setMenuFilter('all')}
                        style={{
                          padding: '6px 12px',
                          minHeight: 32,
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          border: `1px solid ${menuFilter === 'all' ? '#11120D' : '#E8E2D5'}`,
                          background: menuFilter === 'all' ? '#11120D' : '#FFFFFF',
                          color: menuFilter === 'all' ? '#FFFFFF' : '#565449',
                          cursor: 'pointer'
                        }}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuFilter('veg')}
                        style={{
                          padding: '6px 12px',
                          minHeight: 32,
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          border: `1px solid ${menuFilter === 'veg' ? '#11120D' : '#E8E2D5'}`,
                          background: menuFilter === 'veg' ? '#11120D' : '#FFFFFF',
                          color: menuFilter === 'veg' ? '#FFFFFF' : '#565449',
                          cursor: 'pointer'
                        }}
                      >
                        Veg
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dish List */}
                {menuLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#565449', fontSize: 12.5 }}>
                    Loading fresh kitchen catalog...
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#565449', fontSize: 12.5 }}>
                    No matching dishes found. You can still proceed to reserve your table.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                    {filteredMenuItems.map(item => {
                      const isVeg = item.isVeg !== undefined ? item.isVeg : (item.veg !== undefined ? item.veg : true);
                      const qty = preOrders[item.id]?.qty || 0;
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: `1px solid ${qty > 0 ? '#11120D' : '#E8E2D5'}`,
                            background: qty > 0 ? '#F6F2EA' : '#FFFFFF',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <span style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: isVeg ? '#16A34A' : '#DC2626',
                              flexShrink: 0
                            }} />
                            <div>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#11120D' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: 11.5, color: '#565449' }}>
                                ₹{item.price} {item.category ? `· ${item.category}` : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {qty > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => handlePreOrderChange(item, -1)}
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    border: '1px solid #E8E2D5',
                                    background: '#F6F2EA',
                                    color: '#11120D',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Minus size={12} />
                                </button>
                                <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 16, textAlign: 'center', color: '#11120D' }}>
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handlePreOrderChange(item, 1)}
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    border: '1px solid #11120D',
                                    background: '#11120D',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePreOrderChange(item, 1)}
                                style={{
                                  padding: '5px 12px',
                                  minHeight: 28,
                                  borderRadius: 6,
                                  border: '1px solid #E8E2D5',
                                  background: '#FFFFFF',
                                  color: '#11120D',
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: OCCASION & SPECIAL NOTES */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* Occasions */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#11120D', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Sparkles size={14} color="#11120D" />
                    Campus Occasion
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {OCCASIONS.map(occ => {
                      const isSelected = occasion === occ;
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => setOccasion(occ)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: `1px solid ${isSelected ? '#11120D' : '#E8E2D5'}`,
                            background: isSelected ? '#11120D' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#565449',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {occ}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Request Notes */}
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#11120D', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <MessageSquare size={14} color="#11120D" />
                    Seating Preferences or Dietary Notes (Optional)
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="e.g. Quiet corner table for study group, wheelchair access, low spice..."
                    value={specialNotes}
                    onChange={e => setSpecialNotes(e.target.value)}
                    style={{ width: '100%', resize: 'none', fontSize: 12.5 }}
                  />
                </div>

                {/* Reservation Summary Preview */}
                <div style={{
                  background: '#F6F2EA',
                  border: '1px solid #E8E2D5',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 12,
                }}>
                  <div style={{ fontWeight: 700, color: '#11120D', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10.5 }}>
                    Reservation Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, color: '#565449' }}>
                    <div>Date: <strong style={{ color: '#11120D' }}>{selectedDate.formatted}</strong></div>
                    <div>Slot: <strong style={{ color: '#11120D' }}>{selectedSlot}</strong></div>
                    <div>Party: <strong style={{ color: '#11120D' }}>{guests} Diners</strong></div>
                    <div>Pre-orders: <strong style={{ color: '#11120D' }}>{preOrderList.length} items (₹{preOrderTotal})</strong></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && confirmedBooking && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{ textAlign: 'center', padding: '10px 0' }}
              >
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <CheckCircle2 size={28} />
                </div>

                <h3 style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: '#11120D', margin: '0 0 4px' }}>
                  Dining Pass Confirmed!
                </h3>
                <p style={{ fontSize: 12.5, color: '#565449', margin: '0 0 16px' }}>
                  Your table at {restaurant.name} is reserved with Bennett Tier-1 priority.
                </p>

                {/* Digital Ticket Preview Box */}
                <div style={{
                  background: '#F6F2EA',
                  border: '1px solid #E8E2D5',
                  borderRadius: 12,
                  padding: 16,
                  maxWidth: 340,
                  margin: '0 auto 14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <img
                      src={confirmedBooking.qrCode}
                      alt="Booking QR Code"
                      style={{ width: 130, height: 130, borderRadius: 6, background: '#FFFFFF', padding: 4, border: '1px solid #E8E2D5' }}
                    />
                  </div>

                  <div style={{ fontSize: 10, color: '#565449', fontWeight: 600, letterSpacing: '0.06em' }}>
                    BOOKING REFERENCE
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#11120D', letterSpacing: '0.04em', margin: '2px 0 8px', fontFamily: 'monospace' }}>
                    {confirmedBooking.id}
                  </div>

                  <div style={{ borderTop: '1px dashed #D8CFBC', paddingTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11.5, textAlign: 'left' }}>
                    <div><span style={{ color: '#565449' }}>Date:</span> <strong style={{ color: '#11120D' }}>{confirmedBooking.date}</strong></div>
                    <div><span style={{ color: '#565449' }}>Time:</span> <strong style={{ color: '#11120D' }}>{confirmedBooking.time}</strong></div>
                    <div><span style={{ color: '#565449' }}>Guests:</span> <strong style={{ color: '#11120D' }}>{confirmedBooking.guests} Diners</strong></div>
                    <div><span style={{ color: '#565449' }}>Occasion:</span> <strong style={{ color: '#11120D' }}>{occasion}</strong></div>
                  </div>
                </div>

                <div style={{ fontSize: 11.5, color: '#565449', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Info size={12} color="#565449" />
                  Pass stored in your account. Present QR at the host desk.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Modal Footer ── */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid #E8E2D5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#F6F2EA'
        }}>
          {step === 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: 12, color: '#565449' }}>
                {selectedDate.weekday} · {selectedSlot} · {guests} Diners
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setStep(2)}
                  style={{ borderRadius: 99, padding: '8px 18px', minHeight: 36, fontWeight: 600 }}
                >
                  Next: Pre-Order <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setStep(1)}
              >
                <ChevronLeft size={13} /> Back
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setStep(3)}
                >
                  Skip Pre-Order
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setStep(3)}
                  style={{ borderRadius: 99, padding: '8px 18px', minHeight: 36, fontWeight: 600 }}
                >
                  Next: Occasion <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setStep(2)}
              >
                <ChevronLeft size={13} /> Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting}
                onClick={handleConfirmReservation}
                style={{ borderRadius: 99, padding: '9px 20px', minHeight: 38, fontWeight: 600, gap: 6 }}
              >
                {isSubmitting ? (
                  'Confirming Table...'
                ) : (
                  <>
                    <Sparkles size={13} /> Confirm Reservation {preOrderList.length > 0 && `(₹${preOrderTotal})`}
                  </>
                )}
              </button>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                type="button"
                className="btn btn-outline btn-md"
                style={{ flex: 1, fontWeight: 600, borderRadius: 99 }}
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
              >
                <QrCode size={14} /> View in My Bookings
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                style={{ flex: 1, fontWeight: 600, borderRadius: 99 }}
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
