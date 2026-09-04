"use client";

import { useEffect, useState } from "react";

const HERO_STILL = "/collab/chateau/chateau-hero-stol.png";
const HERO_LOOP = "/collab/chateau/chateau-loop.mp4";
const ALT = "Én stol i et lukket rum — Ink & Art × Chateau Motel";

/**
 * Hero med muted autoplay-loop. prefers-reduced-motion → kun still.
 * SSR og første paint viser still, så vi aldrig autoplayer uden samtykke
 * fra motion-præferencen.
 */
export function ChateauHero() {
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowMotion(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="rum-room__slot chateau-hero">
      {allowMotion ? (
        <video
          className="chateau-hero__media"
          src={HERO_LOOP}
          poster={HERO_STILL}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-label={ALT}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="chateau-hero__media" src={HERO_STILL} alt={ALT} />
      )}
    </div>
  );
}
