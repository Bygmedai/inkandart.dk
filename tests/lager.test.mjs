import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

const { lagerstatus, tilFlashPieces, laesFlashVarer, FLASH_QUERY, VARIANT_QUERY } =
  await import("../lib/lager-regler.ts");

/**
 * Fail-closed på lager (Haruki #245 A1 / B1).
 *
 * Fejlen der skal blive ved med at være lukket: alle 20 produkter i butikken
 * havde `tracksInventory: false` (målt 31/8). En utrakteret variant svarer
 * `availableForSale: true` for evigt, så `claimed: !availableForSale` kunne
 * aldrig blive sand, «Taget» renderede aldrig, og et unikt motiv kunne
 * sælges ti gange.
 *
 * Prøverne her er adfærd, ikke kildetekst — reglen er hele leverancen.
 */

const v = (o) => ({ availableForSale: true, currentlyNotInStock: false, ...o });

test("trakteret og på lager ⇒ ledig", () => {
  const l = lagerstatus(v({ quantityAvailable: 1 }));
  assert.equal(l.status, "ledig");
  assert.equal(l.antal, 1);
});

test("trakteret og udsolgt ⇒ taget — det bliver stående", () => {
  const l = lagerstatus(v({ availableForSale: false, quantityAvailable: 0 }));
  assert.equal(l.status, "taget", "et solgt motiv må ikke forsvinde");
});

test("UTRAKTERET ⇒ ubevist — det er hele fejlen der lukkes her", () => {
  // Signaturen på en utrakteret variant: siger «til salg», har intet lager
  // at bakke det op med. Den gamle regel (!availableForSale) læste den som
  // ledig, for evigt, uanset hvor mange gange motivet blev solgt.
  const l = lagerstatus(v({ quantityAvailable: 0 }));
  assert.equal(l.status, "ubevist");
  assert.match(l.grund, /bakker ikke sit eget salg op/);
});

test("intet lagertal ⇒ ubevist — også når det er nøglen der mangler scope", () => {
  const l = lagerstatus(v({ quantityAvailable: null }));
  assert.equal(l.status, "ubevist");
  assert.match(l.grund, /unauthenticated_read_product_inventory/,
    "grunden skal kunne læses af et menneske der skal fikse nøglen");
});

test("restordre ⇒ ubevist — den kan købes uden lager", () => {
  // currentlyNotInStock: kan købes UDEN at være på lager. Præcis den
  // dobbeltsalgs-vej vi lukker, og den ville ellers se ledig ud.
  const l = lagerstatus(v({ quantityAvailable: 5, currentlyNotInStock: true }));
  assert.equal(l.status, "ubevist");
});

test("ingen variant ⇒ ubevist, ikke et kraks", () => {
  for (const raa of [null, undefined, "", 7, []]) {
    assert.equal(lagerstatus(raa).status, "ubevist", `${JSON.stringify(raa)}`);
  }
});

test("ubevist vises ikke · taget bliver stående uden købsvej", () => {
  const kort = tilFlashPieces([
    { handle: "a", titel: "Ledig", billede: "", prisKr: 450, variantId: "11",
      lager: { status: "ledig", antal: 1, grund: "" } },
    { handle: "b", titel: "Taget", billede: "", prisKr: 450, variantId: "22",
      lager: { status: "taget", antal: 0, grund: "" } },
    { handle: "c", titel: "Utrakteret", billede: "", prisKr: 450, variantId: "33",
      lager: { status: "ubevist", antal: 0, grund: "utrakteret" } },
  ]);

  assert.deepEqual(kort.map((k) => k.id), ["a", "b"], "den ubeviste vises ikke");

  const taget = kort.find((k) => k.id === "b");
  assert.equal(taget.claimed, true);
  assert.equal(taget.variantId, undefined, "et taget motiv bærer ingen variant");
  assert.equal(taget.priceKr, 0, "«Taget» er hele beskeden — ingen pris");

  const ledig = kort.find((k) => k.id === "a");
  assert.equal(ledig.variantId, "11");
  assert.equal(ledig.claimed, false);
});

