import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import api from '../services/api';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  Tag,
  Compass,
  UtensilsCrossed,
  ChefHat,
  ConciergeBell,
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { restaurants: contextRestaurants = [] } = useDining() || {};

  const [restaurants, setRestaurants] = useState(contextRestaurants);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Automatically redirect authenticated users to their role's home path
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

  // Fetch real restaurants from database if context is empty
  useEffect(() => {
    if (contextRestaurants.length > 0) {
      setRestaurants(contextRestaurants);
      return;
    }
    setLoadingRestaurants(true);
    api.restaurants.getAll()
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setRestaurants(res.data);
        }
      })
      .catch(err => console.warn('Could not load live restaurants on landing page:', err))
      .finally(() => setLoadingRestaurants(false));
  }, [contextRestaurants]);

  const displayList = restaurants.length > 0 ? restaurants.slice(0, 4) : [
    {
      id: 1,
      name: 'The Spice Garden',
      cuisine: 'North Indian & Awadhi',
      rating: 4.8,
      reviews: 142,
      distance: 0.8,
      price: '₹₹',
      offerLabel: '20% OFF',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      description: 'Slow-smoked dal makhani, Awadhi dum biryani, and artisanal clay-oven tandoor breads.'
    },
    {
      id: 2,
      name: 'The Deli Corner',
      cuisine: 'Artisan Cafe & Bakery',
      rating: 4.7,
      reviews: 215,
      distance: 0.5,
      price: '₹₹',
      offerLabel: 'BOGO Offer',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      description: 'Specialty cold brews, gourmet grilled paninis, sourdough toasts, and study lounge seating.'
    },
    {
      id: 3,
      name: 'Mezze & More',
      cuisine: 'Mediterranean Bowls',
      rating: 4.6,
      reviews: 98,
      distance: 1.2,
      price: '₹₹₹',
      offerLabel: 'Student Deal',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      description: 'Wood-fired pita breads, creamy garlic hummus, falafel platters, and souvlaki bowls.'
    },
    {
      id: 4,
      name: 'Wok & Roll',
      cuisine: 'Pan-Asian & Tokyo Ramen',
      rating: 4.4,
      reviews: 84,
      distance: 1.5,
      price: '₹₹',
      offerLabel: '15% OFF',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      description: 'Steaming miso and shoyu ramen, handcrafted crystal dim sums, and wok-tossed noodles.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Navigation Bar ─────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        padding: '14px 24px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #064E3B 0%, #15803D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
            }}>
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Dine@Bennett
              </div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                Bennett University Dining Network
              </div>
            </div>
          </div>

          {/* Nav Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/login')}
              style={{ fontWeight: 700, fontSize: 13 }}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/login')}
              style={{ borderRadius: 12, fontWeight: 700, fontSize: 13, gap: 6, padding: '8px 18px' }}
            >
              <span>Get Dining Pass</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(48px, 8vw, 84px) 24px',
        background: 'radial-gradient(ellipse at 50% 0%, #ECFDF5 0%, #F0FDF4 40%, #F8FAFC 100%)',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          {/* Institutional Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            borderRadius: 99,
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 20
          }}>
            <GraduationCap size={15} />
            <span>OFFICIAL CAMPUS DINING NETWORK • BENNETT UNIVERSITY</span>
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            margin: '0 auto 20px',
            maxWidth: 820
          }}>
            Campus Dining &amp; Table Passes, Seamlessly Connected.
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: '#475569',
            maxWidth: 680,
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}>
            Guaranteed table reservations with 20% campus discounts, Apple Wallet-style QR entry passes, and zero queue waiting across premier Bennett TechZone partner restaurants.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/login')}
              style={{
                borderRadius: 14,
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(21, 128, 61, 0.3)',
                gap: 8
              }}
            >
              <span>Sign In with University ID</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/login')}
              style={{
                borderRadius: 14,
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 700,
                background: '#FFFFFF',
                borderColor: '#CBD5E1'
              }}
            >
              <span>Explore TechZone Outlets</span>
            </button>
          </div>

          {/* Key Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            maxWidth: 780,
            margin: '48px auto 0',
            padding: '20px 24px',
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803D' }}>4</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Partner Outlets</div>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803D' }}>20%</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Student Discount</div>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803D' }}>3,400+</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Active Scholars</div>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803D' }}>0 min</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Queue Wait Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Partner Outlets ─────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px, 6vw, 64px) 24px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#15803D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Campus Neighborhood Outlets
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#0F172A', margin: '4px 0 0' }}>
              Premier Dining Near Bennett TechZone
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/login')}
            style={{ fontWeight: 700, color: '#15803D', gap: 4 }}
          >
            <span>View All Partner Menus</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Outlet Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
          {displayList.map(r => (
            <div
              key={r.id}
              onClick={() => navigate('/login')}
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden' }}>
                <img
                  src={r.image}
                  alt={r.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#0F172A',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 99,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    <span>{r.rating}</span>
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
                  <span style={{
                    background: '#064E3B',
                    color: '#ECFDF5',
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6
                  }}>
                    {r.offerLabel || 'Campus Discount'}
                  </span>
                </div>
              </div>

              <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                    {r.name}
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 8 }}>
                    {r.cuisine} · {r.distance} km from Campus · {r.price}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.description}
                  </p>
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#15803D' }}>
                    Instant Table Lock
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <span>Book Pass</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform Pillars ─────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px, 6vw, 64px) 24px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#15803D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Platform Benefits
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#0F172A', margin: '4px 0 10px' }}>
              Why Bennett Diners Love Dine@Bennett
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Tailored specifically for Bennett University scholars, faculty, and partner restaurant teams.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ padding: 24, borderRadius: 20, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                Verified University Passes
              </h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Automatic validation with your @bennett.edu.in email or 6-digit one-time passkey. Unlock 20% campus dining subsidies without showing physical cards.
              </p>
            </div>

            <div style={{ padding: 24, borderRadius: 20, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <QrCode size={22} />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                Apple Wallet Digital Passes
              </h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Instant scannable QR ticket ready on your mobile device. Just show the pass at the restaurant host desk for rapid seated entry.
              </p>
            </div>

            <div style={{ padding: 24, borderRadius: 20, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Clock size={22} />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                Zero Queue Priority Table Lock
              </h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Select your preferred lunch or dinner time window in advance. Your table is reserved and pre-ordered dishes are prepared for your arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 24px', background: '#0F172A', color: '#94A3B8', fontSize: 12, marginTop: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UtensilsCrossed size={16} color="#34D399" />
            <span style={{ color: '#FFFFFF', fontWeight: 800 }}>Dine@Bennett</span>
            <span>· Official Institutional Dining Platform</span>
          </div>

          <div>
            Bennett University · TechZone II, Greater Noida, UP 201310
          </div>
        </div>
      </footer>
    </div>
  );
}
