import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Standardized PermissionDeniedState Component (403 Forbidden / RBAC boundary)
 * Rendered whenever a route or resource is inaccessible to the current user's role.
 */
export default function PermissionDeniedState({
  userRole = 'STUDENT',
  allowedRoles = [],
  userName = 'Current User',
  userEmail = '',
  homePath = '/dashboard',
  onLogout,
  className = '',
  style = {}
}) {
  return (
    <div
      className="anim-fade-in"
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        ...style
      }}
    >
      <div
        className={`card anim-scale-in ${className}`}
        style={{
          maxWidth: 500,
          width: '100%',
          padding: '38px 32px',
          textAlign: 'center',
          border: '1px solid #FECACA',
          background: '#FFFFFF',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#FEF2F2',
            border: '2px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            color: '#DC2626'
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#DC2626',
            background: '#FEF2F2',
            padding: '3px 10px',
            borderRadius: 'var(--r-full)',
            display: 'inline-block',
            marginBottom: 12
          }}
        >
          Access Restricted · 403
        </span>

        <h3
          className="font-display"
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--t1)',
            marginBottom: 8
          }}
        >
          Role-Based Access Control Gate
        </h3>

        <p style={{ fontSize: 13.5, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 22 }}>
          Your current account role <strong style={{ color: 'var(--accent)' }}>[{userRole}]</strong> is not authorized to access this platform module.
        </p>

        {/* Credential Scope Information */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--r-sm)',
            background: '#F8FAFC',
            border: '1px solid var(--border)',
            textAlign: 'left',
            marginBottom: 24,
            fontSize: 12.5
          }}
        >
          {allowedRoles && allowedRoles.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700, fontSize: 10.5, letterSpacing: '0.05em' }}>
                Authorized Roles
              </div>
              <div style={{ color: 'var(--primary-light)', fontWeight: 600, marginTop: 2 }}>
                {allowedRoles.join(' · ')}
              </div>
            </div>
          )}

          <div>
            <div style={{ color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700, fontSize: 10.5, letterSpacing: '0.05em' }}>
              Authenticated Subject
            </div>
            <div style={{ color: 'var(--t1)', fontWeight: 600, marginTop: 2 }}>
              {userName} {userEmail && <span style={{ color: 'var(--t3)', fontWeight: 400 }}>({userEmail})</span>}
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={homePath || '/dashboard'}
            className="btn btn-primary btn-md cursor-pointer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <ArrowLeft size={15} />
            <span>Return to My Dashboard</span>
          </Link>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="btn btn-secondary btn-md cursor-pointer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <LogOut size={14} />
              <span>Switch Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
