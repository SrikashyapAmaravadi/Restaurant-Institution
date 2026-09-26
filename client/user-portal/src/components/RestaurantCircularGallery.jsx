import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import RestaurantCard from './RestaurantCard';

const DEFAULT_RESTAURANTS = [
  {
    id: 1,
    name: 'The Spice Garden',
    cuisine: 'North Indian, Mughlai & Tandoor',
    rating: 4.8,
    reviews: 142,
    distance: 0.8,
    price: '₹₹',
    isOpen: true,
    hasOffer: true,
    offerLabel: '20% OFF',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    offers: [{ id: 'off-1', promoCode: 'BENNETT20', discount: '20% OFF', title: '20% OFF Campus Exclusive' }]
  },
  {
    id: 2,
    name: 'Campus Cafe & Roastery',
    cuisine: 'Continental, Cafe, Beverages',
    rating: 4.6,
    reviews: 98,
    distance: 0.2,
    price: '₹₹',
    isOpen: true,
    hasOffer: true,
    offerLabel: '15% OFF',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    offers: [{ id: 'off-2', promoCode: 'CAMPUS15', discount: '15% OFF', title: '15% OFF Campus Special' }]
  },
  {
    id: 3,
    name: 'Green Bowl Organics',
    cuisine: 'Healthy Bowls, Salads, Smoothies',
    rating: 4.7,
    reviews: 64,
    distance: 0.5,
    price: '₹₹',
    isOpen: true,
    hasOffer: false,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'Kathi Junction & Shawarma House',
    cuisine: 'Street Food, Rolls, Fast Food',
    rating: 4.5,
    reviews: 120,
    distance: 0.1,
    price: '₹',
    isOpen: true,
    hasOffer: true,
    offerLabel: '₹50 OFF',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
    offers: [{ id: 'off-4', promoCode: 'KATHI50', discount: '₹50 OFF', title: '₹50 OFF Orders Above ₹200' }]
  }
];

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * RestaurantCircularGallery
 * Renders complete, interactive <RestaurantCard /> components in a real 3D cylindrical circular arc.
 * Clean, distraction-free stage with direct card clicks, Book Table, and Offer drawer functionality.
 */
