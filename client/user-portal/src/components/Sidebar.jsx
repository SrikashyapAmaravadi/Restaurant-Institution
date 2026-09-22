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
  UtensilsCrossed,
  ShieldCheck,
  Flame,
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
    <aside className="app-sidebar">
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* District Brand (Light Theme) */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 24,
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
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#64748B',
              textTransform: 'uppercase',
              marginTop: 3,
            }}
          >
            CAMPUS DINING
          </span>
        </div>

        {/* Navigation Items (District Light Style) */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#94A3B8',
              padding: '0 12px 6px',
            }}
          >
            Menu
          </div>

          {isStudent && (
            <>
              <NavLink
                to="/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <LayoutDashboard size={18} />
                <span style={{ flex: 1 }}>Dining Home</span>
              </NavLink>

              <NavLink
                to="/discover"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <Compass size={18} />
                <span style={{ flex: 1 }}>Explore Outlets</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: '#F1F5F9',
                    color: '#475569',
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
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <CalendarDays size={18} />
                <span style={{ flex: 1 }}>Reservations</span>
                {activeBookingsCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: '#E11D48',
                      color: '#FFFFFF',
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
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <Bell size={18} />
                <span style={{ flex: 1 }}>Updates</span>
                {unreadNotifsCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: '#059669',
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
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <User size={18} />
                <span style={{ flex: 1 }}>Profile & Perks</span>
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
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <ChefHat size={18} />
                <span style={{ flex: 1 }}>Outlet Manager</span>
              </NavLink>
              <NavLink
                to="/management/staff"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
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
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
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
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
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
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
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
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive && !location.search.includes('Restaurants') ? 700 : 500,
                  color: isActive && !location.search.includes('Restaurants') ? '#BE185D' : '#334155',
                  background: isActive && !location.search.includes('Restaurants') ? '#FFE4E6' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Building2 size={18} />
                <span style={{ flex: 1 }}>Governance</span>
              </NavLink>
              <NavLink
                to="/management/superadmin?tab=Restaurants"
                style={() => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? 700 : 500,
                  color: location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? '#BE185D' : '#334155',
                  background: location.pathname === '/management/superadmin' && location.search.includes('Restaurants') ? '#FFE4E6' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Store size={18} />
                <span style={{ flex: 1 }}>Manage Outlets</span>
              </NavLink>
              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#BE185D' : '#334155',
                  background: isActive ? '#FFE4E6' : 'transparent',
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

      {/* Bottom User Card (100% Light Theme) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 16,
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid #CBD5E1',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#0F172A',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || 'Scholar'}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
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
            justifyContent: 'center',
            gap: 8,
            padding: '9px 14px',
            borderRadius: 99,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#DC2626';
            e.currentTarget.style.borderColor = '#FECACA';
            e.currentTarget.style.background = '#FEF2F2';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#64748B';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.background = '#FFFFFF';
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
