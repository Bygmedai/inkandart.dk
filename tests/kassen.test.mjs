import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const udenKommentarer = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * Kassen paa husets eget domaene (S578, 2/9 2026).
 *
 * Fejlen vidnet er foedt af: kunden tastede sit kort paa
 * `d1qp54-0w.myshopify.com` — et navn hun aldrig har hoert om. Det stod i
 * bekraeftelsesmailen fra Book.dk OG paa sitets egne handelsflader.
 *
 * Loesningen er to domaener med hver sin opgave: kassen (det kunden ser)
 * og API'et (det koden taler med). Vidnet her holder dem adskilt — for den
 * dag nogen «rydder op» og laegger dem sammen igen, flytter API-kaldene
 * med, og Hylden bliver tom uden at nogen test siger noget.
 */

test("kassen bygges af KASSE-variablen — med API-domaenet som fallback", async () => {
  // Foerste import: uden KASSE sat. Skal falde tilbage til API-domaenet,
  // saa et repo uden variablen opfoerer sig som foer.
  delete process.env.NEXT_PUBLIC_SHOPIFY_KASSE;
  process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN = "api.example.test";
  const a = await import("../lib/commerce.ts?fallback");
  assert.equal(a.kassensDomaene(), "api.example.test");
  assert.match(a.cartUrl("1"), /^https:\/\/api\.example\.test\/cart\/1:1/);

  // Anden import: KASSE sat. Kurv-links flytter; API-domaenet roeres ikke.
  process.env.NEXT_PUBLIC_SHOPIFY_KASSE = "butik.example.test";
  const b = await import("../lib/commerce.ts?kasse");
  assert.equal(b.kassensDomaene(), "butik.example.test");
  assert.match(b.cartUrl("1"), /^https:\/\/butik\.example\.test\/cart\/1:1/);
  assert.match(b.GIFT_CARD_PRODUCT_URL, /^https:\/\/butik\.example\.test\//);
  // S580: kassen har et sprog. Engelske sider skal aabne den engelske kasse
  // (`/en/cart/`), og dansk er standard saa gamle kald ikke flytter sig.
  assert.match(b.cartUrl("1", "en"), /^https:\/\/butik\.example\.test\/en\/cart\/1:1\?skip_shop_pay=true$/);
  assert.match(b.cartUrl("1", "da"), /^https:\/\/butik\.example\.test\/cart\/1:1\?skip_shop_pay=true$/);
  assert.equal(b.cartUrl("1"), b.cartUrl("1", "da"));
  assert.equal(b.giftCartUrl("2", "en"), b.cartUrl("2", "en"));
  assert.match(b.WALKIN_PRODUCT_URL, /^https:\/\/butik\.example\.test\//);
});

test("API'et laeser ALDRIG kassens variabel", () => {
  // Storefront og Admin skal blive paa myshopify. Laeser nogen af dem
  // KASSE, er det praecis den sammenblanding vidnet findes for at fange.
  for (const f of ["lib/storefront.ts", "lib/depositum.ts", "app/api/subscribe/route.ts"]) {
    assert.doesNotMatch(
      udenKommentarer(read(f)),
      /NEXT_PUBLIC_SHOPIFY_KASSE/,
      `${f} laeser kassens domaene — API-kald skal blive paa myshopify`,
    );
  }
});

test("kun commerce.ts bygger kunde-URL'er til Shopify", () => {
  // En cart-permalink der bygges et andet sted, foelger ikke med naar
  // kassen flytter. Alle skal gaa gennem cartUrl()/KASSE_DOMAIN.
  const fil = (f) => udenKommentarer(read(f));
  const kilder = ["lib/commerce.ts", "lib/storefront.ts", "lib/depositum.ts", "lib/klik.ts"];
  const bygger = kilder.filter((f) => /https:\/\/\$\{[^}]+\}\/cart\//.test(fil(f)));
  assert.deepEqual(bygger, ["lib/commerce.ts"], `cart-URL'er bygges ogsaa i: ${bygger}`);
});

test("ingen stil eller sporing haenger paa et bestemt kassedomaene", () => {
  // CSS'en stylede koebsknapper med a[href*="myshopify.com/cart/"]. Flytter
  // kassen, mister knapperne deres stil uden at nogen test gaar roed.
  // Samme med klik-sporingen. Begge skal kende /cart/, ikke domaenet.
  const css = udenKommentarer(read("app/globals.css"));
  assert.doesNotMatch(css, /myshopify\.com\/cart/, "CSS binder stilen til myshopify-domaenet");
  assert.match(css, /a\[href\*="\/cart\/"\]/, "koebsflade-reglen findes ikke laengere");

  const klik = udenKommentarer(read("lib/klik.ts"));
  assert.doesNotMatch(klik, /myshopify/, "klik-sporingen kender et bestemt domaene");
  assert.match(klik, /includes\("\/cart\/"\)/, "klik-sporingen genkender ikke en kurv");
});

test("negativ kontrol: vidnet ville fange en sammenblanding", () => {
  // Samme regel koert mod en opdigtet storefront der laeser KASSE.
  const opdigtet = `const d = process.env.NEXT_PUBLIC_SHOPIFY_KASSE || "x";`;
  assert.match(udenKommentarer(opdigtet), /NEXT_PUBLIC_SHOPIFY_KASSE/);
  // og mod opdigtet CSS der binder til domaenet
  const css = `main a[href*="myshopify.com/cart/"] { color: red }`;
  assert.match(css, /myshopify\.com\/cart/);
});

/**
 * S580 (4/9 2026) — maalt som kunde: fra /en/booking/tak aabnede kassen paa
 * dansk. Shopify HAR engelsk publiceret; det manglede kun praefikset paa
 * permalinket. De engelske flader der bygger kurv-links direkte skal bede
 * om den engelske kasse; komponenter med `lang` sender det videre.
 */
test("engelske flader aabner den engelske kasse", () => {
  const fil = (f) => udenKommentarer(read(f));
  for (const f of [
    "app/(en)/(rummet)/en/booking/tak/page.tsx",
    "app/(en)/(emerge)/en/flash/page.tsx",
  ]) {
    assert.match(fil(f), /cartUrl\([^)]*,\s*"en"\)/, `${f}: kurv-link uden engelsk kasse`);
    assert.doesNotMatch(fil(f), /cartUrl\([^,)]+\)/, `${f}: kurv-link der falder tilbage til dansk`);
  }
  for (const [f, fn] of [
    ["components/emerge/KerbReservation.tsx", "cartUrl"],
    ["components/rummet/GavekortKoeb.tsx", "giftCartUrl"],
  ]) {
    assert.match(fil(f), new RegExp(`${fn}\\([^)]*,\\s*lang\\)`), `${f}: sender ikke sproget med til kassen`);
  }
  // Negativ kontrol: den danske tak-side maa IKKE bede om den engelske kasse.
  assert.doesNotMatch(fil("app/(da)/(rummet)/booking/tak/page.tsx"), /cartUrl\([^)]*"en"\)/);
});
