/** Fuglemor — gadens mor. Linjer bor i lib/voice.ts (da+en). */

import type { VoiceKey } from "./voice";

export const MOR_ZONES = ["hero", "under", "work", "artist", "booking"] as const;
export type MorZone = (typeof MOR_ZONES)[number];

export type MorPerch = { id: string; line: VoiceKey };

export const MOR_PERCHES: Record<MorZone, MorPerch[]> = {
  hero: [
    { id: "gutter", line: "mor.gutter" },
    { id: "sign", line: "mor.warm" },
    { id: "walkin", line: "mor.walkin" },
  ],
  under: [
    { id: "gutter", line: "mor.smoke" },
    { id: "chalk", line: "mor.chalk" },
  ],
  work: [
    { id: "gutter", line: "mor.unmarked" },
    { id: "gade", line: "mor.tusse" },
  ],
  artist: [
    { id: "gutter", line: "mor.sit" },
    { id: "quote", line: "mor.warm" },
  ],
  booking: [
    { id: "gutter", line: "mor.gutter" },
    { id: "gift", line: "mor.gift" },
  ],
};

export const MOR_SR_KEY: VoiceKey = "mor.sr";
