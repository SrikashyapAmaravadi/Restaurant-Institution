import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Bell,
  Search,
  MapPin,
  Menu,
  Camera,
} from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':             'Home',
  '/discover':              'Discover',
  '/bookings':              'Reservations',
  '/notifications':         'Notifications',
  '/profile':               'Profile',
  '/restaurant':            'Restaurant',
  '/management/admin':      'Operations',
  '/management/staff':      'Host Desk',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>Dine@Bennett</span>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/login')}
        >
          Sign In
        </button>
      </header>
    );
  }

  return (
    <header className="topbar">
      {/* Left: menu + page context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <button
          className="mobile-menu-trigger"
          style={{
            width: 36, height: 36,
            borderRadius: 8,
            border: '1px solid #EEE',
            background: '#FFF',
            color: '#555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={onOpenMobileDrawer}
          aria-label="Toggle mobile menu"
        >
          <Menu size={17} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', lineHeight: 1.2 }}>
            {title}
          </span>
          <button
            onClick={() => navigate('/discover')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: '#888', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              marginTop: 1,
            }}
          >
            <MapPin size={10} color="#FF5200" />
            <span>Bennett Campus</span>
          </button>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Search */}
        {(user?.role === 'STUDENT' || !user?.role) && (
          <button
            style={{
              width: 36, height: 36,
              borderRadius: 8,
              border: '1px solid #EEE',
              background: '#FFF',
              color: '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/discover')}
            title="Search"
          >
            <Search size={16} />
          </button>
        )}

        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            width: 36, height: 36,
            borderRadius: 8,
            border: '1px solid #EEE',
            background: '#FFF',
            color: '#888',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <Bell size={16} />
          {unreadNotifs > 0 && (
            <span style={{
              position: 'absolute', top: 7, right: 7,
              width: 6, height: 6, borderRadius: '50%',
              background: '#FF5200', border: '1.5px solid #FFF',
            }} />
          )}
        </button>

        {/* Scanner */}
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 14px',
            height: 36,
            borderRadius: 8,
            background: '#111',
            color: '#FFF',
            border: 'none',
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={openScanner}
          title="Open QR Scanner"
        >
          <Camera size={14} />
          <span className="mobile-hide">Scan</span>
        </button>

        {/* Avatar */}
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '3px 10px 3px 3px',
            borderRadius: 99,
            border: '1px solid #EEE',
            background: '#FFF',
            cursor: 'pointer',
            marginLeft: 2,
          }}
          onClick={() => navigate('/profile')}
          title="Profile"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span className="mobile-hide" style={{ fontSize: 12, fontWeight: 500, color: '#333', maxWidth: 80, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {(user?.name || 'User').split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
}
