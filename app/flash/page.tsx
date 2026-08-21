import type { Metadata } from "next";
import { site } from "@/lib/site";
import { flash, SIZE_LABEL } from "@/lib/flash";
import { cartUrl, kr } from "@/lib/commerce";
import { BlackbookSignup } from "@/components/emerge/BlackbookSignup";

import { SkipLink } from "@/components/i18n/SkipLink";
export const metadata: Metadata = {
  alternates: { canonical: "/flash" },
  title: "Flash · Ink & Art",
  description:
    "Færdigtegnede motiver til fast pris — først til mølle. Flash-drops fra Ink & Art Copenhagen; medlemmer i Blackbook ser dem først.",
};

const howItDrops = [
  { t: "Fast pris", d: "Motivet er tegnet færdigt. Prisen står fast — ingen forhandling, ingen overraskelse." },
  { t: "Først til mølle", d: "Nogle motiver er one-off: sælges kun én gang. Er det taget, er det væk." },
  { t: "Medlemmer først", d: "Blackbook ser hvert drop før alle andre. Det er gratis at være med." },
];

export default function FlashPage() {
  const hasDrops = flash.length > 0;

  return (

    <>

      <SkipLink lang="da" />
    <main id="main" className="mx-auto max-w-[68ch] px-[var(--gutter)] py-24">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        <a href="/">← {site.name}</a>
      </p>
      <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        Flash
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium">
        Tag et der allerede findes.
      </h1>
      <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
        Flash er færdigtegnede motiver — tegnet af vores artister, klar til hud, til
        fast pris. Ikke alt skal bygges fra bunden; nogle mærker venter bare på den
        rette person.
      </p>

      {hasDrops ? (
        <section className="mt-12" aria-labelledby="flash-drops">
          <h2
            id="flash-drops"
            className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]"
          >
            I drop nu
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-6 p-0 sm:grid-cols-3">
            {flash.map((f) => {
              const sold = f.oneOff && f.claimed;
              return (
                <li key={f.id} className={`list-none ${sold ? "opacity-40" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.img}
                    alt={f.title}
                    className="w-full border border-[var(--text)]/10 bg-black/20"
                  />
                  <p className="mt-3 text-[13px] uppercase tracking-[0.08em]">{f.title}</p>
                  <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-mute)]">
                    {f.artist} · {SIZE_LABEL[f.size]} · {kr(f.priceKr)} kr
                    {f.oneOff ? " · one-off" : ""}
                  </p>
                  {sold ? (
                    <p className="mt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--oxblood)]">
                      Taget
                    </p>
                  ) : f.variantId ? (
                    <a
                      href={cartUrl(f.variantId)}
                      aria-label={`Køb ${f.title} — ${kr(f.priceKr)} kr`}
                      className="mt-3 inline-flex border border-[var(--gold)]/40 px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)] transition-colors hover:border-[var(--gold)]"
                    >
                      Tag den →
                    </a>
                  ) : (
                    <a
                      href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Reservér ${f.title} via WhatsApp (åbner i nyt vindue)`}
                      className="mt-3 inline-flex border border-[var(--text)]/25 px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--text-soft)] transition-colors hover:border-[var(--text)]/60"
                    >
                      Reservér →
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="mt-12 border border-[var(--text)]/15 p-7" aria-labelledby="flash-next">
          <p
            id="flash-next"
            className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]"
          >
            Næste drop er på vej
          </p>
          <p className="mt-4 max-w-[52ch] text-[var(--text-soft)]">
            Det første flash-drop lander her snart. Kom i <strong className="font-normal text-[var(--text)]">Blackbook</strong> — så
            ser du motiverne før alle andre og kan tage dit, før nogen anden gør. Gratis, ingen spam.
          </p>
          <BlackbookSignup source="flash" />
        </section>
      )}

      <section className="mt-12" aria-labelledby="flash-how">
        <h2
          id="flash-how"
          className="font-[family-name:var(--font-display)] text-[clamp(24px,4vw,36px)] font-medium"
        >
          Sådan virker et drop
        </h2>
        <ol role="list" className="mt-6 list-none p-0">
          {howItDrops.map((step, i) => (
            <li key={step.t} className="flex gap-4 border-t border-[var(--text)]/10 py-5">
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="m-0 text-[15px] uppercase tracking-[0.08em]">{step.t}</h3>
                <p className="mt-2 text-[var(--text-soft)]">{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-12 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
        <a href="/gavekort" className="border-b border-[var(--gold)]/40 pb-1 text-[var(--gold)]">
          Gavekort →
        </a>
      </p>
    </main>
    </>
  );
}
