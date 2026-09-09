import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PermissionDeniedState, LoadingState } from './states';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <LoadingState type="full-page" message="Verifying institutional RBAC privileges..." />
      </div>
    );
  }

  // Not authenticated -> redirect to login with return path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check RBAC roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <PermissionDeniedState
        userRole={user.role}
        allowedRoles={allowedRoles}
        userName={user.name}
        userEmail={user.email}
        homePath={user.homePath || '/dashboard'}
        onLogout={logout}
      />
    );
  }

  return children;
}
