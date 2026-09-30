import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PermissionDeniedState, LoadingState } from './states';

export const getRoleDashboard = (role) => {
  if (role === 'SUPER_ADMIN') return '/management/superadmin';
  if (role === 'RESTAURANT_ADMIN' || role === 'RESTAURANT_STAFF') return '/management/admin';
  return '/discover';
};

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
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

  // Check RBAC roles: directly redirect to respective dashboard according to user's role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const targetDashboard = getRoleDashboard(user.role);
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
}
