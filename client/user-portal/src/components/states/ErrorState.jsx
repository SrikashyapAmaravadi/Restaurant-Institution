import { useState } from 'react';
import { AlertCircle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Standardized ErrorState Component
 * Displays when API requests fail, network calls time out, or unhandled errors occur.
 */
export default function ErrorState({
  title = 'Unable to Load Information',
  message = 'We encountered an issue while communicating with the dining service. Please try again or return to the main dashboard.',
  technicalDetails,
  onRetry,
  homePath = '/dashboard',
  className = '',
  style = {}
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`card anim-scale-in ${className}`}
      style={{
        maxWidth: 520,
        margin: '24px auto',
        padding: '36px 28px',
        textAlign: 'center',
        background: '#FFFFFF',
        border: '1px solid #FECACA',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-md)',
        ...style
      }}
    >
      {/* Icon Circle */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#FEF2F2',
          border: '1.5px solid #FECACA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC2626',
          margin: '0 auto 16px'
        }}
      >
        <AlertCircle size={28} />
      </div>

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#EF4444',
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '3px 10px',
          borderRadius: 'var(--r-full)',
          display: 'inline-block',
          marginBottom: 12
        }}
      >
        Service Notice
      </span>

      <h3
        className="font-display"
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
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
          marginBottom: 20
        }}
      >
        {message}
      </p>

      {/* Optional Technical Details Drawer */}
      {technicalDetails && (
        <div style={{ marginBottom: 20, textAlign: 'left' }}>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--t4)',
              fontSize: 11.5,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>Technical details</span>
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showDetails && (
            <pre
              style={{
                marginTop: 6,
                padding: '10px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xs)',
                fontSize: 11,
                color: 'var(--t3)',
                overflowX: 'auto',
                fontFamily: 'monospace'
              }}
            >
              {typeof technicalDetails === 'string'
                ? technicalDetails
                : JSON.stringify(technicalDetails, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-primary btn-md cursor-pointer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <RotateCcw size={14} />
            <span>Try Again</span>
          </button>
        )}
        <Link
          to={homePath}
          className="btn btn-secondary btn-md cursor-pointer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Home size={14} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
