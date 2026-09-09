import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronDown,
  GraduationCap,
  ChefHat,
  ConciergeBell,
  Shield,
  UtensilsCrossed,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  KeyRound,
  Zap,
  Building2,
  Leaf
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOtp, verifyOtp } = useAuth();

  const [authMode, setAuthMode] = useState('OTP'); // 'OTP' | 'PASSWORD'
  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'CODE'
  
  // OTP Flow State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [serverOtp, setServerOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // Password Flow State
  const [pwdEmail, setPwdEmail] = useState('');
  const [pwdPass, setPwdPass]   = useState('');

  // Common State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef([]);

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
      setErrorMsg('Please enter your official institutional email.');
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
      setResendTimer(30);
      setSuccessMsg(res?.message || `6-digit passkey sent to ${otpEmail.trim()}`);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please ensure you are using a university email address.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Handle Digit Changes in OTP Input
  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste of multiple digits
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      if (cleaned.length > 0) {
        const nextDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = cleaned[i] || '';
        }
        setOtpDigits(nextDigits);
        const focusIndex = Math.min(cleaned.length, 5);
        if (inputRefs.current[focusIndex]) inputRefs.current[focusIndex].focus();
        return;
      }
      value = value[value.length - 1];
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = value;
    setOtpDigits(nextDigits);
    setErrorMsg('');

    if (value && index < 5) {
      if (inputRefs.current[index + 1]) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (inputRefs.current[index - 1]) inputRefs.current[index - 1].focus();
    }
  };

  // 3. Auto-fill detected OTP
  const handleAutoFillOtp = () => {
    if (serverOtp) {
      const chars = serverOtp.split('');
      setOtpDigits(chars);
      setErrorMsg('');
    }
  };

  // 4. Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otpDigits.join('').trim();
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the passkey.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const loggedUser = await verifyOtp(otpEmail.trim(), code);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Confetti fallback
      }

      const destination = from || loggedUser.homePath || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Passkey verification failed. Please check the code or request a new one.');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Handle Traditional Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!pwdEmail || !pwdPass) {
      setErrorMsg('Please provide both email and password.');
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
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-split-layout">
      {/* Desktop Left Hero Panel */}
      <div className="login-hero-panel">
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 'var(--r-sm)',
              background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-light) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(15, 45, 30, 0.5)',
              border: '1px solid rgba(111, 175, 61, 0.4)'
            }}>
              <Leaf size={26} color="#6FAF3D" />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#E7F1E1', letterSpacing: '-0.03em' }}>
                lora
              </div>
              <div style={{ fontSize: 11, color: '#A9C5A2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Natural · Pure · Sustainable
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div style={{ maxWidth: 480 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: 'var(--r-full)',
              background: 'rgba(231, 241, 225, 0.15)',
              border: '1px solid rgba(111, 175, 61, 0.35)',
              color: '#E7F1E1',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 20
            }}>
              <Leaf size={14} style={{ color: '#6FAF3D' }} /> From Our Fields To Your Table
            </div>
            <h2 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.15, color: '#FFFFFF', marginBottom: 16 }}>
              Fresh Food, Directly From Farm To Table.
            </h2>
            <p style={{ fontSize: 15, color: '#C8DFC2', lineHeight: 1.6, marginBottom: 36 }}>
              Log in directly with your official university email to access farm-fresh dining reservations, claim verified student privileges, and check in instantly.
            </p>

            {/* Feature Bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: '100% Farm-To-Table Certified', desc: 'Fresh ingredients harvested and delivered straight to verified campus partner kitchens.' },
                { title: 'Exclusive 20% Student Subsidy', desc: 'Auto-apply verified campus privileges across participating dining outlets.' },
                { title: 'Priority Fast-Pass Seating', desc: 'One-tap digital entry passes with table allocation ready upon arrival.' }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#6FAF3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <CheckCircle2 size={13} color="#0F2D1E" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#E7F1E1' }}>{f.title}</div>
                    <div style={{ fontSize: 12.5, color: '#A9C5A2', marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Footer */}
        <div style={{ fontSize: 11.5, color: '#7E9F8A', borderTop: '1px solid rgba(231,241,225,0.12)', paddingTop: 20, marginTop: 40 }}>
          Bennett University TechZone II, Greater Noida · Natural · Pure · Sustainable
        </div>
      </div>

      {/* Right Side: Interactive Form Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        backgroundColor: 'var(--bg-main)'
      }}>
        {/* Mobile Brand Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          textAlign: 'center'
        }} className="md:hidden">
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--r-sm)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px var(--primary-glow)',
            border: '1px solid rgba(111, 175, 61, 0.3)'
          }}>
            <Leaf size={24} color="#6FAF3D" />
          </div>
          <div>
            <div className="font-display" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.03em' }}>
              lora
            </div>
            <div style={{ fontSize: 11, color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Natural · Pure · Sustainable
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card anim-scale-in" style={{
          width: '100%',
          maxWidth: 460,
          padding: '32px 28px',
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            padding: 4,
            background: '#F1F5F9',
            borderRadius: 'var(--r-sm)',
            marginBottom: 24,
            gap: 4
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('OTP');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--r-xs)',
                border: 'none',
                background: authMode === 'OTP' ? '#FFFFFF' : 'transparent',
                color: authMode === 'OTP' ? 'var(--primary)' : 'var(--t3)',
                fontWeight: authMode === 'OTP' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: authMode === 'OTP' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <GraduationCap size={15} />
              <span>Institutional (OTP)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('PASSWORD');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--r-xs)',
                border: 'none',
                background: authMode === 'PASSWORD' ? '#FFFFFF' : 'transparent',
                color: authMode === 'PASSWORD' ? 'var(--primary)' : 'var(--t3)',
                fontWeight: authMode === 'PASSWORD' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: authMode === 'PASSWORD' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={14} />
              <span>Staff &amp; Admin</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '11px 14px', borderRadius: 'var(--r-sm)',
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#DC2626', fontSize: 13, marginBottom: 18
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '11px 14px', borderRadius: 'var(--r-sm)',
              background: '#ECFDF5', border: '1px solid #A7F3D0',
              color: '#059669', fontSize: 13, marginBottom: 18
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: INSTITUTIONAL OTP LOGIN */}
          {authMode === 'OTP' && (
            <div>
              {step === 'EMAIL' ? (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h1 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                      Sign In with Campus Email
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.5 }}>
                      Enter your official university email. We'll send a direct 6-digit access code to verify you instantly.
                    </p>
                  </div>

                  <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label className="form-label">University Email Address</label>
                      <div className="form-input-wrap">
                        <Mail size={15} className="form-input-icon" style={{ color: 'var(--primary)' }} />
                        <input
                          className="form-input"
                          type="email"
                          required
                          placeholder="name@bennett.edu.in"
                          value={otpEmail}
                          onChange={e => setOtpEmail(e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--t4)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={12} /> Accepts @bennett.edu.in &amp; partner university domains
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg btn-fw cursor-pointer"
                      style={{ marginTop: 4 }}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Sending Passkey...</>
                      ) : (
                        <><span>Send Institutional OTP</span> <ArrowRight size={15} /></>
                      )}
                    </button>
                  </form>

                  {/* Institutional Domain Info Badge */}
                  <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--r-sm)',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10
                    }}>
                      <GraduationCap size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                      <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>
                        <strong style={{ color: 'var(--primary)' }}>Authorized Institutional Access</strong>
                        <div style={{ marginTop: 2, color: 'var(--t3)' }}>
                          Eligible university domains include <code>@bennett.edu.in</code>, <code>@snu.edu.in</code>, and approved regional campus partner accounts.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 2: ENTER OTP */
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span className="badge badge-primary" style={{ fontSize: 11 }}>Step 2 of 2</span>
                    </div>
                    <h1 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
                      Enter Verification Code
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--t3)' }}>
                      6-digit passkey issued for <strong>{otpEmail}</strong>
                    </p>
                  </div>

                  {/* Sandbox helper banner showing issued OTP */}
                  {serverOtp && (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--r-sm)',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      marginBottom: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>
                          Campus Email Passkey
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#1E3A8A', letterSpacing: '0.15em' }}>
                          {serverOtp}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={handleAutoFillOtp}
                        style={{ fontSize: 11, padding: '4px 10px' }}
                      >
                        <Zap size={12} /> Auto Fill
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp}>
                    {/* 6 Digit Input Boxes */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 20 }}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleDigitChange(index, e.target.value)}
                          onKeyDown={e => handleKeyDown(index, e)}
                          style={{
                            width: 48,
                            height: 52,
                            borderRadius: 'var(--r-sm)',
                            border: digit ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                            background: '#FFFFFF',
                            textAlign: 'center',
                            fontSize: 20,
                            fontWeight: 800,
                            color: 'var(--t1)',
                            outline: 'none',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg btn-fw cursor-pointer"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Verifying Passkey...</>
                      ) : (
                        <><span>Verify &amp; Enter Portal</span> <ArrowRight size={15} /></>
                      )}
                    </button>
                  </form>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, fontSize: 12 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('EMAIL');
                        setErrorMsg('');
                        setOtpDigits(['', '', '', '', '', '']);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--t3)',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Change email address
                    </button>

                    <button
                      type="button"
                      disabled={resendTimer > 0 || submitting}
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendTimer > 0 ? 'var(--t4)' : 'var(--primary)',
                        cursor: resendTimer > 0 ? 'default' : 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <RotateCcw size={12} />
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Passkey'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: STAFF & MANAGEMENT PASSWORD LOGIN */}
          {authMode === 'PASSWORD' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h1 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                  Management &amp; Staff Access
                </h1>
                <p style={{ fontSize: 13, color: 'var(--t3)' }}>
                  Sign in with administrative credentials for restaurant hosting, floor map seating, and super admin governance.
                </p>
              </div>

              <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="form-input-wrap">
                    <Mail size={15} className="form-input-icon" style={{ color: 'var(--primary)' }} />
                    <input
                      className="form-input"
                      type="email"
                      required
                      placeholder="owner@spicegarden.com"
                      value={pwdEmail}
                      onChange={e => setPwdEmail(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="form-input-wrap">
                    <Lock size={15} className="form-input-icon" style={{ color: 'var(--accent)' }} />
                    <input
                      className="form-input"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={pwdPass}
                      onChange={e => setPwdPass(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-fw cursor-pointer"
                  style={{ marginTop: 4 }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Authenticating...</>
                  ) : (
                    <><span>Sign In as Staff / Admin</span> <ArrowRight size={15} /></>
                  )}
                </button>
              </form>

              {/* Security & Access Control Guidance */}
              <div style={{ marginTop: 22, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--r-sm)',
                  background: '#F8FAFC',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10
                }}>
                  <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>
                    <strong style={{ color: 'var(--t1)' }}>Role-Based Access Control (RBAC)</strong>
                    <div style={{ marginTop: 2, color: 'var(--t3)' }}>
                      Restaurant Owners, Front-Desk Service Staff, and Institutional Super Admins authenticate with their registered credentials.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--t4)' }}>
          Bennett University · Institutional Dining Platform V1.0
        </div>
      </div>
    </div>
  );
}
