import { useState, useMemo, useEffect, useRef } from 'react';
import RestaurantCircularGallery from '../components/RestaurantCircularGallery';
import BookingModal from '../components/BookingModal';
import OfferDrawer from '../components/OfferDrawer';
import BranchedMenu from '../components/BranchedMenu';
import RubberSegment from '../components/RubberSegment';
import CustomSelect from '../components/CustomSelect';
import { useDining } from '../context/DiningContext';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
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
  { value: 'recommended', label: 'Featured / Recommended' },
  { value: 'rating-desc', label: 'Top Rated (4.8★+)' },
  { value: 'distance-asc', label: 'Nearest to Campus' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'reviews-desc', label: 'Most Popular' },
];

export default function Discover() {
  const { restaurants: liveRestaurants } = useDining();
  const restaurantList = liveRestaurants || [];

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

  const filterMenuItems = useMemo(() => [
    {
      label: 'Cuisines & Dining Style',
      value: 'sec-cuisines',
      count: cuisines.length > 0 ? `${cuisines.length} selected` : undefined,
      children: CUISINES.map(c => ({
        value: `cuisine:${c}`,
        label: c,
        checked: cuisines.includes(c),
        badge: cuisines.includes(c) ? '✓' : undefined,
        icon: <UtensilsCrossed size={13} color={cuisines.includes(c) ? '#11120D' : '#565449'} />
      }))
    },
    {
      label: 'Price Tier',
      value: 'sec-prices',
      count: prices.length > 0 ? `${prices.length} selected` : undefined,
      children: [
        { value: 'price:₹', label: '₹ Casual Dining', checked: prices.includes('₹'), badge: prices.includes('₹') ? '✓' : undefined },
        { value: 'price:₹₹', label: '₹₹ Mid-Range Experience', checked: prices.includes('₹₹'), badge: prices.includes('₹₹') ? '✓' : undefined },
        { value: 'price:₹₹₹', label: '₹₹₹ Premium Fine Dining', checked: prices.includes('₹₹₹'), badge: prices.includes('₹₹₹') ? '✓' : undefined },
      ]
    },
    {
      label: 'Minimum Rating',
      value: 'sec-rating',
      count: minRating !== 'Any' ? minRating : undefined,
      children: RATINGS.map(r => ({
        value: `rating:${r}`,
        label: r === 'Any' ? 'Any Rating' : `${r} Stars or higher`,
        checked: minRating === r,
        badge: minRating === r ? '✓' : undefined,
        icon: <Star size={13} fill={minRating === r ? '#11120D' : 'none'} color="#11120D" />
      }))
    },
    {
      label: 'Campus Privileges & Hours',
      value: 'sec-privileges',
      count: (openOnly ? 1 : 0) + (offersOnly ? 1 : 0) > 0 ? `${(openOnly ? 1 : 0) + (offersOnly ? 1 : 0)} active` : undefined,
      children: [
        {
          value: 'privilege:open',
          label: 'Open Right Now',
          checked: openOnly,
          badge: openOnly ? 'Live' : undefined,
          icon: <Zap size={13} color={openOnly ? '#11120D' : '#565449'} />
        },
        {
          value: 'privilege:offers',
          label: 'Campus Privilege Deals',
          checked: offersOnly,
          badge: offersOnly ? 'Offer' : undefined,
          icon: <Tag size={13} color={offersOnly ? '#11120D' : '#565449'} />
        }
      ]
    }
  ], [cuisines, prices, minRating, openOnly, offersOnly]);

  const activeFilterKeys = useMemo(() => [
    ...cuisines.map(c => `cuisine:${c}`),
    ...prices.map(p => `price:${p}`),
    `rating:${minRating}`,
    ...(openOnly ? ['privilege:open'] : []),
    ...(offersOnly ? ['privilege:offers'] : []),
  ], [cuisines, prices, minRating, openOnly, offersOnly]);

  const handleFilterSelect = (val) => {
    if (val.startsWith('cuisine:')) {
      const c = val.replace('cuisine:', '');
      toggle(cuisines, setCuisines, c);
    } else if (val.startsWith('price:')) {
      const p = val.replace('price:', '');
      toggle(prices, setPrices, p);
    } else if (val.startsWith('rating:')) {
      const r = val.replace('rating:', '');
      setRating(r);
    } else if (val === 'privilege:open') {
      setOpen(prev => !prev);
    } else if (val === 'privilege:offers') {
      setOffers(prev => !prev);
    }
  };

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {/* Title & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 600, color: '#11120D' }}>
              Discover Restaurants
            </h1>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <CustomSelect
              icon={ArrowUpDown}
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={setSortBy}
              align="right"
              ariaLabel="Sort restaurants"
            />
          </div>
        </div>

        {/* District Executive Search Bar & Filter Modal Trigger */}
        <div className="district-discovery-search-container">
          <div className="district-discovery-search-box" style={{ background: '#FFFFFF', border: '1px solid #E8E2D5' }}>
            <Search size={18} style={{ color: '#565449' }} className="shrink-0" />
            <input
              type="text"
              className="district-discovery-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by restaurant name, cuisine, or popular dish..."
              style={{ color: '#11120D' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="district-discovery-search-clear"
                title="Clear search"
                style={{ color: '#565449' }}
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
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E2D5',
              color: '#11120D',
            }}
          >
            <Filter size={15} style={{ color: '#11120D' }} className="shrink-0" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="district-discovery-filter-badge" style={{ background: '#11120D', color: '#FFFBF4' }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Discover 3D Circular Showcase */}
      <div style={{ marginTop: 8 }}>
        {sortedAndFiltered.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E2D5',
              borderRadius: 20,
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(17, 18, 13, 0.04)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#F6F2EA',
                border: '1px solid #E8E2D5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#565449',
              }}
            >
              <UtensilsCrossed size={22} />
            </div>
            <h3
              style={{
                fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                fontSize: 20,
                fontWeight: 600,
                color: '#11120D',
                marginBottom: 6,
              }}
            >
              No Restaurants Found
            </h3>
            <p
              style={{
                fontSize: 13,
                color: '#565449',
                maxWidth: 400,
                margin: '0 auto 20px',
                lineHeight: 1.5,
              }}
            >
              Try adjusting your radius slider, clearing search keywords, or selecting different cuisines.
            </p>
            <button
              type="button"
              onClick={clearAll}
              style={{
                borderRadius: 99,
                padding: '9px 22px',
                fontSize: 12.5,
                fontWeight: 600,
                background: '#11120D',
                color: '#FFFBF4',
                border: '1px solid #11120D',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#2A2B23';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#11120D';
              }}
            >
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <RestaurantCircularGallery
            restaurants={sortedAndFiltered}
            onQuickReserve={rest => setSelectedForBooking(rest)}
            onViewOffer={offer => setSelectedOffer(offer)}
          />
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
            <div className="district-filter-header" style={{ borderBottom: '1px solid #E8E2D5', padding: '16px 20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: '#11120D',
                    color: '#FFFBF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SlidersHorizontal size={16} />
                  </div>
                  <h3 id="filter-modal-title" style={{ fontSize: 17, fontWeight: 700, color: '#11120D', margin: 0, fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif" }}>
                    Filters &amp; Preferences
                  </h3>
                  {activeFiltersCount > 0 && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#11120D',
                      color: '#FFFBF4'
                    }}>
                      {activeFiltersCount} Active
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: '#565449', margin: '4px 0 0', fontWeight: 500 }}>
                  Tailor your dining results near Bennett University
                </p>
              </div>
              <button
                type="button"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1px solid #E8E2D5',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#565449',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F6F2EA';
                  e.currentTarget.style.color = '#11120D';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.color = '#565449';
                }}
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="district-filter-body" style={{ padding: '20px', overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
              {/* 1. Distance Slider & Presets */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#11120D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Radius from Campus
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#11120D', color: '#FFFBF4' }}>
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
                  style={{ width: '100%', accentColor: '#11120D', height: 6, borderRadius: 6, cursor: 'pointer' }}
                />
                {/* Distance Presets with RubberSegment */}
                <div style={{ marginTop: 12 }}>
                  <RubberSegment
                    items={[
                      { value: '1', label: 'Walk (1km)' },
                      { value: '5', label: 'TechZone (5km)' },
                      { value: '10', label: 'All (10km)' }
                    ]}
                    value={String(maxDist)}
                    onChange={(val) => setDist(parseFloat(val))}
                    trackColor="#F6F2EA"
                    thumbColor="#11120D"
                    textColor="#565449"
                    activeTextColor="#FFFBF4"
                    size="sm"
                    radius={99}
                    inset={2.5}
                    equalSlots
                    className="w-full"
                    aria-label="Campus radius presets"
                  />
                </div>
              </div>

              {/* 2. Interactive BranchedMenu Filter Hierarchy */}
              <div style={{ marginTop: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#11120D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Interactive Filter Directory
                  </span>
                  <span style={{ fontSize: 11, color: '#565449', fontWeight: 500 }}>
                    Click branches to toggle
                  </span>
                </div>

                <div
                  style={{
                    background: '#FFFBF4',
                    border: '1px solid #E8E2D5',
                    borderRadius: 16,
                    padding: '16px 18px',
                    boxShadow: 'inset 0 1px 4px rgba(17, 18, 13, 0.02)'
                  }}
                >
                  <BranchedMenu
                    items={filterMenuItems}
                    defaultOpen={[0, 1, 2, 3]}
                    activeValue={activeFilterKeys}
                    onSelect={handleFilterSelect}
                    color="#11120D"
                    accentColor="#11120D"
                    lineColor="#D8CFBC"
                    width="100%"
                    rowHeight={34}
                    indent={38}
                    trunk={14}
                    radius={10}
                    lineWidth={1.5}
                    fontSize={13}
                    drawDuration={320}
                    foldDuration={260}
                  />
                </div>

                {/* Selected Active Filter Tags */}
                {activeFiltersCount > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#565449', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Active Criteria ({activeFiltersCount})
                      </span>
                      <button
                        type="button"
                        onClick={clearAll}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#565449',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        Clear All
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {cuisines.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggle(cuisines, setCuisines, c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#11120D',
                            color: '#FFFBF4',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{c}</span>
                          <X size={11} />
                        </button>
                      ))}

                      {prices.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggle(prices, setPrices, p)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#11120D',
                            color: '#FFFBF4',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{p} Tier</span>
                          <X size={11} />
                        </button>
                      ))}

                      {minRating !== 'Any' && (
                        <button
                          type="button"
                          onClick={() => setRating('Any')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#11120D',
                            color: '#FFFBF4',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>★ {minRating}</span>
                          <X size={11} />
                        </button>
                      )}

                      {openOnly && (
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#11120D',
                            color: '#FFFBF4',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>Open Right Now</span>
                          <X size={11} />
                        </button>
                      )}

                      {offersOnly && (
                        <button
                          type="button"
                          onClick={() => setOffers(false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#11120D',
                            color: '#FFFBF4',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>Privilege Deals</span>
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="district-filter-footer">
              <button
                type="button"
                className="btn-action-cancel"
                onClick={clearAll}
                style={{
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  minHeight: 44,
                  borderRadius: 99,
                  background: '#FFFFFF',
                  border: '1px solid #E8E2D5',
                  color: '#11120D',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
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
                  fontWeight: 700,
                  minHeight: 44,
                  borderRadius: 99,
                  background: '#11120D',
                  border: '1px solid #11120D',
                  color: '#FFFBF4',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
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
