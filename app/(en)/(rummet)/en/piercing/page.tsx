import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { Prisliste } from "@/components/rummet/Prisliste";
import { loadPiercingEn, loadPiercingpriser, loadKontakt } from "@/lib/content";
import { LangSwitch } from "@/components/i18n/LangSwitch";
import { alternates } from "@/lib/i18n";

const _p = loadPiercingEn();

export const metadata: Metadata = {
  title: `${_p.titel} · Ink & Art`,
  description:
    "Fixed piercing prices at Ink & Art Copenhagen. Anna does every piercing except intimate ones — and is happy to change the jewellery you already wear.",
  alternates: { ...alternates("/piercing"), canonical: "/en/piercing" },
};

/** Samme liste, samme tal — kun navnene er oversat. Tallene findes ét sted
 *  (content/piercing-priser.yml), saa de to sprog KAN ikke sige forskelligt. */
export default function PiercingPageEn() {
  const pi = loadPiercingEn();
  const priser = loadPiercingpriser("en");
  const kontakt = loadKontakt();

  return (
    <RummetShell lang="en">
      <main id="main" lang="en" className="rum-legal">
        <LangSwitch lang="en" path="/piercing" />
        <p className="rum-label">Studio</p>
        <h1 className="rum-poster">{pi.titel}</h1>
        <p className="rum-body-copy rum-legal__lede">{pi.tekst}</p>

        <Prisliste priser={priser} />

        <p className="rum-body-copy" style={{ marginTop: 28 }}>
          <a className="rum-tel" href={`tel:${kontakt.telefon_e164}`}>
            Call — {kontakt.telefon_vist}
          </a>
        </p>
      </main>
    </RummetShell>
  );
}
