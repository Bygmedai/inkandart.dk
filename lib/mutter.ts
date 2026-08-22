/**
 * Figurer der allerede ligger i landskabet, og som kan mumle uden at hoppe.
 * Vi lægger ikke nye SVG'er ovenpå — vi hægter os på de objekter Vilde
 * allerede har sat. Wire og ouroboros er for store; svalerne flyver.
 * Motoren vælger HVEM og HVORNÅR; den flytter dem ikke.
 */
import type { LineKey } from "./voice";

export type MutterHook = { sel: string; key: LineKey };

/** Unikke klasser i SceneV05 — ingen ny slot, ingen ny asset. */
export const MUTTERS: MutterHook[] = [
  { sel: ".v5m-rose-big", key: "rose.line" },
  { sel: ".v5m-snake-hero", key: "snake.line" },
  { sel: ".v5m-machine-big", key: "machine.line" },
  { sel: ".v5m-dagger-hero", key: "dagger.line" },
  { sel: ".v5m-dice-scroll", key: "dice.line" },
];

/** Første match i hero — flaske, kop, skod. Ikke svaler, ikke wire. */
export const MUTTER_FIRST: { src: string; key: LineKey }[] = [
  { src: "/emerge/v05/bottle.svg", key: "bottle.line" },
  { src: "/emerge/v05/cup.svg", key: "cup.line" },
  { src: "/emerge/v05/cigarette.svg", key: "butt.line" },
];
