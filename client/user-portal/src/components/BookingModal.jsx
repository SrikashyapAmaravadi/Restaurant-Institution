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
  Sun,
  Moon,
  Plus,
  Minus,
  Check,
  Zap,
  Star,
  Info,
  MessageSquare,
  QrCode,
  Search,
  Leaf,
} from 'lucide-react';

const LUNCH_SLOTS = [
  { time: '12:00 PM', badge: 'Instant Confirm' },
  { time: '12:30 PM', badge: 'Fast Filling' },
  { time: '1:00 PM', badge: 'Peak Hour' },
  { time: '1:30 PM', badge: 'Instant Confirm' },
  { time: '2:00 PM', badge: 'Available' },
  { time: '2:30 PM', badge: 'Instant Confirm' },
  { time: '3:00 PM', badge: 'Late Lunch' },
];

const DINNER_SLOTS = [
  { time: '7:00 PM', badge: 'Instant Confirm' },
  { time: '7:30 PM', badge: 'Fast Filling' },
  { time: '8:00 PM', badge: 'Peak Hour' },
  { time: '8:30 PM', badge: 'Instant Confirm' },
  { time: '9:00 PM', badge: 'Campus Special' },
  { time: '9:30 PM', badge: 'Available' },
  { time: '10:00 PM', badge: 'Late Bites' },
];

const OCCASIONS = [
  { label: 'Casual Dining', emoji: '🍽️' },
  { label: 'Study Group', emoji: '📚' },
  { label: 'Birthday Celebration', emoji: '🎂' },
  { label: 'Faculty / Club Meet', emoji: '🤝' },
  { label: 'Date Night', emoji: '✨' },
  { label: 'Exam Treat', emoji: '🎉' },
];

