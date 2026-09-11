import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import {
  QrCode,
  Banknote,
  CreditCard,
  CheckCircle2,
  X,
  Sparkles,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Printer,
  Smartphone,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  UserCheck,
  FileText,
  Search,
  Building2,
  FileCheck,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';

export default function PaymentModal({
  booking,
  onClose,
  onPaymentComplete,
  initialBilledBy,
  menuItems: propMenuItems,
  onOrdersUpdated
}) {
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CASH' | 'CARD'
  const [step, setStep] = useState('SELECT'); // 'SELECT' | 'PROCESSING' | 'SUCCESS'
  const [activeView, setActiveView] = useState('SETTLEMENT'); // 'SETTLEMENT' | 'OFFICIAL_BILL'
  const [activePaymentQr, setActivePaymentQr] = useState(null);

  // --- BILLING AUTHORITY: STAFF OR OWNER ---
  const [billedRole, setBilledRole] = useState(() => initialBilledBy?.role || 'STAFF');
  const [billedByName, setBilledByName] = useState(() => {
    if (initialBilledBy?.name) return initialBilledBy.name;
    return initialBilledBy?.role === 'OWNER'
      ? 'Vikram Singhania (Restaurant Owner)'
      : 'Rajesh Kumar (Front Desk Staff)';
  });
  const [billNotes, setBillNotes] = useState('');

  // --- LIVE ORDER ITEMS STATE (EDITABLE & EXPANDABLE) ---
  const [currentOrders, setCurrentOrders] = useState(() => {
    if (booking?.orders && Array.isArray(booking.orders) && booking.orders.length > 0) {
      return booking.orders.map((o, idx) => ({
        id: o.id || `ord-${idx}-${Date.now()}`,
        name: o.name,
        price: Number(o.price || 0),
        qty: Number(o.qty || o.quantity || 1)
      }));
    }
    return [
      {
        id: 'item-cover',
        name: `Dine-In Cover & Table Reservation (${booking?.guests || 2} Diners)`,
        price: 150 * (booking?.guests || 2),
        qty: 1
      }
    ];
  });

  // --- DISH ADDITION DRAWER & CATALOG ---
  const [showAddDishPanel, setShowAddDishPanel] = useState(false);
  const [dishSearch, setDishSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [catalogItems, setCatalogItems] = useState(propMenuItems || []);
  const [customDish, setCustomDish] = useState({ name: '', price: '', qty: 1 });

  // Fallback default catalog if none supplied
  const defaultCampusMenu = useMemo(() => [
    { id: 'cat-1', name: 'Dal Makhani Bukhara', price: 270, category: 'Main Course' },
    { id: 'cat-2', name: 'Butter Chicken Masala', price: 340, category: 'Main Course' },
    { id: 'cat-3', name: 'Paneer Tikka Angara', price: 280, category: 'Starters' },
    { id: 'cat-4', name: 'Garlic Butter Naan', price: 75, category: 'Breads' },
    { id: 'cat-5', name: 'Tandoori Roti', price: 35, category: 'Breads' },
    { id: 'cat-6', name: 'Awadhi Dum Biryani', price: 360, category: 'Main Course' },
    { id: 'cat-7', name: 'Fresh Mint Lime Soda', price: 90, category: 'Beverages' },
    { id: 'cat-8', name: 'Cold Coffee with Ice Cream', price: 120, category: 'Beverages' },
    { id: 'cat-9', name: 'Gulab Jamun (2 pcs)', price: 90, category: 'Desserts' },
    { id: 'cat-10', name: 'Crispy Veg Spring Rolls', price: 210, category: 'Starters' },
    { id: 'cat-11', name: 'Jeera Rice Bowl', price: 160, category: 'Main Course' },
    { id: 'cat-12', name: 'Masala Chaas', price: 60, category: 'Beverages' }
  ], []);

  // Load menu items if not passed via props
  useEffect(() => {
    if (propMenuItems && propMenuItems.length > 0) {
      setCatalogItems(propMenuItems);
      return;
    }
    const fetchMenu = async () => {
      try {
        const res = await api.restaurants.getById(booking?.restaurantId || 1);
        if (res?.data?.menuItems && res.data.menuItems.length > 0) {
          setCatalogItems(res.data.menuItems);
        } else {
          setCatalogItems(defaultCampusMenu);
        }
      } catch {
        setCatalogItems(defaultCampusMenu);
      }
    };
    fetchMenu();
  }, [booking?.restaurantId, propMenuItems, defaultCampusMenu]);

  // Fetch active uploaded QR for restaurant
  useEffect(() => {
    const fetchActiveQr = async () => {
      const restId = booking?.restaurantId || 1;
      try {
        const res = await api.paymentQrs.getByRestaurant(restId);
        if (res?.success && Array.isArray(res.data)) {
          const active = res.data.find(q => q.isActive) || res.data[0];
          if (active) setActivePaymentQr(active);
        }
      } catch (err) {
        console.warn('Could not fetch active payment QR for checkout:', err);
      }
    };
    fetchActiveQr();
  }, [booking?.restaurantId]);

  // --- REAL-TIME BILL CALCULATIONS ---
  const subtotal = currentOrders.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const bennettDiscount = Math.round(subtotal * 0.20); // 20% institutional discount
  const gst = Math.round((subtotal - bennettDiscount) * 0.05); // 5% restaurant GST
  const grandTotal = Math.max(0, subtotal - bennettDiscount + gst);

  // --- UPI STATE ---
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiTimer, setUpiTimer] = useState(120);

  // --- CASH STATE ---
  const [cashTendered, setCashTendered] = useState(grandTotal);
  useEffect(() => {
    setCashTendered(grandTotal);
  }, [grandTotal]);
  const changeToReturn = Math.max(0, cashTendered - grandTotal);

  // --- CARD STATE ---
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(booking?.guestName || 'Campus Diner');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardType, setCardType] = useState('Card');

  // Success summary
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (cardNumber.startsWith('4')) setCardType('Visa');
    else if (cardNumber.startsWith('5')) setCardType('Mastercard');
    else if (cardNumber.startsWith('6')) setCardType('RuPay');
    else setCardType('Card');
  }, [cardNumber]);

  // UPI countdown timer
  useEffect(() => {
    let interval = null;
    if (method === 'UPI' && step === 'SELECT' && upiTimer > 0) {
      interval = setInterval(() => setUpiTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [method, step, upiTimer]);

  // Handle order quantity changes
  const handleUpdateQty = (index, delta) => {
    const updated = [...currentOrders];
    const newQty = (updated[index].qty || 1) + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index] = { ...updated[index], qty: newQty };
    }
    setCurrentOrders(updated);
    if (onOrdersUpdated) onOrdersUpdated(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = currentOrders.filter((_, i) => i !== index);
    setCurrentOrders(updated);
    if (onOrdersUpdated) onOrdersUpdated(updated);
  };

  const handleAddDish = (dish) => {
    const existingIndex = currentOrders.findIndex(
      o => o.name.toLowerCase() === dish.name.toLowerCase()
    );
    let updated;
    if (existingIndex >= 0) {
      updated = [...currentOrders];
      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: (updated[existingIndex].qty || 1) + 1
      };
    } else {
      updated = [
        ...currentOrders,
        {
          id: `dish-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: dish.name,
          price: Number(dish.price),
          qty: 1
        }
      ];
    }
    setCurrentOrders(updated);
    if (onOrdersUpdated) onOrdersUpdated(updated);
  };

  const handleAddCustomDish = (e) => {
    e.preventDefault();
    if (!customDish.name.trim() || !customDish.price) return;
    const newDish = {
      id: `custom-${Date.now()}`,
      name: customDish.name.trim(),
      price: Number(customDish.price),
      qty: Number(customDish.qty) || 1
    };
    const updated = [...currentOrders, newDish];
    setCurrentOrders(updated);
    if (onOrdersUpdated) onOrdersUpdated(updated);
    setCustomDish({ name: '', price: '', qty: 1 });
  };

  const handleRoleChange = (newRole) => {
    setBilledRole(newRole);
    if (newRole === 'OWNER' && (billedByName.includes('Staff') || !billedByName)) {
      setBilledByName('Vikram Singhania (Restaurant Owner)');
    } else if (newRole === 'STAFF' && (billedByName.includes('Owner') || !billedByName)) {
      setBilledByName('Rajesh Kumar (Front Desk Staff)');
    }
  };

  // Filter menu catalog items
  const filteredCatalog = useMemo(() => {
    return catalogItems.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = !dishSearch || item.name.toLowerCase().includes(dishSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [catalogItems, selectedCategory, dishSearch]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    catalogItems.forEach(i => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [catalogItems]);

  const handleProcessPayment = () => {
    setStep('PROCESSING');

    setTimeout(() => {
      const txnId = `TXN-${method}-${Math.floor(100000 + Math.random() * 900000)}`;
      const result = {
        method,
        transactionId: txnId,
        subtotal,
        discount: bennettDiscount,
        tax: gst,
        totalAmount: grandTotal,
        billedBy: {
          role: billedRole,
          name: billedByName
        },
        notes: billNotes,
        orders: currentOrders,
        details: method === 'CASH'
          ? { tendered: cashTendered, change: changeToReturn, billedBy: { role: billedRole, name: billedByName } }
          : method === 'UPI'
          ? {
              upiApp: selectedUpiApp,
              upiId: customUpiId || `${selectedUpiApp.toLowerCase().replace(' ', '')}@okaxis`,
              billedBy: { role: billedRole, name: billedByName }
            }
          : { cardType, last4: cardNumber.replace(/\s+/g, '').slice(-4), billedBy: { role: billedRole, name: billedByName } },
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setPaymentResult(result);
      setStep('SUCCESS');

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }

      if (onPaymentComplete) {
        onPaymentComplete(result);
      }
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-2026-${(booking?.id || '8420').replace(/[^0-9]/g, '').padEnd(4, '0').slice(-4)}`;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-card anim-scale-in"
        style={{
          maxWidth: 680,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div className="modal-hd" style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--r-sm)',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                border: '1px solid var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}
            >
              {activeView === 'OFFICIAL_BILL' ? <FileText size={22} /> : <Receipt size={22} />}
            </div>
            <div>
              <div className="modal-title font-display" style={{ fontSize: '1.25rem' }}>
                {step === 'SUCCESS'
                  ? 'Payment Completed & Bill Settled'
                  : activeView === 'OFFICIAL_BILL'
                  ? 'Official Institutional Tax Invoice'
                  : 'Bill Settlement & Tab Management'}
              </div>
              <div className="modal-sub">
                {booking?.restaurantName || 'The Spice Garden'} · Table {booking?.tableAssigned || 'T-01'} · {booking?.guestName || 'Campus Diner'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step === 'SELECT' && (
              <button
                type="button"
                className={`btn btn-xs ${activeView === 'OFFICIAL_BILL' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}
                onClick={() => setActiveView(v => (v === 'OFFICIAL_BILL' ? 'SETTLEMENT' : 'OFFICIAL_BILL'))}
              >
                {activeView === 'OFFICIAL_BILL' ? (
                  <>
                    <CreditCard size={13} /> Settle Payment
                  </>
                ) : (
                  <>
                    <FileText size={13} /> View Official Bill
                  </>
                )}
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          className="modal-body"
          style={{
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}
        >
          {/* STEP 1: SELECT / EDIT ORDER & SETTLE */}
          {step === 'SELECT' && activeView === 'SETTLEMENT' && (
            <>
              {/* SECTION 1: BILL GENERATED BY (STAFF / OWNER ATTRIBUTION) */}
              <div
                style={{
                  background: 'rgba(30, 58, 138, 0.04)',
                  border: '1.5px solid rgba(30, 58, 138, 0.15)',
                  borderRadius: 'var(--r-sm)',
                  padding: '12px 16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={14} /> Bill Generating Authority
                  </span>
                  <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', padding: 2 }}>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('STAFF')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--r-xs)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: billedRole === 'STAFF' ? 'var(--primary)' : 'transparent',
                        color: billedRole === 'STAFF' ? '#FFFFFF' : 'var(--t2)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      👨‍🍳 Staff Member
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('OWNER')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--r-xs)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: billedRole === 'OWNER' ? 'var(--accent)' : 'transparent',
                        color: billedRole === 'OWNER' ? '#000000' : 'var(--t2)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      👔 Restaurant Owner
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 10.5, marginBottom: 3 }}>
                      Billed &amp; Certified By
                    </label>
                    <input
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                      placeholder="e.g. Vikram Singhania (Owner)"
                      value={billedByName}
                      onChange={e => setBilledByName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 10.5, marginBottom: 3 }}>
                      Bill / Table Note (Optional)
                    </label>
                    <input
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                      placeholder="e.g. Table VIP Session"
                      value={billNotes}
                      onChange={e => setBillNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ITEMIZED ORDER SUMMARY + LIVE DISH ADDITION */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  padding: '16px 18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Current Bill Items ({currentOrders.length})
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 8 }}>
                      (Adjust quantities or add dishes)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="badge badge-primary" style={{ fontSize: 10.5 }}>
                      Bennett 20% Applied
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={() => setShowAddDishPanel(s => !s)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontWeight: 700,
                        backgroundColor: showAddDishPanel ? 'var(--primary)' : '#FFFFFF',
                        color: showAddDishPanel ? '#FFFFFF' : 'var(--primary)',
                        borderColor: 'var(--primary)'
                      }}
                    >
                      <Plus size={13} /> {showAddDishPanel ? 'Hide Menu Drawer' : 'Add Order / Dish'}
                    </button>
                  </div>
                </div>

                {/* Bill Line Items Table / List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {currentOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--t4)', fontSize: 12.5 }}>
                      No items currently in bill. Click &quot;Add Order / Dish&quot; below to add menu items.
                    </div>
                  ) : (
                    currentOrders.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 13,
                          color: 'var(--t2)',
                          padding: '6px 8px',
                          background: '#FFFFFF',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--r-xs)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                          <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{item.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--t4)' }}>@ ₹{item.price}</span>
                        </div>

                        {/* Quantity Controls & Line Total */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F1F5F9', borderRadius: 4, padding: '2px 4px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, -1)}
                              style={{
                                width: 20,
                                height: 20,
                                border: 'none',
                                background: '#FFFFFF',
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--t2)'
                              }}
                              title="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 800, fontSize: 12 }}>
                              {item.qty || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, 1)}
                              style={{
                                width: 20,
                                height: 20,
                                border: 'none',
                                background: '#FFFFFF',
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--t2)'
                              }}
                              title="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <span style={{ fontWeight: 700, color: 'var(--t1)', minWidth: 60, textAlign: 'right' }}>
                            ₹{item.price * (item.qty || 1)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              padding: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* EXPANDABLE DRAWER: ADD DISHES FROM MENU OR CUSTOM DISH */}
                {showAddDishPanel && (
                  <div
                    className="anim-fade-up"
                    style={{
                      marginTop: 12,
                      padding: 14,
                      background: '#FFFFFF',
                      border: '1.5px dashed var(--primary-light)',
                      borderRadius: 'var(--r-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ChefHat size={15} /> Select Kitchen Dishes to Add to Bill
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ position: 'relative', width: 160 }}>
                          <Search size={12} style={{ position: 'absolute', left: 8, top: 8, color: 'var(--t4)' }} />
                          <input
                            className="form-input"
                            style={{ padding: '4px 8px 4px 26px', fontSize: 11 }}
                            placeholder="Search dishes..."
                            value={dishSearch}
                            onChange={e => setDishSearch(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category filter pills */}
                    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--r-xs)',
                            fontSize: 10.5,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            border: `1px solid ${selectedCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                            background: selectedCategory === cat ? 'var(--primary)' : '#F8FAFC',
                            color: selectedCategory === cat ? '#FFFFFF' : 'var(--t2)',
                            cursor: 'pointer'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Dish Quick-Add Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: 8,
                        maxHeight: 160,
                        overflowY: 'auto'
                      }}
                    >
                      {filteredCatalog.map(dish => (
                        <div
                          key={dish.id || dish.name}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 'var(--r-xs)',
                            background: '#F8FAFC',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 11.5
                          }}
                        >
                          <div style={{ overflow: 'hidden', paddingRight: 6 }}>
                            <div style={{ fontWeight: 700, color: 'var(--t1)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {dish.name}
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 800 }}>
                              ₹{dish.price}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddDish(dish)}
                            className="btn btn-xs btn-primary"
                            style={{ padding: '3px 8px', fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Custom Dish (Off-Menu Item) */}
                    <form
                      onSubmit={handleAddCustomDish}
                      style={{
                        borderTop: '1px dashed var(--border)',
                        paddingTop: 10,
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr auto',
                        gap: 6,
                        alignItems: 'center'
                      }}
                    >
                      <input
                        className="form-input"
                        style={{ padding: '6px 8px', fontSize: 11 }}
                        placeholder="Custom off-menu dish / item"
                        value={customDish.name}
                        onChange={e => setCustomDish({ ...customDish, name: e.target.value })}
                      />
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        style={{ padding: '6px 8px', fontSize: 11 }}
                        placeholder="Price ₹"
                        value={customDish.price}
                        onChange={e => setCustomDish({ ...customDish, price: e.target.value })}
                      />
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        style={{ padding: '6px 8px', fontSize: 11 }}
                        placeholder="Qty"
                        value={customDish.qty}
                        onChange={e => setCustomDish({ ...customDish, qty: Number(e.target.value) })}
                      />
                      <button
                        type="submit"
                        className="btn btn-xs btn-outline"
                        style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
                      >
                        + Add Custom
                      </button>
                    </form>
                  </div>
                )}

                {/* Subtotals and Totals */}
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t3)' }}>
                    <span>Subtotal ({currentOrders.reduce((sum, o) => sum + (o.qty || 1), 0)} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 600 }}>
                    <span>Bennett Student Privilege (20%)</span>
                    <span>-₹{bennettDiscount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t3)' }}>
                    <span>Restaurant GST (5% - 2.5% CGST + 2.5% SGST)</span>
                    <span>+₹{gst}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: 10,
                      marginTop: 4
                    }}
                  >
                    <div>
                      <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--t1)' }}>
                        Net Amount Due
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                        Billed by: <strong>{billedRole === 'OWNER' ? 'Owner' : 'Staff'}</strong> ({billedByName})
                      </div>
                    </div>
                    <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTON TO PREVIEW / GENERATE OFFICIAL TAX BILL */}
                <div style={{ marginTop: 12, borderTop: '1px dashed var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveView('OFFICIAL_BILL')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--primary)',
                      borderColor: 'var(--primary)'
                    }}
                  >
                    <FileText size={14} /> Generate &amp; Preview Official Bill →
                  </button>
                </div>
              </div>

              {/* SECTION 3: THREE PAYMENT OPTIONS TABS */}
              <div>
                <label className="form-label" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Select Payment Method</span>
                  <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 400 }}>(Choose 1 of 3 options to settle bill)</span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
                    { id: 'CASH', label: 'Cash', icon: Banknote, desc: 'Counter / Tendered' },
                    { id: 'CARD', label: 'Card / POS', icon: CreditCard, desc: 'Visa, Master, RuPay' }
                  ].map(opt => {
                    const Icon = opt.icon;
                    const isActive = method === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`payment-card-pill ${isActive ? 'active' : ''}`}
                        onClick={() => setMethod(opt.id)}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 'var(--r-sm)',
                          background: isActive ? '#EFF6FF' : '#F8FAFC',
                          border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                          color: isActive ? 'var(--primary)' : 'var(--t2)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: isActive ? '0 2px 8px rgba(30, 58, 138, 0.1)' : 'none'
                        }}
                      >
                        <div
                          className="payment-card-icon"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: isActive ? 'var(--primary)' : '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? '#FFFFFF' : 'var(--t2)'
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{opt.label}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PAYMENT OPTION 1: UPI */}
              {method === 'UPI' && (
                <div
                  className="anim-fade-up"
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Smartphone size={18} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>Scan Dynamic UPI QR Code</span>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                    {/* QR Code Graphic */}
                    <div
                      style={{
                        background: '#fff',
                        padding: 10,
                        borderRadius: 'var(--r-xs)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: 'var(--shadow-md)',
                        minWidth: 150
                      }}
                    >
                      {activePaymentQr?.image ? (
                        <img
                          src={activePaymentQr.image}
                          alt={activePaymentQr.label || 'UPI Payment QR'}
                          style={{ width: 130, height: 130, objectFit: 'contain', display: 'block' }}
                        />
                      ) : (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=${activePaymentQr?.upiId || 'dinebennett@okhdfcbank'}&pn=${encodeURIComponent(booking?.restaurantName || 'Campus Dining')}&am=${grandTotal}&cu=INR`)}`}
                          alt="UPI Payment QR"
                          style={{ width: 130, height: 130, display: 'block' }}
                        />
                      )}
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: '#000', marginTop: 4, letterSpacing: '0.05em' }}>
                        {activePaymentQr?.label ? activePaymentQr.label.toUpperCase() : 'BHIM UPI · VERIFIED'}
                      </span>
                      {activePaymentQr?.upiId && (
                        <span style={{ fontSize: 9, color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                          {activePaymentQr.upiId}
                        </span>
                      )}
                    </div>

                    {/* UPI App Options & VPA */}
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                        Scan using any UPI App on diner phone or enter UPI ID:
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setSelectedUpiApp(app)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: 'var(--r-xs)',
                              fontSize: 11,
                              fontWeight: 700,
                              background: selectedUpiApp === app ? 'var(--primary)' : '#FFFFFF',
                              border: `1px solid ${selectedUpiApp === app ? 'var(--primary)' : 'var(--border)'}`,
                              color: selectedUpiApp === app ? '#FFFFFF' : 'var(--t2)',
                              cursor: 'pointer'
                            }}
                          >
                            {app}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Or Enter Diner UPI ID</label>
                        <input
                          className="form-input"
                          style={{ padding: '7px 10px', fontSize: 12 }}
                          placeholder="e.g. 9876543210@paytm or student@okhdfcbank"
                          value={customUpiId}
                          onChange={e => setCustomUpiId(e.target.value)}
                        />
                      </div>

                      <div style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={14} /> Instant NPCI clearance · Institutional 20% discount applied
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT OPTION 2: CASH */}
              {method === 'CASH' && (
                <div
                  className="anim-fade-up"
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Banknote size={18} style={{ color: '#10B981' }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>Cash Payment &amp; Counter Settlement</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label className="form-label">Cash Tendered by Diner (₹)</label>
                      <input
                        className="form-input"
                        type="number"
                        min={grandTotal}
                        value={cashTendered}
                        onChange={e => setCashTendered(Number(e.target.value))}
                        style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}
                      />
                    </div>

                    <div>
                      <label className="form-label">Change to Return</label>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--r-xs)',
                          background: '#FFFFFF',
                          border: '1px solid var(--border)',
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          color: changeToReturn > 0 ? '#10B981' : 'var(--t3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>₹{changeToReturn}</span>
                        {changeToReturn > 0 && <span style={{ fontSize: 10.5, color: '#10B981', fontWeight: 600 }}>Refund to Diner</span>}
                      </div>
                    </div>
                  </div>

                  {/* Quick Denominations */}
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--t4)', marginBottom: 6, fontWeight: 600 }}>Quick Cash Denominations:</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[grandTotal, 500, 1000, 2000].filter(amt => amt >= grandTotal).map(amt => (
                        <button
                          key={amt}
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={() => setCashTendered(amt)}
                        >
                          ₹{amt} {amt === grandTotal ? '(Exact)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={14} style={{ color: '#10B981' }} />
                    Cash collected at billing counter by {billedByName}. Drawer balance logged automatically.
                  </div>
                </div>
              )}

              {/* PAYMENT OPTION 3: CARD */}
              {method === 'CARD' && (
                <div
                  className="anim-fade-up"
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>Card Swipe / Contactless POS</span>
                    </div>
                    <span className="badge badge-warning">{cardType} POS Terminal Ready</span>
                  </div>

                  {/* Virtual Card Preview */}
                  <div
                    style={{
                      borderRadius: 'var(--r-sm)',
                      background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '14px 18px',
                      color: '#fff',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>CAMPUS CARD PAY</span>
                      <span style={{ fontSize: 13, fontWeight: 800 }}>{cardType}</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', letterSpacing: '0.15em', fontWeight: 800, fontFamily: 'monospace' }}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--t2)' }}>
                      <div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Cardholder</div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{cardHolder || 'Campus Diner'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Expires</div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 11 }}>Card Number</label>
                      <input
                        className="form-input"
                        placeholder="4532 0000 0000 0000"
                        maxLength={19}
                        style={{ fontSize: 12 }}
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 11 }}>Expiry (MM/YY)</label>
                      <input
                        className="form-input"
                        placeholder="MM/YY"
                        maxLength={5}
                        style={{ fontSize: 12 }}
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 11 }}>CVV</label>
                      <input
                        className="form-input"
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        style={{ fontSize: 12 }}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* VIEW 2: OFFICIAL TAX INVOICE PREVIEW / GENERATOR VIEW */}
          {step === 'SELECT' && activeView === 'OFFICIAL_BILL' && (
            <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Official Printable Bill Document Sheet */}
              <div
                id="official-tax-bill"
                style={{
                  background: '#FFFFFF',
                  color: '#0F172A',
                  borderRadius: 'var(--r-sm)',
                  padding: '24px 28px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border)',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                {/* Bill Header */}
                <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        {booking?.restaurantName || 'THE SPICE GARDEN'}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#475569', marginTop: 2 }}>
                        Sector Alpha Commercial, Greater Noida · Bennett University Institutional Partner
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        GSTIN: 09AABCT1234F1Z8 · Food &amp; Beverage Tax Invoice
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          background: '#EFF6FF',
                          color: 'var(--primary)',
                          borderRadius: 4,
                          fontWeight: 800,
                          fontSize: 11,
                          letterSpacing: '0.05em',
                          border: '1px solid rgba(30, 58, 138, 0.2)'
                        }}
                      >
                        OFFICIAL DINING BILL
                      </span>
                      <div style={{ fontSize: 11.5, color: '#334155', fontWeight: 700, marginTop: 4 }}>
                        Bill #{invoiceNumber}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta details & Billing Authority Certificate */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, marginBottom: 16, background: '#F8FAFC', padding: 12, borderRadius: 6 }}>
                  <div>
                    <div><span style={{ color: '#64748B' }}>Diner Name:</span> <strong>{booking?.guestName || 'Campus Diner'}</strong></div>
                    <div style={{ marginTop: 3 }}><span style={{ color: '#64748B' }}>Institution ID / Email:</span> <strong>{booking?.guestEmail || 'student@bennett.edu.in'}</strong></div>
                    <div style={{ marginTop: 3 }}><span style={{ color: '#64748B' }}>Table / Diners:</span> <strong>Table {booking?.tableAssigned || 'T-01'} · {booking?.guests || 2} Diners</strong></div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div><span style={{ color: '#64748B' }}>Date:</span> <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                    <div style={{ marginTop: 3 }}><span style={{ color: '#64748B' }}>Time:</span> <strong>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
                    <div style={{ marginTop: 3 }}>
                      <span style={{ color: '#64748B' }}>Generated By:</span>{' '}
                      <strong style={{ color: billedRole === 'OWNER' ? 'var(--accent)' : 'var(--primary)' }}>
                        {billedRole === 'OWNER' ? '👔 Restaurant Owner' : '👨‍🍳 Duty Staff'} ({billedByName})
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginBottom: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #CBD5E1', color: '#475569', textAlign: 'left', fontSize: 10.5, textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 0' }}>#</th>
                      <th style={{ padding: '8px 0' }}>Order Item</th>
                      <th style={{ padding: '8px 0', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Unit Rate</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((it, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 0', color: '#94A3B8' }}>{i + 1}</td>
                        <td style={{ padding: '8px 0', fontWeight: 600 }}>{it.name}</td>
                        <td style={{ padding: '8px 0', textAlign: 'center' }}>{it.qty || 1}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>₹{it.price}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>₹{it.price * (it.qty || 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div style={{ borderTop: '1.5px solid #CBD5E1', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Gross Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                    <span>Bennett Student Institutional Subsidy (20%):</span>
                    <span>-₹{bennettDiscount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>CGST (2.5%) + SGST (2.5%):</span>
                    <span>+₹{gst}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '2px solid #0F172A',
                      paddingTop: 8,
                      marginTop: 4,
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#0F172A'
                    }}
                  >
                    <span>NET PAYABLE TOTAL:</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Official Certification Stamp / Signature Box */}
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 12,
                    borderTop: '1px dashed #CBD5E1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    fontSize: 11
                  }}
                >
                  <div>
                    <div style={{ color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> VERIFIED INSTITUTIONAL BILL
                    </div>
                    <div style={{ color: '#64748B', marginTop: 2 }}>
                      Payment Mode Pending: {method} · Table cleared upon settlement
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', borderTop: '1px solid #94A3B8', paddingTop: 4, minWidth: 160 }}>
                    <div style={{ fontWeight: 800, color: '#0F172A' }}>{billedByName}</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>
                      Authorized {billedRole === 'OWNER' ? 'Restaurant Owner' : 'Service Desk Staff'}
                    </div>
                  </div>
                </div>
              </div>

              {/* View Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-md"
                  onClick={() => setActiveView('SETTLEMENT')}
                >
                  ← Back to Order Editing
                </button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-md"
                    onClick={handlePrint}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Printer size={15} /> Print Official Bill
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-md"
                    onClick={() => setActiveView('SETTLEMENT')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    Proceed to Settle Payment (₹{grandTotal}) →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING ANIMATION */}
          {step === 'PROCESSING' && (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(79, 70, 229, 0.15)',
                  border: '2px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'var(--primary-light)',
                  animation: 'spin 1.2s linear infinite'
                }}
              >
                <RefreshCw size={30} />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
                Settling {method} Payment...
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--t3)' }}>
                Reconciling items, applying Bennett campus discount, and recording bill generated by {billedByName}.
              </p>
            </div>
          )}

          {/* STEP 3: SUCCESS & DIGITAL INVOICE RECEIPT */}
          {step === 'SUCCESS' && paymentResult && (
            <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '2px solid var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: 'var(--success)'
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
                  Payment Settled Successfully!
                </h3>
                <div style={{ fontSize: 13, color: 'var(--t3)' }}>
                  Dining pass completed · Billed by <strong>{paymentResult.billedBy?.name || billedByName}</strong> · Paid via <strong>{paymentResult.method}</strong>
                </div>
              </div>

              {/* Printable Itemized Receipt Sheet */}
              <div
                id="printable-receipt"
                style={{
                  background: '#fff',
                  color: '#1E293B',
                  borderRadius: 'var(--r-sm)',
                  padding: '24px 28px',
                  boxShadow: 'var(--shadow-lg)',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                {/* Receipt Header */}
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #CBD5E1', paddingBottom: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {booking?.restaurantName || 'THE SPICE GARDEN'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    Bennett University Institutional Partner · Sector Alpha Commercial, Greater Noida
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    GSTIN: 09AABCT1234F1Z8 · Service Receipt &amp; Tax Settlement
                  </div>
                </div>

                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11.5, marginBottom: 14 }}>
                  <div><span style={{ color: '#64748B' }}>Invoice No:</span> <strong>{paymentResult.transactionId}</strong></div>
                  <div style={{ textAlign: 'right' }}><span style={{ color: '#64748B' }}>Date:</span> <strong>{paymentResult.date} {paymentResult.time}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Guest Name:</span> <strong>{booking?.guestName || 'Priya Sharma'}</strong></div>
                  <div style={{ textAlign: 'right' }}><span style={{ color: '#64748B' }}>Party Size:</span> <strong>{booking?.guests || 2} Guests</strong></div>
                  <div>
                    <span style={{ color: '#64748B' }}>Billed By:</span>{' '}
                    <strong>{paymentResult.billedBy?.name || billedByName}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#64748B' }}>Role:</span>{' '}
                    <strong>{paymentResult.billedBy?.role === 'OWNER' ? 'Restaurant Owner' : 'Front Desk Staff'}</strong>
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left', fontSize: 10, textTransform: 'uppercase' }}>
                      <th style={{ padding: '6px 0' }}>Item</th>
                      <th style={{ padding: '6px 0', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '6px 0', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '6px 0', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(paymentResult.orders || currentOrders).map((it, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '6px 0', fontWeight: 600 }}>{it.name}</td>
                        <td style={{ padding: '6px 0', textAlign: 'center' }}>{it.qty || 1}</td>
                        <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{it.price}</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700 }}>₹{it.price * (it.qty || 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Calculation */}
                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Subtotal:</span>
                    <span>₹{paymentResult.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                    <span>Bennett Campus Discount (20%):</span>
                    <span>-₹{paymentResult.discount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>GST (5%):</span>
                    <span>+₹{paymentResult.tax}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1.5px solid #0F172A',
                      paddingTop: 8,
                      marginTop: 4,
                      fontSize: 15,
                      fontWeight: 900,
                      color: '#0F172A'
                    }}
                  >
                    <span>TOTAL AMOUNT PAID:</span>
                    <span>₹{paymentResult.totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    <span>Payment Mode: <strong>{paymentResult.method}</strong></span>
                    <span>Status: <strong style={{ color: '#059669' }}>PAID &amp; SETTLED</strong></span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px dashed #E2E8F0', fontSize: 10, color: '#94A3B8' }}>
                  Thank you for dining with Dine@Bennett! Official Receipt generated by {paymentResult.billedBy?.name || billedByName}.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-ft" style={{ borderTop: '1px solid var(--border)', padding: '14px 24px', flexShrink: 0 }}>
          {step === 'SELECT' && activeView === 'SETTLEMENT' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>
                Cancel
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => setActiveView('OFFICIAL_BILL')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FileText size={15} /> Official Bill
                </button>
                <button
                  type="button"
                  className="btn btn-accent btn-lg"
                  onClick={handleProcessPayment}
                >
                  <Sparkles size={16} /> Complete Payment (₹{grandTotal}) <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline btn-md" onClick={handlePrint}>
                <Printer size={15} /> Print Receipt
              </button>
              <button type="button" className="btn btn-primary btn-md" onClick={onClose}>
                <Check size={16} /> Done &amp; Close Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
