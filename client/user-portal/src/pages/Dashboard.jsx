import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import BookingModal from '../components/BookingModal';
import DigitalPassModal from '../components/DigitalPassModal';
import OfferDrawer from '../components/OfferDrawer';
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
  Trees,
  UtensilsCrossed,
  Compass,
  ChevronRight,
  Ticket,
  Users,
  Percent,
  Clock,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurants = [], reservations = [], loading = false } = useDining() || {};

  const [selectedRestaurantForBooking, setSelectedRestaurant] = useState(null);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeVibe, setActiveVibe] = useState(null);

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  const upcoming = safeReservations.find(
    b => b?.status === 'CONFIRMED' || b?.status === 'SEATED'
  );

  const VIBE_STORIES = [
    { id: 'trending', label: 'Trending', emoji: '🔥', icon: Flame, color: '#FF5200' },
    { id: 'cafes', label: 'Sip & Study', emoji: '☕', icon: Coffee, cuisine: 'Continental' },
    { id: 'pizza', label: 'Pizza & Pasta', emoji: '🍕', icon: Pizza, cuisine: 'Continental' },
    { id: 'mughlai', label: 'Desi Meals', emoji: '🍛', icon: Utensils, cuisine: 'North Indian' },
    { id: 'asian', label: 'Pan-Asian', emoji: '🍜', icon: Soup, cuisine: 'Pan-Asian' },
    { id: 'healthy', label: 'Green & Fresh', emoji: '🥗', icon: Leaf, tag: 'Organic' },
    { id: 'quick', label: 'Quick Bites', emoji: '⚡', icon: Zap, tag: 'Fast Casual' },
    { id: 'desserts', label: 'Boba & Sweets', emoji: '🧋', icon: Sparkles, tag: 'Desserts' },
  ];

  const FILTERS = [
    { id: 'All', label: 'All Outlets' },
    { id: 'Offers', label: '🎟️ Student Deals' },
    { id: 'TopRated', label: '⭐ 4.5+ Top Rated' },
    { id: 'Instant', label: '⚡ Instant Tables' },
    { id: 'NorthIndian', label: '🍛 North Indian' },
    { id: 'Continental', label: '🍕 Continental' },
    { id: 'PanAsian', label: '🍜 Pan-Asian' },
  ];

  const handleVibeClick = vibe => {
    if (activeVibe === vibe.id) {
      setActiveVibe(null);
      setActiveFilter('All');
    } else {
      setActiveVibe(vibe.id);
      if (vibe.cuisine) setActiveFilter(vibe.cuisine.replace(' ', ''));
      else if (vibe.id === 'trending') setActiveFilter('TopRated');
    }
  };

  const filteredRestaurants = safeRestaurants.filter(r => {
    if (activeFilter === 'Instant') return true;
    if (activeFilter === 'Offers') return r.hasOffer;
    if (activeFilter === 'TopRated') return (r.rating || 0) >= 4.5;
    if (activeFilter === 'NorthIndian') return r.cuisine?.toLowerCase().includes('north indian');
    if (activeFilter === 'Continental') return r.cuisine?.toLowerCase().includes('continental');
    if (activeFilter === 'PanAsian') return r.cuisine?.toLowerCase().includes('asian');
    if (activeVibe) {
      const story = VIBE_STORIES.find(m => m.id === activeVibe);
      if (story?.cuisine && !r.cuisine?.toLowerCase().includes(story.cuisine.toLowerCase())) return false;
    }
    return true;
  });

  const trendingList = safeRestaurants.slice(0, 3);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 120px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── 1. DISTRICT HERO SPOTLIGHT MAGAZINE BANNER ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: 28,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0F1015 0%, #1A1C24 100%)',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: ' clamp(24px, 5vw, 40px)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.22)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Background Ambient Art / Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.38,
            mixBlendMode: 'overlay',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(13,14,18,0.95) 0%, rgba(13,14,18,0.7) 60%, rgba(13,14,18,0.3) 100%)',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 640 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 99,
              background: 'rgba(255, 82, 0, 0.2)',
              border: '1px solid rgba(255, 82, 0, 0.4)',
              color: '#FF5200',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            <Flame size={14} color="#FF5200" />
            <span>CAMPUS DINING WEEK · EXCLUSIVE 20% OFF</span>
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Savor the Best of Bennett Campus, {firstName}.
          </h1>

          <p
            style={{
              fontSize: 'clamp(13px, 2vw, 15px)',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            Skip long cafeteria queues. Pre-book tables, claim student discounts, and present instant QR entry passes.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (safeRestaurants.length > 0) setSelectedRestaurant(safeRestaurants[0]);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 99,
                background: 'linear-gradient(135deg, #FF5200 0%, #E02B00 100%)',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(255, 82, 0, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Zap size={16} />
              <span>Instant Reserve</span>
            </button>

            <button
              onClick={() => navigate('/discover')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 22px',
                borderRadius: 99,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Compass size={16} />
              <span>Browse All Outlets</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. ACTIVE BOARDING-PASS TICKET (IF ANY) ── */}
      {upcoming && (
        <div
          style={{
            borderRadius: 22,
            background: '#FFFFFF',
            border: '1px solid #EBE7E2',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Pass Header */}
          <div
            style={{
              padding: '12px 20px',
              background: '#0D0E12',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                LIVE TABLE RESERVATION · ACTIVE NOW
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              Pass Code: <strong style={{ color: '#FF5200' }}>{upcoming.passCode || 'BU-8492'}</strong>
            </span>
          </div>

          {/* Pass Body with Perforated Feel */}
          <div
            style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: '#FFF4EE',
                  border: '1px solid #FFE0D1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <QrCode size={28} color="#FF5200" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {upcoming.restaurantName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 13, color: '#666' }}>
                  <span>{upcoming.date}</span>
                  <span>•</span>
                  <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{upcoming.time}</span>
                  <span>•</span>
                  <span>{upcoming.partySize || 2} Guests</span>
                </div>
              </div>
            </div>

            {/* Table Badge & CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  background: '#F5F3F0',
                  border: '1px solid #E5E1DB',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Assigned</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FF5200' }}>{upcoming.tableAssigned || 'T-01'}</div>
              </div>

              <button
                onClick={() => setSelectedBookingForPass(upcoming)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 20px',
                  borderRadius: 99,
                  background: '#FF5200',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(255, 82, 0, 0.3)',
                }}
              >
                <QrCode size={16} />
                <span>Present Digital Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. "WHAT'S YOUR VIBE?" (DISTRICT STORY CIRCLES) ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>
              What's Your Vibe Today?
            </h2>
            <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Select mood to filter</span>
          </div>
          {activeVibe && (
            <button
              onClick={() => { setActiveVibe(null); setActiveFilter('All'); }}
              style={{ fontSize: 12, color: '#FF5200', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Reset Filter ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }} className="scrollbar-none">
          {VIBE_STORIES.map(vibe => {
            const isSelected = activeVibe === vibe.id;
            return (
              <button
                key={vibe.id}
                onClick={() => handleVibeClick(vibe)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  outline: 'none',
                }}
              >
                {/* Outer Ring */}
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    padding: 3,
                    background: isSelected
                      ? 'linear-gradient(135deg, #FF5200 0%, #E02B00 100%)'
                      : 'linear-gradient(135deg, #EAE6E1 0%, #D8D2C9 100%)',
                    boxShadow: isSelected ? '0 4px 16px rgba(255, 82, 0, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <span>{vibe.emoji}</span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#FF5200' : '#444444',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {vibe.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. QUICK FILTER PILLS BAR ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-none">
        {FILTERS.map(f => {
          const isAct = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id);
                setActiveVibe(null);
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                background: isAct ? '#0D0E12' : '#FFFFFF',
                color: isAct ? '#FFFFFF' : '#4A4A4A',
                border: `1px solid ${isAct ? '#0D0E12' : '#E5E1DB'}`,
                boxShadow: isAct ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── 5. CURATED SECTION: TRENDING TONIGHT ── */}
      {activeFilter === 'All' && !activeVibe && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>
                🔥 Trending Tonight on Campus
              </h2>
              <p style={{ fontSize: 13, color: '#777', marginTop: 2 }}>
                Highest rated spots with active student discounts
              </p>
            </div>
            <button
              onClick={() => navigate('/discover')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: '#FF5200',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>See all</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {trendingList.map(r => (
              <RestaurantCard
                key={`trending-${r.id}`}
                restaurant={r}
                onQuickReserve={res => setSelectedRestaurant(res)}
                onViewOffer={off => setSelectedOffer(off)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 6. ALL OUTLETS DISCOVERY GRID ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>
              {activeFilter === 'All' ? 'All Campus Dining Outlets' : `Filtered: ${activeFilter}`}
            </h2>
            <p style={{ fontSize: 13, color: '#777', marginTop: 2 }}>
              Showing {filteredRestaurants.length} places available for table reservations
            </p>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #ECE8E3',
            }}
          >
            <UtensilsCrossed size={36} color="#BBB" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>No spots match this vibe</h3>
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Try selecting another vibe or reset filters</p>
            <button
              onClick={() => { setActiveFilter('All'); setActiveVibe(null); }}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 14 }}
            >
              Show All Outlets
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
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

      {/* ── Modals & Drawers ── */}
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
    </div>
  );
}
