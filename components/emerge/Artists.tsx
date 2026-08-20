"use client";

import Image from "next/image";
import { artists } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Artists() {
  useEmerge("#artists [data-emerge]");

  return (
    <section id="artists" className="px-[var(--gutter)] py-[clamp(72px,12vw,140px)]">
      <div className="grid max-w-[420px] gap-10">
        {artists.map((artist) => (
          <article id={`artist-${artist.slug}`} key={artist.slug} data-emerge>
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--void)]">
              <Image
                src={artist.portrait}
                alt={artist.name}
                fill
                sizes="(max-width: 820px) 100vw, 420px"
                className="object-cover object-[center_20%] grayscale contrast-[1.35] brightness-[.42] saturate-0"
              />
              <div className="pointer-events-none absolute inset-0 bg-[var(--void)]/45 mix-blend-multiply" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--void)] via-[var(--void)]/20 to-[var(--void)]/55" />
            </div>
            <div className="pt-5">
              <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(32px,5vw,52px)] font-medium leading-none">
                {artist.name}
              </h2>
              <p className="mt-3 max-w-[28ch] font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]/80">
                {artist.line}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
