import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Search,
  MapPin,
  Menu,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import NivixSearchModal from './NivixSearchModal';

export default function Topbar({ onOpenMobileDrawer }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications = [] } = useDining() || {};
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const unreadNotifs = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;
  const homeUrl = user?.role === 'SUPER_ADMIN'
    ? '/management/superadmin'
    : (user?.role === 'RESTAURANT_ADMIN' || user?.role === 'RESTAURANT_STAFF')
    ? '/management/admin'
    : '/discover';

  return (
    <>
      <header
        style={{
          height: 68,
          padding: '0 clamp(12px, 3vw, 36px)',
          background: 'rgba(255, 251, 244, 0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E8E2D5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: District Logo + Location Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2.5vw, 20px)' }}>
          {/* Mobile Menu Trigger */}
          <button
            className="mobile-menu-trigger"
            onClick={onOpenMobileDrawer}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid #E8E2D5',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#11120D',
              flexShrink: 0,
            }}
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>

          {/* Logo — Nivix Dine-In (Mobile only to avoid desktop sidebar duplication) */}
          <div
            className="topbar-logo-mobile"
            onClick={() => navigate(homeUrl)}
            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', flexShrink: 0 }}
          >
            <span
              style={{
                fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                fontSize: 'clamp(19px, 4.5vw, 23px)',
                fontWeight: 600,
                fontStyle: 'italic',
                letterSpacing: '-0.02em',
                color: '#11120D',
                lineHeight: 1.05,
              }}
            >
              nivix-dine-in
            </span>
            <span
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#A3A3A3',
                textTransform: 'uppercase',
                marginTop: 3,
              }}
            >
              CAMPUS DINING · BENNETT
            </span>
          </div>

          {/* Location Picker with Responsive Text */}
          <div
            className="header-location-pill"
            onClick={() => navigate(homeUrl)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #E8E2D5',
              background: '#FFFFFF',
              transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              flexShrink: 0,
            }}
            title="Bennett Campus, Greater Noida"
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#11120D';
              e.currentTarget.style.transform = 'translateY(-1.5px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(17, 18, 13, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E8E2D5';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <MapPin size={15} color="#565449" />
            <div className="header-location-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#11120D' }}>
                  Bennett Campus
                </span>
                <ChevronDown size={12} color="#565449" />
              </div>
              <span style={{ fontSize: 10.5, color: '#A3A3A3', fontWeight: 500 }}>
                Greater Noida
              </span>
            </div>
          </div>
        </div>

        {/* Right: Search Button + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search Trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid #E8E2D5',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#11120D',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            title="Search restaurants"
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#11120D';
              e.currentTarget.style.background = '#F6F2EA';
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 18, 13, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E8E2D5';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'scale(1.0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Search size={16} />
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => navigate('/profile')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#F6F2EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              border: '1px solid #E8E2D5',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            title={user?.name || 'Profile'}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#11120D';
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 18, 13, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E8E2D5';
              e.currentTarget.style.transform = 'scale(1.0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <UserIcon size={18} color="#11120D" />
            )}
          </div>
        </div>
      </header>

      {/* Nivix Search Modal Overlay */}
      <NivixSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
