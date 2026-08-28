import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadHouse, shelfEmpty } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mærket · Ink & Art",
  description: "Væggen. Værker og editioner. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { canonical: "/maerket" },
};

export default function MaerketPage() {
  const empty = shelfEmpty(loadHouse().vaerker);
  return (
    <RummetShell>
      <main id="main" className="rum-room">
        <p className="rum-label">Rummet</p>
        <h1 className="rum-room__title rum-poster">Mærket</h1>
        <div className="rum-room__slot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slots/V-02.jpg" alt="V-02, Nizar Saad" />
          <span className="rum-demo">DEMO V-02</span>
        </div>
        {empty ? (
          <div className="rum-empty" style={{ marginTop: 28, maxWidth: 560 }}>
            <p className="rum-empty__title rum-poster">Vi laver ikke varer uden værk.</p>
          </div>
        ) : null}
        <p className="rum-room__note rum-body-copy">
          Væggen bygges i næste rum.{" "}
          <a href="/shop" className="rum-book">
            Shop
          </a>
        </p>
      </main>
    </RummetShell>
  );
}
