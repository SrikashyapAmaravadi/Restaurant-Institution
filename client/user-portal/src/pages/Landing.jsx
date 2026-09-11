import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import api from '../services/api';
import {
  Zap,
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
  CreditCard,
  ChefHat,
  ConciergeBell,
  Shield,
  Leaf
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { restaurants: contextRestaurants = [] } = useDining() || {};

  const [restaurants, setRestaurants] = useState(contextRestaurants);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Fetch real restaurants from database
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

  // Direct unconditional redirection to signin page on any click
  const handleRedirect = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    navigate('/login');
  };

  return (
    <div
      onClick={handleRedirect}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        color: 'var(--t1)',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        cursor: 'pointer'
      }}
    >
      {/* ── Responsive CSS Styles for Mobile-Friendliness ───────────── */}
      <style>{`
        .landing-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 14px;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .landing-container {
            padding: 0 24px;
          }
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items: center;
          width: 100%;
          min-width: 0;
        }
        @media (min-width: 900px) {
          .hero-grid {
            grid-template-columns: 1.15fr 0.85fr;
            gap: 48px;
          }
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .metrics-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }
        .venues-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          width: 100%;
        }
        @media (min-width: 640px) {
          .venues-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        @media (min-width: 1024px) {
          .venues-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }
        .how-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .how-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
        .btn-responsive-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 100%;
        }
        .btn-responsive-group .btn {
          width: 100%;
          max-width: 100%;
          white-space: normal;
          text-align: center;
          padding: 12px 16px;
          box-sizing: border-box;
        }
        @media (min-width: 560px) {
          .btn-responsive-group {
            flex-direction: row;
            width: auto;
          }
          .btn-responsive-group .btn {
            width: auto;
            white-space: nowrap;
            padding: 13px 22px;
          }
        }
        .touch-action-card {
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.24s ease;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          max-width: 100%;
          box-sizing: border-box;
        }
        .touch-action-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px rgba(15, 45, 30, 0.14), 0 4px 12px rgba(15, 45, 30, 0.05), 0 0 0 1px rgba(111, 175, 61, 0.25) !important;
          border-color: #9EC99B !important;
        }
        .touch-action-card:hover svg {
          transform: scale(1.14);
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .touch-action-card:hover img {
          transform: scale(1.05);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .touch-action-card:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* ── Sticky Mobile-Friendly Navbar ───────────────────────────── */}
      <header
        onClick={handleRedirect}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.94)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 2px 8px rgba(15, 45, 30, 0.05)',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        <div
          className="landing-container"
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--r-sm)',
                background: 'linear-gradient(135deg, var(--primary) 0%, #3E7841 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px var(--primary-glow)',
                border: '1px solid rgba(47, 94, 49, 0.25)',
                flexShrink: 0
              }}
            >
              <Leaf size={20} style={{ color: '#F1F7EC' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.03em' }}>
                  lora
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '2px 7px',
                    borderRadius: 'var(--r-full)',
                    background: '#E7F1E1',
                    color: 'var(--primary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  Natural
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'min(100%, 200px)' }}>
                Natural · Pure · Sustainable · Bennett Campus
              </div>
            </div>
          </div>

          {/* Right Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 5,
                fontSize: 10.5,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--r-full)',
                background: '#E7F1E1',
                color: 'var(--primary)',
                border: '1px solid var(--border)'
              }}
              className="desktop-nav-links"
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              Live Farm-To-Table
            </span>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleRedirect}
              style={{
                fontSize: 12,
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 'var(--r-full)',
                flexShrink: 0
              }}
            >
              <span>Sign In</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section
        onClick={handleRedirect}
        style={{
          position: 'relative',
          padding: '42px 0 52px',
          background: 'radial-gradient(ellipse at 50% 0%, #E7F1E1 0%, #EDF5E9 55%, #F1F7EC 100%)',
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <div className="landing-container">
          <div className="hero-grid">
            
            {/* Left Content */}
            <div className="anim-fade-up" style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 'var(--r-full)',
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: 16,
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Leaf size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontSize: 'clamp(9.5px, 2.7vw, 11px)', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.3 }}>
                  Natural · Pure · Sustainable · Bennett Campus
                </span>
              </div>

              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(1.85rem, 6.5vw, 3.2rem)',
                  fontWeight: 800,
                  color: 'var(--t1)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: 14,
                  wordBreak: 'break-word'
                }}
              >
                From Our Fields<br />
                <span style={{ color: 'var(--primary)' }}>To Your Table.</span>
              </h1>

              <p style={{ fontSize: 'clamp(0.9rem, 2.8vw, 1.05rem)', color: 'var(--t2)', lineHeight: 1.55, maxWidth: 520, marginBottom: 24, wordBreak: 'break-word' }}>
                Fresh Food, Directly From Farm To Table. Bennett University's official dining reservation and culinary discovery portal. Pre-book dining tables, claim verified 20% campus student privileges, and check in seamlessly with priority QR passes.
              </p>

              {/* Call to action buttons */}
              <div className="btn-responsive-group" style={{ marginBottom: 28 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleRedirect}
                  style={{
                    fontSize: 'clamp(12.5px, 3.5vw, 14px)',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 'var(--r-full)',
                    boxShadow: '0 6px 18px var(--primary-glow)'
                  }}
                >
                  <Leaf size={16} style={{ color: '#F1F7EC', flexShrink: 0 }} />
                  <span>Sign In &amp; Explore</span>
                  <ArrowRight size={14} style={{ flexShrink: 0 }} />
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={handleRedirect}
                  style={{
                    fontSize: 'clamp(12.5px, 3.5vw, 14px)',
                    fontWeight: 700,
                    borderRadius: 'var(--r-full)',
                    background: '#FFFFFF',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    border: '1.5px solid var(--border)'
                  }}
                >
                  <QrCode size={15} style={{ flexShrink: 0 }} />
                  <span>Access Student Dining Pass</span>
                </button>
              </div>

              {/* Metrics Counter (Mobile 2x2 Grid) */}
              <div
                className="metrics-grid"
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r-md)',
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)' }}>4+</div>
                  <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 600 }}>Partner Kitchens</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--accent)' }}>20%</div>
                  <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 600 }}>Campus Subsidy</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-light)' }}>100%</div>
                  <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 600 }}>Pure &amp; Sustainable</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--t1)' }}>0 Min</div>
                  <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 600 }}>Fast-Pass Seating</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Pass Showcase */}
            <div className="anim-fade-up delay-1">
              <div
                className="card touch-action-card"
                style={{
                  borderRadius: 'var(--r-lg)',
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '18px 18px',
                  width: '100%',
                  maxWidth: 420,
                  margin: '0 auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#E7F1E1', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <ShieldCheck size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>Verified Campus Diner</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>Pass Ref: #DB-4821</div>
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: 10.5 }}>Confirmed Seating</span>
                </div>

                {/* Cover Image */}
                <div style={{ position: 'relative', height: 140, borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: 12 }}>
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
                    alt="The Spice Garden"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 40%, rgba(15, 45, 30, 0.88) 100%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: 10
                    }}
                  >
                    <div>
                      <div style={{ color: '#F1F7EC', fontWeight: 800, fontSize: 15 }}>The Spice Garden</div>
                      <div style={{ color: '#E7F1E1', fontSize: 10.5 }}>Table T-04 · Main Lounge Booth</div>
                    </div>
                  </div>
                </div>

                {/* Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: 10, background: 'var(--bg-main)', borderRadius: 'var(--r-xs)', border: '1px solid var(--border)', marginBottom: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: 9.5, color: 'var(--t3)', textTransform: 'uppercase' }}>Time</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>1:30 PM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: 'var(--t3)', textTransform: 'uppercase' }}>Party</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>2 Guests</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: 'var(--t3)', textTransform: 'uppercase' }}>Discount</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>20% OFF</div>
                  </div>
                </div>

                {/* QR Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <QrCode size={30} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)' }}>Tap to Sign In &amp; Book</div>
                      <div style={{ fontSize: 9.5, color: 'var(--t3)' }}>Click anywhere to open sign-in</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Sign In &rarr;
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Partner Establishments Showcase (Real Database Restaurants Only) ── */}
      <section
        onClick={handleRedirect}
        style={{ padding: '48px 0', cursor: 'pointer' }}
      >
        <div className="landing-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
                Greater Noida Campus Radar
              </div>
              <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', fontWeight: 800, color: 'var(--t1)', margin: '4px 0 0' }}>
                Partner Dining Venues
              </h2>
              <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 3 }}>
                Verified partner outlets near Bennett University campus.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
              <span>Click any outlet to Sign In &rarr;</span>
            </div>
          </div>

          {/* Live Venues Cards */}
          {loadingRestaurants && restaurants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)', fontSize: 13 }}>
              Connecting to campus restaurant database...
            </div>
          ) : (
            <div className="venues-grid">
              {restaurants.map(rest => (
                <div
                  key={rest.id}
                  className="card touch-action-card"
                  style={{
                    borderRadius: 'var(--r-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Photo */}
                  <div style={{ position: 'relative', height: 160, width: '100%' }}>
                    <img
                      src={rest.heroImage || rest.image}
                      alt={rest.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    {rest.hasOffer && (
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 7px' }}>
                          <Tag size={10} /> {rest.offerLabel || '20% OFF'}
                        </span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 7px' }}>
                        ● Open
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
                      <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--t1)' }}>
                        {rest.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#D97706', fontWeight: 700, fontSize: 12 }}>
                        <Star size={13} fill="#D97706" /> {rest.rating}
                      </div>
                    </div>

                    <div style={{ fontSize: 11.5, color: 'var(--t3)', marginBottom: 8 }}>
                      {rest.cuisine} · {rest.price}
                    </div>

                    <p style={{ fontSize: 11.5, color: 'var(--t2)', lineHeight: 1.45, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rest.description || 'Verified partner dining outlet with direct table reservation privileges.'}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                        <MapPin size={12} />
                        <span>{rest.distance || 1.0} km away</span>
                      </div>
                      <span
                        className="btn btn-primary btn-xs"
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 'var(--r-full)' }}
                      >
                        Sign In to Pre-Book
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured "OUR MENU" Farm-To-Table Teaser (Image 2 Showcase) ── */}
      <section
        onClick={handleRedirect}
        style={{
          padding: '48px 0',
          background: 'radial-gradient(ellipse at 50% 0%, #1A4D32 0%, #0F2D1E 50%, #091D12 100%)',
          color: '#F1F7EC',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="landing-container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#A9C5A2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Leaf size={14} style={{ color: '#6FAF3D' }} />
              <span>Natural · Pure · Sustainable · Chef's Selection</span>
            </div>
            <h2 className="font-display" style={{ fontFamily: "'Paytone One', 'Outfit', sans-serif", fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 900, color: '#E7F1E1', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              OUR SIGNATURE MENU
            </h2>
            <p style={{ fontSize: 13, color: '#A9C5A2', marginTop: 4 }}>
              From Our Fields To Your Table · Tap any dish to sign in &amp; pre-order
            </p>
          </div>

          {/* Dish circular disc cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 18 }}>
            {[
              { name: 'Beef Pizza', desc: 'Charcoal thin-crust with pulled farm beef & aged mozzarella', price: '₹420', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', veg: false },
              { name: 'Black Burger', desc: 'Brioche activated charcoal bun with grilled patty & fresh slaw', price: '₹280', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80', veg: false },
              { name: 'Chicken Steak', desc: 'Tender marinated herb-crusted breast with crinkle fries & gravy', price: '₹390', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80', veg: false },
              { name: 'Spaghetti Pomodoro', desc: 'Al dente pasta tossed in organic garden vine-ripened tomatoes & basil', price: '₹310', img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80', veg: true }
            ].map((dish, idx) => (
              <div
                key={idx}
                className="touch-action-card"
                style={{
                  background: '#143C28',
                  border: '1px solid rgba(231, 241, 225, 0.16)',
                  borderRadius: 20,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
                }}
              >
                {/* Circular Dish Platter with Wooden Charger Rim */}
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    flexShrink: 0,
                    border: '4px solid #2B2016',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(214, 204, 169, 0.4)',
                    overflow: 'hidden'
                  }}
                >
                  <img src={dish.img} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: dish.veg ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#E7F1E1' }}>{dish.name}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#A9C5A2', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {dish.desc}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#6FAF3D' }}>{dish.price}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, background: '#6FAF3D', color: '#0F2D1E', padding: '3px 9px', borderRadius: 99 }}>
                      + Pre-Book
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (Mobile-Friendly 3-Step) ──────────────────── */}
      <section
        onClick={handleRedirect}
        style={{
          padding: '48px 0',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer'
        }}
      >
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
              Simple 3-Step Flow
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', fontWeight: 800, color: 'var(--t1)', margin: '4px 0 0' }}>
              How Dine@Bennett Works
            </h2>
          </div>

          <div className="how-grid">
            {/* Step 1 */}
            <div
              className="card touch-action-card"
              style={{
                padding: 20,
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E7F1E1', border: '1px solid var(--border)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                1
              </div>
              <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--t1)' }}>
                Verify University Email
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5 }}>
                Enter your official <code>@bennett.edu.in</code> address. Receive a 6-digit one-time cryptographic passkey with instant verification.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="card touch-action-card"
              style={{
                padding: 20,
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E7F1E1', border: '1px solid var(--border)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                2
              </div>
              <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--t1)' }}>
                Pre-Book Seating &amp; Menu
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5 }}>
                Pick your preferred time slot, dining zone (Lounge Booth or Outdoor Patio), and pre-order chef dishes to have them hot on arrival.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="card touch-action-card"
              style={{
                padding: 20,
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E7F1E1', border: '1px solid var(--border)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                3
              </div>
              <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--t1)' }}>
                Scan Pass &amp; Settle Instantly
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5 }}>
                Present your digital QR boarding pass to the host scanner. Settle table billing seamlessly with UPI (GPay/PhonePe), Cash, or Campus Card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Institutional Privileges (Mobile Friendly) ─────────────── */}
      <section
        onClick={handleRedirect}
        style={{ padding: '48px 0', cursor: 'pointer', background: 'var(--bg-main)' }}
      >
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
              Natural · Pure · Sustainable Benefits
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', fontWeight: 800, color: 'var(--t1)', margin: '4px 0 0' }}>
              Exclusive Platform Privileges
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
            <div className="card touch-action-card" style={{ padding: 18, borderRadius: 'var(--r-md)', background: '#FFFFFF', border: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E7F1E1', border: '1px solid var(--border)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Tag size={18} />
              </div>
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
                20% Negotiated Discounts
              </h4>
              <p style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.45 }}>
                Automatically factored into your final check across all partner outlets.
              </p>
            </div>

            <div className="card touch-action-card" style={{ padding: 18, borderRadius: 'var(--r-md)', background: '#FFFFFF', border: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E7F1E1', border: '1px solid var(--border)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Clock size={18} />
              </div>
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
                Priority Table Hold
              </h4>
              <p style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.45 }}>
                Your table is reserved and kept ready 15 minutes before your selected slot.
              </p>
            </div>

            <div className="card touch-action-card" style={{ padding: 18, borderRadius: 'var(--r-md)', background: '#FFFFFF', border: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E7F1E1', border: '1px solid var(--border)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Leaf size={18} />
              </div>
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
                Farm-to-Table Quality
              </h4>
              <p style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.45 }}>
                Partner venues undergo student-welfare hygiene and food safety compliance.
              </p>
            </div>

            <div className="card touch-action-card" style={{ padding: 18, borderRadius: 'var(--r-md)', background: '#FFFFFF', border: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E7F1E1', border: '1px solid var(--border)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <CreditCard size={18} />
              </div>
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
                Split UPI &amp; Student Bills
              </h4>
              <p style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.45 }}>
                Settle group dining bills without manual calculation hassles at front desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tap-Anywhere Mobile Call To Action ───────────────────────── */}
      <section
        onClick={handleRedirect}
        style={{
          padding: '52px 16px',
          background: 'linear-gradient(135deg, #2F5E31 0%, #1E4624 100%)',
          color: '#FFFFFF',
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 'var(--r-full)', background: 'rgba(231, 241, 225, 0.15)', border: '1px solid rgba(111, 175, 61, 0.3)', fontSize: 11, fontWeight: 700, marginBottom: 12, color: '#E7F1E1' }}>
            <Leaf size={14} style={{ color: '#6FAF3D' }} /> From Our Fields To Your Table
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.7rem, 5vw, 2.3rem)', fontWeight: 800, marginBottom: 10, lineHeight: 1.2, color: '#FFFFFF' }}>
            Ready to Dine Farm-Fresh Without Waiting?
          </h2>
          <p style={{ fontSize: 14, color: '#E7F1E1', lineHeight: 1.55, marginBottom: 24, opacity: 0.9 }}>
            Tap anywhere to sign in with your official university passkey and claim instant table reservations.
          </p>
          <button
            type="button"
            className="btn btn-md cursor-pointer"
            onClick={handleRedirect}
            style={{
              padding: '13px clamp(18px, 5vw, 30px)',
              fontSize: 'clamp(13px, 3.8vw, 14.5px)',
              maxWidth: '100%',
              fontWeight: 800,
              borderRadius: 'var(--r-full)',
              background: '#6FAF3D',
              color: '#0F2D1E',
              border: 'none',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>Sign In to Platform</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── Mobile-Friendly Footer ─────────────────────────────────── */}
      <footer
        onClick={handleRedirect}
        style={{
          padding: '28px 16px',
          background: '#091D12',
          color: '#A9C5A2',
          fontSize: 11.5,
          borderTop: '1px solid rgba(231, 241, 225, 0.12)',
          cursor: 'pointer'
        }}
      >
        <div className="landing-container" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Leaf size={16} style={{ color: '#6FAF3D' }} />
            <span style={{ color: '#FFFFFF', fontWeight: 800 }}>lora</span>
            <span>· Natural · Pure · Sustainable · Bennett Dining</span>
          </div>
          <div style={{ color: '#7E9F8A' }}>
            From Our Fields To Your Table · Bennett University, TechZone II, Greater Noida
          </div>
        </div>
      </footer>

    </div>
  );
}
