import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Sparkles, Zap, ArrowRight, ShieldCheck, Leaf, Utensils, Tag, ChevronRight } from 'lucide-react';

export default function RestaurantCard({ restaurant, onQuickReserve, onViewOffer }) {
  const navigate = useNavigate();
  const {
    id,
    name,
    tagline,
    cuisine,
    price,
    rating = 4.8,
    reviews = 142,
    distance = 0.8,
    isOpen = true,
    hasOffer = true,
    offerLabel = '20% OFF',
    image,
    popularDishes = []
  } = restaurant;

  const activeOffer = (restaurant.offers && restaurant.offers.length > 0 && restaurant.offers[0]) || (hasOffer ? {
    id: `offer-${id}`,
    title: offerLabel ? `${offerLabel} Campus Deal` : 'Student Exclusive Offer',
    description: `Save with ${offerLabel || 'exclusive discounts'} on your dining bill with verified Bennett credentials.`,
    discount: offerLabel || '20% OFF',
    discountPercent: 20,
    promoCode: `BENNETT${id}0`,
    code: `BENNETT${id}0`,
    minOrderAmount: 250,
    validTill: 'End of Semester',
    terms: 'Valid on dine-in reservations for verified students & faculty.',
    restaurantName: name
  } : null);

  const handleCardClick = () => {
    navigate(`/restaurant/${id}`);
  };

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
        description: activeOffer.description || `Special dining discount for verified Bennett University students & faculty.`,
        code: activeOffer.promoCode || activeOffer.code || `BENNETT${id}0`,
        validTill: activeOffer.endDate || activeOffer.validTill || 'End of Semester'
      };
      if (onViewOffer) {
        onViewOffer(fullOffer);
      } else {
        navigate(`/restaurant/${id}?tab=offers`);
      }
    }
  };

  return (
    <div
      className="rc anim-fade-up"
      onClick={handleCardClick}
      style={{ position: 'relative' }}
    >
      {/* 16:9 Full-Bleed Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden' }}>
        <img
          src={image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          loading="lazy"
          className="rc-image"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Ambient Gradient Vignette */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(15, 23, 42, 0.75) 100%)'
        }} />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, zIndex: 2 }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--r-full)',
              background: isOpen ? 'rgba(5, 150, 105, 0.95)' : 'rgba(220, 38, 38, 0.95)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              fontSize: 10.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF' }} />
            {isOpen ? 'Open Now' : 'Closed'}
          </span>

          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--r-full)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              color: 'var(--t1)',
              fontSize: 10.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}
          >
            <MapPin size={11} style={{ color: 'var(--primary)' }} />
            {distance} km
          </span>
        </div>

        {/* Top Right Offer Pill */}
        {hasOffer && (
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
            <span
              style={{
                padding: '3px 9px',
                borderRadius: 'var(--r-full)',
                background: 'linear-gradient(135deg, var(--accent) 0%, #D97706 100%)',
                color: '#FFFFFF',
                fontSize: 10.5,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 8px var(--accent-glow)'
              }}
            >
              <Sparkles size={11} /> {offerLabel || '20% OFF'}
            </span>
          </div>
        )}

        {/* District Live Booking Pill on image bottom */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          right: 12,
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            padding: '3px 8px',
            borderRadius: 'var(--r-xs)',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            fontSize: 10.5,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backdropFilter: 'blur(6px)'
          }}>
            <Zap size={11} style={{ color: '#60A5FA' }} /> Instant Seating
          </span>

          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#FFFFFF',
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '2px 8px',
            borderRadius: 4
          }}>
            {price}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
          <div>
            <h3 className="rc-title font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--t1)', lineHeight: 1.25 }}>
              {name}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {tagline || cuisine}
            </p>
          </div>

          {/* Rating Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 7px',
            borderRadius: 'var(--r-xs)',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0
          }}>
            <Star size={12} fill="#059669" color="#059669" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Cuisine & Specialties */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8, marginBottom: 14 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--r-full)',
            background: '#F8FAFC',
            border: '1px solid var(--border)',
            color: 'var(--t2)'
          }}>
            {cuisine}
          </span>
          <span style={{
            fontSize: 10.5,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--r-full)',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: 'var(--lora-leaf)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Leaf size={10} /> Farm-To-Table
          </span>
          {popularDishes && popularDishes[0] && (
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 'var(--r-full)',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Utensils size={10} /> {popularDishes[0]}
            </span>
          )}
        </div>

        {/* Campus Offer Snippet on Card */}
        {activeOffer && (
          <div
            className="rc-offer-banner"
            onClick={handleOfferClick}
            style={{
              marginBottom: 12,
              padding: '9px 12px',
              borderRadius: 'var(--r-sm)',
              background: '#FFFBEB',
              border: '1.5px dashed #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              cursor: 'pointer'
            }}
            title="Click to view offer details & voucher terms"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: '#F59E0B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Tag size={13} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#92400E' }}>
                    {activeOffer.discount || offerLabel || 'Campus Deal'}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: '#FFFFFF',
                    border: '1px solid #FCD34D',
                    color: '#B45309',
                    letterSpacing: '0.04em'
                  }}>
                    {activeOffer.promoCode || activeOffer.code || `BENNETT${id}0`}
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: '#B45309', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeOffer.title || 'Bennett verified diners special'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOfferClick}
              style={{
                padding: '4px 9px',
                borderRadius: 'var(--r-full)',
                background: '#FFFFFF',
                border: '1px solid #F59E0B',
                color: '#B45309',
                fontSize: 10.5,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(245, 158, 11, 0.15)'
              }}
            >
              <span>View Deal</span>
              <ChevronRight size={11} />
            </button>
          </div>
        )}

        {/* Card Footer: Reviews & One-Tap Book / Explore CTA */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 10,
          borderTop: '1px solid var(--border)',
          gap: 8,
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 11.5, color: 'var(--t4)' }}>
            {typeof reviews === 'number' ? reviews : (Array.isArray(reviews) ? reviews.length : 142)} Bennett reviews
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/restaurant/${id}`);
              }}
              style={{
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 'var(--r-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title={`Explore ${name} menu road & specialties`}
            >
              <span>Explore</span>
              <ChevronRight size={13} />
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm cursor-pointer"
              onClick={handleBookClick}
              style={{
                padding: '5px 13px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 'var(--r-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span>Book Table</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
