import type { Artist } from "@/lib/content";
import { BookDoor } from "./BookDoor";

function slotId(src: string): string {
  const name = src.split("/").pop() || src;
  return name.replace(/\.[a-z0-9]+$/i, "");
}

function daNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function ArtistKort({
  artist,
  workCount,
  guestKind,
}: {
  artist: Artist;
  workCount: number;
  guestKind?: "named" | "pending";
}) {
  const name =
    guestKind === "pending" ? "Gæst · navn følger" : artist.fornavn;
  const alt = guestKind === "pending" ? "Gæst" : artist.fornavn;
  const craft = guestKind === "pending" ? "" : artist.haandvaerk;
  const periode =
    guestKind === "pending"
      ? ""
      : guestKind === "named"
        ? artist.periode_til
          ? `I huset til ${artist.periode_til}`
          : "Gæst"
        : artist.periode === "fast"
          ? "Fast"
          : artist.periode;

  return (
    <article className="rum-kort">
      <div className="rum-kort__foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artist.foto} alt={alt} />
        <span className="rum-demo">DEMO {slotId(artist.foto)}</span>
      </div>
      <div className="rum-kort__body">
        <h2 className="rum-chair__navn rum-poster">{name}</h2>
        {craft ? <p className="rum-chair__craft">{craft}</p> : null}
        {periode ? <p className="rum-label rum-chair__meta">{periode}</p> : null}
        {workCount > 0 ? (
          <p className="rum-kort__arkiv">
            <a href={`/maerket?artist=${artist.id}`}>
              {workCount === 1
                ? `${daNum(workCount)} værk i arkivet`
                : `${daNum(workCount)} værker i arkivet`}
            </a>
          </p>
        ) : null}
        <BookDoor className="rum-book rum-book--row" />
      </div>
    </article>
  );
}
