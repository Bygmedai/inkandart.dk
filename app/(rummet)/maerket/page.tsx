import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { Plade } from "@/components/rummet/Plade";
import { GavekortKoeb } from "@/components/rummet/GavekortKoeb";
import { VareKort } from "@/components/rummet/VareKort";
import {
  artistById,
  chairArtists,
  filterVisibleByArtist,
  loadHouse,
  loadHylden,
  type Artist,
} from "@/lib/content";
import { productsByHandles } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Mærket · Ink & Art",
  description: "Væggen og hylden. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { canonical: "/maerket" },
};

function oneParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

function filterChips(artists: Artist[], current: string): Artist[] {
  const chairs = chairArtists(artists);
  if (!current || chairs.some((a) => a.id === current)) return chairs;
  const extra = artists.find((a) => a.id === current && a.fornavn);
  return extra ? [...chairs, extra] : chairs;
}

export default async function MaerketPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const artistId = oneParam(params.artist);
  const house = loadHouse();
  const wall = filterVisibleByArtist(house.vaerker, artistId);
  const chips = filterChips(house.artists, artistId);
  // Hylden læser sin egen fil, ikke værkerne. Et værk er et fotografi;
  // en vare er noget man kan købe. Se lib/content.ts → loadHylden.
  const varer = loadHylden();
  const sf = await productsByHandles(varer.map((v) => v.handle));
  const hylden = varer
    .map((vare) => ({ vare, product: sf.products.find((p) => p.handle === vare.handle) }))
    .filter((x) => Boolean(x.product?.variantGid));
  const hyldenTom = hylden.length === 0;

  return (
    <RummetShell tone="salg">
      <main id="main" className="rum-room rum-maerket">
        <h1 className="rum-room__title rum-poster">Mærket</h1>

        <section className="rum-maerket__hylden" aria-labelledby="hylden">
          <h2 id="hylden" className="rum-label">
            Hylden
          </h2>
          {hyldenTom ? (
            <div className="rum-empty" style={{ marginTop: 16 }}>
              <p className="rum-empty__title rum-poster">Hylden fyldes op.</p>
            </div>
          ) : (
            <div className="rum-hylden">
              {hylden.map(({ vare, product }) => (
                <a key={vare.handle} className="rum-hylden__item" href={`/maerket/${vare.handle}`}>
                  <VareKort vare={vare} product={product} />
                </a>
              ))}
            </div>
          )}
          <GavekortKoeb />
        </section>

        <section className="rum-maerket__vaeg" aria-labelledby="vaeggen">
          <h2 id="vaeggen" className="rum-label">
            Væggen
          </h2>
          <nav className="rum-filter" aria-label="Artist">
            {chips.map((a) => {
              const on = artistId === a.id;
              return (
                <a
                  key={a.id}
                  href={on ? "/maerket" : `/maerket?artist=${a.id}`}
                  aria-current={on ? "page" : undefined}
                >
                  {a.fornavn}
                </a>
              );
            })}
          </nav>
          <div className="rum-vaeg">
            {wall.map((v) => {
              const artist = artistById(house.artists, v.artist);
              return (
                <article key={v.id} className="rum-vaeg__item">
                  <Plade vaerk={v} artist={artist} />
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </RummetShell>
  );
}
