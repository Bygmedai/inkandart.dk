import type { Artist, Vaerk } from "@/lib/content";
import { vaerkLabel } from "@/lib/content";

export function Plade({
  vaerk,
  artist,
}: {
  vaerk: Vaerk;
  artist?: Artist;
}) {
  const label = vaerkLabel(vaerk, artist);
  return (
    <figure className="rum-plade">
      <div className="rum-plade__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vaerk.foto} alt={label} />
      </div>
      <figcaption>
        {vaerk.titel ? <p className="rum-plade__titel rum-poster">{vaerk.titel}</p> : null}
        {vaerk.titel && artist?.fornavn ? (
          <p className="rum-plade__artist">{artist.fornavn}</p>
        ) : null}
        {vaerk.aar || vaerk.arkivnr ? (
          <p className="rum-label rum-plade__meta">
            {[vaerk.aar, vaerk.arkivnr].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
