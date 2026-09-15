import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Search,
  MapPin,
  Menu,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import DistrictSearchModal from './DistrictSearchModal';

const DISTRICT_NAV_TABS = [
  { id: 'foryou', label: 'For you', path: '/dashboard' },
  { id: 'dining', label: 'Dining', path: '/dashboard' },
  { id: 'outlets', label: 'Outlets', path: '/discover' },
  { id: 'passes', label: 'Passes', path: '/bookings' },
  { id: 'cafeteria', label: 'Cafeteria', path: '/discover?tag=Cafeteria' },
  { id: 'events', label: 'Events', path: '/notifications' },
];

export default function Topbar({ onOpenMobileDrawer }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications = [] } = useDining() || {};
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const unreadNotifs = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

  return (
    <>
      <header
        style={{
          height: 72,
          padding: '0 clamp(16px, 3vw, 36px)',
          background: '#FFFFFF',
          borderBottom: '1px solid #EEF0F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: District Logo + Location Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Mobile Menu Trigger */}
          <button
            className="mobile-menu-trigger"
            onClick={onOpenMobileDrawer}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0F172A',
            }}
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>

          {/* District Logo (Exact Screenshot 1 Style) */}
          <div
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: '#000000',
                lineHeight: 1,
              }}
            >
              district
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: '#475569',
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              BY BENNETT
            </span>
          </div>

          {/* District Location Picker (Purple Pin + City/Area) */}
          <div
            onClick={() => navigate('/discover')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 8,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div
              style={{
                color: '#6D28D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={19} strokeWidth={2.4} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  Bennett Campus
                </span>
                <ChevronDown size={13} color="#64748B" />
              </div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                Greater Noida
              </span>
            </div>
          </div>
        </div>

        {/* Center: Top Category Tabs (Screenshot 1: "For you", "Dining" pill, "Movies"...) */}
        <nav
          className="mobile-hide"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {DISTRICT_NAV_TABS.map(tab => {
            const isDining = tab.id === 'dining';
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isDining ? 700 : 500,
                  color: isDining ? '#BE185D' : '#334155',
                  background: isDining ? '#FFE4E6' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isDining) e.currentTarget.style.background = '#F1F5F9';
                }}
                onMouseLeave={e => {
                  if (!isDining) e.currentTarget.style.background = 'transparent';
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search Icon Button + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Search Trigger (Opens District Search Modal) */}
          <button
            onClick={() => setSearchModalOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6D28D9',
              transition: 'background 0.15s ease',
            }}
            title="Search restaurants"
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
          >
            <Search size={19} strokeWidth={2.2} />
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => navigate('/profile')}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              border: '1.5px solid #CBD5E1',
            }}
            title={user?.name || 'Profile'}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <UserIcon size={20} color="#64748B" />
            )}
          </div>
        </div>
      </header>

      {/* District Search Modal Overlay */}
      <DistrictSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
