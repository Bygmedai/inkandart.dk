import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadBetingelserEn } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _b = loadBetingelserEn();

export const metadata: Metadata = {
  title: `${_b.titel} · Ink & Art`,
  description: _b.lede,
  alternates: { ...alternates("/betingelser"), canonical: "/en/betingelser" },
};

/** English terms — same substance as the Danish canon, own voice. */
export default function TermsPageEn() {
  const b = loadBetingelserEn();
  return (
    <RummetShell lang="en">
      <main id="main" lang="en" className="rum-legal">
        <p className="rum-label">The house</p>
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
