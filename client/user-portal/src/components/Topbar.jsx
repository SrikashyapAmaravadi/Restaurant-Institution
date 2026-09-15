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
  UtensilsCrossed,
  Bell,
  Sparkles,
} from 'lucide-react';
import DistrictSearchModal from './DistrictSearchModal';

const CAMPUS_NAV_TABS = [
  { id: 'home', label: 'Home', path: '/dashboard' },
  { id: 'dining', label: 'Dining Outlets', path: '/discover', activeHighlight: true },
  { id: 'passes', label: 'Table Passes', path: '/bookings' },
  { id: 'cafes', label: 'Cafeteria & Cafes', path: '/discover?tag=Cafeteria' },
  { id: 'deals', label: 'Student Perks', path: '/discover?offers=true' },
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
          height: 74,
          padding: '0 clamp(16px, 3.5vw, 40px)',
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
        {/* Left: Brand Identity + Campus Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Mobile Drawer Trigger */}
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

          {/* Dine@Bennett Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
              }}
            >
              <UtensilsCrossed size={20} strokeWidth={2.4} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#0F172A',
                }}
              >
                Dine<span style={{ color: '#E11D48' }}>@Bennett</span>
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                Campus Dining
              </span>
            </div>
          </div>

          {/* Campus Location Pill */}
          <div
            onClick={() => navigate('/discover')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '6px 12px',
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
              <MapPin size={18} strokeWidth={2.4} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  Bennett University
                </span>
                <ChevronDown size={13} color="#64748B" />
              </div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                TechZone II · Greater Noida
              </span>
            </div>
          </div>
        </div>

        {/* Center: Campus Navigation Tabs */}
        <nav
          className="mobile-hide"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {CAMPUS_NAV_TABS.map(tab => {
            const isActive = pathname === tab.path || (tab.activeHighlight && pathname === '/dashboard');
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#475569',
                  background: isActive ? '#FFE4E6' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = '#F1F5F9';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search + Notifications + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Search Trigger */}
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
            title="Search dishes or outlets"
          >
            <Search size={18} strokeWidth={2.2} />
          </button>

          {/* Alerts */}
          <button
            onClick={() => navigate('/notifications')}
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
              color: '#475569',
              position: 'relative',
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifs > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 9,
                  right: 9,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#E11D48',
                  border: '2px solid #FFF',
                }}
              />
            )}
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

      {/* Campus Search Modal Overlay */}
      <DistrictSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
