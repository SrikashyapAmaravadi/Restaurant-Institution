import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Standardized SuccessState Component
 * Displays confirmation for completed bookings, account verification, or administrative actions.
 */
export default function SuccessState({
  title = 'Action Completed Successfully',
  description = 'Your request has been processed and confirmed by the institution.',
  referenceCode,
  referenceLabel = 'Reference Code',
  details = [],
  actionLabel = 'Continue',
  actionPath = '/dashboard',
  onAction,
  secondaryLabel,
  secondaryPath,
  onSecondary,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`card anim-scale-in ${className}`}
      style={{
        maxWidth: 480,
        margin: '30px auto',
        padding: '38px 28px',
        textAlign: 'center',
        background: '#FFFFFF',
        border: '1px solid #A7F3D0',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-md)',
        ...style
      }}
    >
      {/* Icon Circle */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#ECFDF5',
          border: '2px solid #A7F3D0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#059669',
          margin: '0 auto 18px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <CheckCircle2 size={32} />
      </div>

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#059669',
          background: '#ECFDF5',
          padding: '3px 10px',
          borderRadius: 'var(--r-full)',
          display: 'inline-block',
          marginBottom: 12
        }}
      >
        Confirmed & Verified
      </span>

      <h3
        className="font-display"
        style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: 'var(--t1)',
          marginBottom: 8
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 13.5,
          color: 'var(--t3)',
          lineHeight: 1.6,
          maxWidth: 380,
          margin: '0 auto 20px'
        }}
      >
        {description}
      </p>

      {/* Reference Code Card (if available) */}
      {referenceCode && (
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '12px 16px',
            marginBottom: 20,
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span style={{ fontSize: 10.5, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
            {referenceLabel}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
            {referenceCode}
          </span>
        </div>
      )}

      {/* Details List (if provided) */}
      {details && details.length > 0 && (
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '12px 16px',
            textAlign: 'left',
            marginBottom: 24,
            fontSize: 12.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          {details.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ color: 'var(--t4)' }}>{item.label}</span>
              <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="btn btn-primary btn-md cursor-pointer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span>{actionLabel}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <Link
            to={actionPath}
            className="btn btn-primary btn-md cursor-pointer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span>{actionLabel}</span>
            <ArrowRight size={14} />
          </Link>
        )}

        {secondaryLabel && (
          onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="btn btn-secondary btn-md cursor-pointer"
            >
              {secondaryLabel}
            </button>
          ) : (
            <Link
              to={secondaryPath || '/dashboard'}
              className="btn btn-secondary btn-md cursor-pointer"
            >
              {secondaryLabel}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
