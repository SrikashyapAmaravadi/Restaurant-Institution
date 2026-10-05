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
  Check,
  Search,
  CalendarCheck,
  CreditCard,
  QrCode,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Smartphone,
  X,
  Layers,
  Star
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [copied, setCopied] = useState(false);

  // District 3-Pillar Interactive State
  const [activePillar, setActivePillar] = useState('discover'); // 'discover' | 'book' | 'pay'
  const [selectedCategory, setSelectedCategory] = useState('Cafes & Brews');
  const [selectedSlot, setSelectedSlot] = useState('1:00 PM');
  const [partySize, setPartySize] = useState(2);
  const [paidStep, setPaidStep] = useState(false);

  // Modals for Legal / Policies
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | 'policy' | null

  const handleAuthAction = (redirectPath = '/discover') => {
    if (isAuthenticated && user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/management/superadmin');
      } else if (user.role === 'RESTAURANT_ADMIN' || user.role === 'RESTAURANT_STAFF') {
        navigate('/management/admin');
      } else {
        navigate(redirectPath);
      }
    } else {
      navigate('/login');
    }
  };

  const handleScrollToDistrict = (e) => {
    e?.preventDefault();
    const el = document.getElementById('district-pillars');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyVoucher = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('CAMPUS20');
    setCopied(true);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
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
          <span className="simple-brand-sub">Institution Dining Network</span>
        </div>

        <div className="simple-header-nav-links">
          <button
            type="button"
            className="simple-nav-link-btn"
            onClick={handleScrollToDistrict}
          >
            Discover · Book · Pay
          </button>
          <button
            type="button"
            className="simple-header-btn"
            onClick={() => handleAuthAction('/discover')}
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ── Grand Hero: Big Bold Captions ── */}
      <section className="simple-hero-section">
        {/* Big Bold Headline */}
        <h1 className="simple-hero-caption">
          Dine Without Waiting.
          <em>Your Table, Pre-Held.</em>
        </h1>

        {/* Punchy Subcaption */}
        <p className="simple-hero-subcaption">
          Instant table reservations, zero lunch queues, and an automatic 20% institutional discount across university &amp; campus dining partners nationwide.
        </p>

        {/* Primary Action Buttons */}
        <div className="simple-hero-actions">
          <button
            type="button"
            className="simple-btn-primary"
            onClick={() => handleAuthAction('/discover')}
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Sign In to Your Dashboard'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="simple-btn-secondary"
            onClick={handleScrollToDistrict}
          >
            <Compass size={15} />
            <span>Explore How It Works</span>
          </button>
        </div>

        {/* Quick Role Gateway Pills */}
        <div className="simple-roles-strip">
          <div className="simple-role-pill" onClick={() => handleAuthAction('/discover')}>
            <GraduationCap size={14} />
            <span>Student &amp; Scholar</span>
          </div>
          <div className="simple-role-pill" onClick={() => handleAuthAction('/management/admin')}>
            <ChefHat size={14} />
            <span>Host Desk</span>
          </div>
          <div className="simple-role-pill" onClick={() => handleAuthAction('/management/admin')}>
            <Tag size={14} />
            <span>Restaurant Manager</span>
          </div>
          <div className="simple-role-pill" onClick={() => handleAuthAction('/management/superadmin')}>
            <Building2 size={14} />
            <span>Institution Admin</span>
          </div>
        </div>
      </section>

      {/* ── District-Inspired: Discover · Book · Pay Pillars (Transparent so doodle art is visible) ── */}
      <section id="district-pillars" className="simple-section district-experience-section">
        <div className="simple-section-header">
          <div className="district-prebadge">
            <Layers size={13} />
            <span>The District Dining Model</span>
          </div>
          <h2 className="simple-section-caption">
            Discover. Book. <em>Pay.</em>
          </h2>
          <p className="simple-section-sub">
            The next generation of campus dining, inspired by District. From live vibe discovery to zero-queue reservations and frictionless contactless billing.
          </p>
        </div>

        {/* District Tab Switcher */}
        <div className="district-tabs-bar">
          <button
            type="button"
            className={`district-tab-btn ${activePillar === 'discover' ? 'active' : ''}`}
            onClick={() => setActivePillar('discover')}
          >
            <div className="district-tab-icon-wrap">
              <Search size={16} />
            </div>
            <div className="district-tab-text">
              <span className="district-tab-num">01 / PILLAR</span>
              <span className="district-tab-title">Discover</span>
            </div>
          </button>

          <button
            type="button"
            className={`district-tab-btn ${activePillar === 'book' ? 'active' : ''}`}
            onClick={() => setActivePillar('book')}
          >
            <div className="district-tab-icon-wrap">
              <CalendarCheck size={16} />
            </div>
            <div className="district-tab-text">
              <span className="district-tab-num">02 / PILLAR</span>
              <span className="district-tab-title">Book</span>
            </div>
          </button>

          <button
            type="button"
            className={`district-tab-btn ${activePillar === 'pay' ? 'active' : ''}`}
            onClick={() => setActivePillar('pay')}
          >
            <div className="district-tab-icon-wrap">
              <CreditCard size={16} />
            </div>
            <div className="district-tab-text">
              <span className="district-tab-num">03 / PILLAR</span>
              <span className="district-tab-title">Pay</span>
            </div>
          </button>
        </div>

        {/* Active Pillar Showcase Card */}
        <div className="district-showcase-box">
          {activePillar === 'discover' && (
            <div className="district-pillar-content animate-fade-in">
              <div className="district-text-col">
                <span className="district-step-pill">Phase 01 · Curated Discovery</span>
                <h3 className="district-showcase-title">
                  Find Your Vibe Across Every Campus Node.
                </h3>
                <p className="district-showcase-desc">
                  Browse high-rated campus cafes, organic salad bars, quick-bite junctions, and formal dining. Check real-time table occupancy, live student buzz, dietary filters, and member discounts before leaving your dorm or lecture hall.
                </p>

                <div className="district-feature-bullets">
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>Live Table Density:</strong> See how packed each spot is right now in real time.</span>
                  </div>
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>Curated Cuisines:</strong> Artisanal coffee, healthy bowls, late-night midnight cravings.</span>
                  </div>
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>Campus Verified:</strong> Genuine peer ratings verified via institutional logins.</span>
                  </div>
                </div>

                <div className="district-cta-row">
                  <button
                    type="button"
                    className="simple-btn-primary"
                    onClick={() => handleAuthAction('/discover')}
                  >
                    <span>Browse Outlets</span>
                    <ArrowRight size={15} />
                  </button>
                  <span className="district-micro-hint">12+ partner kitchens currently open</span>
                </div>
              </div>

              {/* Interactive Discovery Simulation Card */}
              <div className="district-interactive-col">
                <div className="district-mockup-card">
                  <div className="district-mockup-topbar">
                    <div className="district-mockup-dots">
                      <span className="mockup-dot red" />
                      <span className="mockup-dot yellow" />
                      <span className="mockup-dot green" />
                    </div>
                    <span className="district-mockup-label">Live Discovery Engine</span>
                    <span className="district-live-badge">LIVE STATUS</span>
                  </div>

                  <div className="district-mockup-body">
                    {/* Category Filter Chips */}
                    <div className="district-mockup-chips">
                      {['Cafes & Brews', 'Quick Bites', 'Organic Bowls', 'Late Night', 'Fine Dine'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`mockup-chip ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Simulated Venue Card */}
                    <div className="district-venue-preview">
                      <div className="venue-preview-header">
                        <div>
                          <div className="venue-preview-title">The Artisanal Roastery &amp; Kitchen</div>
                          <div className="venue-preview-sub">Specialty Brews &bull; Sourdough &bull; 90m away</div>
                        </div>
                        <div className="venue-rating-badge">
                          <span>4.9</span>
                          <Star size={11} fill="#11120D" strokeWidth={0} />
                        </div>
                      </div>

                      <div className="venue-status-strip">
                        <div className="status-indicator-live">
                          <span className="pulse-ping" />
                          <span>4 Tables Free Now</span>
                        </div>
                        <span className="venue-discount-tag">20% CAMPUS PRIVILEGE</span>
                      </div>

                      <div className="venue-amenities">
                        <span className="venue-pill">High-Speed Wi-Fi</span>
                        <span className="venue-pill">Quiet Study Seating</span>
                        <span className="venue-pill">Instant QR Pass</span>
                      </div>

                      <button
                        type="button"
                        className="venue-action-btn"
                        onClick={() => setActivePillar('book')}
                      >
                        <span>Reserve Table at This Venue</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePillar === 'book' && (
            <div className="district-pillar-content animate-fade-in">
              <div className="district-text-col">
                <span className="district-step-pill">Phase 02 · Seamless Booking</span>
                <h3 className="district-showcase-title">
                  1-Tap Guaranteed Seating. Zero Queue Wait.
                </h3>
                <p className="district-showcase-desc">
                  Never stand outside waiting for a lunch table during rush hour again. Pick your arrival window, customize your party size, and unlock guaranteed priority entry with a dynamic digital pass right on your smartphone.
                </p>

                <div className="district-feature-bullets">
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>Pre-Held Tables:</strong> Your table is held ready 15 minutes before your slot.</span>
                  </div>
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>Digital Pass with QR:</strong> Flash your pass at the host desk for express walk-in.</span>
                  </div>
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>Flexible Group Sizes:</strong> Solo study desks up to 10+ student society gatherings.</span>
                  </div>
                </div>

                <div className="district-cta-row">
                  <button
                    type="button"
                    className="simple-btn-primary"
                    onClick={() => handleAuthAction('/discover')}
                  >
                    <span>Reserve a Table</span>
                    <ArrowRight size={15} />
                  </button>
                  <span className="district-micro-hint">Instant automated confirmation</span>
                </div>
              </div>

              {/* Interactive Booking Simulation Card */}
              <div className="district-interactive-col">
                <div className="district-mockup-card">
                  <div className="district-mockup-topbar">
                    <div className="district-mockup-dots">
                      <span className="mockup-dot red" />
                      <span className="mockup-dot yellow" />
                      <span className="mockup-dot green" />
                    </div>
                    <span className="district-mockup-label">Smart Reservation Pass</span>
                    <span className="district-live-badge">ZERO WAIT</span>
                  </div>

                  <div className="district-mockup-body">
                    {/* Time Slot Selector */}
                    <div className="mockup-section-label">Select Arrival Window</div>
                    <div className="district-slot-grid">
                      {['12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`mockup-slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock size={12} />
                          <span>{slot}</span>
                        </button>
                      ))}
                    </div>

                    {/* Party Size Selector */}
                    <div className="mockup-section-label" style={{ marginTop: 14 }}>Party Size</div>
                    <div className="district-party-row">
                      {[1, 2, 4, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`mockup-party-btn ${partySize === num ? 'active' : ''}`}
                          onClick={() => setPartySize(num)}
                        >
                          <Users size={12} />
                          <span>{num} {num === 1 ? 'Guest' : 'Guests'}</span>
                        </button>
                      ))}
                    </div>

                    {/* Pass Confirmation Badge */}
                    <div className="booking-pass-preview">
                      <div className="pass-preview-left">
                        <QrCode size={40} className="pass-preview-qr" />
                        <div>
                          <div className="pass-code">PASS-NVX-{partySize}P</div>
                          <div className="pass-details">Table for {partySize} &bull; {selectedSlot} Today</div>
                        </div>
                      </div>
                      <div className="pass-status-pill">VERIFIED PASS</div>
                    </div>

                    <button
                      type="button"
                      className="venue-action-btn"
                      onClick={() => setActivePillar('pay')}
                    >
                      <span>Proceed to Contactless Pay Step</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePillar === 'pay' && (
            <div className="district-pillar-content animate-fade-in">
              <div className="district-text-col">
                <span className="district-step-pill">Phase 03 · Frictionless Pay</span>
                <h3 className="district-showcase-title">
                  Pay at the Table. 20% Subsidy Auto-Applied.
                </h3>
                <p className="district-showcase-desc">
                  Skip waving down servers or waiting for physical card machines. Review your itemized tab right on your mobile screen, watch your institutional member discount apply automatically, and settle via UPI or card with instantaneous digital invoices.
                </p>

                <div className="district-feature-bullets">
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>Auto Member Subsidy:</strong> 20% discount credited on total bill before tax.</span>
                  </div>
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>UPI &amp; Card Express:</strong> Settle within 5 seconds via any UPI app or card.</span>
                  </div>
                  <div className="district-bullet-item">
                    <CheckCircle2 size={16} className="district-bullet-icon" />
                    <span><strong>Instant GST Receipt:</strong> Download verified tax invoice directly to your phone.</span>
                  </div>
                </div>

                <div className="district-cta-row">
                  <button
                    type="button"
                    className="simple-btn-primary"
                    onClick={() => handleAuthAction('/discover')}
                  >
                    <span>Start Dining Today</span>
                    <ArrowRight size={15} />
                  </button>
                  <span className="district-micro-hint">Zero surcharge or booking fees</span>
                </div>
              </div>

              {/* Interactive Pay Simulation Card */}
              <div className="district-interactive-col">
                <div className="district-mockup-card">
                  <div className="district-mockup-topbar">
                    <div className="district-mockup-dots">
                      <span className="mockup-dot red" />
                      <span className="mockup-dot yellow" />
                      <span className="mockup-dot green" />
                    </div>
                    <span className="district-mockup-label">Instant Digital Check</span>
                    <span className="district-live-badge">ENCRYPTED PAY</span>
                  </div>

                  <div className="district-mockup-body">
                    {/* Itemized Bill Preview */}
                    <div className="pay-breakdown-card">
                      <div className="pay-breakdown-row">
                        <span className="pay-item-name">2x Truffle Cold Brew &amp; Bowls</span>
                        <span className="pay-item-val">₹680.00</span>
                      </div>
                      <div className="pay-breakdown-row">
                        <span className="pay-item-name">1x Woodfired Artisan Flatbread</span>
                        <span className="pay-item-val">₹320.00</span>
                      </div>
                      <div className="pay-divider" />
                      <div className="pay-breakdown-row">
                        <span>Subtotal</span>
                        <span>₹1,000.00</span>
                      </div>
                      <div className="pay-breakdown-row privilege-row">
                        <span className="privilege-label">
                          <Sparkles size={13} />
                          <span>Campus Member Privilege (20%)</span>
                        </span>
                        <span className="privilege-val">-₹200.00</span>
                      </div>
                      <div className="pay-breakdown-row">
                        <span>Restaurant GST (5%)</span>
                        <span>₹40.00</span>
                      </div>
                      <div className="pay-divider bold" />
                      <div className="pay-breakdown-row total-row">
                        <span>Grand Total Payable</span>
                        <span className="total-amount">₹840.00</span>
                      </div>
                    </div>

                    {/* Settle Action */}
                    <button
                      type="button"
                      className={`pay-settle-btn ${paidStep ? 'settled' : ''}`}
                      onClick={() => {
                        setPaidStep(true);
                        try {
                          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
                        } catch {}
                        setTimeout(() => setPaidStep(false), 3000);
                      }}
                    >
                      {paidStep ? (
                        <>
                          <Check size={16} />
                          <span>Paid &bull; Verified Receipt Generated</span>
                        </>
                      ) : (
                        <>
                          <Smartphone size={16} />
                          <span>Pay ₹840.00 via Instant UPI / Cards</span>
                        </>
                      )}
                    </button>
                    <div className="pay-footnote">
                      <span>Powered by Nivix Contactless Dining Protocol</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom 3 Highlights Grid */}
        <div className="district-triplet-grid">
          <div className="district-mini-card" onClick={() => setActivePillar('discover')}>
            <div className="mini-card-icon-wrap">
              <Compass size={20} />
            </div>
            <h4 className="mini-card-title">1. Real-Time Discovery</h4>
            <p className="mini-card-desc">
              Browse dining venues near campus with live seat counters, dynamic menus, and verified hygiene scores.
            </p>
          </div>

          <div className="district-mini-card" onClick={() => setActivePillar('book')}>
            <div className="mini-card-icon-wrap">
              <CalendarCheck size={20} />
            </div>
            <h4 className="mini-card-title">2. Express Table Booking</h4>
            <p className="mini-card-desc">
              Select time slot and party size with guaranteed priority seating and zero wait-time digital QR passes.
            </p>
          </div>

          <div className="district-mini-card" onClick={() => setActivePillar('pay')}>
            <div className="mini-card-icon-wrap">
              <CreditCard size={20} />
            </div>
            <h4 className="mini-card-title">3. Contactless Payment</h4>
            <p className="mini-card-desc">
              Enjoy auto-applied 20% campus member discounts, split payments, and instant digital GST invoices.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Privilege: Big Voucher Card ── */}
      <section className="simple-section">
        <div className="simple-voucher-container">
          <div className="simple-voucher-card">
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D8CFBC' }}>
                Campus &amp; Institution Privilege
              </span>
              <h3 className="simple-voucher-big-caption">
                Flat 20% Off All Tabs.
              </h3>
              <p style={{ fontSize: 14, color: '#D8CFBC', margin: 0, maxWidth: 440, lineHeight: 1.5 }}>
                Auto-applied for all verified university students, faculty, and institutional members across every partner restaurant.
              </p>
            </div>

            <div className="simple-voucher-box">
              <span className="simple-voucher-code">CAMPUS20</span>
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

      {/* ── Ready to Eat Call to Action ── */}
      <section
        className="simple-section"
        style={{ textAlign: 'center', paddingTop: 20 }}
      >
        <h2 className="simple-section-caption" style={{ marginBottom: 16 }}>
          Ready to Dine Smarter?
        </h2>
        <p className="simple-section-sub" style={{ marginBottom: 32 }}>
          Sign in to access your personalized institution dining dashboard, discover partner venues, and reserve tables in seconds.
        </p>
        <button
          type="button"
          className="simple-btn-primary"
          onClick={() => handleAuthAction('/discover')}
        >
          <span>{isAuthenticated ? 'Open Dashboard' : 'Sign In to Your Dashboard'}</span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Comprehensive Modern Footer ── */}
      <footer className="modern-footer-root">
        <div className="modern-footer-container">
          {/* Top Brand Banner & Mission */}
          <div className="footer-top-row">
            <div className="footer-brand-col">
              <div className="footer-brand-logo-wrap">
                <span className="footer-brand-title">nivix-dine-in</span>
                <span className="footer-brand-pill">CAMPUS NETWORK</span>
              </div>
              <p className="footer-brand-tagline">
                The premier dining, priority table reservation, and contactless payment network engineered for colleges, universities, and educational campuses.
              </p>
              <div className="footer-status-badge">
                <span className="status-dot-pulse" />
                <span>All Campus Nodes Operational &bull; 99.98% Uptime</span>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="footer-quick-actions">
              <div className="footer-stat-box">
                <span className="footer-stat-number">40+</span>
                <span className="footer-stat-label">Campus Partners</span>
              </div>
              <div className="footer-stat-box">
                <span className="footer-stat-number">Zero</span>
                <span className="footer-stat-label">Queue Waiting</span>
              </div>
              <div className="footer-stat-box">
                <span className="footer-stat-number">20%</span>
                <span className="footer-stat-label">Member Subsidy</span>
              </div>
            </div>
          </div>

          {/* Main Multi-Column Footer Grid */}
          <div className="footer-columns-grid">
            {/* Column 1: District Experience */}
            <div className="footer-nav-col">
              <h4 className="footer-col-heading">Dining Experience</h4>
              <ul className="footer-links-list">
                <li>
                  <button type="button" onClick={() => handleAuthAction('/discover')}>
                    Explore Restaurants
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleAuthAction('/discover')}>
                    Live Table Booking
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleAuthAction('/bookings')}>
                    Digital Priority Passes
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleAuthAction('/discover')}>
                    Contactless Bill Pay
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleAuthAction('/profile')}>
                    Campus Member Privileges
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Institutions & Partners */}
            <div className="footer-nav-col">
              <h4 className="footer-col-heading">For Institutions</h4>
              <ul className="footer-links-list">
                <li>
                  <button type="button" onClick={() => handleAuthAction('/management/admin')}>
                    Partner Restaurant Desk
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleAuthAction('/management/admin')}>
                    Host Desk Table Manager
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleAuthAction('/management/superadmin')}>
                    Campus Admin Console
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveModal('policy')}>
                    Onboard Your University
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveModal('policy')}>
                    Institutional Dining Charter
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Compliance */}
            <div className="footer-nav-col">
              <h4 className="footer-col-heading">Legal &amp; Privacy</h4>
              <ul className="footer-links-list">
                <li>
                  <button type="button" onClick={() => setActiveModal('terms')}>
                    Terms &amp; Conditions
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveModal('privacy')}>
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveModal('policy')}>
                    Cancellation &amp; No-Show Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveModal('terms')}>
                    Student Verification Guidelines
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveModal('privacy')}>
                    Data Security &amp; Encryption
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Social Handling & Community */}
            <div className="footer-nav-col">
              <h4 className="footer-col-heading">Connect &amp; Social</h4>
              <p className="footer-social-intro">
                Follow our campus dining chronicles, partner spotlights, and product drops:
              </p>
              <div className="footer-social-handles-grid">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-card"
                  title="Twitter / X"
                >
                  <span className="social-pill-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </span>
                  <div className="social-pill-info">
                    <span className="social-pill-name">X (Twitter)</span>
                    <span className="social-pill-handle">@nivixdinein</span>
                  </div>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-card"
                  title="Instagram"
                >
                  <span className="social-pill-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </span>
                  <div className="social-pill-info">
                    <span className="social-pill-name">Instagram</span>
                    <span className="social-pill-handle">@nivix.dine</span>
                  </div>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-card"
                  title="LinkedIn"
                >
                  <span className="social-pill-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect width="4" height="12" x="2" y="9"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </span>
                  <div className="social-pill-info">
                    <span className="social-pill-name">LinkedIn</span>
                    <span className="social-pill-handle">Nivix Technologies</span>
                  </div>
                </a>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-card"
                  title="GitHub"
                >
                  <span className="social-pill-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                      <path d="M9 18c-4.51 2-5-2-7-2"/>
                    </svg>
                  </span>
                  <div className="social-pill-info">
                    <span className="social-pill-name">GitHub</span>
                    <span className="social-pill-handle">nivix-dine-in</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Legal, Trust & Copyright Strip */}
          <div className="footer-bottom-bar">
            <div className="footer-bottom-copy">
              <span>&copy; {new Date().getFullYear()} Nivix Technologies Inc. All rights reserved.</span>
              <span className="footer-divider-dot">&bull;</span>
              <span>Multi-Campus Institutional Dining Network</span>
            </div>

            <div className="footer-trust-chips">
              <span className="trust-chip">
                <ShieldCheck size={13} />
                <span>PCI-DSS Compliant Payments</span>
              </span>
              <span className="trust-chip">
                <span>Verified Campus Access</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Interactive Legal / Policies Modal ── */}
      {activeModal && (
        <div className="legal-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-header">
              <div className="legal-modal-title-wrap">
                <ShieldCheck size={20} color="#11120D" />
                <h3 className="legal-modal-title">
                  {activeModal === 'terms' && 'Terms & Conditions'}
                  {activeModal === 'privacy' && 'Privacy & Data Governance Policy'}
                  {activeModal === 'policy' && 'Campus Dining & Cancellation Charter'}
                </h3>
              </div>
              <button
                type="button"
                className="legal-modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="legal-modal-body">
              {activeModal === 'terms' && (
                <div className="legal-text-content">
                  <h4>1. Acceptance of Terms</h4>
                  <p>
                    By accessing or using the Nivix Dine-In platform, mobile web portals, and associated campus dining services, you agree to be bound by these Terms and Conditions. These terms apply to all students, scholars, faculty members, institutional affiliates, and restaurant partner operators.
                  </p>

                  <h4>2. Institutional Eligibility &amp; Identity Verification</h4>
                  <p>
                    Student and faculty privileges—including guaranteed table reservations, promotional discounts (e.g., CAMPUS20), and expedited seating passes—are extended to verified institutional members. Verification may occur via institutional email validation or verified digital student passkeys.
                  </p>

                  <h4>3. Table Reservations &amp; Queue Priority</h4>
                  <p>
                    Table reservations are pre-allocated by partner host desks based on venue capacity. Guests are expected to arrive within 15 minutes of the selected time slot. In the event of unforeseen rush or host capacity constraints, partner restaurants maintain a duty of care to seat pre-booked guests in priority order.
                  </p>

                  <h4>4. Contactless Billing &amp; Payment Settlement</h4>
                  <p>
                    Payments made through the Nivix platform utilize encrypted payment gateways (including UPI, credit/debit cards, and student passes). Institutional discounts are automatically reconciled on bill generation. All payments are final upon QR generation and restaurant receipt issuance.
                  </p>

                  <h4>5. Code of Conduct &amp; Venue Rules</h4>
                  <p>
                    All users are required to treat restaurant staff, fellow students, and partner personnel with dignity and respect. Any fraudulent attempts to manipulate vouchers or violate host policies may result in suspension of reservation privileges.
                  </p>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="legal-text-content">
                  <h4>1. Data We Collect</h4>
                  <p>
                    We collect essential information required to fulfill dining reservations and facilitate contactless payments: name, institutional email address, department/program, booking times, party sizes, and transaction records. We do not store plain-text payment card credentials.
                  </p>

                  <h4>2. Use of Information</h4>
                  <p>
                    Your data is solely used to reserve tables, apply institutional discounts, facilitate restaurant check-in verification, and improve campus dining logistics. We do not sell or monetize personal student or faculty data to third-party advertisers.
                  </p>

                  <h4>3. Data Security &amp; Retention</h4>
                  <p>
                    All data transmissions across the Nivix Dine-In network are encrypted using TLS 1.3 encryption. Transaction records are maintained strictly in accordance with statutory accounting and financial compliance standards.
                  </p>

                  <h4>4. User Rights</h4>
                  <p>
                    Users may request an extract of their dining history, update their profile information, or request account deactivation at any time via the User Profile portal or by contacting our support team.
                  </p>
                </div>
              )}

              {activeModal === 'policy' && (
                <div className="legal-text-content">
                  <h4>1. Cancellation Policy</h4>
                  <p>
                    Reservations may be cancelled at any time up to 15 minutes before the scheduled time slot without penalty. Timely cancellations free up capacity for fellow campus peers.
                  </p>

                  <h4>2. No-Show Guidelines</h4>
                  <p>
                    If a table is not claimed within 20 minutes following the booked slot, the partner venue may release the table to walk-in diners to maintain kitchen flow. Repeated unresolved no-shows may limit advance booking privileges for a 14-day period.
                  </p>

                  <h4>3. Institutional Dining Charter</h4>
                  <p>
                    Nivix Dine-In operates as an open multi-institution technology network designed to optimize campus hospitality, eliminate dining hall congestion, and ensure transparent, hygienic, and affordable meals for academic communities.
                  </p>
                </div>
              )}
            </div>

            <div className="legal-modal-footer">
              <span className="legal-footer-note">Last updated: Academic Year 2026 &bull; Multi-Campus Edition</span>
              <button
                type="button"
                className="simple-btn-primary"
                style={{ padding: '8px 20px', fontSize: 13 }}
                onClick={() => setActiveModal(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
