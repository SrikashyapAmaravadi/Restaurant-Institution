import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import BookingModal from '../components/BookingModal';
import DigitalPassModal from '../components/DigitalPassModal';
import OfferDrawer from '../components/OfferDrawer';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Search,
  Sparkles,
  QrCode,
  ArrowRight,
  Zap,
  Tag,
  Star,
  Leaf,
  Coffee,
  Pizza,
  Utensils,
  Soup,
  Trees,
  UtensilsCrossed,
  Compass,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurants = [], reservations = [], loading = false } = useDining() || {};

  const [selectedRestaurantForBooking, setSelectedRestaurant] = useState(null);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeMood, setActiveMood] = useState(null);

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  // Active confirmed or seated booking
  const upcoming = safeReservations.find(
    b => b?.status === 'CONFIRMED' || b?.status === 'SEATED'
  );

  // Campus Dining Mood Categories
  const MOOD_STORIES = [
    { id: 'farm', label: 'Farm to Table', icon: Leaf, tag: 'Organic' },
    { id: 'cafes', label: 'Study Cafes', icon: Coffee, cuisine: 'Continental' },
    { id: 'pizza', label: 'Pizza & Brews', icon: Pizza, cuisine: 'Continental' },
    { id: 'mughlai', label: 'Tandoor & Curry', icon: Utensils, cuisine: 'North Indian' },
    { id: 'asian', label: 'Asian & Ramen', icon: Soup, cuisine: 'Pan-Asian' },
    { id: 'patio', label: 'Open Patio', icon: Trees, tag: 'Outdoor Patio' },
    { id: 'quick', label: 'Quick Bites', icon: UtensilsCrossed, tag: 'Fast Casual' },
    { id: 'dessert', label: 'Boba & Sweets', icon: Sparkles, tag: 'Boba Tea Bar' },
  ];

  // Filter Chips
  const FILTERS = [
    { id: 'All', label: 'All Spots', icon: Compass },
    { id: 'Offers', label: 'Campus Deals', icon: Tag },
    { id: 'TopRated', label: 'Top Rated (4.5+)', icon: Star },
    { id: 'Instant', label: 'Instant Pass', icon: Zap },
    { id: 'NorthIndian', label: 'North Indian', icon: Utensils },
    { id: 'Continental', label: 'Continental', icon: Pizza },
    { id: 'PanAsian', label: 'Pan-Asian', icon: Soup },
  ];

  const handleMoodSelect = mood => {
    if (activeMood === mood.id) {
      setActiveMood(null);
      setActiveFilter('All');
    } else {
      setActiveMood(mood.id);
      if (mood.cuisine) {
        setActiveFilter(mood.cuisine.replace(' ', ''));
      }
    }
  };

  // Filter logic
  const filteredRestaurants = safeRestaurants.filter(r => {
    if (activeFilter === 'Instant') return true;
    if (activeFilter === 'Offers') return r.hasOffer;
    if (activeFilter === 'TopRated') return (r.rating || 0) >= 4.5;
    if (activeFilter === 'NorthIndian') return r.cuisine?.toLowerCase().includes('north indian');
    if (activeFilter === 'Continental') return r.cuisine?.toLowerCase().includes('continental');
    if (activeFilter === 'PanAsian') return r.cuisine?.toLowerCase().includes('asian');
    if (activeMood) {
      const story = MOOD_STORIES.find(m => m.id === activeMood);
      if (story?.cuisine && !r.cuisine?.toLowerCase().includes(story.cuisine.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'Member';

  return (
    <div className="page-pad pb-28 flex flex-col gap-7">
      {/* ── Executive Greeting & Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Bennett TechZone Active
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Official Dining Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Welcome back, {firstName}
          </h1>
        </div>

        {/* Global Search Trigger */}
        <div
          onClick={() => navigate('/discover')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs cursor-pointer transition-all sm:min-w-[320px]"
        >
          <Search size={16} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium flex-1 truncate">
            Search partner menus, cafes, or cuisines...
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Quick KPI Metrics Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Pass</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900">
              {upcoming ? '1 Active' : '0 Active'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">
            {upcoming ? `Table ${upcoming.tableAssigned || 'T-01'} Held` : 'Instant reservation ready'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Partner Outlets</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900">{safeRestaurants.length}</span>
            <span className="text-xs font-semibold text-slate-500">Venues</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">Around Bennett TechZone</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Member Discount</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900">20% Flat</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1">Applied on bill settlement</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Queue Status</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-700">Priority</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">Zero wait table guarantee</span>
        </div>
      </div>

      {/* ── Active Reservation Digital Pass (Boarding Pass Ticket) ── */}
      {upcoming && (
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <QrCode size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Confirmed Table Pass
                </span>
                <span className="text-xs text-slate-400">
                  {upcoming.date} • {upcoming.time}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                {upcoming.restaurantName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pass ID: <span className="font-mono text-slate-300">{upcoming.id}</span> • Table {upcoming.tableAssigned || 'T-01'} • {upcoming.partySize || 2} Guests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              type="button"
              onClick={() => setSelectedBookingForPass(upcoming)}
              className="btn btn-emerald btn-md"
              style={{ borderRadius: 10, padding: '10px 22px' }}
            >
              <QrCode size={15} />
              <span>Access Digital Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Curated Mood Collections ── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-slate-900" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Curated Dining Collections
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Select a vibe to filter</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {MOOD_STORIES.map(mood => {
            const Icon = mood.icon;
            const isSelected = activeMood === mood.id;
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => handleMoodSelect(mood)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shrink-0 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                <span className="text-xs font-semibold whitespace-nowrap">
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Executive Institutional Spotlight Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-7 shadow-sm border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-amber-300 text-[11px] font-semibold tracking-wide mb-2.5 border border-white/10">
            <Sparkles size={12} className="text-amber-400" />
            <span>BENNETT UNIVERSITY HOSPITALITY NETWORK</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            Curated Dining &amp; Guaranteed Priority Seating
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Reserve certified dining spots across Bennett TechZone with digital entry passes, guaranteed table holds, and 20% flat student privileges.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="btn btn-outline btn-md"
            style={{ borderRadius: 10, background: '#FFFFFF', color: '#0F172A', fontWeight: 700 }}
          >
            <span>Explore Full Directory</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Filter Chips Stream ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => {
          const FilterIcon = f.icon;
          const isSelected = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setActiveFilter(f.id);
                setActiveMood(null);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FilterIcon size={13} className={isSelected ? 'text-white' : 'text-slate-400'} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Top Dining Spots Section ── */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Verified Dining Partners
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredRestaurants.length} establishments available in TechZone II
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            <span>Radar Map</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
            <p className="text-sm font-bold text-slate-900 mb-1">No venues found for this filter</p>
            <p className="text-xs text-slate-500 mb-4">Tap "All Spots" to see all spots near Bennett.</p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('All');
                setActiveMood(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 22px',
                minHeight: 40,
                borderRadius: 12,
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onQuickReserve={r => setSelectedRestaurant(r)}
                onViewOffer={offer => setSelectedOffer(offer)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedRestaurantForBooking && (
        <BookingModal
          restaurant={selectedRestaurantForBooking}
          isOpen={!!selectedRestaurantForBooking}
          onClose={() => setSelectedRestaurant(null)}
          onSuccess={newBooking => {
            setSelectedRestaurant(null);
            setSelectedBookingForPass(newBooking);
          }}
        />
      )}

      {/* Digital Pass Modal */}
      {selectedBookingForPass && (
        <DigitalPassModal
          booking={selectedBookingForPass}
          isOpen={!!selectedBookingForPass}
          onClose={() => setSelectedBookingForPass(null)}
        />
      )}

      {/* Offer Drawer */}
      {selectedOffer && (
        <OfferDrawer
          offer={selectedOffer}
          isOpen={!!selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}
    </div>
  );
}
