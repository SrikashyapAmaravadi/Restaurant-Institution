import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, KeyRound, Mail, ArrowRight, RefreshCw, ShieldCheck, HelpCircle } from 'lucide-react';

/**
 * PendingApproval Page
 * Displayed when an institutional student account has been registered and is awaiting
 * clearance code generation / passkey distribution by the University Super Admin Governance Office.
 */
export default function PendingApproval() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const email = location.state?.email || user?.email || 'student@bennett.edu.in';
  const department = location.state?.department || user?.department || 'Bennett University';

  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleCheckStatus = () => {
    setChecking(true);
    setStatusMessage('');
    setTimeout(() => {
      setChecking(false);
      setStatusMessage('Verification request is currently queued with Bennett University Super Admin Operations.');
    }, 900);
  };

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
      <div
        className="card anim-scale-in"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: '38px 36px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* Status Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#FFFBEB',
            border: '2px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            color: 'var(--accent)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Clock size={30} />
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent)',
            background: 'var(--accent-subtle)',
            padding: '3px 10px',
            borderRadius: 'var(--r-full)',
            display: 'inline-block',
            marginBottom: 12
          }}
        >
          Institutional Approval In Progress
        </span>

        <h2
          className="font-display"
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--t1)',
            marginBottom: 8
          }}
        >
          Registration Under Review
        </h2>

        <p style={{ fontSize: 13.5, color: 'var(--t3)', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 24px' }}>
          Your institutional student account for <strong style={{ color: 'var(--t1)' }}>{email}</strong> ({department}) has been registered. The University Super Admin Governance Desk is currently reviewing enrollment credentials.
        </p>

        {/* Verification Status Card */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '16px',
            textAlign: 'left',
            marginBottom: 24,
            fontSize: 12.5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--accent)', fontWeight: 700 }}>
            <KeyRound size={15} /> Passkey Issuance Steps
          </div>
          <ol style={{ paddingLeft: 18, color: 'var(--t3)', lineHeight: 1.6 }}>
            <li>Super Admin validates your Bennett institutional email and ID proof.</li>
            <li>A 6-digit security clearance passkey is issued to your verified profile.</li>
            <li>Enter your passkey on the verification screen to activate dining discounts.</li>
          </ol>
        </div>

        {statusMessage && (
          <div
            className="anim-fade-in"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--r-xs)',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1E40AF',
              fontSize: 12.5,
              marginBottom: 20
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate('/verify', { state: { email } })}
            className="btn btn-primary btn-lg btn-fw cursor-pointer"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <ShieldCheck size={16} />
            <span>I Have Received My Clearance Code</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="btn btn-secondary btn-md btn-fw cursor-pointer"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
            <span>{checking ? 'Checking Queue...' : 'Check Approval Status'}</span>
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--t4)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          Need expedited access? Contact the platform administrator at{' '}
          <span style={{ color: 'var(--accent)' }}>superadmin@bennett.edu.in</span>.
        </div>
      </div>
    </div>
  );
}
