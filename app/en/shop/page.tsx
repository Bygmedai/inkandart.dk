import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SHOP_PRINTS, PIERCINGS, FLASH_DEPOSITS, cartUrl, kr } from "@/lib/commerce";
import { DepositumRaekke } from "@/components/emerge/DepositumRaekke";
import { KerbReservation } from "@/components/emerge/KerbReservation";
import { LangSwitch } from "@/components/i18n/LangSwitch";
import { SkipLink } from "@/components/i18n/SkipLink";
import { alternates, t } from "@/lib/i18n";

/**
 * /en/shop — den engelske udgave af kataloget (Villy, S568).
 *
 * Bygget på Harukis mønster fra /en/walk-in: `t("en")`, `alternates()`,
 * `lang="en"`. Sideejeren porterer sin egen flade — det er aftalen i
 * CLAUDE.md, så vi ikke bygger den samme side to gange.
 *
 * Rails §4 følger med gratis: gaten er `p.live && p.variantId`, altså
 * sprogfri. En draft uden variantId viser «Soon» på engelsk, præcis som
 * den viser «Snart» på dansk — aldrig en købsknap der ikke kan købe.
 *
 * Prisen og adressen står ordret som på dansk. En tolkning af en pris er
 * en fejl, ikke en stemme.
 */
const c = t("en").shop;

export const metadata: Metadata = {
  alternates: { ...alternates("/shop"), canonical: "/en/shop" },
  title: c.metaTitle,
  description: c.metaDescription,
};

/* Dørene peger på de flader der FINDES. /en/gavekort og /en/blackbook
   svarer 410 indtil ejerne porterer dem (Groks og Harukis lane) — og et
   link til 410 er en død handling, rails §4. Hellere dansk end ingenting;
   testen herunder holder det ærligt. */
const DOORS = [
  { href: "/gavekort", label: "Gift cards", linje: c.doors.gavekort, tilt: -1.4 },
  { href: "/en/walk-in", label: "Walk-in", linje: c.doors.walkin, tilt: 1.1 },
  { href: "/flash", label: "Flash", linje: c.doors.flash, tilt: -0.8 },
] as const;

export default function ShopPageEn() {
  return (
    <>
      <SkipLink lang="en" />
      <main id="main" className="gade" lang="en">
        <div className="gade__inner">
          <p className="gade__top font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
            <a href="/en">← {site.name}</a>
            <LangSwitch lang="en" path="/shop" />
          </p>

          <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
            {c.kicker}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium italic">
            {c.title}
          </h1>
          <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
            {c.intro} {site.address.street}.
          </p>

          <ul className="gade__doors" role="list">
            {DOORS.map((d) => (
              <li key={d.href}>
                <a className="gade__door" href={d.href} style={{ transform: `rotate(${d.tilt}deg)` }}>
                  <span className="gade__door-label">{d.label}</span>
                  <span className="gade__door-linje">{d.linje}</span>
                  <span className="gade__door-pil" aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Samme handling, samme gate — kun sætningerne skifter sprog.
              Variant-ID'erne er de samme levende varer som på dansk. */}
          <section className="gade__afsnit" aria-label={c.piercing.label}>
            <p className="gade__afsnit-label">{c.piercing.label}</p>
            <h2 className="gade__afsnit-rubrik">{c.piercing.title}</h2>
            <p className="mt-3 max-w-[54ch] text-[var(--text-soft)]">{c.piercing.intro}</p>
            <DepositumRaekke
              varer={PIERCINGS}
              sted={c.piercing.slots}
              ariaSted={c.piercing.ariaSlots}
              koeb={c.piercing.koeb}
              aria={c.piercing.aria}
            />
          </section>

          <section className="gade__afsnit" aria-label={c.flashDepositum.label}>
            <p className="gade__afsnit-label">{c.flashDepositum.label}</p>
            <h2 className="gade__afsnit-rubrik">{c.flashDepositum.title}</h2>
            <p className="mt-3 max-w-[54ch] text-[var(--text-soft)]">{c.flashDepositum.intro}</p>
            <DepositumRaekke
              varer={FLASH_DEPOSITS}
              sted={c.flashDepositum.slots}
              ariaSted={c.flashDepositum.ariaSlots}
              koeb={c.flashDepositum.koeb}
              aria={c.flashDepositum.aria}
            />
          </section>

          <section className="gade__afsnit" aria-label={c.reservations}>
            <KerbReservation />
          </section>

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
                  <span className="gade__print-linje">
                    {c.prints[p.handle as keyof typeof c.prints] ?? p.linje}
                  </span>
                  {p.live && p.variantId ? (
                    <a
                      className="gade__print-koeb"
                      href={cartUrl(p.variantId)}
                      aria-label={c.buyAria(p.navn, kr(p.kr))}
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
