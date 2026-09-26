import { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';

const TABS = ['All Alerts', 'Bookings', 'Campus Deals', 'System'];

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications = [], setNotifications } = useDining() || {};
  const [activeTab, setActiveTab] = useState('All Alerts');

  const markAllRead = () => {
    if (typeof setNotifications === 'function') {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const removeNotification = (id) => {
    if (typeof setNotifications === 'function') {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'Bookings') return n.type === 'booking';
    if (activeTab === 'Campus Deals') return n.type === 'offer';
    if (activeTab === 'System') return n.type === 'system' || n.type === 'reminder';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <CalendarCheck size={18} className="text-emerald-400" />;
      case 'offer':
        return <Tag size={18} className="text-amber-400" />;
      case 'reminder':
        return <Clock size={18} className="text-indigo-400" />;
      default:
        return <ShieldCheck size={18} className="text-sky-400" />;
    }
  };

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="anim-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem, 4.5vw, 1.9rem)', fontWeight: 600, color: '#11120D', margin: '0 0 4px' }}>
            Notification Center
          </h2>
          <p style={{ fontSize: 13, color: '#565449', margin: 0 }}>
            Real-time reservation updates, flash dining deals, and institutional clearance notices.
          </p>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={markAllRead}
          style={{
            borderRadius: 99,
            padding: '7px 16px',
            fontSize: 12,
            fontWeight: 600,
            background: '#FFFFFF',
            border: '1px solid #E8E2D5',
            color: '#11120D',
            touchAction: 'manipulation',
          }}
        >
          <Check size={14} /> Mark all as read
        </button>
      </div>

      {/* Rubber Segment Category Filter */}
      <div style={{ marginBottom: 24, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
        <RubberSegment
          items={TABS.map(t => {
            const count =
              t === 'Bookings'
                ? notifications.filter(n => n.type === 'booking').length
                : t === 'Campus Deals'
                ? notifications.filter(n => n.type === 'offer').length
                : t === 'System'
                ? notifications.filter(n => n.type === 'system' || n.type === 'reminder').length
                : notifications.length;
            return {
              value: t,
              label: count > 0 ? `${t} (${count})` : t
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

      {/* Notifications List */}
      <div className="anim-fade-up delay-2" style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <Bell size={36} className="text-slate-500 mx-auto mb-3" />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t2)' }}>No notifications in this tab</div>
            <div style={{ fontSize: 12, color: 'var(--t4)', marginTop: 4 }}>You're all caught up!</div>
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              className="card notification-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                background: n.read ? 'var(--bg-card)' : 'rgba(79, 70, 229, 0.08)',
                borderLeft: n.read ? '1px solid var(--border)' : '3px solid var(--primary)'
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--r-sm)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--t1)' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--t4)' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.4, marginBottom: 8 }}>
                  {n.body}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {n.type === 'booking' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 0, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}
                      onClick={() => navigate('/bookings')}
                    >
                      View Reservation <ExternalLink size={12} style={{ marginLeft: 3 }} />
                    </button>
                  )}
                  {n.type === 'offer' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 0, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}
                      onClick={() => navigate('/discover')}
                    >
                      Browse Deal <ExternalLink size={12} style={{ marginLeft: 3 }} />
                    </button>
                  )}
                </div>
              </div>

              <button
                className="notification-dismiss-btn"
                onClick={() => removeNotification(n.id)}
                title="Dismiss"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
