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
  Shield
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
      {/* Header */}
      <div className="anim-fade-up" style={{
        padding: '24px 28px',
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, #2F5E31 0%, #1E4624 60%, #0F2D1E 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        marginBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--r-sm)', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Building2 size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-primary" style={{ background: 'rgba(111, 175, 61, 0.2)', color: '#6FAF3D', border: '1px solid rgba(111, 175, 61, 0.4)' }}>Super Admin Governance</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Institution: Bennett University</span>
            </div>
            <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              Platform Operations &amp; Verification Gate
            </h2>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>
              Governed by NIVIXPE PRIVATE LIMITED · PostgreSQL Database Live
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-primary btn-md"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              fontSize: '0.95rem'
            }}
            onClick={() => setShowAddRestModal(true)}
          >
            <Plus size={18} strokeWidth={2.5} /> Onboard New Restaurant
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div className="tabs-scroll-x" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16, width: '100%' }}>
          <button
            className={`btn btn-sm ${activeTab === 'Restaurants' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Restaurants' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Restaurants' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Restaurants' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Restaurants')}
          >
            <Store size={14} /> Partner Restaurants ({restaurantsList.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Users' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Users' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Users' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Users' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Users')}
          >
            <Users size={14} /> User Directory ({usersList.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Verifications' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Verifications' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Verifications' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Verifications' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Verifications')}
          >
            <ShieldCheck size={14} /> Passkey Gate ({verifications.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Institutions' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Institutions' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Institutions' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Institutions' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Institutions')}
          >
            <Globe size={14} /> Institutions ({institutions.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Bookings' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Bookings' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Bookings' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Bookings' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Bookings')}
          >
            <CalendarCheck size={14} /> Bookings ({reservations.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Analytics' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Analytics' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Analytics' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Analytics' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Analytics')}
          >
            <BarChart3 size={14} /> Platform Analytics
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Moderation' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Moderation' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Moderation' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Moderation' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Moderation')}
          >
            <ShieldAlert size={14} /> Reviews Moderation
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Audit' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              color: activeTab === 'Audit' ? '#FFFFFF' : '#000000',
              backgroundColor: activeTab === 'Audit' ? undefined : '#FFFFFF',
              borderColor: activeTab === 'Audit' ? 'rgba(255,255,255,0.3)' : '#C8DEC3',
              fontWeight: 700,
              flexShrink: 0
            }}
            onClick={() => setActiveTab('Audit')}
          >
            <Activity size={14} /> Audit Log
          </button>
        </div>
      </div>

      {/* Quick KPI Overview */}
      <div className="grid-responsive-kpi anim-fade-up delay-1">
        <div className="card" style={{ padding: 18, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Partner Restaurants</div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
            {restaurantsList.length} Active
          </div>
          <div style={{ fontSize: 11.5, color: '#10B981' }}>Live in PostgreSQL DB</div>
        </div>

        <div className="card" style={{ padding: 18, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Active Table Bookings</div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', margin: '4px 0' }}>
            {reservations.length}
          </div>
          <div style={{ fontSize: 11.5, color: '#10B981' }}>Real-time reservations</div>
        </div>

        <div className="card" style={{ padding: 18, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Awaiting Clearance</div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444', margin: '4px 0' }}>
            {verifications.length}
          </div>
          <div style={{ fontSize: 11.5, color: '#EF4444' }}>Pending passkey generation</div>
        </div>

        <div className="card" style={{ padding: 18, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase' }}>Platform Institutions</div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', margin: '4px 0' }}>
            {institutions.length}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--primary)' }}>Multi-tenant campus gates</div>
        </div>
      </div>

      {/* ================= TAB 1: RESTAURANTS ================= */}
      {activeTab === 'Restaurants' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Institutional Partner Establishments
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Authorized dining outlets for Bennett University students and faculty members.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddRestModal(true)}>
              <Plus size={14} /> Add Partner Restaurant
            </button>
          </div>

          {restSuccessMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--r-xs)', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', marginBottom: 16, fontSize: 13 }}>
              {restSuccessMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
            {restaurantsList.map(r => (
              <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <img src={r.image} alt={r.name} style={{ width: 80, height: 80, borderRadius: 'var(--r-xs)', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>{r.name}</div>
                    <span className={`badge ${r.isOpen ? 'badge-success' : 'badge-neutral'}`}>
                      {r.isOpen ? 'Open' : 'Suspended'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', margin: '3px 0' }}>{r.cuisine} · {r.price} · {r.hours}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--t4)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{r.address}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      className="btn btn-ghost btn-xs"
                      style={{ fontSize: 11 }}
                      onClick={() => handleToggleStatus(r.id, r.isOpen)}
                    >
                      {r.isOpen ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-ghost btn-xs"
                      style={{ fontSize: 11, color: '#EF4444' }}
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
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Platform User Directory &amp; RBAC Roles
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Manage institutional users, promote roles, assign staff to restaurants, and control verification status.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchUsers}>
              <RefreshCw size={14} className={loadingUsers ? 'spin' : ''} /> Refresh Users
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--t4)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36, height: 38 }}
                placeholder="Search user by name, email, roll number..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--t4)', fontWeight: 600 }}>Role:</span>
              <select
                className="form-input"
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
              <span style={{ fontSize: 12, color: 'var(--t4)', fontWeight: 600 }}>Status:</span>
              <select
                className="form-input"
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--t4)', textTransform: 'uppercase', fontSize: 11 }}>
                  <th style={{ padding: '12px 14px' }}>User Details</th>
                  <th style={{ padding: '12px 14px' }}>Role</th>
                  <th style={{ padding: '12px 14px' }}>Campus Info</th>
                  <th style={{ padding: '12px 14px' }}>Verification</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>
                      Loading platform users from PostgreSQL...
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>
                      No users match the selected filters.
                    </td>
                  </tr>
                ) : (
                  usersList.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${
                          u.role === 'SUPER_ADMIN' ? 'badge-primary' :
                          u.role === 'RESTAURANT_ADMIN' ? 'badge-warning' :
                          u.role === 'RESTAURANT_STAFF' ? 'badge-info' : 'badge-neutral'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--t3)' }}>
                        <div>{u.department || 'Student Body'}</div>
                        {u.rollNumber && <div style={{ fontSize: 11, color: 'var(--t4)' }}>Roll: {u.rollNumber}</div>}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button
                          onClick={() => handleToggleUserVerify(u.id, u.verified)}
                          className={`btn btn-xs ${u.verified ? 'btn-success' : 'btn-outline'}`}
                          style={{ fontSize: 11 }}
                        >
                          {u.verified ? (
                            <><CheckCircle2 size={12} /> Verified</>
                          ) : (
                            <><UserX size={12} /> Unverified</>
                          )}
                        </button>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                          <select
                            style={{ fontSize: 11, padding: '4px 6px', borderRadius: 'var(--r-xs)', border: '1px solid var(--border)', background: '#FFFFFF' }}
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
                              className="btn btn-ghost btn-xs"
                              style={{ color: '#EF4444' }}
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

      {/* ================= TAB 3: CLEARANCE QUEUE ================= */}
      {activeTab === 'Clearance' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Institutional Onboarding Clearance Queue
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Issue 6-digit verification passkeys to institutional users awaiting activation.
              </p>
            </div>
            <span className="badge badge-warning">{verifications.length} Pending</span>
          </div>

          {lastSentInfo && (
            <div style={{
              background: '#ECFDF5',
              border: '1.5px solid #10B981',
              borderRadius: 'var(--r-sm)',
              padding: '14px 18px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <KeyRound size={20} color="#059669" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
                    Passkey <strong style={{ color: '#1E3A8A', fontSize: 16 }}>{lastSentInfo.code}</strong> issued to {lastSentInfo.name}!
                  </div>
                  <div style={{ fontSize: 12, color: '#047857' }}>
                    Sent to: {lastSentInfo.email}
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => setLastSentInfo(null)}>
                <X size={14} /> Close
              </button>
            </div>
          )}

          {verifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>
              All user registrations have been verified and cleared!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {verifications.map(v => (
                <div key={v.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>{v.email} · Role: {v.role}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSendVerificationCode(v)}>
                      <Send size={13} /> Send Passkey
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: INSTITUTIONS ================= */}
      {activeTab === 'Institutions' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Institutional Tenant Governance &amp; Email Domains
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Manage participating universities and approved institutional email domain gates.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowInstModal(true)}>
              <Plus size={14} /> Onboard New Institution
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {institutions.map(inst => (
              <div
                key={inst.id}
                style={{
                  padding: 18,
                  borderRadius: 'var(--r-sm)',
                  background: '#FFFFFF',
                  border: inst.isPrimary ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--t1)' }}>{inst.name}</span>
                      {inst.isPrimary && <span className="badge badge-primary">Primary Tenant</span>}
                      <span className={`badge ${inst.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{inst.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>
                      Allowed Domain Gate: {inst.domain} · {inst.location}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase' }}>Verified Members</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{inst.activeUsers?.toLocaleString() || 0}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase' }}>Partners</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{inst.partnerRestaurants || 0} Restaurants</div>
                  </div>
                  {!inst.isPrimary && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#EF4444' }}
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

      {/* ================= TAB 5: PLATFORM ANALYTICS ================= */}
      {activeTab === 'Analytics' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Platform Operational Analytics &amp; KPIs
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Aggregated metrics across institutions, partner dining outlets, active table bookings, and audit records.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchPlatformStats}>
              <RefreshCw size={14} className={loadingStats ? 'spin' : ''} /> Refresh Analytics
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered Users</div>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                {platformStats?.totalUsers ?? '...'}
              </div>
            </div>

            <div style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Dining Outlets</div>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--t1)', marginTop: 4 }}>
                {platformStats?.totalRestaurants ?? '...'}
              </div>
            </div>

            <div style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Total Bookings</div>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginTop: 4 }}>
                {platformStats?.totalBookings ?? '...'}
              </div>
            </div>

            <div style={{ padding: 18, borderRadius: 'var(--r-sm)', background: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Audit Events Logged</div>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
                {platformStats?.auditEventsCount ?? '...'}
              </div>
            </div>
          </div>

          {/* Recent Bookings Activity */}
          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>Recent Table Reservations</h4>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--t4)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Booking ID</th>
                    <th style={{ padding: '8px 12px' }}>Guest Name</th>
                    <th style={{ padding: '8px 12px' }}>Date / Time</th>
                    <th style={{ padding: '8px 12px' }}>Party Size</th>
                    <th style={{ padding: '8px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {platformStats?.recentBookings?.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{b.id}</td>
                      <td style={{ padding: '10px 12px' }}>{b.guestName}</td>
                      <td style={{ padding: '10px 12px' }}>{b.date} · {b.time}</td>
                      <td style={{ padding: '10px 12px' }}>{b.guests} Guests</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge badge-success">{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: REVIEWS MODERATION ================= */}
      {activeTab === 'Moderation' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                Campus Dining Reviews Moderation Gate
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Super Admin authority to hide or approve feedback according to institutional community standards.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchModerationReviews}>
              <RefreshCw size={14} className={loadingModeration ? 'spin' : ''} /> Refresh Reviews
            </button>
          </div>

          {moderationReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
              <ShieldAlert size={36} style={{ margin: '0 auto 12px', color: 'var(--t4)' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>No Reviews Available</div>
              <div style={{ fontSize: 12 }}>There are currently no reviews submitted across partner restaurants.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {moderationReviews.map(rev => (
                <div
                  key={rev.id}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--r-sm)',
                    background: rev.flagged ? '#FEF2F2' : '#F8FAFC',
                    border: rev.flagged ? '1px solid #FCA5A5' : '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{rev.restaurant}</span>
                      <span style={{ fontSize: 11, color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
                        <Star size={12} fill="#F59E0B" /> {rev.rating}/5
                      </span>
                      <span className={`badge ${rev.status === 'APPROVED' ? 'badge-success' : 'badge-error'}`}>
                        {rev.status}
                      </span>
                      {rev.flagged && (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> Hidden/Flagged
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t4)', marginBottom: 6 }}>
                      By {rev.author} · {rev.date}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--t2)', fontStyle: 'italic' }}>
                      "{rev.text}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={`btn btn-sm ${rev.status === 'APPROVED' ? 'btn-danger' : 'btn-primary'}`}
                      style={{ fontSize: 11 }}
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

      {/* ================= TAB 7: PLATFORM AUDIT LOG ================= */}
      {activeTab === 'Audit' && (
        <div className="card anim-fade-up delay-2" style={{ padding: 24, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--t1)' }}>
                System-Wide Audit Trail &amp; Compliance Log
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                Immutable records of administrative operations, role assignments, security actions, and dining changes.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchAuditLogs}>
              <RefreshCw size={14} className={loadingAudit ? 'spin' : ''} /> Refresh Logs
            </button>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--t4)', textTransform: 'uppercase', fontSize: 11, textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Actor</th>
                  <th style={{ padding: '10px 12px' }}>Action</th>
                  <th style={{ padding: '10px 12px' }}>Target Entity</th>
                  <th style={{ padding: '10px 12px' }}>Details / Metadata</th>
                  <th style={{ padding: '10px 12px' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loadingAudit ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>
                      Loading audit records...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>
                      No audit log entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--t3)', fontSize: 11.5 }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{log.userName || 'System Service'}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{log.userRole || 'ANONYMOUS'}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge badge-info" style={{ fontSize: 11 }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--t2)' }}>
                        {log.entityType} {log.entityId && <span style={{ fontSize: 10.5, color: 'var(--t4)' }}>({log.entityId.slice(0, 8)}...)</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--t3)', maxWidth: 260, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {log.detailsJson || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--t4)' }}>
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
          <div className="modal-card anim-scale-in" style={{ maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-title font-display">Onboard Partner Restaurant</h3>
                <p className="modal-sub">Add a verified dining partner to Bennett University dining network</p>
              </div>
              <button className="modal-close" onClick={() => setShowAddRestModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    className="form-input"
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
                    className="form-input"
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

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  onClick={() => setShowAddRestModal(false)}
                  disabled={submittingRest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
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
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
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
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowInstModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" disabled={instSubmitting}>
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
