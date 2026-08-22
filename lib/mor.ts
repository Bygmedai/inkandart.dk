/** Fuglemor. Bankens linjer roterer i motoren — hun mumler, hun performer ikke. */

import type { LineKey, VoiceKey } from "./voice";

export const MOR_ZONES = ["hero", "under", "work", "artist", "booking"] as const;
export type MorZone = (typeof MOR_ZONES)[number];

export type MorPerch = { id: string; line: LineKey };

export const MOR_PERCHES: Record<MorZone, MorPerch[]> = {
  hero: [
    { id: "gutter", line: "mor.line" },
    { id: "sign", line: "mor.line" },
    { id: "walkin", line: "mor.line" },
  ],
  under: [
    { id: "gutter", line: "mor.line" },
    { id: "chalk", line: "mor.line" },
  ],
  work: [
    { id: "gutter", line: "mor.line" },
    { id: "gade", line: "mor.line" },
  ],
  artist: [
    { id: "gutter", line: "mor.line" },
    { id: "quote", line: "mor.line" },
  ],
  booking: [
    { id: "gutter", line: "mor.line" },
    { id: "gift", line: "mor.line" },
  ],
};

export const MOR_SR_KEY: VoiceKey = "mor.sr";
