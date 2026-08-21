import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");
const kerb = readFileSync(join(root, "components/emerge/KerbReservation.tsx"), "utf8");
const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
const css = readFileSync(join(root, "app/globals.css"), "utf8");

test("reservationerne bruger de verificerede live-varianter", () => {
  // Levende variant: 302 på et bart kald (200 hvis man følger redirect).
  // Død variant: 410. Se anvisningen i commerce.ts (Haruki, S568).
  assert.match(commerce, /53492757627208/); // reservér en tid · 100,-
  assert.match(commerce, /53463786127688/); // heldags-session · 1.000,-
  assert.match(commerce, /RESERVATIONS/);
});

test("døde piercing-varianter er IKKE i handelslaget (rails §4: ingen død handling)", () => {
  // Alle fire var 410 mod den rigtige butik 2026-08-21. En knap der ikke kan
  // købe er værre end ingen knap — de må først ind når Shopify er rettet.
  for (const dead of ["53511714570568", "53511714996552", "53511715422536", "53511715881288"]) {
    assert.doesNotMatch(commerce, new RegExp(dead), `død variant ${dead} må ikke bruges`);
  }
});

test("kridtet er en checkout-handoff uden klient-JS (rails §5)", () => {
  assert.match(kerb, /cartUrl\(/);
  // Direktivet — ikke ordet. Doc-kommentaren nævner "use client" med vilje.
  assert.doesNotMatch(kerb, /^\s*["']use client["']/m);
  assert.match(kerb, /aria-label=\{r\.aria\}/);
});

test("copy'en lover ikke en tid vi ikke har (rails §4)", () => {
  assert.match(kerb, /Trækkes fra prisen/);
  assert.match(kerb, /Tiden aftaler vi bagefter/);
  // ingen påstand om at depositummet ER en booket tid
  assert.doesNotMatch(kerb, /du har (nu )?en tid/i);
});

test("slotten er ét slot i Under gaden — og ligger over zonens bundfade", () => {
  assert.match(scene, /KerbReservation/);
  assert.match(scene, /className="kerb-slot"/);
  // Bundfaden er zIndex 9; kridtet skal ligge over den for ikke at blive dæmpet.
  // [\s\S] matcher hen over linjeskift, så testen overlever en reformatering
  // af scenen — den måler reglen, ikke hvordan filen tilfældigvis er brudt.
  const z = scene.match(/className="kerb-slot"[\s\S]{0,400}?zIndex:\s*['"]?(\d+)/);
  assert.ok(z, "kerb-slot mangler zIndex");
  assert.ok(Number(z[1]) > 9, `kerb-slot skal ligge over bundfaden (z-9), var z-${z[1]}`);
});

/**
 * Læs ÉN CSS-regels krop — bundet af sine egne krøllede parenteser.
 *
 * Tidligere klippede denne fil fra `indexOf(selector)` til filens ende. Det
 * hegn flytter sig hver gang naboen appender: da Fuglemor og gade-crew lagde
 * blokke til halen af globals.css, målte udsnittet pludselig andres CSS
 * (Haruki, S568 — samme fælde kostede #152 en runde). Nu måler vi reglen.
 */
function ruleBody(css, selector) {
  const i = css.indexOf(selector);
  assert.notEqual(i, -1, `regel ${selector} findes ikke i globals.css`);
  const open = css.indexOf("{", i);
  assert.notEqual(open, -1, `regel ${selector} har ingen krop`);
  let depth = 0;
  for (let j = open; j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}" && --depth === 0) return css.slice(open + 1, j);
  }
  throw new Error(`regel ${selector} lukker aldrig`);
}

test("mobil-placeringen bruger boks-model, ikke transform (lektionen fra #146)", () => {
  const mobile = ruleBody(css, ".emerge-v05 .kerb-slot");
  assert.match(mobile, /left: 5% !important/);
  assert.match(mobile, /right: 5% !important/);
  // Motoren ejer transform på [data-depth]-bokse — centrering er boks-model.
  assert.doesNotMatch(mobile, /transform/);
});

test("negativ kontrol: ruleBody måler reglen, ikke resten af filen", () => {
  // Vidnet på hegnet. Naboens CSS må ikke kunne læses ind i vores regel:
  // .kerb-slot-kroppen indeholder ikke fuglens eller crewets erklæringer,
  // selv om de ligger i samme fil.
  const mobile = ruleBody(css, ".emerge-v05 .kerb-slot");
  assert.doesNotMatch(mobile, /mor__|crew__|gade__/);
});
