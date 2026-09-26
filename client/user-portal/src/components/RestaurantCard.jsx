import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  ChevronRight,
  Tag,
  CalendarDays,
  Heart,
} from 'lucide-react';

export default function RestaurantCard({ restaurant, onQuickReserve, onViewOffer }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    id,
    name,
    cuisine,
    price = '₹₹',
    rating = 4.8,
    reviews = 142,
    distance = 0.4,
    isOpen = true,
    hasOffer = true,
    offerLabel = '20% OFF',
    image,
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

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (onQuickReserve) {
      onQuickReserve(restaurant);
    } else {
      navigate(`/restaurant/${id}?reserve=true`);
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

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="nivix-card district-card"
      style={{
        background: '#FFFFFF',
        borderRadius: 14,
        border: `1px solid ${isHovered ? '#11120D' : '#E8E2D5'}`,
        boxShadow: isHovered
          ? '0 22px 42px -10px rgba(17, 18, 13, 0.14), 0 8px 18px -4px rgba(17, 18, 13, 0.05)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.55s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease',
      }}
    >
      {/* Image & Badges Container */}
      <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', background: '#FFFFFF' }}>
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
            filter: isHovered
              ? 'brightness(1.18) contrast(0.80) saturate(0.86)'
              : 'brightness(1.24) contrast(0.74) saturate(0.80)',
            opacity: isHovered ? 0.95 : 0.88,
            transform: isHovered ? 'scale(1.06)' : 'scale(1.0)',
            transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease, opacity 0.45s ease',
          }}
        />

        {/* Soft luminous ambient wash to decrease contrast between dashboard and picture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.12) 45%, rgba(255, 255, 255, 0.45) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'opacity 0.45s ease',
            opacity: isHovered ? 0.75 : 1,
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
          {/* Rating Pill - Softened glass pill with Floral White text */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 99,
              background: 'rgba(28, 27, 23, 0.76)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFBF4',
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <span>{rating}</span>
            <Star size={10} fill="#FFFBF4" color="#FFFBF4" />
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
              borderRadius: 99,
              background: 'rgba(255, 251, 244, 0.92)',
              backdropFilter: 'blur(4px)',
              border: '1px solid #D8CFBC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isLiked ? '#B91C1C' : '#565449',
              transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.18)';
              e.currentTarget.style.borderColor = '#11120D';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 18, 13, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1.0)';
              e.currentTarget.style.borderColor = '#D8CFBC';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Heart size={14} fill={isLiked ? '#B91C1C' : 'none'} color={isLiked ? '#B91C1C' : '#565449'} />
          </button>
        </div>

        {/* Bottom Image Overlay Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 99,
              background: 'rgba(28, 27, 23, 0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#FFFBF4',
            }}
          >
            {price} · Approx ₹250
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 99,
              background: isOpen ? 'rgba(86, 84, 73, 0.82)' : '#FEF2F2',
              backdropFilter: isOpen ? 'blur(8px)' : 'none',
              WebkitBackdropFilter: isOpen ? 'blur(8px)' : 'none',
              color: isOpen ? '#FFFBF4' : '#B91C1C',
              border: `1px solid ${isOpen ? 'rgba(255, 255, 255, 0.22)' : '#FECACA'}`,
              letterSpacing: '0.02em',
            }}
          >
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name & Cuisine */}
        <div>
          <h3
            style={{
              fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
              fontSize: 17,
              fontWeight: 600,
              color: '#11120D',
              letterSpacing: '-0.01em',
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
              fontSize: 12,
              color: '#565449',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 500, color: '#11120D' }}>{cuisine || 'Multi-Cuisine'}</span>
            <span style={{ color: '#D8CFBC' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} color="#565449" />
              {distance} km
            </span>
            <span style={{ color: '#D8CFBC' }}>•</span>
            <span>{displayReviewCount} reviews</span>
          </div>
        </div>

        {/* Coupon Ribbon */}
        {activeOffer && (
          <div
            onClick={handleOfferClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 12px',
              borderRadius: 99,
              background: 'rgba(86, 84, 73, 0.06)',
              border: '1px dashed #565449',
              cursor: 'pointer',
              transition: 'all 0.35s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#11120D';
              e.currentTarget.style.background = 'rgba(86, 84, 73, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#565449';
              e.currentTarget.style.background = 'rgba(86, 84, 73, 0.06)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag size={12} color="#565449" />
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  background: '#11120D',
                  color: '#FFFBF4',
                  padding: '2px 8px',
                  borderRadius: 99,
                }}
              >
                {activeOffer.discount || '20% OFF'}
              </span>
              <span style={{ fontSize: 11, color: '#565449' }}>
                · Code: <strong style={{ color: '#11120D' }}>{activeOffer.promoCode || 'CAMPUS20'}</strong>
              </span>
            </div>
            <ChevronRight size={13} color="#565449" />
          </div>
        )}

        {/* Single Primary Action: Book Table */}
        <div style={{ paddingTop: 8, borderTop: '1px solid #F6F2EA' }}>
          <button
            onClick={handleBookClick}
            style={{
              width: '100%',
              padding: '11px 20px',
              borderRadius: 99,
              background: '#11120D',
              color: '#FFFBF4',
              border: '1px solid #11120D',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              cursor: 'pointer',
              minHeight: 42,
              touchAction: 'manipulation',
              transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#2A2B23';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(17, 18, 13, 0.24)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#11120D';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <CalendarDays size={14} />
            <span>Book Table</span>
          </button>
        </div>
      </div>
    </div>
  );
}
