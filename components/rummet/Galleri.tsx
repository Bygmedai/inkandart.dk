import type { CSSProperties } from "react";
import { artistFotos, type Artist } from "@/lib/content";

/**
 * Artistens billed-slot.
 *
 * Ét billede: præcis samme markup som før galleriet fandtes — ingen knap,
 * intet der bevæger sig. Det er den negative kontrol (docs/accept/galleri.md
 * A1), og det er tilstanden for fem af husets seks profiler i dag.
 *
 * Flere billeder: en stak der krydsfader. Rotationen er ren CSS, og pausen
 * er en <label> for en skjult checkbox — derfor virker begge dele med
 * JavaScript slået fra, som købsfladerne (CLAUDE.md §5).
 *
 * Pauseknappen er ikke pynt. WCAG 2.2 SC 2.2.2 kræver en pause-mulighed for
 * indhold der bevæger sig i mere end fem sekunder; uden den må fladen ikke
 * rotere overhovedet.
 */
export function ArtistGalleri({
  artist,
  pause,
  afspil,
}: {
  artist: Artist;
  /** Knappens tekst når billederne kører. */
  pause: string;
  /** Knappens tekst når de står stille. */
  afspil: string;
}) {
  const fotos = artistFotos(artist);
  if (fotos.length === 0) return null;

  if (fotos.length === 1) {
    const f = fotos[0];
    return (
      <div className="rum-kort__foto rum-artist__foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={f.fil}
          alt={f.tekst || artist.fornavn}
          style={f.fokus ? { objectPosition: f.fokus } : undefined}
        />
      </div>
    );
  }

  return (
    <div
      className="rum-kort__foto rum-artist__foto rum-galleri"
      data-antal={fotos.length}
    >
      {/* Skal stå FØR billederne og før labelen: CSS'en pauser via ~ */}
      <input
        type="checkbox"
        id="rum-galleri-pause"
        className="rum-galleri__kontakt"
      />
      {fotos.map((f, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f.fil}
          className="rum-galleri__foto"
          src={f.fil}
          alt={f.tekst || artist.fornavn}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          style={
            {
              "--i": i,
              ...(f.fokus ? { objectPosition: f.fokus } : {}),
            } as CSSProperties
          }
        />
      ))}
      {/* To spans, ét synligt ad gangen. display:none tager det skjulte ud
          af tilgængelighedstræet, så knappens navn ALTID er den tekst der
          står på den — ingen aria-label der kan komme ud af trit. */}
      <label htmlFor="rum-galleri-pause" className="rum-galleri__pause">
        <span className="rum-galleri__ord rum-galleri__ord--stop">{pause}</span>
        <span className="rum-galleri__ord rum-galleri__ord--gaa">{afspil}</span>
      </label>
    </div>
  );
}
