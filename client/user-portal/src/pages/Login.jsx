import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ArrowRight,
  GraduationCap,
  Shield
} from 'lucide-react';



function getAuthorizedDestination(user) {
  if (!user) return '/discover';
  const role = user.role;
  if (role === 'SUPER_ADMIN') {
    return '/management/superadmin';
  }
  if (role === 'RESTAURANT_ADMIN' || role === 'RESTAURANT_STAFF') {
    return '/management/admin';
  }
  if (user.verified === false && user.homePath) {
    return user.homePath;
  }
  return '/discover';
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
  const [resendTimer, setResendTimer] = useState(30);
  // Dev-only: server echoes OTP in JSON when OTP_ECHO=true and SMTP is unset
  const [devOtp, setDevOtp] = useState('');

  // Password Flow State
  const [pwdEmail, setPwdEmail] = useState('');
  const [pwdPass, setPwdPass] = useState('');

  // Common State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const from = location.state?.from?.pathname;

  // Helper to normalize student emails or roll numbers
  const normalizeEmail = (val) => {
    const trimmed = (val || '').trim().toLowerCase();
    if (!trimmed) return '';
    return trimmed.includes('@') ? trimmed : `${trimmed}@campus.edu`;
  };

  // Resend countdown timer
  useEffect(() => {
    if (step === 'CODE' && resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, resendTimer]);

  // Responsive slot sizing so OTP slots match the exact width of the card
  const [slotMetrics, setSlotMetrics] = useState(() => {
    if (typeof window === 'undefined') return { slotSize: 54, gap: 10, radius: 14 };
    const w = window.innerWidth;
    if (w < 380) return { slotSize: 44, gap: 7, radius: 10 };
    if (w < 440) return { slotSize: 48, gap: 8, radius: 12 };
    return { slotSize: 54, gap: 10, radius: 14 };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 380) {
        setSlotMetrics({ slotSize: 44, gap: 7, radius: 10 });
      } else if (w < 440) {
        setSlotMetrics({ slotSize: 48, gap: 8, radius: 12 });
      } else {
        setSlotMetrics({ slotSize: 54, gap: 10, radius: 14 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Handle Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = normalizeEmail(otpEmail);
    if (!cleanEmail) {
      setErrorMsg('Please enter your campus email or roll number.');
      return;
    }

    setOtpEmail(cleanEmail);
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await sendOtp(cleanEmail);
      setStep('CODE');
      setOtpCode('');
      setCodeStatus('idle');
      setResendTimer(30);
      setSuccessMsg(res?.message || `6-digit passkey sent to ${cleanEmail}`);
      // Dev-only auto-fill: server echoes OTP when OTP_ECHO=true and SMTP is unset
      if (res?.devOtp) {
        setDevOtp(String(res.devOtp));
        setOtpCode(String(res.devOtp));
      } else {
        setDevOtp('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please check your institutional email.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Handle Verify OTP
  const handleVerifyOtp = async (codeOrEvent) => {
    if (codeOrEvent && typeof codeOrEvent.preventDefault === 'function') {
      codeOrEvent.preventDefault();
    }
    if (submitting) return;
    const code = (typeof codeOrEvent === 'string' ? codeOrEvent : otpCode).trim();
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the passkey.');
      setCodeStatus('error');
      return;
    }

    const cleanEmail = normalizeEmail(otpEmail);
    setSubmitting(true);
    setErrorMsg('');

    try {
      const loggedUser = await verifyOtp(cleanEmail, code);
      setCodeStatus('success');
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      } catch {
        // Confetti fallback
      }

      setTimeout(() => {
        const destination = from || getAuthorizedDestination(loggedUser);
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
    const cleanEmail = normalizeEmail(pwdEmail);
    if (!cleanEmail || !pwdPass) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const loggedUser = await login(cleanEmail, pwdPass);
      try {
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
      } catch {}
      const destination = from || getAuthorizedDestination(loggedUser);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please verify credentials.');
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
            fontSize: 28,
            fontWeight: 600,
            color: '#11120D',
            margin: '8px 0 6px',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          Sign In
        </h1>
        <p
          className="auth-card-subtitle"
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: '#565449',
            margin: '0 0 22px',
            textAlign: 'center',
          }}
        >
          Please enter your details to sign in.
        </p>

        {/* Rubber Segment Auth Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22, width: '100%' }}>
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
              gap: 9,
              padding: '10px 14px',
              borderRadius: 14,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: 12.5,
              marginBottom: 14,
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '10px 14px',
              borderRadius: 14,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#16A34A',
              fontSize: 12.5,
              marginBottom: 14,
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── MODE 1: CAMPUS OTP LOGIN ── */}
        {authMode === 'OTP' ? (
          step === 'EMAIL' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="Campus email or Roll No (e.g. scholar@university.edu)"
                  value={otpEmail}
                  onChange={e => setOtpEmail(e.target.value)}
                  disabled={submitting}
                  className="auth-card-input"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    minHeight: 46,
                    borderRadius: 99,
                    background: '#FFFFFF',
                    border: '1px solid #E8E2D5',
                    color: '#11120D',
                    fontSize: '15px',
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
                  marginTop: 6,
                  width: '100%',
                  padding: '12px 20px',
                  minHeight: 46,
                  borderRadius: 99,
                  background: '#11120D',
                  color: '#FFFBF4',
                  fontSize: 14,
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
                    <span>Sign in with Passkey</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OTP Verification Step */
            <div>
              <form onSubmit={handleVerifyOtp}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22, width: '100%' }}>
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
                    slotSize={slotMetrics.slotSize}
                    gap={slotMetrics.gap}
                    radius={slotMetrics.radius}
                    bounce={0.2}
                    settle={0.3}
                    rise={8}
                    cascade={20}
                  />
                </div>

                {/* Dev-only OTP helper — never visible in production (server omits devOtp when NODE_ENV=production) */}
                {devOtp && (
                  <div style={{
                    margin: '0 0 12px',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: '#FFFBEA',
                    border: '1.5px dashed #D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    fontSize: 12,
                  }}>
                    <span style={{ color: '#92400E', fontWeight: 500 }}>
                      Dev — OTP: <strong style={{ fontFamily: 'monospace', letterSpacing: 3, fontSize: 14 }}>{devOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode(devOtp);
                        setCodeStatus('idle');
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: '#D97706',
                        color: '#fff',
                        border: 'none',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      Use code
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || otpCode.length !== 6 || codeStatus === 'success'}
                  className="auth-card-btn"
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    minHeight: 46,
                    borderRadius: 99,
                    background: '#11120D',
                    color: '#FFFBF4',
                    fontSize: 14.5,
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12 }}>
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
                type="text"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="Enter your email or roll number"
                value={pwdEmail}
                onChange={e => setPwdEmail(e.target.value)}
                disabled={submitting}
                className="auth-card-input"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  minHeight: 46,
                  borderRadius: 99,
                  background: '#FFFFFF',
                  border: '1px solid #E8E2D5',
                  color: '#11120D',
                  fontSize: '15px',
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
                  padding: '12px 18px',
                  minHeight: 46,
                  borderRadius: 99,
                  background: '#FFFFFF',
                  border: '1px solid #E8E2D5',
                  color: '#11120D',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  touchAction: 'manipulation',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={e => (e.target.style.borderColor = '#11120D')}
                onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
              />
              <div style={{ textAlign: 'right', marginTop: 6, paddingRight: 6 }}>
                <span
                  style={{
                    fontSize: 12,
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
                marginTop: 6,
                width: '100%',
                padding: '12px 20px',
                minHeight: 46,
                borderRadius: 99,
                background: '#11120D',
                color: '#FFFBF4',
                fontSize: 14,
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
      </div>
    </div>
  );
}
