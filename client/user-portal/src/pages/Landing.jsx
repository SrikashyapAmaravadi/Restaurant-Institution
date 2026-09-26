import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Sparkles,
  Tag,
  Zap,
  Clock,
  Check,
  Copy,
  GraduationCap,
  ChevronRight,
  Compass
} from 'lucide-react';
import BookingModal from '../components/BookingModal';
import OfferDrawer from '../components/OfferDrawer';

const PROMO_DEALS = [
  {
    id: 'scholar-subsidy',
    badge: 'Semester Exclusive',
    discount: 'FLAT 20% OFF',
    title: 'Bennett Scholar Dining Subsidy',
    description: 'Auto-applied on all dine-in tabs across partner outlets upon digital pass check-in.',
    code: 'BENNETT20',
    validity: 'Valid across all TechZone II campus partners',
    color: '#11120D',
  },
  {
    id: 'midnight-fuel',
    badge: '10:00 PM – 2:00 AM',
    discount: 'BOGO TREATS',
    title: 'Midnight Exam & Tuck Fuel',
    description: 'Buy-one-get-one on beverages and late-night munchies with gate pickup support.',
    code: 'NIGHTOWL',
    validity: 'Active daily at campus tuck shops & night canteens',
    color: '#565449',
  },
  {
    id: 'rush-priority',
    badge: '1:00 PM Lunch Rush',
    discount: 'VIP FASTPASS',
    title: 'Zero-Wait Table FastPass',
    description: 'Skip long physical queues between lab blocks. Table pre-held and waiting for your group.',
    code: 'PRIORITY',
    validity: 'Guaranteed seat reservation during rush hour',
    color: '#11120D',
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedForBooking, setSelectedForBooking] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePortalEntry = () => {
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
      navigate(target);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF4', color: '#11120D', display: 'flex', flexDirection: 'column' }}>

      {/* ── Minimalist Topbar ── */}
      <header
        style={{
          height: 68,
          padding: '0 clamp(16px, 4vw, 40px)',
          background: 'rgba(255, 251, 244, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #E8E2D5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'baseline', gap: 8, cursor: 'pointer' }}
        >
          <span
            style={{
              fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
              fontSize: 24,
              fontWeight: 600,
              fontStyle: 'italic',
              color: '#11120D',
              lineHeight: 1,
            }}
          >
            nivix-dine-in
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#565449',
              textTransform: 'uppercase',
            }}
          >
            Bennett
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            style={{
              padding: '7px 16px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              color: '#11120D',
              background: 'transparent',
              border: '1px solid #E8E2D5',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F6F2EA';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Compass size={14} />
            <span>Discover</span>
          </button>

          {isAuthenticated ? (
            <button
              onClick={handlePortalEntry}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: 99,
                padding: '7px 16px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <GraduationCap size={14} />
              <span>Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: 99,
                padding: '7px 18px',
                fontWeight: 600
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── Promotional Hero Section ── */}
      <section style={{ padding: 'clamp(36px, 5vw, 64px) 20px 24px', textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '4px 14px',
            borderRadius: 99,
            background: '#F6F2EA',
            border: '1px solid #E8E2D5',
            color: '#11120D',
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          <Sparkles size={12} color="#565449" />
          <span>Official Campus Dining Privileges</span>
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2.3rem, 5vw, 3.8rem)',
            fontWeight: 600,
            color: '#11120D',
            letterSpacing: '-0.025em',
            lineHeight: 1.12,
            margin: '0 auto 16px',
          }}
        >
          Savor More. Spend Less.
          <span
            style={{
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#565449',
              display: 'block',
              marginTop: 4,
            }}
          >
            Exclusive Dining Subsidies &amp; Instant Table Access.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(14px, 1.8vw, 15.5px)',
            color: '#565449',
            maxWidth: 580,
            margin: '0 auto 28px',
            lineHeight: 1.6,
          }}
        >
          Automatic 20% scholar discounts, midnight exam fuel perks, and zero-wait fast-pass reservations across all partner outlets near Bennett.
        </p>

        {/* Hero Actions */}
        <div className="landing-hero-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePortalEntry}
            className="btn btn-primary"
            style={{
              borderRadius: 99,
              padding: '11px 26px',
              fontSize: 14,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(17, 18, 13, 0.14)',
            }}
          >
            <span>Claim Student Pass</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/discover')}
            style={{
              borderRadius: 99,
              padding: '11px 24px',
              fontSize: 14,
              fontWeight: 600,
              background: '#FFFFFF',
              border: '1px solid #E8E2D5',
              color: '#11120D',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F6F2EA';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            <Compass size={15} />
            <span>Discover Outlets</span>
          </button>
        </div>
      </section>

      {/* ── Featured Promotional Voucher / Pass Ticket ── */}
      <section style={{ maxWidth: 860, margin: '10px auto 44px', padding: '0 20px', width: '100%' }}>
        <div
          style={{
            background: '#11120D',
            color: '#FFFBF4',
            borderRadius: 22,
            padding: 'clamp(20px, 4vw, 32px)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(17, 18, 13, 0.16)',
            border: '1px solid rgba(216, 207, 188, 0.2)',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-10%',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(216, 207, 188, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            className="landing-voucher-inner"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 99,
                  background: 'rgba(255, 251, 244, 0.12)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                  color: '#D8CFBC',
                }}
              >
                <Tag size={12} />
                <span>Semester-Long University Voucher</span>
              </div>

              <div
                style={{
                  fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 600,
                  lineHeight: 1.15,
                  margin: '4px 0 6px',
                }}
              >
                Flat 20% Off Dine-In Tabs
              </div>

              <p style={{ fontSize: 13.5, color: '#D8CFBC', margin: 0, maxWidth: 440, lineHeight: 1.5 }}>
                Pre-authorized for all registered Bennett scholar IDs. Simply show your digital QR pass upon arrival at any partner restaurant.
              </p>
            </div>

            {/* Promo Code Box */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 8,
                background: 'rgba(255, 251, 244, 0.08)',
                padding: '12px 18px',
                borderRadius: 14,
                border: '1px dashed rgba(216, 207, 188, 0.35)',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: '#D8CFBC', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Promo Voucher Code
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.12em', color: '#FFFBF4' }}>
                  BENNETT20
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode('BENNETT20')}
                  style={{
                    background: copiedCode === 'BENNETT20' ? '#16A34A' : '#FFFBF4',
                    color: copiedCode === 'BENNETT20' ? '#FFFFFF' : '#11120D',
                    border: 'none',
                    borderRadius: 99,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {copiedCode === 'BENNETT20' ? (
                    <>
                      <Check size={12} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curated Promotional Deals Grid ── */}
      <section style={{ maxWidth: 860, margin: '0 auto 56px', padding: '0 20px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 21, fontWeight: 600, color: '#11120D', margin: 0 }}>
            Featured Campus Perks
          </h2>
          <span style={{ fontSize: 12, color: '#565449', fontWeight: 500 }}>
            Auto-applied with verified student login
          </span>
        </div>

        <div
          className="landing-perks-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: 16,
          }}
        >
          {PROMO_DEALS.map(deal => (
            <div
              key={deal.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E2D5',
                borderRadius: 18,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 10px rgba(17, 18, 13, 0.03)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#11120D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E8E2D5';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: '#F6F2EA',
                    color: '#565449',
                    border: '1px solid #E8E2D5',
                    textTransform: 'uppercase',
                  }}
                >
                  {deal.badge}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#11120D' }}>
                  {deal.discount}
                </span>
              </div>

              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#11120D', margin: '0 0 6px' }}>
                {deal.title}
              </h3>

              <p style={{ fontSize: 12.5, color: '#565449', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
                {deal.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid #F6F2EA',
                }}
              >
                <span style={{ fontSize: 11, color: '#565449', fontWeight: 600 }}>
                  Code: <strong style={{ color: '#11120D' }}>{deal.code}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => navigate('/discover')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: 'none',
                    color: '#11120D',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <span>Explore</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Promotional CTA Banner ── */}
      <section style={{ maxWidth: 860, margin: '0 auto 60px', padding: '0 20px', width: '100%' }}>
        <div
          style={{
            background: '#F6F2EA',
            border: '1px solid #E8E2D5',
            borderRadius: 20,
            padding: '28px 24px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#11120D', margin: '0 0 8px' }}>
            Ready to Experience Campus Dining Privileges?
          </h2>
          <p style={{ fontSize: 13.5, color: '#565449', margin: '0 auto 18px', maxWidth: 460 }}>
            Sign in with your university credentials to unlock verified student rates, digital passes, and instant bookings.
          </p>
          <button
            type="button"
            onClick={handlePortalEntry}
            className="btn btn-primary"
            style={{
              borderRadius: 99,
              padding: '10px 24px',
              fontSize: 13.5,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{isAuthenticated ? 'Go to Scholar Dashboard' : 'Sign In with Student ID'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── Minimalist Clean Footer ── */}
      <footer style={{ borderTop: '1px solid #E8E2D5', padding: '24px 20px', textAlign: 'center', background: '#FFFFFF', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#565449' }}>
          <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 600, color: '#11120D', fontSize: 14 }}>
            nivix-dine-in
          </span>
          <span>&middot;</span>
          <span>Bennett University Campus Dining Privileges</span>
          <span>&middot;</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>

      {/* Interactive Booking & Offer Modals */}
      {selectedForBooking && (
        <BookingModal
          restaurant={selectedForBooking}
          isOpen={!!selectedForBooking}
          onClose={() => setSelectedForBooking(null)}
        />
      )}

      {selectedOffer && (
        <OfferDrawer
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onApplyOffer={offer => {
            if (offer?.restaurantId) {
              navigate('/discover');
            }
          }}
        />
      )}
    </div>
  );
}
