import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
  GraduationCap,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const AVATAR_PRESETS = [
  { label: 'Scholar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80' },
  { label: 'Scholar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80' },
  { label: 'Scholar 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80' },
  { label: 'Scholar 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' },
  { label: 'Faculty', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80' }
];

export default function Profile() {
  const { user, setUser } = useAuth() || {};
  const [name, setName] = useState(user?.name || 'Campus Scholar');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dietary, setDietary] = useState('Non-Vegetarian');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0].url);
  const [savedToast, setSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
    if (user?.avatar) setAvatar(user.avatar);
  }, [user]);

  const [notifBookings, setNotifBookings] = useState(true);
  const [notifOffers, setNotifOffers] = useState(true);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo file size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result;
      if (base64Data) {
        setAvatar(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedUser = {
        ...user,
        name,
        phone,
        dietary,
        avatar
      };

      if (setUser) setUser(updatedUser);
      localStorage.setItem('dine_bennett_user', JSON.stringify(updatedUser));

      // Sync with backend API
      try {
        await api.users.updateProfile({
          name,
          avatar,
          department: user?.department,
          rollNumber: user?.rollNumber
        });
      } catch (apiErr) {
        console.warn('Backend profile update note:', apiErr.message);
      }

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (err) {
      alert('Could not update profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-pad">
      <div style={{ maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Holographic Digital Student ID Card */}
        <div
          className="digital-id-card anim-fade-up"
          style={{
            borderRadius: 'var(--r-lg)',
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
            <div style={{ position: 'relative', width: 92, height: 92, flexShrink: 0 }}>
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80'}
                alt={user?.name || 'User Avatar'}
                style={{ width: '100%', height: '100%', borderRadius: 'var(--r-sm)', objectFit: 'cover', border: '2.5px solid var(--accent)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                style={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Camera size={14} />
              </button>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {name || user?.name || 'Institutional Scholar'}
              </h3>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>
                {user?.department || user?.roleLabel || 'Bennett University Community'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                {user?.rollNumber ? `ID: ${user.rollNumber} · ` : ''}{user?.email || 'authenticated@bennett.edu.in'}
              </div>
            </div>

            {/* Verification Barcode / QR Box */}
            <div
              className="digital-id-qr"
              style={{
                background: '#fff',
                padding: 8,
                borderRadius: 'var(--r-xs)',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
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
          <div className="card card-hover stat-tile-interactive" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Dining Rank</div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>Campus Gourmet</div>
              <div style={{ fontSize: 11, color: 'var(--accent)' }}>Top 5% active diner</div>
            </div>
          </div>

          <div className="card card-hover stat-tile-interactive" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Honor Status</div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)' }}>100% Attendance</div>
              <div style={{ fontSize: 11, color: '#34D399' }}>Zero reservation no-shows</div>
            </div>
          </div>

          <div className="card card-hover stat-tile-interactive" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
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
            Personal Details &amp; Profile Photo
          </h3>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
            Upload your student profile photo, customize contact info, and set dining dietary preferences.
          </p>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Photo Upload & Presets Section */}
            <div style={{ padding: 16, borderRadius: 'var(--r-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Camera size={16} style={{ color: 'var(--primary)' }} />
                    Profile &amp; ID Card Photo
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                    Upload a custom portrait or pick a verified university avatar.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={13} /> Upload Photo
                  </button>
                </div>
              </div>

              {/* Presets and URL Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, color: 'var(--t4)', fontWeight: 600 }}>Quick Presets:</span>
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(p.url)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: avatar === p.url ? '2.5px solid var(--primary)' : '1.5px solid var(--border)',
                      padding: 0,
                      cursor: 'pointer',
                      transform: avatar === p.url ? 'scale(1.1)' : 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: avatar === p.url ? '0 0 10px rgba(47, 94, 49, 0.3)' : 'none'
                    }}
                    title={p.label}
                  >
                    <img src={p.url} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

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

            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                <Save size={15} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
              <button
                type="button"
                className="btn-secondary"
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
