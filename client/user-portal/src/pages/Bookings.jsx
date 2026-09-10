import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DigitalPassModal from '../components/DigitalPassModal';
import ReviewModal from '../components/ReviewModal';
import PaymentModal from '../components/PaymentModal';
import { useDining } from '../context/DiningContext';
import {
  Calendar,
  Clock,
  Users,
  QrCode,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MessageSquarePlus,
  ArrowRight,
  Receipt,
  Utensils,
  Check,
  X,
  Search,
  SlidersHorizontal,
  ArrowUpDown
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
    if (confirm('Are you sure you want to cancel this reservation? The restaurant capacity will be released.')) {
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
    <div className="page-pad">
      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)', fontWeight: 800, color: 'var(--t1)' }}>
            My Dining Reservations
          </h2>
          <p style={{ fontSize: 13, color: 'var(--t3)' }}>
            Manage your Bennett University partner restaurant bookings, access QR entry passes, and settle table payments with UPI, Cash, or Card.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={openScanner}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          title="Open camera to scan dining pass"
        >
          <QrCode size={15} /> Scan Digital Pass
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar anim-fade-up delay-1 tabs-scroll-x" style={{ marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Upcoming Reservations' && upcomingList.length > 0 && (
              <span className="badge badge-primary" style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px' }}>
                {upcomingList.length}
              </span>
            )}
            {tab === 'Past Visits' && pastList.length > 0 && (
              <span className="badge badge-neutral" style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px' }}>
                {pastList.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Sort Toolbar */}
      <div className="anim-fade-up delay-1" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 40, width: '100%' }}
            placeholder="Search by ID (e.g. DB-4821), venue name, or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowUpDown size={15} style={{ color: 'var(--t4)' }} />
          <select
            className="form-input"
            style={{ minWidth: 170, padding: '9px 12px', fontSize: 13 }}
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
      <div className="anim-fade-up delay-2" style={{ maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {currentList.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#EFF6FF',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--primary)'
            }}>
              <Calendar size={26} />
            </div>
            <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
              No {activeTab.toLowerCase()} found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 360, margin: '0 auto 20px' }}>
              Reserve a table at top partner restaurants near Bennett campus with instant confirmation.
            </p>
            <button className="btn-primary" onClick={() => navigate('/discover')}>
              Discover Restaurants →
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="card card-hover booking-card"
                style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}
              >
                {/* Restaurant Thumbnail with smooth zoom container */}
                <div style={{ width: 84, height: 84, borderRadius: 'var(--r-sm)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                  <img
                    src={b.restaurantImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80'}
                    alt={b.restaurantName}
                    className="booking-thumb"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 'min(100%, 200px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                      {b.id}
                    </span>
                    {isConfirmed && <span className="badge badge-success">● Confirmed</span>}
                    {isSeated    && (
                      <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Utensils size={11} /> Checked-In &amp; Dining
                      </span>
                    )}
                    {isCompleted && (
                      <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Check size={11} /> Paid via {b.payment?.method || 'UPI'}
                      </span>
                    )}
                    {isCancelled && (
                      <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <X size={11} /> Cancelled
                      </span>
                    )}
                  </div>

                  <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
                    {b.restaurantName}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, fontSize: 12.5, color: 'var(--t2)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={13} className="text-amber-400" /> {b.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={13} className="text-indigo-400" /> {b.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={13} className="text-emerald-400" /> {b.guests} Guests
                    </span>
                  </div>

                  {b.specialRequest && (
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 6, fontStyle: 'italic' }}>
                      Note: "{b.specialRequest}"
                    </div>
                  )}

                  {/* Payment settled note */}
                  {b.payment && (
                    <div style={{ fontSize: 12, color: '#10B981', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={13} />
                      Invoice {b.payment.transactionId} settled for ₹{b.payment.amount}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mobile-full-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {isConfirmed && (
                    <>
                      <button
                        className="btn-secondary"
                        onClick={() => setPassModalBooking(b)}
                      >
                        <QrCode size={14} /> Digital Pass
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleCancel(b.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {isSeated && (
                    <>
                      <button
                        className="btn-accent"
                        onClick={() => setPaymentModalBooking(b)}
                      >
                        <Receipt size={14} /> Pay Bill (UPI/Cash/Card)
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => setPassModalBooking(b)}
                      >
                        <QrCode size={14} /> View Pass
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => setPaymentModalBooking(b)}
                      >
                        <Receipt size={13} /> View Invoice
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => {
                          const rest = restaurants.find(r => r.name === b.restaurantName || r.id === b.restaurantId) || restaurants[0];
                          if (rest) navigate(`/restaurant/${rest.id}`);
                        }}
                      >
                        <RotateCcw size={13} /> Re-Book
                      </button>
                      {!b.reviewed ? (
                        <button
                          className="btn-accent"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => {
                            const rest = restaurants.find(r => r.name === b.restaurantName || r.id === b.restaurantId) || restaurants[0] || { id: b.restaurantId, name: b.restaurantName };
                            setReviewModalRestaurant(rest);
                          }}
                        >
                          <MessageSquarePlus size={13} /> Review
                        </button>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check size={11} /> Reviewed
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
