import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SIZE_LABEL } from "@/lib/flash";
import { hentFlashDrop } from "@/lib/flash-drop";
import { cartUrl, kr } from "@/lib/commerce";
import { BlackbookSignup } from "@/components/emerge/BlackbookSignup";
import { Fredagsflash } from "@/components/emerge/Fredagsflash";
import { LangSwitch } from "@/components/i18n/LangSwitch";
import { SkipLink } from "@/components/i18n/SkipLink";
import { alternates } from "@/lib/i18n";
import { Masthead } from "@/components/brand/Masthead";

/**
 * /en/flash — den engelske udgave (Villy, #245 A4).
 *
 * Flash var den eneste emerge-flade der stadig 308'ede til dansk. Sitet har
 * 11 % besøg fra USA og 5 % fra Tyskland (Vercel, 30 dage, Harukis måling).
 *
 * VIGTIGT: redirects køres FØR routing i Next. Blev `/en/flash`-reglen
 * stående i lib/redirects.ts, ville denne fil aldrig kunne nås — siden ville
 * findes og alligevel ikke. Reglen ryger ud i samme commit, og testen i
 * tests/redirects.test.mjs håndhæver parret (samme fælde som /en/walk-in).
 *
 * Copy'en er min oversættelse, ikke husets egen engelske stemme —
 * [ORD-TJEK Steven]. Den lover det samme som den danske og intet mere;
 * priser og tal står ordret, fordi en tolkning af en pris er en fejl.
 *
 * Motiverne kommer fra samme kilde som dansk, og dommen om hvad der må
 * vises er sprogfri (lib/lager-regler.ts): et motiv der ikke kan bevise at
 * det er ét stykke, vises på ingen af sprogene.
 */

export const metadata: Metadata = {
  alternates: { ...alternates("/flash"), canonical: "/en/flash" },
  title: "Flash · Ink & Art",
  description:
    "Finished designs at a fixed price — first come, first served. Flash drops from Ink & Art Copenhagen; join the list and see them first.",
};

const howItDrops = [
  { t: "Fixed price", d: "The design is already drawn. The price is fixed — no haggling, no surprises." },
  { t: "First come, first served", d: "Some designs are one-off: sold once only. If it is taken, it is gone." },
  { t: "The list sees it first", d: "Everyone on the list sees every drop before anyone else. It is free to join." },
];

export default async function FlashPageEn() {
  const flash = await hentFlashDrop();
  const hasDrops = flash.length > 0;

  return (
    <>
      <SkipLink lang="en" />
      <main id="main" lang="en" className="mx-auto max-w-[68ch] px-[var(--gutter)] py-24">
        <Masthead lang="en" />
        <LangSwitch lang="en" path="/flash" />
        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Flash
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium">
          Take one that already exists.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
          Flash are finished designs — drawn by our artists, ready for skin, at a
          fixed price. Not everything has to be built from scratch; some marks are
          just waiting for the right person.
        </p>

        {hasDrops ? (
          <section className="mt-12" aria-labelledby="flash-drops">
            <h2
              id="flash-drops"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]"
            >
              Dropping now
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
                      {f.artist ? `${f.artist} · ` : ""}
                      {f.size ? `${SIZE_LABEL[f.size]} · ` : ""}
                      {f.priceKr > 0 ? `${kr(f.priceKr)} kr` : ""}
                      {f.oneOff && f.priceKr > 0 ? " · one-off" : ""}
                    </p>
                    {sold ? (
                      <p className="mt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--oxblood)]">
                        Taken
                      </p>
                    ) : f.variantId ? (
                      <a
                        href={cartUrl(f.variantId)}
                        aria-label={`Buy ${f.title} — ${kr(f.priceKr)} kr`}
                        data-hz-handle={f.id}
                        data-hz-pris={f.priceKr}
                        className="mt-3 inline-flex border border-[var(--gold)]/40 px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)] transition-colors hover:border-[var(--gold)]"
                      >
                        Take it →
                      </a>
                    ) : (
                      <a
                        href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Reserve ${f.title} on WhatsApp (opens in a new window)`}
                        className="mt-3 inline-flex border border-[var(--text)]/25 px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--text-soft)] transition-colors hover:border-[var(--text)]/60"
                      >
                        Reserve →
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
              Next drop is on its way
            </p>
            <p className="mt-4 max-w-[52ch] text-[var(--text-soft)]">
              The first flash drop lands here soon.{" "}
              <strong className="font-normal text-[var(--text)]">Join the list</strong> — you
              will see the designs before anyone else, and can take yours before someone
              else does. Free, no spam.
            </p>
            <BlackbookSignup source="flash" lang="en" />
          </section>
        )}

        {hasDrops ? (
          <section className="mt-12 border border-[var(--text)]/15 p-7" aria-labelledby="flash-blackbook">
            <p
              id="flash-blackbook"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]"
            >
              Next drop, before anyone else
            </p>
            <p className="mt-4 max-w-[52ch] text-[var(--text-soft)]">
              The designs here are first come, first served. On{" "}
              <strong className="font-normal text-[var(--text)]">the list</strong> you see
              the next drop before anyone else — and can take yours before someone else
              does. Free, no spam.
            </p>
            <BlackbookSignup source="flash" lang="en" />
          </section>
        ) : null}

        <Fredagsflash lang="en" />

        <section className="mt-12" aria-labelledby="flash-how">
          <h2
            id="flash-how"
            className="font-[family-name:var(--font-display)] text-[clamp(24px,4vw,36px)] font-medium"
          >
            How a drop works
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

        {/* /en/gavekort svarer 410 indtil ejeren porterer den (Groks lane).
            Et link til 410 er en død handling — hellere dansk end ingenting,
            samme kald som dørene på /en/shop. */}
        <p className="mt-12 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
          <a href="/gavekort" className="border-b border-[var(--gold)]/40 pb-1 text-[var(--gold)]">
            Gift cards →
          </a>
        </p>
      </main>
    </>
  );
}
