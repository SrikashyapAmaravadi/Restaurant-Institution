import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Utensils, Sparkles } from 'lucide-react';
import { useDining } from '../context/DiningContext';

const DISTRICT_CATEGORIES = [
  'All',
  'Dining',
  'Events',
  'Comedy',
  'Movies',
  'Stores',
  'Activities',
  'Play'
];

export default function DistrictSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { restaurants = [] } = useDining() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Dining');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return safeRestaurants.slice(0, 10);
    const q = searchTerm.toLowerCase();
    return safeRestaurants.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.cuisine?.toLowerCase().includes(q) ||
      r.popularDishes?.some(d => d.toLowerCase().includes(q))
    );
  }, [safeRestaurants, searchTerm]);

  if (!isOpen) return null;

  const handleSelect = (r) => {
    onClose();
    navigate(`/restaurant/${r.id}`);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(20px, 8vh, 80px) 16px 30px',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.18)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: 14,
            padding: '12px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Search size={18} color="#64748B" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search for 'Vegan Treats' or dishes, cafes..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontWeight: 500,
              color: '#0F172A',
              fontFamily: 'inherit',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills (Screenshot 3 exact style) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
          className="scrollbar-none"
        >
          {DISTRICT_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#9F1239' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  boxShadow: isActive ? '0 2px 8px rgba(159, 18, 57, 0.25)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Section Heading */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#0F172A',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Trending in Bennett Campus
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
            {filteredList.length} results
          </span>
        </div>

        {/* 2-Column Restaurant Results (Screenshot 3 exact layout) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px 16px',
            maxHeight: 380,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {filteredList.map(item => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 10px',
                borderRadius: 14,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&q=80'}
                alt={item.name}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid #E2E8F0',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: '#0F172A',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.25,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748B',
                    marginTop: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.cuisine || 'Restaurant'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
