import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DigitalPassModal from '../components/DigitalPassModal';
import ReviewModal from '../components/ReviewModal';
import PaymentModal from '../components/PaymentModal';
import CustomSelect from '../components/CustomSelect';
import RubberSegment from '../components/RubberSegment';
import { useDining } from '../context/DiningContext';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Latest Bookings' },
  { value: 'oldest', label: 'Earliest Bookings' },
  { value: 'guests-high', label: 'Party Size (High to Low)' },
  { value: 'guests-low', label: 'Party Size (Low to High)' },
];
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
  const { user } = useAuth() || {};
  const canScan = user?.role === 'RESTAURANT_STAFF' || user?.role === 'RESTAURANT_ADMIN' || user?.role === 'SUPER_ADMIN';
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
      <div className="anim-fade-up" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 600, color: '#11120D', margin: 0 }}>
              My Dining Reservations
            </h1>
            <span style={{
              background: '#F6F2EA',
              border: '1px solid #D8CFBC',
              color: '#11120D',
              fontSize: 11,
              fontWeight: 650,
              padding: '2px 8px',
              borderRadius: 99,
            }}>
              Bennett Pass Network
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#565449', margin: 0 }}>
            Manage campus partner reservations, access digital entry passes, and settle bills.
          </p>
        </div>

        {canScan && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openScanner}
            style={{
              borderRadius: 99,
              fontWeight: 600,
              padding: '8px 18px',
              fontSize: 12.5
            }}
            title="Open camera to scan dining pass"
          >
            <QrCode size={14} /> Host Scanner
          </button>
        )}
      </div>

      {/* Rubber Segment Tabs */}
      <div className="anim-fade-up delay-1" style={{ marginBottom: 20, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
        <RubberSegment
          items={[
            {
              value: 'Upcoming Reservations',
              label: upcomingList.length > 0 ? `Upcoming (${upcomingList.length})` : 'Upcoming'
            },
            {
              value: 'Past Visits',
              label: pastList.length > 0 ? `Past Visits (${pastList.length})` : 'Past Visits'
            },
            {
              value: 'Cancelled',
              label: cancelledList.length > 0 ? `Cancelled (${cancelledList.length})` : 'Cancelled'
            }
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val)}
          trackColor="#F6F2EA"
          thumbColor="#11120D"
          textColor="#565449"
          activeTextColor="#FFFBF4"
          size="md"
          radius={99}
          inset={3}
          equalSlots={false}
          aria-label="Reservation status filter"
        />
      </div>

      {/* Search & Sort Toolbar */}
      <div className="anim-fade-up delay-1 bookings-filter-row" style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
        background: '#FFFFFF',
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid #E8E2D5',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#565449' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 34, width: '100%', fontSize: 13, height: 36, borderRadius: 6, borderColor: '#E8E2D5', color: '#11120D' }}
            placeholder="Search by ID (e.g. DB-4821), venue name, or special notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <CustomSelect
          icon={ArrowUpDown}
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={setSortBy}
          align="right"
          ariaLabel="Sort bookings"
        />
      </div>

      {/* Bookings List */}
      <div className="anim-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {currentList.length === 0 ? (
          <div style={{
            border: '1px solid #E8E2D5',
            borderRadius: 16,
            background: '#FFFFFF',
            padding: '60px 20px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#F6F2EA',
              border: '1px solid #D8CFBC',
              color: '#11120D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Calendar size={24} />
            </div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#11120D', marginBottom: 6 }}>
              No {activeTab.toLowerCase()} found
            </h3>
            <p style={{ fontSize: 13, color: '#565449', maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.5 }}>
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
                  border: '1px solid #E8E2D5',
                  borderRadius: 14,
                  padding: 'clamp(14px, 3vw, 18px)',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Restaurant Thumbnail */}
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid #E8E2D5'
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
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#11120D', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {b.id}
                    </span>

                    {isConfirmed && (
                      <span style={{
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        color: '#2D6A4F',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}>
                        ● Confirmed Pass
                      </span>
                    )}

                    {isSeated && (
                      <span style={{
                        background: '#F6F2EA',
                        border: '1px solid #11120D',
                        color: '#11120D',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <Utensils size={10} /> Checked-In &amp; Seated
                      </span>
                    )}

                    {isCompleted && (
                      <span style={{
                        background: '#F6F2EA',
                        border: '1px solid #E8E2D5',
                        color: '#565449',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Check size={10} /> Paid via {b.payment?.method || 'UPI'}
                      </span>
                    )}

                    {isCancelled && (
                      <span style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#B91C1C',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        <X size={10} /> Cancelled
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif", fontSize: '1.2rem', fontWeight: 600, color: '#11120D', margin: '0 0 6px' }}>
                    {b.restaurantName}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, fontSize: 12, color: '#565449' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={12} color="#565449" /> {b.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={12} color="#565449" /> {b.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={12} color="#565449" /> {b.guests} Diners
                    </span>
                  </div>

                  {b.specialRequest && (
                    <div style={{ fontSize: 11.5, color: '#565449', marginTop: 5 }}>
                      Occasion: <em>{b.specialRequest}</em>
                    </div>
                  )}

                  {b.orders && b.orders.length > 0 && (
                    <div style={{ fontSize: 11.5, color: '#11120D', fontWeight: 500, marginTop: 4 }}>
                      Pre-Ordered: {b.orders.map(o => `${o.name} (x${o.qty || o.quantity || 1})`).join(', ')}
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="booking-card-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
                  {isConfirmed && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setPassModalBooking(b)}
                        style={{ borderRadius: 99, fontWeight: 700, gap: 6, padding: '9px 18px', minHeight: 38, touchAction: 'manipulation' }}
                      >
                        <QrCode size={14} /> Digital Pass
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCancel(b.id)}
                        style={{ borderRadius: 99, color: '#B91C1C', fontWeight: 600, padding: '9px 16px', minHeight: 38, touchAction: 'manipulation' }}
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
                        style={{ borderRadius: 99, fontWeight: 700, gap: 6, padding: '9px 18px', minHeight: 38, touchAction: 'manipulation' }}
                      >
                        <Receipt size={14} /> Settle Bill
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setPassModalBooking(b)}
                        style={{ borderRadius: 99, fontWeight: 700, gap: 6, padding: '9px 18px', minHeight: 38, touchAction: 'manipulation' }}
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
                        style={{ borderRadius: 99, fontWeight: 700, gap: 6, padding: '9px 18px', minHeight: 38, touchAction: 'manipulation' }}
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
                        style={{ borderRadius: 99, fontWeight: 700, gap: 6, padding: '9px 16px', minHeight: 38, touchAction: 'manipulation' }}
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
                          style={{ borderRadius: 99, fontWeight: 700, gap: 5, padding: '9px 16px', minHeight: 38, touchAction: 'manipulation' }}
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
