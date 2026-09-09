import { useState, useEffect } from 'react';
import { WifiOff, RotateCcw, Radio } from 'lucide-react';

/**
 * Standardized NoInternetState & Ambient OfflineBanner
 * Monitors online/offline network lifecycle via window events.
 */
export default function NoInternetState({
  onRetry = () => window.location.reload(),
  className = '',
  style = {}
}) {
  return (
    <div
      className={`card anim-scale-in ${className}`}
      style={{
        maxWidth: 480,
        margin: '40px auto',
        padding: '40px 24px',
        textAlign: 'center',
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-md)',
        ...style
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--accent-subtle)',
          border: '1.5px solid #FDE68A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          margin: '0 auto 18px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <WifiOff size={28} />
      </div>

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--accent)',
          background: 'var(--accent-subtle)',
          padding: '3px 10px',
          borderRadius: 'var(--r-full)',
          display: 'inline-block',
          marginBottom: 12
        }}
      >
        Connection Lost
      </span>

      <h3
        className="font-display"
        style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--t1)',
          marginBottom: 8
        }}
      >
        No Internet Connection
      </h3>

      <p
        style={{
          fontSize: 13.5,
          color: 'var(--t3)',
          lineHeight: 1.6,
          maxWidth: 360,
          margin: '0 auto 24px'
        }}
      >
        Your device seems to be offline. Please check your Wi-Fi or mobile network connection to resume dining reservations.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="btn btn-primary btn-md cursor-pointer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <RotateCcw size={14} />
        <span>Check Connection Again</span>
      </button>
    </div>
  );
}

/**
 * Ambient Top Banner that automatically displays whenever the browser drops offline
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="anim-fade-in"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: '#FFFBEB',
        borderBottom: '1px solid #FDE68A',
        padding: '9px 16px',
        color: '#92400E',
        fontSize: 12.5,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <WifiOff size={14} style={{ color: '#B45309' }} />
      <span>You are currently offline. Actions will be synchronized when connection is restored.</span>
      <Radio size={12} className="animate-pulse" style={{ color: '#B45309', marginLeft: 4 }} />
    </div>
  );
}
