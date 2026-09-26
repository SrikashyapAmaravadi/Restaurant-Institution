import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDining } from '../context/DiningContext';
import RubberSegment from '../components/RubberSegment';
import {
  Bell,
  CalendarCheck,
  Tag,
  Clock,
  ShieldCheck,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  Receipt,
  UtensilsCrossed,
  CheckCircle2,
  Inbox,
  Filter,
  ArrowRight,
  Circle
} from 'lucide-react';

const TABS = [
  { id: 'All Alerts', label: 'All Alerts' },
  { id: 'Bookings', label: 'Bookings' },
  { id: 'Campus Deals', label: 'Campus Deals' },
  { id: 'System', label: 'System' }
];

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications = [], setNotifications } = useDining() || {};
  const [activeTab, setActiveTab] = useState('All Alerts');

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const markAllRead = () => {
    if (typeof setNotifications === 'function') {
      setNotifications(prev => (Array.isArray(prev) ? prev.map(n => ({ ...n, read: true })) : []));
    }
  };

  const removeNotification = (id) => {
    if (typeof setNotifications === 'function') {
      setNotifications(prev => (Array.isArray(prev) ? prev.filter(n => n.id !== id) : []));
    }
  };

  const clearAllNotifications = () => {
    if (window.confirm('Clear all notifications?')) {
      if (typeof setNotifications === 'function') {
        setNotifications([]);
      }
    }
  };

  const filtered = useMemo(() => {
    return safeNotifications.filter(n => {
      if (activeTab === 'Bookings') return n.type === 'booking';
      if (activeTab === 'Campus Deals') return n.type === 'offer';
      if (activeTab === 'System') return n.type === 'system' || n.type === 'reminder';
      return true;
    });
  }, [safeNotifications, activeTab]);

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'booking':
        return <CalendarCheck size={17} color="#11120D" />;
      case 'offer':
        return <Tag size={17} color="#565449" />;
      case 'reminder':
        return <Clock size={17} color="#565449" />;
      default:
        return <ShieldCheck size={17} color="#11120D" />;
    }
  };

  const formatTimestamp = (rawTime) => {
    if (!rawTime) return 'Just now';
    try {
      const d = new Date(rawTime);
      if (isNaN(d.getTime())) return String(rawTime);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(rawTime);
    }
  };

  return (
    <div
      className="page-pad pb-24"
      style={{
        maxWidth: 920,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* ── 1. Page Header ── */}
      <div
        className="anim-fade-up"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          paddingBottom: 4,
          borderBottom: '1px solid #E8E2D5',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1
              style={{
                fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.7rem, 4.5vw, 2.2rem)',
                fontWeight: 600,
                color: '#11120D',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 99,
                  background: '#11120D',
                  color: '#FFFBF4',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 8px rgba(17, 18, 13, 0.12)',
                }}
              >
                <Sparkles size={11} color="#FFFBF4" />
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#565449', margin: 0, lineHeight: 1.5 }}>
            Real-time reservation updates, flash dining deals, and institutional clearance notices.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              style={{
                borderRadius: 99,
                padding: '8px 18px',
                fontSize: 12.5,
                fontWeight: 600,
                background: '#11120D',
                border: '1px solid #11120D',
                color: '#FFFBF4',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(17, 18, 13, 0.10)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#25261F';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#11120D';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Check size={14} /> Mark all read
            </button>
          )}

          {safeNotifications.length > 0 && (
            <button
              type="button"
              onClick={clearAllNotifications}
              style={{
                borderRadius: 99,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 500,
                background: '#FFFFFF',
                border: '1px solid #E8E2D5',
                color: '#565449',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#11120D';
                e.currentTarget.style.color = '#11120D';
                e.currentTarget.style.background = '#F6F2EA';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E8E2D5';
                e.currentTarget.style.color = '#565449';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              title="Clear all notifications"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Category Filter Switcher ── */}
      <div
        className="anim-fade-up delay-1"
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          paddingBottom: 2,
        }}
      >
        <RubberSegment
          items={TABS.map(t => {
            const count =
              t.id === 'Bookings'
                ? safeNotifications.filter(n => n.type === 'booking').length
                : t.id === 'Campus Deals'
                ? safeNotifications.filter(n => n.type === 'offer').length
                : t.id === 'System'
                ? safeNotifications.filter(n => n.type === 'system' || n.type === 'reminder').length
                : safeNotifications.length;
            return {
              value: t.id,
              label: count > 0 ? `${t.label} (${count})` : t.label
            };
          })}
          value={activeTab}
          onChange={(val) => setActiveTab(val)}
          trackColor="#F6F2EA"
          thumbColor="#11120D"
          textColor="#565449"
          activeTextColor="#FFFBF4"
          size="md"
          radius={99}
          inset={3}
          equalSlots={false}
          aria-label="Notification categories"
        />
      </div>

      {/* ── 3. Notification Cards List ── */}
      <div
        className="anim-fade-up delay-2"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {filtered.length === 0 ? (
          /* Empty State */
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E2D5',
              borderRadius: 20,
              padding: '56px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 10px rgba(17, 18, 13, 0.03)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#F6F2EA',
                border: '1px solid #D8CFBC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#565449',
                marginBottom: 16,
              }}
            >
              <Inbox size={24} />
            </div>

            <h3
              style={{
                fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                fontSize: 20,
                fontWeight: 600,
                color: '#11120D',
                margin: '0 0 6px',
              }}
            >
              No alerts in "{activeTab}"
            </h3>

            <p style={{ fontSize: 13, color: '#565449', maxWidth: 400, margin: '0 0 20px', lineHeight: 1.5 }}>
              You're all caught up! New reservation updates, digital pass check-ins, and exclusive deals will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: 99,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Explore Campus Outlets</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          filtered.map(n => {
            const isUnread = !n.read;
            return (
              <div
                key={n.id}
                style={{
                  position: 'relative',
                  background: isUnread ? '#FFFFFF' : '#F6F2EA',
                  border: `1px solid ${isUnread ? '#11120D' : '#E8E2D5'}`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  boxShadow: isUnread
                    ? '0 6px 20px rgba(17, 18, 13, 0.06)'
                    : '0 1px 3px rgba(17, 18, 13, 0.02)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Left Type Icon Box */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: isUnread ? '#F6F2EA' : '#FFFFFF',
                    border: `1px solid ${isUnread ? '#D8CFBC' : '#E8E2D5'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {getCategoryIcon(n.type)}
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4
                        style={{
                          fontSize: 15,
                          fontWeight: isUnread ? 700 : 600,
                          color: '#11120D',
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {n.title}
                      </h4>
                      {isUnread && (
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            background: '#11120D',
                            color: '#FFFBF4',
                            padding: '1.5px 7px',
                            borderRadius: 99,
                            flexShrink: 0,
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: 11, fontWeight: 500, color: '#757367' }}>
                      {formatTimestamp(n.createdAt)}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: isUnread ? '#11120D' : '#565449',
                      lineHeight: 1.5,
                      margin: '0 0 10px',
                      wordBreak: 'break-word',
                    }}
                  >
                    {n.body}
                  </p>

                  {/* Contextual Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {n.type === 'booking' && (
                      <button
                        type="button"
                        onClick={() => navigate('/bookings')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#11120D',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          textDecoration: 'underline',
                        }}
                      >
                        <span>View Pass &amp; Details</span>
                        <ExternalLink size={12} />
                      </button>
                    )}

                    {n.type === 'offer' && (
                      <button
                        type="button"
                        onClick={() => navigate('/discover')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#11120D',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          textDecoration: 'underline',
                        }}
                      >
                        <span>Explore Campus Deal</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dismiss Action Button */}
                <button
                  type="button"
                  onClick={() => removeNotification(n.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'transparent',
                    border: '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#757367',
                    flexShrink: 0,
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#FEF2F2';
                    e.currentTarget.style.borderColor = '#FECACA';
                    e.currentTarget.style.color = '#B91C1C';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = '#757367';
                  }}
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
