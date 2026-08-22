import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackbookSignup } from "@/components/emerge/BlackbookSignup";

import { SkipLink } from "@/components/i18n/SkipLink";
export const metadata: Metadata = {
  alternates: { canonical: "/blackbook" },
  title: "Blackbook · Ink & Art",
  description:
    "Studiets inderste liste. Flash-drops og gæste-artister — du ser dem først. Ingen spam.",
};

const perks = [
  {
    t: "Flash først",
    d: "Nye motiver lander i din indbakke, før de bliver lagt op offentligt.",
  },
  {
    t: "Gæste-spots",
    d: "Besked når en gæste-artist kommer til byen — mens der stadig er tid tilbage.",
  },
  {
    t: "Stille",
    d: "Vi skriver kun når der er noget. Ingen nyhedsbrev-larm, ingen spam.",
  },
];

export default function BlackbookPage() {
  return (
    <>
      <SkipLink lang="da" />
    <main id="main" className="mx-auto max-w-[68ch] px-[var(--gutter)] py-24">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        <a href="/">← {site.name}</a>
      </p>
      <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        Blackbook
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium italic">
        Kom i bogen.
      </h1>
      <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
        Blackbook er studiets inderste liste. Vi sender ikke meget — men når der er
        et flash-drop eller en gæste-artist, ser du det først. Ingen spam, ingen larm.
      </p>

      <BlackbookSignup source="blackbook" />

      <section className="mt-14" aria-labelledby="blackbook-perks">
        <h2
          id="blackbook-perks"
          className="font-[family-name:var(--font-display)] text-[clamp(24px,4vw,36px)] font-medium"
        >
          Hvad du får
        </h2>
        <ol role="list" className="mt-6 list-none p-0">
          {perks.map((p, i) => (
            <li key={p.t} className="flex gap-4 border-t border-[var(--text)]/10 py-5">
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="m-0 text-[15px] uppercase tracking-[0.08em]">{p.t}</h3>
                <p className="mt-2 text-[var(--text-soft)]">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-12 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
        <a href="/flash" className="border-b border-[var(--gold)]/40 pb-1 text-[var(--gold)]">
          Se hvad der er på vej →
        </a>
      </p>
    </main>
    </>
  );
}
