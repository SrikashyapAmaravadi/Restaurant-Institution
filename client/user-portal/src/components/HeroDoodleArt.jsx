import React from 'react';

/**
 * HeroDoodleArt
 * Ambient hand-drawn food & campus dining doodles tailored for the dark
 * hero canvas banner (Dashboard and Landing pages).
 */
export default function HeroDoodleArt({
  stroke = '#FFFBF4',
  opacity = 0.42,
  strokeWidth = 2.2,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 1,
      }}
      aria-hidden="true"
    >
      {/* ── Soft Ethereal Atmospheric Sheens ── */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '8%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(216, 207, 188, 0.14) 0%, rgba(255, 251, 244, 0.04) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '6%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(86, 84, 73, 0.18) 0%, transparent 65%)',
          filter: 'blur(55px)',
        }}
      />

      {/* ── Hand-Drawn Food & Campus Dining Doodles SVG (Desktop >= 641px) ── */}
      <svg
        className="hero-doodles-desktop"
        width="100%"
        height="100%"
        viewBox="0 0 1120 360"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: opacity,
          stroke: stroke,
          fill: 'none',
          strokeWidth: strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      >
        {/* ════════ LEFT FLANK DOODLES ════════ */}
        <g transform="translate(48, 38) scale(1.1)">
          <path d="M10 24 C10 44, 42 44, 42 24 L42 14 L10 14 Z" />
          <path d="M42 18 C50 18, 50 30, 42 30" />
          <path d="M8 44 L44 44" />
          <path d="M18 9 Q20 4, 18 0" strokeDasharray="2 2" strokeWidth={strokeWidth} />
          <path d="M26 10 Q28 4, 26 -1" strokeDasharray="2 2" strokeWidth={strokeWidth} />
          <path d="M33 9 Q35 5, 33 1" strokeDasharray="2 2" strokeWidth={strokeWidth} />
        </g>

        <g transform="translate(185, 45) scale(0.95)">
          <path
            d="M18 0 Q18 18, 0 18 Q18 18, 18 36 Q18 18, 36 18 Q18 18, 18 0 Z"
            fill="rgba(255, 251, 244, 0.18)"
          />
        </g>

        <g transform="translate(45, 150) scale(1.15)">
          <line x1="12" y1="10" x2="48" y2="65" />
          <path d="M12 10 L8 16 Q18 24, 24 16 L20 10" />
          <line x1="16" y1="12" x2="16" y2="18" />
          <line x1="48" y1="10" x2="12" y2="65" />
          <path d="M48 10 Q38 18, 40 28 L45 28 Z" />
        </g>

        <g transform="translate(145, 215) scale(1.18)">
          <path d="M10 24 Q35 4, 60 24 Z" />
          <ellipse cx="25" cy="16" rx="1.6" ry="0.9" fill={stroke} />
          <ellipse cx="36" cy="13" rx="1.6" ry="0.9" fill={stroke} />
          <ellipse cx="44" cy="18" rx="1.6" ry="0.9" fill={stroke} />
          <path d="M8 27 Q15 23, 22 27 Q29 31, 36 27 Q43 23, 50 27 Q57 31, 62 27" />
          <rect x="10" y="31" width="50" height="6.5" rx="3.2" />
          <path d="M11 41 Q35 43, 59 41 L58 45 Q35 50, 12 45 Z" />
        </g>

        <g transform="translate(42, 280) scale(0.9)">
          <path d="M10 25 Q30 5, 55 18 Q75 28, 90 8" />
          <polyline points="80 7, 92 8, 90 20" />
        </g>

        <g transform="translate(195, 140)">
          <circle cx="10" cy="10" r="3.5" strokeDasharray="2 2" />
        </g>
        <g transform="translate(115, 105)">
          <circle cx="8" cy="8" r="2.5" />
        </g>
        <g transform="translate(85, 245)">
          <path d="M8 0 L10 5 L16 8 L10 11 L8 16 L6 11 L0 8 L6 5 Z" />
        </g>

        {/* ════════ RIGHT FLANK DOODLES ════════ */}
        <g transform="translate(980, 36) rotate(14) scale(1.15)">
          <path d="M20 10 L55 75 L5 75 Z" />
          <path d="M3 75 Q30 82, 57 75" strokeWidth={strokeWidth + 0.8} />
          <circle cx="28" cy="45" r="4.5" />
          <circle cx="20" cy="62" r="3.5" />
          <circle cx="38" cy="63" r="4" />
          <path d="M34 30 L36 34" />
        </g>

        <g transform="translate(890, 50) scale(0.85)">
          <line x1="20" y1="0" x2="20" y2="40" />
          <line x1="0" y1="20" x2="40" y2="20" />
          <line x1="6" y1="6" x2="34" y2="34" />
          <line x1="6" y1="34" x2="34" y2="6" />
        </g>

        <g transform="translate(990, 145) scale(1.15)">
          <polygon points="35,10 65,22 35,34 5,22" />
          <path d="M16 28 L16 42 Q35 50, 54 42 L54 28" />
          <path d="M60 23 L68 36 L68 45" />
          <circle cx="68" cy="46" r="2.5" fill={stroke} />
        </g>

        <g transform="translate(870, 195) rotate(-8) scale(1.0)">
          <rect x="10" y="10" width="46" height="32" rx="5" />
          <line x1="22" y1="10" x2="22" y2="42" strokeDasharray="3 3" />
          <circle cx="16" cy="26" r="3.5" />
          <rect x="28" y="17" width="20" height="3" rx="1.5" />
          <rect x="28" y="24" width="14" height="3" rx="1.5" />
          <rect x="28" y="31" width="18" height="2" rx="1" />
        </g>

        <g transform="translate(985, 245) scale(1.15)">
          <path d="M12 28 Q35 60, 58 28 Z" />
          <line x1="8" y1="28" x2="62" y2="28" />
          <line x1="26" y1="50" x2="44" y2="50" />
          <line x1="18" y1="36" x2="68" y2="10" />
          <line x1="22" y1="38" x2="66" y2="6" />
          <path d="M25 24 Q30 18, 35 24" />
          <path d="M35 24 Q40 18, 45 24" />
        </g>

        <g transform="translate(910, 140)">
          <circle cx="10" cy="10" r="4" strokeDasharray="3 2" />
        </g>
        <g transform="translate(875, 290)">
          <path d="M8 0 L10 5 L16 8 L10 11 L8 16 L6 11 L0 8 L6 5 Z" />
        </g>
        <g transform="translate(1060, 120)">
          <circle cx="6" cy="6" r="2" />
        </g>
        <g transform="translate(945, 305)">
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="24" cy="4" r="1.5" />
          <circle cx="40" cy="9" r="3" />
        </g>
      </svg>

      {/* ── Hand-Drawn Food & Campus Dining Doodles SVG (Mobile <= 640px) ── */}
      <svg
        className="hero-doodles-mobile"
        width="100%"
        height="100%"
        viewBox="0 0 380 340"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: opacity,
          stroke: stroke,
          fill: 'none',
          strokeWidth: strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      >
        {/* Top-Left: Coffee Mug with Steam */}
        <g transform="translate(14, 14) scale(0.85)">
          <path d="M10 24 C10 44, 42 44, 42 24 L42 14 L10 14 Z" />
          <path d="M42 18 C50 18, 50 30, 42 30" />
          <path d="M8 44 L44 44" />
          <path d="M18 9 Q20 4, 18 0" strokeDasharray="2 2" strokeWidth={strokeWidth} />
          <path d="M26 10 Q28 4, 26 -1" strokeDasharray="2 2" strokeWidth={strokeWidth} />
          <path d="M33 9 Q35 5, 33 1" strokeDasharray="2 2" strokeWidth={strokeWidth} />
        </g>

        {/* Top Center: Star burst */}
        <g transform="translate(178, 12) scale(0.65)">
          <line x1="20" y1="0" x2="20" y2="40" />
          <line x1="0" y1="20" x2="40" y2="20" />
          <line x1="6" y1="6" x2="34" y2="34" />
          <line x1="6" y1="34" x2="34" y2="6" />
        </g>

        {/* Top-Right: Pizza Slice */}
        <g transform="translate(310, 14) rotate(14) scale(0.85)">
          <path d="M20 10 L55 75 L5 75 Z" />
          <path d="M3 75 Q30 82, 57 75" strokeWidth={strokeWidth + 0.8} />
          <circle cx="28" cy="45" r="4.5" />
          <circle cx="20" cy="62" r="3.5" />
          <circle cx="38" cy="63" r="4" />
          <path d="M34 30 L36 34" />
        </g>

        {/* Bottom-Left: Burger with Sesame */}
        <g transform="translate(14, 260) scale(0.85)">
          <path d="M10 24 Q35 4, 60 24 Z" />
          <ellipse cx="25" cy="16" rx="1.6" ry="0.9" fill={stroke} />
          <ellipse cx="36" cy="13" rx="1.6" ry="0.9" fill={stroke} />
          <ellipse cx="44" cy="18" rx="1.6" ry="0.9" fill={stroke} />
          <path d="M8 27 Q15 23, 22 27 Q29 31, 36 27 Q43 23, 50 27 Q57 31, 62 27" />
          <rect x="10" y="31" width="50" height="6.5" rx="3.2" />
          <path d="M11 41 Q35 43, 59 41 L58 45 Q35 50, 12 45 Z" />
        </g>

        {/* Bottom Center: Flourish arrow */}
        <g transform="translate(170, 290) scale(0.65)">
          <path d="M10 25 Q30 5, 55 18 Q75 28, 90 8" />
          <polyline points="80 7, 92 8, 90 20" />
        </g>

        {/* Bottom-Right: Ramen Bowl with Chopsticks */}
        <g transform="translate(305, 260) scale(0.85)">
          <path d="M12 28 Q35 60, 58 28 Z" />
          <line x1="8" y1="28" x2="62" y2="28" />
          <line x1="26" y1="50" x2="44" y2="50" />
          <line x1="18" y1="36" x2="68" y2="10" />
          <line x1="22" y1="38" x2="66" y2="6" />
          <path d="M25 24 Q30 18, 35 24" />
          <path d="M35 24 Q40 18, 45 24" />
        </g>
      </svg>
    </div>
  );
}
