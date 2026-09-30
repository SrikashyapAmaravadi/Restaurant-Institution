import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import './Landing.css';
import GlacierDoodleBackground from '../components/GlacierDoodleBackground';
import {
  ArrowRight,
  GraduationCap,
  ChevronRight,
  Compass,
  ChefHat,
  Building2,
  Tag,
  Copy,
  Check
} from 'lucide-react';

/* ── 4 Curated Campus Outlets with Big Visuals ── */
const FEATURED_OUTLETS = [
  {
    id: 1,
    name: 'The Spice Garden',
    cuisine: 'North Indian & Mughlai',
    distance: 'Block B · 80m',
    rating: '4.8★',
    tag: '20% SCHOLAR DISCOUNT',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Campus Roastery',
    cuisine: 'Artisanal Coffee & Shakes',
    distance: 'Library · 40m',
    rating: '4.7★',
    tag: 'ZERO-WAIT BREWS',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Green Bowl Organics',
    cuisine: 'Acai Bowls & Smoothies',
    distance: 'Sports Hub · 120m',
    rating: '4.9★',
    tag: 'CLEAN FUEL',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Kathi Junction',
    cuisine: 'Rolls & Midnight Bites',
    distance: 'Gate 2 · Open till 2 AM',
    rating: '4.6★',
    tag: 'EXAM NIGHT FUEL',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleAuthAction = () => {
    if (isAuthenticated && user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/management/superadmin');
      } else if (user.role === 'RESTAURANT_ADMIN' || user.role === 'RESTAURANT_STAFF') {
        navigate('/management/admin');
      } else {
        navigate('/discover');
      }
    } else {
      navigate('/login');
    }
  };

  const handleScrollToOutlets = (e) => {
    e?.preventDefault();
    const el = document.getElementById('outlets');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyVoucher = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('BENNETT20');
    setCopied(true);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch {}
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <div className="simple-landing-root">
      {/* ── Hand-Drawn Food & Campus Dining Doodles Canvas Background ── */}
      <GlacierDoodleBackground theme="light" />

      {/* ── Minimalist Topbar ── */}
      <header className="simple-landing-header">
        <div className="simple-landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="simple-brand-logo">nivix-dine-in</span>
          <span className="simple-brand-sub">Bennett Campus</span>
        </div>

        <button
          type="button"
          className="simple-header-btn"
          onClick={handleAuthAction}
        >
          <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign In to Dashboard'}</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* ── Grand Hero: Big Bold Captions ── */}
      <section className="simple-hero-section">
        <div className="simple-badge-pill">
          <span className="simple-pulse-dot" />
          <span>Bennett University Campus Dining</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="simple-hero-caption">
          Dine Without Waiting.
          <em>Your Table, Pre-Held.</em>
        </h1>

        {/* Punchy Subcaption */}
        <p className="simple-hero-subcaption">
          Instant table reservations, zero lunch queues, and an automatic 20% scholar discount across TechZone II campus partners.
        </p>

        {/* Primary Action Buttons */}
        <div className="simple-hero-actions">
          <button
            type="button"
            className="simple-btn-primary"
            onClick={handleAuthAction}
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Sign In to Your Dashboard'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="simple-btn-secondary"
            onClick={handleScrollToOutlets}
          >
            <Compass size={15} />
            <span>Explore Campus Outlets</span>
          </button>
        </div>

        {/* Quick Role Gateway Pills */}
        <div className="simple-roles-strip">
          <div className="simple-role-pill" onClick={handleAuthAction}>
            <GraduationCap size={14} />
            <span>Scholar Portal</span>
          </div>
          <div className="simple-role-pill" onClick={handleAuthAction}>
            <ChefHat size={14} />
            <span>Host Desk</span>
          </div>
          <div className="simple-role-pill" onClick={handleAuthAction}>
            <Tag size={14} />
            <span>Manager Hub</span>
          </div>
          <div className="simple-role-pill" onClick={handleAuthAction}>
            <Building2 size={14} />
            <span>Campus Admin</span>
          </div>
        </div>
      </section>

      {/* ── Curated Outlets: Big Visuals & Bold Captions ── */}
      <section
        id="outlets"
        className="simple-section simple-section-outlets"
      >
        <div className="simple-section-header">
          <h2 className="simple-section-caption">
            Campus Favorites. <em>Zero Wait.</em>
          </h2>
          <p className="simple-section-sub">
            Explore partner restaurants across campus or sign in to pre-book your table.
          </p>
        </div>

        <div className="simple-gallery-grid">
          {FEATURED_OUTLETS.map(outlet => (
            <div
              key={outlet.id}
              className="simple-gallery-card"
              onClick={handleAuthAction}
              style={{ cursor: 'pointer' }}
            >
              <div className="simple-card-image-wrap">
                <img
                  src={outlet.image}
                  alt={outlet.name}
                  className="simple-card-image"
                  loading="lazy"
                />
                <span className="simple-card-tag">{outlet.tag}</span>
              </div>

              <div className="simple-card-body">
                <h3 className="simple-card-title">{outlet.name}</h3>
                <div className="simple-card-meta">{outlet.cuisine} &bull; {outlet.distance}</div>

                <div className="simple-card-footer">
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#11120D' }}>{outlet.rating}</span>
                  <div className="simple-card-action">
                    <span>Sign In &amp; Reserve</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Privilege: Big Voucher Card ── */}
      <section className="simple-section">
        <div className="simple-voucher-container">
          <div className="simple-voucher-card">
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D8CFBC' }}>
                Semester Privilege
              </span>
              <h3 className="simple-voucher-big-caption">
                Flat 20% Off All Tabs.
              </h3>
              <p style={{ fontSize: 14, color: '#D8CFBC', margin: 0, maxWidth: 440, lineHeight: 1.5 }}>
                Auto-applied for all verified Bennett university accounts at every campus partner.
              </p>
            </div>

            <div className="simple-voucher-box">
              <span className="simple-voucher-code">BENNETT20</span>
              <button
                type="button"
                className="simple-copy-btn"
                onClick={handleCopyVoucher}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section
        className="simple-section"
        style={{ textAlign: 'center', paddingTop: 20 }}
      >
        <h2 className="simple-section-caption" style={{ marginBottom: 16 }}>
          Ready to Eat?
        </h2>
        <p className="simple-section-sub" style={{ marginBottom: 32 }}>
          Sign in to access your personalized campus dining dashboard and reserve tables in seconds.
        </p>
        <button
          type="button"
          className="simple-btn-primary"
          onClick={handleAuthAction}
        >
          <span>{isAuthenticated ? 'Open Dashboard' : 'Sign In to Your Dashboard'}</span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Minimal Clean Footer ── */}
      <footer className="simple-footer">
        <div className="simple-footer-content">
          <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 600, fontSize: 16, color: '#11120D' }}>
            nivix-dine-in
          </span>
          <span>&bull;</span>
          <span>Bennett University Dining Ecosystem</span>
          <span>&bull;</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
