import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { Prisliste } from "@/components/rummet/Prisliste";
import { loadPiercing, loadPiercingpriser, loadKontakt } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _p = loadPiercing();

export const metadata: Metadata = {
  title: `${_p.titel} · Ink & Art`,
  description:
    "Faste priser på piercing hos Ink & Art Copenhagen. Anna sætter alle piercinger undtagen intime — og skifter gerne det smykke du allerede har.",
  alternates: { ...alternates("/piercing"), canonical: "/piercing" },
};

/**
 * Piercingpriser som egen side (Harukis brief S577, punkt 2).
 *
 * Prisen stod ingen steder offentligt, mens huset laver omkring 40
 * piercinger om maaneden. «Priser efter aftale» er den rigtige saetning for
 * tatovering, hvor prisen aftales med kunstneren — og den forkerte for
 * piercing, hvor prisen ER en liste.
 *
 * EGEN RUTE, ikke kun et afsnit paa Annas profil: en prisliste skal kunne
 * findes og deles. Den der soeger efter hvad en septum koster, skal ikke
 * foerst gaette hvem der saetter den.
 */
export default function PiercingPage() {
  const pi = loadPiercing();
  const priser = loadPiercingpriser("da");
  const kontakt = loadKontakt();

  return (
    <RummetShell>
      <main id="main" className="rum-legal">
        <p className="rum-label">Huset</p>
        <h1 className="rum-poster">{pi.titel}</h1>
        <p className="rum-body-copy rum-legal__lede">{pi.tekst}</p>

        <Prisliste priser={priser} />

        <p className="rum-body-copy" style={{ marginTop: 28 }}>
          <a className="rum-tel" href={`tel:${kontakt.telefon_e164}`}>
            Ring på — {kontakt.telefon_vist}
          </a>
        </p>
      </main>
    </RummetShell>
  );
}
