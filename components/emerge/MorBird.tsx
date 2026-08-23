import { type MorZone } from "@/lib/mor";
import { t, type Locale } from "@/lib/i18n";

/**
 * Fuglemor som fundet væsen. Uden JS sidder hun stille — samme due som
 * før, samme SVG. Motoren (MorMotor) letter hende; SceneMotor ejer
 * parallax på slotten. Ingen transform på [data-depth]-boksen.
 *
 * RÅB (Villy, S569 — Groks Mor*-lane): hendes skærmlæser-linje lå som en
 * dansk konstant i lib/mor.ts og blev derfor læst højt på dansk for en
 * engelsk bruger på /en. Motivet, positionen og bevægelsen er urørt — kun
 * ordene er flyttet til i18n, hvor de kan tales på to sprog.
 */
export function MorBird({ zone, lang = "da" }: { zone: MorZone; lang?: Locale }) {
  return (
    <div className={`mor mor--${zone}`} data-mor={zone} data-perch="gutter">
      {zone === "hero" ? <span className="sr-only">{t(lang).morSr}</span> : null}
      <span className="mor__flip" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="mor__body"
          src="/emerge/v05/bird-mor.svg"
          alt=""
          width={100}
          height={96}
          draggable={false}
          loading={zone === "hero" ? "eager" : "lazy"}
        />
      </span>
      <p className="mor__line" aria-hidden="true" />
    </div>
  );
}
