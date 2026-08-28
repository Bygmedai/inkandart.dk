import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { Plade } from "@/components/rummet/Plade";
import { GavekortKoeb } from "@/components/rummet/GavekortKoeb";
import {
  artistById,
  chairArtists,
  filterVisibleByArtist,
  loadHouse,
  shelfEmpty,
  shelfVaerker,
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
  const yamlEmpty = shelfEmpty(house.vaerker);
  const listed = shelfVaerker(house.vaerker);
  const sf = await productsByHandles(listed.map((v) => v.edition_ref));
  const hylden: { vaerk: Vaerk; artist?: Artist }[] = [];
  if (sf.ok) {
    for (const v of listed) {
      const p = sf.products.find((x) => x.handle === v.edition_ref);
      if (!p) continue;
      hylden.push({ vaerk: v, artist: artistById(house.artists, v.artist) });
    }
  }
  const hyldenTom = yamlEmpty || hylden.length === 0;

  return (
    <RummetShell>
      <main id="main" className="rum-room rum-maerket">
        <p className="rum-label">Rummet</p>
        <h1 className="rum-room__title rum-poster">Mærket</h1>

        <section className="rum-maerket__hylden" aria-labelledby="hylden">
          <h2 id="hylden" className="rum-label">
            Hylden
          </h2>
          {hyldenTom ? (
            <div className="rum-empty" style={{ marginTop: 16 }}>
              <p className="rum-empty__title rum-poster">Vi laver ikke varer uden værk.</p>
            </div>
          ) : (
            <div className="rum-hylden">
              {hylden.map(({ vaerk, artist }) => (
                <a
                  key={vaerk.id}
                  className="rum-hylden__item"
                  href={`/maerket/${vaerk.edition_ref}`}
                >
                  <Plade vaerk={vaerk} artist={artist} />
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
                  <p className="rum-label rum-skilt">[TAL BEKRÆFTES]</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </RummetShell>
  );
}
