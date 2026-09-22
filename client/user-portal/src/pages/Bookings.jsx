import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DigitalPassModal from '../components/DigitalPassModal';
import ReviewModal from '../components/ReviewModal';
import PaymentModal from '../components/PaymentModal';
import { useDining } from '../context/DiningContext';
import {
  Calendar,
  Clock,
  Users,
  QrCode,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MessageSquarePlus,
  Receipt,
  Utensils,
  Check,
  X,
  Search,
  ArrowUpDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const TABS = ['Upcoming Reservations', 'Past Visits', 'Cancelled'];

export default function Bookings() {
  const navigate = useNavigate();
  const { restaurants = [], reservations = [], setReservations, cancelBooking, staffCompletePayment, openScanner } = useDining();
  const [activeTab, setActiveTab] = useState('Upcoming Reservations');
  const [passModalBooking, setPassModalBooking] = useState(null);
  const [reviewModalRestaurant, setReviewModalRestaurant] = useState(null);
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);

  // Search & Sort filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'guests-high' | 'guests-low'

  const upcomingList = reservations.filter(b => b.status === 'CONFIRMED' || b.status === 'SEATED');
  const pastList = reservations.filter(b => b.status === 'COMPLETED');
  const cancelledList = reservations.filter(b => b.status === 'CANCELLED');

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this reservation? The restaurant capacity will be immediately released.')) {
      if (cancelBooking) {
        await cancelBooking(bookingId);
      } else {
        setReservations(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      }
    }
  };

  const currentList = useMemo(() => {
    let list = [];
    if (activeTab === 'Upcoming Reservations') list = upcomingList;
    else if (activeTab === 'Past Visits') list = pastList;
    else list = cancelledList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(b =>
        b.id.toLowerCase().includes(q) ||
        (b.restaurantName && b.restaurantName.toLowerCase().includes(q)) ||
        (b.date && b.date.toLowerCase().includes(q)) ||
        (b.specialRequest && b.specialRequest.toLowerCase().includes(q))
      );
    }

    const sorted = [...list];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => (b.id > a.id ? 1 : -1));
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => (a.id > b.id ? 1 : -1));
    } else if (sortBy === 'guests-high') {
      sorted.sort((a, b) => (b.guests || 2) - (a.guests || 2));
    } else if (sortBy === 'guests-low') {
      sorted.sort((a, b) => (a.guests || 2) - (b.guests || 2));
    }
    return sorted;
  }, [activeTab, upcomingList, pastList, cancelledList, searchQuery, sortBy]);

  return (
    <div className="page-pad" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1C1E21', margin: 0 }}>
              My Dining Reservations
            </h1>
            <span style={{
              background: '#FFF5EE',
              border: '1px solid #FFD8CC',
              color: '#FF5200',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 99
            }}>
              Bennett Pass Network
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
            Manage campus partner reservations, access digital entry passes, and settle bills.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={openScanner}
          style={{
            borderRadius: 10,
            fontWeight: 700,
            padding: '9px 18px',
            fontSize: 12.5
          }}
          title="Open camera to scan dining pass"
        >
          <QrCode size={15} /> Host Scanner
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar anim-fade-up delay-1 tabs-scroll-x" style={{ marginBottom: 24, background: '#FFFFFF', padding: 4, borderRadius: 14, border: '1px solid var(--border)' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{
                borderRadius: 10,
                fontWeight: 700,
                padding: '10px 20px',
                minHeight: 40,
                fontSize: 13,
                background: isActive ? '#FF5200' : 'transparent',
                color: isActive ? '#FFFFFF' : '#475569'
              }}
            >
              {tab}
              {tab === 'Upcoming Reservations' && upcomingList.length > 0 && (
                <span style={{
                  marginLeft: 6,
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 99,
                  background: isActive ? '#FFFFFF' : '#FFF5EE',
                  color: '#FF5200'
                }}>
                  {upcomingList.length}
                </span>
              )}
              {tab === 'Past Visits' && pastList.length > 0 && (
                <span style={{
                  marginLeft: 6,
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 99,
                  background: isActive ? '#FFFFFF' : '#F1F5F9',
                  color: isActive ? '#FF5200' : '#475569'
                }}>
                  {pastList.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Sort Toolbar */}
      <div className="anim-fade-up delay-1" style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap',
        alignItems: 'center',
        background: '#FFFFFF',
        padding: '12px 16px',
        borderRadius: 16,
        border: '1px solid var(--border)'
      }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36, width: '100%', fontSize: 13, height: 38 }}
            placeholder="Search by ID (e.g. DB-4821), venue name, or special notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', padding: '6px 12px', borderRadius: 99, border: '1px solid var(--border)' }}>
          <ArrowUpDown size={13} className="text-[#FF5200]" />
          <select
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--t1)',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Latest Bookings</option>
            <option value="oldest">Earliest Bookings</option>
            <option value="guests-high">Party Size (High to Low)</option>
            <option value="guests-low">Party Size (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="anim-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {currentList.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Calendar size={26} />
            </div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
              No {activeTab.toLowerCase()} found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Browse curated partner restaurants near Bennett campus to reserve your table with guaranteed priority seating.
            </p>
            <button
              className="btn btn-primary btn-md"
              onClick={() => navigate('/discover')}
              style={{ borderRadius: 12, fontWeight: 700, margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Sparkles size={15} /> Discover Restaurants
            </button>
          </div>
        ) : (
          currentList.map(b => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isSeated    = b.status === 'SEATED';
            const isCompleted = b.status === 'COMPLETED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: 20,
                  display: 'flex',
                  gap: 20,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Restaurant Thumbnail */}
                <div style={{
                  width: 88,
                  height: 88,
                  borderRadius: 14,
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid var(--border)'
                }}>
                  <img
                    src={b.restaurantImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80'}
                    alt={b.restaurantName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 'min(100%, 240px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {b.id}
                    </span>

                    {isConfirmed && (
                      <span style={{
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#047857',
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        ● Confirmed Table Pass
                      </span>
                    )}

                    {isSeated && (
                      <span style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E40AF',
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Utensils size={11} /> Checked-In &amp; Seated
                      </span>
                    )}

                    {isCompleted && (
                      <span style={{
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#475569',
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Check size={11} /> Paid via {b.payment?.method || 'UPI'}
                      </span>
                    )}

                    {isCancelled && (
                      <span style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#991B1B',
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        <X size={11} /> Cancelled
                      </span>
                    )}
                  </div>

                  <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px' }}>
                    {b.restaurantName}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, fontSize: 12.5, color: 'var(--t2)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={13} className="text-[#FF5200]" /> {b.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={13} className="text-[#FF5200]" /> {b.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={13} className="text-[#FF5200]" /> {b.guests} Diners
                    </span>
                  </div>

                  {b.specialRequest && (
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 6 }}>
                      Occasion: <em>{b.specialRequest}</em>
                    </div>
                  )}

                  {b.orders && b.orders.length > 0 && (
                    <div style={{ fontSize: 11.5, color: '#15803D', fontWeight: 600, marginTop: 4 }}>
                      Pre-Ordered: {b.orders.map(o => `${o.name} (x${o.qty || o.quantity || 1})`).join(', ')}
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {isConfirmed && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setPassModalBooking(b)}
                        style={{ borderRadius: 10, fontWeight: 700, gap: 6, padding: '9px 18px', minHeight: 38 }}
                      >
                        <QrCode size={14} /> Digital Pass
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCancel(b.id)}
                        style={{ borderRadius: 10, color: '#DC2626', fontWeight: 600, padding: '9px 16px', minHeight: 38 }}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {isSeated && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setPaymentModalBooking(b)}
                        style={{ borderRadius: 10, fontWeight: 700, gap: 6, padding: '9px 18px', minHeight: 38 }}
                      >
                        <Receipt size={14} /> Settle Bill
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setPassModalBooking(b)}
                        style={{ borderRadius: 10, fontWeight: 700, gap: 6, padding: '9px 18px', minHeight: 38 }}
                      >
                        <QrCode size={14} /> View Pass
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setPaymentModalBooking(b)}
                        style={{ borderRadius: 10, fontWeight: 700, gap: 6, padding: '9px 18px', minHeight: 38 }}
                      >
                        <Receipt size={13} /> View Invoice
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          const rest = restaurants.find(r => r.name === b.restaurantName || r.id === b.restaurantId) || restaurants[0];
                          if (rest) navigate(`/restaurant/${rest.id}`);
                        }}
                        style={{ borderRadius: 10, fontWeight: 700, gap: 6, padding: '9px 16px', minHeight: 38 }}
                      >
                        <RotateCcw size={13} /> Re-Book
                      </button>
                      {!b.reviewed ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const rest = restaurants.find(r => r.name === b.restaurantName || r.id === b.restaurantId) || restaurants[0] || { id: b.restaurantId, name: b.restaurantName };
                            setReviewModalRestaurant(rest);
                          }}
                          style={{ borderRadius: 10, fontWeight: 700, gap: 5 }}
                        >
                          <MessageSquarePlus size={13} /> Review
                        </button>
                      ) : (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#065F46',
                          background: '#ECFDF5',
                          padding: '4px 10px',
                          borderRadius: 99,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <Check size={12} /> Reviewed
                        </span>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {passModalBooking && (
        <DigitalPassModal
          booking={passModalBooking}
          onClose={() => setPassModalBooking(null)}
        />
      )}

      {reviewModalRestaurant && (
        <ReviewModal
          restaurant={reviewModalRestaurant}
          onClose={() => setReviewModalRestaurant(null)}
          onReviewSubmitted={() => {
            setReservations(prev => prev.map(b => (b.restaurantId === reviewModalRestaurant.id || b.restaurantName === reviewModalRestaurant.name) ? { ...b, reviewed: true } : b));
          }}
        />
      )}

      {paymentModalBooking && (
        <PaymentModal
          booking={paymentModalBooking}
          onClose={() => setPaymentModalBooking(null)}
          onPaymentComplete={(paymentResult) => {
            staffCompletePayment(paymentModalBooking.id, paymentResult);
          }}
        />
      )}
    </div>
  );
}
