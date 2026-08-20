"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drift: småliv i landskabet (Medicine-princippet — bierne og sommerfuglene).
 *
 * Små objekter der svæver mellem clusters og krydser laggrænser med hver sin
 * parallax-hastighed, så tomrummet bliver tæthed i stedet for huller. Abstrakte
 * former nu (blækdråber, guldflager, ringe); Groks fritlagte motiver falder
 * ind som `kind: "img"` uden ombygning. Dekorativt: aria-hidden, ingen pointer-
 * events, statisk (men synligt) uden JS eller ved reduced motion.
 */
export type DriftItem = {
  kind: "blot" | "blot-ox" | "flake" | "ring" | "img";
  src?: string;
  size: number;
  left: string;
  top: string;
  speed?: number;
  opacity?: number;
  rotate?: number;
  mobile?: boolean;
};

const KIND_CLASS: Record<Exclude<DriftItem["kind"], "img">, string> = {
  blot: "drift-blot",
  "blot-ox": "drift-blot drift-blot--ox",
  flake: "drift-flake",
  ring: "drift-ring",
};

export function Drift({ items }: { items: DriftItem[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-drift-speed]").forEach((node) => {
        const speed = Number(node.dataset.driftSpeed || 0);
        if (!speed) return;
        gsap.fromTo(
          node,
          { yPercent: -speed * 10 },
          {
            yPercent: speed * 10,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.1 },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {items.map((item, i) => (
        <div
          key={i}
          data-drift-speed={item.speed ?? 0}
          className={`drift ${item.kind === "img" ? "" : KIND_CLASS[item.kind]} ${item.mobile ? "" : "hidden sm:block"}`}
          style={{
            width: item.size,
            height: item.size,
            left: item.left,
            top: item.top,
            opacity: item.opacity,
            transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined,
          }}
        >
          {item.kind === "img" && item.src ? (
            <Image src={item.src} alt="" width={item.size} height={item.size} loading="lazy" className="h-full w-full object-contain" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
