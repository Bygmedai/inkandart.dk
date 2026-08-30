import type { Artist } from "@/lib/content";
import { periodeLabel } from "@/lib/content";

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
 */
export function ArtistKort({
  artist,
  workCount,
  guestKind,
  compact = false,
}: {
  artist: Artist;
  workCount: number;
  guestKind?: "named" | "pending";
  compact?: boolean;
}) {
  const pending = guestKind === "pending";
  const name = pending ? "Gæst · navn følger" : artist.fornavn;
  const alt = artist.billedtekst || (pending ? "Gæst" : artist.fornavn);
  const craft = pending ? "" : artist.haandvaerk;
  const periode = pending ? "" : periodeLabel(artist);
  const href = pending ? null : `/stolen/${artist.id}`;

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
              {workCount === 1
                ? `${daNum(workCount)} værk i arkivet`
                : `${daNum(workCount)} værker i arkivet`}
            </a>
          </p>
        ) : null}
        {!compact && !pending ? (
          artist.booking ? (
            <a href={`/booking?artist=${artist.id}`} className="rum-book rum-book--row">
              Book tid
            </a>
          ) : (
            <a href="/gaden" className="rum-book rum-book--row">
              Walk-in — kom forbi
            </a>
          )
        ) : null}
      </div>
    </article>
  );
}
