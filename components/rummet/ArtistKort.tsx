import type { Artist } from "@/lib/content";
import { periodeLabel } from "@/lib/content";
import { DEFAULT_LOCALE, localePath, t, type Locale } from "@/lib/i18n";

function daNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Ét kort, alle flader. Huset bruger compact (uden handlingsrække),
 * Stolen bruger fuld. Kortet er en dør: foto og navn linker til
 * artistens egen side — et kort man ikke kan trykke på er en plakat,
 * ikke et interface.
 *
 * Alt indhold kommer fra artists.yml via Artist-typen. Ingen etiket
 * er hardcodet her: perioden kommer fra periodeLabel(), navnet fra
 * data, og en gæst uden navn får ingen død dør.
 *
 * S574: kortet kan tales på engelsk. Fagets navn kommer fra
 * haandvaerk_en når artisten har givet os et — ellers står den danske,
 * for vi oversætter ikke et menneskes fag på egen hånd.
 */
export function ArtistKort({
  artist,
  workCount,
  guestKind,
  compact = false,
  lang = DEFAULT_LOCALE,
}: {
  artist: Artist;
  workCount: number;
  guestKind?: "named" | "pending";
  compact?: boolean;
  lang?: Locale;
}) {
  const c = t(lang).rummet;
  const pending = guestKind === "pending";
  const name = pending ? c.guestPending : artist.fornavn;
  // Alt-teksten skal ogsaa tales. Stod haardkodet «Gæst», saa en
  // skaermlaeser paa /en/stolen sagde et dansk ord om et billede —
  // usynligt for den der kan se. Fanget af proeven i rummet.test.mjs.
  const alt = artist.billedtekst || (pending ? c.periode.gaest : artist.fornavn);
  const craft = pending
    ? ""
    : (lang === "en" && artist.haandvaerk_en) || artist.haandvaerk;
  const periode = pending ? "" : periodeLabel(artist, c.periode);
  const href = pending ? null : localePath(lang, `/stolen/${artist.id}`);

  const foto = (
    <div className="rum-kort__foto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={artist.foto} alt={alt} />
    </div>
  );

  return (
    <article className="rum-kort">
      {href ? (
        <a href={href} className="rum-kort__link" aria-label={`${name} — se profil`}>
          {foto}
        </a>
      ) : (
        foto
      )}
      <div className="rum-kort__body">
        <h2 className="rum-chair__navn rum-poster">
          {href ? <a href={href}>{name}</a> : name}
        </h2>
        {craft ? <p className="rum-chair__craft">{craft}</p> : null}
        {periode ? <p className="rum-label rum-chair__meta">{periode}</p> : null}
        {!compact && workCount > 0 ? (
          <p className="rum-kort__arkiv">
            <a href={`/maerket?artist=${artist.id}`}>
              {c.seeWork(daNum(workCount), workCount === 1)}
            </a>
          </p>
        ) : null}
        {!compact && !pending ? (
          artist.booking ? (
            <a
              href={localePath(lang, `/booking?artist=${artist.id}`)}
              className="rum-book rum-book--row"
            >
              {c.bookTid}
            </a>
          ) : (
            <a href={localePath(lang, "/gaden")} className="rum-book rum-book--row">
              {c.walkIn}
            </a>
          )
        ) : null}
      </div>
    </article>
  );
}
