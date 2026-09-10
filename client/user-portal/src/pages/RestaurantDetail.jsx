import { useState, useEffect } from 'react';
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
  GraduationCap,
  Tag,
  Leaf,
  Zap,
  Award,
  ArrowUpDown
} from 'lucide-react';

const TABS = ['Menu Catalog', 'Active Offers', 'Student Reviews', 'About & Location'];

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
  const [menuViewMode, setMenuViewMode] = useState('serpentine');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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

  // Curated Fallback Menu for rich visual experience matching poster showcase
  const CURATED_FALLBACK_MENUS = {
    1: {
      'Chef Specialties': [
        {
          id: 'sg-1',
          name: 'Smoked Dal Makhani',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Verified organic black lentils cooked overnight with cultured butter.',
          price: 180,
          veg: true,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-2',
          name: 'Butter Chicken Masala',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Verified tandoori chicken simmered in rich satin tomato gravy.',
          price: 215,
          veg: false,
          image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-3',
          name: 'Garlic Butter Naan',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Verified crispy leavened bread brushed with farm butter and minced garlic.',
          price: 75,
          veg: true,
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-4',
          name: 'Paneer Tikka Angara',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Charcoal-smoked cottage cheese cubes marinated in royal Kashmiri chili rub.',
          price: 280,
          veg: true,
          image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-5',
          name: 'Murgh Malai Tikka',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Cream-marinated tender chicken kebabs finished in clay tandoor.',
          price: 340,
          veg: false,
          image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-6',
          name: 'Awadhi Dum Biryani',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Fragrant aged basmati rice layered with saffron chicken and kewra essence.',
          price: 360,
          veg: false,
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-7',
          name: 'Subz Handi Biryani',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Garden vegetables and basmati cooked on slow charcoal dum.',
          price: 290,
          veg: true,
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'sg-8',
          name: 'Royal Kesari Kulfi',
          desc: 'House specialty prepared fresh daily at The Spice Garden. Dense saffron and pistachio ice cream on stick served with chilled rabri.',
          price: 120,
          veg: true,
          image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80'
        }
      ]
    }
  };

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
            desc: item.desc || `House specialty prepared fresh daily at ${restaurant?.name}. Verified farm ingredients.`,
            image: item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
            price: item.price || 180,
            available: item.isAvailable !== undefined ? item.isAvailable : true,
          });
          return acc;
        }, {})
      : (CURATED_FALLBACK_MENUS[restaurant?.id] || CURATED_FALLBACK_MENUS[1]));

  const menu = rawMenu || CURATED_FALLBACK_MENUS[1];

  // Live offers from database
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
        terms: o.minOrderAmount ? `Minimum spend ₹${o.minOrderAmount}. Verified campus diners.` : 'Valid on table dine-in orders.',
        restaurantName: restaurant?.name
      }))
    : [];

  const handleReviewAdded = async (newReview) => {
    // Refresh both reviews and restaurant to reflect recalculated rating
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
      // Optimistic update
      setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r));
      await api.reviews.markHelpful(reviewId);
    } catch (err) {
      console.warn('Failed to upvote review:', err);
    }
  };

  if (!restaurant) {
    return (
      <div className="page-pad" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--t2)', fontSize: 14 }}>Connecting to restaurant network...</div>
      </div>
    );
  }

  return (
    <div className="page-pad">
      {/* Top Breadcrumb / Back Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0 }}
        >
          <ArrowLeft size={16} /> Back to Discover
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="icon-btn icon-btn-favorite"
            onClick={() => setIsFavorited(!isFavorited)}
            title="Save to favorites"
            style={{ color: isFavorited ? '#EF4444' : 'var(--t3)' }}
          >
            <Heart size={16} fill={isFavorited ? '#EF4444' : 'none'} />
          </button>
          <button
            className="icon-btn"
            onClick={() => alert('Link copied to clipboard!')}
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Hero Header Section */}
      <div
        className="anim-fade-up"
        style={{
          position: 'relative',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          marginBottom: 28,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ position: 'relative', height: 'clamp(240px, 40vw, 360px)', width: '100%' }}>
          <img
            src={restaurant.heroImage || restaurant.image}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10,14,23,0.3) 0%, rgba(10,14,23,0.92) 100%)'
          }} />

          {/* Hero Content Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 'clamp(14px, 3vw, 24px)',
            left: 'clamp(14px, 3vw, 28px)',
            right: 'clamp(14px, 3vw, 28px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <GraduationCap size={12} /> Bennett Partner
                </span>
                <span className="badge badge-success">● {restaurant.isOpen ? 'Open Now' : 'Closed'}</span>
                {restaurant.hasOffer && (
                  <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={12} /> {restaurant.offerLabel}
                  </span>
                )}
                {restaurant.tags.map(t => (
                  <span key={t} className="badge badge-neutral" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
                    {t}
                  </span>
                ))}
              </div>

              <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>
                {restaurant.name}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 12 }}>
                {restaurant.tagline || restaurant.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--t3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontWeight: 700 }}>
                  <Star size={15} fill="#F59E0B" /> {restaurant.rating} ({displayReviewsCount} reviews)
                </span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary-light)', fontWeight: 600 }}>
                  <MapPin size={14} /> {restaurant.distance} km from Bennett Campus
                </span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> {restaurant.hours}
                </span>
                <span>·</span>
                <span>{restaurant.price}</span>
              </div>
            </div>

            {/* Main Action Button */}
            <div className="mobile-full-btn" style={{ flexShrink: 0 }}>
              <button
                className="btn btn-accent btn-lg"
                onClick={() => setShowBookingModal(true)}
              >
                <Sparkles size={18} /> Book Dining Pass
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="tab-bar anim-fade-up delay-1" style={{ marginBottom: 28 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Active Offers' && offers.length > 0 && (
              <span className="badge badge-warning" style={{ marginLeft: 8, fontSize: 10, padding: '1px 6px' }}>
                {offers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content for Tabs */}
      <div className="anim-fade-up delay-2">

        {/* TAB 1: MENU CATALOG */}
        {activeTab === 'Menu Catalog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Filter Controls for Dishes & View Mode Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div className="form-input-wrap" style={{ width: 280, maxWidth: '100%' }}>
                <Search size={16} className="form-input-icon text-amber-400" />
                <input
                  className="form-input"
                  placeholder="Search dishes..."
                  value={dishSearch}
                  onChange={e => setDishSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Dish Sort Selector */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFFFF', padding: '5px 12px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)' }}>
                  <ArrowUpDown size={13} style={{ color: 'var(--primary)' }} />
                  <select
                    value={dishSort}
                    onChange={e => setDishSort(e.target.value)}
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
                    <option value="default">Sort: Default</option>
                    <option value="veg-first">Vegetarian First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-az">Dish Name (A - Z)</option>
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t2)', cursor: 'pointer', background: '#FFFFFF', padding: '6px 14px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={vegOnly}
                    onChange={e => setVegOnly(e.target.checked)}
                    style={{ accentColor: 'var(--success)' }}
                  />
                  Pure Veg Only
                </label>

                {/* View Switcher: Explore Road vs Grid */}
                <div style={{ display: 'inline-flex', background: '#FFFFFF', borderRadius: 'var(--r-full)', padding: 3, border: '1px solid var(--border)' }}>
                  <button
                    className={`btn btn-xs ${menuViewMode === 'serpentine' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ borderRadius: 'var(--r-full)', fontSize: 11, padding: '4px 10px', gap: 4 }}
                    onClick={() => setMenuViewMode('serpentine')}
                    title="Explore Road Menu View (Retro Winding Road)"
                  >
                    <Sparkles size={12} /> Explore Road
                  </button>
                  <button
                    className={`btn btn-xs ${menuViewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ borderRadius: 'var(--r-full)', fontSize: 11, padding: '4px 10px', gap: 4 }}
                    onClick={() => setMenuViewMode('grid')}
                    title="Standard Card Grid"
                  >
                    <LayoutGrid size={12} /> Grid View
                  </button>
                </div>
              </div>
            </div>

            {/* VIEW 1: SERPENTINE WINDING ROAD (EXPLORE ROAD) */}
            {menuViewMode === 'serpentine' && (() => {
              const allDishes = Object.entries(menu).flatMap(([cat, items]) =>
                items.map(i => ({ ...i, category: cat }))
              );
              let filteredDishes = allDishes.filter(item => {
                if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
                if (vegOnly && !item.veg) return false;
                if (dishSearch && !item.name.toLowerCase().includes(dishSearch.toLowerCase()) && !item.desc.toLowerCase().includes(dishSearch.toLowerCase())) return false;
                return true;
              });

              if (dishSort === 'veg-first') {
                filteredDishes.sort((a, b) => (b.veg ? 1 : 0) - (a.veg ? 1 : 0));
              } else if (dishSort === 'price-low') {
                filteredDishes.sort((a, b) => (a.price || 0) - (b.price || 0));
              } else if (dishSort === 'price-high') {
                filteredDishes.sort((a, b) => (b.price || 0) - (a.price || 0));
              } else if (dishSort === 'name-az') {
                filteredDishes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
              }
              const categories = ['ALL', ...Object.keys(menu)];

              return (
                <div className="winding-menu-wrapper">
                  <div className="winding-menu-bg-text">FOOD</div>

                  {/* Header in Retro Paytone Font & Restaurant Identity */}
                  <div className="winding-header">
                    <div className="winding-subtag">
                      <span>@{restaurant.name?.toLowerCase().replace(/\s+/g, '') || 'lora'}.dining</span>
                      <span>•</span>
                      <span>verified campus partner</span>
                    </div>
                    <div className="winding-cloud-icon"><Leaf size={22} style={{ color: '#E7F1E1' }} /></div>
                    <h2 className="winding-main-title">{restaurant.name ? `${restaurant.name.toUpperCase()} MENU` : 'OUR MENU'}</h2>
                    <div style={{ fontSize: 11.5, color: '#A9C5A2', marginTop: 4, letterSpacing: '0.03em' }}>
                      From Kitchen To Table · Fresh Dishes &amp; Chef Recommendations
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  {categories.length > 2 && (
                    <div className="winding-cat-pills">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          className={`winding-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat === 'ALL' ? 'All Items' : cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Serpentine Vertical Winding Track */}
                  {filteredDishes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: '#A9C5A2' }}>
                      No dishes match your filter criteria.
                    </div>
                  ) : (
                    <div className="winding-track-container">
                      <div className="winding-track-spine" />
                      {filteredDishes.map((item, index) => {
                        const isLeftDish = index % 2 === 0;
                        return (
                          <div
                            key={item.id || item.name}
                            className={`winding-row ${isLeftDish ? 'left-dish' : 'right-dish'}`}
                          >
                            {/* Circular Popping Dish Image Orb */}
                            <div
                              className="winding-dish-orb"
                              onClick={() => setShowBookingModal(true)}
                              title={`Book dining pass for ${item.name}`}
                            >
                              <img src={item.image} alt={item.name} loading="lazy" />
                            </div>

                            {/* Curved Pill Card */}
                            <div className="winding-pill">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-start' }}>
                                <span style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: item.veg ? '#10B981' : '#EF4444',
                                  boxShadow: item.veg ? '0 0 8px rgba(16, 185, 129, 0.6)' : '0 0 8px rgba(239, 68, 68, 0.6)',
                                  flexShrink: 0
                                }} />
                                <div className="winding-pill-title">{item.name}</div>
                              </div>

                              <p className="winding-pill-desc">{item.desc}</p>

                              <div className="winding-pill-footer">
                                <span className="winding-price">₹{item.price}</span>
                                <button
                                  type="button"
                                  className="winding-add-btn"
                                  onClick={() => setShowBookingModal(true)}
                                >
                                  + Pre-Book
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Lora Botanical Certified Footer Note */}
                  <div className="winding-footer-note">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E7F1E1' }}>
                      <Leaf size={14} style={{ color: '#6FAF3D' }} /> Farm-To-Table Certified · {restaurant.phone || '+91 Bennett Dining Desk'}
                    </span>
                    <span style={{ color: '#A9C5A2' }}>Natural · Pure · Sustainable</span>
                  </div>

                  {/* Side Watermark */}
                  <div className="winding-side-watermark">
                    {restaurant.phone || '+91 Bennett Dining Desk'} · {restaurant.name}
                  </div>
                </div>
              );
            })()}

            {/* VIEW 2: STANDARD CATEGORIZED GRID */}
            {menuViewMode === 'grid' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {Object.entries(menu).map(([category, items]) => {
                  let sortedItems = items.filter(item => {
                    if (vegOnly && !item.veg) return false;
                    if (dishSearch && !item.name.toLowerCase().includes(dishSearch.toLowerCase()) && !item.desc.toLowerCase().includes(dishSearch.toLowerCase())) return false;
                    return true;
                  });

                  if (dishSort === 'veg-first') {
                    sortedItems.sort((a, b) => (b.veg ? 1 : 0) - (a.veg ? 1 : 0));
                  } else if (dishSort === 'price-low') {
                    sortedItems.sort((a, b) => (a.price || 0) - (b.price || 0));
                  } else if (dishSort === 'price-high') {
                    sortedItems.sort((a, b) => (b.price || 0) - (a.price || 0));
                  } else if (dishSort === 'name-az') {
                    sortedItems.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                  }

                  if (sortedItems.length === 0) return null;

                  return (
                    <div key={category}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)' }}>
                          {category}
                        </h3>
                        <span style={{ fontSize: 12, color: 'var(--t4)' }}>({sortedItems.length} items)</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(12px, 2vw, 18px)' }}>
                        {sortedItems.map(item => (
                          <div
                            key={item.id || item.name}
                            className="card card-hover"
                            style={{
                              padding: 16,
                              display: 'flex',
                              gap: 16,
                              opacity: item.available ? 1 : 0.6,
                              position: 'relative'
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: 90, height: 90, borderRadius: 'var(--r-sm)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                            />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.veg ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                                  <h4 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--t1)' }}>
                                    {item.name}
                                  </h4>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>₹{item.price}</span>
                              </div>

                              <p style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.desc}
                              </p>

                              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {item.badge && <span className="badge badge-warning" style={{ fontSize: 10 }}>{item.badge}</span>}
                                  {item.calories && <span style={{ fontSize: 11, color: 'var(--t4)' }}>{item.calories}</span>}
                                </div>
                                {!item.available ? (
                                  <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Sold Out Today</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '3px 8px', fontSize: 11 }}
                                    onClick={() => setShowBookingModal(true)}
                                  >
                                    Pre-Book
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE OFFERS */}
        {activeTab === 'Active Offers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'clamp(14px, 2.5vw, 20px)' }}>
            {offers.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(217, 119, 6, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Tag size={22} />
                </div>
                <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>No Active Offers Right Now</h4>
                <p style={{ color: 'var(--t3)', fontSize: 13 }}>Check back soon for new Bennett campus promotions and festival dining specials.</p>
              </div>
            ) : (
              offers.map(offer => (
                <div
                  key={offer.id}
                  className="card card-hover anim-fade-up"
                  style={{
                    padding: 24,
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span className="badge badge-warning" style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Tag size={12} /> {offer.discount}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>Till {offer.validTill}</span>
                    </div>

                    <h4 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                      {offer.title}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 16 }}>
                      {offer.description}
                    </p>

                    <div
                      className="promo-code-box"
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--r-sm)',
                        background: '#FFFBEB',
                        border: '1.5px dashed #F59E0B',
                        marginBottom: 18,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>PROMO CODE</div>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B45309', letterSpacing: '0.08em' }}>
                          {offer.code || offer.promoCode}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#92400E', background: '#FEF3C7', padding: '3px 8px', borderRadius: 4 }}>
                        Auto-applied on booking
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-fw btn-md cursor-pointer"
                    onClick={() => setSelectedOffer(offer)}
                    style={{ borderRadius: 'var(--r-full)' }}
                  >
                    <Sparkles size={15} /> Claim Voucher & Reserve
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: STUDENT REVIEWS */}
        {activeTab === 'Student Reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Review Summary Score Card */}
            <div className="card" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="font-display" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>
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

                {/* Rating Distribution Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 200 }}>
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = reviewStats.breakdown[stars] || 0;
                    const total = reviewStats.total || reviewsList.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                        <span style={{ color: 'var(--t3)', width: 42 }}>{stars} Star{stars > 1 ? 's' : ''}</span>
                        <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B' }} />
                        </div>
                        <span style={{ color: 'var(--t4)', width: 28, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <button
                  className="btn btn-accent btn-md"
                  onClick={() => setShowReviewModal(true)}
                >
                  <MessageSquarePlus size={16} /> Write a Review
                </button>
              </div>
            </div>

            {/* Reviews List */}
            {reviewsList.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <MessageSquarePlus size={36} color="var(--t3)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No Reviews Yet</h4>
                <p style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 400, margin: '0 auto 16px' }}>
                  Have you dined here using an institutional reservation? Share your experience with fellow Bennett students and faculty!
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowReviewModal(true)}
                  style={{ margin: '0 auto' }}
                >
                  Be First to Review
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviewsList.map(rev => {
                  const authorName = rev.user?.name || rev.author || 'Bennett Scholar';
                  const authorDept = rev.user?.department || rev.dept || (rev.user?.role === 'STUDENT' ? 'Student Member' : 'Faculty Member');
                  const avatarUrl = rev.user?.avatar || rev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1E3A8A&color=fff`;
                  const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : (rev.date || 'Recently');
                  const isUpvoted = !!upvotedMap[rev.id];

                  return (
                    <div key={rev.id} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={avatarUrl}
                            alt={authorName}
                            style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent)' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{authorName}</span>
                              <span className="badge badge-success" style={{ fontSize: 10, padding: '1px 5px' }}>
                                <ShieldCheck size={11} /> Verified Member
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{authorDept} · {dateStr}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 2, color: '#F59E0B' }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= rev.rating ? '#F59E0B' : 'none'}
                              color="#F59E0B"
                            />
                          ))}
                        </div>
                      </div>

                      {(rev.orderedDish || rev.dish) && (
                        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>
                          Ordered: {rev.orderedDish || rev.dish}
                        </div>
                      )}

                      <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 14 }}>
                        "{rev.comment || rev.text}"
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <button
                          type="button"
                          onClick={() => handleUpvote(rev.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            background: isUpvoted ? '#EFF6FF' : 'transparent',
                            color: isUpvoted ? 'var(--primary)' : 'var(--t3)',
                            border: isUpvoted ? '1px solid #BFDBFE' : '1px solid var(--border)',
                            borderRadius: 'var(--r-sm)',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: isUpvoted ? 700 : 500
                          }}
                        >
                          <ThumbsUp size={13} fill={isUpvoted ? 'var(--primary)' : 'none'} />
                          <span>Helpful ({rev.helpfulVotes || rev.helpfulCount || 0})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ABOUT & LOCATION */}
        {activeTab === 'About & Location' && (
          <div className="about-grid">
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                About the Restaurant
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.6 }}>
                {restaurant.description}
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                  <MapPin size={16} className="text-indigo-400" />
                  <span>{restaurant.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                  <Phone size={16} className="text-emerald-400" />
                  <span>{restaurant.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                  <Clock size={16} className="text-amber-400" />
                  <span>Operating Hours: {restaurant.hours}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)' }}>
                  <Users size={16} className="text-sky-400" />
                  <span>Seating Capacity: Up to {restaurant.capacity} guests</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Campus Proximity & Amenities
              </h3>
              <div style={{ padding: 16, borderRadius: 'var(--r-sm)', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{restaurant.distance} km from Bennett Main Gate</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)' }}>Approx. 4 mins by auto / 10 mins walk</div>
                </div>
              </div>

              <div>
                <div className="form-label" style={{ marginBottom: 10 }}>Facilities & Dining Features</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(restaurant.features || ['Air Conditioned', 'WiFi', 'Instant Reservation']).map(f => (
                    <span key={f} className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} /> {f}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-outline btn-md"
                style={{ marginTop: 'auto' }}
                onClick={() => alert(`Opening navigation route from Bennett University to ${restaurant.name}...`)}
              >
                <MapPin size={15} /> Get Campus Route Directions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="district-sticky-footer mobile-only-flex" style={{ display: 'none' }}>
        <div>
          <div style={{ fontSize: 11, color: '#10B981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} /> Instant Seating Available
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)' }}>
            {restaurant.price} · Up to {restaurant.capacity} diners
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-md"
          onClick={() => setShowBookingModal(true)}
          style={{
            borderRadius: 'var(--r-full)',
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #FF2B6D 0%, #D91B58 100%)',
            boxShadow: '0 4px 16px rgba(255, 43, 109, 0.4)'
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
