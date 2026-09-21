import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import BookingModal from '../components/BookingModal';
import DigitalPassModal from '../components/DigitalPassModal';
import OfferDrawer from '../components/OfferDrawer';
import DistrictSearchModal from '../components/DistrictSearchModal';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Search,
  Sparkles,
  QrCode,
  ArrowRight,
  Zap,
  Tag,
  Star,
  Leaf,
  Coffee,
  Pizza,
  Utensils,
  Soup,
  Compass,
  ChevronRight,
  Ticket,
  Calendar,
  UtensilsCrossed,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurants = [], reservations = [], loading = false } = useDining() || {};

  const [selectedRestaurantForBooking, setSelectedRestaurant] = useState(null);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  const upcoming = safeReservations.find(
    b => b?.status === 'CONFIRMED' || b?.status === 'SEATED'
  );

  const MOOD_FILTERS = [
    { id: 'All', label: 'All Places' },
    { id: 'Offers', label: '🎟️ Student Deals' },
    { id: 'TopRated', label: '⭐ 4.5+ Top Rated' },
    { id: 'Instant', label: '⚡ Instant Seats' },
    { id: 'NorthIndian', label: '🍛 North Indian' },
    { id: 'Continental', label: '🍕 Continental & Cafes' },
    { id: 'PanAsian', label: '🍜 Pan-Asian' },
  ];

  const filteredRestaurants = safeRestaurants.filter(r => {
    if (activeFilter === 'Instant') return true;
    if (activeFilter === 'Offers') return r.hasOffer;
    if (activeFilter === 'TopRated') return (r.rating || 0) >= 4.5;
    if (activeFilter === 'NorthIndian') return r.cuisine?.toLowerCase().includes('north indian');
    if (activeFilter === 'Continental') return r.cuisine?.toLowerCase().includes('continental') || r.cuisine?.toLowerCase().includes('cafe');
    if (activeFilter === 'PanAsian') return r.cuisine?.toLowerCase().includes('asian');
    return true;
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';

  return (
    <div className="dashboard-page" style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px 100px', display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* ── 1. CAMPUS HERO BANNER WITH EMBEDDED SEARCH PILL ── */}
      <div className="district-hero-canvas">
        <div className="district-hero-art">
          {/* Decorative Food Elements */}
          <div style={{ position: 'absolute', top: 18, left: 24, opacity: 0.85 }}>
            <span style={{ fontSize: 38 }}>🍝</span>
          </div>
          <div style={{ position: 'absolute', top: 18, right: 24, opacity: 0.85 }}>
            <span style={{ fontSize: 38 }}>🍕</span>
          </div>
          <div style={{ position: 'absolute', bottom: 18, left: 24, opacity: 0.85 }}>
            <span style={{ fontSize: 38 }}>🥗</span>
          </div>
          <div style={{ position: 'absolute', bottom: 18, right: 24, opacity: 0.85 }}>
            <span style={{ fontSize: 38 }}>☕</span>
          </div>

          <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
                color: '#FBCFE8',
                lineHeight: 1.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>Welcome back, {firstName}</span>
              <Sparkles size={16} color="#FDE047" />
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 600,
                fontStyle: 'italic',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                marginTop: 6,
                lineHeight: 1.25,
                padding: '4px 0'
              }}
            >
              Campus Dining Experiences
            </div>

            {/* Embedded Search Bar Pill */}
            <div
              className="district-search-bar"
              onClick={() => setSearchModalOpen(true)}
            >
              <Search size={18} color="#64748B" />
              <span
                style={{
                  flex: 1,
                  textAlign: 'left',
                  fontSize: 14.5,
                  color: '#94A3B8',
                  fontWeight: 500,
                  paddingLeft: 10,
                }}
              >
                Search campus cafes, rolls, biryani, thali, cold brew...
              </span>
              <button className="district-search-btn">
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. ACTIVE DIGITAL PASS TICKET (100% LIGHT THEME) ── */}
      {upcoming && (
        <div
          style={{
            borderRadius: 20,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 18px',
              background: '#FFF1F2',
              borderBottom: '1px solid #FFE4E6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: '#BE185D', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              ● ACTIVE BENNETT TABLE PASS
            </span>
            <span style={{ fontSize: 12, color: '#9F1239', fontWeight: 600 }}>
              Pass: {upcoming.passCode || 'BU-8492'}
            </span>
          </div>

          <div
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: '#FFE4E6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={24} color="#BE185D" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {upcoming.restaurantName}
                </div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                  Table <strong style={{ color: '#BE185D' }}>{upcoming.tableAssigned || 'T-01'}</strong> · {upcoming.date} at {upcoming.time} ({upcoming.partySize || 2} Guests)
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBookingForPass(upcoming)}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 99, padding: '9px 18px' }}
            >
              <QrCode size={15} />
              <span>Show QR Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 3. FILTER PILLS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-none">
        {MOOD_FILTERS.map(f => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '7px 18px',
                borderRadius: 99,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                background: isActive ? '#FFE4E6' : '#F1F5F9',
                color: isActive ? '#BE185D' : '#475569',
                border: `1px solid ${isActive ? '#FDA4AF' : 'transparent'}`,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── 4. BOOK A TABLE GRID ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={24} color="#0F172A" />
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A' }}>
              Book a Table on Campus
            </h2>
          </div>
          <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            {filteredRestaurants.length} outlets serving now
          </span>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EEF0F3',
            }}
          >
            <UtensilsCrossed size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>No outlets found</h3>
            <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Try selecting another category or reset filters</p>
            <button
              onClick={() => setActiveFilter('All')}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 14 }}
            >
              Show All Outlets
            </button>
          </div>
        ) : (
          <div
            className="dashboard-restaurant-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 22,
            }}
          >
            {filteredRestaurants.map(r => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onQuickReserve={res => setSelectedRestaurant(res)}
                onViewOffer={off => setSelectedOffer(off)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRestaurantForBooking && (
        <BookingModal
          restaurant={selectedRestaurantForBooking}
          initialTime={selectedRestaurantForBooking.defaultTime}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      {selectedBookingForPass && (
        <DigitalPassModal
          booking={selectedBookingForPass}
          onClose={() => setSelectedBookingForPass(null)}
        />
      )}

      {selectedOffer && (
        <OfferDrawer
          offer={selectedOffer}
          isOpen={Boolean(selectedOffer)}
          onClose={() => setSelectedOffer(null)}
        />
      )}

      <DistrictSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
