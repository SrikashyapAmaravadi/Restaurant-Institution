import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import GlacierDoodleBackground from '../components/GlacierDoodleBackground';
import CodeSlots from '../components/CodeSlots';
import RubberSegment from '../components/RubberSegment';
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Zap,
  ArrowRight,
  GraduationCap,
  Shield
} from 'lucide-react';



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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOtp, verifyOtp } = useAuth();

  const [authMode, setAuthMode] = useState('OTP'); // 'OTP' | 'PASSWORD'
  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'CODE'

  // OTP Flow State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [codeStatus, setCodeStatus] = useState('idle'); // 'idle' | 'error' | 'success'
  const [serverOtp, setServerOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // Password Flow State
  const [pwdEmail, setPwdEmail] = useState('');
  const [pwdPass, setPwdPass] = useState('');

  // Common State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const from = location.state?.from?.pathname;

  // Resend countdown timer
  useEffect(() => {
    if (step === 'CODE' && resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, resendTimer]);

  // 1. Handle Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!otpEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await sendOtp(otpEmail.trim());
      if (res && res.otp) {
        setServerOtp(res.otp);
      }
      setStep('CODE');
      setOtpCode('');
      setCodeStatus('idle');
      setResendTimer(30);
      setSuccessMsg(res?.message || `6-digit passkey sent to ${otpEmail.trim()}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please check your institutional email.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Auto-fill detected OTP
  const handleAutoFillOtp = () => {
    if (serverOtp) {
      setOtpCode(serverOtp);
      setCodeStatus('idle');
      setErrorMsg('');
      handleVerifyOtp(serverOtp);
    }
  };

  // 3. Handle Verify OTP
  const handleVerifyOtp = async (codeOrEvent) => {
    if (codeOrEvent && typeof codeOrEvent.preventDefault === 'function') {
      codeOrEvent.preventDefault();
    }
    const code = (typeof codeOrEvent === 'string' ? codeOrEvent : otpCode).trim();
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the passkey.');
      setCodeStatus('error');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const loggedUser = await verifyOtp(otpEmail.trim(), code);
      setCodeStatus('success');
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      } catch {
        // Confetti fallback
      }

      setTimeout(() => {
        const destination = from || loggedUser.homePath || '/dashboard';
        navigate(destination, { replace: true });
      }, 700);
    } catch (err) {
      setCodeStatus('error');
      setErrorMsg(err.message || 'Passkey verification failed. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Handle Traditional Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!pwdEmail || !pwdPass) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const loggedUser = await login(pwdEmail, pwdPass);
      const destination = from || loggedUser.homePath || (
        loggedUser.role === 'SUPER_ADMIN' ? '/management/superadmin' :
        loggedUser.role === 'RESTAURANT_ADMIN' ? '/management/admin' :
        loggedUser.role === 'RESTAURANT_STAFF' ? '/management/staff' :
        '/dashboard'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Handle Google Login Shortcut (Simulated Bennett SSO)
  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const loggedUser = await login('student@bennett.edu.in', 'student123');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
      const destination = from || loggedUser.homePath || '/dashboard';
      navigate(destination, { replace: true });
    } catch {
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
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
        backgroundColor: '#FFFBF4', /* Floral White Canvas */
        padding: 'clamp(16px, 4vw, 32px) clamp(14px, 4vw, 20px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif",
      }}
    >
      {/* ── Ambient Background with Dining Doodles in Our Palette ── */}
      <GlacierDoodleBackground theme="light" />

      {/* ── Floating Card ── */}
      <div className="auth-card anim-scale-in">
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
          Sign In
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
          Please enter your details to sign in.
        </p>

        {/* Rubber Segment Auth Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18, width: '100%' }}>
          <RubberSegment
            items={[
              { value: 'OTP', label: 'Campus OTP', icon: <GraduationCap size={14} /> },
              { value: 'PASSWORD', label: 'Staff / Admin', icon: <Shield size={13} /> }
            ]}
            value={authMode}
            onChange={(val) => {
              setAuthMode(val);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            trackColor="#F6F2EA"
            thumbColor="#11120D"
            textColor="#565449"
            activeTextColor="#FFFBF4"
            size="md"
            radius={99}
            inset={3}
            equalSlots
            className="w-full"
            aria-label="Authentication Mode"
          />
        </div>

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

        {/* Success Banner */}
        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 12,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#16A34A',
              fontSize: 11.5,
              marginBottom: 14,
            }}
          >
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── MODE 1: CAMPUS OTP LOGIN ── */}
        {authMode === 'OTP' ? (
          step === 'EMAIL' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={otpEmail}
                  onChange={e => setOtpEmail(e.target.value)}
                  disabled={submitting}
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

              {/* Primary Pill Button in Smoky Black */}
              <button
                type="submit"
                disabled={submitting}
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
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Sending Code...
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OTP Verification Step */
            <div>
              {serverOtp && (
                <div
                  style={{
                    background: '#F6F2EA',
                    border: '1px solid #E8E2D5',
                    borderRadius: 99,
                    padding: '8px 16px',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#565449' }}>
                    Passkey: <strong style={{ color: '#11120D', letterSpacing: '0.1em' }}>{serverOtp}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#11120D',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Zap size={11} /> Auto Fill
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <CodeSlots
                    length={6}
                    value={otpCode}
                    status={codeStatus}
                    autoFocus
                    onChange={code => {
                      setOtpCode(code);
                      if (codeStatus !== 'idle') setCodeStatus('idle');
                      if (errorMsg) setErrorMsg('');
                    }}
                    onComplete={code => {
                      setOtpCode(code);
                      handleVerifyOtp(code);
                    }}
                    disabled={submitting || codeStatus === 'success'}
                    accentColor="#11120D"
                    inkColor="#11120D"
                    slotColor="#F6F2EA"
                    digitColor="#FFFBF4"
                    dangerColor="#DC2626"
                    slotSize={44}
                    gap={8}
                    radius={12}
                    bounce={0.2}
                    settle={0.3}
                    rise={8}
                    cascade={20}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otpCode.length !== 6 || codeStatus === 'success'}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    minHeight: 46,
                    borderRadius: 99,
                    background: '#11120D',
                    color: '#FFFBF4',
                    fontSize: 14,
                    fontWeight: 600,
                    border: '1px solid #11120D',
                    cursor: submitting || codeStatus === 'success' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(17, 18, 13, 0.18)',
                    touchAction: 'manipulation',
                    transition: 'all 0.15s ease',
                    opacity: (submitting || codeStatus === 'success') ? 0.85 : 1
                  }}
                >
                  {codeStatus === 'success' ? (
                    <>
                      <CheckCircle2 size={16} /> Code Verified!
                    </>
                  ) : submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    <span>Verify &amp; Sign in</span>
                  )}
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 11 }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('EMAIL');
                    setOtpCode('');
                    setCodeStatus('idle');
                    setErrorMsg('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#565449', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Change email
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || submitting}
                  onClick={handleSendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendTimer > 0 ? '#9E9A8B' : '#11120D',
                    cursor: resendTimer > 0 ? 'default' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RotateCcw size={11} />
                  {resendTimer > 0 ? `${resendTimer}s` : 'Resend'}
                </button>
              </div>
            </div>
          )
        ) : (
          /* ── MODE 2: PASSWORD LOGIN ── */
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={pwdEmail}
                onChange={e => setPwdEmail(e.target.value)}
                disabled={submitting}
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

            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={pwdPass}
                onChange={e => setPwdPass(e.target.value)}
                disabled={submitting}
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
              <div style={{ textAlign: 'right', marginTop: 4, paddingRight: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    color: '#565449',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                  }}
                  onClick={() => alert(`Password recovery link sent to registered email.`)}
                  onMouseEnter={e => (e.currentTarget.style.color = '#11120D')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#565449')}
                >
                  Forgot Password?
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
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
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>
        )}

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

        {/* ── Continue with Google (Pill in White with Warm Hairline) ── */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
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
          <GoogleIcon size={13} />
          <span>Continue with Google</span>
        </button>

        {/* ── Footer Link: Sign Up ── */}
        <div className="auth-card-footer" style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: '#565449' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#11120D',
              fontWeight: 600,
              textDecoration: 'none',
              marginLeft: 2,
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
