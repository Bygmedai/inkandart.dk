import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SHOP_PRINTS, PIERCINGS, FLASH_DEPOSITS, cartUrl, kr } from "@/lib/commerce";
import { DepositumRaekke } from "@/components/emerge/DepositumRaekke";
import { alternates, t } from "@/lib/i18n";
import { KerbReservation } from "@/components/emerge/KerbReservation";
import { LangSwitch } from "@/components/i18n/LangSwitch";

import { SkipLink } from "@/components/i18n/SkipLink";
import { Masthead } from "@/components/brand/Masthead";
/**
 * /shop — «Gaden sælger.» Kataloget i Emerge-sproget (Villy, P1 — vej B).
 *
 * Shoppen er foldet ind i hub'en: dette er oversigten, og de flader der
 * allerede findes (/gavekort, /walk-in, /flash) er dørene — vi genbygger dem
 * ikke, vi peger på dem. Det der ikke har en side endnu, bor her: kridtet
 * (reservationerne, min komponent) og prints-væggen.
 *
 * Rails §4: de tre prints er drafts i Shopify og priserne afventer Steven —
 * derfor viser væggen dem som «snart», uden købshandling. En død knap er
 * værre end ingen. Når P3 gør dem levende (live: true + variantId i
 * commerce.ts), flipper kortene selv til køb — copy'en her skal ikke røres.
 */
export const metadata: Metadata = {
  alternates: { ...alternates("/shop"), canonical: "/shop" },
  title: "Gaden sælger · Ink & Art",
  description:
    "Gavekort, walk-in, flash, reservationer og husets prints — alt det gaden sælger, samlet ét sted. Ink & Art Copenhagen, Larsbjørnsstræde 13.",
};

/* Dørene: fladerne der allerede findes. Vi peger, vi genbygger ikke. */
const DOORS = [
  {
    href: "/gavekort",
    label: "Gavekort",
    linje: "Giv blæk videre. Fem beløb, sendes eller printes.",
    tilt: -1.4,
  },
  {
    href: "/walk-in",
    label: "Walk-in",
    linje: "To små. I aften. 900,- — ingen booking.",
    tilt: 1.1,
  },
  {
    href: "/flash",
    label: "Flash",
    linje: "Færdigtegnede motiver til fast pris. Først til mølle.",
    tilt: -0.8,
  },
] as const;

export default function ShopPage() {
  const c = t("da").shop;

  return (
    <>
      <SkipLink lang="da" />
    <main id="main" className="gade">
      <div className="gade__inner">
        <Masthead lang="da">
          <LangSwitch lang="da" path="/shop" />
        </Masthead>

        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Shop
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium italic">
          Gaden sælger.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
          Alt herunder betales hos Shopify — MobilePay, kort eller wallet.
          Blækket betales i studiet, {site.address.street}.
        </p>

        {/* ── Dørene ─────────────────────────────────────────────────── */}
        <ul className="gade__doors" role="list">
          {DOORS.map((d) => (
            <li key={d.href}>
              <a
                className="gade__door"
                href={d.href}
                style={{ transform: `rotate(${d.tilt}deg)` }}
              >
                <span className="gade__door-label">{d.label}</span>
                <span className="gade__door-linje">{d.linje}</span>
                <span className="gade__door-pil" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* ── Piercing: levende varer der ikke stod nogen steder ──────── */}
        <section className="gade__afsnit" aria-label={c.piercing.label}>
          <p className="gade__afsnit-label">{c.piercing.label}</p>
          <h2 className="gade__afsnit-rubrik">{c.piercing.title}</h2>
          <p className="mt-3 max-w-[54ch] text-[var(--text-soft)]">
            {c.piercing.intro}
          </p>
          <DepositumRaekke
            varer={PIERCINGS}
            sted={c.piercing.slots}
            ariaSted={c.piercing.ariaSlots}
            koeb={c.piercing.koeb}
            aria={c.piercing.aria}
          />
        </section>

        {/* ── Flash-tider: samme handling, andet sted ─────────────────── */}
        <section className="gade__afsnit" aria-label={c.flashDepositum.label}>
          <p className="gade__afsnit-label">{c.flashDepositum.label}</p>
          <h2 className="gade__afsnit-rubrik">{c.flashDepositum.title}</h2>
          <p className="mt-3 max-w-[54ch] text-[var(--text-soft)]">
            {c.flashDepositum.intro}
          </p>
          <DepositumRaekke
            varer={FLASH_DEPOSITS}
            sted={c.flashDepositum.slots}
            ariaSted={c.flashDepositum.ariaSlots}
            koeb={c.flashDepositum.koeb}
            aria={c.flashDepositum.aria}
          />
        </section>

        {/* ── Kridtet: reservationerne (genbrug, min komponent) ───────── */}
        <section className="gade__afsnit" aria-label="Reservationer">
          <KerbReservation />
        </section>

        {/* ── Prints-væggen ────────────────────────────────────────────
             Hele blokken læser fra ordbogen. Den gjorde den ikke før: rubrikken
             blev flyttet til `c.wallTitle`, mens etiket, intro, «snart» og noten
             blev stående hårdkodet — så da varerne gik live, sagde den engelske
             side «On the wall» og den danske stadig «De hænger her, når de er
             klar». To sprog må ikke kunne drifte fra hinanden ét ord ad gangen. */}
        <section className="gade__afsnit" aria-label={c.wallLabel}>
          <p className="gade__afsnit-label">{c.wallLabel}</p>
          <h2 className="gade__afsnit-rubrik">{c.wallTitle}</h2>
          <p className="mt-3 max-w-[54ch] text-[var(--text-soft)]">{c.wallIntro}</p>
          <ul className="gade__prints" role="list">
            {SHOP_PRINTS.map((p, i) => (
              <li
                key={p.handle}
                className="gade__print"
                style={{ transform: `rotate(${i % 2 === 0 ? -1.2 : 0.9}deg)` }}
              >
                <span className="gade__print-navn">{p.navn}</span>
                <span className="gade__print-linje">{p.linje}</span>
                {p.live && p.variantId ? (
                  <a
                    className="gade__print-koeb"
                    href={cartUrl(p.variantId)}
                    aria-label={c.buyAria(p.navn, kr(p.kr))}
                    data-hz-handle={p.handle}
                    data-hz-pris={p.kr}
                  >
                    {kr(p.kr)},- →
                  </a>
                ) : (
                  <span className="gade__print-snart">{c.soon}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="gade__note">
            {c.note} <a href="/blackbook">{c.noteLink}</a>
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
