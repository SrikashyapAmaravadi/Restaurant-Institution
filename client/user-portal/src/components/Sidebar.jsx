import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  LayoutDashboard,
  Compass,
  CalendarDays,
  Bell,
  User,
  LogOut,
  Building2,
  ChefHat,
  ConciergeBell,
  Store,
  UtensilsCrossed,
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { reservations = [], notifications = [], restaurants = [] } = useDining() || {};

  if (!user) return null;

  const isStudent = user?.role === 'STUDENT' || !user?.role;
  const isAdmin   = user?.role === 'RESTAURANT_ADMIN';
  const isStaff   = user?.role === 'RESTAURANT_STAFF';
  const isSuper   = user?.role === 'SUPER_ADMIN';

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  const activeBookingsCount = safeReservations.filter(b => b?.status === 'CONFIRMED' || b?.status === 'PENDING').length;
  const unreadNotifsCount = safeNotifications.filter(n => !n?.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sidebar-brand-icon">
            <UtensilsCrossed size={16} color="#FFF" />
          </div>
          <div>
            <div className="sidebar-brand-name">Dine@Bennett</div>
            <div className="sidebar-brand-sub">Campus Dining</div>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="sidebar-user">
        <div className="sidebar-user-inner">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #EEE' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.name || 'Scholar'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#22C55E', fontWeight: 500 }}>
              {user?.roleLabel?.split('(')[0] || user?.role || 'STUDENT'}
            </div>
          </div>
          <div className="verified-dot" title="Verified" />
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">

        {isStudent && (
          <>
            <div className="nav-label">Menu</div>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><LayoutDashboard size={17} /></span>
              <span style={{ flex: 1 }}>Home</span>
            </NavLink>

            <NavLink to="/discover" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><Compass size={17} /></span>
              <span style={{ flex: 1 }}>Discover</span>
            </NavLink>

            <NavLink to="/bookings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><CalendarDays size={17} /></span>
              <span style={{ flex: 1 }}>Reservations</span>
              {activeBookingsCount > 0 && <span className="nav-badge">{activeBookingsCount}</span>}
            </NavLink>

            <NavLink to="/notifications" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><Bell size={17} /></span>
              <span style={{ flex: 1 }}>Notifications</span>
              {unreadNotifsCount > 0 && <span className="nav-badge">{unreadNotifsCount}</span>}
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><User size={17} /></span>
              <span style={{ flex: 1 }}>Profile</span>
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <div className="nav-label">Restaurant</div>
            <NavLink to="/management/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><ChefHat size={17} /></span>
              <span style={{ flex: 1 }}>Operations</span>
            </NavLink>
            <NavLink to="/management/staff" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><ConciergeBell size={17} /></span>
              <span style={{ flex: 1 }}>Host Desk</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><User size={17} /></span>
              <span style={{ flex: 1 }}>Profile</span>
            </NavLink>
          </>
        )}

        {isStaff && (
          <>
            <div className="nav-label">Staff</div>
            <NavLink to="/management/staff" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><ConciergeBell size={17} /></span>
              <span style={{ flex: 1 }}>Host Desk</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><User size={17} /></span>
              <span style={{ flex: 1 }}>Profile</span>
            </NavLink>
          </>
        )}

        {isSuper && (
          <>
            <div className="nav-label">Admin</div>
            <NavLink
              to="/management/superadmin"
              end
              className={({ isActive }) => `nav-item${isActive && !location.search.includes('Restaurants') ? ' active' : ''}`}
            >
              <span className="nav-icon"><Building2 size={17} /></span>
              <span style={{ flex: 1 }}>Governance</span>
            </NavLink>
            <NavLink
              to="/management/superadmin?tab=Restaurants"
              className={() => `nav-item${location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? ' active' : ''}`}
            >
              <span className="nav-icon"><Store size={17} /></span>
              <span style={{ flex: 1 }}>Restaurants</span>
              {safeRestaurants.length > 0 && <span className="nav-badge">{safeRestaurants.length}</span>}
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><User size={17} /></span>
              <span style={{ flex: 1 }}>Profile</span>
            </NavLink>
          </>
        )}
      </div>

      {/* Sign Out */}
      <div className="sidebar-footer">
        <button
          className="nav-item sidebar-logout-btn"
          style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', color: '#888', padding: '8px 12px' }}
          onClick={handleLogout}
        >
          <span className="nav-icon"><LogOut size={15} /></span>
          <span style={{ fontWeight: 500 }}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
