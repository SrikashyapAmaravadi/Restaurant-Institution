import { Loader2 } from 'lucide-react';

/**
 * Standardized LoadingState Component
 * Supports 'spinner', 'card-skeleton', 'list-skeleton', and 'full-page' layouts.
 */
export default function LoadingState({
  type = 'card-skeleton', // 'spinner' | 'card-skeleton' | 'list-skeleton' | 'full-page'
  count = 3,
  message = 'Loading verified dining information...',
  style = {}
}) {
  if (type === 'full-page') {
    return (
      <div
        className="anim-fade-in"
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          ...style
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 56,
            height: 56,
            marginBottom: 20
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid #E2E8F0',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 6,
              borderRadius: '50%',
              border: '3px solid #F1F5F9',
              borderBottomColor: 'var(--accent)',
              animation: 'spin 1.4s linear infinite reverse'
            }}
          />
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--t1)', letterSpacing: '0.01em' }}>
          {message}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Institutional Data Gateway
        </div>
      </div>
    );
  }

  if (type === 'spinner') {
    return (
      <div
        className="anim-fade-in"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '16px 20px',
          color: 'var(--t2)',
          fontSize: 13.5,
          ...style
        }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <span>{message}</span>
      </div>
    );
  }

  if (type === 'list-skeleton') {
    return (
      <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: '1px solid var(--border)',
              background: '#FFFFFF'
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--r-sm)',
                background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.8s infinite',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  height: 14,
                  width: '60%',
                  borderRadius: 4,
                  background: '#E2E8F0',
                  animation: 'pulseGlow 2s infinite ease-in-out'
                }}
              />
              <div
                style={{
                  height: 11,
                  width: '40%',
                  borderRadius: 4,
                  background: '#F1F5F9'
                }}
              />
            </div>
            <div
              style={{
                height: 24,
                width: 70,
                borderRadius: 'var(--r-full)',
                background: '#F1F5F9'
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Default: card-skeleton
  return (
    <div
      className="anim-fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        ...style
      }}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            overflow: 'hidden',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            background: '#FFFFFF'
          }}
        >
          {/* Cover Shimmer */}
          <div
            style={{
              height: 160,
              background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.8s infinite'
            }}
          />
          {/* Content Shimmer */}
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                height: 16,
                width: '75%',
                borderRadius: 4,
                background: '#E2E8F0',
                animation: 'pulseGlow 2s infinite ease-in-out'
              }}
            />
            <div
              style={{
                height: 12,
                width: '50%',
                borderRadius: 4,
                background: '#F1F5F9'
              }}
            />
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  height: 20,
                  width: 60,
                  borderRadius: 'var(--r-xs)',
                  background: '#F1F5F9'
                }}
              />
              <div
                style={{
                  height: 32,
                  width: 90,
                  borderRadius: 'var(--r-sm)',
                  background: '#E2E8F0'
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
