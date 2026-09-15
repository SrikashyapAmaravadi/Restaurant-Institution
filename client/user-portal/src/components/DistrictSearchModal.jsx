import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Utensils, Sparkles, MapPin } from 'lucide-react';
import { useDining } from '../context/DiningContext';

const CAMPUS_CATEGORIES = [
  'All',
  'Dining Halls',
  'Cafes',
  'Fast Casual',
  'Night Canteen',
  'Student Deals'
];

export default function CampusSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { restaurants = [] } = useDining() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
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
    let list = safeRestaurants;
    if (activeCategory === 'Dining Halls') {
      list = list.filter(r => r.cuisine?.toLowerCase().includes('indian') || r.name?.toLowerCase().includes('garden'));
    } else if (activeCategory === 'Cafes') {
      list = list.filter(r => r.cuisine?.toLowerCase().includes('cafe') || r.cuisine?.toLowerCase().includes('continental'));
    } else if (activeCategory === 'Fast Casual') {
      list = list.filter(r => r.tags?.some(t => t.toLowerCase().includes('fast')) || r.price === '₹');
    } else if (activeCategory === 'Student Deals') {
      list = list.filter(r => r.hasOffer);
    }

    if (!searchTerm.trim()) return list.slice(0, 8);
    const q = searchTerm.toLowerCase();
    return list.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.cuisine?.toLowerCase().includes(q) ||
      r.popularDishes?.some(d => d.toLowerCase().includes(q))
    );
  }, [safeRestaurants, searchTerm, activeCategory]);

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
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
          maxWidth: 640,
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.15)',
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
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: 14,
            padding: '12px 18px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <Search size={18} color="#64748B" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search campus cafes, rolls, biryani, cold brew..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontWeight: 500,
              color: '#0F172A',
              fontFamily: 'inherit',
              background: 'transparent',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: '#E2E8F0',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
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
          {CAMPUS_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#E11D48' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#475569',
                  boxShadow: isActive ? '0 2px 8px rgba(225, 29, 72, 0.25)' : 'none',
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
            Recommended Outlets on Campus
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
            {filteredList.length} spots
          </span>
        </div>

        {/* 2-Column Restaurant Results */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px 14px',
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
                  {item.cuisine || 'Multi-Cuisine'} · {item.distance || 0.4} km
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
