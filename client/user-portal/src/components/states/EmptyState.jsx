import { Inbox, ArrowRight } from 'lucide-react';

/**
 * Standardized EmptyState Component
 * Displays when lists (bookings, favorites, notifications, etc.) have no data.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  badge = 'No Data',
  title = 'Nothing here yet',
  description = 'When new items are created or available, they will appear in this space.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = ArrowRight,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`card empty-state-card anim-fade-in ${className}`}
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-sm)',
        ...style
      }}
    >
      {/* Icon Circle */}
      <div
        className="empty-state-icon-circle"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--primary-subtle)',
          border: '1.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          marginBottom: 18,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Icon size={28} />
      </div>

      {badge && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent)',
            background: 'var(--accent-subtle)',
            border: '1px solid rgba(197, 168, 128, 0.2)',
            padding: '3px 10px',
            borderRadius: 'var(--r-full)',
            marginBottom: 12
          }}
        >
          {badge}
        </span>
      )}

      <h3
        className="font-display"
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--t1)',
          marginBottom: 8,
          maxWidth: 380
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 13.5,
          color: 'var(--t3)',
          lineHeight: 1.6,
          maxWidth: 360,
          marginBottom: onAction ? 24 : 0
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary btn-md cursor-pointer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span>{actionLabel}</span>
          {ActionIcon && <ActionIcon size={15} />}
        </button>
      )}
    </div>
  );
}
