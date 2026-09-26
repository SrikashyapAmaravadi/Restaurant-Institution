import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import GlacierDoodleBackground from '../components/GlacierDoodleBackground';
import {
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ChefHat,
  ConciergeBell,
  ArrowRight,
  Loader2
} from 'lucide-react';

/* ── Dotted Circular Emblem in Our Palette (Smoky Black & Olive) ── */
function DottedCircularLogo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={{
        filter: 'drop-shadow(0 2px 6px rgba(17, 18, 13, 0.12))',
        opacity: 0.95,
        display: 'block',
        margin: '0 auto 12px'
      }}
    >
      <circle cx="16" cy="4.5" r="1.8" fill="#11120D" />
      <circle cx="24.1" cy="7.9" r="1.8" fill="#11120D" />
      <circle cx="27.5" cy="16" r="1.8" fill="#11120D" />
      <circle cx="24.1" cy="24.1" r="1.8" fill="#11120D" />
      <circle cx="16" cy="27.5" r="1.8" fill="#11120D" />
      <circle cx="7.9" cy="24.1" r="1.8" fill="#11120D" />
      <circle cx="4.5" cy="16" r="1.8" fill="#11120D" />
      <circle cx="7.9" cy="7.9" r="1.8" fill="#11120D" />

      <circle cx="16" cy="10.5" r="1.2" fill="#565449" />
      <circle cx="21.5" cy="16" r="1.2" fill="#565449" />
      <circle cx="16" cy="21.5" r="1.2" fill="#565449" />
      <circle cx="10.5" cy="16" r="1.2" fill="#565449" />
    </svg>
  );
}

