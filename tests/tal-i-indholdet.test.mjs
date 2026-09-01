import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mappe = join(root, "content");

/**
 * Tal i husets indhold skrives som RENE HELTAL.
 *
 * FEJLEN DEN FANGER (S578, teamguide.yml, live). Prisen på en 7-timers
 * session blev skrevet dansk: `pris: 6.500`. YAML læser et punktum som
 * decimalkomma, så tallet blev 6,5 — og guiden fortalte holdet at en
 * session koster seks en halv krone. `1.000` blev til 1. Filen er gyldig
 * YAML, typen er stadig number, TypeScript er tilfreds, byggeriet er
 * grønt. Kun et menneske der læser prislisten kan se det.
 *
 * TO NET, FORDI ÉT IKKE ER NOK:
 *
 *  1. Den PARSEDE værdi må ikke være et kommatal. Fanger 6.500 → 6.5.
 *  2. Den RÅ tekst må ikke skrive et tal med punktum i. Fanger 1.000 → 1,
 *     som slipper forbi net 1 fordi 1 jo ER et heltal.
 *
 * Vagten UDLEDER sit område af disken: hver .yml i content/ læses, hele
 * træet gås igennem. Der er ingen liste over filer eller felter at
 * vedligeholde, så den dækker også den fil nogen tilføjer i morgen.
 *
 * Vil man have en tusindeadskiller at se på, hører den til ved visningen
 * — `tal()` i TeamguideFlade — ikke i data.
 */

const filer = readdirSync(mappe)
  .filter((f) => f.endsWith(".yml"))
  .sort();

/** Alle tal-værdier i et parset træ, med sti. */
function talIT(node, sti = "", ud = []) {
  if (typeof node === "number") ud.push([sti, node]);
  else if (Array.isArray(node)) node.forEach((v, i) => talIT(v, `${sti}[${i}]`, ud));
  else if (node && typeof node === "object")
    for (const k of Object.keys(node)) talIT(node[k], `${sti}.${k}`, ud);
  return ud;
}

/** Rå linjer hvor en uciteret skalar er skrevet som 1.234. */
const PUNKTTAL = /:\s*-?\d+\.\d+\s*(?:[,}\]]|$)/;

function raaSynderene(tekst) {
  return tekst
    .split("\n")
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => !l.trimStart().startsWith("#"))
    .flatMap(([n, l]) => {
      // en linje kan bære flere par: { ydelse: x, pris: 6.500 }
      const stykker = l.split(",");
      return stykker.some((s) => PUNKTTAL.test(s + ",")) ? [[n, l.trim()]] : [];
    });
}

test("ingen tal i content/ er blevet til et kommatal", () => {
  assert.ok(filer.length > 0, "der skal være yml-filer at kigge i");
  const fejl = [];
  for (const f of filer) {
    const d = parse(readFileSync(join(mappe, f), "utf8"));
    for (const [sti, n] of talIT(d)) {
      if (!Number.isInteger(n)) fejl.push(`${f}${sti} = ${n}`);
    }
  }
  assert.deepEqual(fejl, [], `kommatal i indholdet — skriv 6500, ikke 6.500:\n${fejl.join("\n")}`);
});

test("ingen tal i content/ er skrevet med punktum", () => {
  const fejl = [];
  for (const f of filer) {
    for (const [n, l] of raaSynderene(readFileSync(join(mappe, f), "utf8"))) {
      fejl.push(`${f}:${n}  ${l}`);
    }
  }
  assert.deepEqual(fejl, [], `tal skrevet dansk med punktum:\n${fejl.join("\n")}`);
});

test("negativ kontrol: begge net kan faktisk se en fejl", () => {
  const muteret = "priser:\n  - { ydelse: 7 timers session, pris: 6.500 }\n  - { ydelse: Timepris, pris: 1.000 }\n";
  const parset = parse(muteret);
  const kommatal = talIT(parset).filter(([, n]) => !Number.isInteger(n));
  assert.equal(kommatal.length, 1, "net 1 skal se 6.500 → 6.5");
  assert.equal(raaSynderene(muteret).length, 2, "net 2 skal se begge linjer — også 1.000 → 1");
});

test("positiv kontrol: teamguidens sessionspriser er hele kroner", () => {
  for (const f of ["teamguide.yml", "teamguide.en.yml"]) {
    const d = parse(readFileSync(join(mappe, f), "utf8"));
    const p = d.priser_tattoo.map((y) => y.pris);
    assert.ok(p.includes(6500), `${f}: 7-timers session skal stå til 6500`);
    assert.ok(p.includes(1000), `${f}: timeprisen skal stå til 1000`);
    assert.ok(p.every(Number.isInteger), `${f}: alle priser skal være heltal`);
  }
});
