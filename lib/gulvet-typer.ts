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
  oprettet: string;
};

export type Fremdrift = { opgave: string; klaret: boolean; af: string; naar: string };
