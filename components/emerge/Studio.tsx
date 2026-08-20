"use client";

import Image from "next/image";
import { site, studioShots } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Studio() {
  useEmerge("#studio [data-emerge]");

  return (
    <section id="studio">
      <div className="grid lg:grid-cols-2">
        <figure data-emerge className="work-print relative min-h-[88svh] overflow-hidden bg-[var(--void)]">
          <Image
            src={studioShots[0].src}
            alt={studioShots[0].alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <article data-emerge="deep" className="absolute inset-x-0 bottom-0 z-10 px-[var(--gutter)] pb-10 pt-24 bg-gradient-to-t from-[var(--void)] via-[var(--void)]/70 to-transparent">
            <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,84px)] font-medium leading-[1.05]">
              Blækket skriver allerede.
            </h2>
            <p className="mt-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
              Hvert træk er et løfte.
            </p>
            <p className="mt-5 max-w-[28ch] font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.16em] text-[var(--text-mute)]">
              {site.address.street}. Late nights. Permanent decisions.
            </p>
          </article>
        </figure>
        <div className="grid">
          <figure data-emerge className="work-print relative min-h-[44svh] overflow-hidden bg-[var(--void)]">
            <Image
              src={studioShots[1].src}
              alt={studioShots[1].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </figure>
          <figure data-emerge className="work-print relative min-h-[44svh] overflow-hidden bg-[var(--void)]">
            <Image
              src={studioShots[2].src}
              alt={studioShots[2].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
