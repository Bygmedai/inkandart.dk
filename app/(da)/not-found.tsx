import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadKontakt } from "@/lib/content";

export const metadata: Metadata = {
  title: "Siden findes ikke · Ink & Art",
  robots: { index: false, follow: true },
};

/**
 * 404 — den eneste side hver eneste forkerte URL på hele sitet lander på.
 *
 * Den var en rest fra Emerge: guldfarver, egne inline-styles og linjen
 * «Siden er væk. Mærket består.» over en dør der hed «Ind i landskabet».
 * En kunde der er faret vild skal have en vej videre, ikke en sætning der
 * lyder godt (copy-audit 30/8). Nu: husets skal, husets ord, tre døre der
 * dækker det folk faktisk ledte efter — og telefonen, hvis siden de kom
 * fra er væk for altid.
 */
export default function NotFound() {
  const k = loadKontakt();
  return (
    <RummetShell door={false}>
      <main id="main" className="rum-room rum-legal">
        <p className="rum-label">404</p>
        <h1 className="rum-poster">Siden findes ikke.</h1>
        <p className="rum-body-copy rum-legal__lede">
          Linket er måske gammelt, eller også har vi flyttet noget. Her er
          vejene ind i huset.
        </p>
        <p style={{ marginTop: 32, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <a href="/" className="rum-book">
            Forsiden
          </a>
          <a href="/booking" className="rum-book">
            Book tid
          </a>
          <a href="/gaden" className="rum-book">
            Find os
          </a>
        </p>
        <p className="rum-body-copy" style={{ marginTop: 28 }}>
          <a className="rum-tel" href={`tel:${k.telefon_e164}`}>
            Ring på — {k.telefon_vist}
          </a>
        </p>
      </main>
    </RummetShell>
  );
}
