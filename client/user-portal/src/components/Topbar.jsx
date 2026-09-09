import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Bell,
  Search,
  MapPin,
  ChevronDown,
  Sparkles,
  Zap,
  Menu,
  Shield,
  ChefHat,
  ConciergeBell,
  GraduationCap,
  Leaf,
  Camera,
  QrCode
} from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':             'Farm-To-Table Dining',
  '/discover':              'Explore & Map',
  '/bookings':              'My Passes & Bookings',
  '/notifications':         'Dining Alerts',
  '/profile':               'Profile & Pass',
  '/restaurant':            'Venue Experience',
  '/management/admin':      'Restaurant Admin',
  '/management/staff':      'Host Desk Scanner',
  '/management/superadmin': 'Super Admin Governance',
};

export default function Topbar({ onOpenMobileDrawer }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications = [], openScanner } = useDining() || {};

  const unreadNotifs = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'lora';

  if (!user) {
    return (
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Leaf size={22} style={{ color: 'var(--accent)' }} />
          <h1 className="topbar-title font-display" style={{ color: 'var(--t1)', fontSize: '1.25rem' }}>lora · Bennett Dining</h1>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </header>
    );
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin Governance';
      case 'RESTAURANT_ADMIN': return 'Restaurant Owner';
      case 'RESTAURANT_STAFF': return 'Host Desk Staff';
      case 'STUDENT':
      default: return 'Student Scholar';
    }
  };

  return (
    <header className="topbar" style={{ gap: 12, flexWrap: 'wrap' }}>
      {/* Left: Mobile Drawer Button + Location / Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <button
          className="icon-btn mobile-menu-trigger"
          onClick={onOpenMobileDrawer}
          title="Open Menu"
          aria-label="Toggle mobile menu"
        >
          <Menu size={18} />
        </button>

        <div>
          {/* District Location Switcher Bar */}
          <div
            className="district-location-bar"
            onClick={() => navigate('/discover')}
            title="Switch dining zone"
          >
            <MapPin size={13} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
              Bennett TechZone II
            </span>
            <ChevronDown size={12} style={{ color: 'var(--t3)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>{title}</span>
            <span style={{ fontSize: 10, color: 'var(--border)' }}>•</span>
            <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 700 }}>
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Search, Notifications & Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {user?.role === 'STUDENT' && (
          <>
            <button
              className="icon-btn"
              onClick={() => navigate('/discover')}
              title="Search restaurants, dishes & deals"
            >
              <Search size={16} />
            </button>

            <button
              className="icon-btn"
              onClick={() => navigate('/notifications')}
              title="Notifications"
              style={{ position: 'relative' }}
            >
              <Bell size={16} />
              {unreadNotifs > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--error)',
                    boxShadow: '0 0 6px var(--error)'
                  }}
                />
              )}
            </button>
          </>
        )}

        {/* Quick Camera Scanner for Digital Pass */}
        <button
          type="button"
          className="icon-btn"
          onClick={openScanner}
          title="Scan Digital Pass (Live Camera)"
          style={{ color: '#54C030', background: 'rgba(111, 175, 61, 0.12)', border: '1px solid rgba(111, 175, 61, 0.3)' }}
        >
          <Camera size={16} />
        </button>

        {/* User Pill / Hologram Avatar */}
        <button
          className="topbar-avatar-btn"
          onClick={() => navigate('/profile')}
          title="View Digital Student Pass"
          style={{
            padding: '4px 10px 4px 5px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer'
          }}
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--district-pink)' }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
            {(user?.name || 'Scholar').split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
}
