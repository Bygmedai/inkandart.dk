"use client";

import Image from "next/image";
import { artists } from "@/lib/site";
import { useEmerge } from "./useEmerge";
import { Drift, type DriftItem } from "./Drift";

/* Portrættet står ikke længere alene i et tomt felt: navnet lapper ind over
   billedkanten, kanterne opløses organisk i mørket, og småliv fylder rummet
   omkring — kompositionen bruger tomheden i stedet for at efterlade den. */
const ARTIST_DRIFT: DriftItem[] = [
  { kind: "blot", size: 260, left: "68%", top: "4%", speed: -2, opacity: 0.6 },
  { kind: "flake", size: 7, left: "58%", top: "34%", speed: 2.6, mobile: true },
  { kind: "ring", size: 54, left: "80%", top: "66%", speed: 1.8 },
  { kind: "blot-ox", size: 170, left: "88%", top: "26%", speed: -1.4, opacity: 0.4 },
  { kind: "flake", size: 5, left: "10%", top: "88%", speed: 3, mobile: true },
];

export function Artists() {
  useEmerge("#artists [data-emerge]");

  return (
    <section id="artists" className="relative overflow-hidden px-[var(--gutter)] py-[clamp(56px,9vw,120px)]">
      <Drift items={ARTIST_DRIFT} />
      {artists.map((artist) => (
        <article
          id={`artist-${artist.slug}`}
          key={artist.slug}
          className="relative grid items-center gap-0 lg:grid-cols-[minmax(0,560px)_1fr]"
        >
          <div data-emerge="deep" className="portrait-mask relative aspect-[4/5] max-w-[560px]">
            <Image
              src={artist.portrait}
              alt={artist.name}
              fill
              sizes="(max-width: 820px) 100vw, 560px"
              className="object-cover object-[center_18%] saturate-[.7] contrast-[1.12] brightness-[.9] sepia-[.12] hue-rotate-[-6deg]"
            />
          </div>
          <div data-emerge className="relative z-10 pt-6 lg:pt-0 lg:-ml-[clamp(48px,7vw,120px)]">
            <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(56px,11vw,150px)] font-medium leading-[.92]">
              {artist.name}
            </h2>
            <p className="mt-4 max-w-[30ch] font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]/80">
              {artist.line}
            </p>
            <p className="mt-3 max-w-[34ch] font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-mute)]">
              Founder &amp; Artist · {`Larsbjørnsstræde 13`}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
