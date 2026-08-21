/** Fuglemor — gadens mor. Tekst-stemme, ingen lyd. Steven låste tonen. */

export const MOR_ZONES = ["hero", "under", "work", "artist", "booking"] as const;
export type MorZone = (typeof MOR_ZONES)[number];

export type MorPerch = { id: string; line: string };

/**
 * Landingssteder pr. zone. Positionerne bor i CSS (boks-model, ikke
 * transform). Linjerne er kridtsprogets mono-caps — sjældne nok til at
 * være et fund. Steven godkender tonen på PR'en.
 */
export const MOR_PERCHES: Record<MorZone, MorPerch[]> = {
  hero: [
    { id: "gutter", line: "HUN HAR SET DET HELE FRA TAGRENDEN" },
    { id: "sign", line: "KOM IND. DER ER VARMT." },
    { id: "walkin", line: "TO SMÅ. I AFTEN." },
  ],
  under: [
    { id: "gutter", line: "HUN HAR SET DET HELE FRA TAGRENDEN" },
    { id: "chalk", line: "DEN PLADS HOLDER JEG" },
  ],
  work: [{ id: "gutter", line: "INGEN FLYVER HERFRA UMÆRKET" }, { id: "gade", line: "INGEN FLYVER HERFRA UMÆRKET" }],
  artist: [
    { id: "gutter", line: "INGEN FLYVER HERFRA UMÆRKET" },
    { id: "quote", line: "KOM IND. DER ER VARMT." },
  ],
  booking: [
    { id: "gutter", line: "HUN HAR SET DET HELE FRA TAGRENDEN" },
    { id: "gift", line: "GIV DET VIDERE" },
  ],
};

export const MOR_SR =
  "En due i tagrenden. Hun har set gaden, og hun holder af stedet.";
