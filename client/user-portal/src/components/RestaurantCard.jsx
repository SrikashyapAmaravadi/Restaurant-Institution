import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Sparkles,
  ChevronRight,
  Tag,
  CalendarDays,
  Clock,
  Heart,
  Zap,
  Flame,
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
        borderRadius: 22,
        border: '1px solid #ECE8E3',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 18px 40px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.04)';
      }}
    >
      {/* ── Image & Badges Container ── */}
      <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden', background: '#222' }}>
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
            transition: 'transform 0.45s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)',
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
          {/* Vibe / Trending Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: 99,
              background: 'rgba(13, 14, 18, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Flame size={12} color="#FF5200" />
            <span>Trending Hotspot</span>
          </div>

          {/* Right: Rating Pill + Like Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Rating */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 99,
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <span>{rating}</span>
              <Star size={11} fill="#FFF" color="#FFF" />
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 99,
                background: 'rgba(13, 14, 18, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isLiked ? '#EF4444' : '#FFFFFF',
              }}
            >
              <Heart size={14} fill={isLiked ? '#EF4444' : 'none'} />
            </button>
          </div>
        </div>

        {/* Bottom Overlay Info (on image) */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 14,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF',
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
            {price} · Approx ₹250 for two
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 6,
              background: isOpen ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              color: isOpen ? '#34D399' : '#FCA5A5',
              border: `1px solid ${isOpen ? 'rgba(52, 211, 153, 0.4)' : 'rgba(252, 165, 165, 0.4)'}`,
            }}
          >
            {isOpen ? '● Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* ── Card Content ── */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Name & Distance */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: '#1A1A1A',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}
            >
              {name}
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 4,
              fontSize: 12.5,
              color: '#777',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 500 }}>{cuisine || 'Multi-Cuisine'}</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} color="#FF5200" />
              {distance} km · 4 min walk
            </span>
            <span>•</span>
            <span>{displayReviewCount} reviews</span>
          </div>
        </div>

        {/* ── District Perforated Coupon Ribbon ── */}
        {activeOffer && (
          <div
            onClick={handleOfferClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 10,
              background: 'linear-gradient(90deg, #FFF7ED 0%, #FFF1E6 100%)',
              border: '1px dashed #F97316',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Tag size={13} color="#FF5200" />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#C2410C', letterSpacing: '0.01em' }}>
                {activeOffer.discount || '20% OFF'}
              </span>
              <span style={{ fontSize: 11, color: '#9A3412', fontWeight: 500 }}>
                · Code: <strong style={{ textDecoration: 'underline' }}>{activeOffer.promoCode || `CAMPUS20`}</strong>
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#EA580C' }}>
              CLAIM ▾
            </span>
          </div>
        )}

        {/* ── Instant Slot Booking Row (District Experience) ── */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Zap size={11} color="#FF5200" />
            <span>Instant Table Slots Today</span>
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="scrollbar-none">
            {quickSlots.map(slot => (
              <button
                key={slot}
                onClick={(e) => handleBookClick(e, slot)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  background: '#F5F3F0',
                  border: '1px solid #E5E1DB',
                  color: '#1A1A1A',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#FF5200';
                  e.currentTarget.style.color = '#FFF';
                  e.currentTarget.style.borderColor = '#FF5200';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F5F3F0';
                  e.currentTarget.style.color = '#1A1A1A';
                  e.currentTarget.style.borderColor = '#E5E1DB';
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* ── Action Buttons Row ── */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid #F3EFEA' }}>
          <button
            onClick={handleBookClick}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: 99,
              background: '#0D0E12',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FF5200';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0D0E12';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <CalendarDays size={13} />
            <span>Book Table</span>
          </button>

          <button
            onClick={handleCardClick}
            style={{
              padding: '9px 14px',
              borderRadius: 99,
              background: '#F5F3F0',
              color: '#333333',
              border: '1px solid #E5E1DB',
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
