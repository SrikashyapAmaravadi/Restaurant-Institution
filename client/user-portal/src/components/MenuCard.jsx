import { useState } from 'react';
import { Sparkles, Utensils, Search, Check } from 'lucide-react';
import RubberSegment from './RubberSegment';

/**
 * MenuCard
 * A traditional, high-end editorial menu card displaying only
 * dish items and their prices with clean dotted leaders.
 */
export default function MenuCard({ restaurant, menu = {}, onViewCatalog }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.keys(menu);

  // Filter items
  const filteredCategories = categories.map(cat => {
    let items = menu[cat] || [];
    if (vegOnly) {
      items = items.filter(d => d.veg);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(d => (d.name || '').toLowerCase().includes(q));
    }
    return { name: cat, items };
  }).filter(cat => {
    if (activeCategory !== 'ALL' && cat.name !== activeCategory) return false;
    return cat.items.length > 0;
  });

  const totalItemsCount = Object.values(menu).reduce((sum, items) => sum + (items?.length || 0), 0);

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #D8CFBC',
        boxShadow: '0 4px 20px rgba(17, 18, 13, 0.05)',
        padding: 'clamp(14px, 3.5vw, 32px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Editorial Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 12px',
            borderRadius: 99,
            background: '#F6F2EA',
            border: '1px solid #E8E2D5',
            color: '#565449',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          <Sparkles size={11} color="#565449" />
          <span>{restaurant?.name || 'Restaurant'} · Menu Card</span>
        </div>

        <h2
          style={{
            fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)',
            fontWeight: 600,
            color: '#11120D',
            margin: '4px 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Items &amp; Rates
        </h2>
        <p
          style={{
            fontSize: 13,
            color: '#565449',
            margin: 0,
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Freshly prepared culinary dishes and their menu rates at a glance ({totalItemsCount} items).
        </p>

        {onViewCatalog && (
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={onViewCatalog}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 16px',
                borderRadius: 99,
                background: '#F6F2EA',
                border: '1px solid #E8E2D5',
                color: '#11120D',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#11120D';
                e.currentTarget.style.color = '#FFFBF4';
                e.currentTarget.style.borderColor = '#11120D';
                e.currentTarget.style.transform = 'translateY(-1.5px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#F6F2EA';
                e.currentTarget.style.color = '#11120D';
                e.currentTarget.style.borderColor = '#E8E2D5';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>View Full Visual Catalog with Photos</span>
              <span style={{ fontSize: 13 }}>→</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Controls Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          background: '#F6F2EA',
          borderRadius: 14,
          border: '1px solid #E8E2D5',
          marginBottom: 26,
        }}
      >
        {/* Quick Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#565449',
            }}
          />
          <input
            type="text"
            placeholder="Search item name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 34px',
              borderRadius: 99,
              background: '#FFFFFF',
              border: '1px solid #E8E2D5',
              fontSize: 12,
              color: '#11120D',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.25s ease',
            }}
            onFocus={e => (e.target.style.borderColor = '#11120D')}
            onBlur={e => (e.target.style.borderColor = '#E8E2D5')}
          />
        </div>

        {/* Category Pills & Veg Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Dietary Rubber Segment */}
          <RubberSegment
            items={[
              { value: 'ALL_DIET', label: 'All Dishes' },
              {
                value: 'VEG_ONLY',
                label: 'Pure Veg',
                icon: <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
              }
            ]}
            value={vegOnly ? 'VEG_ONLY' : 'ALL_DIET'}
            onChange={(val) => setVegOnly(val === 'VEG_ONLY')}
            trackColor="#E8E2D5"
            thumbColor="#11120D"
            textColor="#565449"
            activeTextColor="#FFFBF4"
            size="sm"
            radius={99}
            inset={2.5}
            equalSlots={false}
            aria-label="Dietary preference"
          />

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }} className="pills-scroll-x scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory('ALL')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeCategory === 'ALL' ? '1px solid #11120D' : '1px solid #E8E2D5',
                  background: activeCategory === 'ALL' ? '#11120D' : '#FFFFFF',
                  color: activeCategory === 'ALL' ? '#FFFBF4' : '#565449',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexShrink: 0,
                }}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: activeCategory === cat ? '1px solid #11120D' : '1px solid #E8E2D5',
                    background: activeCategory === cat ? '#11120D' : '#FFFFFF',
                    color: activeCategory === cat ? '#FFFBF4' : '#565449',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    flexShrink: 0,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Category Sections with Dotted Leaders ── */}
      {filteredCategories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#565449' }}>
          <Utensils size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
          <p style={{ fontSize: 13, margin: 0 }}>No items match your filter.</p>
        </div>
      ) : (
        <div className="menu-categories-grid">
          {filteredCategories.map(cat => (
            <div
              key={cat.name}
              style={{
                background: '#FFFBF4',
                border: '1px solid #E8E2D5',
                borderRadius: 16,
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Category Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 10,
                  marginBottom: 14,
                  borderBottom: '1.5px solid #11120D',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#565449', fontSize: 11 }}>✦</span>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#11120D',
                      margin: 0,
                    }}
                  >
                    {cat.name}
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: '#565449',
                    background: '#F6F2EA',
                    padding: '2px 8px',
                    borderRadius: 99,
                    border: '1px solid #E8E2D5',
                  }}
                >
                  {cat.items.length} {cat.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List with Classic Dotted Leaders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {cat.items.map(dish => (
                  <div
                    key={dish.id || dish.name}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      padding: '4px 6px',
                      borderRadius: 6,
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#F6F2EA';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Veg/Non-Veg Dot */}
                    <span
                      title={dish.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 12,
                        height: 12,
                        border: `1.5px solid ${dish.veg ? '#16A34A' : '#B91C1C'}`,
                        borderRadius: 3,
                        marginRight: 8,
                        flexShrink: 0,
                        position: 'relative',
                        top: 1,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: dish.veg ? '#16A34A' : '#B91C1C',
                        }}
                      />
                    </span>

                    {/* Dish Name */}
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: '#11120D',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flexShrink: 1,
                        minWidth: 0,
                      }}
                    >
                      {dish.name}
                    </span>

                    {/* Dotted Leader Line */}
                    <span
                      style={{
                        flex: 1,
                        margin: '0 8px',
                        borderBottom: '1px dotted #BDB8AB',
                        minWidth: 14,
                        flexShrink: 0,
                      }}
                    />

                    {/* Price */}
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#11120D',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      ₹{dish.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
