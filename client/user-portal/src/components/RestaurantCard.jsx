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
      className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
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
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Subtle Bottom Vignette for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* Top-Right: Clean Live Status Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-600' : 'bg-rose-500'}`} />
            <span>{isOpen ? 'Open Now' : 'Closed'}</span>
          </span>
        </div>

        {/* Bottom-Left: Single Subtle Campus Offer Chip (if available) */}
        {hasOffer && (
          <div className="absolute bottom-2.5 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-800/90 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
              <Sparkles size={11} className="text-emerald-300" />
              <span>{offerLabel || '20% OFF'} Campus Offer</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header: Name + Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug">
              {name}
            </h3>

            {/* Clean Rating Badge */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-extrabold shrink-0">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>{rating}</span>
              <span className="text-amber-700/60 font-semibold text-[10.5px]">({displayReviewCount})</span>
            </div>
          </div>

          {/* Subtitle: Cuisine · Distance · Price */}
          <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
            <span>{cuisine}</span>
            <span>•</span>
            <span>{distance} km away</span>
            <span>•</span>
            <span className="text-slate-700 font-bold">{price}</span>
          </div>

          {/* Tagline or Popular Dishes */}
          <p className="text-xs text-slate-600 mt-2 line-clamp-1 leading-relaxed">
            {popularDishes && popularDishes.length > 0
              ? `Popular: ${popularDishes.slice(0, 3).join(', ')}`
              : tagline || 'Bennett University verified partner restaurant.'}
          </p>
        </div>

        {/* ── Action Footer ── */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Student Coupon Tag */}
          {activeOffer ? (
            <button
              type="button"
              onClick={handleOfferClick}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
              title="Click to view campus voucher"
            >
              <Tag size={11} className="text-amber-600" />
              <span>{activeOffer.promoCode || 'BENNETT20'}</span>
              <ChevronRight size={11} className="text-amber-500" />
            </button>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <MapPin size={11} /> Bennett Partner
            </span>
          )}

          {/* Clean Book Table CTA */}
          <button
            type="button"
            onClick={handleBookClick}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 min-h-[36px] rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <CalendarDays size={13} />
            <span>Book Table</span>
          </button>
        </div>
      </div>
    </div>
  );
}
