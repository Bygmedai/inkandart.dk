import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const css = read("components/rummet/rummet.css");

const blok = (sel) => {
  const i = css.indexOf(sel + " {");
  assert.notEqual(i, -1, sel + " mangler");
  return css.slice(i, css.indexOf("}", i));
};

/**
 * To fejl paa /en/booking, maalt 1/9 2026 (Stevens fund).
 *
 * Begge var af samme slags: en regel der var rigtig for ét tilfaelde og
 * gik i stykker paa det naeste. Testene her holder paa RETTELSEN, ikke
 * paa udseendet — de siger hvad reglen skal kunne baere.
 */

test("et bookingtrin kan baere mere end ét barn", () => {
  const li = blok(".rum-booking__trin > li");
  // Flex satte broedtekst og knap ved siden af hinanden i trin 2.
  assert.doesNotMatch(li, /display:\s*flex/, "flex lagde trinnets boern paa række");
  assert.match(li, /display:\s*grid/);
  assert.match(li, /grid-template-columns:\s*28px/, "tallet skal have sin egen spalte");
  // Tallet ved trinnets FOERSTE linje, ikke midt i et femlinjers afsnit.
  assert.match(li, /align-items:\s*start/);
});

test("trinnets boern bliver i anden spalte", () => {
  // Uden denne regel fylder auto-placeringen foerste spalte paa naeste
  // raekke, og trin 2's knap havner under tallet i en 28px bred stump.
  const b = blok(".rum-booking__trin > li > *");
  assert.match(b, /grid-column:\s*2/);
});

test("trinnets tal bliver i sin egen spalte og paa foerste raekke", () => {
  const foer = blok(".rum-booking__trin > li::before");
  assert.match(foer, /grid-column:\s*1/);
  assert.match(foer, /grid-row:\s*1/);
});

test("trykmaalet paa telefonnummeret er der stadig", () => {
  // Grunden til at reglen findes. Maa ikke forsvinde med rettelsen.
  assert.match(blok(".rum-tel"), /min-height:\s*44px/);
});

test("et telefonnummer i loebende tekst spraenger ikke linjen", () => {
  const i = blok(".rum-tel--i-tekst");
  assert.match(i, /display:\s*inline\b/);
  assert.match(i, /min-height:\s*0/, "44px paa linjeboksen er praecis fejlen");
  assert.match(i, /position:\s*relative/, "trykfladen skal have noget at haenge paa");
  // Trykfladen flyttes, den fjernes ikke.
  const efter = blok(".rum-tel--i-tekst::after");
  assert.match(efter, /position:\s*absolute/);
  assert.match(efter, /inset:\s*-12px/);
});

test("den ene inline-forekomst bruger modifieren", () => {
  const s = read("app/(rummet)/en/booking/page.tsx");
  assert.match(s, /rum-tel rum-tel--i-tekst/);
});

test("telefonnumre der staar alene beholder den almindelige regel", () => {
  // Negativ kontrol: modifieren maa ikke brede sig til de frittstaaende.
  for (const p of [
    "app/(rummet)/piercing/page.tsx",
    "components/rummet/GadenFlade.tsx",
  ]) {
    const s = read(p);
    if (!s.includes("rum-tel")) continue;
    assert.doesNotMatch(s, /rum-tel--i-tekst/, p + " staar alene og skal ikke have modifieren");
  }
});