export default function RestaurantCircularGallery({
  restaurants = [],
  onQuickReserve,
  onViewOffer,
  bend = 3,
  height = 580
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);

  const [isDragging, setIsDragging] = useState(false);
  const wasDraggingRef = useRef(false);

  // Raw base restaurants list
  const baseList = useMemo(() => {
    return restaurants && restaurants.length > 0 ? restaurants : DEFAULT_RESTAURANTS;
  }, [restaurants]);

  // Expand items to ensure a rich circular cylinder
  const items = useMemo(() => {
    let list = [...baseList];
    while (list.length < 8) {
      list = list.concat(baseList);
    }
    return list.map((item, idx) => ({
      ...item,
      uniqueKey: `${item.id}-${idx}`,
      originalIndex: idx % baseList.length
    }));
  }, [baseList]);

  // Card geometry dimensions
  const cardWidth = 330;
  const cardGap = 28;
  const cardStride = cardWidth + cardGap;
  const totalTrackWidth = items.length * cardStride;

  // Physics animation state
  const scrollRef = useRef({
    current: 0,
    target: 0,
    ease: 0.075,
    last: 0
  });

  const pointerRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    startTarget: 0,
    dragDistance: 0
  });

  // Center snap helper
  const snapToNearest = useCallback(() => {
    const nearestIndex = Math.round(scrollRef.current.target / cardStride);
    scrollRef.current.target = nearestIndex * cardStride;
  }, [cardStride]);

  // Main 3D render loop
  useEffect(() => {
    let animId;
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const scroll = scrollRef.current;
      scroll.current = lerp(scroll.current, scroll.target, scroll.ease);

      const container = containerRef.current;
      const containerWidth = container?.clientWidth || 900;
      const halfTrack = totalTrackWidth / 2;

      // Arc radius R derived from bend parameter
      const bendFactor = bend;
      const H = containerWidth / 2;
      const B_abs = Math.max(Math.abs(bendFactor) * 22, 1);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs) + 120;

      for (let i = 0; i < items.length; i++) {
        const cardEl = cardRefs.current[i];
        if (!cardEl) continue;

        const rawPos = i * cardStride - scroll.current;
        let wrappedX = ((rawPos % totalTrackWidth) + totalTrackWidth) % totalTrackWidth;
        if (wrappedX > halfTrack) {
          wrappedX -= totalTrackWidth;
        }

        const absDist = Math.abs(wrappedX);

        // 3D positioning along circular arc
        const progress = wrappedX / (containerWidth / 2 || 1);
        const angle = wrappedX / R;
        const effectiveX = Math.min(Math.abs(wrappedX), H);
        const arc = R - Math.sqrt(Math.max(R * R - effectiveX * effectiveX, 0));

        let yOffset = 0;
        let rotZ = 0;

        if (bendFactor !== 0) {
          if (bendFactor > 0) {
            yOffset = -arc * 0.95;
            rotZ = -Math.sign(wrappedX) * Math.asin(Math.min(effectiveX / R, 0.99)) * (180 / Math.PI) * 0.35;
          } else {
            yOffset = arc * 0.95;
            rotZ = Math.sign(wrappedX) * Math.asin(Math.min(effectiveX / R, 0.99)) * (180 / Math.PI) * 0.35;
          }
        }

        // Depth curve (cards curve smoothly away into the cylinder)
        const zOffset = -(1 - Math.cos(angle)) * 360 - (Math.abs(progress) > 1 ? (Math.abs(progress) - 1) * 180 : 0);
        const rotY = -angle * (180 / Math.PI) * 0.72;
        const scale = Math.max(0.72, 1 - Math.abs(progress) * 0.12);
        const opacity = Math.max(0, 1 - Math.max(0, absDist - containerWidth * 0.42) / (containerWidth * 0.42));
        const zIndex = Math.round(1000 - absDist);

        cardEl.style.transform = `translate3d(calc(${wrappedX}px - 50%), ${yOffset}px, ${zOffset}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
        cardEl.style.zIndex = zIndex;
        cardEl.style.opacity = opacity;

        // Interactive threshold
        if (absDist < cardWidth * 1.3) {
          cardEl.style.pointerEvents = 'auto';
        } else {
          cardEl.style.pointerEvents = 'none';
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [items, cardStride, totalTrackWidth, bend]);

  // Touch & Mouse Drag Handlers
  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    pointerRef.current.isDown = true;
    pointerRef.current.startX = clientX;
    pointerRef.current.startY = clientY;
    pointerRef.current.startTarget = scrollRef.current.target;
    pointerRef.current.dragDistance = 0;
    wasDraggingRef.current = false;
    setIsDragging(false);
  };

  const handlePointerMove = (e) => {
    if (!pointerRef.current.isDown) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const diffX = clientX - pointerRef.current.startX;
    const diffY = clientY - pointerRef.current.startY;
    const totalDist = Math.hypot(diffX, diffY);

    if (totalDist > 8) {
      wasDraggingRef.current = true;
      setIsDragging(true);
      pointerRef.current.dragDistance = totalDist;
      scrollRef.current.target = pointerRef.current.startTarget - diffX * 1.25;
    }
  };

  const handlePointerUp = () => {
    if (!pointerRef.current.isDown) return;
    pointerRef.current.isDown = false;
    setTimeout(() => {
      wasDraggingRef.current = false;
      setIsDragging(false);
    }, 50);
    snapToNearest();
  };

  const handleWheel = (e) => {
    const delta = e.deltaX || e.deltaY;
    if (Math.abs(delta) > 4) {
      scrollRef.current.target += delta * 0.7;
      clearTimeout(pointerRef.current.wheelTimer);
      pointerRef.current.wheelTimer = setTimeout(snapToNearest, 220);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollRef.current.target += cardStride;
      snapToNearest();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollRef.current.target -= cardStride;
      snapToNearest();
    }
  };

  return (
    <div
      style={{
        borderRadius: 22,
        background: '#FFFFFF',
        border: '1px solid #E8E2D5',
        boxShadow: '0 12px 36px rgba(17, 18, 13, 0.05)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* ── 3D Stage Container ── */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onClickCapture={e => {
          if (wasDraggingRef.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        style={{
          width: '100%',
          height: height,
          position: 'relative',
          overflow: 'hidden',
          perspective: 1200,
          perspectiveOrigin: '50% 50%',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #FFFBF4 55%, #F4ECE0 100%)',
          userSelect: 'none',
          touchAction: 'pan-y'
        }}
        aria-label="Restaurant Cards Carousel"
      >
        {/* Subtle Depth Floor Shadows */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: '15%',
            right: '15%',
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(17, 18, 13, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* 3D Track */}
        <div
          ref={trackRef}
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.uniqueKey}
              ref={el => (cardRefs.current[i] = el)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: cardWidth,
                marginTop: -230,
                transformOrigin: '50% 50%',
                willChange: 'transform, opacity',
                transition: 'box-shadow 0.3s ease',
                pointerEvents: 'auto'
              }}
            >
              {/* Full Interactive Restaurant Card */}
              <div
                style={{
                  filter: 'drop-shadow(0 16px 28px rgba(17, 18, 13, 0.08))',
                  borderRadius: 14
                }}
              >
                <RestaurantCard
                  restaurant={item}
                  onQuickReserve={onQuickReserve}
                  onViewOffer={onViewOffer}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
