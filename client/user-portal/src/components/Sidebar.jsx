import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  LayoutDashboard,
  Compass,
  CalendarDays,
  Bell,
  User,
  LogOut,
  Building2,
  ChefHat,
  ConciergeBell,
  Store,
  Sparkles,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { reservations = [], notifications = [], restaurants = [] } = useDining() || {};

  if (!user) return null;

  const isStudent = user?.role === 'STUDENT' || !user?.role;
  const isAdmin   = user?.role === 'RESTAURANT_ADMIN';
  const isStaff   = user?.role === 'RESTAURANT_STAFF';
  const isSuper   = user?.role === 'SUPER_ADMIN';

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  const activeBookingsCount = safeReservations.filter(b => b?.status === 'CONFIRMED' || b?.status === 'PENDING').length;
  const unreadNotifsCount = safeNotifications.filter(n => !n?.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="sidebar-container"
      style={{
        width: 260,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#0D0E12',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        color: '#FFF',
        zIndex: 50,
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
      }}
    >
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #FF5200 0%, #E02B00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255, 82, 0, 0.35)',
              position: 'relative',
            }}
          >
            <Flame size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                lineHeight: 1.1,
              }}
            >
              DISTRICT<span style={{ color: '#FF5200' }}>@BU</span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.45)',
                fontWeight: 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              Campus Dining
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.35)',
              padding: '0 12px 6px',
            }}
          >
            Discover & Dine
          </div>

          {isStudent && (
            <>
              <NavLink
                to="/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(255, 82, 0, 0.22) 0%, rgba(255, 82, 0, 0.05) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                })}
              >
                <LayoutDashboard size={18} />
                <span style={{ flex: 1 }}>Explore Hotspots</span>
              </NavLink>

              <NavLink
                to="/discover"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(255, 82, 0, 0.22) 0%, rgba(255, 82, 0, 0.05) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                })}
              >
                <Compass size={18} />
                <span style={{ flex: 1 }}>All Outlets</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 99,
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  {safeRestaurants.length}
                </span>
              </NavLink>

              <NavLink
                to="/bookings"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(255, 82, 0, 0.22) 0%, rgba(255, 82, 0, 0.05) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                })}
              >
                <CalendarDays size={18} />
                <span style={{ flex: 1 }}>My Table Passes</span>
                {activeBookingsCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: '#FF5200',
                      color: '#FFFFFF',
                      boxShadow: '0 0 10px rgba(255, 82, 0, 0.5)',
                    }}
                  >
                    {activeBookingsCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/notifications"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(255, 82, 0, 0.22) 0%, rgba(255, 82, 0, 0.05) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                })}
              >
                <Bell size={18} />
                <span style={{ flex: 1 }}>Live Alerts</span>
                {unreadNotifsCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: '#10B981',
                      color: '#FFFFFF',
                    }}
                  >
                    {unreadNotifsCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(255, 82, 0, 0.22) 0%, rgba(255, 82, 0, 0.05) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                })}
              >
                <User size={18} />
                <span style={{ flex: 1 }}>Dining ID & Perks</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/management/admin"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive ? 'rgba(255, 82, 0, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <ChefHat size={18} />
                <span style={{ flex: 1 }}>Outlet Operations</span>
              </NavLink>
              <NavLink
                to="/management/staff"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive ? 'rgba(255, 82, 0, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <ConciergeBell size={18} />
                <span style={{ flex: 1 }}>Live Host Desk</span>
              </NavLink>
              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive ? 'rgba(255, 82, 0, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <User size={18} />
                <span style={{ flex: 1 }}>Profile</span>
              </NavLink>
            </>
          )}

          {isStaff && (
            <>
              <NavLink
                to="/management/staff"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive ? 'rgba(255, 82, 0, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <ConciergeBell size={18} />
                <span style={{ flex: 1 }}>Host Desk</span>
              </NavLink>
              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive ? 'rgba(255, 82, 0, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <User size={18} />
                <span style={{ flex: 1 }}>Profile</span>
              </NavLink>
            </>
          )}

          {isSuper && (
            <>
              <NavLink
                to="/management/superadmin"
                end
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive && !location.search.includes('Restaurants') ? 600 : 500,
                  color: isActive && !location.search.includes('Restaurants') ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive && !location.search.includes('Restaurants') ? 'rgba(255, 82, 0, 0.15)' : 'transparent',
                  borderLeft: isActive && !location.search.includes('Restaurants') ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <Building2 size={18} />
                <span style={{ flex: 1 }}>Platform Governance</span>
              </NavLink>
              <NavLink
                to="/management/superadmin?tab=Restaurants"
                style={() => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? 600 : 500,
                  color: location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? 'rgba(255, 82, 0, 0.15)' : 'transparent',
                  borderLeft: location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <Store size={18} />
                <span style={{ flex: 1 }}>Manage Outlets</span>
                {safeRestaurants.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {safeRestaurants.length}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  background: isActive ? 'rgba(255, 82, 0, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #FF5200' : '3px solid transparent',
                  textDecoration: 'none',
                })}
              >
                <User size={18} />
                <span style={{ flex: 1 }}>Profile</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Profile & VIP Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* VIP Dining Badge Card */}
        <div
          style={{
            padding: '14px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              objectFit: 'cover',
              border: '1.5px solid rgba(255, 82, 0, 0.5)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || 'Bennett Scholar'}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#FF5200',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 2,
                fontWeight: 500,
              }}
            >
              <ShieldCheck size={12} />
              <span>Campus Verified</span>
            </div>
          </div>
        </div>

        {/* Sign Out Action */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#EF4444';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={16} />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>
  );
}
