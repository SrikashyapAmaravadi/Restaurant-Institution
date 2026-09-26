import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, KeyRound, ArrowRight, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import GlacierDoodleBackground from '../components/GlacierDoodleBackground';

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
      setStatusMessage('Request queued with Bennett University Super Admin Operations.');
    }, 900);
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 32px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: '#FFFBF4',
      }}
    >
      <GlacierDoodleBackground theme="light" />

      <div className="auth-card" style={{ textAlign: 'center' }}>
        {/* Status Emblem */}
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
          <Clock size={20} />
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
          <span>Approval In Progress</span>
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
          Under Review
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
          Student account for <strong style={{ color: '#11120D' }}>{email}</strong> is under review by University Super Admin.
        </p>

        {/* Verification Status Card */}
        <div
          style={{
            background: '#F6F2EA',
            border: '1px solid #E8E2D5',
            borderRadius: 12,
            padding: '10px 12px',
            textAlign: 'left',
            marginBottom: 14,
            fontSize: 11,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#11120D', fontWeight: 700 }}>
            <KeyRound size={13} />
            <span>Passkey Next Steps</span>
          </div>
          <ol style={{ margin: 0, paddingLeft: 16, color: '#565449', lineHeight: 1.45, fontSize: 10.5 }}>
            <li>Admin validates student email &amp; ID credentials.</li>
            <li>6-digit clearance code is generated for pass.</li>
            <li>Enter code on verify screen to activate dining.</li>
          </ol>
        </div>

        {statusMessage && (
          <div
            style={{
              padding: '6px 8px',
              borderRadius: 8,
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1E40AF',
              fontSize: 10.5,
              marginBottom: 12,
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            onClick={() => navigate('/verify', { state: { email } })}
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
            <ShieldCheck size={14} />
            <span>Enter Clearance Code</span>
            <ArrowRight size={13} />
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="btn btn-secondary auth-card-btn"
            style={{
              width: '100%',
              borderRadius: 99,
              fontWeight: 500,
              background: '#FFFFFF',
              border: '1px solid #E8E2D5',
              color: '#565449',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              touchAction: 'manipulation',
            }}
          >
            <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
            <span>{checking ? 'Checking Queue...' : 'Check Approval Status'}</span>
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 10.5, color: '#565449' }}>
          <span>Need help? Contact </span>
          <a
            href="mailto:superadmin@bennett.edu.in"
            style={{ color: '#11120D', fontWeight: 600, textDecoration: 'none' }}
          >
            superadmin@bennett.edu.in
          </a>
        </div>
      </div>
    </div>
  );
}
