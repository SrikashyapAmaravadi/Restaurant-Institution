import { useState, useEffect } from 'react';
import { useDining } from '../../context/DiningContext';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../../components/PaymentModal';
import CameraScannerModal from '../../components/CameraScannerModal';
import api from '../../services/api';
import {
  Search,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  Clock,
  QrCode,
  Users,
  Plus,
  X,
  Sparkles,
  Utensils,
  MapPin,
  Check,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight
} from 'lucide-react';

export default function StaffPortal() {
  const { user } = useAuth() || {};
  const {
    reservations,
    tables,
    staffCheckInGuest,
    staffAddOrderItem,
    staffCompletePayment,
    createReservation
  } = useDining();

  const [searchCode, setSearchCode] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING_CHECKIN' | 'SEATED' | 'COMPLETED'
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState(null);
  const [liveMenu, setLiveMenu] = useState([]);

  // Load real menu items for outlet
  useEffect(() => {
    const restaurantId = user?.restaurantId || 1;
    api.restaurants.getById(restaurantId)
      .then(res => {
        if (res?.success && res.data?.menuItems) {
          setLiveMenu(res.data.menuItems);
        }
      })
      .catch(err => console.warn('Could not load outlet menu in staff portal:', err));
  }, [user?.restaurantId]);

  // Walk-in modal
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    name: '',
    email: '',
    guests: 2,
    table: tables[0]?.id || 'T-01'
  });

  const popularAddOns = liveMenu.length > 0
    ? liveMenu.slice(0, 8).map(m => ({
        id: m.id,
        name: m.name,
        price: m.price,
        veg: m.isVeg !== undefined ? m.isVeg : true
      }))
    : [];

  const handleCheckIn = (bookingId, tableId) => {
    staffCheckInGuest(bookingId, tableId);
  };

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinForm.name || !walkinForm.email) return;

    try {
      const newBooking = await createReservation({
        guestName: walkinForm.name,
        guestEmail: walkinForm.email,
        guests: Number(walkinForm.guests),
        tableAssigned: walkinForm.table || tables[0]?.id || 'T-01',
        restaurantId: user?.restaurantId || 1,
        specialRequest: 'Walk-In Student Dining'
      });

      // Directly seat walk-in
      if (newBooking?.id) {
        await staffCheckInGuest(newBooking.id, walkinForm.table || tables[0]?.id || 'T-01');
      }
      setShowWalkinModal(false);
      setWalkinForm({ name: '', email: '', guests: 2, table: tables[0]?.id || 'T-01' });
    } catch (err) {
      alert('Could not seat walk-in guest: ' + err.message);
    }
  };

  const filtered = reservations.filter(item => {
    if (activeFilter === 'PENDING_CHECKIN' && item.status !== 'CONFIRMED') return false;
    if (activeFilter === 'SEATED' && item.status !== 'SEATED') return false;
    if (activeFilter === 'COMPLETED' && item.status !== 'COMPLETED') return false;

    if (!searchCode) return true;
    const q = searchCode.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      (item.guestName && item.guestName.toLowerCase().includes(q)) ||
      (item.tableAssigned && item.tableAssigned.toLowerCase().includes(q)) ||
      (item.guestEmail && item.guestEmail.toLowerCase().includes(q))
    );
  });

  const seatedCount = reservations.filter(q => q.status === 'SEATED').length;
  const pendingCount = reservations.filter(q => q.status === 'CONFIRMED').length;
  const completedCount = reservations.filter(q => q.status === 'COMPLETED').length;

  return (
    <div className="page-pad">
      {/* Front Desk Terminal Header */}
      <div className="anim-fade-up" style={{
        padding: '22px 26px',
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, #2F5E31 0%, #1E4624 60%, #0F2D1E 100%)',
        border: '1px solid rgba(111, 175, 61, 0.3)',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-info">Front Desk Host Terminal</span>
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>Live Service Queue &amp; Table Management</span>
          </div>
          <h2 className="font-display" style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff' }}>
            {user?.restaurantName || 'Campus Partner Venue'} · Floor &amp; Service Desk
          </h2>
          <div style={{ fontSize: 12.5, color: 'var(--t2)' }}>
            Service: Lunch &amp; Dinner Shifts · Bennett University Partner Operations
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Tables Occupied</div>
            <div className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8' }}>
              {tables.filter(t => t.occupied).length} / {tables.length}
            </div>
          </div>
          <button className="btn btn-primary btn-md" onClick={() => setShowWalkinModal(true)}>
            <Plus size={16} /> Seat Walk-In Student
          </button>
        </div>
      </div>

      {/* Floor Table Map Quick View */}
      <div className="anim-fade-up delay-1" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--t1)' }}>
              Interactive Floor Table Layout
            </h3>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>
              Click any seated table to add order items or trigger bill payment settlement.
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>
            {tables.filter(t => !t.occupied).length} tables free right now
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {tables.map(table => {
            const tableBooking = reservations.find(b => b.tableAssigned === table.id && b.status === 'SEATED');

            return (
              <div
                key={table.id}
                onClick={() => {
                  if (tableBooking) {
                    setSelectedTableForOrder(tableBooking);
                  }
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--r-sm)',
                  background: table.occupied
                    ? 'rgba(16, 185, 129, 0.14)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: table.occupied
                    ? '1.5px solid rgba(16, 185, 129, 0.45)'
                    : '1px solid var(--border)',
                  cursor: table.occupied ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'all 0.2s ease',
                  boxShadow: table.occupied ? '0 0 14px rgba(16, 185, 129, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: table.occupied ? '#10B981' : 'var(--t1)' }}>
                    {table.id}
                  </span>
                  <span style={{ fontSize: 10.5, color: 'var(--t4)', fontWeight: 600 }}>{table.cap}P</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{table.type}</div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: table.occupied ? '#34D399' : 'var(--t4)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  marginTop: 2
                }}>
                  {table.occupied ? `● ${table.guest || 'Seated'}` : 'Available'}
                </div>
                {table.occupied && (
                  <div style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>
                    Active Dining
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="anim-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <div className="tabs-scroll-x">
          <button
            className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flexShrink: 0 }}
            onClick={() => setActiveFilter('ALL')}
          >
            All Reservations ({reservations.length})
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'PENDING_CHECKIN' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flexShrink: 0 }}
            onClick={() => setActiveFilter('PENDING_CHECKIN')}
          >
            Awaiting Check-In ({pendingCount})
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'SEATED' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flexShrink: 0 }}
            onClick={() => setActiveFilter('SEATED')}
          >
            Seated Diners ({seatedCount})
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'COMPLETED' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flexShrink: 0 }}
            onClick={() => setActiveFilter('COMPLETED')}
          >
            Completed Sessions ({completedCount})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div className="form-input-wrap" style={{ flex: 1, minWidth: 260 }}>
            <Search size={16} className="form-input-icon text-sky-400" />
            <input
              className="form-input"
              style={{ padding: '13px 18px 13px 44px' }}
              placeholder="Search booking code (e.g. DB-4821), guest name, or table..."
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={() => setShowScannerModal(true)}
            title="Open camera to scan student digital pass"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <QrCode size={16} /> Scan Digital Pass
          </button>
        </div>
      </div>

      {/* Live Reservation & Dining Queue Cards */}
      <div className="anim-fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
            No reservations found matching the current search or filter.
          </div>
        ) : (
          filtered.map(item => {
            const isConfirmed = item.status === 'CONFIRMED';
            const isSeated = item.status === 'SEATED';
            const isCompleted = item.status === 'COMPLETED';

            const ordersTotal = (item.orders || []).reduce((sum, o) => sum + o.price * (o.qty || 1), 0);
            const discountAmt = Math.round(ordersTotal * 0.20);
            const gstAmt = Math.round((ordersTotal - discountAmt) * 0.05);
            const netPayable = ordersTotal - discountAmt + gstAmt;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 18,
                  borderLeft: isSeated
                    ? '4px solid #10B981'
                    : isCompleted
                    ? '4px solid #4F46E5'
                    : '4px solid var(--accent)'
                }}
              >
                {/* Left: Table badge & Guest info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--r-sm)',
                    background: isSeated
                      ? 'rgba(16, 185, 129, 0.15)'
                      : isCompleted
                      ? 'rgba(79, 70, 229, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14,
                    color: isSeated ? '#10B981' : isCompleted ? 'var(--primary-light)' : 'var(--accent)'
                  }}>
                    <span>{item.tableAssigned || 'T-04'}</span>
                    <span style={{ fontSize: 9.5, opacity: 0.8 }}>TABLE</span>
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>
                        {item.guestName || item.name || 'Priya Sharma'}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                        {item.id}
                      </span>
                      {isConfirmed && <span className="badge badge-warning">Awaiting Check-In</span>}
                      {isSeated && <span className="badge badge-success">● Currently Seated</span>}
                      {isCompleted && (
                        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check size={11} /> Completed &amp; Paid
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 12.5, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {item.time}</span>
                      <span>·</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {item.guests} Guests</span>
                      <span>·</span>
                      <span style={{ color: 'var(--primary)' }}>{item.guestEmail || 'Student'}</span>
                      <span>·</span>
                      <span>{item.specialRequest || 'Table Reservation'}</span>
                    </div>

                    {/* Order summary pill if items exist */}
                    {item.orders && item.orders.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Orders ({item.orders.length}):
                        </span>
                        {item.orders.slice(0, 3).map((o, i) => (
                          <span key={i} className="chip on" style={{ fontSize: 11, padding: '2px 8px' }}>
                            {o.qty}x {o.name}
                          </span>
                        ))}
                        {item.orders.length > 3 && (
                          <span style={{ fontSize: 11, color: 'var(--t4)' }}>+{item.orders.length - 3} more</span>
                        )}
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginLeft: 4 }}>
                          Est. Bill: ₹{netPayable}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Staff Action Buttons */}
                <div className="mobile-full-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {/* STAGE 1: Check in guest */}
                  {isConfirmed && (
                    <button
                      className="btn btn-primary btn-md"
                      onClick={() => handleCheckIn(item.id, item.tableAssigned)}
                    >
                      <UserCheck size={16} /> Check-In &amp; Seat Guest
                    </button>
                  )}

                  {/* STAGE 2: Seated -> Add items & Settle Bill */}
                  {isSeated && (
                    <>
                      <button
                        className="btn btn-outline btn-md"
                        onClick={() => setSelectedTableForOrder(item)}
                      >
                        <Utensils size={15} /> Add Dishes / View Tab
                      </button>

                      <button
                        className="btn btn-accent btn-md"
                        onClick={() => setPaymentModalBooking(item)}
                      >
                        <Receipt size={16} /> Settle Bill (₹{netPayable})
                      </button>
                    </>
                  )}

                  {/* STAGE 3: Completed -> View Receipt */}
                  {isCompleted && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: 12 }}>
                        Paid via {item.payment?.method || 'UPI'} (₹{item.payment?.amount || netPayable})
                      </span>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setPaymentModalBooking(item)}
                      >
                        <Receipt size={13} /> View Invoice
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD ORDER ITEMS TO TABLE */}
      {selectedTableForOrder && (
        <div className="modal-overlay" onClick={() => setSelectedTableForOrder(null)}>
          <div className="modal-card anim-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-hd">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-xs)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 800 }}>
                  {selectedTableForOrder.tableAssigned || 'T-04'}
                </div>
                <div>
                  <h3 className="modal-title font-display">Manage Table Order</h3>
                  <div className="modal-sub">{selectedTableForOrder.guestName} · Active Dining Session</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedTableForOrder(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Current Orders List */}
              <div>
                <label className="form-label">Current Table Tab</label>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(selectedTableForOrder.orders || []).map((o, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span>{o.qty}x {o.name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--t1)' }}>₹{o.price * o.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Add Popular Campus Dishes */}
              <div>
                <label className="form-label">Quick Add Popular Kitchen Items</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {popularAddOns.map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        staffAddOrderItem(selectedTableForOrder.id, item);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ justifyContent: 'space-between', padding: '8px 10px', fontSize: 11.5 }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>+ {item.name}</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{item.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-ft">
              <button className="btn btn-ghost btn-md" onClick={() => setSelectedTableForOrder(null)}>
                Close
              </button>
              <button
                className="btn btn-primary btn-md"
                onClick={() => {
                  const current = selectedTableForOrder;
                  setSelectedTableForOrder(null);
                  setPaymentModalBooking(current);
                }}
              >
                Proceed to Payment &amp; Settle Bill →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SEAT WALK-IN STUDENT */}
      {showWalkinModal && (
        <div className="modal-overlay" onClick={() => setShowWalkinModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-hd">
              <div>
                <h3 className="modal-title font-display">Seat Walk-In Student</h3>
                <div className="modal-sub">Direct table check-in for verified Bennett diner</div>
              </div>
              <button className="modal-close" onClick={() => setShowWalkinModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleWalkinSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Student Name</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. Diya Nair"
                    value={walkinForm.name}
                    onChange={e => setWalkinForm({ ...walkinForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Bennett Email (for verification)</label>
                  <input
                    className="form-input"
                    type="email"
                    required
                    placeholder="name@bennett.edu.in"
                    value={walkinForm.email}
                    onChange={e => setWalkinForm({ ...walkinForm, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Party Size</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      max="10"
                      value={walkinForm.guests}
                      onChange={e => setWalkinForm({ ...walkinForm, guests: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Select Table</label>
                    <select
                      className="form-input"
                      value={walkinForm.table}
                      onChange={e => setWalkinForm({ ...walkinForm, table: e.target.value })}
                    >
                      {tables.filter(t => !t.occupied).map(t => (
                        <option key={t.id} value={t.id}>{t.id} ({t.type} · {t.cap}P)</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowWalkinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  <Check size={14} /> Confirm &amp; Seat Diner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEATURE 4: PAYMENT MODAL WITH 3 OPTIONS (UPI, CASH, CARD) */}
      {paymentModalBooking && (
        <PaymentModal
          booking={paymentModalBooking}
          onClose={() => setPaymentModalBooking(null)}
          onPaymentComplete={(paymentResult) => {
            staffCompletePayment(paymentModalBooking.id, paymentResult);
          }}
        />
      )}

      {/* FEATURE 5: LIVE CAMERA DIGITAL PASS SCANNER MODAL */}
      <CameraScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        reservations={reservations}
        onScanSuccess={(code, matchedReservation) => {
          setSearchCode(code);
          if (matchedReservation && matchedReservation.status === 'CONFIRMED') {
            handleCheckIn(matchedReservation.id, matchedReservation.tableAssigned || 'T-01');
          }
        }}
      />
    </div>
  );
}
