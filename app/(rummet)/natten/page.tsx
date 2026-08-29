import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { activeNat, loadHouse } from "@/lib/content";

export const metadata: Metadata = {
  title: "Natten · Ink & Art",
  description: "Næste nat. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { canonical: "/natten" },
};

export default function NattenPage() {
  const nat = activeNat(loadHouse().nats);
  return (
    <RummetShell>
      <main id="main" className="rum-room rum-natten">
        <h1 className="rum-room__title rum-poster">Natten</h1>
        <div className="rum-room__slot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slots/H-02.jpg" alt="H-02, natten" />
          <span className="rum-demo">DEMO H-02</span>
        </div>
        {nat ? (
          <div className="rum-nat__card rum-nat__card--live" style={{ marginTop: 28 }}>
            <p className="rum-nat__title rum-poster">{nat.nr || nat.dato || "Nat"}</p>
            <p className="rum-label rum-nat__meta">
              {[nat.dato, nat.tidsrum].filter(Boolean).join(" · ")}
            </p>
            <p className="rum-chair__craft" style={{ marginTop: 10 }}>
              {nat.navne.length ? nat.navne.join(" · ") : "Gæste-DJ"}
            </p>
          </div>
        ) : (
          <div className="rum-empty" style={{ marginTop: 28 }}>
            <p className="rum-empty__title rum-poster">Ingen nat i aften</p>
            <p className="rum-body-copy" style={{ marginTop: 12, color: "var(--beton)" }}>
              Næste nat står i Blackbook.
            </p>
          </div>
        )}
      </main>
    </RummetShell>
  );
}
