import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const fixture = JSON.parse(read("tests/fixtures/hylden-collection.json"));

/**
 * S574 — Hylden læser Shopify-kollektionen `hylden`.
 * Parseren er ren (ingen fetch). Fallback og filtrering testes her.
 */

test("S574: parseCollectionProducts læser fixture og kaster ikke på junk", async () => {
  const { parseCollectionProducts } = await import("../lib/storefront.ts");
  const products = parseCollectionProducts(fixture);
  const handles = products.map((p) => p.handle);
  assert.deepEqual(handles, ["dolk", "ouroboros", "signetring", "naesering"]);
  assert.equal(
    products.find((p) => p.handle === "udsolgt-plakat"),
    undefined,
    "availableForSale false skal filtreres",
  );
  assert.equal(
    products.find((p) => p.handle === "kun-udsolgte-varianter"),
    undefined,
    "produkt uden levende variant skal filtreres",
  );
  const naesering = products.find((p) => p.handle === "naesering");
  assert.ok(naesering, "manglende billede må ikke smide varen");
  assert.equal(naesering.imageUrl, "");
  assert.equal(naesering.imageAlt, "");
  assert.equal(naesering.productType, "Smykker");
  assert.equal(naesering.availableForSale, true);
  assert.equal(naesering.variantGid, "gid://shopify/ProductVariant/53342061900000");

  assert.deepEqual(parseCollectionProducts(null), []);
  assert.deepEqual(parseCollectionProducts(42), []);
  assert.deepEqual(parseCollectionProducts({}), []);
  assert.deepEqual(parseCollectionProducts({ collection: null }), []);
  assert.doesNotThrow(() =>
    parseCollectionProducts({
      collection: { products: { nodes: [null, {}, "x", { handle: "" }] } },
    }),
  );
});

test("S574: gruppering kommer fra productType (Prints / Smykker)", async () => {
  const { parseCollectionProducts } = await import("../lib/storefront.ts");
  const products = parseCollectionProducts(fixture);
  const prints = products.filter((p) => p.productType === "Prints");
  const smykker = products.filter((p) => p.productType === "Smykker");
  assert.ok(prints.length >= 1);
  assert.ok(smykker.length >= 1);
  assert.deepEqual(
    prints.map((p) => p.handle),
    ["dolk", "ouroboros"],
  );
  assert.deepEqual(
    smykker.map((p) => p.handle),
    ["signetring", "naesering"],
  );
  assert.ok(products.every((p) => p.productType === "Prints" || p.productType === "Smykker"));
});

test("S574: availableForSale false filtreres i parseren", async () => {
  const { parseCollectionProducts } = await import("../lib/storefront.ts");
  const products = parseCollectionProducts(fixture);
  assert.ok(products.every((p) => p.availableForSale === true));
  assert.ok(products.every((p) => Boolean(p.variantGid)));
});

test("S574: productsInCollection uden env → ok:false, aldrig throw", async () => {
  const prevT = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const prevD = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  delete process.env.SHOPIFY_STOREFRONT_TOKEN;
  delete process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  try {
    const { productsInCollection, storefrontConfig } = await import("../lib/storefront.ts");
    assert.equal(storefrontConfig().ok, false);
    const empty = await productsInCollection("hylden");
    assert.equal(empty.ok, false);
    assert.deepEqual(empty.products, []);
  } finally {
    if (prevT !== undefined) process.env.SHOPIFY_STOREFRONT_TOKEN = prevT;
    else delete process.env.SHOPIFY_STOREFRONT_TOKEN;
    if (prevD !== undefined) process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN = prevD;
    else delete process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  }
});

test("S574: Mærket kalder kollektionen først og YAML-fallback ved !ok", () => {
  // S574: hylde-hentningen bor i lib/hylden-data.ts — ét sted, to sprog.
  const maerket = read("lib/hylden-data.ts");
  const handle = read("app/(rummet)/maerket/[handle]/page.tsx");
  const storefront = read("lib/storefront.ts");
  assert.match(maerket, /productsInCollection\("hylden"\)/);
  assert.match(maerket, /coll\.ok/);
  assert.match(maerket, /loadHylden/);
  assert.match(maerket, /productsByHandles/);
  // Tom-tilstand og gavekort-døren bor i fladen; hentningen her.
  const flade = read("components/rummet/MaerketFlade.tsx");
  assert.match(flade, /c\.shelfEmpty/);
  assert.match(read("lib/i18n.ts"), /shelfEmpty: "Der er ingen varer på hylden lige nu\."/);
  assert.match(flade, /GavekortKoeb/);
  assert.match(handle, /productByHandle/);
  assert.match(handle, /loadHylden/);
  assert.match(handle, /notFound/);
  assert.match(handle, /availableForSale/);
  assert.match(storefront, /parseCollectionProducts/);
  assert.match(storefront, /collection\(handle:/);
});

test("S574: YAML-fallback og VareKort er urørt som kontrakt", () => {
  const yml = read("content/hylden.yml");
  assert.match(yml, /handle: dolk/);
  assert.match(yml, /handle: ouroboros/);
  assert.match(yml, /handle: signetring/);
  const kort = read("components/rummet/VareKort.tsx");
  assert.match(kort, /vare\.foto/);
  assert.match(kort, /vare\.titel/);
  assert.doesNotMatch(kort, /vare\.foto \?/);
});

test("salgslinjen klippes af Shopify-beskrivelsen — disken er aldrig ordløs", async () => {
  const { salgslinje, readCollectionProduct } = await import("../lib/storefront.ts");
  assert.equal(salgslinje(""), "");
  assert.equal(
    salgslinje("Et af husets flash-motiver, trykt i hånden på tykt papir. Hæng det op."),
    "Et af husets flash-motiver, trykt i hånden på tykt papir.",
  );
  const lang = "x".repeat(300);
  assert.ok(salgslinje(lang).length <= 141, "lange beskrivelser klippes");
  const p = readCollectionProduct({
    handle: "prøve", title: "Prøve", availableForSale: true, productType: "Print",
    description: "Linjen her.", featuredImage: { url: "u", altText: "a" },
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/1", availableForSale: true, price: { amount: "1", currencyCode: "DKK" } }] },
  });
  assert.equal(p.description, "Linjen her.");
});
