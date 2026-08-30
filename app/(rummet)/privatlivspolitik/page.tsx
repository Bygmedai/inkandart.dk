import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadPrivatliv } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _p = loadPrivatliv();

export const metadata: Metadata = {
  title: `${_p.titel} · Ink & Art`,
  description: _p.lede,
  alternates: {
    ...alternates("/privatlivspolitik"),
    canonical: "/privatlivspolitik",
  },
};

/**
 * Privatlivspolitik v2 — godkendt af Steven 30/8 2026.
 *
 * Den gamle side var tre afsnit hårdkodet i markup og opfyldte ikke
 * oplysningspligten: ingen dataansvarlig, ingen databehandlere, ingen
 * opbevaringstid, ingen rettigheder, ingen klagevej (Sirius P0-4).
 * Nu bor ordene i content/privatliv.yml — én kilde, to sprog, og Sonja
 * kan rette dem uden GitHub.
 */
export default function PrivacyPage() {
  const p = loadPrivatliv();
  return (
    <RummetShell>
      <main id="main" className="rum-legal">
        <p className="rum-label">Huset</p>
        <h1 className="rum-poster">{p.titel}</h1>
        <p className="rum-body-copy rum-legal__lede">{p.lede}</p>
        {p.sektioner.map((s) => (
          <section key={s.overskrift} className="rum-legal__afsnit">
            <h2 className="rum-poster">{s.overskrift}</h2>
            <p className="rum-body-copy">{s.tekst}</p>
          </section>
        ))}
      </main>
    </RummetShell>
  );
}
