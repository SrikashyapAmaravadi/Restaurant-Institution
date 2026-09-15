import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RestaurantCard from '../components/RestaurantCard';
import InteractiveMap from '../components/InteractiveMap';
import BookingModal from '../components/BookingModal';
import OfferDrawer from '../components/OfferDrawer';
import { useDining } from '../context/DiningContext';
import {
  Search,
  SlidersHorizontal,
  Map,
  Grid,
  RotateCcw,
  Sparkles,
  Zap,
  Filter,
  X,
  Star,
  Tag,
  UtensilsCrossed,
  ArrowUpDown
} from 'lucide-react';

const CUISINES = ['North Indian', 'Continental', 'Mediterranean', 'Pan-Asian', 'Vegan'];
const PRICES   = ['₹', '₹₹', '₹₹₹'];
const RATINGS  = ['Any', '4.0+', '4.5+'];

export default function Discover() {
  const { restaurants: liveRestaurants } = useDining();
  const restaurantList = liveRestaurants || [];

  const [viewMode, setViewMode]   = useState('grid'); // 'grid' | 'map'
  const [search, setSearch]       = useState('');
  const [cuisines, setCuisines]   = useState([]);
  const [prices, setPrices]       = useState([]);
  const [minRating, setRating]    = useState('Any');
  const [maxDist, setDist]        = useState(5);
  const [openOnly, setOpen]       = useState(false);
  const [offersOnly, setOffers]   = useState(false);
  const [sortBy, setSortBy]       = useState('recommended');
  const [selectedForBooking, setSelectedForBooking] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggle = (arr, set, v) => set(a => (a.includes(v) ? a.filter(x => x !== v) : [...a, v]));

  const filtered = useMemo(() => {
    return restaurantList.filter(r => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = r.name?.toLowerCase().includes(q);
        const matchCuisine = r.cuisine?.toLowerCase().includes(q);
        const matchTag = r.tags?.some(t => t.toLowerCase().includes(q));
        const matchDish = r.popularDishes?.some(d => d.toLowerCase().includes(q));
        if (!matchName && !matchCuisine && !matchTag && !matchDish) return false;
      }
      if (cuisines.length && !cuisines.includes(r.cuisine)) return false;
      if (prices.length && !prices.includes(r.price)) return false;
      if (minRating === '4.0+' && (r.rating || 0) < 4.0) return false;
      if (minRating === '4.5+' && (r.rating || 0) < 4.5) return false;
      if ((r.distance || 0) > maxDist) return false;
      if (openOnly && !r.isOpen) return false;
      if (offersOnly && !r.hasOffer) return false;
      return true;
    });
  }, [restaurantList, search, cuisines, prices, minRating, maxDist, openOnly, offersOnly]);

  const sortedAndFiltered = useMemo(() => {
    let list = [...filtered];
    if (sortBy === 'rating-desc') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'distance-asc') {
      list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'price-asc') {
      const pVal = p => (p === '₹' ? 1 : p === '₹₹' ? 2 : 3);
      list.sort((a, b) => pVal(a.price) - pVal(b.price));
    } else if (sortBy === 'price-desc') {
      const pVal = p => (p === '₹' ? 1 : p === '₹₹' ? 2 : 3);
      list.sort((a, b) => pVal(b.price) - pVal(a.price));
    } else if (sortBy === 'reviews-desc') {
      list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
    return list;
  }, [filtered, sortBy]);

  const clearAll = () => {
    setSearch('');
    setCuisines([]);
    setPrices([]);
    setRating('Any');
    setDist(5);
    setOpen(false);
    setOffers(false);
    setSortBy('recommended');
  };

  const activeFiltersCount =
    cuisines.length +
    prices.length +
    (minRating !== 'Any' ? 1 : 0) +
    (openOnly ? 1 : 0) +
    (offersOnly ? 1 : 0);

  return (
    <div className="page-pad pb-24">
      {/* Header & Controls Section */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Title & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Campus Radar &amp; Discovery
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore <strong>{sortedAndFiltered.length}</strong> partner dining spots around Bennett University
            </p>
          </div>

          {/* Sort & Segmented View Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Sort Selector */}
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <ArrowUpDown size={13} className="text-emerald-700 shrink-0" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border-none outline-none bg-transparent text-slate-800 text-xs font-semibold cursor-pointer"
              >
                <option value="recommended">Featured / Recommended</option>
                <option value="rating-desc">Top Rated (4.8★+)</option>
                <option value="distance-asc">Nearest to Campus</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="reviews-desc">Most Popular</option>
              </select>
            </div>

            {/* Segmented Grid / Map Control */}
            <div style={{ display: 'inline-flex', padding: 4, background: '#F1F5F9', border: '1px solid var(--border)', borderRadius: 12, gap: 4 }}>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  minHeight: 34,
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'grid' ? '#0F172A' : '#64748B',
                  boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={14} />
                <span>Grid</span>
              </button>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  minHeight: 34,
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: viewMode === 'map' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'map' ? '#0F172A' : '#64748B',
                  boxShadow: viewMode === 'map' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setViewMode('map')}
              >
                <Map size={14} />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by restaurant name, cuisine, or popular dish..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter Modal Trigger */}
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 18px',
              minHeight: 42,
              borderRadius: 12,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              flexShrink: 0
            }}
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter size={14} className="text-slate-500" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span style={{ marginLeft: 4, padding: '2px 7px', borderRadius: 99, fontSize: 10.5, fontWeight: 800, background: '#0F172A', color: '#FFFFFF' }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Filter Horizontal Scroll Stream */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              minHeight: 36,
              borderRadius: 99,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              border: !openOnly && !offersOnly && cuisines.length === 0 ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
              background: !openOnly && !offersOnly && cuisines.length === 0 ? '#0F172A' : '#FFFFFF',
              color: !openOnly && !offersOnly && cuisines.length === 0 ? '#FFFFFF' : '#334155'
            }}
            onClick={clearAll}
          >
            <Sparkles size={13} />
            <span>All ({restaurantList.length})</span>
          </button>

          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              minHeight: 36,
              borderRadius: 99,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              border: openOnly ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
              background: openOnly ? '#0F172A' : '#FFFFFF',
              color: openOnly ? '#FFFFFF' : '#334155'
            }}
            onClick={() => setOpen(!openOnly)}
          >
            <Zap size={13} />
            <span>Open Now</span>
          </button>

          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              minHeight: 36,
              borderRadius: 99,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              border: offersOnly ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
              background: offersOnly ? '#0F172A' : '#FFFFFF',
              color: offersOnly ? '#FFFFFF' : '#334155'
            }}
            onClick={() => setOffers(!offersOnly)}
          >
            <Tag size={13} />
            <span>Campus Offers</span>
          </button>

          {CUISINES.map(c => {
            const isSelected = cuisines.includes(c);
            return (
              <button
                key={c}
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  minHeight: 36,
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                  border: isSelected ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
                  background: isSelected ? '#0F172A' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155'
                }}
                onClick={() => toggle(cuisines, setCuisines, c)}
              >
                <UtensilsCrossed size={12} />
                <span>{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Discover Layout (Grid or Map) */}
      <div>
        {viewMode === 'map' ? (
          <InteractiveMap
            restaurants={sortedAndFiltered}
            onSelectRestaurant={rest => setSelectedForBooking(rest)}
          />
        ) : (
          <div>
            {sortedAndFiltered.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <UtensilsCrossed size={22} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  No Restaurants Found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5">
                  Try adjusting your radius slider, clearing search keywords, or selecting different cuisines.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  onClick={clearAll}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {sortedAndFiltered.map((r, idx) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.2) }}
                    >
                      <RestaurantCard
                        restaurant={r}
                        onQuickReserve={rest => setSelectedForBooking(rest)}
                        onViewOffer={offer => setSelectedOffer(offer)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Luxury Slide-Over Filter Drawer */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end transition-opacity"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={17} className="text-slate-900" />
                  <h3 className="font-bold text-lg text-slate-900">Filters &amp; Preferences</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tailor your dining results near Bennett University
                </p>
              </div>
              <button
                className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Distance Slider & Presets */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Radius from Campus
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                    {maxDist} km
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={maxDist}
                  onChange={e => setDist(parseFloat(e.target.value))}
                  className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                {/* Distance Presets */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: 'Walk (1km)', val: 1 },
                    { label: 'TechZone (5km)', val: 5 },
                    { label: 'All (10km)', val: 10 }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setDist(p.val)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                        maxDist === p.val
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Category */}
              <div>
                <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Price Tier
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '₹', label: '₹ Casual' },
                    { id: '₹₹', label: '₹₹ Mid' },
                    { id: '₹₹₹', label: '₹₹₹ Fine' }
                  ].map(p => {
                    const isSelected = prices.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggle(prices, setPrices, p.id)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Minimum Rating
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {RATINGS.map(r => {
                    const isSelected = minRating === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {r !== 'Any' && <Star size={11} className={isSelected ? 'fill-amber-400 text-amber-400' : 'fill-amber-500 text-amber-500'} />}
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cuisines Pill Toggle (No Raw Checkboxes) */}
              <div>
                <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Cuisines &amp; Specialties
                </span>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map(c => {
                    const isSelected = cuisines.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggle(cuisines, setCuisines, c)}
                        className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <UtensilsCrossed size={12} className={isSelected ? 'text-emerald-400' : 'text-slate-400'} />
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status & Perks Toggles */}
              <div>
                <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Privileges &amp; Availability
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setOpen(!openOnly)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      openOnly
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap size={16} className={openOnly ? 'text-emerald-700' : 'text-slate-400'} />
                      <span className="text-xs font-bold">Open Right Now</span>
                    </div>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${openOnly ? 'bg-emerald-700 text-white' : 'border border-slate-300'}`}>
                      {openOnly ? '✓' : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOffers(!offersOnly)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      offersOnly
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Tag size={16} className={offersOnly ? 'text-amber-700' : 'text-slate-400'} />
                      <span className="text-xs font-bold">Campus Privilege Deals</span>
                    </div>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${offersOnly ? 'bg-amber-700 text-white' : 'border border-slate-300'}`}>
                      {offersOnly ? '✓' : ''}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Sticky Footer */}
            <div className="p-5 border-t border-slate-100 flex items-center gap-3 bg-slate-50">
              <button
                type="button"
                className="btn btn-outline btn-md"
                onClick={clearAll}
                style={{ borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700 }}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md flex-1"
                onClick={() => setShowMobileFilters(false)}
                style={{ borderRadius: 12, padding: '12px 22px', fontSize: 13.5, fontWeight: 800 }}
              >
                Show {filtered.length} Restaurants
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedForBooking && (
        <BookingModal
          restaurant={selectedForBooking}
          isOpen={!!selectedForBooking}
          onClose={() => setSelectedForBooking(null)}
        />
      )}

      {/* Campus Offer Drawer */}
      {selectedOffer && (
        <OfferDrawer
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onApplyOffer={offer => {
            const target =
              restaurantList.find(r => r.id === offer.restaurantId) || restaurantList[0];
            if (target) setSelectedForBooking(target);
          }}
        />
      )}
    </div>
  );
}
