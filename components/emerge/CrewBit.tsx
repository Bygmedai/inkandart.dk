import type { CrewWho } from "@/lib/crew";

/**
 * En vågen figur. Uden JS sidder den som det objekt der allerede var
 * i landskabet. Motoren hopper den; SceneMotor ejer parallax på slotten.
 */
export function CrewBit({
  who,
  src,
  perch = "a",
}: {
  who: CrewWho;
  src: string;
  perch?: string;
}) {
  return (
    <div className={`crew crew--${who}`} data-crew={who} data-perch={perch} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="crew__body"
        src={src}
        alt=""
        width={80}
        height={80}
        draggable={false}
        loading="lazy"
      />
      <p className="crew__line" aria-hidden="true" />
    </div>
  );
}
