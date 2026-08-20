"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { landscape, type Shot } from "@/lib/site";
import { useEmerge } from "./useEmerge";
import { Drift, type DriftItem } from "./Drift";

gsap.registerPlugin(ScrollTrigger);

function Print({ shot, sizes, fill }: { shot: Shot; sizes: string; fill?: boolean }) {
  if (fill) {
    return (
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        sizes={sizes}
        loading="lazy"
        className="object-cover"
      />
    );
  }
  return (
    <Image
      src={shot.src}
      alt={shot.alt}
      width={shot.width}
      height={shot.height}
      loading="lazy"
      sizes={sizes}
      className="h-auto w-full object-cover"
    />
  );
}

/* Collage-rytmen: prints i et cluster deler ikke længere én stiv grid-kant.
   Offsets forskyder dem lodret, indryk varierer skalaen, og hver figur driver
   i sin egen parallax-hastighed — kanterne holder op med at flugte, og griddet
   begynder at ligne en komposition. Deterministisk pr. indeks (ingen tilfældighed
   mellem builds). */
const COLLAGE_OFFSET = ["", "sm:mt-[9svh]", "sm:mt-[4svh] sm:px-[7%]", "sm:-mt-[3svh]", "sm:mt-[6svh] sm:px-[5%]", "sm:mt-[2svh]"];
const PAR_SPEED = [2.6, -2.2, 3.4, -1.8, 2.0, -2.8];

function useInnerParallax(scope: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-par]").forEach((node) => {
        const speed = Number(node.dataset.par || 0);
        if (!speed) return;
        gsap.fromTo(
          node,
          { yPercent: -Math.abs(speed) },
          {
            yPercent: Math.abs(speed),
            ease: "none",
            scrollTrigger: {
              trigger: node.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.9,
            },
          },
        );
        if (speed < 0) gsap.set(node, { yPercent: Math.abs(speed) });
      });
    }, el);
    return () => ctx.revert();
  }, [scope]);
}

function Band({ shot }: { shot: Shot }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = el.querySelector<HTMLElement>("[data-layer]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        layer,
        { yPercent: -10 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <figure
      ref={root}
      data-emerge="deep"
      className="work-print relative min-h-[68svh] overflow-hidden bg-[var(--void)]"
    >
      <div data-layer className="absolute inset-0 scale-[1.22]">
        <Print shot={shot} fill sizes="100vw" />
      </div>
    </figure>
  );
}

/* Småliv pr. cluster-indeks — objekterne bor i mellemrummene og krydser
   kanterne, så de "tomme" felter bliver en del af kompositionen. */
const DRIFT_SETS: DriftItem[][] = [
  [
    { kind: "blot", size: 190, left: "72%", top: "6%", speed: 2.4, opacity: 0.7 },
    { kind: "flake", size: 7, left: "56%", top: "22%", speed: -3, mobile: true },
    { kind: "ring", size: 46, left: "88%", top: "58%", speed: 1.8 },
    { kind: "flake", size: 5, left: "8%", top: "74%", speed: 2.2 },
  ],
  [
    { kind: "blot-ox", size: 240, left: "-4%", top: "12%", speed: -2, opacity: 0.45 },
    { kind: "flake", size: 6, left: "38%", top: "66%", speed: 3.2, mobile: true },
    { kind: "blot", size: 130, left: "84%", top: "78%", speed: 2.6, opacity: 0.6 },
  ],
  [
    { kind: "ring", size: 68, left: "12%", top: "10%", speed: -1.6 },
    { kind: "blot", size: 160, left: "64%", top: "84%", speed: 2.8, opacity: 0.65 },
    { kind: "flake", size: 8, left: "90%", top: "30%", speed: -2.4, mobile: true },
    { kind: "blot-ox", size: 110, left: "30%", top: "44%", speed: 1.4, opacity: 0.35 },
  ],
  [
    { kind: "flake", size: 6, left: "18%", top: "18%", speed: 2.8, mobile: true },
    { kind: "blot", size: 210, left: "78%", top: "40%", speed: -2.2, opacity: 0.55 },
    { kind: "ring", size: 38, left: "44%", top: "88%", speed: 1.6 },
  ],
];

export function Work() {
  const root = useRef<HTMLElement>(null);
  useEmerge("#work [data-emerge]");
  useInnerParallax(root);

  let clusterIndex = 0;

  return (
    <section id="work" ref={root} className="relative">
      <h2 className="sr-only">Work</h2>
      {landscape.map((row, i) => {
        if (row.kind === "band") {
          return <Band key={`band-${i}`} shot={row.shot} />;
        }
        if (row.kind === "pair") {
          return (
            <div key={`pair-${i}`} className="grid sm:grid-cols-2">
              {row.items.map((shot, j) => (
                <figure
                  key={shot.src}
                  data-emerge="deep"
                  className={`work-print relative min-h-[52svh] overflow-hidden bg-[var(--void)] ${shot.raw ? "work-print--raw" : ""}`}
                >
                  <div data-par={PAR_SPEED[j % PAR_SPEED.length]} className="absolute inset-[-6%]">
                    <Print shot={shot} fill sizes="(max-width: 640px) 100vw, 50vw" />
                  </div>
                </figure>
              ))}
            </div>
          );
        }
        const drift = DRIFT_SETS[clusterIndex % DRIFT_SETS.length];
        clusterIndex += 1;
        return (
          <div key={`cluster-${i}`} className="relative">
            <Drift items={drift} />
            <div className="columns-1 gap-0 sm:columns-2 lg:columns-3">
              {row.items.map((shot, j) => (
                <figure
                  key={shot.src}
                  data-emerge="deep"
                  className={`work-print relative mb-0 break-inside-avoid overflow-hidden ${COLLAGE_OFFSET[(i + j) % COLLAGE_OFFSET.length]} ${shot.raw ? "work-print--raw" : ""}`}
                >
                  <Print
                    shot={shot}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </figure>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
