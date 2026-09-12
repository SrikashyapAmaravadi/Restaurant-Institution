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
  Leaf
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
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sidebar-brand-icon" style={{ background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38 }}>
            <UtensilsCrossed size={20} color="#FFFFFF" />
          </div>
          <div>
            <div className="sidebar-brand-name font-display" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.1rem', fontWeight: 800 }}>
              <span>Dine@Bennett</span>
            </div>
            <div className="sidebar-brand-sub" style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: 500 }}>Campus Dining Network</div>
          </div>
        </div>
      </div>

      {/* Authenticated User & Role Chip */}
      <div className="sidebar-user">
        <div className="sidebar-user-inner" style={{ border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.name || 'Scholar'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
              {user?.roleLabel?.split('(')[0] || user?.role || 'STUDENT'}
            </div>
          </div>
          <div className="verified-dot" title="Authenticated & Verified" style={{ background: 'var(--primary)' }} />
        </div>
      </div>

      {/* RBAC Role-Based Navigation - Strictly Isolated */}
      <div className="sidebar-nav">

        {/* Student Nav ONLY */}
        {isStudent && (
          <>
            <div className="nav-label">Student Dining</div>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><LayoutDashboard size={18} /></span>
              <span style={{ flex: 1 }}>Dashboard</span>
            </NavLink>

            <NavLink to="/discover" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><Compass size={18} /></span>
              <span style={{ flex: 1 }}>Discover &amp; Map</span>
            </NavLink>

            <NavLink to="/bookings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><CalendarDays size={18} /></span>
              <span style={{ flex: 1 }}>My Reservations</span>
              {activeBookingsCount > 0 && <span className="nav-badge">{activeBookingsCount}</span>}
            </NavLink>

            <NavLink to="/notifications" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><Bell size={18} /></span>
              <span style={{ flex: 1 }}>Notifications</span>
              {unreadNotifsCount > 0 && <span className="nav-badge">{unreadNotifsCount}</span>}
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><User size={18} /></span>
              <span style={{ flex: 1 }}>Profile &amp; ID</span>
            </NavLink>
          </>
        )}

        {/* Restaurant Owner Nav ONLY */}
        {isAdmin && (
          <>
            <div className="nav-label">
              <span>Restaurant Owner</span>
            </div>
            <NavLink to="/management/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><ChefHat size={18} /></span>
              <span style={{ flex: 1 }}>Operations &amp; Bookings</span>
            </NavLink>
            <NavLink to="/management/staff" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><ConciergeBell size={18} /></span>
              <span style={{ flex: 1 }}>Host Desk Check-In</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><User size={18} /></span>
              <span style={{ flex: 1 }}>Profile &amp; ID</span>
            </NavLink>
          </>
        )}

        {/* Front-Desk Staff Nav ONLY */}
        {isStaff && (
          <>
            <div className="nav-label">
              <span>Front Desk Staff</span>
            </div>
            <NavLink to="/management/staff" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><ConciergeBell size={18} /></span>
              <span style={{ flex: 1 }}>Host Desk Check-In</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><User size={18} /></span>
              <span style={{ flex: 1 }}>Profile &amp; ID</span>
            </NavLink>
          </>
        )}

        {/* Super Admin Governance Nav ONLY */}
        {isSuper && (
          <>
            <div className="nav-label">
              <span>Super Admin</span>
            </div>
            <NavLink
              to="/management/superadmin"
              end
              className={({ isActive }) => `nav-item${isActive && !location.search.includes('Restaurants') ? ' active' : ''}`}
            >
              <span className="nav-icon"><Building2 size={18} /></span>
              <span style={{ flex: 1 }}>Platform Governance</span>
            </NavLink>
            <NavLink
              to="/management/superadmin?tab=Restaurants"
              className={() => `nav-item${location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? ' active' : ''}`}
            >
              <span className="nav-icon"><Store size={18} /></span>
              <span style={{ flex: 1 }}>Partner Restaurants</span>
              {safeRestaurants.length > 0 && <span className="nav-badge">{safeRestaurants.length}</span>}
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><User size={18} /></span>
              <span style={{ flex: 1 }}>Profile &amp; ID</span>
            </NavLink>
          </>
        )}

      </div>

      {/* Footer / Sign Out */}
      <div className="sidebar-footer">
        <button
          className="nav-item sidebar-logout-btn"
          style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', color: 'var(--t4)' }}
          onClick={handleLogout}
        >
          <span className="nav-icon">
            <LogOut size={16} />
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