/* ── Google Multi-Color Icon ── */
function GoogleIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9c-.3-.7-.6-1.5-.6-3.2z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
      />
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [program, setProgram] = useState('B.Tech CSE');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isBennettEmail = email.trim().toLowerCase().endsWith('@bennett.edu.in');

  const roleOptions = [
    { key: 'STUDENT', label: 'Student / Faculty', icon: GraduationCap },
    { key: 'RESTAURANT_ADMIN', label: 'Restaurant Owner', icon: ChefHat },
    { key: 'RESTAURANT_STAFF', label: 'Host Desk Staff', icon: ConciergeBell },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === 'STUDENT' && !isBennettEmail) {
      setErrorMsg('Student & Faculty accounts require an official @bennett.edu.in email.');
      return;
    }

    setSubmitted(true);
    setErrorMsg('');

    try {
      const newUser = await signup({
        name: fullName,
        email,
        role,
        department: program,
        password
      });

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

      if (role === 'STUDENT') {
        navigate('/pending-approval', { state: { email, department: program, homePath: newUser?.homePath } });
      } else {
        navigate('/verify', { state: { email, homePath: newUser?.homePath } });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      setSubmitted(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSubmitted(true);
    setErrorMsg('');
    try {
      const loggedUser = await login('student@bennett.edu.in', 'student123');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
      navigate(loggedUser?.homePath || '/dashboard', { replace: true });
    } catch {
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#FFFBF4', /* Floral White */
        padding: 'clamp(16px, 4vw, 32px) clamp(14px, 4vw, 20px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif",
      }}
    >
      {/* ── Ambient Background with Dining Doodles in Our Palette ── */}
      <GlacierDoodleBackground theme="light" />

      {/* ── Floating Glass Card in Our 4-Colour Palette ── */}
      <div className="auth-card anim-scale-in">
        {/* Dotted Circular Logo in Smoky Black & Olive */}
        <DottedCircularLogo size={28} />

        {/* Brand Tag Pill */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#565449',
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              padding: '3px 10px',
              borderRadius: 99,
              display: 'inline-block',
            }}
          >
            nivix-dine-in · Bennett
          </span>
        </div>

        {/* Heading in Newsreader (Editorial Serif) */}
        <h1
          className="auth-card-title"
          style={{
            fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
            fontSize: 24,
            fontWeight: 600,
            color: '#11120D',
            margin: '6px 0 4px',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          Sign Up
        </h1>
        <p
          className="auth-card-subtitle"
          style={{
            fontSize: 12.5,
            fontWeight: 400,
            color: '#565449',
            margin: '0 0 18px',
            textAlign: 'center',
          }}
        >
          Create your institutional dining account.
        </p>

        {/* Error Banner */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 12,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: 11.5,
              marginBottom: 14,
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Role Pill Selector (Our Palette) */}
          <div>
            <div
              className="auth-card-mode-toggle"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 4,
                background: '#F6F2EA',
                padding: 3,
                borderRadius: 99,
                border: '1px solid #E8E2D5',
              }}
            >
              {roleOptions.map(r => {
                const Icon = r.icon;
                const isSelected = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className="auth-card-mode-btn"
                    style={{
                      padding: '6px 3px',
                      minHeight: 32,
                      borderRadius: 99,
                      border: isSelected ? '1px solid #11120D' : '1px solid transparent',
                      background: isSelected ? '#11120D' : 'transparent',
                      color: isSelected ? '#FFFBF4' : '#565449',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      touchAction: 'manipulation',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    <Icon size={12} style={{ color: isSelected ? '#FFFBF4' : '#565449' }} />
                    <span>{r.key === 'STUDENT' ? 'Student' : r.key === 'RESTAURANT_ADMIN' ? 'Owner' : 'Staff'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <input
              type="text"
              required
              placeholder="Full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={submitted}
              className="auth-card-input"
              style={{
                width: '100%',
                padding: '9px 14px',
                minHeight: 38,
                borderRadius: 99,
                background: '#FFFFFF',
                border: '1px solid #E8E2D5',
                color: '#11120D',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                touchAction: 'manipulation',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => (e.target.style.borderColor = '#11120D')}
              onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              required
              placeholder={role === 'STUDENT' ? 'name@bennett.edu.in' : 'name@restaurant.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitted}
              className="auth-card-input"
              style={{
                width: '100%',
                padding: '9px 14px',
                minHeight: 38,
                borderRadius: 99,
                background: '#FFFFFF',
                border: role === 'STUDENT' && email && !isBennettEmail ? '1.5px solid #DC2626' : '1px solid #E8E2D5',
                color: '#11120D',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                touchAction: 'manipulation',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => (e.target.style.borderColor = '#11120D')}
              onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
            />
            {role === 'STUDENT' && email && (
              <div style={{ marginTop: 3, paddingLeft: 6, fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 4, color: isBennettEmail ? '#16A34A' : '#DC2626' }}>
                {isBennettEmail ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                <span>{isBennettEmail ? 'Verified institutional email' : 'Requires @bennett.edu.in domain'}</span>
              </div>
            )}
          </div>

          {/* Department / Program / Outlet */}
          <div>
            <input
              type="text"
              placeholder={role === 'STUDENT' ? 'Program (e.g. B.Tech CSE)' : 'Restaurant outlet name'}
              value={program}
              onChange={e => setProgram(e.target.value)}
              disabled={submitted}
              className="auth-card-input"
              style={{
                width: '100%',
                padding: '9px 14px',
                minHeight: 38,
                borderRadius: 99,
                background: '#FFFFFF',
                border: '1px solid #E8E2D5',
                color: '#11120D',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                touchAction: 'manipulation',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => (e.target.style.borderColor = '#11120D')}
              onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              required
              placeholder="Create password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={submitted}
              className="auth-card-input"
              style={{
                width: '100%',
                padding: '9px 14px',
                minHeight: 38,
                borderRadius: 99,
                background: '#FFFFFF',
                border: '1px solid #E8E2D5',
                color: '#11120D',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                touchAction: 'manipulation',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => (e.target.style.borderColor = '#11120D')}
              onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
            />
          </div>

          {/* Primary Button — Pill shape in Smoky Black with Floral White text */}
          <button
            type="submit"
            disabled={submitted || (role === 'STUDENT' && email && !isBennettEmail)}
            className="auth-card-btn"
            style={{
              marginTop: 4,
              width: '100%',
              padding: '10px 16px',
              minHeight: 38,
              borderRadius: 99,
              background: '#11120D',
              color: '#FFFBF4',
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid #11120D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(17, 18, 13, 0.18)',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#25261F')}
            onMouseLeave={e => (e.currentTarget.style.background = '#11120D')}
          >
            {submitted ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Provisioning Account...
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* ── Divider: ── OR ── ── */}
        <div
          className="auth-card-divider"
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '14px 0 10px',
          }}
        >
          <div style={{ flex: 1, height: 1, background: '#E8E2D5' }} />
          <span
            style={{
              padding: '0 8px',
              fontSize: 10,
              fontWeight: 600,
              color: '#565449',
              letterSpacing: '0.04em',
            }}
          >
            OR
          </span>
          <div style={{ flex: 1, height: 1, background: '#E8E2D5' }} />
        </div>

        {/* ── Continue with Google (Pill shape in white with warm hairline) ── */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={submitted}
          className="auth-card-btn"
          style={{
            width: '100%',
            padding: '9px 14px',
            minHeight: 38,
            borderRadius: 99,
            background: '#FFFFFF',
            color: '#11120D',
            fontSize: 12,
            fontWeight: 500,
            border: '1px solid #E8E2D5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            touchAction: 'manipulation',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#F6F2EA';
            e.currentTarget.style.borderColor = '#11120D';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E8E2D5';
          }}
        >
          <GoogleIcon size={14} />
          <span>Continue with Google</span>
        </button>

        {/* ── Footer Link: Sign In ── */}
        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 11.5, color: '#565449' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#11120D',
              fontWeight: 600,
              textDecoration: 'none',
              marginLeft: 2,
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
