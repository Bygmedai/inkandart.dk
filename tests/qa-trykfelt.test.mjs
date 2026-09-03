import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kilde = readFileSync(join(root, "scripts/qa/vagt.mjs"), "utf8");

/**
 * `trykfelt()` — vagtens regel for hvor stort et link ER under fingeren.
 *
 * HVORFOR DEN HAR SIN EGEN PROEVE
 *
 * Reglen blev skrevet 2/9 for at fjerne ti falske fund om husets
 * telefonlink (85×20 i kassen, 93×44 under fingeren via et absolut
 * ::after). Den blev maalt mod produktionen: 33 fund → 0.
 *
 * Men da jeg mutationstestede den, gik TRE af vagterne i reglen groenne
 * ved at blive fjernet — `Math.max`, static-tjekket og et `Math.min(0,…)`
 * jeg selv havde skrevet. Ingen flade i traeet bruger dem i dag, saa en
 * maaling mod produktionen kan ikke skelne. `Math.min(0,…)` viste sig at
 * vaere doed kode og blev fjernet; de to andre er ægte vagter mod noget
 * der ikke findes ENDNU.
 *
 * En regel der kun kan proeves mod tilfaeldigheden i dagens markup, er
 * ikke proevet. Derfor koeres funktionens EGEN kildetekst her mod
 * syntetisk geometri — saa den dag nogen skriver et ::after med positiv
 * inset, eller et stort ::after paa en static forfader, er svaret
 * allerede skrevet ned.
 */

const src = kilde.match(/\n {2}function trykfelt\(el\) \{[\s\S]*?\n {2}\}/);
assert.ok(src, "fandt ikke trykfelt() i scripts/qa/vagt.mjs — er den doebt om?");

/** Bygger funktionen med en stubbet getComputedStyle. */
function lav(stil) {
  const gcs = (el, pseudo) => stil(pseudo ?? null);
  return new Function("getComputedStyle", `${src[0]}\nreturn trykfelt;`)(gcs);
}
const kasse = (width, height) => ({ getBoundingClientRect: () => ({ width, height }) });
const ingen = { content: "none", position: "static", top: "auto", right: "auto", bottom: "auto", left: "auto" };
const pseudo = (t, h, b, v) => ({ content: '""', position: "absolute", top: `${t}px`, right: `${h}px`, bottom: `${b}px`, left: `${v}px` });

test("et negativt inset UDVIDER feltet — husets .rum-tel-greb", () => {
  const f = lav((p) => (p === "::after" ? pseudo(-12, -4, -12, -4) : p ? ingen : { position: "relative" }));
  const r = f(kasse(85, 20));
  assert.equal(r.bredde, 93);
  assert.equal(r.hoejde, 44, "20px + 12 + 12 skulle give 44");
});

test("et POSITIVT inset kroeller indad og maa aldrig taelle som udvidelse", () => {
  // Uden Math.max ville 20 - 12 - 12 give -4, og et -4px felt ville
  // sortere under kravet paa en maade der ligner et fund, men af den
  // forkerte grund. Med Math.max staar kassen uroert.
  const f = lav((p) => (p === "::after" ? pseudo(12, 4, 12, 4) : p ? ingen : { position: "relative" }));
  const r = f(kasse(85, 20));
  assert.equal(r.bredde, 85, "en indadgaaende pseudo formindskede feltet");
  assert.equal(r.hoejde, 20, "en indadgaaende pseudo formindskede feltet");
});

test("er elementet STATIC, hoerer pseudoen til en anden kasse — den taeller ikke", () => {
  // Et absolut ::after positionerer sig mod naermeste positionerede
  // forfader. Er elementet selv static, ligger feltet et andet sted paa
  // siden end det link det skulle daekke — og et stort tal derfra ville
  // faa et 16px-link til at se rigeligt ud.
  const f = lav((p) => (p === "::after" ? pseudo(-40, -40, -40, -40) : p ? ingen : { position: "static" }));
  const r = f(kasse(85, 20));
  assert.equal(r.hoejde, 20, "en pseudo paa en static kasse blev regnet med");
});

test("«auto» og «none» er ikke maal — de springes over", () => {
  const f = lav((p) => (p ? ingen : { position: "relative" }));
  assert.deepEqual(f(kasse(85, 20)), { bredde: 85, hoejde: 20 });
  const g = lav((p) =>
    p === "::after" ? { content: '""', position: "absolute", top: "auto", right: "-4px", bottom: "auto", left: "-4px" }
      : p ? ingen : { position: "relative" });
  assert.equal(g(kasse(85, 20)).hoejde, 20, "et halvt inset blev regnet som helt");
});

test("en pseudo der ikke er ABSOLUT flytter sig selv — den udvider ingenting", () => {
  // `position: relative` med negativ inset forskyder pseudoen i forhold
  // til dens egen plads i flowet. Den tegner altsaa et sted ved siden af
  // linket — den laegger ikke et trykfelt oven paa det. Regnede vagten
  // den med, ville et hvilket som helst dekorativt ::before kunne faa et
  // for lille link til at bestaa.
  const f = lav((p) =>
    p === "::after"
      ? { content: '""', position: "relative", top: "-12px", right: "-4px", bottom: "-12px", left: "-4px" }
      : p ? ingen : { position: "relative" });
  const r = f(kasse(85, 20));
  assert.equal(r.hoejde, 20, "en relativ pseudo blev regnet som et trykfelt");
  assert.equal(r.bredde, 85, "en relativ pseudo blev regnet som et trykfelt");
});

test("::before taeller ogsaa — greb bygges begge veje", () => {
  const f = lav((p) => (p === "::before" ? pseudo(-14, -4, -14, -4) : p ? ingen : { position: "relative" }));
  assert.equal(f(kasse(169, 16)).hoejde, 44);
});
