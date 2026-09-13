import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import ReviewModal from '../components/ReviewModal';
import OfferDrawer from '../components/OfferDrawer';
import { useDining } from '../context/DiningContext';
import api from '../services/api';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Users,
  Sparkles,
  ShieldCheck,
  Search,
  Check,
  Calendar,
  Share2,
  Heart,
  MessageSquarePlus,
  ThumbsUp,
  LayoutGrid,
  List,
  GraduationCap,
  Tag,
  Leaf,
  Zap,
  Award,
  ArrowUpDown,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const TABS = ['Menu Catalog', 'Active Offers', 'Student Reviews', 'About & Location'];

const CURATED_FALLBACK_MENUS = {
  1: {
    'Chef Specialties': [
      {
        id: 'sg-1',
        name: 'Smoked Dal Makhani',
        desc: 'Organic black lentils slow-cooked overnight with churned white butter and aromatic Kashmiri spices.',
        price: 180,
        veg: true,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sg-2',
        name: 'Butter Chicken Masala',
        desc: 'Succulent tandoori chicken simmered in rich satin tomato gravy finished with fenugreek.',
        price: 215,
        veg: false,
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sg-3',
        name: 'Garlic Butter Naan',
        desc: 'Crispy clay-oven leavened bread brushed with farm butter, toasted garlic, and coriander.',
        price: 75,
        veg: true,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sg-4',
        name: 'Paneer Tikka Angara',
        desc: 'Charcoal-smoked cottage cheese cubes marinated in royal Kashmiri red chili and mustard oil.',
        price: 280,
        veg: true,
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'
      }
    ],
    'Tandoor & Starters': [
      {
        id: 'sg-5',
        name: 'Murgh Malai Tikka',
        desc: 'Cream-marinated tender chicken kebabs with green cardamom and white pepper finished in clay tandoor.',
        price: 340,
        veg: false,
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sg-6',
        name: 'Awadhi Dum Biryani',
        desc: 'Fragrant aged basmati rice layered with saffron chicken, kewra essence, and caramelized onions.',
        price: 360,
        veg: false,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sg-7',
        name: 'Subz Handi Biryani',
        desc: 'Garden vegetables and long-grain basmati cooked on slow charcoal dum in an earthen clay pot.',
        price: 290,
        veg: true,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
      }
    ],
    'Desserts & Beverages': [
      {
        id: 'sg-8',
        name: 'Royal Kesari Kulfi',
        desc: 'Dense saffron and pistachio ice cream on stick served with chilled creamy rabri.',
        price: 120,
        veg: true,
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  2: {
    'Sandwiches & Melts': [
      {
        id: 'dc-1',
        name: 'Smoked Turkey & Swiss Panini',
        desc: 'Artisan sourdough grilled with house-smoked turkey breast, gruyère cheese, and dijon aioli.',
        price: 240,
        veg: false,
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'dc-2',
        name: 'Avocado & Halloumi Toast',
        desc: 'Crushed Hass avocado on toasted multigrain topped with grilled halloumi and toasted sunflower seeds.',
        price: 220,
        veg: true,
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
      }
    ],
    'Specialty Coffee & Drinks': [
      {
        id: 'dc-3',
        name: 'Nitro Cold Brew Coffee',
        desc: 'Steeped for 18 hours and nitrogen infused for a silky stout-like pour.',
        price: 150,
        veg: true,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  3: {
    'Mediterranean Platters': [
      {
        id: 'mm-1',
        name: 'Classic Mezze Platter',
        desc: 'Smoked baba ganoush, creamy hummus, crisp falafel, kalamata olives, and wood-fired pita bread.',
        price: 320,
        veg: true,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'mm-2',
        name: 'Grilled Lamb Souvlaki Bowl',
        desc: 'Herbed lamb skewers on wild pilaf rice with tzatziki, pickled sumac onions, and feta cheese.',
        price: 390,
        veg: false,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  4: {
    'Ramen & Bowls': [
      {
        id: 'wr-1',
        name: 'Tokyo Tonkotsu Miso Ramen',
        desc: 'Rich 12-hour broth, fresh alkaline noodles, chashu pork or braised tofu, ajitsuke tamago, and nori.',
        price: 380,
        veg: false,
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'wr-2',
        name: 'Crispy Crystal Dim Sums (6 pcs)',
        desc: 'Steamed translucent wrappers packed with water chestnuts, shiitake mushrooms, and sweet chili dip.',
        price: 260,
        veg: true,
        image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80'
      }
    ]
  }
};

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurants: liveRestaurants = [] } = useDining() || {};

  const [restaurantData, setRestaurantData] = useState(null);
  const [activeTab, setActiveTab] = useState('Menu Catalog');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [dishSearch, setDishSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [dishSort, setDishSort] = useState('default');
  const [isFavorited, setIsFavorited] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'offers') {
      setActiveTab('Active Offers');
    }
    if (params.get('reserve') === 'true') {
      setShowBookingModal(true);
    }
  }, [location.search]);

  // State for reviews and breakdown from backend
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, avg: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [upvotedMap, setUpvotedMap] = useState({});

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await api.reviews.getByRestaurant(id);
      if (res && res.success) {
        setReviewsList(res.data || []);
        if (res.breakdown) {
          setReviewStats(prev => ({
            ...prev,
            total: res.count || res.data.length,
            breakdown: res.breakdown
          }));
        }
      }
    } catch (err) {
      console.warn('Could not load live reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const res = await api.restaurants.getById(id);
        if (res.success && res.data) {
          setRestaurantData(res.data);
          const rawReviews = res.data.studentReviews || res.data.reviewsList || (Array.isArray(res.data.reviews) ? res.data.reviews : null);
          if (Array.isArray(rawReviews) && rawReviews.length > 0) {
            setReviewsList(rawReviews);
          }
        }
      } catch (err) {
        console.warn('API getById failed:', err);
      }
    }
    loadRestaurant();
    loadReviews();
  }, [id]);

  const fallback = liveRestaurants.find(r => r.id === Number(id)) || liveRestaurants[0];
  const restaurant = restaurantData || fallback;

  const displayReviewsCount = typeof restaurant?.reviews === 'number'
    ? restaurant.reviews
    : (Array.isArray(restaurant?.reviews)
        ? restaurant.reviews.length
        : (typeof restaurant?.reviewsCount === 'number'
            ? restaurant.reviewsCount
            : (reviewsList.length || 0)));

  // Derive menu categories and item lists directly from restaurant data with fallback
  const rawMenu = restaurant?.menuByCategory && Object.keys(restaurant.menuByCategory).length > 0
    ? restaurant.menuByCategory
    : (restaurant?.menuItems && restaurant.menuItems.length > 0
      ? restaurant.menuItems.reduce((acc, item) => {
          const cat = item.category || 'Specialties';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push({
            ...item,
            veg: item.isVeg !== undefined ? item.isVeg : (item.veg !== undefined ? item.veg : true),
            desc: item.desc || `House specialty prepared fresh daily at ${restaurant?.name}. Verified campus ingredients.`,
            image: item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
            price: item.price || 180,
            available: item.isAvailable !== undefined ? item.isAvailable : true,
          });
          return acc;
        }, {})
      : (CURATED_FALLBACK_MENUS[restaurant?.id] || CURATED_FALLBACK_MENUS[1]));

  const menu = rawMenu || CURATED_FALLBACK_MENUS[1];

  // Flattened and filtered dishes
  const categoriesList = useMemo(() => ['ALL', ...Object.keys(menu)], [menu]);

  const displayedDishes = useMemo(() => {
    const list = [];
    Object.entries(menu).forEach(([catName, items]) => {
      if (selectedCategory !== 'ALL' && selectedCategory !== catName) return;
      items.forEach(dish => {
        if (vegOnly && !dish.veg) return;
        if (dishSearch.trim()) {
          const q = dishSearch.toLowerCase();
          const matchName = (dish.name || '').toLowerCase().includes(q);
          const matchDesc = (dish.desc || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc) return;
        }
        list.push({ ...dish, category: catName });
      });
    });

    if (dishSort === 'veg-first') {
      list.sort((a, b) => (b.veg ? 1 : 0) - (a.veg ? 1 : 0));
    } else if (dishSort === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (dishSort === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (dishSort === 'name-az') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [menu, selectedCategory, vegOnly, dishSearch, dishSort]);

  // Live offers from database or fallback
  const offers = (restaurant?.offers && restaurant.offers.length > 0)
    ? restaurant.offers.map(o => ({
        id: o.id || `offer-${restaurant?.id}`,
        title: o.title,
        description: o.description || `Exclusive deal for verified campus diners at ${restaurant?.name}.`,
        discount: o.discountPercent ? `${o.discountPercent}% OFF` : (restaurant?.offerLabel || 'Campus Special'),
        validTill: o.endDate || 'Ongoing',
        code: o.promoCode,
        promoCode: o.promoCode,
        minOrderAmount: o.minOrderAmount || 0,
        terms: o.minOrderAmount ? `Minimum spend ₹${o.minOrderAmount}. Verified campus diners.` : 'Valid on dine-in table reservations.',
        restaurantName: restaurant?.name
      }))
    : [
        {
          id: `offer-bennett-${restaurant?.id || 1}`,
          title: 'Bennett Scholar Privilege',
          description: 'Flat 20% discount on entire dining bill with verified student or faculty identification.',
          discount: '20% OFF',
          validTill: 'End of Semester',
          code: 'BENNETT20',
          promoCode: 'BENNETT20',
          minOrderAmount: 300,
          terms: 'Valid on table dine-in with Bennett institutional pass.'
        }
      ];

  const handleReviewAdded = async () => {
    await loadReviews();
    try {
      const res = await api.restaurants.getById(id);
      if (res.success && res.data) {
        setRestaurantData(res.data);
      }
    } catch (e) {
      console.warn('Could not refresh restaurant stats:', e);
    }
  };

  const handleUpvote = async (reviewId) => {
    if (upvotedMap[reviewId]) return;
    try {
      setUpvotedMap(prev => ({ ...prev, [reviewId]: true }));
      setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r));
      await api.reviews.markHelpful(reviewId);
    } catch (err) {
      console.warn('Failed to upvote review:', err);
    }
  };

  if (!restaurant) {
    return (
      <div className="page-pad" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
          width: 44,
          height: 44,
          border: '3px solid #E2E8F0',
          borderTopColor: '#15803D',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <div style={{ color: 'var(--t2)', fontSize: 14, fontWeight: 600 }}>Connecting to restaurant network...</div>
      </div>
    );
  }

  return (
    <div className="page-pad" style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 80 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '10px 18px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 1000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, fontWeight: 700, color: 'var(--t2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to Discover
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="icon-btn icon-btn-favorite"
            onClick={() => {
              setIsFavorited(!isFavorited);
              showToast(isFavorited ? 'Removed from favorites' : 'Saved to favorites');
            }}
            title={isFavorited ? 'Saved to favorites' : 'Save to favorites'}
            style={{
              color: isFavorited ? '#EF4444' : 'var(--t3)',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Heart size={17} fill={isFavorited ? '#EF4444' : 'none'} />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Restaurant link copied to clipboard!');
            }}
            title="Share"
            style={{
              color: 'var(--t2)',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Share2 size={17} />
          </button>
        </div>
      </div>

      {/* ── Hero Showcase Section ── */}
      <div
        className="anim-fade-up"
        style={{
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 32,
          border: '1px solid var(--border)',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)'
        }}
      >
        <div style={{ position: 'relative', height: 'clamp(280px, 42vw, 420px)', width: '100%' }}>
          <img
            src={restaurant.heroImage || restaurant.image}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Elegant Dark Ambient Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.88) 100%)'
          }} />

          {/* Hero Content Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 'clamp(18px, 4vw, 32px)',
            left: 'clamp(18px, 4vw, 36px)',
            right: 'clamp(18px, 4vw, 36px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 20
          }}>
            <div style={{ maxWidth: 680 }}>
              {/* Badges Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <span style={{
                  background: '#064E3B',
                  border: '1px solid rgba(167, 243, 208, 0.4)',
                  color: '#ECFDF5',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 99,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <GraduationCap size={13} /> Bennett Verified Partner
                </span>

                <span style={{
                  background: restaurant.isOpen ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 99,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  ● {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </span>

                {restaurant.hasOffer && (
                  <span style={{
                    background: '#D97706',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 99,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Tag size={12} /> {restaurant.offerLabel}
                  </span>
                )}

                {restaurant.tags && restaurant.tags.map(t => (
                  <span
                    key={t}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 99
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="font-display" style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15,
                marginBottom: 8
              }}>
                {restaurant.name}
              </h1>

              <p style={{ fontSize: 14, color: '#E2E8F0', marginBottom: 14, lineHeight: 1.5, maxWidth: 560 }}>
                {restaurant.tagline || restaurant.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, fontSize: 13, color: '#CBD5E1' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FBBF24', fontWeight: 700 }}>
                  <Star size={15} fill="#FBBF24" /> {restaurant.rating} ({displayReviewsCount} verified reviews)
                </span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#A7F3D0', fontWeight: 600 }}>
                  <MapPin size={14} /> {restaurant.distance} km from Bennett Campus
                </span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> {restaurant.hours}
                </span>
                <span>·</span>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{restaurant.price}</span>
              </div>
            </div>

            {/* Desktop Hero CTA */}
            <div style={{ flexShrink: 0 }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowBookingModal(true)}
                style={{
                  borderRadius: 14,
                  padding: '12px 28px',
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: '0 8px 20px rgba(21, 128, 61, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Sparkles size={18} /> Book Table Pass
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Tabs & Sticky Rail ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) min(320px, 100%)', gap: 32, alignItems: 'start' }}>
        {/* Left Column: Navigation Tabs & Tab Content */}
        <div>
          {/* Tabs Bar */}
          <div className="tab-bar anim-fade-up delay-1" style={{ marginBottom: 28, background: '#FFFFFF', padding: 4, borderRadius: 14, border: '1px solid var(--border)' }}>
            {TABS.map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  borderRadius: 10,
                  fontWeight: 700,
                  padding: '9px 18px'
                }}
              >
                {tab}
                {tab === 'Active Offers' && offers.length > 0 && (
                  <span style={{
                    marginLeft: 6,
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 99,
                    background: '#FEF3C7',
                    color: '#92400E'
                  }}>
                    {offers.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── TAB 1: MENU CATALOG ── */}
          {activeTab === 'Menu Catalog' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Dish Filter Toolbar */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    className="form-input"
                    placeholder="Search dishes or ingredients..."
                    value={dishSearch}
                    onChange={e => setDishSearch(e.target.value)}
                    style={{ paddingLeft: 36, fontSize: 13, height: 38 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {/* Sort Selector */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#F8FAFC',
                    padding: '6px 12px',
                    borderRadius: 99,
                    border: '1px solid var(--border)'
                  }}>
                    <ArrowUpDown size={13} className="text-emerald-700" />
                    <select
                      value={dishSort}
                      onChange={e => setDishSort(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--t1)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="default">Sort: Default</option>
                      <option value="veg-first">Veg First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name-az">Dish Name (A-Z)</option>
                    </select>
                  </div>

                  {/* Pure Veg Toggle */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: vegOnly ? '#065F46' : 'var(--t2)',
                    cursor: 'pointer',
                    background: vegOnly ? '#ECFDF5' : '#F8FAFC',
                    padding: '6px 12px',
                    borderRadius: 99,
                    border: `1px solid ${vegOnly ? '#A7F3D0' : 'var(--border)'}`
                  }}>
                    <input
                      type="checkbox"
                      checked={vegOnly}
                      onChange={e => setVegOnly(e.target.checked)}
                      style={{ accentColor: '#15803D' }}
                    />
                    Pure Veg
                  </label>

                  {/* Grid vs List View Switcher */}
                  <div style={{ display: 'inline-flex', background: '#F8FAFC', borderRadius: 99, padding: 3, border: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      style={{
                        border: 'none',
                        background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                        color: viewMode === 'grid' ? 'var(--t1)' : 'var(--t3)',
                        borderRadius: 99,
                        padding: '5px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      <LayoutGrid size={13} /> Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      style={{
                        border: 'none',
                        background: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                        color: viewMode === 'list' ? 'var(--t1)' : 'var(--t3)',
                        borderRadius: 99,
                        padding: '5px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      <List size={13} /> List
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              {categoriesList.length > 2 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {categoriesList.map(cat => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 99,
                          border: `1.5px solid ${isSelected ? '#15803D' : '#E2E8F0'}`,
                          background: isSelected ? '#ECFDF5' : '#FFFFFF',
                          color: isSelected ? '#065F46' : 'var(--t2)',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {cat === 'ALL' ? 'All Items' : cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dish Items Display */}
              {displayedDishes.length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '48px 20px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--t3)', fontSize: 14 }}>
                    No dishes match your current filter settings.
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setDishSearch('');
                      setVegOnly(false);
                      setSelectedCategory('ALL');
                    }}
                    style={{ marginTop: 8, color: '#15803D', fontWeight: 700 }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                  gap: 16
                }}>
                  {displayedDishes.map(item => (
                    <div key={item.id} className="editorial-dish-card">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="editorial-dish-thumb"
                        loading="lazy"
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: item.veg ? '#10B981' : '#EF4444',
                            flexShrink: 0
                          }} />
                          <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                            {item.name}
                          </h4>
                        </div>

                        <p style={{
                          fontSize: 12,
                          color: 'var(--t3)',
                          lineHeight: 1.45,
                          marginBottom: 8,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.desc}
                        </p>

                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                            ₹{item.price}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => setShowBookingModal(true)}
                            style={{
                              borderRadius: 8,
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              borderColor: '#15803D',
                              color: '#15803D'
                            }}
                          >
                            + Pre-Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {displayedDishes.map(item => (
                    <div
                      key={item.id}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                          loading="lazy"
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: item.veg ? '#10B981' : '#EF4444'
                            }} />
                            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>{item.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--t4)' }}>· {item.category}</span>
                          </div>
                          <p style={{ fontSize: 11.5, color: 'var(--t3)', margin: '2px 0 0', maxWidth: 460 }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>
                          ₹{item.price}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => setShowBookingModal(true)}
                          style={{
                            borderRadius: 8,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            borderColor: '#15803D',
                            color: '#15803D'
                          }}
                        >
                          + Pre-Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: ACTIVE OFFERS ── */}
          {activeTab === 'Active Offers' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
              {offers.map(offer => (
                <div
                  key={offer.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    padding: 22,
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Tag size={12} /> {offer.discount}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 600 }}>
                        {offer.validTill}
                      </span>
                    </div>

                    <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px' }}>
                      {offer.title}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 16 }}>
                      {offer.description}
                    </p>

                    {/* Voucher Code Box */}
                    <div style={{
                      background: '#FFFBEB',
                      border: '1.5px dashed #F59E0B',
                      borderRadius: 12,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16
                    }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Promo Code
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B45309', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                          {offer.code || offer.promoCode}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(offer.code || offer.promoCode);
                          showToast(`Copied code ${offer.code || offer.promoCode}!`);
                        }}
                        style={{
                          background: '#FEF3C7',
                          border: 'none',
                          color: '#92400E',
                          borderRadius: 8,
                          padding: '5px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-md"
                    onClick={() => {
                      setSelectedOffer(offer);
                      setShowBookingModal(true);
                    }}
                    style={{ borderRadius: 12, fontWeight: 700, width: '100%', justifyContent: 'center' }}
                  >
                    <Sparkles size={15} /> Claim Voucher &amp; Reserve
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB 3: STUDENT REVIEWS ── */}
          {activeTab === 'Student Reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Review Score Summary Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="font-display" style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>
                      {restaurant.rating}
                    </div>
                    <div style={{ display: 'flex', gap: 3, color: '#F59E0B', margin: '6px 0' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={15}
                          fill={s <= Math.round(restaurant.rating || 0) ? '#F59E0B' : 'none'}
                          color="#F59E0B"
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                      {displayReviewsCount} verified reviews
                    </div>
                  </div>

                  {/* Rating Breakdown Distribution */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 200 }}>
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = reviewStats.breakdown[stars] || 0;
                      const total = reviewStats.total || reviewsList.length || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                          <span style={{ color: 'var(--t3)', width: 38 }}>{stars}★</span>
                          <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B' }} />
                          </div>
                          <span style={{ color: 'var(--t4)', width: 28, textAlign: 'right' }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  className="btn btn-outline btn-md"
                  onClick={() => setShowReviewModal(true)}
                  style={{ borderRadius: 12, fontWeight: 700, borderColor: '#15803D', color: '#15803D' }}
                >
                  <MessageSquarePlus size={16} /> Write a Review
                </button>
              </div>

              {/* Reviews List */}
              {reviewsList.length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '40px 20px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--t3)', fontSize: 14, marginBottom: 12 }}>
                    No reviews yet. Have you dined here? Be the first to share your feedback!
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowReviewModal(true)}
                    style={{ borderRadius: 10, fontWeight: 700 }}
                  >
                    Write First Review
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reviewsList.map(rev => {
                    const authorName = rev.user?.name || rev.author || 'Bennett Scholar';
                    const authorDept = rev.user?.department || rev.dept || 'Bennett Member';
                    const avatarUrl = rev.user?.avatar || rev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=064E3B&color=fff`;
                    const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : (rev.date || 'Recently');
                    const isUpvoted = !!upvotedMap[rev.id];

                    return (
                      <div
                        key={rev.id}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid var(--border)',
                          borderRadius: 16,
                          padding: 18,
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={avatarUrl}
                              alt={authorName}
                              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #15803D' }}
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>{authorName}</span>
                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: 99,
                                  background: '#ECFDF5',
                                  color: '#065F46',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3
                                }}>
                                  <ShieldCheck size={11} /> Verified Diner
                                </span>
                              </div>
                              <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{authorDept} · {dateStr}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 2, color: '#F59E0B' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                size={13}
                                fill={s <= rev.rating ? '#F59E0B' : 'none'}
                                color="#F59E0B"
                              />
                            ))}
                          </div>
                        </div>

                        {rev.orderedDish && (
                          <div style={{ fontSize: 12, color: '#15803D', fontWeight: 700, marginBottom: 6 }}>
                            Ordered: {rev.orderedDish}
                          </div>
                        )}

                        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 10 }}>
                          "{rev.comment || rev.text}"
                        </p>

                        <button
                          type="button"
                          onClick={() => handleUpvote(rev.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: isUpvoted ? '#ECFDF5' : '#F8FAFC',
                            color: isUpvoted ? '#065F46' : 'var(--t3)',
                            border: `1px solid ${isUpvoted ? '#A7F3D0' : 'var(--border)'}`,
                            borderRadius: 8,
                            padding: '4px 10px',
                            fontSize: 11.5,
                            cursor: 'pointer',
                            fontWeight: isUpvoted ? 700 : 500
                          }}
                        >
                          <ThumbsUp size={12} fill={isUpvoted ? '#065F46' : 'none'} />
                          <span>Helpful ({rev.helpfulVotes || rev.helpfulCount || 0})</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: ABOUT & LOCATION ── */}
          {activeTab === 'About & Location' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 24,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 10 }}>
                  About the Restaurant
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 20 }}>
                  {restaurant.description}
                </p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                    <MapPin size={16} className="text-emerald-700" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                    <Phone size={16} className="text-emerald-700" />
                    <span>{restaurant.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                    <Clock size={16} className="text-emerald-700" />
                    <span>Hours: {restaurant.hours}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                    <Users size={16} className="text-emerald-700" />
                    <span>Capacity: Up to {restaurant.capacity} diners</span>
                  </div>
                </div>
              </div>

              {/* Campus Proximity Card */}
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 20,
                padding: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#065F46', marginBottom: 2 }}>
                    {restaurant.distance} km from Bennett University Main Gate
                  </div>
                  <div style={{ fontSize: 12.5, color: '#047857' }}>
                    Approx. 4 mins by auto-rickshaw or 10-12 mins walking distance.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const query = encodeURIComponent(`${restaurant.name}, Bennett University, Greater Noida`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                  }}
                  style={{ borderRadius: 10, fontWeight: 700, gap: 6 }}
                >
                  <ExternalLink size={14} /> Open Route Map
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Sticky Reservation Rail Card (Desktop) ── */}
        <div className="booking-rail-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Instant Seating
              </span>
              <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', margin: '2px 0 0' }}>
                Reserve a Table
              </h3>
            </div>
            <span style={{
              background: '#ECFDF5',
              color: '#065F46',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 99
            }}>
              Tier-1 Pass
            </span>
          </div>

          <p style={{ fontSize: 12.5, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 18 }}>
            Guaranteed seating for Bennett students &amp; faculty members with digital QR entry.
          </p>

          <div style={{
            background: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 14,
            marginBottom: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 12.5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t2)' }}>
              <span>Price Category:</span>
              <strong style={{ color: 'var(--t1)' }}>{restaurant.price}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t2)' }}>
              <span>Capacity:</span>
              <strong style={{ color: 'var(--t1)' }}>Up to {restaurant.capacity} diners</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t2)' }}>
              <span>Campus Discount:</span>
              <strong style={{ color: '#15803D' }}>20% OFF Available</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-fw btn-md"
            onClick={() => setShowBookingModal(true)}
            style={{
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              boxShadow: '0 8px 18px rgba(21, 128, 61, 0.3)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Sparkles size={16} /> Book Dining Pass
          </button>
        </div>
      </div>

      {/* ── Fixed Mobile Bottom Action Bar ── */}
      <div
        className="mobile-only-flex"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border)',
          padding: '12px 18px',
          zIndex: 100,
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#15803D', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} /> Instant Table Lock
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)' }}>
            {restaurant.price} · {restaurant.distance} km away
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowBookingModal(true)}
          style={{
            borderRadius: 12,
            padding: '10px 22px',
            fontSize: 13,
            fontWeight: 800
          }}
        >
          Book Table
        </button>
      </div>

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          restaurant={restaurant}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          restaurant={restaurant}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewAdded}
        />
      )}

      {selectedOffer && (
        <OfferDrawer
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onApplyOffer={() => setShowBookingModal(true)}
        />
      )}
    </div>
  );
}
