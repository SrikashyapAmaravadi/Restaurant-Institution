import { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Download,
  Share2,
  GraduationCap,
  Camera,
  QrCode,
  ShieldCheck,
  UtensilsCrossed,
  Navigation
} from 'lucide-react';
import { useDining } from '../context/DiningContext';

export default function DigitalPassModal({ booking, onClose }) {
  const { openScanner } = useDining() || {};
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
          maxWidth: 420,
          width: '100%',
          margin: 'auto',
          position: 'relative'
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
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.35)',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.15s ease'
          }}
        >
          <X size={16} />
        </button>

        {/* ── Apple Wallet Card Header ── */}
        <div className="wallet-card-header">
          {/* Institutional Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={16} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#A7F3D0' }}>
                  Bennett University
                </div>
                <div style={{ fontSize: 9.5, color: '#D1FAE5', opacity: 0.9 }}>
                  Official Dining Pass
                </div>
              </div>
            </div>

            <span style={{
              background: 'rgba(16, 185, 129, 0.25)',
              border: '1px solid rgba(167, 243, 208, 0.4)',
              color: '#ECFDF5',
              fontSize: 10.5,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 99,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <ShieldCheck size={12} /> Tier-1 Priority
            </span>
          </div>

          {/* Venue & Reference */}
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#A7F3D0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              RESTAURANT PARTNER
            </div>
            <h2 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, margin: '2px 0 6px' }}>
              {booking.restaurantName || 'Campus Partner'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#E2E8F0', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                REF: {booking.id}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: 4,
                  padding: '2px 7px',
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
        <div className="wallet-card-body">
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            paddingBottom: 16,
            borderBottom: '1px solid #F1F5F9'
          }}>
            <div>
              <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Date
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} className="text-emerald-700" />
                <span>{booking.date || 'Today'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Time Slot
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} className="text-emerald-700" />
                <span>{booking.time || '1:00 PM'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Guests
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={13} className="text-emerald-700" />
                <span>{booking.guests || 2} Diners</span>
              </div>
            </div>
          </div>

          {/* Additional Info Row: Table & Status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #F1F5F9'
          }}>
            <div style={{ fontSize: 12, color: '#475569' }}>
              <span style={{ fontWeight: 600 }}>Table: </span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>{booking.tableAssigned || 'Priority Host Seating'}</span>
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 99,
              background: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <CheckCircle2 size={12} /> {booking.status || 'CONFIRMED'}
            </div>
          </div>

          {/* Pre-Ordered Items Summary if present */}
          {hasOrders && (
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '10px 12px',
              margin: '12px 0',
              fontSize: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                <UtensilsCrossed size={12} className="text-emerald-700" />
                <span>Pre-Ordered Dishes ({booking.orders.length})</span>
              </div>
              <div style={{ color: '#475569', fontSize: 11.5 }}>
                {booking.orders.map(o => `${o.name} (x${o.qty || 1})`).join(', ')}
              </div>
            </div>
          )}

          {/* ── High-Contrast Host QR Scanner Container ── */}
          <div style={{ textAlign: 'center', margin: '16px 0 14px' }}>
            <div className="wallet-qr-container">
              <img
                src={booking.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${booking.id}-BENNETT-VERIFIED`}
                alt="Pass QR Code"
                style={{
                  width: 150,
                  height: 150,
                  display: 'block',
                  borderRadius: 8
                }}
              />
              <div style={{
                marginTop: 8,
                fontSize: 10,
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                Scan At Front Desk For Table Entry
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSavePass}
              disabled={downloading}
              style={{
                flex: 1,
                padding: '11px 18px',
                minHeight: 42,
                borderRadius: 12,
                fontSize: 12.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Download size={14} />
              <span>{downloading ? 'Saving...' : 'Save Pass'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDirections}
              style={{
                flex: 1,
                padding: '11px 18px',
                minHeight: 42,
                borderRadius: 12,
                fontSize: 12.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Navigation size={14} />
              <span>Directions</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={handleScanPass}
            style={{
              width: '100%',
              fontSize: 12,
              fontWeight: 600,
              color: '#64748B',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8
            }}
          >
            <Camera size={13} />
            <span>Host Desk Scanner Shortcut</span>
          </button>
        </div>
      </div>
    </div>
  );
}
