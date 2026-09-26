import { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Download,
  GraduationCap,
  Camera,
  ShieldCheck,
  UtensilsCrossed,
  Navigation
} from 'lucide-react';
import { useDining } from '../context/DiningContext';
import { useAuth } from '../context/AuthContext';

export default function DigitalPassModal({ booking, onClose }) {
  const { openScanner } = useDining() || {};
  const { user } = useAuth() || {};
  const canScan = user?.role === 'RESTAURANT_STAFF' || user?.role === 'RESTAURANT_ADMIN' || user?.role === 'SUPER_ADMIN';
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const handleSavePass = async () => {
    setDownloading(true);
    try {
      const qrUrl = booking.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${booking.id}-BENNETT-VERIFIED`;
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bennett-Dining-Pass-${booking.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      const qrUrl = booking.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${booking.id}-BENNETT-VERIFIED`;
      window.open(qrUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirections = () => {
    const venue = booking.restaurantName || 'The Spice Garden';
    const query = encodeURIComponent(`${venue}, Bennett University, Greater Noida`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleScanPass = () => {
    onClose();
    if (openScanner) {
      openScanner();
    }
  };

  const hasOrders = Array.isArray(booking.orders) && booking.orders.length > 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="wallet-card modal-bottom-sheet anim-scale-in"
        style={{
          maxWidth: 400,
          width: '100%',
          margin: 'auto',
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #E8E2D5',
          borderRadius: 18,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Digital Pass"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: '#F6F2EA',
            color: '#565449',
            border: '1px solid #E8E2D5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={15} />
        </button>

        {/* ── Apple Wallet Card Header ── */}
        <div className="wallet-card-header" style={{ padding: '20px 22px 16px', background: '#FFFFFF' }}>
          {/* Institutional Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: '#11120D',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={15} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#11120D' }}>
                  Bennett University
                </div>
                <div style={{ fontSize: 9.5, color: '#565449' }}>
                  Verified Hospitality Pass
                </div>
              </div>
            </div>

            <span style={{
              background: '#F6F2EA',
              border: '1px solid #E8E2D5',
              color: '#11120D',
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 99,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <ShieldCheck size={11} /> Priority Seating
            </span>
          </div>

          {/* Venue & Reference */}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#565449', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              RESTAURANT PARTNER
            </div>
            <h2 style={{ fontFamily: "'Newsreader', 'Playfair Display', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: '#11120D', lineHeight: 1.25, margin: '2px 0 6px' }}>
              {booking.restaurantName || 'Campus Partner'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11.5, color: '#565449', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                REF: {booking.id}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  background: '#F6F2EA',
                  border: '1px solid #E8E2D5',
                  color: '#11120D',
                  borderRadius: 99,
                  padding: '3px 10px',
                  fontSize: 10,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Perforated Ticket Divider with Notches ── */}
        <div className="wallet-perforated-divider">
          <div className="wallet-dashed-line" />
        </div>

        {/* ── Ticket Body ── */}
        <div className="wallet-card-body" style={{ background: '#F6F2EA', padding: '18px 22px 22px' }}>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            paddingBottom: 14,
            borderBottom: '1px solid #E8E2D5'
          }}>
            <div style={{
              background: '#FFFFFF',
              padding: '8px',
              borderRadius: 8,
              border: '1px solid #E8E2D5',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 9.5, color: '#565449', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Date
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#11120D', marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Calendar size={12} color="#11120D" />
                <span>{booking.date || 'Today'}</span>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '8px',
              borderRadius: 8,
              border: '1px solid #E8E2D5',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 9.5, color: '#565449', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Time Slot
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#11120D', marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Clock size={12} color="#11120D" />
                <span>{booking.time || '1:00 PM'}</span>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '8px',
              borderRadius: 8,
              border: '1px solid #E8E2D5',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 9.5, color: '#565449', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Guests
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#11120D', marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Users size={12} color="#11120D" />
                <span>{booking.guests || 2} Diners</span>
              </div>
            </div>
          </div>

          {/* Additional Info Row: Table & Status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #E8E2D5'
          }}>
            <div style={{ fontSize: 12, color: '#565449' }}>
              <span style={{ fontWeight: 500 }}>Table: </span>
              <span style={{ fontWeight: 700, color: '#11120D' }}>{booking.tableAssigned || 'Priority Host Seating'}</span>
            </div>
            <div style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 99,
              background: '#F0FDF4',
              color: '#16A34A',
              border: '1px solid #BBF7D0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <CheckCircle2 size={11} /> {booking.status || 'CONFIRMED'}
            </div>
          </div>

          {/* Pre-Ordered Items Summary if present */}
          {hasOrders && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E8E2D5',
              borderRadius: 8,
              padding: '8px 12px',
              margin: '10px 0',
              fontSize: 11.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, color: '#11120D', marginBottom: 3 }}>
                <UtensilsCrossed size={12} color="#11120D" />
                <span>Pre-Ordered Dishes ({booking.orders.length})</span>
              </div>
              <div style={{ color: '#565449', fontSize: 11 }}>
                {booking.orders.map(o => `${o.name} (x${o.qty || 1})`).join(', ')}
              </div>
            </div>
          )}

          {/* QR Scanner Container */}
          <div style={{ textAlign: 'center', margin: '14px 0 12px' }}>
            <div className="wallet-qr-container">
              <img
                src={booking.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${booking.id}-BENNETT-VERIFIED`}
                alt="Pass QR Code"
                style={{
                  width: 140,
                  height: 140,
                  display: 'block',
                  borderRadius: 6,
                  background: '#FFFFFF',
                  padding: 4
                }}
              />
              <div style={{
                marginTop: 8,
                fontSize: 9.5,
                fontWeight: 600,
                color: '#565449',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Scan At Front Desk For Table Entry
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSavePass}
              disabled={downloading}
              style={{
                flex: 1,
                padding: '9px 18px',
                minHeight: 38,
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5
              }}
            >
              <Download size={13} />
              <span>{downloading ? 'Saving...' : 'Save Pass'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDirections}
              style={{
                flex: 1,
                padding: '9px 18px',
                minHeight: 38,
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5
              }}
            >
              <Navigation size={13} />
              <span>Directions</span>
            </button>
          </div>

          {canScan && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={handleScanPass}
              style={{
                width: '100%',
                fontSize: 11.5,
                fontWeight: 500,
                color: '#565449',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '7px 16px',
                borderRadius: 99
              }}
            >
              <Camera size={12} />
              <span>Host Desk Scanner Shortcut</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
