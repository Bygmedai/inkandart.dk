import type { HusetForside } from "@/lib/content";

/**
 * Husets hero: et vindue med liv i, ikke en biograf.
 *
 * Steven, 10/9: «vi skal have en fed hero video, indtil vi får filmet en
 * selv». Kanonens §4 siger at sitet ikke har bevægelse — det er Stevens
 * kendelse der løfter den her, og løftet er afgrænset:
 *
 *   · Kun på brede skærme. På telefonen viser heroen fotoet som før: samme
 *     LCP, ingen data brændt af på et loop man knap kan se bag seglet.
 *   · Aldrig for den der har bedt om ro (prefers-reduced-motion): fotoet.
 *   · Aldrig uden fotoet i DOM'en. Billedet bærer alt-teksten og er det
 *     skærmlæseren møder; videoen er pynt (aria-hidden) med fotoet som
 *     plakat, så der ikke er et sort hul før første frame.
 *   · Ingen lyd, ingen kontroller, ingen picture-in-picture. Et loop.
 *
 * Ordene og filerne bor i content/huset.yml, som resten af folden. Sonja
 * bytter videoen 1:1 på sti når huset har filmet sin egen (K5: interim-
 * materiale udskiftes på filnavn og reglen udløber dér). Er hero_video tom,
 * er heroen præcis det billede den var før — ingen regression at teste.
 *
 * Budgettet er en prøve, ikke en hensigt: tests/hero-video.test.mjs holder
 * filen under 800 KB, så en 5 MB-eksport ikke kan lande lydløst.
 */
export function HusetHero({ fold }: { fold: HusetForside }) {
  const plakat = fold.hero_video_plakat || fold.hero_foto;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fold.hero_foto} alt={fold.hero_billedtekst} />
      {fold.hero_video ? (
        <video
          className="rum-huset__video"
          src={fold.hero_video}
          poster={plakat}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
    </>
  );
}
