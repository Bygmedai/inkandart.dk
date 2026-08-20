"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { landscape, type Shot } from "@/lib/site";
import { useEmerge } from "./useEmerge";

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
      data-emerge
      className="work-print relative min-h-[68svh] overflow-hidden bg-[var(--void)]"
    >
      <div data-layer className="absolute inset-0 scale-[1.22]">
        <Print shot={shot} fill sizes="100vw" />
      </div>
    </figure>
  );
}

export function Work() {
  useEmerge("#work [data-emerge]");

  return (
    <section id="work">
      <h2 className="sr-only">Work</h2>
      {landscape.map((row, i) => {
        if (row.kind === "band") {
          return <Band key={`band-${i}`} shot={row.shot} />;
        }
        if (row.kind === "pair") {
          return (
            <div key={`pair-${i}`} className="grid sm:grid-cols-2">
              {row.items.map((shot) => (
                <figure
                  key={shot.src}
                  data-emerge
                  className="work-print relative min-h-[52svh] overflow-hidden bg-[var(--void)]"
                >
                  <Print shot={shot} fill sizes="(max-width: 640px) 100vw, 50vw" />
                </figure>
              ))}
            </div>
          );
        }
        return (
          <div key={`cluster-${i}`} className="columns-1 gap-0 sm:columns-2 lg:columns-3">
            {row.items.map((shot) => (
              <figure
                key={shot.src}
                data-emerge
                className="work-print relative mb-0 break-inside-avoid overflow-hidden"
              >
                <Print
                  shot={shot}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </figure>
            ))}
          </div>
        );
      })}
    </section>
  );
}
