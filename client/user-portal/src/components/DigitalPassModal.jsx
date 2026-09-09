import { X, Calendar, Clock, MapPin, Users, CheckCircle2, Download, Share2, GraduationCap, Camera, QrCode } from 'lucide-react';
import { useDining } from '../context/DiningContext';

export default function DigitalPassModal({ booking, onClose }) {
  const { openScanner } = useDining() || {};
  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card anim-scale-in" style={{ maxWidth: 440, background: '#FFFFFF', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
        <div className="modal-hd" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <GraduationCap size={13} /> Bennett Dining Pass
          </span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ padding: '20px 28px 28px', textAlign: 'center' }}>
          {/* Ticket Header */}
          <div style={{ marginBottom: 16 }}>
            <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
              {booking.restaurantName}
            </h3>
            <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
              Booking Reference: {booking.id}
            </div>
          </div>

          {/* QR Code Container */}
          <div style={{
            background: '#FFFFFF',
            padding: 16,
            borderRadius: 'var(--r)',
            display: 'inline-block',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 20
          }}>
            <img
              src={booking.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${booking.id}-BENNETT-VERIFIED`}
              alt="Pass QR Code"
              style={{ width: 150, height: 150, display: 'block' }}
            />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)', marginTop: 8, letterSpacing: '0.08em' }}>
              SCAN AT RESTAURANT HOST DESK
            </div>
          </div>

          {/* Reservation Details Grid */}
          <div style={{
            background: '#F8FAFC',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border)',
            padding: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            textAlign: 'left',
            marginBottom: 20
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Date</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <Calendar size={13} className="text-amber-400" /> {booking.date}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Time</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <Clock size={13} className="text-indigo-400" /> {booking.time}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Party Size</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <Users size={13} className="text-emerald-400" /> {booking.guests} Guests
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 700 }}>Status</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#34D399', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <CheckCircle2 size={13} /> {booking.status}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <button
              className="btn btn-outline btn-md"
              style={{ flex: 1, background: '#FFFFFF', color: '#000000', fontWeight: 700 }}
              onClick={() => alert('Booking Pass saved to device downloads!')}
            >
              <Download size={14} style={{ color: '#000000' }} />
              <span style={{ color: '#000000', fontWeight: 700 }}>Save Pass</span>
            </button>
            <button
              className="btn btn-primary btn-md"
              style={{ flex: 1 }}
              onClick={() => alert(`Directions opened: Campus to ${booking.restaurantName} (0.8 km)`)}
            >
              <MapPin size={14} /> Directions
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              color: '#000000',
              fontWeight: 700,
              background: '#FFFFFF',
              border: '1.5px solid var(--border)'
            }}
            onClick={() => {
              onClose();
              if (openScanner) openScanner();
            }}
            title="Open camera to scan this digital pass"
          >
            <Camera size={14} style={{ color: '#000000' }} />
            <span style={{ color: '#000000', fontWeight: 700 }}>Scan Digital Pass with Camera</span>
          </button>
        </div>
      </div>
    </div>
  );
}
