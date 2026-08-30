import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

process.env.SHOPIFY_ADMIN_TOKEN = "test-token";
process.env.SHOPIFY_STORE = "test.myshopify.com";

const { verificerDepositum, normaliserOrdrenummer } =
  await import("../lib/depositum.ts");
const { depositumVarianter } = await import("../lib/commerce.ts");

/* Varianterne kommer fra handelslaget — testen bruger et RIGTIGT id
   derfra, så prøven ikke kan blive grøn på et id der ikke findes.
   Verifikationen selv kender ikke kataloget; den får sættet ind. */
const VARIANTER = depositumVarianter();
const ET_DEPOSITUM = [...VARIANTER][0];

let kald = [];
function mockShopify(handler) {
  kald = [];
  globalThis.fetch = async (url, init) => {
    kald.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : null });
    return handler(kald.length, kald.at(-1));
  };
}
const ordreSvar = (node) =>
  new Response(JSON.stringify({ data: { orders: { edges: node ? [{ node }] : [] } } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
const linje = (variantId) => ({ node: { variant: { id: `gid://shopify/ProductVariant/${variantId}` } } });

beforeEach(() => { kald = []; });

test("ordrenummer normaliseres — kunden må skrive #1042, 1042 eller 1042 ", () => {
  assert.equal(normaliserOrdrenummer("#1042"), "1042");
  assert.equal(normaliserOrdrenummer(" 1042 "), "1042");
  assert.equal(normaliserOrdrenummer("nr. 1042"), "1042");
  // For kort, for langt eller uden cifre er ikke et ordrenummer.
  assert.equal(normaliserOrdrenummer("12"), null);
  assert.equal(normaliserOrdrenummer(""), null);
  assert.equal(normaliserOrdrenummer("abc"), null);
  assert.equal(normaliserOrdrenummer("1".repeat(13)), null);
});

test("et ugyldigt nummer når ALDRIG Shopify", async () => {
  mockShopify(() => ordreSvar(null));
  assert.equal(await verificerDepositum("12", VARIANTER), "ugyldigt");
  assert.equal(kald.length, 0, "vi spørger ikke upstream om noget der ikke er et nummer");
});

test("betalt depositum → betalt", async () => {
  mockShopify(() =>
    ordreSvar({
      name: "#1042",
      displayFinancialStatus: "PAID",
      lineItems: { edges: [linje(ET_DEPOSITUM)] },
    }),
  );
  assert.equal(await verificerDepositum("#1042", VARIANTER), "betalt");
  // Forespørgslen bygges af os — kundens input når aldrig ind som frit
  // søgeudtryk (ellers kunne et input ændre hvad vi spørger om).
  assert.equal(kald[0].body.variables.q, "name:#1042");
});

test("ubetalt depositum → ikke_betalt, ikke betalt", async () => {
  mockShopify(() =>
    ordreSvar({
      name: "#1042",
      displayFinancialStatus: "PENDING",
      lineItems: { edges: [linje(ET_DEPOSITUM)] },
    }),
  );
  assert.equal(await verificerDepositum("1042", VARIANTER), "ikke_betalt");
});

test("REGRESSION: en betalt ordre UDEN depositum er ikke et depositum", async () => {
  // En t-shirt er ikke en holdt tid. Uden denne regel ville et hvilket
  // som helst ordrenummer fra shoppen kunne vise «betalt» på bookingen.
  mockShopify(() =>
    ordreSvar({
      name: "#1042",
      displayFinancialStatus: "PAID",
      lineItems: { edges: [linje("99999999999999")] },
    }),
  );
  assert.equal(await verificerDepositum("1042", VARIANTER), "ukendt");
});

test("ukendt ordre → ukendt", async () => {
  mockShopify(() => ordreSvar(null));
  assert.equal(await verificerDepositum("1042", VARIANTER), "ukendt");
});

test("upstream-fejl bliver ALDRIG til betalt", async () => {
  // Fail-closed. S568-lektien fra /api/subscribe: et endpoint der fejler
  // åbent siger «ja» når det intet ved.
  for (const svar of [
    () => new Response("nej", { status: 500 }),
    () => { throw new Error("netværk"); },
    () => new Response(JSON.stringify({ data: {} }), { status: 200, headers: { "Content-Type": "application/json" } }),
  ]) {
    mockShopify(svar);
    const s = await verificerDepositum("1042", VARIANTER);
    assert.notEqual(s, "betalt", "en fejl må aldrig aflæses som en betaling");
  }
});

test("uden credentials svarer vi «kan ikke tjekke» — ikke «betalt»", async () => {
  const prev = process.env.SHOPIFY_ADMIN_TOKEN;
  delete process.env.SHOPIFY_ADMIN_TOKEN;
  const prevId = process.env.SHOPIFY_CLIENT_ID;
  const prevSecret = process.env.SHOPIFY_CLIENT_SECRET;
  delete process.env.SHOPIFY_CLIENT_ID;
  delete process.env.SHOPIFY_CLIENT_SECRET;
  try {
    mockShopify(() => ordreSvar(null));
    assert.equal(await verificerDepositum("1042", VARIANTER), "kan_ikke_tjekke");
  } finally {
    if (prev !== undefined) process.env.SHOPIFY_ADMIN_TOKEN = prev;
    if (prevId !== undefined) process.env.SHOPIFY_CLIENT_ID = prevId;
    if (prevSecret !== undefined) process.env.SHOPIFY_CLIENT_SECRET = prevSecret;
  }
});

test("PRIVATLIV: modulet returnerer en status og intet andet", () => {
  const src = read("lib/depositum.ts");
  // Ingen kundedata forlader modulet — hverken i typen eller i kaldet.
  for (const felt of ["customer", "email", "phone", "shippingAddress", "billingAddress"]) {
    assert.ok(!src.includes(felt), `depositum.ts må ikke røre ${felt}`);
  }
  assert.doesNotMatch(src, /totalPrice|shopMoney/, "beløb hører ikke til i svaret");
  // Verifikationen kender ikke kataloget — den får varianterne ind.
  assert.doesNotMatch(src, /RESERVATIONS|PIERCINGS|FLASH_DEPOSITS/);
});

test("tak-siden beviser betalingen i stedet for at tro på URL'en", () => {
  for (const f of ["app/(rummet)/booking/tak/page.tsx", "app/(rummet)/en/booking/tak/page.tsx"]) {
    const side = read(f);
    assert.match(side, /verificerDepositum/, `${f} skal spørge Shopify`);
    assert.doesNotMatch(side, /params\.betalt/, `${f}: ?betalt=1 er ikke et bevis`);
    const render = side.slice(side.indexOf("export default"));
    assert.doesNotMatch(render, /Depositum er betalt/, `${f} må ikke påstå betaling i markup`);
    assert.match(side, /robots: \{ index: false/, `${f} skal ikke indekseres`);
  }
  // Formen virker uden JavaScript — det er fladen kunden står med ved disken.
  const tjek = read("components/rummet/DepositumTjek.tsx");
  assert.match(tjek, /method="get"/);
  assert.doesNotMatch(tjek, /use client/);
  // Svaret må ikke skelnes på farve alene (WCAG 1.4.1): hver status har ord.
  for (const s of ["betalt", "ikke_betalt", "ukendt", "ugyldigt", "kan_ikke_tjekke"]) {
    assert.ok(read("content/booking.yml").includes(`svar_${s}:`), `dansk svar for ${s}`);
    assert.ok(read("content/booking.en.yml").includes(`svar_${s}:`), `engelsk svar for ${s}`);
  }
});
