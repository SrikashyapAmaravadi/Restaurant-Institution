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
  ChevronRight
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
    { icon: ShieldCheck, title: 'Verified Passes', desc: 'Auto-validated with your @bennett.edu.in email. Unlock 20% campus dining subsidies instantly.', color: '#22C55E', bg: '#F0FDF4' },
    { icon: QrCode, title: 'Digital Entry', desc: 'Instant QR passes on your device. Show at the host desk for rapid seated entry.', color: '#3B82F6', bg: '#EFF6FF' },
    { icon: Clock, title: 'Zero Wait', desc: 'Book your time slot in advance. Your table is reserved and ready when you arrive.', color: '#F59E0B', bg: '#FFFBEB' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #EEE',
        padding: '12px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#FF5200',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
            }}>
              <UtensilsCrossed size={16} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>Dine@Bennett</div>
              <div style={{ fontSize: 10, color: '#999', fontWeight: 500 }}>Campus Dining</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '7px 16px', borderRadius: 8,
                background: 'transparent', border: 'none',
                color: '#555', fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '8px 18px', borderRadius: 8,
                background: '#111', color: '#FFF', border: 'none',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Get Started <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        padding: 'clamp(48px, 8vw, 80px) 24px',
        borderBottom: '1px solid #EEE',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 99,
            background: '#FFF5EE', border: '1px solid #FFDDCC',
            color: '#FF5200', fontSize: 11, fontWeight: 600,
            marginBottom: 24,
          }}>
            BENNETT UNIVERSITY · CAMPUS DINING
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5.5vw, 3.5rem)',
            fontWeight: 800, color: '#111',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            margin: '0 auto 20px', maxWidth: 700,
          }}>
            Campus dining,
            <br />
            <span style={{ color: '#FF5200' }}>simplified.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: '#777', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.5,
          }}>
            Reserve tables, get 20% student discounts, and skip the queue with digital passes across all Bennett campus restaurants.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '12px 28px', borderRadius: 10,
                background: '#FF5200', color: '#FFF', border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255,82,0,0.25)',
              }}
            >
              Sign in with University ID <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 24px', borderRadius: 10,
                background: '#FFF', color: '#555', border: '1px solid #DDD',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Explore restaurants
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 16, maxWidth: 600, margin: '48px auto 0',
            padding: '20px 24px', background: '#FFF',
            borderRadius: 14, border: '1px solid #EEE',
          }}>
            {[
              { val: '4', label: 'Venues' },
              { val: '20%', label: 'Discount', color: '#FF5200' },
              { val: '3,400+', label: 'Students' },
              { val: '0 min', label: 'Wait time', color: '#22C55E' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color || '#111' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Restaurants ── */}
      <section style={{ padding: 'clamp(36px, 5vw, 56px) 24px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#FF5200', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>
              Featured
            </div>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: '#111' }}>
              Campus dining partners
            </h2>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none',
              color: '#FF5200', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            View all <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
          {displayList.map(r => (
            <div
              key={r.id}
              onClick={() => navigate('/login')}
              style={{
                background: '#FFF', borderRadius: 14, overflow: 'hidden',
                border: '1px solid #EEE', cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                <img src={r.image} alt={r.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '3px 8px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.95)',
                    fontSize: 11, fontWeight: 700, color: '#333',
                  }}>
                    <Star size={10} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                    {r.rating}
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: 5,
                    background: '#FF5200', color: '#FFF',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {r.offerLabel}
                  </span>
                </div>
              </div>

              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>{r.name}</h3>
                  <div style={{ fontSize: 12, color: '#999', fontWeight: 500, marginBottom: 8 }}>
                    {r.cuisine} · {r.distance} km · {r.price}
                  </div>
                  <p style={{ fontSize: 12, color: '#AAA', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {r.description}
                  </p>
                </div>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#22C55E' }}>Instant booking</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    Reserve <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: 'clamp(36px, 5vw, 56px) 24px', background: '#FFF', borderTop: '1px solid #EEE', borderBottom: '1px solid #EEE' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto 36px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#FF5200', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>
              Why Dine@Bennett
            </div>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: '#111', marginBottom: 8 }}>
              Built for campus life
            </h2>
            <p style={{ fontSize: 13, color: '#888' }}>
              Designed for Bennett University students, faculty, and partner restaurants.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} style={{ padding: 24, borderRadius: 16, background: '#FAFAFA', border: '1px solid #F0F0F0' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: f.bg, color: f.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '28px 24px', background: '#111', color: '#777', fontSize: 12, marginTop: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UtensilsCrossed size={14} color="#FF5200" />
            <span style={{ color: '#FFF', fontWeight: 700 }}>Dine@Bennett</span>
            <span>· Campus Dining Platform</span>
          </div>
          <div>Bennett University · Greater Noida, UP 201310</div>
        </div>
      </footer>
    </div>
  );
}
