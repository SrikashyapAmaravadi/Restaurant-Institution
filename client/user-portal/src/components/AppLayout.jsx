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
    <div className="app-layout" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Sidebar />

      <div className="main-area">
        <Topbar onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />
        <main className="page-scroll">
          <Outlet />
        </main>
      </div>

      {/* Floating Modern Pill Dock for Mobile — Minimalist Black & White */}
      <nav
        className="mobile-bottom-dock"
        style={{
          position: 'fixed',
          bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: `translateX(-50%) translateY(${navVisible ? '0' : '100px'})`,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
          opacity: navVisible ? 1 : 0,
          width: 'calc(100% - 24px)',
          maxWidth: 420,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 99,
          padding: '6px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.10)',
          border: '1px solid #D8CFBC',
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
                padding: '6px clamp(8px, 2.5vw, 14px)',
                borderRadius: 99,
                color: isActive ? '#FFFBF4' : '#565449',
                background: isActive ? '#11120D' : 'transparent',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={18} color={isActive ? '#FFFBF4' : 'currentColor'} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      minWidth: 15,
                      height: 15,
                      padding: '0 4px',
                      borderRadius: 8,
                      background: isActive ? '#FFFBF4' : '#11120D',
                      color: isActive ? '#11120D' : '#FFFBF4',
                      fontSize: 9,
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
              <span style={{ fontSize: 9.5, fontWeight: isActive ? 600 : 500 }}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile Drawer — Minimalist White */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 18, 13, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '82%',
              maxWidth: 300,
              height: '100%',
              background: '#FFFFFF',
              color: '#11120D',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(17, 18, 13, 0.1)',
              borderRight: '1px solid #E8E2D5',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 16,
                borderBottom: '1px solid #E8E2D5',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                    fontSize: 23,
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: '#11120D',
                    lineHeight: 1.05,
                  }}
                >
                  nivix-dine-in
                </span>
                <span style={{ fontSize: 9, fontWeight: 650, letterSpacing: '0.12em', color: '#565449', textTransform: 'uppercase', marginTop: 3 }}>
                  CAMPUS DINING · BENNETT
                </span>
              </div>
              <button
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid #E8E2D5',
                  background: '#F6F2EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#565449',
                }}
                onClick={() => setMobileDrawerOpen(false)}
              >
                <X size={15} />
              </button>
            </div>

            {/* User Profile */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: '#F6F2EA',
                border: '1px solid #E8E2D5',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 18,
              }}
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #D8CFBC' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#11120D', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: '#2D6A4F', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  <ShieldCheck size={12} />
                  <span>Campus Verified</span>
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
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
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      textDecoration: 'none',
                      color: isActive ? '#FFFBF4' : '#565449',
                      background: isActive ? '#11120D' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                      border: `1px solid ${isActive ? '#11120D' : 'transparent'}`,
                    })}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <Icon size={17} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 99,
                          background: '#11120D',
                          color: '#FFFBF4',
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
            <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: 14, marginTop: 'auto' }}>
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  borderRadius: 8,
                  border: '1px solid #E4E4E7',
                  background: '#FFFFFF',
                  color: '#71717A',
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => { logout(); navigate('/login'); }}
              >
                <LogOut size={15} /> Sign out
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
