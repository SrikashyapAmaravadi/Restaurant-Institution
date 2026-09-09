import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiningProvider } from './context/DiningContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import PendingApproval from './pages/PendingApproval';
import { OfflineBanner } from './components/states';

// Student Portal Pages
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import RestaurantDetail from './pages/RestaurantDetail';
import Bookings from './pages/Bookings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// RBAC Management Portal Pages
import RestaurantAdmin from './pages/management/RestaurantAdmin';
import StaffPortal from './pages/management/StaffPortal';
import SuperAdmin from './pages/management/SuperAdmin';
import Landing from './pages/Landing';

export default function App() {
  return (
    <AuthProvider>
      <DiningProvider>
        <BrowserRouter>
          <OfflineBanner />
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/verify" element={<Navigate to="/login" replace />} />
            <Route path="/pending-approval" element={<Navigate to="/login" replace />} />

          {/* Authenticated Layout with RBAC Route Gates */}
          <Route element={<AppLayout />}>

            {/* Student & Faculty RBAC Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discover"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
                  <Discover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
                  <RestaurantDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN', 'RESTAURANT_ADMIN', 'RESTAURANT_STAFF']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Restaurant Admin RBAC Route */}
            <Route
              path="/management/admin"
              element={
                <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN', 'SUPER_ADMIN']}>
                  <RestaurantAdmin />
                </ProtectedRoute>
              }
            />

            {/* Restaurant Staff Front Desk RBAC Route */}
            <Route
              path="/management/staff"
              element={
                <ProtectedRoute allowedRoles={['RESTAURANT_STAFF', 'RESTAURANT_ADMIN', 'SUPER_ADMIN']}>
                  <StaffPortal />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Governance RBAC Route */}
            <Route
              path="/management/superadmin"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </DiningProvider>
    </AuthProvider>
  );
}
