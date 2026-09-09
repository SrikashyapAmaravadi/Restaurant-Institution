import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CameraScannerModal from './CameraScannerModal';
import {
  LayoutDashboard,
  Compass,
  CalendarDays,
  Bell,
  User,
  ChefHat,
  ConciergeBell,
  Building2,
  Menu,
  X,
  LogOut,
  Sparkles,
  ShieldCheck,
  UtensilsCrossed
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const {
    reservations = [],
    notifications = [],
    scannerModalOpen,
    closeScanner,
    staffCheckInGuest
  } = useDining() || {};
  const location = useLocation();
  const navigate = useNavigate();

  const [navVisible, setNavVisible] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const lastScrollY = useRef(0);

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Dynamic badge counts from real Supabase DB
  const activeBookingsCount = safeReservations.filter(b => b?.status === 'CONFIRMED' || b?.status === 'PENDING').length;
  const unreadNotifsCount = safeNotifications.filter(n => !n?.read).length;

  // Scroll listener for dynamic hide-on-scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      if (currentScrollY > 60 && currentScrollY > lastScrollY.current + 10) {
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8 || currentScrollY < 40) {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  if (!user) return <Outlet />;

  // Dynamic role-based navigation configuration - strictly scoped to user role
  const getNavItems = () => {
    switch (user?.role) {
      case 'RESTAURANT_ADMIN':
        return [
          { to: '/management/admin', label: 'Admin Hub', icon: ChefHat },
          { to: '/management/staff', label: 'Front Desk', icon: ConciergeBell },
          { to: '/profile',          label: 'Profile',    icon: User }
        ];

      case 'RESTAURANT_STAFF':
        return [
          { to: '/management/staff', label: 'Host Desk',  icon: ConciergeBell },
          { to: '/profile',          label: 'Profile',    icon: User }
        ];

      case 'SUPER_ADMIN':
        return [
          { to: '/management/superadmin', label: 'Governance', icon: Building2 },
          { to: '/profile',               label: 'Profile',    icon: User }
        ];

      case 'STUDENT':
      default:
        return [
          { to: '/dashboard',     label: 'Home',      icon: LayoutDashboard },
          { to: '/discover',      label: 'Discover',  icon: Compass },
          { to: '/bookings',      label: 'Bookings',  icon: CalendarDays, badge: activeBookingsCount },
          { to: '/notifications', label: 'Alerts',    icon: Bell,         badge: unreadNotifsCount },
          { to: '/profile',       label: 'Profile',   icon: User }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="app-layout">
      {/* Desktop Sidebar (visible on screens >= 1024px) */}
      <Sidebar />

      <div className="main-area">
        <Topbar onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />
        <main className="page-scroll">
          <Outlet />
        </main>
      </div>

      {/* Dynamic Floating Glassmorphic Mobile Bottom Dock */}
      <nav
        className={`mobile-bottom-nav ${!navVisible ? 'nav-hidden' : ''}`}
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              {isActive && <div className="mobile-nav-active-bg" />}

              <div className="mobile-nav-icon-wrap">
                <Icon size={20} />
                {item.badge > 0 && (
                  <span className="mobile-nav-badge">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="mobile-nav-label">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile Slide-out Drawer Sheet */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="sidebar-brand-icon" style={{ width: 36, height: 36 }}>
                  <UtensilsCrossed size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>Dine@Bennett</div>
                  <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>Bennett University</div>
                </div>
              </div>
              <button
                className="icon-btn"
                style={{ width: 32, height: 32 }}
                onClick={() => setMobileDrawerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Current User Card */}
            <div style={{ padding: 12, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)' }}>
                    {user.roleLabel?.split('(')[0] || user.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Navigation Links - strictly scoped to user role */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4, marginBottom: 4 }}>
                Navigation
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <Icon size={16} /> {item.label}
                    {item.badge > 0 && (
                      <span className="nav-badge" style={{ marginLeft: 'auto' }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Logout Footer */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 'auto' }}>
              <button
                className="btn btn-outline btn-sm btn-fw"
                style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Camera Scanner Modal accessible across entire app */}
      <CameraScannerModal
        isOpen={Boolean(scannerModalOpen)}
        onClose={closeScanner}
        reservations={safeReservations}
        onScanSuccess={(code, matched) => {
          if (matched && staffCheckInGuest) {
            staffCheckInGuest(matched.id, matched.tableAssigned || 'T-01');
          }
        }}
      />
    </div>
  );
}
