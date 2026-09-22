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
  X,
  LogOut,
  ShieldCheck,
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

  const activeBookingsCount = safeReservations.filter(b => b?.status === 'CONFIRMED' || b?.status === 'PENDING').length;
  const unreadNotifsCount = safeNotifications.filter(n => !n?.read).length;

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y > 60 && y > lastScrollY.current + 10) setNavVisible(false);
      else if (y < lastScrollY.current - 8 || y < 40) setNavVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileDrawerOpen(false); }, [location.pathname]);

  if (!user) return <Outlet />;

  const getNavItems = () => {
    switch (user?.role) {
      case 'RESTAURANT_ADMIN':
        return [
          { to: '/management/admin', label: 'Operations', icon: ChefHat },
          { to: '/management/staff', label: 'Host Desk', icon: ConciergeBell },
          { to: '/profile', label: 'Profile', icon: User }
        ];
      case 'RESTAURANT_STAFF':
        return [
          { to: '/management/staff', label: 'Host Desk', icon: ConciergeBell },
          { to: '/profile', label: 'Profile', icon: User }
        ];
      case 'SUPER_ADMIN':
        return [
          { to: '/management/superadmin', label: 'Governance', icon: Building2 },
          { to: '/profile', label: 'Profile', icon: User }
        ];
      case 'STUDENT':
      default:
        return [
          { to: '/dashboard', label: 'Dining', icon: LayoutDashboard },
          { to: '/discover', label: 'Outlets', icon: Compass },
          { to: '/bookings', label: 'Passes', icon: CalendarDays, badge: activeBookingsCount },
          { to: '/notifications', label: 'Alerts', icon: Bell, badge: unreadNotifsCount },
          { to: '/profile', label: 'Profile', icon: User }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="app-layout" style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <Sidebar />

      <div className="main-area">
        <Topbar onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />
        <main className="page-scroll">
          <Outlet />
        </main>
      </div>

      {/* Floating Modern Pill Dock for Mobile (100% Light Theme) */}
      <nav
        className="mobile-bottom-dock"
        style={{
          position: 'fixed',
          bottom: 18,
          left: '50%',
          transform: `translateX(-50%) translateY(${navVisible ? '0' : '100px'})`,
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease',
          opacity: navVisible ? 1 : 0,
          width: 'calc(100% - 32px)',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 99,
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
          border: '1px solid #E2E8F0',
          zIndex: 90,
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                textDecoration: 'none',
                position: 'relative',
                padding: '6px 14px',
                borderRadius: 99,
                color: isActive ? '#BE185D' : '#64748B',
                background: isActive ? '#FFE4E6' : 'transparent',
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={19} color={isActive ? '#BE185D' : 'currentColor'} strokeWidth={isActive ? 2.4 : 1.8} />
                {item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      minWidth: 16,
                      height: 16,
                      padding: '0 4px',
                      borderRadius: 8,
                      background: '#E11D48',
                      color: '#FFF',
                      fontSize: 9.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile Drawer (100% Light Theme) */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '84%',
              maxWidth: 320,
              height: '100%',
              background: '#FFFFFF',
              color: '#0F172A',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '10px 0 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 18,
                borderBottom: '1px solid #EEF0F3',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#000' }}>
                  district
                </span>
                <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', color: '#64748B' }}>
                  CAMPUS DINING
                </span>
              </div>
              <button
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
                onClick={() => setMobileDrawerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* User Profile */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <ShieldCheck size={12} />
                  <span>Campus Verified</span>
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 16px',
                      borderRadius: 99,
                      fontSize: 13.5,
                      textDecoration: 'none',
                      color: isActive ? '#BE185D' : '#334155',
                      background: isActive ? '#FFE4E6' : 'transparent',
                      fontWeight: isActive ? 700 : 500,
                    })}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <Icon size={18} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: 99,
                          background: '#E11D48',
                          color: '#FFF',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Logout */}
            <div style={{ borderTop: '1px solid #EEF0F3', paddingTop: 16, marginTop: 'auto' }}>
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderRadius: 99,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#DC2626',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => { logout(); navigate('/login'); }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <CameraScannerModal
        isOpen={Boolean(scannerModalOpen)}
        onClose={closeScanner}
        reservations={safeReservations}
        onScanSuccess={(code, matched) => {
          if (matched && staffCheckInGuest) staffCheckInGuest(matched.id, matched.tableAssigned || 'T-01');
        }}
      />
    </div>
  );
}
