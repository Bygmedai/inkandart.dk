"use client";

import Image from "next/image";
import { works } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Work() {
  useEmerge("#work [data-emerge]");

  return (
    <section id="work" className="px-0 py-0 sm:px-[var(--gutter)] sm:py-[clamp(24px,4vw,48px)]">
      <h2 className="sr-only">Work</h2>
      <div className="columns-1 gap-0 sm:columns-2 lg:columns-3">
        {works.map((work) => (
          <figure
            key={work.src}
            data-emerge
            className="work-print relative mb-0 break-inside-avoid overflow-hidden"
          >
            <Image
              src={work.src}
              alt={work.alt}
              width={work.width}
              height={work.height}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full object-cover"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
