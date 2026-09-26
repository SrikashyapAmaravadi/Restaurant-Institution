import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { useDining } from '../context/DiningContext';
import RubberSegment from './RubberSegment';

const NIVIX_CATEGORIES = [
  'All',
  'Dining',
  'Cafeteria',
  'Fast Bites',
  'Night Canteen',
  'Artisan Cafes',
  'Desserts'
];

export default function NivixSearchModal({ isOpen, onClose }) {
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
    if (activeCategory !== 'All') {
      const cat = activeCategory.toLowerCase();
      list = list.filter(r =>
        r.cuisine?.toLowerCase().includes(cat) ||
        r.category?.toLowerCase().includes(cat) ||
        r.name?.toLowerCase().includes(cat)
      );
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
        background: 'rgba(17, 18, 13, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(24px, 8vh, 80px) 16px 30px',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#FFFBF4',
          borderRadius: 20,
          boxShadow: '0 25px 60px -12px rgba(17, 18, 13, 0.35)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          border: '1.5px solid #D8CFBC',
        }}
      >
        {/* Modal Brand Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: 20,
                fontWeight: 600,
                fontStyle: 'italic',
                color: '#000000',
                letterSpacing: '-0.02em',
              }}
            >
              nivix-dine-in
            </span>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#565449',
                textTransform: 'uppercase',
                background: 'rgba(216, 207, 188, 0.35)',
                padding: '2px 8px',
                borderRadius: 99,
                border: '1px solid #E8E2D5',
              }}
            >
              CAMPUS SEARCH
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close search"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#FFFBF4',
              border: '1px solid #E8E2D5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#565449',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#11120D';
              e.currentTarget.style.borderColor = '#11120D';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#565449';
              e.currentTarget.style.borderColor = '#D8CFBC';
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#FFFBF4',
            border: '1.5px solid #D8CFBC',
            borderRadius: 14,
            padding: '12px 16px',
            boxShadow: '0 2px 8px rgba(17, 18, 13, 0.04)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <Search size={18} color="#565449" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search restaurants, cafes, cuisines or dishes..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14.5,
              fontWeight: 500,
              color: '#000000',
              background: 'transparent',
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: '#D8CFBC',
                border: 'none',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#000000',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Rubber Segment Category Filter */}
        <div
          style={{
            overflowX: 'auto',
            paddingBottom: 2,
            WebkitOverflowScrolling: 'touch'
          }}
          className="scrollbar-none"
        >
          <RubberSegment
            items={NIVIX_CATEGORIES}
            value={activeCategory}
            onChange={(val) => setActiveCategory(val)}
            trackColor="#F6F2EA"
            thumbColor="#11120D"
            textColor="#565449"
            activeTextColor="#FFFBF4"
            size="sm"
            radius={99}
            inset={2.5}
            equalSlots={false}
            aria-label="Search outlet category"
          />
        </div>

        {/* Section Heading */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: '#000000',
              fontFamily: "'Newsreader', Georgia, serif",
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={13} color="#565449" />
            Trending at Bennett University
          </span>
          <span style={{ fontSize: 11.5, color: '#565449', fontWeight: 600 }}>
            {filteredList.length} destinations
          </span>
        </div>

        {/* 2-Column Restaurant Results */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '10px 12px',
            maxHeight: 340,
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
                padding: '10px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                background: '#FFFBF4',
                border: '1px solid #E8E2D5',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#11120D';
                e.currentTarget.style.transform = 'translateY(-1.5px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(17, 18, 13, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E8E2D5';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&q=80'}
                alt={item.name}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid #E8E2D5',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#000000',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.25,
                    fontFamily: "'Newsreader', Georgia, serif",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: '#565449',
                    marginTop: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{item.cuisine || 'Dining'}</span>
                  <span>·</span>
                  <span>{item.distance || 0.5} km</span>
                </div>
              </div>
              <ArrowRight size={14} color="#565449" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
