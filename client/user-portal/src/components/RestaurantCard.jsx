import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Sparkles,
  ChevronRight,
  Tag,
  CalendarDays,
  Heart,
  Zap,
} from 'lucide-react';

export default function RestaurantCard({ restaurant, onQuickReserve, onViewOffer }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const {
    id,
    name,
    tagline,
    cuisine,
    price = '₹₹',
    rating = 4.8,
    reviews = 142,
    distance = 0.4,
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
          title: offerLabel ? `${offerLabel} Campus Exclusive` : 'Student Special Deal',
          description: `Enjoy ${offerLabel || 'special discounts'} on all dining bills with your Bennett Student ID.`,
          discount: offerLabel || '20% OFF',
          promoCode: `CAMPUS${id || '20'}`,
          validTill: 'End of Semester',
          restaurantName: name,
        }
      : null);

  const handleCardClick = () => navigate(`/restaurant/${id}`);

  const handleBookClick = (e, slotTime = null) => {
    e.stopPropagation();
    if (onQuickReserve) {
      onQuickReserve({ ...restaurant, defaultTime: slotTime });
    } else {
      navigate(`/restaurant/${id}?reserve=true${slotTime ? `&time=${slotTime}` : ''}`);
    }
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
        code: activeOffer.promoCode || activeOffer.code || `CAMPUS${id || '20'}`,
        validTill: activeOffer.endDate || activeOffer.validTill || 'End of Semester',
      };
      if (onViewOffer) onViewOffer(fullOffer);
      else navigate(`/restaurant/${id}?tab=offers`);
    }
  };

  const displayReviewCount = typeof reviews === 'number'
    ? reviews
    : (Array.isArray(reviews) ? reviews.length : 142);

  const quickSlots = ['12:30 PM', '1:15 PM', '7:30 PM', '8:15 PM'];

  return (
    <div
      onClick={handleCardClick}
      className="district-card"
      style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #EEF0F3',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 14px 32px rgba(15, 23, 42, 0.09)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
      }}
    >
      {/* ── Image & Badges Container ── */}
      <div style={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', background: '#F1F5F9' }}>
        <img
          src={
            image ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
          }
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.35s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
        />

        {/* Subtle Bottom Shade */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Badges Row */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          {/* Rating Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 99,
              background: '#059669',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <span>{rating}</span>
            <Star size={11} fill="#FFF" color="#FFF" />
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isLiked ? '#E11D48' : '#475569',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <Heart size={15} fill={isLiked ? '#E11D48' : 'none'} />
          </button>
        </div>

        {/* Bottom Image Overlay Text */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF',
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            {price} · Approx ₹250 for two
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: isOpen ? 'rgba(5, 150, 105, 0.9)' : 'rgba(220, 38, 38, 0.9)',
              color: '#FFFFFF',
            }}
          >
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* ── Card Content (100% Light Theme) ── */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Name & Distance */}
        <div>
          <h3
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16.5,
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {name}
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 4,
              fontSize: 12.5,
              color: '#64748B',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 500 }}>{cuisine || 'Multi-Cuisine'}</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} color="#6D28D9" />
              {distance} km · 4 min walk
            </span>
            <span>•</span>
            <span>{displayReviewCount} reviews</span>
          </div>
        </div>

        {/* ── District Coupon Ribbon (Light Theme) ── */}
        {activeOffer && (
          <div
            onClick={handleOfferClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 10,
              background: '#FFF1F2',
              border: '1px dashed #FB7185',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag size={13} color="#E11D48" />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#BE185D' }}>
                {activeOffer.discount || '20% OFF'}
              </span>
              <span style={{ fontSize: 11, color: '#881337', fontWeight: 500 }}>
                · Code: <strong>{activeOffer.promoCode || 'CAMPUS20'}</strong>
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#E11D48' }}>
              APPLY ▾
            </span>
          </div>
        )}

        {/* ── Instant Slot Booking Row (Light Theme) ── */}
        <div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Zap size={11} color="#E11D48" />
            <span>Instant Seats Today</span>
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="scrollbar-none">
            {quickSlots.map(slot => (
              <button
                key={slot}
                onClick={(e) => handleBookClick(e, slot)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#334155',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#FFE4E6';
                  e.currentTarget.style.color = '#BE185D';
                  e.currentTarget.style.borderColor = '#FDA4AF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* ── Action Buttons Row ── */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={handleBookClick}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: 99,
              background: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#BE123C'}
            onMouseLeave={e => e.currentTarget.style.background = '#E11D48'}
          >
            <CalendarDays size={13} />
            <span>Book Table</span>
          </button>

          <button
            onClick={handleCardClick}
            style={{
              padding: '9px 14px',
              borderRadius: 99,
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #E2E8F0',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <span>Menu</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
