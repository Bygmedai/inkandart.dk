import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadPrivatlivEn } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _p = loadPrivatlivEn();

export const metadata: Metadata = {
  title: `${_p.titel} · Ink & Art`,
  description: _p.lede,
  alternates: {
    ...alternates("/privatlivspolitik"),
    canonical: "/en/privatlivspolitik",
  },
};

/** English privacy policy — same substance as the Danish canon, own voice. */
export default function PrivacyPageEn() {
  const p = loadPrivatlivEn();
  return (
    <RummetShell>
      <main id="main" lang="en" className="rum-legal">
        <p className="rum-label">The house</p>
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
