import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect
 * An editorial, custom-styled dropdown replacing native browser <select> elements.
 * Features our 4-colour palette, rounded pill trigger, animated chevron, and smooth menu popover.
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  icon: Icon,
  align = 'right',
  ariaLabel = 'Select option',
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label }
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption =
    normalizedOptions.find(opt => opt.value === value) || normalizedOptions[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          background: isOpen ? '#ECE6D8' : '#F6F2EA',
          border: '1px solid',
          borderColor: isOpen ? '#11120D' : '#E8E2D5',
          borderRadius: 9999,
          padding: '6px 14px',
          color: '#11120D',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
        onMouseEnter={e => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#BDB8AB';
            e.currentTarget.style.background = '#ECE6D8';
          }
        }}
        onMouseLeave={e => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#E8E2D5';
            e.currentTarget.style.background = '#F6F2EA';
          }
        }}
      >
        {Icon && <Icon size={13} style={{ color: '#565449', flexShrink: 0 }} />}
        <span>{selectedOption?.label || 'Select'}</span>
        <ChevronDown
          size={13}
          style={{
            color: '#565449',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align === 'right' ? 'right' : 'left']: 0,
            minWidth: 200,
            background: '#FFFFFF',
            border: '1px solid #D8CFBC',
            borderRadius: 14,
            boxShadow: '0 12px 32px rgba(17, 18, 13, 0.12), 0 2px 6px rgba(17, 18, 13, 0.04)',
            padding: 6,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            transformOrigin: align === 'right' ? 'top right' : 'top left',
            animation: 'dropdown-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {normalizedOptions.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSelected ? '#F6F2EA' : 'transparent',
                  color: isSelected ? '#11120D' : '#565449',
                  fontSize: 12.5,
                  fontWeight: isSelected ? 600 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.18s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#F6F2EA';
                    e.currentTarget.style.color = '#11120D';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#565449';
                  }
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check size={13} style={{ color: '#11120D', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
