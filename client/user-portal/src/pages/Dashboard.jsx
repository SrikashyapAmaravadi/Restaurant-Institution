import { useState, useMemo } from 'react';
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
  MapPin,
  Clock,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flame,
  ShieldCheck,
  Star,
  Leaf,
  Coffee,
  Pizza,
  Utensils,
  Soup,
  Trees,
  UtensilsCrossed,
  Tag,
  Compass,
  Activity
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
  const [showMenuRoad, setShowMenuRoad] = useState(true);

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  // Dynamically derive chef signature specialties from real database restaurants
  const signatureDishes = useMemo(() => {
    if (!safeRestaurants.length) return [];
    const dishes = [];
    safeRestaurants.forEach((rest, rIdx) => {
      const popular = Array.isArray(rest.popularDishes) && rest.popularDishes.length > 0
        ? rest.popularDishes
        : [`Signature ${rest.cuisine} Selection`];

      popular.forEach((dishName, dIdx) => {
        if (dishes.length < 8) {
          const isVeg = !dishName.toLowerCase().includes('chicken') &&
                        !dishName.toLowerCase().includes('mutton') &&
                        !dishName.toLowerCase().includes('fish') &&
                        !dishName.toLowerCase().includes('meat');
          dishes.push({
            id: `rest-${rest.id}-dish-${dIdx}`,
            name: dishName,
            desc: `House specialty prepared fresh daily at ${rest.name}. Verified Bennett dining partner.`,
            price: 180 + ((rIdx * 45 + dIdx * 35) % 220),
            veg: isVeg,
            image: rest.image || rest.heroImage,
            restaurantId: rest.id,
            restaurantName: rest.name
          });
        }
      });
    });
    return dishes;
  }, [safeRestaurants]);

  // Active confirmed or seated booking from Supabase DB
  const upcoming = safeReservations.find(b => b?.status === 'CONFIRMED' || b?.status === 'SEATED');

  // District & Lora Botanical Mood Categories (Story Circles) with Lucide Icons
  const MOOD_STORIES = [
    { id: 'farm', label: 'Farm to Table', icon: Leaf, tag: 'Organic' },
    { id: 'cafes', label: 'Study Cafes', icon: Coffee, cuisine: 'Continental' },
    { id: 'pizza', label: 'Pizza & Brews', icon: Pizza, cuisine: 'Continental' },
    { id: 'mughlai', label: 'Mughlai & Tandoor', icon: Utensils, cuisine: 'North Indian' },
    { id: 'asian', label: 'Asian & Ramen', icon: Soup, cuisine: 'Pan-Asian' },
    { id: 'patio', label: 'Open-Air Patio', icon: Trees, tag: 'Outdoor Patio' },
    { id: 'quick', label: 'Quick Bites', icon: UtensilsCrossed, tag: 'Fast Casual' },
    { id: 'dessert', label: 'Boba & Sweets', icon: Sparkles, tag: 'Boba Tea Bar' },
    { id: 'banquet', label: 'Group Hangouts', icon: Star, tag: 'Instant Reservation' }
  ];

  // Filter Pills with Lucide Icons
  const FILTERS = [
    { id: 'All', label: 'All Spots', icon: Compass },
    { id: 'FarmFresh', label: 'Farm to Table', icon: Leaf },
    { id: 'Instant', label: 'Instant Confirm', icon: Zap },
    { id: 'Offers', label: 'Campus Discounts', icon: Tag },
    { id: 'TopRated', label: 'Top Rated (4.5+)', icon: Star },
    { id: 'NorthIndian', label: 'North Indian', icon: Utensils },
    { id: 'Continental', label: 'Continental', icon: Pizza },
    { id: 'PanAsian', label: 'Pan-Asian', icon: Soup }
  ];

  const handleMoodSelect = (mood) => {
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
    <div className="page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 26, paddingBottom: 100 }}>

      {/* District Mobile Search Bar Trigger */}
      <div
        className="anim-fade-up"
        onClick={() => navigate('/discover')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          borderRadius: 'var(--r-full)',
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.18s ease'
        }}
      >
        <Search size={18} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: 13.5, color: 'var(--t3)', flex: 1 }}>
          Search "pizza", "study cafe", or dining spots near Bennett...
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 'var(--r-full)',
            background: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
            Live Network
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 'var(--r-full)',
            background: '#EFF6FF',
            color: 'var(--primary)',
            border: '1px solid #BFDBFE'
          }}>
            Search
          </span>
        </div>
      </div>

      {/* Horizontal "Going Out Vibes" Story Carousel */}
      <div className="anim-fade-up" style={{ marginTop: -4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={15} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--t1)' }}>
              Going Out Vibes
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--t3)' }}>Swipe for vibes &rarr;</span>
        </div>

        <div className="district-scroll-x" style={{ padding: '4px 2px 8px' }}>
          {MOOD_STORIES.map(mood => {
            const Icon = mood.icon;
            const isSelected = activeMood === mood.id;
            return (
              <div
                key={mood.id}
                className="district-story-item"
                onClick={() => handleMoodSelect(mood)}
              >
                <div
                  className="district-story-ring"
                  style={{
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    background: isSelected ? 'var(--primary)' : '#FFFFFF'
                  }}
                >
                  <div className="district-story-inner">
                    <Icon size={20} style={{ color: isSelected ? 'var(--primary)' : 'var(--t2)' }} />
                  </div>
                </div>
                <span
                  className="district-story-label"
                  style={{
                    color: isSelected ? 'var(--primary)' : 'var(--t2)',
                    fontWeight: isSelected ? 800 : 600
                  }}
                >
                  {mood.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* District Spotlight Banner: Semester Promo */}
      <div
        className="district-banner anim-fade-up"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 'var(--r-full)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            color: '#FFFFFF',
            fontSize: 11.5,
            fontWeight: 800,
            marginBottom: 10
          }}>
            <Flame size={13} /> DISTRICT EXCLUSIVE · 20% OFF
          </div>
          <h3 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: 6 }}>
            Campus Dining Passes Live Across Greater Noida
          </h3>
          <p style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.5 }}>
            Instant table reservations with zero waiting line. Verified for Bennett students, faculty, and staff.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-md cursor-pointer"
          onClick={() => navigate('/discover')}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 800,
            borderRadius: 'var(--r-full)',
            background: '#FFFFFF',
            color: 'var(--primary)',
            border: 'none',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span>Explore All Spots</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Active Upcoming Reservation Card (If Any) */}
      {upcoming && (
        <div
          className="card anim-fade-up"
          style={{
            padding: 18,
            borderRadius: 'var(--r-lg)',
            background: '#FFFFFF',
            border: '1px solid #A7F3D0',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--r-sm)',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <QrCode size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="badge badge-success" style={{ fontSize: 10.5 }}>Confirmed Table</span>
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>{upcoming.date} · {upcoming.time}</span>
              </div>
              <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--t1)', marginTop: 3 }}>
                {upcoming.restaurantName}
              </h4>
              <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                Party of {upcoming.guests} diners · Pass Ref: <strong style={{ color: 'var(--t1)' }}>{upcoming.bookingRef}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm cursor-pointer"
            onClick={() => setSelectedBookingForPass(upcoming)}
            style={{
              borderColor: '#059669',
              color: '#059669',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <QrCode size={14} />
            <span>Show QR Pass</span>
          </button>
        </div>
      )}

      {/* Signature Dishes Road Section */}
      <div className="anim-fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
              Campus Specialties
            </div>
            <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--t1)', margin: '2px 0 0' }}>
              Chef's Signature Menu
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm cursor-pointer"
            onClick={() => setShowMenuRoad(!showMenuRoad)}
            style={{ fontSize: 12, color: 'var(--primary)', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span>{showMenuRoad ? 'Collapse' : 'Explore Road'}</span>
            {showMenuRoad ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showMenuRoad && (
          <div className="winding-menu-wrapper" style={{ marginBottom: 10 }}>
            {/* Ghost Watermark Background Text from Photo 2 */}
            <div className="winding-menu-bg-text">FOOD</div>

            {/* Header in Retro Paytone Font & Lora Botanical Identity */}
            <div className="winding-header">
              <div className="winding-subtag">
                <span>@lora.sustainable</span>
                <span>•</span>
                <span>natural · pure · sustainable</span>
              </div>
              <div className="winding-cloud-icon">
                <Leaf size={22} style={{ color: '#E7F1E1' }} />
              </div>
              <h2 className="winding-main-title">OUR MENU</h2>
              <div style={{ fontSize: 12, color: '#A9C5A2', marginTop: 5, letterSpacing: '0.03em' }}>
                From Our Fields To Your Table · Fresh Food, Directly From Farm To Table
              </div>
            </div>

            {/* Central Continuous Cream Spine & Dishes */}
            <div className="winding-track-container">
              <div className="winding-track-spine" />

              {signatureDishes.map((dish, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={dish.id} className={`winding-row ${isLeft ? 'left-dish' : 'right-dish'}`}>
                    {/* Circular Popping Food Plate with Wooden Charger Rim */}
                    <div
                      className="winding-dish-orb"
                      onClick={() => {
                        const targetRest = safeRestaurants.find(r => r.id === dish.restaurantId) || safeRestaurants[0];
                        if (targetRest) setSelectedRestaurant(targetRest);
                      }}
                      title={`Book table at ${dish.restaurantName}`}
                    >
                      <img src={dish.image} alt={dish.name} loading="lazy" />
                    </div>

                    {/* Forest Moss Rounded Pill Card */}
                    <div className="winding-pill">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dish.veg ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                        <div className="winding-pill-title">{dish.name}</div>
                      </div>
                      <p className="winding-pill-desc">{dish.desc}</p>
                      <div className="winding-pill-footer">
                        <span className="winding-price">₹{dish.price}</span>
                        <button
                          type="button"
                          className="winding-add-btn"
                          onClick={() => {
                            const targetRest = safeRestaurants.find(r => r.id === dish.restaurantId) || safeRestaurants[0];
                            if (targetRest) setSelectedRestaurant(targetRest);
                          }}
                        >
                          + Reserve Table
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Poster Footer Note with Contact Info */}
            <div className="winding-footer-note">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E7F1E1' }}>
                <Leaf size={14} style={{ color: '#6FAF3D' }} /> +91 Bennett Dining Desk · 100% Farm-To-Table Certified
              </span>
              <span style={{ color: '#A9C5A2' }}>Natural · Pure · Sustainable</span>
            </div>

            {/* Side Contact Watermark */}
            <div className="winding-side-watermark">
              lora.dining@bennett.edu.in
            </div>
          </div>
        )}
      </div>

      {/* Filter Chips Strip */}
      <div className="anim-fade-up">
        <div className="district-scroll-x" style={{ gap: 8, paddingBottom: 2 }}>
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
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--r-full)',
                  background: isSelected ? 'var(--primary)' : '#FFFFFF',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  color: isSelected ? '#FFFFFF' : 'var(--t2)',
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px var(--primary-glow)' : 'var(--shadow-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.18s ease'
                }}
              >
                <FilterIcon size={13} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* District Restaurant Cards Feed */}
      <div className="anim-fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--t1)' }}>
              Top Dining Spots Near Campus
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
              {filteredRestaurants.length} verified partner restaurants open for reservation
            </p>
          </div>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => navigate('/discover')}
            style={{ color: 'var(--district-pink)', fontWeight: 700, fontSize: 12 }}
          >
            View Map →
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--t3)' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No venues found for this filter</p>
            <p style={{ fontSize: 13 }}>Try tapping "All Spots" to see all partner spots near Bennett.</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => { setActiveFilter('All'); setActiveMood(null); }}
              style={{ marginTop: 14 }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="restaurant-grid">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onQuickReserve={(r) => setSelectedRestaurant(r)}
                onViewOffer={(offer) => setSelectedOffer(offer)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal / District Mobile Bottom Sheet */}
      {selectedRestaurantForBooking && (
        <BookingModal
          restaurant={selectedRestaurantForBooking}
          isOpen={!!selectedRestaurantForBooking}
          onClose={() => setSelectedRestaurant(null)}
          onSuccess={(newBooking) => {
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
