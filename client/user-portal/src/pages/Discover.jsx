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
  MapPin,
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

  const toggle = (arr, set, v) => set(a => a.includes(v) ? a.filter(x => x !== v) : [...a, v]);

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

  const activeFiltersCount = cuisines.length + prices.length + (minRating !== 'Any' ? 1 : 0) + (openOnly ? 1 : 0) + (offersOnly ? 1 : 0);

  return (
    <div className="page-pad" style={{ paddingBottom: 100 }}>
      {/* Header & Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', fontWeight: 800, color: 'var(--t1)' }}>
              District Radar &amp; Discovery
            </h2>
            <p style={{ fontSize: 13, color: 'var(--t3)' }}>
              Explore <strong>{sortedAndFiltered.length}</strong> partner dining spots around Bennett University
            </p>
          </div>

          {/* Sort & View Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '4px 10px' }}>
              <ArrowUpDown size={13} style={{ color: 'var(--primary)' }} />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#000000',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <option value="recommended">Featured / Recommended</option>
                <option value="rating-desc">Top Rated (4.8★+)</option>
                <option value="distance-asc">Nearest to Campus</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="reviews-desc">Most Popular</option>
              </select>
            </div>

            <div style={{ display: 'inline-flex', padding: 4, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', gap: 4 }}>
              <button
                className={`btn btn-xs ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
                style={{ borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: 12 }}
              >
                <Grid size={14} /> Grid
              </button>
              <button
                className={`btn btn-xs ${viewMode === 'map' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('map')}
                style={{ borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: 12 }}
              >
                <Map size={14} /> Map
              </button>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="form-input-wrap" style={{ flex: 1 }}>
            <Search size={18} className="form-input-icon text-indigo-400" />
            <input
              className="form-input"
              style={{ padding: '12px 18px 12px 44px', fontSize: 14, borderRadius: 'var(--r-full)' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by restaurant, dish, or cuisine..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 14, background: 'none', border: 'none', color: 'var(--t4)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={() => setShowMobileFilters(true)}
            style={{
              borderRadius: 'var(--r-full)',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Filter size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: 10 }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Horizontal Quick Filter Pills */}
        <div className="district-scroll-x">
          <button
            type="button"
            className={`chip ${!openOnly && !offersOnly && cuisines.length === 0 ? 'on' : ''}`}
            onClick={clearAll}
            style={{ borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Sparkles size={13} /> All ({restaurantList.length})
          </button>

          <button
            type="button"
            className={`chip ${openOnly ? 'on' : ''}`}
            onClick={() => setOpen(!openOnly)}
            style={{ borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Zap size={13} /> Open Now
          </button>

          <button
            type="button"
            className={`chip ${offersOnly ? 'on' : ''}`}
            onClick={() => setOffers(!offersOnly)}
            style={{ borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Tag size={13} /> Student Deals
          </button>

          {CUISINES.map(c => {
            const active = cuisines.includes(c);
            return (
              <button
                key={c}
                type="button"
                className={`chip ${active ? 'on' : ''}`}
                onClick={() => toggle(cuisines, setCuisines, c)}
                style={{ borderRadius: 'var(--r-full)' }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Discover Layout */}
      <div>
        {viewMode === 'map' ? (
          <InteractiveMap
            restaurants={sortedAndFiltered}
            onSelectRestaurant={(rest) => setSelectedForBooking(rest)}
          />
        ) : (
          <div>
            {sortedAndFiltered.length === 0 ? (
              <div className="card anim-fade-up" style={{ textAlign: 'center', padding: '64px 20px', borderRadius: 'var(--r-lg)' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  border: '1.5px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--primary)'
                }}>
                  <UtensilsCrossed size={26} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                  No Restaurants Found
                </h3>
                <p style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 360, margin: '0 auto 18px' }}>
                  Try widening your distance radius, removing some filters, or clearing your search term.
                </p>
                <button className="btn btn-outline btn-md" onClick={clearAll} style={{ borderRadius: 'var(--r-full)' }}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: 'clamp(14px, 2.5vw, 20px)'
              }}>
                <AnimatePresence mode="popLayout">
                  {sortedAndFiltered.map((r, idx) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.25) }}
                    >
                      <RestaurantCard
                        restaurant={r}
                        onQuickReserve={(rest) => setSelectedForBooking(rest)}
                        onViewOffer={(offer) => setSelectedOffer(offer)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Filter Bottom Sheet / Modal */}
      {showMobileFilters && (
        <div className="modal-overlay" onClick={() => setShowMobileFilters(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-hd">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--district-pink)' }} />
                <h3 className="modal-title font-display">Filters &amp; Radius</h3>
              </div>
              <button className="modal-close" onClick={() => setShowMobileFilters(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Distance Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="form-label" style={{ margin: 0 }}>Max Radius from Campus</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--district-pink)' }}>{maxDist} km</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={maxDist}
                  onChange={e => setDist(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--district-pink)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>
                  <span>0.5 km (Walking)</span>
                  <span>10 km (Car / Auto)</span>
                </div>
              </div>

              {/* Price Bracket */}
              <div>
                <span className="form-label">Price Bracket</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PRICES.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggle(prices, setPrices, p)}
                      className={`chip ${prices.includes(p) ? 'on' : ''}`}
                      style={{ flex: 1, textAlign: 'center', borderRadius: 'var(--r-sm)' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <span className="form-label">Minimum Rating</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {RATINGS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`chip ${minRating === r ? 'on' : ''}`}
                      style={{ flex: 1, textAlign: 'center', borderRadius: 'var(--r-sm)' }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisines Checkboxes */}
              <div>
                <span className="form-label">Cuisines</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {CUISINES.map(c => (
                    <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t2)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={cuisines.includes(c)}
                        onChange={() => toggle(cuisines, setCuisines, c)}
                        style={{ accentColor: 'var(--district-pink)', width: 16, height: 16 }}
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-ft" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clearAll}
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={() => setShowMobileFilters(false)}
                style={{ borderRadius: 'var(--r-full)', padding: '8px 24px' }}
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
          onApplyOffer={(offer) => {
            const target = restaurantList.find(r => r.id === offer.restaurantId) || restaurantList[0];
            if (target) setSelectedForBooking(target);
          }}
        />
      )}
    </div>
  );
}
