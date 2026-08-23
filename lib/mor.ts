/** Fuglemor — gadens mor. Tekst-stemme, ingen lyd. Steven godkender tonen. */

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
    { id: "gutter", line: "JEG RYGER MIN. IKKE DIN." },
    { id: "chalk", line: "DEN PLADS HOLDER JEG" },
  ],
  work: [
    { id: "gutter", line: "INGEN FLYVER HERFRA UMÆRKET" },
    { id: "gade", line: "VI SÆLGER TUSSE. IKKE OPMÆRKSOMHED." },
  ],
  artist: [
    { id: "gutter", line: "HOLD KÆFT OG SÆT DIG" },
    { id: "quote", line: "KOM IND. DER ER VARMT." },
  ],
  booking: [
    { id: "gutter", line: "HUN HAR SET DET HELE FRA TAGRENDEN" },
    { id: "gift", line: "GIV DET VIDERE" },
  ],
};

/**
 * @deprecated Ordene bor nu i lib/i18n.ts (`morSr`), saa de kan tales paa
 * begge sprog. Stod her paa dansk og blev laest hoejt paa dansk for en
 * engelsk bruger paa /en (Villy, S569). Beholdt saa intet knaekker; brug den
 * ikke.
 */
export const MOR_SR =
  "En due i tagrenden. Hun ryger, hun kigger, og hun holder af gaden.";
