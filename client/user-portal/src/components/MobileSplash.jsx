import { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

const SPLASH_DURATION_MS = 1450;

export default function MobileSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const alreadyShown = sessionStorage.getItem('dine_mobile_splash_shown') === 'true';
    return isMobile && !alreadyShown;
  });

  useEffect(() => {
    if (!visible) return undefined;

    sessionStorage.setItem('dine_mobile_splash_shown', 'true');
    const timer = window.setTimeout(() => setVisible(false), SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="mobile-splash" role="status" aria-label="Loading Dine at Bennett">
      <div className="mobile-splash-glow" />
      <div className="mobile-splash-brand">
        <div className="mobile-splash-logo">
          <UtensilsCrossed size={30} strokeWidth={2.4} />
        </div>
        <div className="mobile-splash-wordmark">
          Dine<span>@Bennett</span>
        </div>
        <div className="mobile-splash-subtitle">Campus dining, made effortless</div>
      </div>
      <div className="mobile-splash-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
