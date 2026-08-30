import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { Plade } from "@/components/rummet/Plade";
import { GavekortKoeb } from "@/components/rummet/GavekortKoeb";
import { VareKort } from "@/components/rummet/VareKort";
import {
  artistById,
  filterVisibleByArtist,
  loadHouse,
  loadHylden,
  wallChipArtists,
  type Artist,
  type Vaerk,
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

/**
 * Chips er kun for artister med værker på væggen — en chip uden værker
 * bag sig er en dør ind i et tomt rum (fundet med Anna, S573). Står der
 * alligevel et artist-id i URL'en uden værker, viser væggen en forklaring
 * i stedet for ingenting.
 */
function filterChips(artists: Artist[], vaerker: Vaerk[], current: string): Artist[] {
  const chips = wallChipArtists(artists, vaerker);
  if (!current || chips.some((a) => a.id === current)) return chips;
  const extra = artists.find((a) => a.id === current && a.fornavn);
  return extra ? [...chips, extra] : chips;
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
  const chips = filterChips(house.artists, house.vaerker, artistId);
  const filteredArtist = artistId ? artistById(house.artists, artistId) : undefined;
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
          {wall.length === 0 && filteredArtist ? (
            <div className="rum-empty" style={{ marginTop: 16 }}>
              <p className="rum-empty__title rum-poster">
                Ingen værker fra {filteredArtist.fornavn} på væggen endnu.
              </p>
              <p className="rum-body-copy" style={{ marginTop: 12 }}>
                <a href={`/stolen/${filteredArtist.id}`}>
                  Mød {filteredArtist.fornavn} i Stolen
                </a>
                {" — eller "}
                <a href="/maerket">se hele væggen</a>.
              </p>
            </div>
          ) : (
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
          )}
        </section>
      </main>
    </RummetShell>
  );
}
