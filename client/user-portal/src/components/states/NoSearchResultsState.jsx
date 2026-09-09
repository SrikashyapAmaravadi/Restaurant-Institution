import { SearchX, RotateCcw, X } from 'lucide-react';

/**
 * Standardized NoSearchResultsState Component
 * Displays when a user's search query or filter configuration yields zero items.
 */
export default function NoSearchResultsState({
  query = '',
  activeFilters = [],
  onRemoveFilter,
  onResetFilters,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`card anim-fade-in ${className}`}
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
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#F8FAFC',
          border: '1.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--t3)',
          marginBottom: 16
        }}
      >
        <SearchX size={26} />
      </div>

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--t3)',
          background: '#F1F5F9',
          border: '1px solid var(--border)',
          padding: '3px 10px',
          borderRadius: 'var(--r-full)',
          marginBottom: 12
        }}
      >
        0 Results Found
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
        {query ? (
          <>
            No matches for <span style={{ color: 'var(--primary-light)' }}>&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          'No items match your active filters'
        )}
      </h3>

      <p
        style={{
          fontSize: 13.5,
          color: 'var(--t3)',
          lineHeight: 1.6,
          maxWidth: 380,
          marginBottom: 20
        }}
      >
        Try checking for spelling variations, adjusting your search distance, or clearing specific category filters.
      </p>

      {/* Active Filter Pills (if provided) */}
      {activeFilters && activeFilters.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            justifyContent: 'center',
            maxWidth: 420,
            marginBottom: 20
          }}
        >
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 'var(--r-full)',
                background: 'rgba(200, 109, 81, 0.12)',
                border: '1px solid rgba(200, 109, 81, 0.3)',
                color: 'var(--primary-light)',
                fontSize: 11.5,
                fontWeight: 600
              }}
            >
              <span>{typeof filter === 'string' ? filter : filter.label}</span>
              {onRemoveFilter && (
                <button
                  type="button"
                  onClick={() => onRemoveFilter(filter)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="btn btn-secondary btn-md cursor-pointer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <RotateCcw size={14} />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
}
