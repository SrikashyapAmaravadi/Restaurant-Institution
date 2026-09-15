import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Bell,
  Search,
  MapPin,
  Menu,
  Camera,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':             'Explore Hotspots',
  '/discover':              'All Campus Outlets',
  '/bookings':              'My Table Passes',
  '/notifications':         'Campus Alerts',
  '/profile':               'Dining ID & Perks',
  '/restaurant':            'Restaurant Profile',
  '/management/admin':      'Outlet Operations',
  '/management/staff':      'Live Host Desk',
  '/management/superadmin': 'Platform Governance',
};

export default function Topbar({ onOpenMobileDrawer }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications = [], openScanner, restaurants = [] } = useDining() || {};

  const unreadNotifs = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'District@BU';
  const openOutletsCount = Array.isArray(restaurants) ? restaurants.filter(r => r.isOpen !== false).length : 8;

  if (!user) {
    return (
      <header
        style={{
          height: 64,
          padding: '0 24px',
          background: '#0D0E12',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: '#FFF',
            }}
          >
            DISTRICT<span style={{ color: '#FF5200' }}>@BU</span>
          </span>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/login')}
          style={{ borderRadius: 99, padding: '8px 20px' }}
        >
          Sign In
        </button>
      </header>
    );
  }

  return (
    <header
      style={{
        height: 68,
        padding: '0 28px',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #EBE7E2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Mobile Drawer Trigger + Location Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className="mobile-menu-trigger"
          onClick={onOpenMobileDrawer}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: '1px solid #E4E0DB',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1A1A1A',
          }}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        {/* District Location Selector */}
        <div
          onClick={() => navigate('/discover')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 14px',
            borderRadius: 99,
            background: '#F5F3F0',
            border: '1px solid #EAE6E1',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          title="Campus Zone"
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#FF5200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MapPin size={13} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1A1A1A',
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1.1,
                }}
              >
                Bennett University
              </span>
              <ChevronDown size={13} color="#666" />
            </div>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
              ● {openOutletsCount} Outlets Serving Now
            </span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar Pill */}
      {(user?.role === 'STUDENT' || !user?.role) && (
        <div
          onClick={() => navigate('/discover')}
          className="mobile-hide"
          style={{
            flex: '0 1 420px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 18px',
            borderRadius: 99,
            background: '#FFFFFF',
            border: '1.5px solid #E5E1DB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#FF5200';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 82, 0, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#E5E1DB';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
          }}
        >
          <Search size={16} color="#888" />
          <span style={{ fontSize: 13, color: '#999', flex: 1, fontWeight: 400 }}>
            Search cafés, thalis, pizza, shakes...
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#888',
              background: '#F4F1ED',
              padding: '3px 7px',
              borderRadius: 6,
              border: '1px solid #E5E0DA',
            }}
          >
            ⌘K
          </span>
        </div>
      )}

      {/* Right: Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Alerts Button */}
        <button
          onClick={() => navigate('/notifications')}
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 99,
            border: '1px solid #E5E1DB',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#333',
            transition: 'all 0.15s ease',
          }}
          title="Alerts"
        >
          <Bell size={18} />
          {unreadNotifs > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FF5200',
                border: '2px solid #FFF',
              }}
            />
          )}
        </button>

        {/* Scan / Host Button */}
        <button
          onClick={openScanner}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 18px',
            borderRadius: 99,
            background: '#0D0E12',
            color: '#FFFFFF',
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#222';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#0D0E12';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Camera size={15} color="#FF5200" />
          <span className="mobile-hide">QR Pass</span>
        </button>

        {/* User Avatar Pill */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px 4px 4px',
            borderRadius: 99,
            background: '#F5F3F0',
            border: '1px solid #E5E1DB',
            cursor: 'pointer',
          }}
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <span
            className="mobile-hide"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: '#1A1A1A',
              maxWidth: 90,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {(user?.name || 'Scholar').split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
