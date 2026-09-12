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

  return (
    <div className="page-pad pb-28 flex flex-col gap-6">
      {/* Search Header Trigger */}
      <div
        onClick={() => navigate('/discover')}
        className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer transition-all"
      >
        <Search size={18} className="text-emerald-700 shrink-0" />
        <span className="text-xs sm:text-sm text-slate-400 font-medium flex-1 truncate">
          Search dishes, dining spots, or offers near Bennett...
        </span>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Live Network
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
            Search
          </span>
        </div>
      </div>

      {/* Going Out Vibes Horizontal Stories */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-emerald-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Going Out Vibes
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Swipe to filter &rarr;</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {MOOD_STORIES.map(mood => {
            const Icon = mood.icon;
            const isSelected = activeMood === mood.id;
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => handleMoodSelect(mood)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-700 text-white ring-3 ring-emerald-600/30 scale-105 shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 group-hover:border-slate-300 group-hover:bg-slate-50'
                  }`}
                >
                  <Icon size={22} />
                </div>
                <span
                  className={`text-[11px] max-w-[68px] text-center truncate leading-tight font-medium ${
                    isSelected ? 'font-bold text-emerald-800' : 'text-slate-600'
                  }`}
                >
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Upcoming Reservation Banner (If Any) */}
      {upcoming && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <QrCode size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Confirmed Table
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {upcoming.date} • {upcoming.time}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                {upcoming.restaurantName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Table {upcoming.tableAssigned || 'T-01'} • {upcoming.partySize || 2} Guests
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors shrink-0"
            onClick={() => setSelectedBookingForPass(upcoming)}
          >
            <QrCode size={15} />
            <span>View Digital Pass</span>
          </button>
        </div>
      )}

      {/* Campus Spotlight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-5 sm:p-7 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold mb-3">
            <Sparkles size={12} />
            <span>CAMPUS EXCLUSIVE • VERIFIED PASS</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug">
            Partner Dining Network Live Across Bennett TechZone
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Direct pre-booking with instant table hold, student discount settlement, and zero wait lines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/discover')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all shrink-0"
        >
          <span>Explore All Spots</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Filter Chips Stream */}
      <div>
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FilterIcon size={13} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Dining Spots Section */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Top Dining Spots Near Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {filteredRestaurants.length} verified partner restaurants available
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Map</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
            <p className="text-sm font-bold text-slate-900 mb-1">No venues found for this filter</p>
            <p className="text-xs text-slate-500 mb-4">Tap "All Spots" to see all spots near Bennett.</p>
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
              onClick={() => {
                setActiveFilter('All');
                setActiveMood(null);
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