const BADGE_COLOR = {
  'Instant Confirm': { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  'Fast Filling': { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  'Peak Hour': { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  'Available': { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  'Campus Special': { bg: '#F6F2EA', color: '#565449', border: '#D8CFBC' },
  'Late Lunch': { bg: '#F6F2EA', color: '#565449', border: '#D8CFBC' },
  'Late Bites': { bg: '#F6F2EA', color: '#565449', border: '#D8CFBC' },
};

export default function BookingModal({ restaurant, onClose, onBookingSuccess }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createReservation } = useDining();

  const [step, setStep] = useState(1);
  const [session, setSession] = useState('lunch');
  const [selectedSlot, setSelectedSlot] = useState('1:00 PM');
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const [liveMenu, setLiveMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuFilter, setMenuFilter] = useState('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [preOrders, setPreOrders] = useState({});

  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      dates.push({ iso, weekday, dayNum, month, formatted });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);

  useEffect(() => {
    if (!restaurant?.id) return;
    if (restaurant.menuItems && restaurant.menuItems.length > 0) {
      setLiveMenu(restaurant.menuItems);
      return;
    }
    setMenuLoading(true);
    api.restaurants.getById(restaurant.id)
      .then(res => { if (res.data?.menuItems) setLiveMenu(res.data.menuItems); })
      .catch(() => {})
      .finally(() => setMenuLoading(false));
  }, [restaurant]);

  const preOrderList = Object.values(preOrders).filter(p => p.qty > 0);
  const preOrderTotal = preOrderList.reduce((acc, p) => acc + p.price * p.qty, 0);

  const handlePreOrderChange = (item, delta) => {
    setPreOrders(prev => {
      const curr = prev[item.id] || { id: item.id, name: item.name, price: item.price, qty: 0, isVeg: item.isVeg ?? item.veg ?? true };
      const newQty = Math.max(0, curr.qty + delta);
      if (newQty === 0) { const c = { ...prev }; delete c[item.id]; return c; }
      return { ...prev, [item.id]: { ...curr, qty: newQty } };
    });
  };

  const handleConfirmReservation = async () => {
    if (!user) { navigate('/login'); return; }
    setIsSubmitting(true);
    const bookingCode = `DB-${Math.floor(1000 + Math.random() * 9000)}`;
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
      orders: preOrderList.map(p => ({ name: p.name, price: p.price, quantity: p.qty })),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingCode}-BENNETT-VERIFIED`,
    };
    try {
      const saved = await createReservation(bookingPayload);
      try { confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } }); } catch {}
      setConfirmedBooking(saved || bookingPayload);
      setStep(4);
      if (onBookingSuccess) onBookingSuccess(saved || bookingPayload);
    } catch (err) {
      alert('Could not confirm reservation: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMenuItems = liveMenu.filter(item => {
    const isVeg = item.isVeg !== undefined ? item.isVeg : item.veg !== undefined ? item.veg : true;
    if (menuFilter === 'veg' && !isVeg) return false;
    if (menuFilter === 'non-veg' && isVeg) return false;
    if (menuSearch && !item.name.toLowerCase().includes(menuSearch.toLowerCase())) return false;
    return true;
  });

  const STEPS = [
    { num: 1, label: 'Date & Time' },
    { num: 2, label: 'Pre-Order' },
    { num: 3, label: 'Notes' },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="anim-scale-in"
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          borderRadius: 22,
          border: '1px solid #E8E2D5',
          overflow: 'hidden',
          boxShadow: '0 32px 64px -12px rgba(17,18,13,0.22), 0 8px 24px -4px rgba(17,18,13,0.08)',
        }}
      >

        {/* ── Rich Hero Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #11120D 0%, #252820 60%, #1A1B16 100%)',
          padding: '20px 22px 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(216,207,188,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(216,207,188,0.3)' }}
                />
                <div style={{
                  position: 'absolute', bottom: -3, right: -3,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#16A34A', border: '2px solid #11120D',
                }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <h3 style={{
                    fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                    fontSize: '1.2rem', fontWeight: 600, color: '#FFFBF4', margin: 0, lineHeight: 1.2,
                  }}>
                    {step === 4 ? 'Reservation Confirmed' : restaurant.name}
                  </h3>
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                    background: 'rgba(255,251,244,0.12)', color: '#D8CFBC',
                    border: '1px solid rgba(216,207,188,0.25)',
                    display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
                  }}>
                    <Check size={9} /> Bennett Partner
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,251,244,0.65)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{restaurant.cuisine}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#D8CFBC', fontWeight: 600 }}>
                    <Star size={11} fill="#D8CFBC" color="#D8CFBC" /> {restaurant.rating || '4.8'}
                  </span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{restaurant.distance || '0.8'} km</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(255,251,244,0.1)', border: '1px solid rgba(255,251,244,0.15)',
                color: 'rgba(255,251,244,0.7)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,251,244,0.18)'; e.currentTarget.style.color = '#FFFBF4'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,251,244,0.1)'; e.currentTarget.style.color = 'rgba(255,251,244,0.7)'; }}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Step indicator */}
          {step !== 4 && (
            <div style={{ display: 'flex', gap: 0, position: 'relative', zIndex: 2 }}>
              {STEPS.map((s, i) => {
                const isActive = step === s.num;
                const isPast = step > s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => step > s.num && setStep(s.num)}
                    style={{
                      flex: 1, padding: '10px 6px 12px',
                      border: 'none', background: 'transparent',
                      cursor: isPast ? 'pointer' : 'default',
                      borderBottom: `2.5px solid ${isActive ? '#FFFBF4' : isPast ? 'rgba(255,251,244,0.35)' : 'rgba(255,251,244,0.12)'}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: isActive ? '#FFFBF4' : isPast ? 'rgba(255,251,244,0.25)' : 'rgba(255,251,244,0.1)',
                        color: isActive ? '#11120D' : isPast ? 'rgba(255,251,244,0.8)' : 'rgba(255,251,244,0.4)',
                        border: isPast && !isActive ? '1px solid rgba(255,251,244,0.3)' : 'none',
                      }}>
                        {isPast ? <Check size={10} /> : s.num}
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#FFFBF4' : isPast ? 'rgba(255,251,244,0.7)' : 'rgba(255,251,244,0.35)',
                      }}>
                        {s.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 22px', background: '#FAFAF8' }}>
          <AnimatePresence mode="wait">

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div key="step-1"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
              >
                {/* Date Picker */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#11120D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="#565449" /> Select Dining Date
                    </span>
                    <span style={{ fontSize: 11.5, color: '#565449', fontWeight: 500 }}>
                      {selectedDate.formatted}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
                    {dateOptions.map(d => {
                      const isSel = selectedDate.iso === d.iso;
                      return (
                        <button key={d.iso} type="button" onClick={() => setSelectedDate(d)}
                          style={{
                            minWidth: 62, padding: '9px 6px', borderRadius: 12, flexShrink: 0,
                            border: `1.5px solid ${isSel ? '#11120D' : '#E8E2D5'}`,
                            background: isSel ? '#11120D' : '#FFFFFF',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                            transition: 'all 0.15s ease',
                            boxShadow: isSel ? '0 4px 12px rgba(17,18,13,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                          }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 600, color: isSel ? 'rgba(255,251,244,0.7)' : '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {d.weekday}
                          </span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: isSel ? '#FFFBF4' : '#11120D', lineHeight: 1 }}>
                            {d.dayNum}
                          </span>
                          <span style={{ fontSize: 10, color: isSel ? 'rgba(255,251,244,0.6)' : '#565449' }}>
                            {d.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Guest count */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#11120D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={13} color="#565449" /> Number of Diners
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99,
                      background: '#F6F2EA', color: '#565449', border: '1px solid #E8E2D5',
                    }}>
                      {guests === 1 ? 'Solo' : guests <= 4 ? 'Standard Table' : 'Large Group'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
                      const isSel = guests === n;
                      return (
                        <button key={n} type="button" onClick={() => setGuests(n)}
                          style={{
                            flex: 1, height: 42, borderRadius: 10, minWidth: 0,
                            border: `1.5px solid ${isSel ? '#11120D' : '#E8E2D5'}`,
                            background: isSel ? '#11120D' : '#FFFFFF',
                            color: isSel ? '#FFFBF4' : '#11120D',
                            fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            boxShadow: isSel ? '0 3px 10px rgba(17,18,13,0.15)' : 'none',
                          }}
                        >
                          {n === 8 ? '8+' : n}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Session + Slots */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#11120D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} color="#565449" /> Seating Window & Slot
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <Zap size={11} /> Instant Seating
                    </span>
                  </div>

                  {/* Lunch / Dinner toggle */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { id: 'lunch', icon: Sun, label: 'Lunch', sub: '12:00 – 3:30 PM', slot: '1:00 PM' },
                      { id: 'dinner', icon: Moon, label: 'Dinner', sub: '7:00 – 11:00 PM', slot: '8:00 PM' },
                    ].map(s => {
                      const isSel = session === s.id;
                      return (
                        <button key={s.id} type="button"
                          onClick={() => { setSession(s.id); setSelectedSlot(s.slot); }}
                          style={{
                            padding: '10px 12px', borderRadius: 12,
                            border: `1.5px solid ${isSel ? '#11120D' : '#E8E2D5'}`,
                            background: isSel ? '#11120D' : '#FFFFFF',
                            color: isSel ? '#FFFBF4' : '#565449',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 13,
                            transition: 'all 0.15s ease',
                            boxShadow: isSel ? '0 4px 14px rgba(17,18,13,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                            flexDirection: 'column',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <s.icon size={15} /> {s.label}
                          </span>
                          <span style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.7 }}>{s.sub}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Slot grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 7 }}>
                    {(session === 'lunch' ? LUNCH_SLOTS : DINNER_SLOTS).map(s => {
                      const isSel = selectedSlot === s.time;
                      const bc = BADGE_COLOR[s.badge] || BADGE_COLOR['Available'];
                      return (
                        <button key={s.time} type="button" onClick={() => setSelectedSlot(s.time)}
                          style={{
                            padding: '9px 6px', borderRadius: 10,
                            border: `1.5px solid ${isSel ? '#11120D' : '#E8E2D5'}`,
                            background: isSel ? '#11120D' : '#FFFFFF',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 4, transition: 'all 0.15s ease',
                            boxShadow: isSel ? '0 4px 12px rgba(17,18,13,0.18)' : '0 1px 2px rgba(0,0,0,0.03)',
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: 13, color: isSel ? '#FFFBF4' : '#11120D' }}>
                            {s.time}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
                            background: isSel ? 'rgba(255,251,244,0.15)' : bc.bg,
                            color: isSel ? '#D8CFBC' : bc.color,
                            border: `1px solid ${isSel ? 'rgba(255,251,244,0.2)' : bc.border}`,
                            whiteSpace: 'nowrap',
                          }}>
                            {s.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div key="step-2"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h4 style={{ fontFamily: "'Newsreader', serif", fontSize: '1.1rem', fontWeight: 600, color: '#11120D', margin: '0 0 2px' }}>
                      Pre-Order Dishes
                    </h4>
                    <p style={{ fontSize: 12, color: '#565449', margin: 0, lineHeight: 1.4 }}>
                      Optional — food ready at your seat when you arrive.
                    </p>
                  </div>
                  {preOrderTotal > 0 && (
                    <span style={{
                      background: '#11120D', color: '#FFFBF4',
                      fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      boxShadow: '0 2px 8px rgba(17,18,13,0.2)',
                    }}>
                      ₹{preOrderTotal} · {preOrderList.length} item{preOrderList.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Search + filter */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: 32, fontSize: 12.5, height: 36, borderRadius: 8 }}
                      placeholder="Search dishes..."
                      value={menuSearch}
                      onChange={e => setMenuSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', background: '#F6F2EA', borderRadius: 8, border: '1px solid #E8E2D5', overflow: 'hidden' }}>
                    {['all', 'veg'].map(f => (
                      <button key={f} type="button" onClick={() => setMenuFilter(f)}
                        style={{
                          padding: '6px 12px', border: 'none', fontSize: 12, fontWeight: 600,
                          background: menuFilter === f ? '#11120D' : 'transparent',
                          color: menuFilter === f ? '#FFFBF4' : '#565449',
                          cursor: 'pointer', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        {f === 'veg' && <Leaf size={11} />}
                        {f === 'all' ? 'All' : 'Veg'}
                      </button>
                    ))}
                  </div>
                </div>

                {menuLoading ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '2.5px solid #E8E2D5', borderTopColor: '#11120D',
                      animation: 'spin 0.7s linear infinite', margin: '0 auto 10px',
                    }} />
                    <p style={{ fontSize: 12.5, color: '#565449', margin: 0 }}>Loading kitchen catalog...</p>
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                    <p style={{ fontSize: 13, color: '#565449' }}>No items found. You can still proceed to reserve.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto', paddingRight: 2 }}>
                    {filteredMenuItems.map(item => {
                      const isVeg = item.isVeg !== undefined ? item.isVeg : item.veg !== undefined ? item.veg : true;
                      const qty = preOrders[item.id]?.qty || 0;
                      return (
                        <div key={item.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: 10,
                            border: `1.5px solid ${qty > 0 ? '#11120D' : '#E8E2D5'}`,
                            background: qty > 0 ? '#F6F2EA' : '#FFFFFF',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                            <span style={{
                              width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                              background: isVeg ? '#16A34A' : '#DC2626',
                              border: `1.5px solid ${isVeg ? '#16A34A' : '#DC2626'}`,
                            }} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#11120D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: 11.5, color: '#565449' }}>
                                ₹{item.price}{item.category ? ` · ${item.category}` : ''}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {qty > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <button type="button" onClick={() => handlePreOrderChange(item, -1)}
                                  style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E8E2D5', background: '#FFFFFF', color: '#11120D', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                  <Minus size={11} />
                                </button>
                                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: 'center', color: '#11120D' }}>{qty}</span>
                                <button type="button" onClick={() => handlePreOrderChange(item, 1)}
                                  style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #11120D', background: '#11120D', color: '#FFFBF4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                  <Plus size={11} />
                                </button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => handlePreOrderChange(item, 1)}
                                style={{
                                  padding: '5px 12px', borderRadius: 7, border: '1.5px solid #E8E2D5',
                                  background: '#FFFFFF', color: '#11120D', fontSize: 11.5, fontWeight: 600,
                                  cursor: 'pointer', transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#11120D'; e.currentTarget.style.background = '#F6F2EA'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E2D5'; e.currentTarget.style.background = '#FFFFFF'; }}
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

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div key="step-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#11120D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Sparkles size={13} color="#565449" /> Campus Occasion
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {OCCASIONS.map(occ => {
                      const isSel = occasion === occ.label;
                      return (
                        <button key={occ.label} type="button" onClick={() => setOccasion(occ.label)}
                          style={{
                            padding: '7px 14px', borderRadius: 10,
                            border: `1.5px solid ${isSel ? '#11120D' : '#E8E2D5'}`,
                            background: isSel ? '#11120D' : '#FFFFFF',
                            color: isSel ? '#FFFBF4' : '#565449',
                            fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.15s ease',
                            boxShadow: isSel ? '0 3px 10px rgba(17,18,13,0.15)' : 'none',
                          }}
                        >
                          <span>{occ.emoji}</span>
                          <span>{occ.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#11120D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <MessageSquare size={13} color="#565449" /> Special Preferences
                  </span>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="e.g. Quiet corner for study, wheelchair access, low spice..."
                    value={specialNotes}
                    onChange={e => setSpecialNotes(e.target.value)}
                    style={{ width: '100%', resize: 'none', fontSize: 13, borderRadius: 10, lineHeight: 1.5 }}
                  />
                </div>

                {/* Summary card */}
                <div style={{
                  background: 'linear-gradient(135deg, #11120D 0%, #252820 100%)',
                  borderRadius: 14, padding: '14px 16px', color: '#FFFBF4',
                  border: '1px solid rgba(216,207,188,0.15)',
                  boxShadow: '0 4px 16px rgba(17,18,13,0.16)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#D8CFBC', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Reservation Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12.5 }}>
                    {[
                      ['Date', selectedDate.formatted],
                      ['Time', selectedSlot],
                      ['Diners', `${guests} Guest${guests > 1 ? 's' : ''}`],
                      ['Pre-orders', preOrderList.length > 0 ? `${preOrderList.length} item${preOrderList.length > 1 ? 's' : ''} · ₹${preOrderTotal}` : 'None'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: 'rgba(255,251,244,0.5)', fontSize: 11 }}>{k}</span>
                        <div style={{ fontWeight: 600, color: '#FFFBF4', marginTop: 1 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — CONFIRMED */}
            {step === 4 && confirmedBooking && (
              <motion.div key="step-4"
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: 'center', padding: '8px 0 4px' }}
              >
                {/* Success icon */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  border: '2px solid #BBF7D0', color: '#16A34A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  boxShadow: '0 8px 24px rgba(22,163,74,0.18)',
                }}>
                  <CheckCircle2 size={34} />
                </div>

                <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: '1.5rem', fontWeight: 600, color: '#11120D', margin: '0 0 5px' }}>
                  Dining Pass Confirmed!
                </h3>
                <p style={{ fontSize: 13, color: '#565449', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Your table at <strong style={{ color: '#11120D' }}>{restaurant.name}</strong> is reserved with Bennett Tier-1 priority.
                </p>

                {/* Digital ticket */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E8E2D5',
                  borderRadius: 18, overflow: 'hidden',
                  maxWidth: 340, margin: '0 auto 16px',
                  boxShadow: '0 4px 20px rgba(17,18,13,0.08)',
                }}>
                  {/* Ticket header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #11120D 0%, #252820 100%)',
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#D8CFBC', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Dining Pass</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFBF4', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                        {confirmedBooking.id}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                      background: 'rgba(34,197,94,0.2)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)',
                    }}>
                      ● CONFIRMED
                    </span>
                  </div>

                  {/* Perforated divider */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#F6F2EA', overflow: 'hidden', height: 18 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FAFAF8', marginLeft: -6, border: '1px solid #E8E2D5', flexShrink: 0 }} />
                    <div style={{ flex: 1, borderTop: '1.5px dashed #D8CFBC', margin: '0 4px' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FAFAF8', marginRight: -6, border: '1px solid #E8E2D5', flexShrink: 0 }} />
                  </div>

                  {/* QR + details */}
                  <div style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                    <img
                      src={confirmedBooking.qrCode}
                      alt="QR"
                      style={{ width: 90, height: 90, borderRadius: 8, border: '1px solid #E8E2D5', background: '#FFFFFF', padding: 3, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {[
                        ['Venue', restaurant.name],
                        ['Date', confirmedBooking.date],
                        ['Time', confirmedBooking.time],
                        ['Guests', `${confirmedBooking.guests}`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                          <span style={{ color: '#A3A3A3', fontWeight: 500 }}>{k}</span>
                          <span style={{ color: '#11120D', fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#A3A3A3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Info size={12} /> Show QR at host desk for instant seating
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #E8E2D5',
          background: '#FFFFFF',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {step === 1 && (
            <>
              <div style={{ fontSize: 12, color: '#565449', fontWeight: 500 }}>
                {selectedDate.weekday} · <strong style={{ color: '#11120D' }}>{selectedSlot}</strong> · {guests} Diner{guests > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
                <button type="button" className="btn btn-primary btn-sm"
                  onClick={() => setStep(2)}
                  style={{ borderRadius: 99, padding: '8px 18px', fontWeight: 600 }}>
                  Next: Pre-Order <ChevronRight size={13} />
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                <ChevronLeft size={13} /> Back
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setStep(3)}>
                  Skip
                </button>
                <button type="button" className="btn btn-primary btn-sm"
                  onClick={() => setStep(3)}
                  style={{ borderRadius: 99, padding: '8px 18px', fontWeight: 600 }}>
                  Next: Notes <ChevronRight size={13} />
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>
                <ChevronLeft size={13} /> Back
              </button>
              <button type="button" className="btn btn-primary btn-sm"
                disabled={isSubmitting}
                onClick={handleConfirmReservation}
                style={{ borderRadius: 99, padding: '9px 22px', fontWeight: 600, minHeight: 38, gap: 6 }}>
                {isSubmitting ? 'Confirming...' : (
                  <><Sparkles size={13} /> Confirm{preOrderTotal > 0 ? ` · ₹${preOrderTotal}` : ''}</>
                )}
              </button>
            </>
          )}
          {step === 4 && (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button type="button" className="btn btn-outline btn-md"
                style={{ flex: 1, borderRadius: 99, fontWeight: 600 }}
                onClick={() => { onClose(); navigate('/bookings'); }}>
                <QrCode size={14} /> My Bookings
              </button>
              <button type="button" className="btn btn-primary btn-md"
                style={{ flex: 1, borderRadius: 99, fontWeight: 600 }}
                onClick={onClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
