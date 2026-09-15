import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import api from '../services/api';
import {
  ArrowRight,
  ShieldCheck,
  Star,
  QrCode,
  Clock,
  ChevronRight,
  Search,
  MapPin,
  Calendar,
  Sparkles,
  UtensilsCrossed,
  Tag,
  Heart,
} from 'lucide-react';
import DistrictSearchModal from '../components/DistrictSearchModal';
import RestaurantCard from '../components/RestaurantCard';

const DISTRICT_NAV_TABS = [
  { id: 'foryou', label: 'For you' },
  { id: 'dining', label: 'Dining', active: true },
  { id: 'cafeteria', label: 'Cafeteria' },
  { id: 'hostels', label: 'Hostels' },
  { id: 'events', label: 'Events' },
  { id: 'night', label: 'Night Canteen' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { restaurants: contextRestaurants = [] } = useDining() || {};

  const [restaurants, setRestaurants] = useState(contextRestaurants);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const target = user?.homePath || (
        user?.role === 'RESTAURANT_ADMIN'
          ? '/management/admin'
          : user?.role === 'RESTAURANT_STAFF'
          ? '/management/staff'
          : user?.role === 'SUPER_ADMIN'
          ? '/management/superadmin'
          : '/dashboard'
      );
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (contextRestaurants.length > 0) {
      setRestaurants(contextRestaurants);
      return;
    }
    setLoadingRestaurants(true);
    api.restaurants.getAll()
      .then(res => {
        if (res?.success && Array.isArray(res.data)) setRestaurants(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingRestaurants(false));
  }, [contextRestaurants]);

  const displayList = restaurants.length > 0 ? restaurants.slice(0, 6) : [
    { id: 1, name: 'The Spice Garden', cuisine: 'North Indian', rating: 4.8, reviews: 142, distance: 0.8, price: '₹₹', offerLabel: '20% OFF', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'The Deli Corner', cuisine: 'Artisan Cafe', rating: 4.7, reviews: 215, distance: 0.5, price: '₹₹', offerLabel: 'BOGO', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Mezze & More', cuisine: 'Mediterranean', rating: 4.6, reviews: 98, distance: 1.2, price: '₹₹₹', offerLabel: 'Student Deal', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'Wok & Roll', cuisine: 'Pan-Asian', rating: 4.4, reviews: 84, distance: 1.5, price: '₹₹', offerLabel: '15% OFF', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>

      {/* ── 1. DISTRICT EXACT TOPBAR (Screenshot 1) ── */}
      <header
        style={{
          height: 76,
          padding: '0 clamp(16px, 4vw, 48px)',
          background: '#FFFFFF',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* District Logo */}
          <div
            onClick={() => navigate('/login')}
            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: '#000000',
                lineHeight: 1,
              }}
            >
              district
            </span>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#64748B',
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              BY BENNETT
            </span>
          </div>

          {/* Location Picker with Purple Pin */}
          <div
            onClick={() => setSearchModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 8,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <MapPin size={20} color="#6D28D9" strokeWidth={2.4} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                Bennett Campus
              </span>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                Greater Noida
              </span>
            </div>
          </div>
        </div>

        {/* Category Navigation Pills (Screenshot 1) */}
        <nav className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {DISTRICT_NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate('/login')}
              style={{
                padding: '7px 18px',
                borderRadius: 99,
                fontSize: 13.5,
                fontWeight: tab.active ? 700 : 500,
                color: tab.active ? '#BE185D' : '#334155',
                background: tab.active ? '#FFE4E6' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Search & Sign In */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setSearchModalOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6D28D9',
            }}
          >
            <Search size={19} strokeWidth={2.2} />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 99, padding: '9px 20px', fontWeight: 700 }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── 2. DISTRICT EXACT HEADLINE (Screenshot 1) ── */}
      <section style={{ padding: 'clamp(36px, 6vw, 64px) 20px 28px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.03em',
            lineHeight: 1.18,
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          Discover restaurants, explore menus, book tables, pay bills—
          <span
            style={{
              color: '#4F46E5',
              fontStyle: 'italic',
              fontWeight: 700,
              display: 'inline-block',
              marginLeft: 8,
            }}
          >
            all in one place.
          </span>
        </h1>
      </section>

      {/* ── 3. DISTRICT EXACT HERO BANNER CARD (Screenshot 1) ── */}
      <section style={{ padding: '0 clamp(16px, 4vw, 48px) 60px' }}>
        <div className="district-hero-canvas">
          <div className="district-hero-art">
            {/* Illustrated Culinary Graphic Elements (Simulated with SVGs) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(circle at 10% 20%, rgba(244, 63, 94, 0.25) 0%, transparent 40%),
                                  radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)`,
                pointerEvents: 'none',
              }}
            />

            {/* Subtle Illustrated Food Icons on canvas perimeter */}
            <div style={{ position: 'absolute', top: 20, left: 30, opacity: 0.85 }}>
              <span style={{ fontSize: 44 }}>🍝</span>
            </div>
            <div style={{ position: 'absolute', top: 20, right: 30, opacity: 0.85 }}>
              <span style={{ fontSize: 44 }}>🍕</span>
            </div>
            <div style={{ position: 'absolute', bottom: 24, left: 30, opacity: 0.85 }}>
              <span style={{ fontSize: 44 }}>🥗</span>
            </div>
            <div style={{ position: 'absolute', bottom: 24, right: 30, opacity: 0.85 }}>
              <span style={{ fontSize: 44 }}>🍷</span>
            </div>

            {/* Centered Serif Title */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
                  color: '#FBCFE8',
                  lineHeight: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>Seamlessly Crafted</span>
                <Sparkles size={18} color="#FDE047" />
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  marginTop: 4,
                }}
              >
                Dining Experiences
              </div>

              {/* Floating White Search Bar Pill (Screenshot 1) */}
              <div
                className="district-search-bar"
                onClick={() => setSearchModalOpen(true)}
              >
                <Search size={20} color="#64748B" />
                <span
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    fontSize: 15,
                    color: '#94A3B8',
                    fontWeight: 500,
                    paddingLeft: 12,
                  }}
                >
                  Search for a restaurant name
                </span>
                <button className="district-search-btn">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. DISTRICT EXACT FEATURE SHOWCASE SPLIT (Screenshot 2) ── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px', width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(32px, 6vw, 64px)',
            alignItems: 'center',
          }}
        >
          {/* Left: Romantic/Warm Restaurant Photography */}
          <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
              alt="Restaurant table setup"
              style={{
                width: '100%',
                height: 480,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* Right: Feature Timeline (Screenshot 2 exact copy) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}
            >
              Explore dining experiences{' '}
              <span style={{ color: '#4F46E5', fontStyle: 'italic', fontWeight: 700 }}>
                tailored to your mood.
              </span>
            </h2>

            {/* Bullet list with timeline dots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', paddingLeft: 18 }}>
              {/* Timeline guide line */}
              <div
                style={{
                  position: 'absolute',
                  left: 5,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: '#E2E8F0',
                }}
              />

              {[
                "15+ institutional eateries across Bennett campus - from late night tuck shops to executive dining",
                "Curated lists for every mood: study group sips, quick lunch breaks, midnight exam treats",
                "Browse by mood, cuisine, block proximity, occasion, or what's on student offer tonight",
                "Full live menus, food photos, and real campus vibes - no guesswork, no surprises",
                "Loved and reviewed by scholars, faculty, and diners everywhere you go"
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#CBD5E1',
                      marginTop: 7,
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  />
                  <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.55, fontWeight: 500 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. DISTRICT "BOOK" SHOWCASE SECTION (Screenshot 2) ── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px 80px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <Calendar size={28} color="#0F172A" />
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#0F172A' }}>
            Book
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {displayList.map(item => (
            <RestaurantCard
              key={item.id}
              restaurant={item}
              onQuickReserve={() => navigate('/login')}
              onViewOffer={() => navigate('/login')}
            />
          ))}
        </div>
      </section>

      {/* ── 6. PURE LIGHT FOOTER ── */}
      <footer style={{ borderTop: '1px solid #EEF0F3', padding: '40px 24px', textAlign: 'center', background: '#FAFAFB', marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#000' }}>
            district
          </span>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            © 2026 DISTRICT BY BENNETT · Institutional Campus Dining Ecosystem
          </p>
        </div>
      </footer>

      {/* District Search Modal Overlay */}
      <DistrictSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
