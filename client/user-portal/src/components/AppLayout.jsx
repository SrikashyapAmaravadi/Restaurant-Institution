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
          <div className="mobile-drawer-sheet flex flex-col h-full bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <UtensilsCrossed size={18} />
                </div>
                <div>
                  <div className="font-bold text-base text-slate-900 leading-tight">Dine@Bennett</div>
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Bennett University</div>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current User Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-5">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-600/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 truncate">
                    {user.roleLabel?.split('(')[0] || user.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                Navigation
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                      }`
                    }
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Logout Footer */}
            <div className="border-t border-slate-100 pt-4 mt-auto">
              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold cursor-pointer transition-colors"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={16} /> Sign Out
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
