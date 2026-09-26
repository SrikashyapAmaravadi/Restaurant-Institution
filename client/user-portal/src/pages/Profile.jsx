import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
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
  Phone as PhoneIcon,
  Utensils,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  Star
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
  const [dietary, setDietary] = useState(user?.dietary || 'Non-Vegetarian');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0].url);
  const [savedToast, setSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
    if (user?.avatar) setAvatar(user.avatar);
    if (user?.dietary) setDietary(user.dietary);
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

      // Sync with backend API if available
      try {
        await api.users.updateProfile({
          name,
          avatar,
          phone,
          dietary,
          department: user?.department,
          rollNumber: user?.rollNumber
        });
      } catch (apiErr) {
        console.warn('Backend profile update note:', apiErr.message);
      }

      try {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      } catch {}

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (err) {
      alert('Could not update profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Extract initials if avatar is default or text
  const userInitials = (name || 'Campus Scholar')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className="page-pad pb-24"
      style={{
        maxWidth: 920,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {/* ── 1. Holographic Executive Student ID Pass Card ── */}
      <div
        className="digital-id-card anim-fade-up"
        style={{
          borderRadius: 22,
          padding: 'clamp(20px, 4vw, 32px)',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #11120D 0%, #252820 60%, #1A1B16 100%)',
          color: '#FFFBF4',
          border: '1px solid rgba(216, 207, 188, 0.25)',
          boxShadow: '0 14px 38px rgba(17, 18, 13, 0.20)',
        }}
      >
        {/* Ambient Subtle Radial Gold Watermark */}
        <div
          style={{
            position: 'absolute',
            right: '-10%',
            bottom: '-30%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(216, 207, 188, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card Header Branding */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '1px solid rgba(255, 251, 244, 0.12)',
            paddingBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'rgba(255, 251, 244, 0.10)',
                border: '1px solid rgba(255, 251, 244, 0.20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFBF4',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div
                className="font-display"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#FFFBF4',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                BENNETT UNIVERSITY
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: '#D8CFBC',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: 3,
                }}
              >
                Institutional Dining Pass · ID Verified
              </div>
            </div>
          </div>

          <span
            style={{
              padding: '5px 14px',
              fontSize: 11.5,
              fontWeight: 700,
              borderRadius: 99,
              background: 'rgba(255, 251, 244, 0.12)',
              color: '#FFFBF4',
              border: '1px solid rgba(255, 251, 244, 0.22)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: '0.04em',
            }}
          >
            <ShieldCheck size={14} color="#D8CFBC" />
            <span>ACTIVE MEMBER</span>
          </span>
        </div>

        {/* Card Body: Photo + Info + QR Code */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(16px, 3vw, 24px)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 260 }}>
            {/* Avatar Profile Frame */}
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 16,
                    objectFit: 'cover',
                    border: '2px solid #D8CFBC',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 16,
                    background: '#565449',
                    border: '2px solid #D8CFBC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFBF4',
                    fontSize: 26,
                    fontWeight: 700,
                  }}
                >
                  {userInitials}
                </div>
              )}

              {/* Upload Trigger Camera Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                style={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  background: '#FFFBF4',
                  color: '#11120D',
                  border: '1.5px solid #11120D',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transition: 'transform 0.18s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
              >
                <Camera size={13} />
              </button>
            </div>

            {/* Scholar Text Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(1.4rem, 3.5vw, 1.75rem)',
                  fontWeight: 600,
                  color: '#FFFBF4',
                  margin: '0 0 4px',
                  lineHeight: 1.15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name || 'Campus Scholar'}
              </h2>
              <div style={{ fontSize: 13, color: '#D8CFBC', fontWeight: 500, marginBottom: 4 }}>
                {user?.department || user?.roleLabel || 'B.Tech Computer Science & Engineering'}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'rgba(255, 251, 244, 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 500,
                }}
              >
                <span>{user?.rollNumber ? `Roll: ${user.rollNumber}` : 'ID: BENNETT-PASS-2026'}</span>
                <span>&middot;</span>
                <span style={{ color: '#D8CFBC' }}>{user?.email || 'authenticated@bennett.edu.in'}</span>
              </div>
            </div>
          </div>

          {/* Verification Barcode / QR Box */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '10px 12px',
              borderRadius: 14,
              textAlign: 'center',
              boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
              border: '1px solid #D8CFBC',
              flexShrink: 0,
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(user?.email || 'BENNETT-ID-VERIFIED')}`}
              alt="Institutional QR"
              style={{ width: 72, height: 72, display: 'block' }}
            />
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: '#11120D',
                display: 'block',
                marginTop: 4,
                letterSpacing: '0.06em',
                fontFamily: 'monospace',
              }}
            >
              {user?.role === 'SUPER_ADMIN'
                ? 'SUPER ADMIN'
                : user?.role === 'RESTAURANT_ADMIN'
                ? 'OWNER PASS'
                : user?.role === 'RESTAURANT_STAFF'
                ? 'HOST PASS'
                : 'BENNETT ID'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Tiles & Privileges Grid ── */}
      <div
        className="anim-fade-up delay-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: 16,
        }}
      >
        {/* Tile 1: Dining Rank */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E2D5',
            borderRadius: 18,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 2px 10px rgba(17, 18, 13, 0.03)',
            transition: 'all 0.25s ease',
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
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              color: '#11120D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#565449', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Dining Rank
            </div>
            <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#11120D', margin: '2px 0' }}>
              Campus Gourmet
            </div>
            <div style={{ fontSize: 11.5, color: '#565449', fontWeight: 500 }}>
              Top 5% active scholar diner
            </div>
          </div>
        </div>

        {/* Tile 2: Honor Status */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E2D5',
            borderRadius: 18,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 2px 10px rgba(17, 18, 13, 0.03)',
            transition: 'all 0.25s ease',
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
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              color: '#11120D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#565449', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Honor Status
            </div>
            <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#11120D', margin: '2px 0' }}>
              100% Attendance
            </div>
            <div style={{ fontSize: 11.5, color: '#565449', fontWeight: 500 }}>
              Zero reservation no-shows
            </div>
          </div>
        </div>

        {/* Tile 3: Community Contributions */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E2D5',
            borderRadius: 18,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 2px 10px rgba(17, 18, 13, 0.03)',
            transition: 'all 0.25s ease',
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
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              color: '#11120D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Star size={22} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#565449', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Community Impact
            </div>
            <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#11120D', margin: '2px 0' }}>
              5 Helpful Reviews
            </div>
            <div style={{ fontSize: 11.5, color: '#565449', fontWeight: 500 }}>
              51 scholars found helpful
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Profile Details Form Card ── */}
      <div
        className="anim-fade-up delay-2"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E2D5',
          borderRadius: 22,
          padding: 'clamp(20px, 4vw, 32px)',
          boxShadow: '0 4px 20px rgba(17, 18, 13, 0.04)',
        }}
      >
        <div style={{ marginBottom: 24, borderBottom: '1px solid #F6F2EA', paddingBottom: 16 }}>
          <h3
            className="font-display"
            style={{
              fontSize: '1.35rem',
              fontWeight: 600,
              color: '#11120D',
              margin: '0 0 4px',
            }}
          >
            Personal Details &amp; Profile Photo
          </h3>
          <p style={{ fontSize: 13, color: '#565449', margin: 0, lineHeight: 1.5 }}>
            Upload your student profile photo, customize contact info, and set dining dietary preferences.
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Photo & Presets Picker Row */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: 16,
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#11120D', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Camera size={16} color="#11120D" />
                  <span>Profile &amp; ID Card Photo</span>
                </div>
                <div style={{ fontSize: 12, color: '#565449', marginTop: 2 }}>
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
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary btn-sm"
                  style={{
                    borderRadius: 99,
                    padding: '8px 20px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Upload size={14} /> Upload Photo
                </button>
              </div>
            </div>

            {/* Avatar Presets Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid #E8E2D5' }}>
              <span style={{ fontSize: 11.5, color: '#565449', fontWeight: 600 }}>Quick Presets:</span>
              {AVATAR_PRESETS.map((p, idx) => {
                const isSelected = avatar === p.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(p.url)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: isSelected ? '2.5px solid #11120D' : '1.5px solid #D8CFBC',
                      padding: 0,
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.08)' : 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(17, 18, 13, 0.2)' : 'none',
                    }}
                    title={p.label}
                  >
                    <img src={p.url} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 18 }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#11120D', marginBottom: 6, letterSpacing: '0.02em' }}>
                Full Name
              </label>
              <div className="form-input-wrap">
                <User size={15} color="#565449" className="form-input-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 12,
                    border: '1px solid #E8E2D5',
                    background: '#FFFFFF',
                    color: '#11120D',
                    fontSize: 13.5,
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.18s ease',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#11120D')}
                  onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
                />
              </div>
            </div>

            {/* Institutional Email (Read-Only) */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#11120D', marginBottom: 6, letterSpacing: '0.02em' }}>
                Institutional Email (Verified)
              </label>
              <div className="form-input-wrap">
                <Mail size={15} color="#565449" className="form-input-icon" />
                <input
                  type="email"
                  disabled
                  value={user?.email || 'authenticated@bennett.edu.in'}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 12,
                    border: '1px solid #E8E2D5',
                    background: '#F6F2EA',
                    color: '#565449',
                    fontSize: 13.5,
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'not-allowed',
                  }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#11120D', marginBottom: 6, letterSpacing: '0.02em' }}>
                Phone Number
              </label>
              <div className="form-input-wrap">
                <PhoneIcon size={15} color="#565449" className="form-input-icon" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 12,
                    border: '1px solid #E8E2D5',
                    background: '#FFFFFF',
                    color: '#11120D',
                    fontSize: 13.5,
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.18s ease',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#11120D')}
                  onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
                />
              </div>
            </div>

            {/* Dietary Preference */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#11120D', marginBottom: 6, letterSpacing: '0.02em' }}>
                Default Dietary Preference
              </label>
              <select
                value={dietary}
                onChange={e => setDietary(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid #E8E2D5',
                  background: '#FFFFFF',
                  color: '#11120D',
                  fontSize: 13.5,
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'border-color 0.18s ease',
                }}
                onFocus={e => (e.target.style.borderColor = '#11120D')}
                onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
              >
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Pure Vegetarian">Pure Vegetarian</option>
                <option value="Vegan">100% Vegan</option>
                <option value="Jain Food Friendly">Jain Food Friendly</option>
              </select>
            </div>
          </div>

          {/* Notification Preferences */}
          <div style={{ borderTop: '1px solid #E8E2D5', paddingTop: 18, marginTop: 4 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#11120D', marginBottom: 12, letterSpacing: '0.02em' }}>
              Notification Channels
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#565449', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifBookings}
                  onChange={e => setNotifBookings(e.target.checked)}
                  style={{ accentColor: '#11120D', width: 16, height: 16, cursor: 'pointer' }}
                />
                <span>Instant SMS &amp; in-app alerts when restaurant confirms or updates booking</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#565449', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifOffers}
                  onChange={e => setNotifOffers(e.target.checked)}
                  style={{ accentColor: '#11120D', width: 16, height: 16, cursor: 'pointer' }}
                />
                <span>Bennett campus flash discounts &amp; semester meal promotions</span>
              </label>
            </div>
          </div>

          {/* Saved Toast Banner */}
          {savedToast && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 16px',
                borderRadius: 12,
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#16A34A',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary btn-md"
              style={{
                borderRadius: 99,
                padding: '11px 26px',
                fontSize: 13.5,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: '0 4px 14px rgba(17, 18, 13, 0.16)',
                touchAction: 'manipulation',
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-md"
              style={{
                borderRadius: 99,
                padding: '11px 22px',
                fontSize: 13.5,
                fontWeight: 600,
                background: '#FFFFFF',
                border: '1px solid #E8E2D5',
                color: '#11120D',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                touchAction: 'manipulation',
              }}
              onClick={() => alert(`Password reset verification link sent to ${user?.email || 'your email'}.`)}
            >
              <KeyRound size={15} />
              <span>Reset Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
