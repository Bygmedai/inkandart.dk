import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadFaqEn } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _f = loadFaqEn();

export const metadata: Metadata = {
  title: `${_f.titel} · Ink & Art`,
  description: _f.lede,
  alternates: { ...alternates("/faq"), canonical: "/en/faq" },
};

export default function FaqPageEn() {
  const f = loadFaqEn();
  return (
    <RummetShell>
      <main id="main" lang="en" className="rum-legal">
        <p className="rum-label">The house</p>
        <h1 className="rum-poster">{f.titel}</h1>
        <p className="rum-body-copy rum-legal__lede">{f.lede}</p>
        {f.sporgsmal.map((x) => (
          <section key={x.q} className="rum-legal__afsnit">
            <h2 className="rum-poster">{x.q}</h2>
            <p className="rum-body-copy">{x.a}</p>
          </section>
        ))}
      </main>
    </RummetShell>
  );
}
