"use client";

import { site } from "@/lib/site";
import { useEmerge } from "./useEmerge";

export function Studio() {
  useEmerge("#studio [data-emerge]");

  return (
    <section id="studio" className="px-[var(--gutter)] py-[clamp(72px,12vw,140px)]">
      <article data-emerge className="max-w-[16ch]">
        <h2 className="m-0 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,84px)] font-medium leading-[1.05]">
          Blækket skriver allerede.
        </h2>
        <p className="mt-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          Hvert træk er et løfte.
        </p>
        <p className="mt-10 max-w-[28ch] font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.16em] text-[var(--text-mute)]">
          {site.address.street}.
          <br />
          Late nights. Permanent decisions.
        </p>
      </article>
    </section>
  );
}
