/**
 * Tidsrum formateret til én linje.
 *
 * Ingen runtime-imports, saa reglen kan proeves uden en browser — og saa
 * lib/content.ts kan bruge den uden at blive alias-afhaengig.
 *
 * Dagene kommer fra ordbogen (de er etiketter, ikke nogens ord).
 * Klokkeslettene kommer fra data og staar ens paa begge sprog.
 */

export type Tidsrum = {
  /** man tir ons tor fre loer son */
  dage: string[];
  fra: string;
  til: string;
};

export type TiderTekster = {
  og: string;
  dag: Record<string, string>;
};

/** «tirsdag og onsdag», «fredag, lørdag og søndag», «torsdag». */
export function dagerække(dage: string[], t: TiderTekster): string {
  const navne = dage.map((d) => t.dag[d]).filter(Boolean);
  if (navne.length === 0) return "";
  if (navne.length === 1) return navne[0];
  return `${navne.slice(0, -1).join(", ")} ${t.og} ${navne[navne.length - 1]}`;
}

/**
 * Kun linjens FOERSTE tegn stort-skrives. Ordbogen holder dagene som de ser
 * ud midt i en saetning — smaa paa dansk, store paa engelsk — saa den ene
 * regel giver korrekt sprog begge steder. «Tirsdag og Onsdag» var forkert
 * dansk (maalt 31/8).
 */
function stort(l: string): string {
  return l.charAt(0).toUpperCase() + l.slice(1);
}

/** Ét tidsrum: «tirsdag og onsdag 13–23». Ustorskrevet. */
export function tidsrumLinje(r: Tidsrum, t: TiderTekster): string {
  const dage = dagerække(r.dage, t);
  return dage ? `${dage} ${r.fra}–${r.til}` : "";
}

/**
 * Alle tidsrum paa én linje, adskilt af «·».
 * «Tirsdag og onsdag 13–23 · torsdag 16–02.30 · fredag og lørdag 19–05.30»
 */
export function formatTider(tider: Tidsrum[], t: TiderTekster): string {
  const linjer = tider.map((r) => tidsrumLinje(r, t)).filter(Boolean);
  return linjer.length ? stort(linjer.join(" · ")) : "";
}

/** Som liste, ét tidsrum pr. punkt — hvert punkt storskrevet. */
export function tiderListe(tider: Tidsrum[], t: TiderTekster): string[] {
  return tider.map((r) => tidsrumLinje(r, t)).filter(Boolean).map(stort);
}

/**
 * Alle tidsrum paa én linje, UDEN stort begyndelsesbogstav.
 *
 * Til interpolation midt i en saetning — FAQ'ens svar laeser
 * «Walk-in naar der er en fri stol — {tider}.» Paa dansk skal dagen vaere
 * lille dér; paa engelsk er den stor i forvejen, fordi ordbogen holder den
 * saadan. Samme regel, to korrekte sprog.
 */
export function formatTiderIndlejret(tider: Tidsrum[], t: TiderTekster): string {
  return tider.map((r) => tidsrumLinje(r, t)).filter(Boolean).join(" · ");
}
