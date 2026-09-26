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

  const navLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '9px 14px',
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#FFFBF4' : '#565449',
    background: isActive ? '#11120D' : 'transparent',
    border: `1px solid ${isActive ? '#11120D' : 'transparent'}`,
    textDecoration: 'none',
    transition: 'all 0.18s ease',
  });

  return (
    <aside className="app-sidebar" style={{ background: '#FFFFFF', borderRight: '1px solid #E8E2D5' }}>
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {/* Brand — Nivix Dine-In */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            padding: '2px 4px',
          }}
        >
          <span
            style={{
              fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
              fontSize: 25,
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
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#565449',
              textTransform: 'uppercase',
              marginTop: 5,
            }}
          >
            CAMPUS DINING · BENNETT
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#A1A1AA',
              padding: '0 8px 6px',
            }}
          >
            Menu
          </div>

          {isStudent && (
            <>
              <NavLink to="/dashboard" style={({ isActive }) => navLinkStyle(isActive)}>
                <LayoutDashboard size={17} />
                <span style={{ flex: 1 }}>Dining Home</span>
              </NavLink>

              <NavLink to="/discover" style={({ isActive }) => navLinkStyle(isActive)}>
                <Compass size={17} />
                <span style={{ flex: 1 }}>Explore Outlets</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: 99,
                    background: '#F4F4F5',
                    color: '#52525B',
                    border: '1px solid #E4E4E7',
                  }}
                >
                  {safeRestaurants.length}
                </span>
              </NavLink>

              <NavLink to="/bookings" style={({ isActive }) => navLinkStyle(isActive)}>
                <CalendarDays size={17} />
                <span style={{ flex: 1 }}>Reservations</span>
                {activeBookingsCount > 0 && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 99,
                      background: '#11120D',
                      color: '#FFFBF4',
                    }}
                  >
                    {activeBookingsCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/notifications" style={({ isActive }) => navLinkStyle(isActive)}>
                <Bell size={17} />
                <span style={{ flex: 1 }}>Updates</span>
                {unreadNotifsCount > 0 && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 99,
                      background: '#11120D',
                      color: '#FFFBF4',
                    }}
                  >
                    {unreadNotifsCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/profile" style={({ isActive }) => navLinkStyle(isActive)}>
                <User size={17} />
                <span style={{ flex: 1 }}>Profile & Perks</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink to="/management/admin" style={({ isActive }) => navLinkStyle(isActive)}>
                <ChefHat size={17} />
                <span style={{ flex: 1 }}>Outlet Manager</span>
              </NavLink>
              <NavLink to="/management/staff" style={({ isActive }) => navLinkStyle(isActive)}>
                <ConciergeBell size={17} />
                <span style={{ flex: 1 }}>Host Desk</span>
              </NavLink>
              <NavLink to="/profile" style={({ isActive }) => navLinkStyle(isActive)}>
                <User size={17} />
                <span style={{ flex: 1 }}>Profile</span>
              </NavLink>
            </>
          )}

          {isStaff && (
            <>
              <NavLink to="/management/staff" style={({ isActive }) => navLinkStyle(isActive)}>
                <ConciergeBell size={17} />
                <span style={{ flex: 1 }}>Host Desk</span>
              </NavLink>
              <NavLink to="/profile" style={({ isActive }) => navLinkStyle(isActive)}>
                <User size={17} />
                <span style={{ flex: 1 }}>Profile</span>
              </NavLink>
            </>
          )}

          {isSuper && (
            <>
              <NavLink
                to="/management/superadmin"
                end
                style={({ isActive }) =>
                  navLinkStyle(isActive && !location.search.includes('Restaurants'))
                }
              >
                <Building2 size={17} />
                <span style={{ flex: 1 }}>Governance</span>
              </NavLink>
              <NavLink
                to="/management/superadmin?tab=Restaurants"
                style={() =>
                  navLinkStyle(
                    location.pathname === '/management/superadmin' &&
                      location.search.includes('Restaurants')
                  )
                }
              >
                <Store size={17} />
                <span style={{ flex: 1 }}>Manage Outlets</span>
              </NavLink>
              <NavLink to="/profile" style={({ isActive }) => navLinkStyle(isActive)}>
                <User size={17} />
                <span style={{ flex: 1 }}>Profile</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Bottom User Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#F6F2EA',
            border: '1px solid #E8E2D5',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid #D8CFBC',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#11120D',
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
                color: '#565449',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 500,
              }}
            >
              <ShieldCheck size={12} color="#565449" />
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
            padding: '8px 12px',
            borderRadius: 8,
            background: '#FFFFFF',
            border: '1px solid #E8E2D5',
            color: '#565449',
            fontSize: 12.5,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#11120D';
            e.currentTarget.style.borderColor = '#11120D';
            e.currentTarget.style.background = '#F6F2EA';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#565449';
            e.currentTarget.style.borderColor = '#E8E2D5';
            e.currentTarget.style.background = '#FFFFFF';
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
