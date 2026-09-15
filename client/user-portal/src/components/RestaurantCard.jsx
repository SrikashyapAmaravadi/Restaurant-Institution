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
        description:
          activeOffer.description ||
          'Special dining discount for verified Bennett University students & faculty.',
        code: activeOffer.promoCode || activeOffer.code || `BENNETT${id}0`,
        validTill: activeOffer.endDate || activeOffer.validTill || 'End of Semester',
      };
      if (onViewOffer) {
        onViewOffer(fullOffer);
      } else {
        navigate(`/restaurant/${id}?tab=offers`);
      }
    }
  };

  const displayReviewCount = typeof reviews === 'number'
    ? reviews
    : (Array.isArray(reviews) ? reviews.length : 142);

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* ── Crisp Food Photography Container ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={
            image ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
          }
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300 ease-out"
        />

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/10" />

        {/* Top-Right: Clean Live Status Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-semibold shadow-xs border border-slate-200/50">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-600' : 'bg-rose-500'}`} />
            <span>{isOpen ? 'Open Now' : 'Closed'}</span>
          </span>
        </div>

        {/* Bottom-Left: Refined Campus Privilege Chip */}
        {hasOffer && (
          <div className="absolute bottom-2.5 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-semibold shadow-xs border border-white/10">
              <Sparkles size={11} className="text-amber-400" />
              <span>{offerLabel || '20% OFF'} Privilege</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Header: Name + Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1 leading-snug">
              {name}
            </h3>

            {/* Clean Rating Badge */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold shrink-0">
              <Star size={11} className="fill-amber-500 text-amber-500" />
              <span>{rating}</span>
              <span className="text-amber-700/70 font-medium text-[10.5px]">({displayReviewCount})</span>
            </div>
          </div>

          {/* Subtitle: Cuisine · Distance · Price */}
          <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-slate-700 font-semibold">{cuisine}</span>
            <span>•</span>
            <span>{distance} km</span>
            <span>•</span>
            <span className="text-slate-800 font-bold">{price}</span>
          </div>

          {/* Tagline or Popular Dishes */}
          <p className="text-xs text-slate-500 mt-2 line-clamp-1 leading-relaxed">
            {popularDishes && popularDishes.length > 0
              ? `Popular: ${popularDishes.slice(0, 3).join(', ')}`
              : tagline || 'Bennett University verified dining partner.'}
          </p>
        </div>

        {/* ── Action Footer ── */}
        <div style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10
        }}>
          {/* Student Coupon Tag */}
          {activeOffer ? (
            <button
              type="button"
              onClick={handleOfferClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '8px 12px',
                minHeight: 38,
                borderRadius: 10,
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
              title="View campus privilege code"
            >
              <Tag size={12} className="text-amber-600" />
              <span>{activeOffer.promoCode || 'BENNETT20'}</span>
              <ChevronRight size={12} className="text-amber-500" />
            </button>
          ) : (
            <span style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#94A3B8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              paddingLeft: 2
            }}>
              <MapPin size={13} className="text-slate-400" /> Partner Venue
            </span>
          )}

          {/* Clean Book Table CTA */}
          <button
            type="button"
            onClick={handleBookClick}
            className="btn btn-primary btn-sm"
            style={{
              padding: '9px 18px',
              minHeight: 38,
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 700
            }}
          >
            <CalendarDays size={14} />
            <span>Reserve Table</span>
          </button>
        </div>
      </div>
    </div>
  );
}
