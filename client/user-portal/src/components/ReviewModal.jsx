import { useState } from 'react';
import { useDining } from '../context/DiningContext';
import { X, Star, Sparkles, ThumbsUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ReviewModal({ restaurant, onClose, onReviewSubmitted }) {
  const { submitReview } = useDining();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [dish, setDish] = useState('Smoked Dal Makhani');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const popularDishes = restaurant.popularDishes || ['Butter Chicken', 'Tandoori Roti', 'Signature Biryani', 'House Special Platter'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment about your dining experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const createdReview = await submitReview(restaurant.id, {
        rating,
        comment: comment.trim(),
        dishTried: dish
      });

      setSuccessMsg('Your verified institutional review has been published!');
      if (onReviewSubmitted) {
        onReviewSubmitted(createdReview);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review. An active or completed booking is required.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card anim-scale-in" style={{ maxWidth: 520, background: '#FFFFFF' }}>
        <div className="modal-hd">
          <div>
            <div className="modal-title font-display" style={{ color: 'var(--t1)' }}>Write a Verified Review</div>
            <div className="modal-sub">{restaurant.name} · Bennett Dining Network</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--r-xs)', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--r-xs)', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Interactive Stars */}
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 8 }}>Rate your dining experience</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: active ? '#F59E0B' : '#CBD5E1',
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease, color 0.15s ease'
                      }}
                    >
                      <Star size={32} fill={active ? '#F59E0B' : 'none'} />
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#D97706', marginTop: 6 }}>
                {rating === 5 && 'Outstanding! (5/5)'}
                {rating === 4 && 'Very Good (4/5)'}
                {rating === 3 && 'Average (3/5)'}
                {rating === 2 && 'Needs Improvement (2/5)'}
                {rating === 1 && 'Disappointing (1/5)'}
              </div>
            </div>

            {/* Dish selection */}
            <div>
              <label className="form-label">What dish did you try?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {popularDishes.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDish(d)}
                    className={`btn btn-xs ${dish === d ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: 'var(--r-full)' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="form-label">Your Review & Food Feedback *</label>
              <textarea
                className="form-input"
                rows={4}
                required
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts on food quality, service speed, ambience, and discount auto-application..."
              />
            </div>

            <div style={{ fontSize: 11.5, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="#D97706" />
              <span>Reviews are verified with your official @bennett.edu.in profile.</span>
            </div>
          </div>

          <div className="modal-ft">
            <button type="button" className="btn btn-ghost btn-md" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-md" disabled={isSubmitting}>
              <ThumbsUp size={15} /> {isSubmitting ? 'Publishing...' : 'Publish Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
