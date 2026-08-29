import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadGaden } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gaden · Ink & Art",
  description: "Larsbjørnsstræde 13 kld, København K. Tatovering og piercing.",
  alternates: { canonical: "/gaden" },
};

export default function GadenPage() {
  const gaden = loadGaden();
  return (
    <RummetShell>
      <main id="main" className="rum-room rum-gaden">
        <h1 className="rum-room__title rum-poster">Gaden</h1>
        <div className="rum-room__slot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slots/G-01.jpg" alt="G-01, Larsbjørnsstræde 13" />
        </div>
        <p className="rum-room__note rum-body-copy">
          Larsbjørnsstræde 13 kld, 1454 København K.
        </p>
        <p className="rum-room__note rum-body-copy">
          <a href="tel:+4555248608">Ring på — 55 24 86 08</a>
        </p>
        {gaden.aabent ? (
          <p className="rum-room__note rum-body-copy">Åbent: {gaden.aabent}</p>
        ) : null}
        {gaden.walk_in ? (
          <p className="rum-room__note rum-body-copy">Walk-in: {gaden.walk_in}</p>
        ) : null}
        <p className="rum-room__note rum-body-copy">Depositum fra 100 kr</p>
        <p className="rum-room__note rum-body-copy">
          Tatovering og piercing. Ring på.
        </p>
        <p style={{ marginTop: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <a href="/booking" className="rum-book">
            Book tid
          </a>
          <a href="/shop" className="rum-book">
            Shop
          </a>
          <a href="/gavekort" className="rum-book">
            Gavekort
          </a>
        </p>
      </main>
    </RummetShell>
  );
}
