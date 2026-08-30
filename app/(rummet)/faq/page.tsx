import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadFaq } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _f = loadFaq();

export const metadata: Metadata = {
  title: `${_f.titel} · Ink & Art`,
  description: _f.lede,
  alternates: { ...alternates("/faq"), canonical: "/faq" },
};

/** H5 (Stevens go 30/8). Svarene bor i content/faq.yml — Decap-redigerbare. */
export default function FaqPage() {
  const f = loadFaq();
  return (
    <RummetShell>
      <main id="main" className="rum-legal">
        <p className="rum-label">Huset</p>
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
