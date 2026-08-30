import type { GadenInfo } from "@/lib/content";
import { loadKontakt } from "@/lib/content";
import { localePath, t, type Locale } from "@/lib/i18n";

/**
 * Gaden — én flade, to sprog.
 *
 * Siden var hardkodet hele vejen igennem: adresse, telefonnummer,
 * depositumlinje og fagets navn stod i markup, så en rettelse skulle
 * gennem en PR og kunne kun ske på ét sprog (S574, Stevens krav om at
 * komme væk fra hardkodede elementer).
 *
 * Nu: ordene fra gaden(.en).yml, stamdata fra kontakt.yml. Adressen og
 * nummeret findes ÉT sted for hele huset — den dag huset flytter, flytter
 * det på alle flader samtidig.
 */
export function GadenFlade({ gaden, lang }: { gaden: GadenInfo; lang: Locale }) {
  const k = loadKontakt();
  const c = t(lang).rummet;
  const ring = lang === "en" ? "Call" : "Ring på";

  return (
    <main
      id="main"
      lang={lang === "en" ? "en" : undefined}
      className="rum-room rum-gaden"
    >
      <h1 className="rum-room__title rum-poster">{gaden.titel}</h1>
      <div className="rum-room__slot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gaden.foto} alt={gaden.billedtekst} />
      </div>
      <p className="rum-room__note rum-body-copy">
        {k.adresse}, {k.by}.
      </p>
      <p className="rum-room__note rum-body-copy">
        <a className="rum-tel" href={`tel:${k.telefon_e164}`}>
          {ring} — {k.telefon_vist}
        </a>
      </p>
      {gaden.aabent ? (
        <p className="rum-room__note rum-body-copy">
          {gaden.aabent_label} {gaden.aabent}
        </p>
      ) : null}
      {gaden.walk_in ? (
        <p className="rum-room__note rum-body-copy">
          {gaden.walk_in_label} {gaden.walk_in}
        </p>
      ) : null}
      {gaden.depositum_linje ? (
        <p className="rum-room__note rum-body-copy">{gaden.depositum_linje}</p>
      ) : null}
      {gaden.fag_linje ? (
        <p className="rum-room__note rum-body-copy">{gaden.fag_linje}</p>
      ) : null}
      <p style={{ marginTop: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <a href={localePath(lang, "/booking")} className="rum-book">
          {c.bookTid}
        </a>
        <a href={localePath(lang, "/maerket")} className="rum-book">
          Mærket
        </a>
        <a href={localePath(lang, "/gavekort")} className="rum-book">
          {c.giftCard}
        </a>
      </p>
    </main>
  );
}
