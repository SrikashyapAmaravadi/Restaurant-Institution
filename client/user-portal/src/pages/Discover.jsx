import { useState, useMemo, useEffect, useRef } from 'react';
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
  ArrowUpDown,
  ChevronDown,
  Check
} from 'lucide-react';

const CUISINES = ['North Indian', 'Continental', 'Mediterranean', 'Pan-Asian', 'Vegan'];
const PRICES   = ['₹', '₹₹', '₹₹₹'];
const RATINGS  = ['Any', '4.0+', '4.5+'];

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Featured / Recommended' },
  { id: 'rating-desc', label: 'Top Rated (4.8★+)' },
  { id: 'distance-asc', label: 'Nearest to Campus' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'reviews-desc', label: 'Most Popular' },
];

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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [selectedForBooking, setSelectedForBooking] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Close filter modal on ESC and lock body scroll
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') setShowMobileFilters(false);
    };
    if (showMobileFilters) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showMobileFilters]);

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
            {/* Custom Luxury Sort Selector */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(prev => !prev)}
                className={`custom-dropdown-trigger ${isSortOpen ? 'open' : ''}`}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <ArrowUpDown size={13} className="text-slate-900 shrink-0" />
                <span>
                  {SORT_OPTIONS.find(o => o.id === sortBy)?.label || 'Featured / Recommended'}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-slate-500 transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-slate-900' : ''}`}
                />
              </button>

              {isSortOpen && (
                <div className="custom-dropdown-panel" role="listbox">
                  <div className="px-3 py-2 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Sort Restaurants
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {SORT_OPTIONS.map(opt => {
                      const isSelected = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSortBy(opt.id);
                            setIsSortOpen(false);
                          }}
                          className={`custom-dropdown-option ${isSelected ? 'selected' : ''}`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <Check size={14} strokeWidth={2.5} className="text-white shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Segmented Grid / Map Control */}
            <div style={{ display: 'inline-flex', padding: 3, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 12, gap: 2 }}>
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
                  background: viewMode === 'grid' ? '#0F172A' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#64748B',
                  boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
                  transition: 'all 0.25s ease'
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
                  background: viewMode === 'map' ? '#0F172A' : 'transparent',
                  color: viewMode === 'map' ? '#FFFFFF' : '#64748B',
                  boxShadow: viewMode === 'map' ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
                  transition: 'all 0.25s ease'
                }}
                onClick={() => setViewMode('map')}
              >
                <Map size={14} />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* District Executive Search Bar & Filter Modal Trigger */}
        <div className="district-discovery-search-container">
          <div className="district-discovery-search-box">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              className="district-discovery-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by restaurant name, cuisine, or popular dish..."
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="district-discovery-search-clear"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Modal Trigger */}
          <button
            type="button"
            className="district-discovery-filter-btn"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter size={15} className="text-slate-800 shrink-0" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="district-discovery-filter-badge">
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
              border: !openOnly && !offersOnly && cuisines.length === 0 ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
              background: !openOnly && !offersOnly && cuisines.length === 0 ? '#0F172A' : '#FFFFFF',
              color: !openOnly && !offersOnly && cuisines.length === 0 ? '#FFFFFF' : '#334155',
              boxShadow: !openOnly && !offersOnly && cuisines.length === 0 ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
              border: openOnly ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
              background: openOnly ? '#0F172A' : '#FFFFFF',
              color: openOnly ? '#FFFFFF' : '#334155',
              boxShadow: openOnly ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
              border: offersOnly ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
              background: offersOnly ? '#0F172A' : '#FFFFFF',
              color: offersOnly ? '#FFFFFF' : '#334155',
              boxShadow: offersOnly ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={() => setOffers(!offersOnly)}
          >
            <Tag size={13} />
            <span>Campus Deals</span>
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
                  border: isSelected ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
                  background: isSelected ? '#0F172A' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  boxShadow: isSelected ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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

      {/* Executive Filter Pop-up Modal (District Design System) */}
      {showMobileFilters && (
        <div
          className="district-filter-overlay"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="district-filter-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-modal-title"
          >
            {/* Modal Header */}
            <div className="district-filter-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: '#0F172A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SlidersHorizontal size={16} />
                  </div>
                  <h3 id="filter-modal-title" style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Filters &amp; Preferences
                  </h3>
                  {activeFiltersCount > 0 && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 800,
                      background: '#F1F5F9',
                      color: '#0F172A'
                    }}>
                      {activeFiltersCount} Active
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
                  Tailor your dining results near Bennett University
                </p>
              </div>
              <button
                type="button"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F1F5F9';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.color = '#64748B';
                }}
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="district-filter-body">
              {/* 1. Distance Slider & Presets */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Radius from Campus
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: '#0F172A', color: '#FFFFFF' }}>
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
                  style={{ width: '100%', accentColor: '#0F172A', height: 6, borderRadius: 6, cursor: 'pointer' }}
                />
                {/* Distance Presets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
                  {[
                    { label: 'Walk (1km)', val: 1 },
                    { label: 'TechZone (5km)', val: 5 },
                    { label: 'All (10km)', val: 10 }
                  ].map(p => {
                    const isSelected = maxDist === p.val;
                    return (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setDist(p.val)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: isSelected ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
                          background: isSelected ? '#0F172A' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          boxShadow: isSelected ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Side-by-Side Grid: Price Category & Minimum Rating */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {/* Price Tier */}
                <div>
                  <span style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Price Tier
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
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
                          style={{
                            padding: '8px 4px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center',
                            border: isSelected ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
                            background: isSelected ? '#0F172A' : '#F8FAFC',
                            color: isSelected ? '#FFFFFF' : '#475569',
                            boxShadow: isSelected ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <span style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Minimum Rating
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {RATINGS.map(r => {
                      const isSelected = minRating === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRating(r)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            border: isSelected ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
                            background: isSelected ? '#0F172A' : '#F8FAFC',
                            color: isSelected ? '#FFFFFF' : '#475569',
                            boxShadow: isSelected ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          {r !== 'Any' && <Star size={11} className={isSelected ? 'fill-white text-white' : 'fill-slate-900 text-slate-900'} />}
                          <span>{r}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Cuisines & Specialties Pills */}
              <div>
                <span style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Cuisines &amp; Specialties
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CUISINES.map(c => {
                    const isSelected = cuisines.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggle(cuisines, setCuisines, c)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 99,
                          fontSize: 12.5,
                          fontWeight: 650,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          border: isSelected ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
                          background: isSelected ? '#0F172A' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#334155',
                          boxShadow: isSelected ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        <UtensilsCrossed size={12} className={isSelected ? 'text-white' : 'text-slate-700'} />
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Privileges & Availability (Interactive Cards) */}
              <div>
                <span style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Privileges &amp; Availability
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setOpen(!openOnly)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      border: openOnly ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
                      background: openOnly ? '#0F172A' : '#FFFFFF',
                      color: openOnly ? '#FFFFFF' : '#1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: openOnly ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Zap size={16} className={openOnly ? 'text-white' : 'text-slate-500'} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Open Right Now</span>
                    </div>
                    <span style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      background: openOnly ? '#FFFFFF' : 'transparent',
                      color: '#0F172A',
                      border: openOnly ? 'none' : '1.5px solid #CBD5E1'
                    }}>
                      {openOnly ? '✓' : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOffers(!offersOnly)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      border: offersOnly ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
                      background: offersOnly ? '#0F172A' : '#FFFFFF',
                      color: offersOnly ? '#FFFFFF' : '#1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: offersOnly ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Tag size={16} className={offersOnly ? 'text-white' : 'text-slate-500'} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Campus Privilege Deals</span>
                    </div>
                    <span style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      background: offersOnly ? '#FFFFFF' : 'transparent',
                      color: '#0F172A',
                      border: offersOnly ? 'none' : '1.5px solid #CBD5E1'
                    }}>
                      {offersOnly ? '✓' : ''}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="district-filter-footer">
              <button
                type="button"
                className="btn-action-cancel"
                onClick={clearAll}
                style={{ padding: '10px 18px', fontSize: 13, minHeight: 42, borderRadius: 12 }}
              >
                <RotateCcw size={14} />
                <span>Reset All</span>
              </button>
              <button
                type="button"
                className="btn-action-admit"
                onClick={() => setShowMobileFilters(false)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  fontSize: 13.5,
                  fontWeight: 800,
                  minHeight: 44,
                  borderRadius: 12,
                  justifyContent: 'center'
                }}
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