test("parseren dømmer hver vare — utrakteret ryger ud hele vejen igennem", () => {
  const svar = {
    collection: {
      handle: "flash-drop-01",
      products: { nodes: [
        { title: "Rose", handle: "rose", featuredImage: { url: "/r.jpg" },
          variants: { nodes: [{ id: "gid://shopify/ProductVariant/101",
            availableForSale: true, currentlyNotInStock: false,
            quantityAvailable: 1, price: { amount: "450.0" } }] } },
        { title: "Dolk", handle: "dolk", featuredImage: { url: "/d.jpg" },
          variants: { nodes: [{ id: "gid://shopify/ProductVariant/102",
            availableForSale: true, currentlyNotInStock: false,
            quantityAvailable: 0, price: { amount: "450.0" } }] } },
      ] },
    },
  };
  const varer = laesFlashVarer(svar);
  assert.equal(varer.length, 2, "begge læses");
  assert.equal(varer[0].lager.status, "ledig");
  assert.equal(varer[1].lager.status, "ubevist", "den utrakterede dømmes ubevist");
  assert.equal(varer[0].variantId, "101", "numerisk variant-id ud af gid'en");

  assert.deepEqual(tilFlashPieces(varer).map((k) => k.id), ["rose"]);
});

test("lagerfelterne står IKKE i den delte forespørgsel — Hylden må ikke kunne rives med", () => {
  // storefrontQuery returnerer null naar GraphQL svarer med `errors`. Afviser
  // Storefront `quantityAvailable` fordi noeglen mangler scopet, ville feltet
  // i COLLECTION_QUERY toemme /shop sammen med /flash. Derfor to forespørgsler.
  const sf = read("lib/storefront.ts");
  const delt = sf.slice(sf.indexOf("const COLLECTION_QUERY"), sf.indexOf("`;", sf.indexOf("const COLLECTION_QUERY")));
  assert.doesNotMatch(delt, /quantityAvailable/, "lagerfeltet er sivet ind i hyldens forespørgsel");
  assert.doesNotMatch(delt, /currentlyNotInStock/);

  // Positiv kontrol: vores egne forespørgsler har dem, ellers dømmer vi blindt.
  for (const q of [FLASH_QUERY, VARIANT_QUERY]) {
    assert.match(q, /quantityAvailable/);
    assert.match(q, /currentlyNotInStock/);
    assert.match(q, /availableForSale/);
  }

  // Og fejl-vejen er stadig den vi tror: errors ⇒ null ⇒ fallback.
  assert.match(sf, /if \(p\.errors\) return null;/);
});

test("Fredagsflash er et depositum — ellers kan kunden ikke få sin plads bekræftet", async () => {
  const { FREDAGSFLASH, depositumVarianter, fredagsflashCartUrl } =
    await import("../lib/commerce.ts");
  assert.equal(FREDAGSFLASH.variantId, "53935797338440", "Harukis målte variant");
  assert.equal(FREDAGSFLASH.depositumKr, 300);
  assert.ok(depositumVarianter().has(FREDAGSFLASH.variantId),
    "300 kr der «trækkes fra i stolen» ER et depositum");
  assert.match(fredagsflashCartUrl(), /\/cart\/53935797338440:1(\?|$)/);
});

test("tid og priser står ét sted — Nizar skal kunne bede om 19–01", async () => {
  const { FREDAGSFLASH } = await import("../lib/commerce.ts");
  // Kun KODEN — tallene maa gerne staa i en kommentar der forklarer hvorfor.
  const blok = read("components/emerge/Fredagsflash.tsx")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  for (const tal of [FREDAGSFLASH.aabner, FREDAGSFLASH.lukker,
                     String(FREDAGSFLASH.lilleKr), String(FREDAGSFLASH.mellemKr),
                     String(FREDAGSFLASH.depositumKr)]) {
    assert.doesNotMatch(blok, new RegExp(`[^\\w.]${tal}[^\\w]`),
      `${tal} står hardkodet i blokken — så driver copy og butik fra hinanden`);
  }
});

test("knappen renderer kun når pladsen kan bevises", () => {
  const blok = read("components/emerge/Fredagsflash.tsx");
  assert.match(blok, /lager\.status === "ledig"/, "knappen er ikke gatet på dommen");
  assert.match(blok, /Udsolgt i denne uge/, "der mangler en tilstand uden knap");
  // Ingen doed handling: knappen findes kun i den gren der kan koebes.
  const udenKnap = blok.slice(blok.indexOf("Udsolgt i denne uge"));
  assert.doesNotMatch(udenKnap, /fredagsflashCartUrl/);
});
