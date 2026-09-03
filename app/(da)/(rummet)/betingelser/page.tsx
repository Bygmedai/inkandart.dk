import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadBetingelser } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _b = loadBetingelser();

export const metadata: Metadata = {
  title: `${_b.titel} · Ink & Art`,
  description: _b.lede,
  alternates: { ...alternates("/betingelser"), canonical: "/betingelser" },
};

/** Godkendt af Steven 30/8. Teksten bor i content/betingelser.yml. */
export default function BetingelserPage() {
  const b = loadBetingelser();
  return (
    <RummetShell>
      <main id="main" className="rum-legal">
        <p className="rum-label">Studiet</p>
        <h1 className="rum-poster">{b.titel}</h1>
        <p className="rum-body-copy rum-legal__lede">{b.lede}</p>
        {b.sektioner.map((s) => (
          <section key={s.overskrift} className="rum-legal__afsnit">
            <h2 className="rum-poster">{s.overskrift}</h2>
            <p className="rum-body-copy">{s.tekst}</p>
          </section>
        ))}
      </main>
    </RummetShell>
  );
}
