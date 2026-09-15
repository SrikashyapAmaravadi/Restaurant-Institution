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
  ChevronRight,
  Ticket,
  Users,
  Percent,
  Clock,
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

  const upcoming = safeReservations.find(
    b => b?.status === 'CONFIRMED' || b?.status === 'SEATED'
  );

  const MOOD_STORIES = [
    { id: 'farm', label: 'Farm Fresh', icon: Leaf, tag: 'Organic' },
    { id: 'cafes', label: 'Cafes', icon: Coffee, cuisine: 'Continental' },
    { id: 'pizza', label: 'Pizza', icon: Pizza, cuisine: 'Continental' },
    { id: 'mughlai', label: 'Indian', icon: Utensils, cuisine: 'North Indian' },
    { id: 'asian', label: 'Asian', icon: Soup, cuisine: 'Pan-Asian' },
    { id: 'patio', label: 'Outdoor', icon: Trees, tag: 'Outdoor Patio' },
    { id: 'quick', label: 'Quick Bites', icon: UtensilsCrossed, tag: 'Fast Casual' },
    { id: 'dessert', label: 'Desserts', icon: Sparkles, tag: 'Boba Tea Bar' },
  ];

  const FILTERS = [
    { id: 'All', label: 'All', icon: Compass },
    { id: 'Offers', label: 'Deals', icon: Tag },
    { id: 'TopRated', label: 'Top Rated', icon: Star },
    { id: 'Instant', label: 'Instant', icon: Zap },
    { id: 'NorthIndian', label: 'Indian', icon: Utensils },
    { id: 'Continental', label: 'Continental', icon: Pizza },
    { id: 'PanAsian', label: 'Asian', icon: Soup },
  ];

  const handleMoodSelect = mood => {
    if (activeMood === mood.id) {
      setActiveMood(null);
      setActiveFilter('All');
    } else {
      setActiveMood(mood.id);
      if (mood.cuisine) setActiveFilter(mood.cuisine.replace(' ', ''));
    }
  };

  const filteredRestaurants = safeRestaurants.filter(r => {
    if (activeFilter === 'Instant') return true;
    if (activeFilter === 'Offers') return r.hasOffer;
    if (activeFilter === 'TopRated') return (r.rating || 0) >= 4.5;
    if (activeFilter === 'NorthIndian') return r.cuisine?.toLowerCase().includes('north indian');
    if (activeFilter === 'Continental') return r.cuisine?.toLowerCase().includes('continental');
    if (activeFilter === 'PanAsian') return r.cuisine?.toLowerCase().includes('asian');
    if (activeMood) {
      const story = MOOD_STORIES.find(m => m.id === activeMood);
      if (story?.cuisine && !r.cuisine?.toLowerCase().includes(story.cuisine.toLowerCase())) return false;
    }
    return true;
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  /* ── Quick stat items */
  const stats = [
    { label: 'Active Pass', value: upcoming ? '1' : '0', sub: upcoming ? `Table ${upcoming.tableAssigned || 'T-01'}` : 'None active', icon: Ticket, accent: '#FF5200' },
    { label: 'Outlets', value: safeRestaurants.length, sub: 'Near campus', icon: UtensilsCrossed, accent: '#111' },
    { label: 'Discount', value: '20%', sub: 'Student rate', icon: Percent, accent: '#22C55E' },
    { label: 'Wait Time', value: '0 min', sub: 'Priority access', icon: Clock, accent: '#3B82F6' },
  ];

  return (
    <div className="page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>

      {/* ── Greeting ── */}
      <div>
        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 700, color: '#111', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Hey {firstName} 👋
        </h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4, fontWeight: 400 }}>
          What are you craving today?
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div
        onClick={() => navigate('/discover')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          borderRadius: 12,
          background: '#F5F5F5',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#EFEFEF'}
        onMouseLeave={e => e.currentTarget.style.background = '#F5F5F5'}
      >
        <Search size={16} color="#BBB" />
        <span style={{ fontSize: 13, color: '#AAA', fontWeight: 400, flex: 1 }}>
          Search restaurants, dishes, cuisines...
        </span>
      </div>

      {/* ── Quick Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{
              padding: '14px 12px',
              borderRadius: 12,
              background: '#FFF',
              border: '1px solid #EEEEEE',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${s.accent}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={15} color={s.accent} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#999', fontWeight: 500, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Pass Ticket ── */}
      {upcoming && (
        <div style={{
          padding: '18px 20px',
          borderRadius: 16,
          background: '#FFF',
          border: '1px solid #EEE',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#FFF5EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <QrCode size={20} color="#FF5200" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 4,
                  background: '#F0FDF4', color: '#16A34A',
                  fontSize: 10, fontWeight: 600,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />
                  Confirmed
                </span>
                <span style={{ fontSize: 11, color: '#999' }}>
                  {upcoming.date} · {upcoming.time}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>
                {upcoming.restaurantName}
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                Table <span style={{ fontWeight: 600, color: '#FF5200' }}>{upcoming.tableAssigned || 'T-01'}</span> · {upcoming.partySize || 2} guests
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedBookingForPass(upcoming)}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 10 }}
          >
            <QrCode size={14} />
            <span>View Pass</span>
          </button>
        </div>
      )}

      {/* ── Mood Categories ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Browse by mood</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-none">
          {MOOD_STORIES.map(mood => {
            const Icon = mood.icon;
            const sel = activeMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: sel ? '1.5px solid #FF5200' : '1px solid #EEE',
                  background: sel ? '#FFF5EE' : '#FFF',
                  cursor: 'pointer',
                  flexShrink: 0,
                  minWidth: 72,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: sel ? '#FF520015' : '#F5F5F5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}>
                  <Icon size={17} color={sel ? '#FF5200' : '#777'} />
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: sel ? 600 : 500,
                  color: sel ? '#FF5200' : '#777',
                  whiteSpace: 'nowrap',
                }}>
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Spotlight Banner ── */}
      <div style={{
        padding: '24px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, #111 0%, #1a1a2e 100%)',
        color: '#FFF',
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'rgba(255,82,0,0.15)',
        }} />
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px',
          borderRadius: 6,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 10, fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
          width: 'fit-content',
        }}>
          <Sparkles size={10} />
          CAMPUS DINING
        </span>
        <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', fontWeight: 700, lineHeight: 1.25, maxWidth: 300 }}>
          Priority seating & 20% student discount
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, maxWidth: 400 }}>
          Reserve tables across campus dining partners. Instant digital passes with zero queue.
        </p>
        <button
          onClick={() => navigate('/discover')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#FF5200',
            color: '#FFF',
            border: 'none',
            fontSize: 12.5, fontWeight: 600,
            cursor: 'pointer',
            width: 'fit-content',
            marginTop: 4,
          }}
        >
          Explore <ArrowRight size={13} />
        </button>
      </div>

      {/* ── Filter Chips ── */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="scrollbar-none">
        {FILTERS.map(f => {
          const Icon = f.icon;
          const sel = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => { setActiveFilter(f.id); setActiveMood(null); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px',
                borderRadius: 8,
                border: sel ? '1.5px solid #FF5200' : '1px solid #EEE',
                background: sel ? '#FF5200' : '#FFF',
                color: sel ? '#FFF' : '#777',
                fontSize: 12, fontWeight: sel ? 600 : 500,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={12} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Restaurant Grid ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>
              Nearby restaurants
            </h2>
            <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              {filteredRestaurants.length} places available
            </p>
          </div>
          <button
            onClick={() => navigate('/discover')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #EEE',
              background: '#FFF',
              color: '#555',
              fontSize: 12, fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Map <ChevronRight size={12} />
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div style={{
            padding: 40,
            borderRadius: 16,
            background: '#FFF',
            border: '1px solid #EEE',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>No results</p>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>Try a different filter</p>
            <button
              onClick={() => { setActiveFilter('All'); setActiveMood(null); }}
              className="btn btn-outline btn-sm"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: 16,
          }}>
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

      {/* Modals */}
      {selectedRestaurantForBooking && (
        <BookingModal
          restaurant={selectedRestaurantForBooking}
          isOpen={!!selectedRestaurantForBooking}
          onClose={() => setSelectedRestaurant(null)}
          onSuccess={newBooking => { setSelectedRestaurant(null); setSelectedBookingForPass(newBooking); }}
        />
      )}
      {selectedBookingForPass && (
        <DigitalPassModal
          booking={selectedBookingForPass}
          isOpen={!!selectedBookingForPass}
          onClose={() => setSelectedBookingForPass(null)}
        />
      )}
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
