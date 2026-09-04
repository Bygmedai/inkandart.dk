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

/**
 * S580 (4/9) — trin 1 stod tomt. Maalt som kunde paa /booking: tallet «1»
 * alene, og «Book din tid» centreret under en tom linje — den vigtigste
 * knap paa siden lignede en layoutfejl. Trin 2 og 3 havde en saetning;
 * trin 1 havde ingen. Nu har alle tre trin ord, paa begge sprog.
 */
test("trin 1 har en saetning — paa begge sprog, og ikke den samme", async () => {
  const { loadBookingCopy, loadBookingCopyEn } = await import("../lib/content.ts");
  const da = loadBookingCopy(), en = loadBookingCopyEn();
  assert.ok(da.book_trin.trim().length > 20, "da: book_trin er tom");
  assert.ok(en.book_trin.trim().length > 20, "en: book_trin er tom");
  assert.notEqual(da.book_trin, en.book_trin);
  for (const fil of [
    "app/(da)/(rummet)/booking/page.tsx",
    "app/(en)/(rummet)/en/booking/page.tsx",
  ]) {
    const f = read(fil).replace(/\s+/g, " ");
    // Saetningen staar i trin 1 — FOER doeren, i samme <li>.
    assert.match(f, /<ol className="rum-booking__trin"> <li> \{copy\.book_trin \?[\s\S]*?<BookDoor/,
      `${fil}: trin 1's saetning staar ikke foer doeren`);
  }
});

/**
 * S580 (4/9, Stevens fund) — kunden strandede efter bookingen.
 *
 * Maalt som kunde: /booking → hop til inkart.book.dk → «Bekraeft booking»
 * → Book.dks egen tak-side, «Du betaler ved fremmoede», Book flere tider.
 * Ingen vej tilbage til samtykket (trin 2) eller depositummet (trin 3);
 * de laa paa den side hun havde forladt. Book.dk har ingen «redirect
 * efter booking». Saa bookingen ligger nu INDE paa /booking, og trin 2
 * staar lige under rammen — paa samme side.
 */
test("bookingen ligger i rummet — rammen staar i trin 1, foer samtykket", () => {
  for (const [fil, lang] of [
    ["app/(da)/(rummet)/booking/page.tsx", "da"],
    ["app/(en)/(rummet)/en/booking/page.tsx", "en"],
  ]) {
    const f = read(fil).replace(/\s+/g, " ");
    assert.match(f, new RegExp(`<BookRummet lang="${lang}" />`), `${fil}: Book.dk-rammen mangler eller har forkert sprog`);
    const trin = f.slice(f.indexOf('<ol className="rum-booking__trin">'), f.indexOf("</ol>"));
    const ramme = trin.indexOf("<BookRummet"), doer = trin.indexOf("<BookDoor"), samtykke = trin.indexOf("samtykke_trin");
    assert.ok(ramme !== -1 && ramme < doer, `${fil}: rammen skal staa foer fald-tilbage-linket`);
    assert.ok(doer < samtykke, `${fil}: samtykket skal staa lige under bookingen`);
    // Fald-tilbage-linket er stadig doeren — men det hedder det det er.
    assert.match(f, /copy\.door_fuld_label \|\| copy\.door_label/, `${fil}: fald-tilbage-linket bruger ikke sin egen tekst`);
  }
});

test("rammen er Book.dk, faar hoejde af skaermen, og virker uden JS", () => {
  const k = read("components/rummet/BookRummet.tsx");
  assert.match(k, /https:\/\/inkart\.book\.dk\//);
  assert.match(k, /<iframe/);
  assert.match(k, /title=\{titel\}/, "rammen skal have en titel til skaermlaesere");
  assert.doesNotMatch(k, /"use client"/, "en iframe har ikke brug for JS");
  const ramme = blok(".rum-bookrum__ramme");
  assert.match(ramme, /dvh/, "hoejden skal foelge skaermen — Book.dk siger ikke hvor hoej den er");
  assert.match(ramme, /min-height:\s*5\d\dpx/, "et gulv under hoejden, saa et lille vindue ikke klemmer flowet");
  assert.doesNotMatch(ramme, /height:\s*1000px/, "Book.dks 1000px lagde «Videre» under folden paa en telefon");
});

test("paa en telefon faar rammen hele bredden — ikke 301px i anden spalte", () => {
  // Reglen ligger i en max-width-medie; blok() finder den paa selektoren.
  const bred = blok(".rum-booking__trin > li > .rum-bookrum");
  assert.match(bred, /grid-column:\s*1\s*\/\s*-1/);
  const i = css.indexOf(".rum-booking__trin > li > .rum-bookrum {");
  const foer = css.slice(Math.max(0, i - 200), i);
  assert.match(foer, /@media \(max-width: 899px\)/, "kun paa smaa skaerme — paa desktop er spalten bred nok");
});

test("trin 1's ord siger at naeste skridt er lige nedenunder — begge sprog", async () => {
  const { loadBookingCopy, loadBookingCopyEn } = await import("../lib/content.ts");
  const da = loadBookingCopy(), en = loadBookingCopyEn();
  assert.match(da.book_trin, /nedenunder/i);
  assert.match(en.book_trin, /right below/i);
  // Den engelske kunde moeder en dansk Book.dk. Ordene skal oversaettes for hende.
  assert.match(en.book_trin, /Videre/, "en: forklar «Videre»");
  assert.match(en.book_trin, /Bekræft booking/, "en: forklar «Bekræft booking»");
  assert.ok(da.door_fuld_label.trim() && en.door_fuld_label.trim(), "fald-tilbage-linket mangler tekst");
  assert.notEqual(da.door_fuld_label, en.door_fuld_label);
});
