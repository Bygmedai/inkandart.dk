"use client";

import Image from "next/image";
import { site, studioShots } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Studio() {
  useEmerge("#studio [data-emerge]");

  return (
    <section id="studio">
      <div className="grid lg:grid-cols-2">
        <figure data-emerge className="work-print relative min-h-[70svh] overflow-hidden bg-[var(--void)]">
          <Image
            src={studioShots[0].src}
            alt={studioShots[0].alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </figure>
        <div className="grid">
          <figure data-emerge className="work-print relative min-h-[42svh] overflow-hidden bg-[var(--void)]">
            <Image
              src={studioShots[1].src}
              alt={studioShots[1].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </figure>
          <article data-emerge className="flex flex-col justify-end px-[var(--gutter)] py-[clamp(40px,7vw,72px)]">
            <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,84px)] font-medium leading-[1.05]">
              Blækket skriver allerede.
            </h2>
            <p className="mt-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
              Hvert træk er et løfte.
            </p>
            <p className="mt-8 max-w-[28ch] font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.16em] text-[var(--text-mute)]">
              {site.address.street}.
              <br />
              Late nights. Permanent decisions.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
