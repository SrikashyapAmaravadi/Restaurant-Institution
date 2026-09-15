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
  UtensilsCrossed,
  ChevronRight,
  Flame,
  Zap,
  MapPin,
  Sparkles,
  Ticket,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { restaurants: contextRestaurants = [] } = useDining() || {};

  const [restaurants, setRestaurants] = useState(contextRestaurants);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

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

  const displayList = restaurants.length > 0 ? restaurants.slice(0, 4) : [
    { id: 1, name: 'The Spice Garden', cuisine: 'North Indian', rating: 4.8, reviews: 142, distance: 0.8, price: '₹₹', offerLabel: '20% OFF', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', description: 'Slow-smoked dal makhani, Awadhi dum biryani, and artisanal tandoor breads.' },
    { id: 2, name: 'The Deli Corner', cuisine: 'Artisan Cafe', rating: 4.7, reviews: 215, distance: 0.5, price: '₹₹', offerLabel: 'BOGO', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'Specialty cold brews, gourmet grilled paninis, and sourdough toasts.' },
    { id: 3, name: 'Mezze & More', cuisine: 'Mediterranean', rating: 4.6, reviews: 98, distance: 1.2, price: '₹₹₹', offerLabel: 'Student Deal', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', description: 'Wood-fired pita breads, creamy garlic hummus, and falafel platters.' },
    { id: 4, name: 'Wok & Roll', cuisine: 'Pan-Asian', rating: 4.4, reviews: 84, distance: 1.5, price: '₹₹', offerLabel: '15% OFF', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', description: 'Steaming miso ramen, handcrafted dim sums, and wok-tossed noodles.' },
  ];

  const features = [
    { icon: ShieldCheck, title: 'Verified Student Pass', desc: 'Pre-linked to @bennett.edu.in. Unlock automated 20% campus dining subsidies on every reservation.', color: '#FF5200', bg: '#FFF5EE' },
    { icon: QrCode, title: 'Instant QR Seating', desc: 'Skip the reception wait. Simply present your dynamic digital boarding pass at the host desk.', color: '#10B981', bg: '#ECFDF5' },
    { icon: Zap, title: 'Real-Time Table Hold', desc: 'Secure high-demand indoor & patio tables with instant real-time confirmation in under 10 seconds.', color: '#6366F1', bg: '#EEF2FF' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0D0E12', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(13, 14, 18, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 28px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF5200 0%, #E02B00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 14px rgba(255, 82, 0, 0.4)',
              }}
            >
              <Flame size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#FFF',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                DISTRICT<span style={{ color: '#FF5200' }}>@BU</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500 }}>
                Bennett Campus Dining
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 16px',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 99,
                background: '#FF5200',
                color: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 82, 0, 0.35)',
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(60px, 10vw, 110px) 24px 60px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Glow Spheres */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 700,
            height: 400,
            background: 'radial-gradient(ellipse at center, rgba(255, 82, 0, 0.22) 0%, rgba(13, 14, 18, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 840 }}>
          {/* Pill Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 99,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FF5200',
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: '0.03em',
              marginBottom: 20,
            }}
          >
            <Sparkles size={14} color="#FF5200" />
            <span>THE NEXT-GEN CAMPUS DINING PASS</span>
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              marginBottom: 20,
              color: '#FFFFFF',
            }}
          >
            Discover, Reserve & Feast Across Bennett.
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              color: 'rgba(255, 255, 255, 0.65)',
              maxWidth: 620,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Real-time table bookings, verified student dining subsidies, and instant digital passes at all campus cafeterias & cafes.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
                borderRadius: 99,
                background: 'linear-gradient(135deg, #FF5200 0%, #E02B00 100%)',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(255, 82, 0, 0.45)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Explore Outlets</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                borderRadius: 99,
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
              }}
            >
              <Ticket size={16} color="#FF5200" />
              <span>Claim Student Pass</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#12141B', padding: '24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FF5200', fontFamily: "'Space Grotesk', sans-serif" }}>12+</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Campus Cafes</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', fontFamily: "'Space Grotesk', sans-serif" }}>0 min</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Queue Wait</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" }}>20%</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Student Discount</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3B82F6', fontFamily: "'Space Grotesk', sans-serif" }}>100%</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Digital Passes</div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '70px 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: '#FFF' }}>
            Built Exclusively for Bennett Scholars
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 }}>
            A unified hospitality platform connecting students with institutional eateries.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                style={{
                  padding: '28px',
                  borderRadius: 20,
                  background: '#14161F',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFF', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 24px', textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.4)' }}>
          © 2026 DISTRICT@BU · Bennett University Institutional Dining Services
        </div>
      </footer>
    </div>
  );
}
