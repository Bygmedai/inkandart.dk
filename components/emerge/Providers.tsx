"use client";

import { ReactLenis } from "lenis/react";

/**
 * Kun Lenis (den designede scroll-følelse). GSAP + ScrollTrigger blev
 * registreret og opdateret pr. tick her, men INTET i træet importerer dem —
 * SceneV05's motor er selvbygget (rAF + scroll). Fjernet i Haruki S566
 * perf-pass: −~45 KB script og nul dødt arbejde pr. frame. Skal ScrollTrigger
 * ind igen, hører registreringen til dér hvor den faktisk bruges.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.15, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
