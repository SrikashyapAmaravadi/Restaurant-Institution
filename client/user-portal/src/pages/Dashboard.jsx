import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCircularGallery from '../components/RestaurantCircularGallery';
import BookingModal from '../components/BookingModal';
import OfferDrawer from '../components/OfferDrawer';
import NivixSearchModal from '../components/NivixSearchModal';
import HeroDoodleArt from '../components/HeroDoodleArt';
import { useAuth } from '../context/AuthContext';
import { useDining } from '../context/DiningContext';
import {
  Search,
  Sparkles,
  ArrowRight,
  Calendar,
  UtensilsCrossed,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurants = [], reservations = [], loading = false } = useDining() || {};

  const [selectedRestaurantForBooking, setSelectedRestaurant] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: 'clamp(14px, 3.5vw, 24px) clamp(12px, 3vw, 20px) calc(90px + env(safe-area-inset-bottom, 0px))', display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 4vw, 32px)' }}>

      {/* ── 1. HERO BANNER ── */}
      <div className="nivix-hero-canvas district-hero-canvas">
        <div className="nivix-hero-art district-hero-art">
          {/* Handcrafted Campus Dining Doodles Art Overlay */}
          <HeroDoodleArt />

          <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
            <h1
              className="hero-heading-main"
              style={{
                fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
                fontWeight: 600,
                color: '#FFFBF4',
                letterSpacing: '-0.02em',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Dining Experiences
            </h1>

            {/* Embedded Search Bar Pill */}
            <div
              className="nivix-search-bar district-search-bar"
              onClick={() => setSearchModalOpen(true)}
            >
              <Search size={17} color="#565449" style={{ flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  textAlign: 'left',
                  fontSize: 13.5,
                  color: '#A3A3A3',
                  fontWeight: 500,
                  paddingLeft: 10,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Search for a restaurant name, cuisine or dish...
              </span>
              <button className="nivix-search-btn district-search-btn" aria-label="Search" style={{ flexShrink: 0 }}>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. 3D CIRCULAR SHOWCASE ── */}
      <div>

        {safeRestaurants.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E8E2D5',
            }}
          >
            <UtensilsCrossed size={32} color="#565449" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#11120D' }}>No restaurants found</h3>
            <p style={{ fontSize: 13, color: '#A3A3A3', marginTop: 4 }}>Check back later for available dining spots.</p>
          </div>
        ) : (
          <RestaurantCircularGallery
            restaurants={safeRestaurants}
            onQuickReserve={res => setSelectedRestaurant(res)}
            onViewOffer={off => setSelectedOffer(off)}
          />
        )}
      </div>

      {/* Modals */}
      {selectedRestaurantForBooking && (
        <BookingModal
          restaurant={selectedRestaurantForBooking}
          initialTime={selectedRestaurantForBooking.defaultTime}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      {selectedOffer && (
        <OfferDrawer
          offer={selectedOffer}
          isOpen={Boolean(selectedOffer)}
          onClose={() => setSelectedOffer(null)}
        />
      )}

      <NivixSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
