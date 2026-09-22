import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDining } from '../../context/DiningContext';
import api from '../../services/api';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  UserX,
  Store,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Plus,
  ShieldAlert,
  Globe,
  Trash2,
  EyeOff,
  Eye,
  Activity,
  X,
  KeyRound,
  Send,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Star,
  GraduationCap,
  Users,
  BarChart3,
  Search,
  Filter,
  Check,
  RefreshCw,
  Clock,
  Shield,
  CalendarCheck,
  Calendar
} from 'lucide-react';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth() || {};
  const {
    verifications = [],
    sendVerificationCode,
    restaurants = [],
    reservations = [],
    onboardRestaurant,
    deleteRestaurant,
    toggleRestaurantStatus
  } = useDining() || {};

  // Protect route: only SUPER_ADMIN should be on this page
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      navigate(user.homePath || '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('Restaurants');
  const [lastSentInfo, setLastSentInfo] = useState(null);
  const [restaurantsList, setRestaurantsList] = useState(restaurants);

  // Sync tab with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      const lower = tabParam.toLowerCase();
      if (lower === 'restaurants') setActiveTab('Restaurants');
      else if (lower === 'users') setActiveTab('Users');
      else if (lower === 'clearance') setActiveTab('Clearance');
      else if (lower === 'institutions') setActiveTab('Institutions');
      else if (lower === 'analytics') setActiveTab('Analytics');
      else if (lower === 'moderation') setActiveTab('Moderation');
      else if (lower === 'audit') setActiveTab('Audit');
    }
  }, [location.search]);

  // ================= USERS DIRECTORY STATE =================
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userVerifiedFilter, setUserVerifiedFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    if (user?.role !== 'SUPER_ADMIN') return;
    setLoadingUsers(true);
    try {
      const params = {};
      if (userRoleFilter !== 'ALL') params.role = userRoleFilter;
      if (userVerifiedFilter !== 'ALL') params.verified = userVerifiedFilter === 'VERIFIED';
      if (userSearch.trim()) params.search = userSearch.trim();
      const res = await api.users.getAll(params);
      if (res?.success && Array.isArray(res.data)) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch user directory:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Users') {
      fetchUsers();
    }
  }, [activeTab, userRoleFilter, userVerifiedFilter, userSearch]);

  const handleToggleUserVerify = async (userId, currentVerified) => {
    try {
      await api.users.toggleVerify(userId, !currentVerified);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, verified: !currentVerified } : u));
    } catch (err) {
      alert('Failed to update verification status: ' + err.message);
    }
  };

  const handleUpdateUserRole = async (userId, newRole, restaurantId = null) => {
    try {
      await api.users.updateRole(userId, newRole, restaurantId);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, restaurantId } : u));
    } catch (err) {
      alert('Failed to update user role: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) {
      try {
        await api.users.delete(userId);
        setUsersList(prev => prev.filter(u => u.id !== userId));
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  // ================= INSTITUTIONS STATE =================
  const [institutions, setInstitutions] = useState([]);
  const [showInstModal, setShowInstModal] = useState(false);
  const [instSubmitting, setInstSubmitting] = useState(false);
  const [instForm, setInstForm] = useState({ name: '', domain: '', location: '' });

  const fetchInstitutions = async () => {
    if (user?.role !== 'SUPER_ADMIN') return;
    try {
      const res = await api.institutions.getAll();
      if (res?.success && Array.isArray(res.data)) {
        setInstitutions(res.data);
      }
    } catch (err) {
      console.warn('Failed to load institutions:', err);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [user?.role]);

  const handleAddInstitution = async (e) => {
    e.preventDefault();
    if (!instForm.name || !instForm.domain) return;
    setInstSubmitting(true);
    try {
      const domainClean = instForm.domain.startsWith('@') ? instForm.domain : `@${instForm.domain}`;
      const res = await api.institutions.create({
        name: instForm.name,
        domain: domainClean,
        location: instForm.location || 'Delhi NCR'
      });
      if (res?.success && res.data) {
        setInstitutions(prev => [res.data, ...prev]);
        setShowInstModal(false);
        setInstForm({ name: '', domain: '', location: '' });
      }
    } catch (err) {
      alert('Failed to create institution: ' + err.message);
    } finally {
      setInstSubmitting(false);
    }
  };

  const handleDeleteInstitution = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove institution "${name}"?`)) {
      try {
        await api.institutions.delete(id);
        setInstitutions(prev => prev.filter(i => i.id !== id));
      } catch (err) {
        alert('Failed to delete institution: ' + err.message);
      }
    }
  };

  // ================= AUDIT LOGS STATE =================
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const fetchAuditLogs = async () => {
    if (user?.role !== 'SUPER_ADMIN') return;
    setLoadingAudit(true);
    try {
      const res = await api.superadmin.getAuditLogs({ limit: 50 });
      if (res?.success && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  // ================= PLATFORM ANALYTICS STATE =================
  const [platformStats, setPlatformStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchPlatformStats = async () => {
    if (user?.role !== 'SUPER_ADMIN') return;
    setLoadingStats(true);
    try {
      const res = await api.superadmin.getPlatformAnalytics();
      if (res?.success && res.data) {
        setPlatformStats(res.data);
      }
    } catch (err) {
      console.warn('Failed to load platform analytics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Analytics') {
      fetchPlatformStats();
    }
  }, [activeTab]);

  // ================= RESTAURANT ONBOARDING STATE =================
  const [showAddRestModal, setShowAddRestModal] = useState(false);
  const [submittingRest, setSubmittingRest] = useState(false);
  const [restSuccessMsg, setRestSuccessMsg] = useState('');
  const [restForm, setRestForm] = useState({
    name: '',
    cuisine: 'North Indian',
    tagline: '',
    price: '₹₹',
    address: '',
    phone: '',
    hours: '11:00 AM – 11:00 PM',
    capacity: 40,
    image: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: 'password123'
  });

  useEffect(() => {
    if (restaurants && restaurants.length > 0) {
      setRestaurantsList(restaurants);
    }
  }, [restaurants]);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!restForm.name || !restForm.cuisine || !restForm.address || !restForm.phone) {
      alert('Please fill out all required fields (Name, Cuisine, Address, Phone).');
      return;
    }

    setSubmittingRest(true);
    try {
      const created = await onboardRestaurant({
        ...restForm,
        capacity: Number(restForm.capacity) || 40,
        image: restForm.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
      });

      setRestSuccessMsg(`Restaurant "${created.name}" onboarded and live!`);
      setTimeout(() => setRestSuccessMsg(''), 4000);
      setShowAddRestModal(false);
      setRestForm({
        name: '',
        cuisine: 'North Indian',
        tagline: '',
        price: '₹₹',
        address: '',
        phone: '',
        hours: '11:00 AM – 11:00 PM',
        capacity: 40,
        image: '',
        description: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: 'password123'
      });
    } catch (err) {
      alert('Failed to onboard restaurant: ' + err.message);
    } finally {
      setSubmittingRest(false);
    }
  };

  const handleDeleteRestaurant = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will remove all its tables and menus.`)) {
      try {
        await deleteRestaurant(id);
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleRestaurantStatus(id, !currentStatus);
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  // Reviews moderation state
  const [moderationReviews, setModerationReviews] = useState([]);
  const [loadingModeration, setLoadingModeration] = useState(false);

  const fetchModerationReviews = async () => {
    setLoadingModeration(true);
    try {
      const res = await api.superadmin.getAllReviews();
      if (res?.success && Array.isArray(res.data)) {
        setModerationReviews(res.data.map(r => ({
          id: r.id,
          restaurant: r.restaurant?.name || 'Partner Outlet',
          author: `${r.user?.name || r.userName || 'Student'} (${r.user?.department || r.userDept || 'Bennett'})`,
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          text: r.comment,
          flagged: r.status === 'UNDER_REVIEW' || r.status === 'HIDDEN',
          status: r.status
        })));
      }
    } catch (err) {
      console.warn('Failed to load moderation reviews from API:', err);
    } finally {
      setLoadingModeration(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Moderation') {
      fetchModerationReviews();
    }
  }, [activeTab]);

  const toggleReviewStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'APPROVED' ? 'HIDDEN' : 'APPROVED';
    try {
      await api.superadmin.moderateReview(id, nextStatus);
      setModerationReviews(prev => prev.map(r => r.id === id ? { ...r, status: nextStatus, flagged: nextStatus !== 'APPROVED' } : r));
    } catch (err) {
      alert('Failed to update review status: ' + err.message);
    }
  };

  const handleSendVerificationCode = async (applicant) => {
    const res = await sendVerificationCode(applicant.id);
    const code = res?.code || '849201';
    setLastSentInfo({
      name: applicant.name,
      email: applicant.email,
      code
    });
  };

  return (
    <div className="page-pad">
      {/* Executive Hero Banner */}
      <div className="anim-fade-up dashboard-hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="status-pill" style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.22)', padding: '3px 10px', fontSize: 11 }}>
                ● Super Admin Governance
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Institution: Bennett University</span>
            </div>
            <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '4px 0 2px' }}>
              Platform Operations &amp; Verification Gate
            </h2>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
              Governed by NIVIXPE PRIVATE LIMITED · PostgreSQL Live Network
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="tabs-scroll-x" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 16, width: '100%', gap: 8 }}>
          <button
            className={`btn-tab-pill ${activeTab === 'Restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('Restaurants')}
          >
            <Store size={14} /> Partner Restaurants ({restaurantsList.length})
          </button>
          <button
            className={`btn-tab-pill ${activeTab === 'Users' ? 'active' : ''}`}
            onClick={() => setActiveTab('Users')}
          >
            <Users size={14} /> User Directory ({usersList.length})
          </button>
          <button
            className={`btn-tab-pill ${activeTab === 'Institutions' ? 'active' : ''}`}
            onClick={() => setActiveTab('Institutions')}
          >
            <Globe size={14} /> Institutions ({institutions.length})
          </button>
          <button
            className={`btn-tab-pill ${activeTab === 'Bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('Bookings')}
          >
            <Calendar size={14} /> Bookings ({reservations.length})
          </button>
          <button
            className={`btn-tab-pill ${activeTab === 'Analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('Analytics')}
          >
            <BarChart3 size={14} /> Platform Analytics
          </button>
          <button
            className={`btn-tab-pill ${activeTab === 'Moderation' ? 'active' : ''}`}
            onClick={() => setActiveTab('Moderation')}
          >
            <ShieldAlert size={14} /> Reviews Moderation
          </button>
          <button
            className={`btn-tab-pill ${activeTab === 'Audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('Audit')}
          >
            <Activity size={14} /> Security Audit
          </button>
        </div>
      </div>

      {/* Quick Interactive KPI Overview */}
      <div className="grid-responsive-kpi anim-fade-up delay-1">
        <div
          className="kpi-card-lux"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('Restaurants')}
          title="Click to view Partner Restaurants"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Partner Restaurants
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <Store size={14} />
            </div>
          </div>
          <div className="font-display" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 6px' }}>
            {restaurantsList.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748B' }}>Active</span>
          </div>
          <div style={{ fontSize: 11.5, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F172A', display: 'inline-block' }}></span>
            Live PostgreSQL DB →
          </div>
        </div>

        <div
          className="kpi-card-lux"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('Bookings')}
          title="Click to view Live Bookings"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Bookings
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <Calendar size={14} />
            </div>
          </div>
          <div className="font-display" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 6px' }}>
            {reservations.length}
          </div>
          <div style={{ fontSize: 11.5, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F172A', display: 'inline-block' }}></span>
            Real-time reservations →
          </div>
        </div>

        <div
          className="kpi-card-lux"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('Institutions')}
          title="Click to view Institutions"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Institutions
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <Globe size={14} />
            </div>
          </div>
          <div className="font-display" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 6px' }}>
            {institutions.length}
          </div>
          <div style={{ fontSize: 11.5, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F172A', display: 'inline-block' }}></span>
            Multi-tenant campus gates →
          </div>
        </div>
      </div>

      {/* ================= TAB 1: RESTAURANTS ================= */}
      {activeTab === 'Restaurants' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Institutional Partner Establishments
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B' }}>
                Authorized dining outlets for Bennett University students and faculty members.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="status-pill">{restaurantsList.length} Outlets Configured</span>
              <button
                className="btn-action-admit"
                style={{ padding: '8px 16px', fontSize: 12 }}
                onClick={() => setShowAddRestModal(true)}
              >
                <Plus size={14} /> Onboard Restaurant
              </button>
            </div>
          </div>

          {restSuccessMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
              {restSuccessMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
            {restaurantsList.map(r => (
              <div key={r.id} className="card hover-lift" style={{ border: '1px solid #EEF0F3', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', background: '#FFFFFF', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
                <img src={r.image} alt={r.name} style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{r.name}</div>
                    <span className="status-pill">
                      {r.isOpen ? '● Open' : '○ Suspended'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', margin: '3px 0' }}>{r.cuisine} · {r.price || '₹450 for two'} · {r.hours || '11:00 AM - 11:00 PM'}</div>
                  <div style={{ fontSize: 11.5, color: '#94A3B8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{r.address}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <button
                      className="btn-action-dishes"
                      style={{ padding: '6px 14px', fontSize: 11.5 }}
                      onClick={() => handleToggleStatus(r.id, r.isOpen)}
                    >
                      {r.isOpen ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      className="btn-action-cancel"
                      style={{ padding: '6px 12px', fontSize: 11.5 }}
                      onClick={() => handleDeleteRestaurant(r.id, r.name)}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: USER DIRECTORY ================= */}
      {activeTab === 'Users' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Platform User Directory &amp; RBAC Roles
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B' }}>
                Manage institutional users, promote roles, assign staff to restaurants, and control verification status.
              </p>
            </div>
            <button className="btn-action-dishes" style={{ padding: '7px 14px', fontSize: 12 }} onClick={fetchUsers}>
              <RefreshCw size={13} className={loadingUsers ? 'spin' : ''} /> Refresh Users
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94A3B8' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36, height: 38 }}
                placeholder="Search user by name, email, roll number..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Role:</span>
              <select
                className="form-select"
                style={{ height: 38, width: 170, fontSize: 12 }}
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="RESTAURANT_STAFF">Restaurant Staff</option>
                <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Status:</span>
              <select
                className="form-select"
                style={{ height: 38, width: 150, fontSize: 12 }}
                value={userVerifiedFilter}
                onChange={e => setUserVerifiedFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Campus Info</th>
                  <th>Verification</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>
                      Loading platform users from PostgreSQL...
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>
                      No users match the selected filters.
                    </td>
                  </tr>
                ) : (
                  usersList.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className="status-pill" style={{ background: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ color: '#475569' }}>
                        <div>{u.department || 'Student Body'}</div>
                        {u.rollNumber && <div style={{ fontSize: 11, color: '#94A3B8' }}>Roll: {u.rollNumber}</div>}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleUserVerify(u.id, u.verified)}
                          className={u.verified ? 'btn-action-dishes' : 'btn-action-cancel'}
                          style={{ padding: '5px 12px', fontSize: 11 }}
                        >
                          {u.verified ? (
                            <><CheckCircle2 size={12} /> Verified</>
                          ) : (
                            <><UserX size={12} /> Unverified</>
                          )}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                          <select
                            className="form-select"
                            style={{ fontSize: 11, padding: '5px 8px', height: 'auto', width: 'auto', borderRadius: 99, background: '#FFFFFF' }}
                            value={u.role}
                            onChange={e => handleUpdateUserRole(u.id, e.target.value, u.restaurantId)}
                          >
                            <option value="STUDENT">Student</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="RESTAURANT_STAFF">Staff</option>
                            <option value="RESTAURANT_ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                          {u.id !== user?.id && (
                            <button
                              className="btn-action-cancel"
                              style={{ padding: '6px 9px' }}
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Delete user"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: INSTITUTIONS ================= */}
      {activeTab === 'Institutions' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Institutional Tenant Governance &amp; Email Domains
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B' }}>
                Manage participating universities and approved institutional email domain gates.
              </p>
            </div>
            <button className="btn-action-admit" style={{ padding: '9px 18px', fontSize: 12.5 }} onClick={() => setShowInstModal(true)}>
              <Plus size={14} /> Onboard New Institution
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {institutions.map(inst => (
              <div
                key={inst.id}
                className="card hover-lift"
                style={{
                  padding: 18,
                  borderRadius: 14,
                  background: '#FFFFFF',
                  border: inst.isPrimary ? '1.5px solid #0F172A' : '1px solid #EEF0F3',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', flexShrink: 0 }}>
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{inst.name}</span>
                      {inst.isPrimary && <span className="status-pill" style={{ background: '#0F172A', color: '#FFFFFF' }}>Primary Tenant</span>}
                      <span className="status-pill">{inst.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginTop: 2 }}>
                      Allowed Domain Gate: {inst.domain} · {inst.location}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Verified Members</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{inst.activeUsers?.toLocaleString() || 0}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Partners</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{inst.partnerRestaurants || 0} Restaurants</div>
                  </div>
                  {!inst.isPrimary && (
                    <button
                      className="btn-action-cancel"
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleDeleteInstitution(inst.id, inst.name)}
                      title="Remove Institution"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: DEDICATED LIVE BOOKINGS QUEUE ================= */}
      {activeTab === 'Bookings' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Live Campus Dining Reservations &amp; Queue
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B' }}>
                Unified real-time feed of table bookings across all Bennett University partner restaurants.
              </p>
            </div>
            <span className="status-pill">{reservations.length} Active Reservations</span>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Code</th>
                  <th>Diner / Guest</th>
                  <th>Restaurant Venue</th>
                  <th>Schedule &amp; Guests</th>
                  <th>Table</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>
                      No table bookings currently recorded across partner restaurants.
                    </td>
                  </tr>
                ) : (
                  reservations.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 800, color: '#0F172A' }}>
                        {b.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.guestName || b.guest || 'Campus Member'}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{b.guestEmail || b.email || 'student@bennett.edu.in'}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>
                        {b.restaurantName || 'The Spice Garden'}
                      </td>
                      <td style={{ color: '#475569' }}>
                        <div>{b.date} · {b.time}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{b.guests || 2} Guests</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>
                        {b.tableAssigned || 'T-01'}
                      </td>
                      <td>
                        <span className="status-pill">
                          {b.status || 'CONFIRMED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 6: PLATFORM ANALYTICS ================= */}
      {activeTab === 'Analytics' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Platform Operational Analytics &amp; KPIs
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B' }}>
                Aggregated performance metrics across university partners, dining conversions, and operations.
              </p>
            </div>
            <button className="btn-action-dishes" style={{ padding: '7px 14px', fontSize: 12 }} onClick={fetchPlatformStats}>
              <RefreshCw size={13} className={loadingStats ? 'spin' : ''} /> Refresh Analytics
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="kpi-card-lux">
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Total Registered Users</div>
              <div className="font-display" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                {platformStats?.totalUsers ?? '3,420'}
              </div>
              <div style={{ fontSize: 11.5, color: '#0F172A', marginTop: 4, fontWeight: 600 }}>Active campus directory</div>
            </div>

            <div className="kpi-card-lux">
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Partner Dining Outlets</div>
              <div className="font-display" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                {platformStats?.totalRestaurants ?? restaurantsList.length}
              </div>
              <div style={{ fontSize: 11.5, color: '#0F172A', marginTop: 4, fontWeight: 600 }}>Approved campus vendors</div>
            </div>

            <div className="kpi-card-lux">
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Total Dining Volume</div>
              <div className="font-display" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                {platformStats?.totalBookings ?? '840'}
              </div>
              <div style={{ fontSize: 11.5, color: '#0F172A', marginTop: 4, fontWeight: 600 }}>98.2% fulfillment rate</div>
            </div>

            <div className="kpi-card-lux">
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Audit Events Logged</div>
              <div className="font-display" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                {platformStats?.auditEventsCount ?? '1,240'}
              </div>
              <div style={{ fontSize: 11.5, color: '#0F172A', marginTop: 4, fontWeight: 600 }}>Security &amp; access logs</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: REVIEWS MODERATION ================= */}
      {activeTab === 'Moderation' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Campus Dining Reviews Moderation Gate
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B' }}>
                Super Admin authority to hide or approve feedback according to institutional community standards.
              </p>
            </div>
            <button className="btn-action-dishes" style={{ padding: '7px 14px', fontSize: 12 }} onClick={fetchModerationReviews}>
              <RefreshCw size={13} className={loadingModeration ? 'spin' : ''} /> Refresh Reviews
            </button>
          </div>

          {moderationReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
              <ShieldAlert size={36} style={{ margin: '0 auto 12px', color: '#94A3B8' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>No Reviews Available</div>
              <div style={{ fontSize: 12 }}>There are currently no reviews submitted across partner restaurants.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {moderationReviews.map(rev => (
                <div
                  key={rev.id}
                  className="card hover-lift"
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: '#FFFFFF',
                    border: rev.flagged ? '1.5px solid #CBD5E1' : '1px solid #EEF0F3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{rev.restaurant}</span>
                      <span style={{ fontSize: 11, color: '#0F172A', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
                        <Star size={12} fill="#0F172A" /> {rev.rating}/5
                      </span>
                      <span className="status-pill">
                        {rev.status}
                      </span>
                      {rev.flagged && (
                        <span className="status-pill" style={{ background: '#F1F5F9', border: '1px solid #94A3B8' }}>
                          <AlertTriangle size={12} /> Hidden/Flagged
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
                      By {rev.author} · {rev.date}
                    </div>
                    <p style={{ fontSize: 13, color: '#334155', fontStyle: 'italic' }}>
                      "{rev.text}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={rev.status === 'APPROVED' ? 'btn-action-cancel' : 'btn-action-admit'}
                      style={{ padding: '7px 14px', fontSize: 12 }}
                      onClick={() => toggleReviewStatus(rev.id, rev.status)}
                    >
                      {rev.status === 'APPROVED' ? <><EyeOff size={13} /> Hide Review</> : <><Eye size={13} /> Approve Review</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 8: PLATFORM AUDIT LOG ================= */}
      {activeTab === 'Audit' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                System-Wide Audit Trail &amp; Compliance Log
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B' }}>
                Immutable records of administrative operations, role assignments, security actions, and dining changes.
              </p>
            </div>
            <button className="btn-action-dishes" style={{ padding: '7px 14px', fontSize: 12 }} onClick={fetchAuditLogs}>
              <RefreshCw size={13} className={loadingAudit ? 'spin' : ''} /> Refresh Logs
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Details / Metadata</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loadingAudit ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>
                      Loading audit records...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>
                      No audit log entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', color: '#64748B', fontSize: 11.5 }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{log.userName || 'System Service'}</div>
                        <div style={{ fontSize: 10.5, color: '#94A3B8' }}>{log.userRole || 'ANONYMOUS'}</div>
                      </td>
                      <td>
                        <span className="status-pill" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 11 }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: '#334155' }}>
                        {log.entityType} {log.entityId && <span style={{ fontSize: 10.5, color: '#94A3B8' }}>({log.entityId.slice(0, 8)}...)</span>}
                      </td>
                      <td style={{ color: '#64748B', maxWidth: 260, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {log.detailsJson || '—'}
                      </td>
                      <td style={{ fontSize: 11, color: '#94A3B8' }}>
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: ONBOARD RESTAURANT ================= */}
      {showAddRestModal && (
        <div className="modal-overlay" onClick={() => setShowAddRestModal(false)}>
          <div className="modal-card anim-scale-in" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-title font-display">Onboard Partner Restaurant</h3>
                <p className="modal-sub">Add a verified dining partner to Bennett University dining network</p>
              </div>
              <button className="modal-close" onClick={() => setShowAddRestModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 14 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Restaurant Name *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Bistro Central"
                      required
                      value={restForm.name}
                      onChange={e => setRestForm({ ...restForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Cuisine Type *</label>
                    <select
                      className="form-select"
                      value={restForm.cuisine}
                      onChange={e => setRestForm({ ...restForm, cuisine: e.target.value })}
                    >
                      <option value="North Indian">North Indian</option>
                      <option value="Continental">Continental</option>
                      <option value="Mediterranean">Mediterranean</option>
                      <option value="Pan-Asian">Pan-Asian</option>
                      <option value="Italian">Italian</option>
                      <option value="Fast Food & Cafe">Fast Food & Cafe</option>
                      <option value="South Indian">South Indian</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Price Category</label>
                    <select
                      className="form-select"
                      value={restForm.price}
                      onChange={e => setRestForm({ ...restForm, price: e.target.value })}
                    >
                      <option value="₹">₹ (Budget Friendly)</option>
                      <option value="₹₹">₹₹ (Moderate)</option>
                      <option value="₹₹₹">₹₹₹ (Premium)</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Address &amp; Location *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Sector Alpha Commercial, Greater Noida"
                      required
                      value={restForm.address}
                      onChange={e => setRestForm({ ...restForm, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input
                      className="form-input"
                      placeholder="+91 98765 43210"
                      required
                      value={restForm.phone}
                      onChange={e => setRestForm({ ...restForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Seating Capacity</label>
                    <input
                      type="number"
                      className="form-input"
                      min="10"
                      max="200"
                      value={restForm.capacity}
                      onChange={e => setRestForm({ ...restForm, capacity: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-ft">
                <button
                  type="button"
                  className="btn-action-cancel"
                  onClick={() => setShowAddRestModal(false)}
                  disabled={submittingRest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-action-admit"
                  disabled={submittingRest}
                >
                  {submittingRest ? 'Onboarding...' : 'Onboard & Seed Tables'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ONBOARD INSTITUTION ================= */}
      {showInstModal && (
        <div className="modal-overlay" onClick={() => setShowInstModal(false)}>
          <div className="modal-card anim-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-title font-display">Onboard Academic Institution</h3>
                <div className="modal-sub">Multi-tenant institutional configuration gate</div>
              </div>
              <button className="modal-close" onClick={() => setShowInstModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddInstitution}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">University / Institution Name *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. Ashoka University"
                    value={instForm.name}
                    onChange={e => setInstForm({ ...instForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Approved Email Domain *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. @ashoka.edu.in"
                    value={instForm.domain}
                    onChange={e => setInstForm({ ...instForm, domain: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Campus Location</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Sonipat, Haryana"
                    value={instForm.location}
                    onChange={e => setInstForm({ ...instForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" className="btn-action-cancel" onClick={() => setShowInstModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-action-admit" disabled={instSubmitting}>
                  <Globe size={14} /> {instSubmitting ? 'Registering...' : 'Enable Tenant Gate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
