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

test("solgt bliver til claimed — og claimed slukker købsknappen", () => {
  // Siden gater knappen bag `sold`; claimed sættes af availableForSale.
  const mod = read("lib/flash-drop.ts");
  assert.match(mod, /claimed: !p\.availableForSale/);
  const side = read("app/(emerge)/flash/page.tsx");
  assert.match(side, /const sold = f\.oneOff && f\.claimed/);
  assert.match(side, /sold \? \(/, "solgt viser «Taget», ikke en købsknap");
});

test("hvert motiv er et one-off — vej A, ét motiv én gang", () => {
  assert.match(read("lib/flash-drop.ts"), /oneOff: true/);
});

test("Storefront tavs ⇒ fallback, ikke en gætte-hylde", () => {
  // Uden env eller ved fejl falder vi tilbage til lib/flash.ts, som er tom,
  // og siden siger ærligt at næste drop er på vej (rails §4).
  assert.match(read("lib/flash-drop.ts"), /if \(!coll\.ok\) return flash;/);
  assert.match(read("lib/flash.ts"), /export const flash: FlashPiece\[\] = \[\]/);
});

test("kollektionens navn står ét sted", () => {
  // Talt uden kommentarer: navnet maa kun staa ét sted i KODEN.
  const kode = read("lib/flash-drop.ts").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.equal([...kode.matchAll(/flash-drop-01/g)].length, 1);
});

test("prisen kommer fra Shopify — ikke fra en fil i repoet", () => {
  const mod = read("lib/flash-drop.ts");
  assert.match(mod, /priceKr: Math\.round\(Number\(p\.priceAmount\)/);
  // Ingen hardcodede beløb: priserne er Emmas, og de bor i butikken.
  assert.doesNotMatch(mod, /priceKr: \d/);
});

test("et solgt motiv viser ingen pris — «Taget» er hele beskeden", () => {
  // En solgt vare har ingen tilgængelig variant, så prisen er tom. Siden må
  // ikke skrive «0 kr» — det ligner en fejl, ikke et udsolgt motiv.
  const side = read("app/(emerge)/flash/page.tsx");
  assert.match(side, /f\.priceKr > 0 \? `\$\{kr\(f\.priceKr\)\} kr` : ""/);
});
