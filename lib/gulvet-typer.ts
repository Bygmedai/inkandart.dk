/**
 * Gulvets datatyper — adskilt fra lib/gulvet.ts med vilje.
 *
 * Klientfladen har brug for formen på en post; den har ikke brug for
 * service-role-nøglen eller fetch-koden. `import type` slettes ganske vist
 * ved oversættelse, men en dag skriver nogen `import {` i stedet for
 * `import type {` — og så følger serverens modul med i browserbundtet.
 * En fil uden hemmeligheder kan ikke lække nogen.
 */

export type Fund = {
  id: string;
  slag: string;
  tekst: string;
  dato: string;
  hvem: string;
  ind: number | null;
  koebte: number | null;
  salg: number | null;
  spoergsmaal: boolean;
  svar: string | null;
  svar_af: string | null;
  /** Hvornår svaret kom — null indtil da. Svartiden regnes herfra. */
  svar_paa: string | null;
  /** Hvilken af månedens opgaver fundet kom fra. Null = ingen. */
  opgave: string | null;
  oprettet: string;
};

/** Spejl af GulvetFase i lib/content.ts — kun det tal-modulet bruger. */
export type GulvetFase = { navn: string; linje: string; fra: number; til: number };

export type Fremdrift = { opgave: string; klaret: boolean; af: string; naar: string };

/** Én ugentlig opsamling, skrevet af Haruki (eller et menneske) ind i gulvet_analyse. */
export type Analyse = {
  id: string;
  uge: string;
  fra: string;
  til: string;
  af: string;
  skrevet: string;
  /** Ugens tal fra systemerne — nøgler er frie, værdier tal eller null. */
  tal: Record<string, number | null>;
  konklusioner: string[];
  naeste: string | null;
};
