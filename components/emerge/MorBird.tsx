import { MOR_SR, type MorZone } from "@/lib/mor";

/**
 * Fuglemor som fundet væsen. Uden JS sidder hun stille — samme due som
 * før, samme SVG. Motoren (MorMotor) letter hende; SceneMotor ejer
 * parallax på slotten. Ingen transform på [data-depth]-boksen.
 */
export function MorBird({ zone }: { zone: MorZone }) {
  return (
    <div className={`mor mor--${zone}`} data-mor={zone} data-perch="gutter">
      {zone === "hero" ? <span className="sr-only">{MOR_SR}</span> : null}
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
