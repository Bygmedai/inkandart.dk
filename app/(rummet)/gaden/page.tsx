import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { BookDoor } from "@/components/rummet/BookDoor";

export const metadata: Metadata = {
  title: "Gaden · Ink & Art",
  description: "Larsbjørnsstræde 13, København K. Tatovering og piercing.",
  alternates: { canonical: "/gaden" },
};

export default function GadenPage() {
  return (
    <RummetShell>
      <main id="main" className="rum-room rum-gaden">
        <div className="rum-room__slot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slots/G-01.jpg" alt="G-01, Larsbjørnsstræde 13" />
          <span className="rum-demo">DEMO G-01</span>
          <div className="rum-room__on">
            <h1 className="rum-room__title rum-poster">Gaden</h1>
          </div>
        </div>
        <p className="rum-room__note rum-body-copy">
          Larsbjørnsstræde 13, 1454 København K.
        </p>
        <p className="rum-room__note rum-body-copy">Åbent: [TAL BEKRÆFTES]</p>
        <p className="rum-room__note rum-body-copy">Walk-in: [TAL BEKRÆFTES]</p>
        <p className="rum-room__note rum-body-copy">Depositum: [TAL BEKRÆFTES]</p>
        <p className="rum-room__note rum-body-copy">
          Tatovering og piercing. Ring på.
        </p>
        <p style={{ marginTop: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <BookDoor />
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
