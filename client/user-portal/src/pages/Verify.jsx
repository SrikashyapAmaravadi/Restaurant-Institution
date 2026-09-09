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
import { SuccessState } from '../components/states';

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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          padding: '40px 20px'
        }}
      >
        <SuccessState
          title="Institutional Verification Complete"
          description="Your Bennett University identity has been verified. You now have full access to campus dining privileges, pre-booking, and partner offers."
          referenceCode={otp.join('')}
          referenceLabel="Verified Security Passkey"
          details={[
            { label: 'Institutional Email', value: email },
            { label: 'Access Tier', value: 'Tier-1 Bennett Member' },
            { label: 'Status', value: 'Active & Verified' }
          ]}
          actionLabel="Explore Restaurants"
          actionPath="/discover"
          secondaryLabel="View Profile"
          secondaryPath="/profile"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        padding: 'clamp(20px, 5vw, 40px) clamp(12px, 4vw, 20px)',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="card anim-scale-in"
        style={{
          width: '100%',
          maxWidth: 520,
          boxSizing: 'border-box',
          padding: 'clamp(24px, 5vw, 36px) clamp(16px, 4vw, 36px)',
          textAlign: 'center',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* Shield Icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'var(--primary-subtle)',
            border: '1.5px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <ShieldCheck size={30} />
        </div>

        <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
          Institutional Verification
        </h2>

        <p style={{ fontSize: 13.5, color: 'var(--t3)', maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.5 }}>
          Enter the 6-digit security clearance code issued by the <strong>Super Admin Governance Office</strong> for:<br />
          <strong style={{ color: 'var(--accent)' }}>{email}</strong>
        </p>

        {/* Super Admin Code Notification Banner */}
        {issuedCode ? (
          <div
            style={{
              background: '#ECFDF5',
              border: '1.5px solid #A7F3D0',
              borderRadius: 'var(--r-sm)',
              padding: '14px 16px',
              marginBottom: 24,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#059669' }}>
                <KeyRound size={14} /> Super Admin Issued Code
              </div>
              <div style={{ fontSize: 13, color: 'var(--t1)', marginTop: 2 }}>
                Passkey: <strong style={{ color: 'var(--accent)', fontSize: 15, letterSpacing: '0.08em', fontFamily: 'monospace' }}>{issuedCode}</strong>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm cursor-pointer"
              onClick={handleApplyIssuedCode}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Sparkles size={13} />
              <span>1-Click Fill</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--r-sm)',
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 12.5,
              color: 'var(--t2)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Awaiting Admin Clearance</span>
              <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>
                Your clearance passkey will be issued by the University Super Admin once your enrollment is verified.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify}>
          {/* 6 Digit Inputs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(4px, 1.8vw, 10px)', marginBottom: 20 }}>
            {otp.map((val, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={val}
                onChange={e => handleChange(idx, e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  maxWidth: 48,
                  height: 'clamp(42px, 12vw, 56px)',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-surface)',
                  border: `2px solid ${val ? '#6FAF3D' : 'var(--border)'}`,
                  fontSize: 'clamp(16px, 4.5vw, 22px)',
                  fontWeight: 800,
                  color: 'var(--t1)',
                  textAlign: 'center',
                  outline: 'none',
                  boxShadow: val ? '0 0 0 3px rgba(111, 175, 61, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            ))}
          </div>

          {errorMsg && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#EF4444',
                fontSize: 12.5,
                marginBottom: 16
              }}
            >
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 22 }}>
            {timer > 0 ? (
              <span>Resend code in <strong style={{ color: 'var(--accent)' }}>0:{timer < 10 ? `0${timer}` : timer}</strong></span>
            ) : (
              <button
                type="button"
                onClick={() => setTimer(59)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <RotateCcw size={13} />
                <span>Resend OTP Code</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-fw cursor-pointer"
            disabled={verifying}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {verifying ? (
              <><Loader2 size={16} className="animate-spin" /> Validating Passkey...</>
            ) : (
              <><span>Complete Verification & Continue</span> <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--t4)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          Official institutional passkeys are issued by the Office of Platform Governance upon student ID verification.
        </div>
      </div>
    </div>
  );
}
