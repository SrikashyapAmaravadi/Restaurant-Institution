import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

/**
 * RoleRoute enforces client-side Role-Based Access Control (RBAC).
 * If the authenticated user does not possess one of the required roles,
 * it presents an institutional Access Denied screen with options to switch role
 * or return to their authorized workspace.
 */
export default function RoleRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="page-pad anim-fade-up" style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: 540,
          width: '100%',
          background: 'var(--surface-card)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--r-xl)',
          padding: 36,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--r-full)',
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#ef4444'
          }}>
            <ShieldAlert size={32} />
          </div>

          <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
            Access Restricted by RBAC Policy
          </h2>

          <p style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 20 }}>
            Your current identity <strong style={{ color: 'var(--t1)' }}>{user.name}</strong> has role{' '}
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 'var(--r-full)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontWeight: 700,
              fontSize: 12
            }}>
              {user.role}
            </span>
            , which does not have authorization to view this management console.
          </p>

          <div style={{
            background: 'var(--surface-item)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--t2)',
            marginBottom: 24,
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Required Role(s):</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {allowedRoles.map(r => (
                <span key={r} style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                  fontSize: 12
                }}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <ArrowLeft size={16} /> Go Back
            </button>
            <a
              href={user.homePath || '/dashboard'}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Return to My Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
