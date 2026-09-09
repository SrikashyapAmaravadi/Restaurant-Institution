import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Award,
  Calendar,
  Sparkles,
  QrCode,
  Building,
  Save,
  Check,
  Bell,
  Mail,
  User,
  GraduationCap
} from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth() || {};
  const [name, setName] = useState(user?.name || 'Campus Scholar');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dietary, setDietary] = useState('Non-Vegetarian');
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const [notifBookings, setNotifBookings] = useState(true);
  const [notifOffers, setNotifOffers] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    if (user && setUser) {
      const updated = { ...user, name, phone, dietary };
      setUser(updated);
      localStorage.setItem('dine_bennett_user', JSON.stringify(updated));
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="page-pad">
      <div style={{ maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Holographic Digital Student ID Card */}
        <div
          className="anim-fade-up"
          style={{
            borderRadius: 'var(--r-lg)',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 60%, #172554 100%)',
            border: '2px solid rgba(129, 140, 248, 0.4)',
            boxShadow: '0 12px 40px rgba(79, 70, 229, 0.25)',
            padding: 28,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Hologram sheen watermark */}
          <div style={{
            position: 'absolute',
            right: -30,
            bottom: -30,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Card Top Branding */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }} className="font-display">
                  BENNETT UNIVERSITY
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Institutional Dining Pass · ID Verified
                </div>
              </div>
            </div>

            <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
              <ShieldCheck size={14} /> ACTIVE MEMBER
            </span>
          </div>

          {/* Card Middle: Photo + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80'}
              alt={user?.name || 'User Avatar'}
              style={{ width: 90, height: 90, borderRadius: 'var(--r-sm)', objectFit: 'cover', border: '2px solid var(--accent)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
            />

            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {name || user?.name || 'Institutional Scholar'}
              </h3>
              <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 4 }}>
                {user?.department || user?.roleLabel || 'Bennett University Community'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                {user?.rollNumber ? `ID: ${user.rollNumber} · ` : ''}{user?.email || 'authenticated@bennett.edu.in'}
              </div>
            </div>

            {/* Verification Barcode / QR Box */}
            <div style={{
              background: '#fff',
              padding: 8,
              borderRadius: 'var(--r-xs)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(user?.email || 'BENNETT-ID')}`}
                alt="Institutional QR"
                style={{ width: 68, height: 68, display: 'block' }}
              />
              <span style={{ fontSize: 9, fontWeight: 800, color: '#000', display: 'block', marginTop: 2 }}>
                {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : user?.role === 'RESTAURANT_ADMIN' ? 'OWNER PASS' : user?.role === 'RESTAURANT_STAFF' ? 'HOST PASS' : 'BENNETT ID'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats and Badges */}
        <div className="anim-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Dining Rank</div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>Campus Gourmet</div>
              <div style={{ fontSize: 11, color: 'var(--accent)' }}>Top 5% active diner</div>
            </div>
          </div>

          <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Honor Status</div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>100% Attendance</div>
              <div style={{ fontSize: 11, color: '#34D399' }}>Zero reservation no-shows</div>
            </div>
          </div>

          <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Community</div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>5 Helpful Reviews</div>
              <div style={{ fontSize: 11, color: 'var(--primary-light)' }}>51 students found helpful</div>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="card anim-fade-up delay-2" style={{ padding: 28 }}>
          <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
            Personal Details & Preferences
          </h3>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
            Update contact info and dietary preferences for partner restaurant kitchen preparations.
          </p>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <label className="form-label">Full Name</label>
                <div className="form-input-wrap">
                  <User size={15} className="form-input-icon text-amber-400" />
                  <input
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Institutional Email (Read Only)</label>
                <div className="form-input-wrap">
                  <Mail size={15} className="form-input-icon text-indigo-400" />
                  <input
                    className="form-input"
                    disabled
                    value={user?.email || 'authenticated@bennett.edu.in'}
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Default Dietary Preference</label>
                <select
                  className="form-input"
                  value={dietary}
                  onChange={e => setDietary(e.target.value)}
                >
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Pure Vegetarian">Pure Vegetarian</option>
                  <option value="Vegan">100% Vegan</option>
                  <option value="Jain Food Friendly">Jain Food Friendly</option>
                </select>
              </div>
            </div>

            {/* Notification Preferences */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 4 }}>
              <div className="form-label" style={{ marginBottom: 12 }}>Notification Channels</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifBookings}
                    onChange={e => setNotifBookings(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Instant SMS &amp; in-app alerts when restaurant confirms or updates booking
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifOffers}
                    onChange={e => setNotifOffers(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Bennett campus flash discounts &amp; semester meal promotions
                </label>
              </div>
            </div>

            {savedToast && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 'var(--r-xs)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: '#34D399', fontSize: 13, fontWeight: 600 }}>
                <Check size={16} /> Profile changes updated successfully!
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button type="submit" className="btn btn-primary btn-md">
                <Save size={15} /> Save Changes
              </button>
              <button
                type="button"
                className="btn btn-outline btn-md"
                onClick={() => alert(`Password reset verification link sent to ${user?.email || 'your email'}`)}
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
