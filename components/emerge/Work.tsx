"use client";

import Image from "next/image";
import { works } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Work() {
  useEmerge("#work [data-emerge]");

  return (
    <section id="work" className="px-[var(--gutter)] py-[clamp(48px,8vw,96px)]">
      <p className="mb-8 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        Selected work
      </p>
      <div className="columns-1 gap-0 sm:columns-2 lg:columns-3">
        {works.map((work, i) => (
          <figure
            key={work.src}
            data-emerge
            className={`relative mb-0 break-inside-avoid overflow-hidden ${
              i % 3 === 1 ? "sm:translate-y-8" : i % 3 === 2 ? "lg:-translate-y-6" : ""
            }`}
          >
            <Image
              src={work.src}
              alt={work.alt}
              width={1200}
              height={work.span === "wide" ? 720 : 1500}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full object-cover saturate-[.7] contrast-[1.12] brightness-[.82]"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
