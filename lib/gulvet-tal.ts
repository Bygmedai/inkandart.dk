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

import type { Fund, GulvetFase } from "./gulvet-typer";

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

/* ------------------------------------------------------------- ugedagene
 *
 * Det huset aldrig har vidst: er søndag værd at holde åbent? Hver vagt har en
 * dato, så ugedagen er gratis. Tallene er pr. vagt, ikke i alt — ellers
 * vinder den dag der tilfældigvis er talt flest gange.
 */

export const UGEDAGE = ["man", "tir", "ons", "tor", "fre", "lør", "søn"] as const;

export type Ugedag = {
  dag: (typeof UGEDAGE)[number];
  vagter: number;
  indPrVagt: number;
  lukke: number | null;
  salgPrVagt: number;
};

/** JS: søndag = 0. Vi tæller mandag = 0, så listen læser som en uge. */
function ugedagIndeks(dato: string): number {
  const d = new Date(`${dato}T12:00:00Z`).getUTCDay();
  return (d + 6) % 7;
}

export function perUgedag(poster: Fund[]): Ugedag[] {
  const v = poster.filter((p) => p.ind !== null || p.koebte !== null || p.salg !== null);
  const akk = UGEDAGE.map((dag) => ({ dag, vagter: 0, ind: 0, koebte: 0, salg: 0 }));
  for (const p of v) {
    const a = akk[ugedagIndeks(p.dato)];
    a.vagter += 1; a.ind += p.ind ?? 0; a.koebte += p.koebte ?? 0; a.salg += p.salg ?? 0;
  }
  return akk.map((a) => ({
    dag: a.dag,
    vagter: a.vagter,
    indPrVagt: a.vagter ? a.ind / a.vagter : 0,
    lukke: a.ind > 0 ? a.koebte / a.ind : null,
    salgPrVagt: a.vagter ? a.salg / a.vagter : 0,
  }));
}

/* ------------------------------------------------------------ uge for uge */

/** ISO-uge som «2026-W36». Samme nøgle som gulvet_analyse.uge, så de to kan joines. */
export function isoUge(dato: string): string {
  const d = new Date(`${dato}T12:00:00Z`);
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const aar = d.getUTCFullYear();
  const start = new Date(Date.UTC(aar, 0, 1));
  const uge = Math.ceil(((d.getTime() - start.getTime()) / 86_400_000 + 1) / 7);
  return `${aar}-W${String(uge).padStart(2, "0")}`;
}

export type Uge = {
  uge: string;
  vagter: number;
  ind: number;
  koebte: number;
  salg: number;
  indPrVagt: number;
  lukke: number | null;
  noter: number;
};

export function perUge(poster: Fund[]): Uge[] {
  const m = new Map<string, Uge>();
  for (const p of poster) {
    const k = isoUge(p.dato);
    const u = m.get(k) ?? { uge: k, vagter: 0, ind: 0, koebte: 0, salg: 0, indPrVagt: 0, lukke: null, noter: 0 };
    u.noter += 1;
    if (p.ind !== null || p.koebte !== null || p.salg !== null) {
      u.vagter += 1; u.ind += p.ind ?? 0; u.koebte += p.koebte ?? 0; u.salg += p.salg ?? 0;
    }
    m.set(k, u);
  }
  return [...m.values()]
    .map((u) => ({ ...u, indPrVagt: u.vagter ? u.ind / u.vagter : 0, lukke: u.ind > 0 ? u.koebte / u.ind : null }))
    .sort((a, b) => (a.uge < b.uge ? -1 : 1));
}

/* ---------------------------------------------------------------- svartid
 *
 * Målet på om huset holder sin ende. Et spørgsmål der venter er ikke Sonjas
 * problem; det er husets. Median, ikke gennemsnit — ét glemt spørgsmål på
 * tre uger må ikke skjule at de andre fik svar samme dag.
 */

export type Svartid = { besvarede: number; aabne: number; medianDage: number | null; aeldsteAabenDage: number | null };

export function svartid(poster: Fund[], nu = new Date()): Svartid {
  const dage = (a: string, b: string) => Math.max(0, (Date.parse(b) - Date.parse(a)) / 86_400_000);
  const besv: number[] = [];
  let aabne = 0;
  let aeldste: number | null = null;
  for (const p of poster) {
    if (!p.spoergsmaal) continue;
    if (p.svar) {
      if (p.svar_paa) besv.push(dage(p.oprettet, p.svar_paa));
    } else {
      aabne += 1;
      const d = dage(p.oprettet, nu.toISOString());
      if (aeldste === null || d > aeldste) aeldste = d;
    }
  }
  besv.sort((a, b) => a - b);
  const median = besv.length
    ? besv.length % 2 ? besv[(besv.length - 1) / 2] : (besv[besv.length / 2 - 1] + besv[besv.length / 2]) / 2
    : null;
  return { besvarede: besv.length, aabne, medianDage: median, aeldsteAabenDage: aeldste };
}

/* ------------------------------------------------------ plan mod virkelighed
 *
 * Uge 2 skulle have otte opgaver klaret. Hvor mange er det? Én linje, og
 * den er ærlig. Uden startdato kan der ikke regnes — så siger vi det.
 */

export type Plan = { ugeNr: number; forventet: number; klaret: number; bagud: number } | null;

export function planModVirkelighed(
  fremdrift: Record<string, boolean>,
  faser: GulvetFase[],
  start: string,
  nu = new Date(),
): Plan {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return null;
  const dage = Math.floor((nu.getTime() - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
  if (dage < 0) return { ugeNr: 0, forventet: 0, klaret: Object.values(fremdrift).filter(Boolean).length, bagud: 0 };
  const ugeNr = Math.min(faser.length, Math.floor(dage / 7) + 1);
  const forventet = faser.slice(0, ugeNr).reduce((a, f) => a + (f.til - f.fra), 0);
  const klaret = Object.values(fremdrift).filter(Boolean).length;
  return { ugeNr, forventet, klaret, bagud: Math.max(0, forventet - klaret) };
}

/* ---------------------------------------------------------- tilstand / rytme
 *
 * «Nu» er enten oplæring (én opgave ad gangen) eller rytme (I dag / uge /
 * venter). YAML kan sætte tilstand direkte; ellers skifter runtime når
 * måneden er klaret, eller når fire uger og nok vagter er i huset.
 */

export type GulvetTilstand = "oplæring" | "rytme";

export function effectiveTilstand({
  tilstand,
  fremdrift,
  opgaveAntal,
  start,
  vagterMin,
  vagterTalt,
  nu = new Date(),
}: {
  tilstand: GulvetTilstand | string;
  fremdrift: Record<string, boolean>;
  opgaveAntal: number;
  start: string;
  vagterMin: number;
  vagterTalt: number;
  nu?: Date;
}): GulvetTilstand {
  if (tilstand === "rytme") return "rytme";

  const n = Math.max(0, Math.trunc(opgaveAntal) || 0);
  if (n > 0) {
    let alle = true;
    for (let i = 1; i <= n; i++) {
      if (!fremdrift[`o${i}`]) { alle = false; break; }
    }
    if (alle) return "rytme";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    const dage = Math.floor((nu.getTime() - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
    const min = Math.max(1, Math.trunc(vagterMin) || 1);
    if (dage >= 28 && vagterTalt >= min) return "rytme";
  }

  return "oplæring";
}
