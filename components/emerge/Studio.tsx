"use client";

import { site } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Studio() {
  useEmerge("#studio [data-emerge]");

  return (
    <section id="studio" className="px-[var(--gutter)] py-[clamp(72px,12vw,140px)]">
      <article data-emerge className="max-w-[18ch]">
        <p className="mb-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          The room
        </p>
        <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,84px)] font-medium leading-[1.05]">
          Blækket skriver allerede.
        </h2>
        <p className="mt-5 max-w-[38ch] text-[length:clamp(16px,1.6vw,19px)] italic text-[var(--gold)]">
          Hvert træk er et løfte.
        </p>
        <p className="mt-8 max-w-[42ch] text-[var(--text-soft)]">
          {site.address.street}. Et rum hvor linjen bliver. Ingen pitch. Ingen kø. Kun det der bliver på huden.
        </p>
      </article>
    </section>
  );
}
