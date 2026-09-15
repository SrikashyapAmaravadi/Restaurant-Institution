import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Sparkles, ChevronRight, Tag, CalendarDays } from 'lucide-react';

export default function RestaurantCard({ restaurant, onQuickReserve, onViewOffer }) {
  const navigate = useNavigate();
  const {
    id,
    name,
    tagline,
    cuisine,
    price = '₹₹',
    rating = 4.8,
    reviews = 142,
    distance = 0.8,
    isOpen = true,
    hasOffer = true,
    offerLabel = '20% OFF',
    image,
    popularDishes = []
  } = restaurant || {};

  const activeOffer =
    (restaurant?.offers && restaurant.offers.length > 0 && restaurant.offers[0]) ||
    (hasOffer
      ? {
          id: `offer-${id}`,
          title: offerLabel ? `${offerLabel} Campus Special` : 'Student Exclusive Offer',
          description: `Save with ${offerLabel || 'exclusive discounts'} with verified Bennett credentials.`,
          discount: offerLabel || '20% OFF',
          promoCode: `BENNETT${id}0`,
          validTill: 'End of Semester',
          restaurantName: name,
        }
      : null);

  const handleCardClick = () => navigate(`/restaurant/${id}`);

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (onQuickReserve) onQuickReserve(restaurant);
    else navigate(`/restaurant/${id}?reserve=true`);
  };

  const handleOfferClick = (e) => {
    e.stopPropagation();
    if (activeOffer) {
      const fullOffer = {
        ...activeOffer,
        restaurantName: name,
        restaurantId: id,
        title: activeOffer.title || `${offerLabel || '20% OFF'} Campus Exclusive`,
        description: activeOffer.description || 'Special dining discount for verified students.',
        code: activeOffer.promoCode || activeOffer.code || `BENNETT${id}0`,
        validTill: activeOffer.endDate || activeOffer.validTill || 'End of Semester',
      };
      if (onViewOffer) onViewOffer(fullOffer);
      else navigate(`/restaurant/${id}?tab=offers`);
    }
  };

  const displayReviewCount = typeof reviews === 'number'
    ? reviews
    : (Array.isArray(reviews) ? reviews.length : 142);

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: '#FFF',
        borderRadius: 16,
        border: '1px solid #EEE',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#F5F5F5' }}>
        <img
          src={image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />

        {/* Status pill */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px',
            borderRadius: 99,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            fontSize: 11, fontWeight: 600, color: '#333',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isOpen ? '#22C55E' : '#EF4444',
            }} />
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* Offer badge */}
        {hasOffer && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 2 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#FF5200',
              fontSize: 10.5, fontWeight: 700, color: '#FFF',
            }}>
              {offerLabel || '20% OFF'}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Name + Rating */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{
              fontSize: 15, fontWeight: 600, color: '#111',
              lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {name}
            </h3>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 7px',
              borderRadius: 6,
              background: '#F0FDF4', border: '1px solid #DCF5DC',
              fontSize: 11, fontWeight: 600, color: '#16A34A',
              flexShrink: 0,
            }}>
              <Star size={10} style={{ fill: '#22C55E', color: '#22C55E' }} />
              {rating}
            </span>
          </div>

          {/* Meta */}
          <div style={{ fontSize: 12, color: '#999', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 500 }}>{cuisine}</span>
            <span>·</span>
            <span>{distance} km</span>
            <span>·</span>
            <span style={{ fontWeight: 500 }}>{price}</span>
          </div>

          {/* Tagline */}
          <p style={{
            fontSize: 12, color: '#AAA', marginTop: 8, lineHeight: 1.4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {popularDishes && popularDishes.length > 0
              ? `Popular: ${popularDishes.slice(0, 3).join(', ')}`
              : tagline || 'Campus dining partner'}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid #F5F5F5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8,
        }}>
          {activeOffer ? (
            <button
              onClick={handleOfferClick}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '6px 10px',
                borderRadius: 6,
                background: '#FFFBEB', border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: 11, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Tag size={11} />
              {activeOffer.promoCode || 'BENNETT20'}
              <ChevronRight size={11} style={{ color: '#D97706' }} />
            </button>
          ) : (
            <span style={{ fontSize: 11, color: '#CCC', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} /> Partner
            </span>
          )}

          <button
            onClick={handleBookClick}
            className="btn btn-primary btn-xs"
            style={{ borderRadius: 8, fontSize: 11.5, fontWeight: 600, padding: '6px 14px' }}
          >
            <CalendarDays size={12} />
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
