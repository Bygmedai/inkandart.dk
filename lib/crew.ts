/**
 * Gadens vågne figurer. Percher er boks-model i CSS — uden for tekstbånd
 * og uden for kridt/gavekort/walk-in. Motoren vælger HVEM og HVORNÅR;
 * den finder ikke selv på koordinater.
 */
export type CrewWho = "rat-ledge" | "rat-work" | "dice-under" | "dice-work" | "skull-under" | "skull-work";

export type CrewSpec = {
  who: CrewWho;
  zone: "under" | "work";
  src: string;
  perches: string[];
  /** Hvem der kan få dem til at hoppe. */
  reactsTo: string[];
  line?: "rat.line" | "skull.line" | "dice.line";
};

export const CREW: CrewSpec[] = [
  {
    who: "rat-ledge",
    zone: "under",
    src: "/emerge/v05/rat.svg",
    perches: ["a", "b", "c"],
    reactsTo: ["mor-under"],
    line: "rat.line",
  },
  {
    who: "dice-under",
    zone: "under",
    src: "/emerge/v05/dice.svg",
    perches: ["a", "b"],
    reactsTo: ["rat-ledge"],
    line: "dice.line",
  },
  {
    who: "skull-under",
    zone: "under",
    src: "/emerge/v05/skull.svg",
    perches: ["a", "b"],
    reactsTo: ["dice-under"],
    line: "skull.line",
  },
  {
    who: "rat-work",
    zone: "work",
    src: "/emerge/v05/rat.svg",
    perches: ["a", "b"],
    reactsTo: ["mor-work"],
    line: "rat.line",
  },
  {
    who: "dice-work",
    zone: "work",
    src: "/emerge/v05/dice.svg",
    perches: ["a", "b"],
    reactsTo: ["rat-work"],
    line: "dice.line",
  },
  {
    who: "skull-work",
    zone: "work",
    src: "/emerge/v05/skull.svg",
    perches: ["a", "b"],
    reactsTo: ["dice-work"],
    line: "skull.line",
  },
];
