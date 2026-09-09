import { useState } from 'react';
import { X, Copy, Check, Tag, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function OfferDrawer({ offer, onClose, onApplyOffer }) {
  const [copied, setCopied] = useState(false);

  if (!offer) return null;

  const codeToCopy = offer.code || offer.promoCode || 'BENNETT20';

  const copyCode = () => {
    navigator.clipboard?.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card anim-scale-in" style={{ maxWidth: 480 }}>
        <div className="modal-hd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Tag size={12} /> Exclusive Deal
            </span>
            <div className="modal-title font-display" style={{ fontSize: '1.2rem', color: 'var(--t1)' }}>Offer Details</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--r)',
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {offer.restaurantName || 'Campus Partner'}
            </div>
            <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
              {offer.title}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--t3)' }}>{offer.description}</p>

            {/* Coupon Box */}
            <div style={{
              marginTop: 18,
              background: '#FFFFFF',
              border: '2px dashed var(--accent)',
              borderRadius: 'var(--r-sm)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                  PROMO CODE
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--t1)', letterSpacing: '0.1em' }}>
                  {codeToCopy}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-accent btn-sm"
                onClick={copyCode}
              >
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Code</>}
              </button>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t3)', marginBottom: 8 }}>
              Terms & Eligibility
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: 'var(--t2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Clock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Valid till <strong>{offer.validTill || offer.endDate || 'End of Semester'}</strong>. Applicable during restaurant operating hours.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Requires Bennett University Student/Faculty digital verification badge.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Tag size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>{offer.terms || (offer.minOrderAmount ? `Minimum order spend of ₹${offer.minOrderAmount}. Dine-in reservations only.` : 'Valid on dine-in reservations for verified institutional diners.')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-ft">
          <button className="btn btn-ghost btn-md" onClick={onClose}>Close</button>
          <button
            className="btn btn-primary btn-md"
            onClick={() => {
              if (onApplyOffer) onApplyOffer(offer);
              alert(`Offer ${offer.code} claimed and ready for pre-booking!`);
              onClose();
            }}
          >
            <Sparkles size={15} /> Claim Offer
          </button>
        </div>
      </div>
    </div>
  );
}
