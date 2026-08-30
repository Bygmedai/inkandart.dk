import { Plade } from "@/components/rummet/Plade";
import { GavekortKoeb } from "@/components/rummet/GavekortKoeb";
import { VareKort } from "@/components/rummet/VareKort";
import {
  artistById,
  filterVisibleByArtist,
  wallChipArtists,
  type Artist,
  type House,
  type Vare,
  type Vaerk,
} from "@/lib/content";
import type { StorefrontProduct } from "@/lib/storefront";
import { localePath, t, type Locale } from "@/lib/i18n";

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

/**
 * Mærket — én flade, to sprog (S574).
 *
 * Hylden og Væggen er husets egennavne som rummene og oversættes ikke;
 * sætningerne omkring dem gør. Hylde-data kommer udefra (Shopify eller
 * YAML-fallback) og hentes af siden, ikke her: fladen tegner, den
 * fetcher ikke.
 */
export function MaerketFlade({
  house,
  hylden,
  artistId,
  lang,
}: {
  house: House;
  hylden: { vare: Vare; product?: StorefrontProduct }[];
  artistId: string;
  lang: Locale;
}) {
  const c = t(lang).rummet;
  const wall = filterVisibleByArtist(house.vaerker, artistId);
  const chips = filterChips(house.artists, house.vaerker, artistId);
  const filteredArtist = artistId ? artistById(house.artists, artistId) : undefined;
  const maerket = localePath(lang, "/maerket");

  return (
    <main
      id="main"
      lang={lang === "en" ? "en" : undefined}
      className="rum-room rum-maerket"
    >
      <h1 className="rum-room__title rum-poster">Mærket</h1>

      <section className="rum-maerket__hylden" aria-labelledby="hylden">
        <h2 id="hylden" className="rum-label">
          {c.shelfLabel}
        </h2>
        {hylden.length === 0 ? (
          <div className="rum-empty" style={{ marginTop: 16 }}>
            <p className="rum-empty__title rum-poster">{c.shelfEmpty}</p>
          </div>
        ) : (
          <div className="rum-hylden">
            {hylden.map(({ vare, product }) => (
              <a
                key={vare.handle}
                className="rum-hylden__item"
                href={`/maerket/${vare.handle}`}
              >
                <VareKort vare={vare} product={product} />
              </a>
            ))}
          </div>
        )}
        <GavekortKoeb />
      </section>

      <section className="rum-maerket__vaeg" aria-labelledby="vaeggen">
        <h2 id="vaeggen" className="rum-label">
          {c.wallLabel}
        </h2>
        <nav className="rum-filter" aria-label={c.artistFilter}>
          {chips.map((a) => {
            const on = artistId === a.id;
            return (
              <a
                key={a.id}
                href={on ? maerket : `${maerket}?artist=${a.id}`}
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
              {c.noWorksFrom(filteredArtist.fornavn)}
            </p>
            <p className="rum-body-copy" style={{ marginTop: 12 }}>
              <a href={localePath(lang, `/stolen/${filteredArtist.id}`)}>
                {c.meetIn(filteredArtist.fornavn)}
              </a>
              {c.orSee}
              <a href={maerket}>{c.wholeWall}</a>.
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
  );
}
