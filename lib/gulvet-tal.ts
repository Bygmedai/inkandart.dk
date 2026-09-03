/**
 * Gulvets regnestykker — rene funktioner, ingen fetch, ingen env.
 *
 * HVORFOR I EN EGEN FIL. Fordi det er den eneste aritmetik på siden der kan
 * tage fejl uden at nogen opdager det. En division med nul giver «NaN kr» i
 * en overskrift, og et månedstal regnet på to vagter er et gæt med
 * decimaler. Begge dele skal kunne prøves af en test, og en test kan ikke
 * importere en komponent med JSX. Så bor tallene her.
 *
 * Modulet må ALDRIG få en afhængighed til lib/gulvet.ts: det importeres af
 * klientfladen, og lib/gulvet.ts bærer service-role-nøglen.
 */

import type { Fund } from "./gulvet-typer";

export type Doeren = {
  vagter: number;
  fra: string;
  til: string;
  ind: number;
  koebte: number;
  salg: number;
  /** null når ingen har talt nogen ind — ikke 0, og aldrig NaN. */
  lukke: number | null;
  prHoved: number | null;
  indPrVagt: number;
  nok: boolean;
  mangler: number;
  stoletimer: number;
};

/**
 * Alt herunder er talt af holdet selv i «Skriv». Kommer der intet ind,
 * kommer der intet ud: null, ikke et nul. Forskellen er «vi har ikke målt»
 * mod «vi har målt nul», og den forskel er hele pointen med siden.
 */
export function regnDoeren(poster: Fund[], vagterMin: number, stoletime: number): Doeren | null {
  const v = poster.filter((p) => p.ind !== null || p.koebte !== null || p.salg !== null);
  if (v.length === 0) return null;
  const sum = (f: (p: Fund) => number | null) => v.reduce((a, p) => a + (f(p) ?? 0), 0);
  const ind = sum((p) => p.ind);
  const koebte = sum((p) => p.koebte);
  const salg = sum((p) => p.salg);
  const datoer = [...new Set(v.map((p) => p.dato))].sort();
  const min = Math.max(1, Math.trunc(vagterMin) || 1);
  return {
    vagter: v.length,
    fra: datoer[0],
    til: datoer[datoer.length - 1],
    ind, koebte, salg,
    lukke: ind > 0 ? koebte / ind : null,
    prHoved: ind > 0 ? salg / ind : null,
    indPrVagt: ind / v.length,
    nok: v.length >= min,
    mangler: Math.max(0, min - v.length),
    stoletimer: stoletime > 0 ? salg / stoletime : 0,
  };
}

/** Fund pr. opgave. Nøglen er «o1»…«o16» — samme som fremdriftstabellens. */
export function perOpgave(poster: Fund[]): Map<string, Fund[]> {
  const m = new Map<string, Fund[]>();
  for (const p of poster) {
    if (!p.opgave) continue;
    const a = m.get(p.opgave);
    if (a) a.push(p); else m.set(p.opgave, [p]);
  }
  return m;
}

/**
 * Tælling pr. område — ALLE slags med, også dem med nul. Et område ingen
 * har rørt er den mest brugbare linje i tabellen.
 */
export function perSlag(poster: Fund[], slags: string[]): [string, { n: number; seneste: string }][] {
  const m = new Map<string, { n: number; seneste: string }>();
  for (const s of slags) m.set(s, { n: 0, seneste: "" });
  for (const p of poster) {
    const r = m.get(p.slag) ?? { n: 0, seneste: "" };
    m.set(p.slag, { n: r.n + 1, seneste: p.dato > r.seneste ? p.dato : r.seneste });
  }
  return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
}
