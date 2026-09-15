import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Bell,
  Search,
  MapPin,
  ChevronDown,
  Menu,
  ChefHat,
  ConciergeBell,
  Building2,
  GraduationCap,
  Camera,
  UtensilsCrossed
} from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':             'Campus Dining',
  '/discover':              'Explore & Radar',
  '/bookings':              'Passes & Reservations',
  '/notifications':         'Dining Alerts',
  '/profile':               'Student Profile',
  '/restaurant':            'Restaurant Details',
  '/management/admin':      'Restaurant Admin',
  '/management/staff':      'Staff Scanner',
  '/management/superadmin': 'Governance',
};

export default function Topbar({ onOpenMobileDrawer }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications = [], openScanner } = useDining() || {};

  const unreadNotifs = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Dine@Bennett';

  if (!user) {
    return (
      <header className="topbar">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
            <UtensilsCrossed size={16} />
          </div>
          <h1 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">Dine@Bennett</h1>
        </div>
        <button
          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
          onClick={() => navigate('/login')}
        >
          Sign In
        </button>
      </header>
    );
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Governance', icon: Building2, color: 'text-slate-800 bg-slate-100 border-slate-300' };
      case 'RESTAURANT_ADMIN':
        return { label: 'Partner Admin', icon: ChefHat, color: 'text-slate-800 bg-slate-100 border-slate-300' };
      case 'RESTAURANT_STAFF':
        return { label: 'Host Desk', icon: ConciergeBell, color: 'text-slate-800 bg-slate-100 border-slate-300' };
      case 'STUDENT':
      default:
        return { label: 'Verified Member', icon: GraduationCap, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="topbar">
      {/* Left: Mobile Drawer Trigger + Campus Zone Indicator */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          className="mobile-menu-trigger w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          onClick={onOpenMobileDrawer}
          title="Open Menu"
          aria-label="Toggle mobile menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-slate-800 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              title="Campus Zone"
            >
              <MapPin size={12} className="text-emerald-700 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-none">Bennett TechZone II</span>
              <ChevronDown size={11} className="text-slate-400 shrink-0" />
            </button>

            <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleInfo.color}`}>
              <RoleIcon size={11} />
              {roleInfo.label}
            </span>
          </div>

          <span className="hidden sm:block text-xs text-slate-500 font-medium mt-0.5 truncate">
            {title}
          </span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Search Shortcut */}
        {user?.role === 'STUDENT' && (
          <button
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors text-xs font-medium"
            onClick={() => navigate('/discover')}
            title="Search restaurants & offers"
          >
            <Search size={14} className="text-slate-400" />
            <span>Search directory...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">⌘K</kbd>
          </button>
        )}

        {/* Search button on small screens */}
        {user?.role === 'STUDENT' && (
          <button
            className="sm:hidden w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors"
            onClick={() => navigate('/discover')}
            title="Search"
          >
            <Search size={16} />
          </button>
        )}

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <Bell size={16} />
          {unreadNotifs > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
          )}
        </button>

        {/* Live Camera Scanner Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs cursor-pointer transition-colors shadow-xs"
          onClick={openScanner}
          title="Open QR Scanner"
        >
          <Camera size={14} />
          <span className="hidden md:inline">Scan Pass</span>
        </button>

        {/* User Avatar & Name */}
        <button
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors ml-1"
          onClick={() => navigate('/profile')}
          title="View Profile"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            className="w-6 h-6 rounded-full object-cover border border-slate-200"
          />
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline truncate max-w-[90px]">
            {(user?.name || 'Scholar').split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
}
