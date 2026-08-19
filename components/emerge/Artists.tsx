"use client";

import Image from "next/image";
import { artists } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Artists() {
  useEmerge("#artists [data-emerge]");

  return (
    <section id="artists" className="px-[var(--gutter)] py-[clamp(72px,12vw,140px)]">
      <p className="mb-6 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        The hands
      </p>
      <div className="grid max-w-[520px] gap-10">
        {artists.map((artist) => (
          <article id={`artist-${artist.slug}`} key={artist.slug} data-emerge className="bg-[var(--skin)]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={artist.portrait}
                alt={artist.name}
                fill
                sizes="(max-width: 820px) 100vw, 520px"
                className="object-cover object-[center_18%] saturate-[.75] contrast-[1.08] brightness-[.88]"
              />
            </div>
            <div className="px-6 py-6">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--text-mute)]">
                {artist.role}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(32px,5vw,52px)] font-medium leading-none">
                {artist.name}
              </h2>
              <p className="mt-3 max-w-[36ch] text-[var(--text-soft)]">{artist.line}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
