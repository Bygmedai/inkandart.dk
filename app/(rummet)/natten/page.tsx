import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { Door } from "@/components/rummet/Door";
import { activeNat, loadHouse, loadNattenCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Natten · Ink & Art",
  description: "Næste nat. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { canonical: "/natten" },
};

/**
 * Natten er et koncept, ikke kun en kalender. En førstegangsbesøgende
 * skal kunne læse hvad det ER (intro fra natten.yml) — og uden en aktiv
 * nat er sidens job at samle tilmeldinger, ikke at vise et umotiveret
 * foto af en tom sofa (Stevens QA 30/8). Plakaten vises kun når der
 * faktisk er en nat at vise plakat for.
 */
export default function NattenPage() {
  const house = loadHouse();
  const copy = loadNattenCopy();
  const nat = activeNat(house.nats);
  return (
    <RummetShell door={false}>
      <main id="main" className="rum-room rum-natten">
        <h1 className="rum-room__title rum-poster">Natten</h1>
        {copy.intro ? (
          <p className="rum-body-copy rum-natten__intro">{copy.intro}</p>
        ) : null}
        {nat ? (
          <>
            <div className="rum-room__slot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nat.plakatfoto || "/slots/H-02.jpg"} alt={nat.billedtekst || "Nattens plakat"} />
            </div>
            <div className="rum-nat__card rum-nat__card--live" style={{ marginTop: 28 }}>
              {nat.dato ? <p className="rum-nat__title rum-poster">{nat.dato}</p> : null}
              <p className="rum-chair__craft" style={{ marginTop: 10 }}>
                {nat.navne.length ? nat.navne.join(" · ") : "Gæste-DJ"}
              </p>
              {nat.tidsrum ? (
                <p className="rum-label rum-nat__meta">{nat.tidsrum}</p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="rum-empty" style={{ marginTop: 28 }}>
            <p className="rum-empty__title rum-poster">{copy.tom_titel}</p>
            {copy.tom_linje ? (
              <p className="rum-body-copy" style={{ marginTop: 12 }}>
                {copy.tom_linje}
              </p>
            ) : null}
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
