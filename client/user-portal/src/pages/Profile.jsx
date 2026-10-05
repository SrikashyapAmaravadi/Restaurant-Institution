import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Camera,
  User,
  Mail,
  Phone as PhoneIcon,
  Utensils,
  Save,
  CheckCircle2
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const DIETARY_OPTIONS = [
  { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
  { value: 'Pure Vegetarian', label: 'Pure Vegetarian' },
  { value: 'Vegan', label: '100% Vegan' },
  { value: 'Jain Food Friendly', label: 'Jain Food Friendly' }
];

export default function Profile() {
  const { user, setUser } = useAuth() || {};
  const [name, setName] = useState(user?.name || 'Campus Scholar');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dietary, setDietary] = useState(user?.dietary || 'Non-Vegetarian');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savedToast, setSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
    if (user?.avatar) setAvatar(user.avatar);
    if (user?.dietary) setDietary(user.dietary);
  }, [user]);

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
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
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
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* ── 1. Clean Profile Identity Card ── */}
      <div
        className="digital-id-card anim-fade-up"
        style={{
          borderRadius: 20,
          padding: 'clamp(20px, 3.5vw, 28px)',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #11120D 0%, #252820 60%, #1A1B16 100%)',
          color: '#FFFBF4',
          border: '1px solid rgba(216, 207, 188, 0.25)',
          boxShadow: '0 10px 30px rgba(17, 18, 13, 0.15)',
        }}
      >
        {/* Subtle Warm Watermark Accent */}
        <div
          style={{
            position: 'absolute',
            right: '-6%',
            bottom: '-30%',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(216, 207, 188, 0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            borderBottom: '1px solid rgba(255, 251, 244, 0.12)',
            paddingBottom: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255, 251, 244, 0.10)',
              border: '1px solid rgba(255, 251, 244, 0.20)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFBF4',
            }}
          >
            <GraduationCap size={20} />
          </div>
          <div>
            <div
              className="font-display"
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: '#FFFBF4',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              {user?.institution?.toUpperCase() || 'INSTITUTION CAMPUS'}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: '#D8CFBC',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              Campus Dining Profile
            </div>
          </div>
        </div>

        {/* Card Body: Photo + Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          {/* Avatar Profile Frame */}
          <div style={{ position: 'relative', width: 74, height: 74, flexShrink: 0 }}>
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
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
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
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {userInitials}
              </div>
            )}

            {/* Photo Upload Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change Photo"
              style={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                background: '#FFFBF4',
                color: '#11120D',
                border: '1.5px solid #11120D',
                borderRadius: '50%',
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                transition: 'transform 0.18s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <Camera size={13} />
            </button>
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.55rem)',
                fontWeight: 600,
                color: '#FFFBF4',
                margin: '0 0 3px',
                lineHeight: 1.2,
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
            <div style={{ fontSize: 12, color: 'rgba(255, 251, 244, 0.75)', fontWeight: 500 }}>
              {user?.email || 'scholar@university.edu'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Clean Profile Details Form Card ── */}
      <div
        className="anim-fade-up delay-1"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E2D5',
          borderRadius: 20,
          padding: 'clamp(20px, 4vw, 32px)',
          boxShadow: '0 2px 14px rgba(17, 18, 13, 0.04)',
        }}
      >
        <div style={{ marginBottom: 24, borderBottom: '1px solid #F6F2EA', paddingBottom: 16 }}>
          <h3
            className="font-display"
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#11120D',
              margin: '0 0 4px',
            }}
          >
            Personal Details
          </h3>
          <p style={{ fontSize: 13, color: '#565449', margin: 0, lineHeight: 1.5 }}>
            Manage your personal profile details and dining preferences.
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

            {/* Institutional Email (Verified, Read-Only) */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#11120D', marginBottom: 6, letterSpacing: '0.02em' }}>
                Institutional Email (Verified)
              </label>
              <div className="form-input-wrap">
                <Mail size={15} color="#565449" className="form-input-icon" />
                <input
                  type="email"
                  disabled
                  value={user?.email || 'scholar@university.edu'}
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

            {/* Default Dietary Preference */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#11120D', marginBottom: 6, letterSpacing: '0.02em' }}>
                Default Dietary Preference
              </label>
              <CustomSelect
                icon={Utensils}
                options={DIETARY_OPTIONS}
                value={dietary}
                onChange={setDietary}
                fullWidth
                align="left"
                ariaLabel="Default Dietary Preference"
              />
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

          {/* Action Button */}
          <div style={{ display: 'flex', marginTop: 4 }}>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary btn-md"
              style={{
                borderRadius: 99,
                padding: '11px 28px',
                fontSize: 13.5,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: '0 4px 14px rgba(17, 18, 13, 0.16)',
                cursor: 'pointer',
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
