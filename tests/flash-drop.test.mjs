import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const fixture = JSON.parse(read("tests/fixtures/flash-drop-collection.json"));

/**
 * Flash-drop (Stevens kald 30/8, docs/accept/flash-drop.md — vej A).
 *
 * Det der skal bevises her er MODSAT hylden: et solgt motiv må ikke
 * forsvinde. Hylden filtrerer varer uden availableForSale fra; flash
 * beholder dem og mærker dem «Taget». Filtrerer nogen dem fra igen, går
 * knapheden i stykker uden at nogen kan se det.
 */

// NB (Villy, S576): efter #245 A1 gaar den LEVENDE vej gennem
// lib/lager-regler.ts, ikke gennem parseCollectionProductsMedSolgte.
// Proeven nedenfor vogter derfor Groks parser, som Haruki har bedt om at
// lade staa — men den vogter ikke laengere det /flash faktisk goer.
// Den levende vej proeves i tests/lager.test.mjs. Sagt hoejt, fordi en
// groen proeve der ikke maaler det man tror er vaerre end ingen proeve.
test("et solgt motiv bliver stående — det filtreres IKKE fra", async () => {
  const { parseCollectionProductsMedSolgte, parseCollectionProducts } =
    await import("../lib/storefront.ts");
  const p = parseCollectionProductsMedSolgte(fixture);
  assert.equal(p.length, 2, "begge motiver, også det solgte");
  const solgt = p.find((x) => x.handle === "dolk-haandflade");
  assert.equal(solgt.availableForSale, false, "det solgte er markeret solgt");

  // NEGATIV KONTROL: hyldens egen parser skal STADIG filtrere det solgte fra.
  // Rører nogen den, faar hylden en doed koebsknap (rails §4) — og saa er de
  // to stier smeltet sammen uden at nogen har besluttet det.
  const hylden = parseCollectionProducts(fixture);
  assert.equal(hylden.length, 1, "hylden skjuler stadig det solgte");
});

test("solgt bliver til claimed — og claimed slukker købsknappen", async () => {
  // Adfaerd, ikke kildetekst: en «taget» vare skal komme ud som claimed OG
  // uden variantId, saa siden ikke kan rende en koebsknap paa noget der er
  // vaek — heller ikke ved en fejl i view-laget.
  const { tilFlashPieces } = await import("../lib/lager-regler.ts");
  const [taget] = tilFlashPieces([
    { handle: "dolk", titel: "Dolk", billede: "", prisKr: 450, variantId: "1",
      lager: { status: "taget", antal: 0, grund: "" } },
  ]);
  assert.equal(taget.claimed, true, "taget bliver til claimed");
  assert.equal(taget.variantId, undefined, "et taget motiv baerer ingen variant");

  const side = read("app/(da)/(emerge)/flash/page.tsx");
  assert.match(side, /const sold = f\.oneOff && f\.claimed/);
  assert.match(side, /sold \? \(/, "solgt viser «Taget», ikke en købsknap");
});

test("hvert motiv er et one-off — vej A, ét motiv én gang", () => {
  assert.match(read("lib/lager-regler.ts"), /oneOff: true/);
});

test("Storefront tavs ⇒ fallback, ikke en gætte-hylde", () => {
  // Uden env eller ved fejl falder vi tilbage til lib/flash.ts, som er tom,
  // og siden siger ærligt at næste drop er på vej (rails §4).
  assert.match(read("lib/flash-drop.ts"), /if \(!svar\.ok\) return flash;/);
  assert.match(read("lib/flash.ts"), /export const flash: FlashPiece\[\] = \[\]/);
});

test("kollektionens navn står ét sted", () => {
  // Talt uden kommentarer: navnet maa kun staa ét sted i KODEN.
  const kode = read("lib/flash-drop.ts").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.equal([...kode.matchAll(/flash-drop-01/g)].length, 1);
});

test("prisen kommer fra Shopify — ikke fra en fil i repoet", async () => {
  const { tilFlashPieces } = await import("../lib/lager-regler.ts");
  const [ledig] = tilFlashPieces([
    { handle: "rose", titel: "Rose", billede: "", prisKr: 812, variantId: "9",
      lager: { status: "ledig", antal: 1, grund: "" } },
  ]);
  assert.equal(ledig.priceKr, 812, "prisen kommer fra butikken, uaendret");

  // Ingen hardcodede beloeb: priserne er Emmas, og de bor i butikken.
  // (0 er tilladt — det er «taget», altsaa fravaeret af en pris.)
  const kode = read("lib/lager-regler.ts").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.doesNotMatch(kode, /priceKr: [1-9]/);
});

test("et solgt motiv viser ingen pris — «Taget» er hele beskeden", () => {
  // En solgt vare har ingen tilgængelig variant, så prisen er tom. Siden må
  // ikke skrive «0 kr» — det ligner en fejl, ikke et udsolgt motiv.
  const side = read("app/(da)/(emerge)/flash/page.tsx");
  assert.match(side, /f\.priceKr > 0 \? `\$\{kr\(f\.priceKr\)\} kr` : ""/);
});
