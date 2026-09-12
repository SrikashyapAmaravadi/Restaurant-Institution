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
            <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-xl gap-1">
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={13} />
                <span>Grid</span>
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('map')}
              >
                <Map size={13} />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 flex items-center">
            <Search size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15 shadow-xs"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors shrink-0"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Filter Horizontal Scroll Stream */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
              !openOnly && !offersOnly && cuisines.length === 0
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            onClick={clearAll}
          >
            <Sparkles size={12} />
            <span>All ({restaurantList.length})</span>
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
              openOnly
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setOpen(!openOnly)}
          >
            <Zap size={12} />
            <span>Open Now</span>
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
              offersOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setOffers(!offersOnly)}
          >
            <Tag size={12} />
            <span>Student Deals</span>
          </button>

          {CUISINES.map(c => {
            const active = cuisines.includes(c);
            return (
              <button
                key={c}
                type="button"
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                  active
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => toggle(cuisines, setCuisines, c)}
              >
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

      {/* Mobile Filter Sheet Modal */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-700" />
                <h3 className="font-bold text-base text-slate-900">Filters &amp; Radius</h3>
              </div>
              <button
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
                onClick={() => setShowMobileFilters(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              {/* Distance Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Radius from Campus
                  </span>
                  <span className="text-xs font-bold text-emerald-700">{maxDist} km</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={maxDist}
                  onChange={e => setDist(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>0.5 km (Walk)</span>
                  <span>10 km (Cab / Auto)</span>
                </div>
              </div>

              {/* Price Bracket */}
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Price Category
                </span>
                <div className="flex gap-2">
                  {PRICES.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggle(prices, setPrices, p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        prices.includes(p)
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Minimum Rating
                </span>
                <div className="flex gap-2">
                  {RATINGS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        minRating === r
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisines Grid */}
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cuisines
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {CUISINES.map(c => (
                    <label
                      key={c}
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={cuisines.includes(c)}
                        onChange={() => toggle(cuisines, setCuisines, c)}
                        className="accent-emerald-700 w-4 h-4 rounded"
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-100 mt-6">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                onClick={clearAll}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-xs transition-colors"
                onClick={() => setShowMobileFilters(false)}
              >
                Apply ({filtered.length} spots)
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
