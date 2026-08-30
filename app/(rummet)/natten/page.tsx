import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { Door } from "@/components/rummet/Door";
import { activeNat, loadHouse } from "@/lib/content";

export const metadata: Metadata = {
  title: "Natten · Ink & Art",
  description: "Næste nat. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { canonical: "/natten" },
};

export default function NattenPage() {
  const house = loadHouse();
  const nat = activeNat(house.nats);
  const poster = house.nats[0];
  const foto = nat ? nat.plakatfoto || "/slots/H-02.jpg" : poster?.plakatfoto || "/slots/H-02.jpg";
  return (
    <RummetShell door={false}>
      <main id="main" className="rum-room rum-natten">
        <h1 className="rum-room__title rum-poster">Natten</h1>
        <div className="rum-room__slot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="Natten" />
        </div>
        {nat ? (
          <div className="rum-nat__card rum-nat__card--live" style={{ marginTop: 28 }}>
            {nat.dato ? <p className="rum-nat__title rum-poster">{nat.dato}</p> : null}
            <p className="rum-chair__craft" style={{ marginTop: 10 }}>
              {nat.navne.length ? nat.navne.join(" · ") : "Gæste-DJ"}
            </p>
            {nat.tidsrum ? (
              <p className="rum-label rum-nat__meta">{nat.tidsrum}</p>
            ) : null}
          </div>
        ) : (
          <div className="rum-empty" style={{ marginTop: 28 }}>
            <p className="rum-empty__title rum-poster">Ingen nat i aften</p>
            <p className="rum-body-copy" style={{ marginTop: 12, color: "var(--beton)" }}>
              Næste nat står i Blackbook.
            </p>
          </div>
        )}
        <Door variant="inline" />
        <div className="rum-natten__out">
          <a href="/booking" className="rum-book">
            Book tid
          </a>
          <a href="/gaden" className="rum-book">
            Gaden
          </a>
        </div>
      </main>
    </RummetShell>
  );
}
