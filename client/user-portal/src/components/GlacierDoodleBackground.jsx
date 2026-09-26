import React from 'react';

/**
 * GlacierDoodleBackground
 * Renders the ambient background with hand-drawn food & campus dining doodles.
 * Supports:
 * - 'dark' (Glacier near-black #020106 with icy cyan sheens)
 * - 'light' (Our official palette: Floral White #FFFBF4 with Bone & Olive Drab accents)
 */
export default function GlacierDoodleBackground({
  theme = 'light',
  opacity,
  strokeWidth = 2.4,
}) {
  const isDark = theme === 'dark';
  const resolvedOpacity = opacity !== undefined ? opacity : (isDark ? 0.35 : 0.65);
  const resolvedStroke = isDark ? '#D9F6FF' : '#11120D';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: isDark ? '#020106' : '#FFFBF4',
      }}
      aria-hidden="true"
    >
      {/* ── 1. Radial Glows ── */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '15%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(184, 231, 245, 0.09) 0%, rgba(255, 255, 255, 0.04) 35%, transparent 70%)'
            : 'radial-gradient(circle, rgba(216, 207, 188, 0.4) 0%, rgba(255, 251, 244, 0.6) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(111, 175, 196, 0.06) 0%, rgba(8, 7, 13, 0.8) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(86, 84, 73, 0.08) 0%, rgba(255, 251, 244, 0.8) 50%, transparent 75%)',
          filter: 'blur(70px)',
        }}
      />

      {/* ── 2. Top-Right Light Beam ── */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '10%',
          width: '420px',
          height: '140%',
          transform: 'rotate(-28deg)',
          background: isDark
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(184, 231, 245, 0.08) 25%, rgba(255, 255, 255, 0.02) 60%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(216, 207, 188, 0.28) 0%, rgba(246, 242, 234, 0.15) 35%, transparent 100%)',
          filter: 'blur(45px)',
          opacity: isDark ? 0.85 : 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '25%',
          width: '180px',
          height: '110%',
          transform: 'rotate(-28deg)',
          background: isDark
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(216, 207, 188, 0.15) 40%, transparent 100%)',
          filter: 'blur(30px)',
          opacity: isDark ? 0.65 : 0.5,
        }}
      />

      {/* ── 3. Desktop Hand-Drawn SVG Doodles (Widescreen >= 641px) ── */}
      <svg
        className="doodles-desktop"
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: resolvedOpacity,
          stroke: resolvedStroke,
          fill: 'none',
          strokeWidth: strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      >
        {/* DOODLE: Coffee Mug with Steam (Top Left) */}
        <g transform="translate(140, 110) scale(1.15)">
          <path d="M10 25 C10 48, 45 48, 45 25 L45 15 L10 15 Z" />
          <path d="M45 20 C53 20, 53 32, 45 32" />
          <path d="M8 48 L47 48" />
          <path d="M20 10 Q22 5, 20 0" strokeDasharray="1 1" />
          <path d="M28 11 Q30 4, 28 -1" strokeDasharray="1 1" />
          <path d="M35 10 Q37 6, 35 1" strokeDasharray="1 1" />
        </g>

        {/* DOODLE: Sparkle Star (Top Left Accent) */}
        <g transform="translate(260, 90) scale(0.9)">
          <path d="M20 0 Q20 20, 0 20 Q20 20, 20 40 Q20 20, 40 20 Q20 20, 20 0 Z" fill={isDark ? "rgba(184,231,245,0.3)" : "rgba(17,18,13,0.22)"} />
        </g>

        {/* DOODLE: Pizza Slice (Top Right) */}
        <g transform="translate(1180, 120) rotate(15) scale(1.1)">
          <path d="M20 10 L55 75 L5 75 Z" />
          <path d="M3 75 Q30 82, 57 75" strokeWidth={strokeWidth + 0.8} />
          <circle cx="28" cy="45" r="4.5" />
          <circle cx="20" cy="62" r="3.5" />
          <circle cx="38" cy="63" r="4" />
          <path d="M34 30 L36 34" />
        </g>

        {/* DOODLE: Star Burst (Top Right) */}
        <g transform="translate(1320, 240) scale(0.8)">
          <line x1="20" y1="0" x2="20" y2="40" />
          <line x1="0" y1="20" x2="40" y2="20" />
          <line x1="6" y1="6" x2="34" y2="34" />
          <line x1="6" y1="34" x2="34" y2="6" />
        </g>

        {/* DOODLE: Crossed Fork & Knife (Mid Left) */}
        <g transform="translate(90, 360) scale(1.1)">
          <line x1="12" y1="10" x2="48" y2="65" />
          <path d="M12 10 L8 16 Q18 24, 24 16 L20 10" />
          <line x1="16" y1="12" x2="16" y2="18" />
          <line x1="48" y1="10" x2="12" y2="65" />
          <path d="M48 10 Q38 18, 40 28 L45 28 Z" />
        </g>

        {/* DOODLE: Burger with bun & seeds (Bottom Left) */}
        <g transform="translate(160, 640) scale(1.15)">
          <path d="M10 26 Q35 5, 60 26 Z" />
          <ellipse cx="26" cy="18" rx="1.5" ry="0.8" />
          <ellipse cx="37" cy="15" rx="1.5" ry="0.8" />
          <ellipse cx="45" cy="20" rx="1.5" ry="0.8" />
          <path d="M8 29 Q15 25, 22 29 Q29 33, 36 29 Q43 25, 50 29 Q57 33, 62 29" />
          <rect x="10" y="34" width="50" height="7" rx="3.5" />
          <path d="M11 44 Q35 46, 59 44 L58 48 Q35 54, 12 48 Z" />
        </g>

        {/* DOODLE: Soft curly arrow / flourish (Left Bottom) */}
        <g transform="translate(300, 720) scale(0.85)">
          <path d="M10 30 Q30 5, 60 20 Q80 32, 95 10" />
          <polyline points="85 8, 97 10, 96 22" />
        </g>

        {/* DOODLE: Graduation Cap / Scholar (Mid Right) */}
        <g transform="translate(1220, 420) scale(1.1)">
          <polygon points="35,10 65,22 35,34 5,22" />
          <path d="M16 28 L16 42 Q35 50, 54 42 L54 28" />
          <path d="M60 23 L68 36 L68 45" />
          <circle cx="68" cy="46" r="2" fill={isDark ? "#D9F6FF" : "#11120D"} />
        </g>

        {/* DOODLE: Noodle Bowl with Chopsticks (Bottom Right) */}
        <g transform="translate(1160, 660) scale(1.1)">
          <path d="M12 28 Q35 60, 58 28 Z" />
          <line x1="8" y1="28" x2="62" y2="28" />
          <line x1="26" y1="50" x2="44" y2="50" />
          <line x1="18" y1="36" x2="68" y2="10" />
          <line x1="22" y1="38" x2="66" y2="6" />
          <path d="M25 24 Q30 18, 35 24" />
          <path d="M35 24 Q40 18, 45 24" />
        </g>

        {/* DOODLE: Digital Pass / QR ticket doodle (Right side near center) */}
        <g transform="translate(1280, 550) rotate(-10) scale(0.95)">
          <rect x="10" y="10" width="46" height="32" rx="4" />
          <line x1="22" y1="10" x2="22" y2="42" strokeDasharray="2 2" />
          <circle cx="16" cy="26" r="3" />
          <rect x="28" y="17" width="20" height="3" rx="1.5" />
          <rect x="28" y="24" width="14" height="3" rx="1.5" />
          <rect x="28" y="31" width="18" height="2" rx="1" />
        </g>

        {/* DOODLE: Small Decorative Sparkles & Rings */}
        <g transform="translate(420, 180)">
          <circle cx="10" cy="10" r="3" strokeDasharray="2 2" />
        </g>
        <g transform="translate(1020, 180)">
          <circle cx="10" cy="10" r="4" strokeDasharray="3 2" />
        </g>
        <g transform="translate(380, 580)">
          <path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" />
        </g>
        <g transform="translate(1040, 520)">
          <path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" />
        </g>
        <g transform="translate(520, 780)">
          <circle cx="8" cy="8" r="2" />
          <circle cx="28" cy="12" r="3.5" />
          <circle cx="48" cy="6" r="1.5" />
        </g>
        <g transform="translate(920, 790)">
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="28" cy="4" r="1.5" />
          <circle cx="48" cy="10" r="3" />
        </g>
      </svg>

      {/* ── 4. Mobile Hand-Drawn SVG Doodles (Phones <= 640px) ── */}
      <svg
        className="doodles-mobile"
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: resolvedOpacity,
          stroke: resolvedStroke,
          fill: 'none',
          strokeWidth: strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      >
        {/* TOP ZONE: Coffee Mug with Steam (Top Left) */}
        <g transform="translate(20, 24) scale(0.95)">
          <path d="M10 25 C10 48, 45 48, 45 25 L45 15 L10 15 Z" />
          <path d="M45 20 C53 20, 53 32, 45 32" />
          <path d="M8 48 L47 48" />
          <path d="M20 10 Q22 5, 20 0" strokeDasharray="1 1" />
          <path d="M28 11 Q30 4, 28 -1" strokeDasharray="1 1" />
          <path d="M35 10 Q37 6, 35 1" strokeDasharray="1 1" />
        </g>

        {/* TOP ZONE: Star Burst & Ring (Top Center) */}
        <g transform="translate(185, 20) scale(0.7)">
          <line x1="20" y1="0" x2="20" y2="40" />
          <line x1="0" y1="20" x2="40" y2="20" />
          <line x1="6" y1="6" x2="34" y2="34" />
          <line x1="6" y1="34" x2="34" y2="6" />
        </g>
        <g transform="translate(130, 60)">
          <circle cx="8" cy="8" r="3" strokeDasharray="2 2" />
        </g>

        {/* TOP ZONE: Pizza Slice with Pepperoni (Top Right) */}
        <g transform="translate(305, 22) rotate(14) scale(0.92)">
          <path d="M20 10 L55 75 L5 75 Z" />
          <path d="M3 75 Q30 82, 57 75" strokeWidth={strokeWidth + 0.8} />
          <circle cx="28" cy="45" r="4.5" />
          <circle cx="20" cy="62" r="3.5" />
          <circle cx="38" cy="63" r="4" />
          <path d="M34 30 L36 34" />
        </g>

        {/* SIDE ACCENTS: Peeking near the card borders */}
        {/* Left side: Crossed Fork & Knife */}
        <g transform="translate(4, 380) scale(0.75)">
          <line x1="12" y1="10" x2="48" y2="65" />
          <path d="M12 10 L8 16 Q18 24, 24 16 L20 10" />
          <line x1="16" y1="12" x2="16" y2="18" />
          <line x1="48" y1="10" x2="12" y2="65" />
          <path d="M48 10 Q38 18, 40 28 L45 28 Z" />
        </g>

        {/* Right side: Graduation Cap */}
        <g transform="translate(330, 375) scale(0.8)">
          <polygon points="35,10 65,22 35,34 5,22" />
          <path d="M16 28 L16 42 Q35 50, 54 42 L54 28" />
          <path d="M60 23 L68 36 L68 45" />
          <circle cx="68" cy="46" r="2" fill={isDark ? "#D9F6FF" : "#11120D"} />
        </g>

        {/* Right side accent: Sparkle */}
        <g transform="translate(345, 240) scale(0.75)">
          <path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" />
        </g>

        {/* Left side accent: Sparkle Star */}
        <g transform="translate(14, 220) scale(0.7)">
          <path d="M20 0 Q20 20, 0 20 Q20 20, 20 40 Q20 20, 40 20 Q20 20, 20 0 Z" fill={isDark ? "rgba(184,231,245,0.3)" : "rgba(17,18,13,0.22)"} />
        </g>

        {/* BOTTOM ZONE: Burger with Sesame & Bun (Bottom Left) */}
        <g transform="translate(20, 715) scale(0.95)">
          <path d="M10 26 Q35 5, 60 26 Z" />
          <ellipse cx="26" cy="18" rx="1.5" ry="0.8" />
          <ellipse cx="37" cy="15" rx="1.5" ry="0.8" />
          <ellipse cx="45" cy="20" rx="1.5" ry="0.8" />
          <path d="M8 29 Q15 25, 22 29 Q29 33, 36 29 Q43 25, 50 29 Q57 33, 62 29" />
          <rect x="10" y="34" width="50" height="7" rx="3.5" />
          <path d="M11 44 Q35 46, 59 44 L58 48 Q35 54, 12 48 Z" />
        </g>

        {/* BOTTOM ZONE: Flourish Arrow & Accent dots (Bottom Center) */}
        <g transform="translate(145, 750) scale(0.75)">
          <path d="M10 30 Q30 5, 60 20 Q80 32, 95 10" />
          <polyline points="85 8, 97 10, 96 22" />
        </g>
        <g transform="translate(180, 725)">
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="22" cy="10" r="1.5" />
        </g>

        {/* BOTTOM ZONE: Ramen Bowl with Chopsticks (Bottom Right) */}
        <g transform="translate(295, 715) scale(0.95)">
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
