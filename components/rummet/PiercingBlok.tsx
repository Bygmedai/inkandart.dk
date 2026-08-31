import type { PiercingCopy } from "@/lib/content";

/**
 * Piercing-afsnittet paa piercerens side. Én komponent, to sprog —
 * teksten kommer ind som data, saa DA og EN ikke kan drive fra hinanden
 * i markup. Samme greb som fladerne (CLAUDE.md §3).
 *
 * Fotoet er valgfrit: uden `foto` tegnes rammen slet ikke, saa en tom
 * linje i indholdet ikke efterlader et hul paa siden.
 *
 * Prisen staar IKKE her. Den bor paa /piercing som én liste med ét tal og
 * to navne (#268) — to kopier af den samme tabel er praecis den drift vi
 * lige har ryddet op i. Her staar doeren, hvor kunden allerede er, og
 * hvert sprog sender sin egen.
 */
export function PiercingBlok({
  pi,
  prisHref,
  prisTekst,
}: {
  pi: PiercingCopy;
  prisHref: string;
  prisTekst: string;
}) {
  return (
    <section className="rum-artist__piercing" aria-labelledby="piercing">
      <h2 id="piercing" className="rum-label">
        {pi.titel}
      </h2>
      {pi.foto ? (
        <div className="rum-kort__foto rum-artist__skab">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pi.foto} alt={pi.billedtekst} loading="lazy" />
        </div>
      ) : null}
      <p className="rum-body-copy rum-artist__bio">{pi.tekst}</p>
      <p className="rum-label rum-artist__priser">
        <a href={prisHref}>{prisTekst}</a>
      </p>
    </section>
  );
}
