import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';

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

  QrCode,
  ShieldCheck,
  Sun,
  Moon,

  Check,
  Zap,
  MapPin,
  Star,
  Info,

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

  const [step, setStep] = useState(1); // 1: Date & Time, 2: Occasion & Notes, 3: Confirmed
  const [session, setSession] = useState('lunch');
  const [selectedSlot, setSelectedSlot] = useState('1:00 PM');
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

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

  const handleConfirmReservation = async () => {
    if (!user) {
      alert('Please sign in to reserve a table at partner venues.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `DB-${randomNum}`;


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
      orders: [],
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



  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="booking-modal modal-card modal-bottom-sheet anim-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="Reserve a table"
        style={{
          maxWidth: 680,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }}
      >
        {/* ── Modal Header ── */}
        <div className="booking-modal-header" style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={restaurant.image}
              alt={restaurant.name}
              style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  {step === 3 ? 'Reservation Confirmed' : restaurant.name}
                </h3>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 99,
                  background: '#ECFDF5',
                  color: '#065F46',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Check size={11} /> Bennett Partner
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span>{restaurant.cuisine}</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#D97706', fontWeight: 700 }}>
                  <Star size={12} fill="#D97706" /> {restaurant.rating || '4.8'}
                </span>
                <span>·</span>
                <span>{restaurant.distance || '0.8'} km from Campus</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F1F5F9',
              border: 'none',
              color: 'var(--t2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Stepper Navigation Bar ── */}
        {step !== 3 && (
          <div className="booking-stepper" style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            background: '#F8FAFC'
          }}>
            {[
              { num: 1, label: '1. Date & Time' },
              { num: 2, label: '2. Occasion & Notes' }
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
                    padding: '12px 8px',
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? '#15803D' : (isPast ? '#0F172A' : '#94A3B8'),
                    borderBottom: `2.5px solid ${isActive ? '#15803D' : 'transparent'}`,
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
        <div className="booking-modal-body" style={{ overflowY: 'auto', flex: 1, padding: 24, background: '#FFFFFF' }}>
          <AnimatePresence mode="wait">
            {/* STEP 1: DATE, GUESTS & TIME */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                {/* 1. Date Selector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={15} className="text-emerald-700" />
                      Select Dining Date
                    </label>
                    <span style={{ fontSize: 12, color: '#15803D', fontWeight: 600 }}>
                      {selectedDate.formatted}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {dateOptions.map(d => {
                      const isSelected = selectedDate.iso === d.iso;
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          style={{
                            minWidth: 78,
                            padding: '10px 6px',
                            borderRadius: 12,
                            border: `1.5px solid ${isSelected ? '#15803D' : '#E2E8F0'}`,
                            background: isSelected ? '#ECFDF5' : '#FFFFFF',
                            color: isSelected ? '#065F46' : 'var(--t2)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 4px 10px rgba(21, 128, 61, 0.12)' : 'none'
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#15803D' : 'var(--t3)' }}>
                            {d.weekday}
                          </span>
                          <span style={{ fontSize: 13.5, fontWeight: 800 }}>
                            {d.dayNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Number of Diners */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={15} className="text-emerald-700" />
                      Number of Diners
                    </label>
                    <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                      {guests === 1 ? 'Solo Dining' : guests <= 4 ? 'Standard Table' : 'Large Campus Group'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(count => {
                      const isSelected = guests === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setGuests(count)}
                          style={{
                            flex: 1,
                            minWidth: 44,
                            height: 44,
                            borderRadius: 12,
                            border: `1.5px solid ${isSelected ? '#15803D' : '#E2E8F0'}`,
                            background: isSelected ? '#15803D' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : 'var(--t1)',
                            fontWeight: 800,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(21, 128, 61, 0.22)' : 'none'
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={15} className="text-emerald-700" />
                      Seating Window &amp; Slot
                    </label>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: '#ECFDF5',
                      color: '#065F46',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Zap size={11} /> Instant Seating
                    </span>
                  </div>

                  {/* Lunch vs Dinner Pill Toggle */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSession('lunch');
                        setSelectedSlot('1:00 PM');
                      }}
                      style={{
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: `1.5px solid ${session === 'lunch' ? '#15803D' : '#E2E8F0'}`,
                        background: session === 'lunch' ? '#ECFDF5' : '#FFFFFF',
                        color: session === 'lunch' ? '#065F46' : 'var(--t2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontWeight: 700,
                        fontSize: 13
                      }}
                    >
                      <Sun size={15} className={session === 'lunch' ? 'text-emerald-700' : 'text-slate-400'} />
                      Lunch (12:00 – 3:30 PM)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSession('dinner');
                        setSelectedSlot('8:00 PM');
                      }}
                      style={{
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: `1.5px solid ${session === 'dinner' ? '#15803D' : '#E2E8F0'}`,
                        background: session === 'dinner' ? '#ECFDF5' : '#FFFFFF',
                        color: session === 'dinner' ? '#065F46' : 'var(--t2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontWeight: 700,
                        fontSize: 13
                      }}
                    >
                      <Moon size={15} className={session === 'dinner' ? 'text-emerald-700' : 'text-slate-400'} />
                      Dinner (7:00 – 11:00 PM)
                    </button>
                  </div>

                  {/* Slot Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                    {(session === 'lunch' ? LUNCH_SLOTS : DINNER_SLOTS).map(s => {
                      const isSelected = selectedSlot === s.time;
                      return (
                        <button
                          key={s.time}
                          type="button"
                          onClick={() => setSelectedSlot(s.time)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 12,
                            border: `1.5px solid ${isSelected ? '#15803D' : '#E2E8F0'}`,
                            background: isSelected ? '#ECFDF5' : '#FFFFFF',
                            color: isSelected ? '#065F46' : 'var(--t1)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 3px 8px rgba(21, 128, 61, 0.12)' : 'none'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: 13.5 }}>{s.time}</div>
                          <div style={{ fontSize: 10, color: isSelected ? '#15803D' : 'var(--t4)', fontWeight: 600 }}>
                            {s.badge}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: OCCASION & SPECIAL NOTES */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                {/* Occasions */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Sparkles size={15} className="text-amber-500" />
                    Campus Occasion
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {OCCASIONS.map(occ => {
                      const isSelected = occasion === occ;
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => setOccasion(occ)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 12,
                            border: `1.5px solid ${isSelected ? '#15803D' : '#E2E8F0'}`,
                            background: isSelected ? '#ECFDF5' : '#FFFFFF',
                            color: isSelected ? '#065F46' : 'var(--t2)',
                            fontSize: 12.5,
                            fontWeight: 700,
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
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <MessageSquare size={15} className="text-emerald-700" />
                    Seating Preferences or Dietary Notes (Optional)
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="e.g. Quiet corner table for study group, wheelchair access, low spice, celebrate birthday..."
                    value={specialNotes}
                    onChange={e => setSpecialNotes(e.target.value)}
                    style={{ width: '100%', resize: 'none', fontSize: 13 }}
                  />
                </div>

                {/* Reservation Summary Preview */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 14,
                  padding: 14,
                  fontSize: 12.5
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                    Reservation Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, color: 'var(--t2)' }}>
                    <div>Date: <strong>{selectedDate.formatted}</strong></div>
                    <div>Slot: <strong>{selectedSlot}</strong></div>
                    <div>Party: <strong>{guests} Diners</strong></div>
                    <div>Occasion: <strong>{occasion}</strong></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONFIRMATION */}
            {step === 3 && confirmedBooking && (
              <motion.div
                className="booking-confirmation"
                key="step-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{ textAlign: 'center', padding: '10px 0' }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.2)'
                }}>
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', margin: '0 0 4px' }}>
                  Dining Pass Confirmed!
                </h3>
                <p style={{ fontSize: 13, color: 'var(--t3)', margin: '0 0 20px' }}>
                  Your table at {restaurant.name} is reserved with Bennett Tier-1 priority.
                </p>

                {/* Digital Ticket Preview Box */}
                <div className="booking-pass-card" style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 16,
                  padding: 18,
                  maxWidth: 360,
                  margin: '0 auto 16px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <img
                      src={confirmedBooking.qrCode}
                      alt="Booking QR Code"
                      style={{ width: 140, height: 140, borderRadius: 8, background: '#FFFFFF', padding: 6, border: '1px solid #E2E8F0' }}
                    />
                  </div>

                  <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700, letterSpacing: '0.06em' }}>
                    BOOKING REFERENCE
                  </div>
                  <div className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803D', letterSpacing: '0.06em', margin: '2px 0 10px' }}>
                    {confirmedBooking.id}
                  </div>

                  <div className="booking-pass-details" style={{ borderTop: '1px dashed #CBD5E1', paddingTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, textAlign: 'left' }}>
                    <div><span style={{ color: '#64748B' }}>Date:</span> <strong>{confirmedBooking.date}</strong></div>
                    <div><span style={{ color: '#64748B' }}>Time:</span> <strong>{confirmedBooking.time}</strong></div>
                    <div><span style={{ color: '#64748B' }}>Guests:</span> <strong>{confirmedBooking.guests} Diners</strong></div>
                    <div><span style={{ color: '#64748B' }}>Occasion:</span> <strong>{occasion}</strong></div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Info size={13} className="text-emerald-700" />
                  Pass stored in your account. Present QR at the host desk.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Modal Footer ── */}
        <div className="booking-modal-footer" style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF'
        }}>
          {step === 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                {selectedDate.weekday} · {selectedSlot} · {guests} Diners
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
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
                  style={{ borderRadius: 10, padding: '9px 20px', minHeight: 38, fontWeight: 700 }}
                >
                  Continue <ChevronRight size={14} />
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
                <ChevronLeft size={14} /> Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting}
                onClick={handleConfirmReservation}
                style={{ borderRadius: 10, padding: '10px 22px', minHeight: 40, fontWeight: 800, gap: 6 }}
              >
                {isSubmitting ? (
                  'Confirming Table...'
                ) : (
                  <>
                    <Sparkles size={14} /> Confirm Reservation
                  </>
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="booking-confirmation-actions" style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                type="button"
                className="btn btn-outline btn-md"
                style={{ flex: 1, fontWeight: 700 }}
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
              >
                <QrCode size={15} /> View in My Bookings
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                style={{ flex: 1, fontWeight: 700 }}
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
