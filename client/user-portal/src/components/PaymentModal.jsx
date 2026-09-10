import { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';

export default function PaymentModal({ booking, onClose, onPaymentComplete }) {
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CASH' | 'CARD'
  const [step, setStep] = useState('SELECT'); // 'SELECT' | 'PROCESSING' | 'SUCCESS'
  const [activePaymentQr, setActivePaymentQr] = useState(null);

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

  // Food items & bill calculations
  const orders = booking?.orders && booking.orders.length > 0 ? booking.orders : [
    { id: 'item-cover', name: `Dine-In Cover & Table Reservation (${booking?.guests || 2} Diners)`, price: 150 * (booking?.guests || 2), qty: 1 }
  ];

  const subtotal = orders.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const bennettDiscount = Math.round(subtotal * 0.20); // 20% institutional discount
  const gst = Math.round((subtotal - bennettDiscount) * 0.05); // 5% restaurant GST
  const grandTotal = subtotal - bennettDiscount + gst;

  // --- UPI STATE ---
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiTimer, setUpiTimer] = useState(120);
  const [upiPaidSimulated, setUpiPaidSimulated] = useState(false);

  // --- CASH STATE ---
  const [cashTendered, setCashTendered] = useState(grandTotal);
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
        details: method === 'CASH' 
          ? { tendered: cashTendered, change: changeToReturn }
          : method === 'UPI'
          ? { upiApp: selectedUpiApp, upiId: customUpiId || `${selectedUpiApp.toLowerCase().replace(' ', '')}@okaxis` }
          : { cardType, last4: cardNumber.replace(/\s+/g, '').slice(-4) },
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setPaymentResult(result);
      setStep('SUCCESS');

      // Trigger celebration confetti
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
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card anim-scale-in" style={{ maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div className="modal-hd" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--r-sm)',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
              border: '1px solid var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <Receipt size={22} />
            </div>
            <div>
              <div className="modal-title font-display" style={{ fontSize: '1.25rem' }}>
                {step === 'SUCCESS' ? 'Payment Completed & Settled' : 'Bill Payment & Settlement'}
              </div>
              <div className="modal-sub">
                {booking?.restaurantName || 'Dining Outlet'} · {booking?.guests || 2} Diners · {booking?.guestName || 'Campus Diner'}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* STEP 1: SELECT & CONFIGURE PAYMENT OPTION */}
          {step === 'SELECT' && (
            <>
              {/* Order & Bill Breakdown Card */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Itemized Order Summary
                  </span>
                  <span className="badge badge-primary">Bennett 20% Auto-Applied</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {orders.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--t2)' }}>
                      <span>{item.qty}x {item.name}</span>
                      <span style={{ fontWeight: 600, color: 'var(--t1)' }}>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t3)' }}>
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 600 }}>
                    <span>Bennett Student Discount (20%)</span>
                    <span>-₹{bennettDiscount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t3)' }}>
                    <span>Restaurant GST (5%)</span>
                    <span>+₹{gst}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: 10,
                    marginTop: 4
                  }}>
                    <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--t1)' }}>
                      Grand Total Due
                    </span>
                    <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>
              </div>

              {/* THREE PAYMENT OPTIONS TABS */}
              <div>
                <label className="form-label" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Select Payment Option</span>
                  <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 400 }}>(Choose 1 of 3 options)</span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
                    { id: 'CASH', label: 'Cash', icon: Banknote, desc: 'Counter / Tendered' },
                    { id: 'CARD', label: 'Card / POS', icon: CreditCard, desc: 'Visa, Master, RuPay' },
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
                          padding: '14px 12px',
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
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: isActive ? 'var(--primary)' : '#E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isActive ? '#FFFFFF' : 'var(--t2)'
                        }}>
                          <Icon size={18} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 13.5 }}>{opt.label}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PAYMENT OPTION 1: UPI */}
              {method === 'UPI' && (
                <div className="anim-fade-up" style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Smartphone size={18} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>Scan Dynamic UPI QR Code</span>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    {/* QR Code Graphic */}
                    <div style={{
                      background: '#fff',
                      padding: 12,
                      borderRadius: 'var(--r-xs)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: 'var(--shadow-md)',
                      minWidth: 164
                    }}>
                      {activePaymentQr?.image ? (
                        <img
                          src={activePaymentQr.image}
                          alt={activePaymentQr.label || "UPI Payment QR"}
                          style={{ width: 140, height: 140, objectFit: 'contain', display: 'block' }}
                        />
                      ) : (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${activePaymentQr?.upiId || 'dinebennett@okhdfcbank'}&pn=${encodeURIComponent(booking?.restaurantName || 'Campus Dining')}&am=${grandTotal}&cu=INR`)}`}
                          alt="UPI Payment QR"
                          style={{ width: 140, height: 140, display: 'block' }}
                        />
                      )}
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#000', marginTop: 6, letterSpacing: '0.05em' }}>
                        {activePaymentQr?.label ? activePaymentQr.label.toUpperCase() : 'BHIM UPI · VERIFIED'}
                      </span>
                      {activePaymentQr?.upiId && (
                        <span style={{ fontSize: 9.5, color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                          {activePaymentQr.upiId}
                        </span>
                      )}
                    </div>

                    {/* UPI App Options & VPA */}
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                        Scan using any UPI App on your phone or select quick simulator:
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setSelectedUpiApp(app)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--r-xs)',
                              fontSize: 11.5,
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
                        <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Or Enter VPA / UPI ID</label>
                        <input
                          className="form-input"
                          style={{ padding: '8px 12px', fontSize: 12.5 }}
                          placeholder="e.g. 9876543210@paytm or student@okhdfcbank"
                          value={customUpiId}
                          onChange={e => setCustomUpiId(e.target.value)}
                        />
                      </div>

                      <div style={{ fontSize: 11.5, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={14} /> Instant NPCI clearance · Zero convenience fee
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT OPTION 2: CASH */}
              {method === 'CASH' && (
                <div className="anim-fade-up" style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
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
                      <div style={{
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
                      }}>
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
                    Physical cash collected at front desk counter. Drawer balance updated automatically.
                  </div>
                </div>
              )}

              {/* PAYMENT OPTION 3: CARD */}
              {method === 'CARD' && (
                <div className="anim-fade-up" style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>Card Swipe / Contactless POS</span>
                    </div>
                    <span className="badge badge-warning">{cardType} Terminal Ready</span>
                  </div>

                  {/* Virtual Card Preview */}
                  <div style={{
                    borderRadius: 'var(--r-sm)',
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '16px 20px',
                    color: '#fff',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>CAMPUS CARD PAY</span>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{cardType}</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', letterSpacing: '0.15em', fontWeight: 800, fontFamily: 'monospace' }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 11 }}>Card Number</label>
                      <input
                        className="form-input"
                        placeholder="4532 0000 0000 0000"
                        maxLength={19}
                        style={{ fontSize: 12.5 }}
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
                        style={{ fontSize: 12.5 }}
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
                        style={{ fontSize: 12.5 }}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: PROCESSING ANIMATION */}
          {step === 'PROCESSING' && (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{
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
              }}>
                <RefreshCw size={30} />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
                Authorizing {method} Payment...
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--t3)' }}>
                Connecting to payment gateway &amp; verifying Bennett campus discount reconciliation.
              </p>
            </div>
          )}

          {/* STEP 3: SUCCESS & DIGITAL INVOICE RECEIPT */}
          {step === 'SUCCESS' && paymentResult && (
            <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
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
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
                  Payment Settled Successfully!
                </h3>
                <div style={{ fontSize: 13, color: 'var(--t3)' }}>
                  Dining pass completed &amp; session settled · Paid via <strong>{paymentResult.method}</strong>
                </div>
              </div>

              {/* Printable Itemized Receipt Sheet */}
              <div id="printable-receipt" style={{
                background: '#fff',
                color: '#1E293B',
                borderRadius: 'var(--r-sm)',
                padding: '24px 28px',
                boxShadow: 'var(--shadow-lg)',
                fontFamily: 'system-ui, sans-serif'
              }}>
                {/* Receipt Header */}
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #CBD5E1', paddingBottom: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {booking?.restaurantName || 'THE SPICE GARDEN'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    Bennett University Institutional Partner · Sector Alpha Commercial, Greater Noida
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    GSTIN: 09AABCT1234F1Z8 · Service Invoice
                  </div>
                </div>

                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11.5, marginBottom: 14 }}>
                  <div><span style={{ color: '#64748B' }}>Invoice No:</span> <strong>{paymentResult.transactionId}</strong></div>
                  <div style={{ textAlign: 'right' }}><span style={{ color: '#64748B' }}>Date:</span> <strong>{paymentResult.date} {paymentResult.time}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Guest Name:</span> <strong>{booking?.guestName || 'Priya Sharma'}</strong></div>
                  <div style={{ textAlign: 'right' }}><span style={{ color: '#64748B' }}>Party Size:</span> <strong>{booking?.guests || 2} Guests</strong></div>
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
                    {orders.map((it, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '6px 0', fontWeight: 600 }}>{it.name}</td>
                        <td style={{ padding: '6px 0', textAlign: 'center' }}>{it.qty}</td>
                        <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{it.price}</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700 }}>₹{it.price * it.qty}</td>
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
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1.5px solid #0F172A',
                    paddingTop: 8,
                    marginTop: 4,
                    fontSize: 15,
                    fontWeight: 900,
                    color: '#0F172A'
                  }}>
                    <span>TOTAL AMOUNT PAID:</span>
                    <span>₹{paymentResult.totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    <span>Payment Mode: <strong>{paymentResult.method}</strong></span>
                    <span>Status: <strong style={{ color: '#059669' }}>PAID &amp; SETTLED</strong></span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px dashed #E2E8F0', fontSize: 10, color: '#94A3B8' }}>
                  Thank you for dining with Dine@Bennett! Your table is cleared.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="modal-ft" style={{ borderTop: '1px solid var(--border)', padding: '16px 28px' }}>
          {step === 'SELECT' && (
            <>
              <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-accent btn-lg"
                onClick={handleProcessPayment}
              >
                <Sparkles size={16} /> Complete Payment (₹{grandTotal}) <ArrowRight size={16} />
              </button>
            </>
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
