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
  const s = read("app/(en)/(rummet)/en/booking/page.tsx");
  assert.match(s, /rum-tel rum-tel--i-tekst/);
});

test("telefonnumre der staar alene beholder den almindelige regel", () => {
  // Negativ kontrol: modifieren maa ikke brede sig til de frittstaaende.
  for (const p of [
    "app/(da)/(rummet)/piercing/page.tsx",
    "components/rummet/GadenFlade.tsx",
  ]) {
    const s = read(p);
    if (!s.includes("rum-tel")) continue;
    assert.doesNotMatch(s, /rum-tel--i-tekst/, p + " staar alene og skal ikke have modifieren");
  }
});

/**
 * S579 (2/9) — samtykket kunne ikke findes.
 *
 * Maalt i produktion: ordet «samtykke» stod 0 gange paa /booking, /,
 * /en/booking og /en. Flowet blev bygget 1/9 og var usynligt for enhver
 * kunde der ikke fik URL'en tilsendt. AC1 i docs/accept/samtykke-flow.md
 * lagde linket i Book.dks bekraeftelsesmail — en indstilling der ikke er
 * sat, og der var ingen vej paa sitet imens.
 *
 * Steven, 2/9: «samtykke skal linkes til booking, saa man automatisk
 * bliver sendt videre til /samtykke.»
 */

test("begge bookingsider har en vej til samtykket — paa deres eget sprog", () => {
  for (const [fil, href, forkert] of [
    ["app/(da)/(rummet)/booking/page.tsx", "/samtykke", "/en/samtykke"],
    ["app/(en)/(rummet)/en/booking/page.tsx", "/en/samtykke", null],
  ]) {
    const f = read(fil).replace(/\s+/g, " ");
    assert.match(f, new RegExp(`href="${href}"`), `${fil}: ingen vej til samtykket`);
    // Trinnet skal staa i trappen, ikke som loes tekst nederst.
    assert.match(f, /<ol className="rum-booking__trin">[\s\S]*?samtykke_trin/,
      `${fil}: samtykke-trinnet staar uden for trappen`);
    // Og foer depositummet: samtykket gaelder alle, depositummet kun de lange.
    assert.ok(f.indexOf("samtykke_trin") < f.indexOf("depositum_trin"),
      `${fil}: depositummet staar foer samtykket`);
    if (forkert) assert.doesNotMatch(f, new RegExp(`href="${forkert}"`), `${fil}: sender dansk kunde til engelsk flade`);
  }
});

test("tak-siden — hvor kunden lige HAR booket — foerer ogsaa videre", () => {
  for (const [fil, href] of [
    ["app/(da)/(rummet)/booking/tak/page.tsx", "/samtykke"],
    ["app/(en)/(rummet)/en/booking/tak/page.tsx", "/en/samtykke"],
  ]) {
    assert.match(read(fil), new RegExp(`href="${href}"`), `${fil}: ingen vej til samtykket`);
  }
});

test("ordene bor i indholdet, ikke i markup — og findes paa begge sprog", async () => {
  const { loadBookingCopy, loadBookingCopyEn } = await import("../lib/content.ts");
  const da = loadBookingCopy(), en = loadBookingCopyEn();
  for (const [navn, c] of [["da", da], ["en", en]]) {
    assert.ok(c.samtykke_trin.trim().length > 20, `${navn}: samtykke_trin er tom`);
    assert.ok(c.samtykke_label.trim(), `${navn}: samtykke_label er tom`);
  }
  // Negativ kontrol: de to sprog maa ikke vaere den samme streng — saa var
  // den ene fil kopieret, og den engelske kunde laeser dansk.
  assert.notEqual(da.samtykke_trin, en.samtykke_trin);
  assert.notEqual(da.samtykke_label, en.samtykke_label);
});
