import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiningProvider } from './context/DiningContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import ClickSpark from './components/ClickSpark';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import PendingApproval from './pages/PendingApproval';
import { OfflineBanner } from './components/states';

// Student Portal Pages
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
          <ClickSpark
            sparkColor="#11120D"
            sparkSize={11}
            sparkRadius={22}
            sparkCount={8}
            duration={420}
          >
            <OfflineBanner />
            <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Authenticated Layout with RBAC Route Gates */}
          <Route element={<AppLayout />}>

            {/* Student & Faculty RBAC Routes */}
            <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
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

            {/* Restaurant Admin & Operations RBAC Route */}
            <Route
              path="/management/admin"
              element={
                <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_STAFF', 'SUPER_ADMIN']}>
                  <RestaurantAdmin />
                </ProtectedRoute>
              }
            />

            {/* Legacy Host Desk Route Redirect */}
            <Route
              path="/management/staff"
              element={<Navigate to="/management/admin" replace />}
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
          </ClickSpark>
      </BrowserRouter>
      </DiningProvider>
    </AuthProvider>
  );
}
