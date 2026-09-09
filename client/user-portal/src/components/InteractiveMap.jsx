import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Star, Utensils, Compass, ArrowUpRight, GraduationCap, Calendar, Tag } from 'lucide-react';

export default function InteractiveMap({ restaurants, onSelectRestaurant }) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(restaurants[0]?.id || 1);

  // Approximate relative coordinates centered on Bennett University
  // Coordinates mapped to percentage coordinates inside the radar map container
  const pinPositions = {
    1: { top: '38%', left: '54%', offset: '0.8 km' }, // The Spice Garden
    2: { top: '48%', left: '46%', offset: '0.5 km' }, // The Deli Corner
    3: { top: '28%', left: '68%', offset: '1.2 km' }, // Mezze & More
    4: { top: '65%', left: '32%', offset: '1.5 km' }, // Wok & Roll
    5: { top: '78%', left: '72%', offset: '2.1 km' }, // Tandoor Tales
    6: { top: '32%', left: '26%', offset: '1.8 km' }, // Green Plate Bistro
  };

  const activeRest = restaurants.find(r => r.id === selectedId) || restaurants[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Map Radar Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '480px',
        background: 'radial-gradient(circle at 50% 50%, #F8FAFC 0%, #EEF2F6 100%)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none'
        }} />

        {/* Distance Range Rings from Bennett University */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          border: '1.5px dashed rgba(30, 58, 138, 0.25)',
          pointerEvents: 'none'
        }}>
          <span style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>0.8 km Radius</span>
        </div>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          border: '1.5px dashed rgba(100, 116, 139, 0.25)',
          pointerEvents: 'none'
        }}>
          <span style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--t3)', fontWeight: 700 }}>2.0 km Campus Zone</span>
        </div>

        {/* Central Benchmark: Bennett University */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            border: '3px solid #FFFFFF',
            boxShadow: '0 4px 14px rgba(30, 58, 138, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <GraduationCap size={24} />
          </div>
          <div style={{
            marginTop: 6,
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            padding: '3px 10px',
            borderRadius: 'var(--r-full)',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--t1)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)'
          }}>
            Bennett Campus (Center)
          </div>
        </div>

        {/* Restaurant Marker Pins */}
        {restaurants.map(rest => {
          const pos = pinPositions[rest.id] || { top: '60%', left: '60%', offset: '1.0 km' };
          const isSelected = rest.id === selectedId;

          return (
            <div
              key={rest.id}
              onClick={() => {
                setSelectedId(rest.id);
                if (onSelectRestaurant) onSelectRestaurant(rest);
              }}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 25 : 15,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--r-full)',
                background: isSelected ? 'var(--primary)' : '#FFFFFF',
                border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                color: isSelected ? '#FFFFFF' : 'var(--t1)',
                boxShadow: isSelected ? '0 4px 14px rgba(30, 58, 138, 0.35)' : 'var(--shadow-sm)',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}>
                <Utensils size={12} />
                <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {rest.name}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : 'var(--t3)',
                  padding: '1px 6px',
                  borderRadius: 'var(--r-full)'
                }}>
                  {rest.distance} km
                </span>
              </div>
            </div>
          );
        })}

        {/* Map Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 16,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: 11.5,
          color: 'var(--t2)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
            <span>Bennett University</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid var(--border)' }} />
            <span>Partner Restaurants</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--t3)' }}>
            <Compass size={13} /> Greater Noida West
          </div>
        </div>
      </div>

      {/* Selected Restaurant Quick Preview Card */}
      {activeRest && (
        <div className="card anim-fade-up" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img
              src={activeRest.image}
              alt={activeRest.name}
              style={{ width: 68, height: 68, borderRadius: 'var(--r-sm)', objectFit: 'cover', border: '1px solid var(--border)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--t1)' }}>
                  {activeRest.name}
                </h4>
                <span className="badge badge-success">● {activeRest.isOpen ? 'Open Now' : 'Closed'}</span>
                {activeRest.hasOffer && (
                  <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={12} /> {activeRest.offerLabel}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span>{activeRest.cuisine}</span>
                <span>·</span>
                <span>{activeRest.price}</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#F59E0B' }}>
                  <Star size={13} fill="#F59E0B" /> {activeRest.rating} ({typeof activeRest.reviews === 'number' ? activeRest.reviews : (Array.isArray(activeRest.reviews) ? activeRest.reviews.length : 120)} reviews)
                </span>
                <span>·</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> {activeRest.distance} km from Bennett
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button
              className="btn btn-outline btn-md"
              onClick={() => navigate(`/restaurant/${activeRest.id}`)}
            >
              View Full Menu <ArrowUpRight size={15} />
            </button>
            <button
              className="btn btn-primary btn-md"
              onClick={() => navigate(`/restaurant/${activeRest.id}`)}
            >
              <Calendar size={15} /> Reserve Table
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
