import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import GlacierDoodleBackground from '../components/GlacierDoodleBackground';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { verifications, verifyUserWithCode } = useDining();

  const email = location.state?.email || user?.email || '';

  // Find if Super Admin has generated/sent a code for this email or user
  const matchingApplicant = verifications.find(
    v => v.email?.toLowerCase() === email.toLowerCase() || (user && v.name === user.name)
  );
  const issuedCode = matchingApplicant?.verificationCode || null;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Autofill if issued code exists initially
  useEffect(() => {
    if (issuedCode && issuedCode.length === 6) {
      setOtp(issuedCode.split(''));
    }
  }, [issuedCode]);

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setErrorMsg('');

    // Auto-advance
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleApplyIssuedCode = () => {
    if (issuedCode) {
      setOtp(issuedCode.split(''));
      setErrorMsg('');
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const enteredCode = otp.join('');

    if (enteredCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the institutional passkey.');
      return;
    }

    setVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      const result = verifyUserWithCode(enteredCode, email);

      if (result.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (err) {
          console.error('Confetti error:', err);
        }
        setIsVerified(true);
      } else {
        setVerifying(false);
        setErrorMsg(result.message || 'Verification failed. Please check the code sent by Super Admin.');
      }
    }, 800);
  };

  if (isVerified) {
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <GlacierDoodleBackground theme="light" />

        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: '#16A34A',
            }}
          >
            <CheckCircle2 size={24} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 10px',
              borderRadius: 99,
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              color: '#565449',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            <Sparkles size={10} color="#565449" />
            <span>Bennett University</span>
          </div>

          <h2
            className="auth-card-title"
            style={{
              fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
              fontSize: 21,
              fontWeight: 600,
              color: '#11120D',
              margin: '4px 0 6px',
            }}
          >
            Verification Complete
          </h2>

          <p
            className="auth-card-subtitle"
            style={{
              fontSize: 11.5,
              color: '#565449',
              lineHeight: 1.45,
              marginBottom: 16,
            }}
          >
            Your Bennett University identity is verified. You now have full access to campus dining privileges.
          </p>

          <div
            style={{
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              borderRadius: 12,
              padding: '10px 12px',
              marginBottom: 16,
              fontSize: 11,
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#565449' }}>
              <span>Account:</span>
              <strong style={{ color: '#11120D' }}>{email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#565449' }}>
              <span>Access Tier:</span>
              <strong style={{ color: '#11120D' }}>Tier-1 Member</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#565449' }}>
              <span>Status:</span>
              <strong style={{ color: '#16A34A' }}>Active &amp; Verified</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="btn btn-primary auth-card-btn"
            style={{
              width: '100%',
              borderRadius: 99,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              touchAction: 'manipulation',
            }}
          >
            <span>Explore Restaurants</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Hand-drawn Doodles Canvas */}
      <GlacierDoodleBackground theme="light" />

      {/* Ultra-compact Auth Card */}
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {/* Emblem */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#F6F2EA',
            border: '1.5px solid #D8CFBC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            color: '#11120D',
          }}
        >
          <ShieldCheck size={20} />
        </div>

        {/* Badge Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 99,
            background: '#F6F2EA',
            border: '1px solid #E8E2D5',
            color: '#565449',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          <Sparkles size={10} color="#565449" />
          <span>Institutional Verification</span>
        </div>

        <h2
          className="auth-card-title"
          style={{
            fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
            fontSize: 21,
            fontWeight: 600,
            color: '#11120D',
            margin: '4px 0 4px',
          }}
        >
          Security Passkey
        </h2>

        <p
          className="auth-card-subtitle"
          style={{
            fontSize: 11,
            color: '#565449',
            lineHeight: 1.45,
            marginBottom: 14,
          }}
        >
          Enter the 6-digit code issued for <strong style={{ color: '#11120D' }}>{email || 'your account'}</strong>.
        </p>

        {/* Issued Code Auto-Fill Banner */}
        {issuedCode && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 12,
              padding: '8px 10px',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              fontSize: 11,
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ color: '#15803D', fontWeight: 700, fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                <KeyRound size={12} /> Issued Passkey
              </div>
              <div style={{ color: '#11120D', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.06em', fontSize: 13 }}>
                {issuedCode}
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyIssuedCode}
              style={{
                background: '#15803D',
                color: '#FFFBF4',
                border: 'none',
                borderRadius: 99,
                padding: '4px 10px',
                fontSize: 10.5,
                fontWeight: 600,
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              Fill
            </button>
          </div>
        )}

        {/* 6-Digit OTP Box Grid */}
        <form onSubmit={handleVerify}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 14,
            }}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Backspace' && !digit && idx > 0) {
                    const prevInput = document.getElementById(`otp-${idx - 1}`);
                    if (prevInput) prevInput.focus();
                  }
                }}
                style={{
                  width: 35,
                  height: 40,
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#11120D',
                  background: '#FFFFFF',
                  border: `1.5px solid ${digit ? '#11120D' : '#E8E2D5'}`,
                  borderRadius: 10,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  padding: 0,
                }}
                onFocus={e => (e.target.style.borderColor = '#11120D')}
                onBlur={e => (e.target.style.borderColor = digit ? '#11120D' : '#E8E2D5')}
              />
            ))}
          </div>

          {errorMsg && (
            <div
              style={{
                color: '#B91C1C',
                fontSize: 11,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: '6px 8px',
                marginBottom: 12,
              }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={verifying}
            className="btn btn-primary auth-card-btn"
            style={{
              width: '100%',
              borderRadius: 99,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              touchAction: 'manipulation',
            }}
          >
            {verifying ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Passkey</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 11, color: '#565449' }}>
          <span>Didn't receive a passkey? </span>
          <Link
            to="/pending-approval"
            state={{ email }}
            style={{ color: '#11120D', fontWeight: 600, textDecoration: 'none' }}
          >
            Check Status
          </Link>
        </div>
      </div>
    </div>
  );
}
