import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";

process.env.SHOPIFY_ADMIN_TOKEN = "test-token";
process.env.SHOPIFY_STORE = "test.myshopify.com";

const { POST } = await import("../app/api/subscribe/route.ts");

let calls = [];
function mockShopify(handler) {
  calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : null });
    return handler(calls.length, calls.at(-1));
  };
}
const res = (status, payload, { json = true } = {}) =>
  new Response(json ? JSON.stringify(payload) : String(payload), {
    status,
    headers: { "Content-Type": json ? "application/json" : "text/plain" },
  });
const post = (body) =>
  POST(new Request("https://inkandart.dk/api/subscribe", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }));

beforeEach(() => { calls = []; });

test("REGRESSION: et tomt Shopify-svar må ALDRIG blive til ok:true", async () => {
  mockShopify(() => res(200, {}));
  const r = await post({ email: "a@b.dk" });
  assert.equal(r.status, 502, "S566-versionen svarede 200 ok:true her");
  assert.deepEqual(await r.json(), { ok: false, error: "upstream" });
});

test("ikke-2xx fra Shopify er en fejl, også med JSON-krop", async () => {
  mockShopify(() => res(500, { data: { customerCreate: { userErrors: [] } } }));
  const r = await post({ email: "a@b.dk" });
  assert.equal(r.status, 502);
});

test("ikke-JSON fra Shopify er en fejl", async () => {
  mockShopify(() => res(200, "<html>maintenance</html>", { json: false }));
  assert.equal((await post({ email: "a@b.dk" })).status, 502);
});

test("graphql errors er en fejl", async () => {
  mockShopify(() => res(200, { errors: [{ message: "throttled" }] }));
  assert.equal((await post({ email: "a@b.dk" })).status, 502);
});

test("svar uden data-objekt er en fejl", async () => {
  mockShopify(() => res(200, { data: null }));
  assert.equal((await post({ email: "a@b.dk" })).status, 502);
});

test("succes er succes", async () => {
  mockShopify(() => res(200, { data: { customerCreate: { customer: { id: "gid://1" }, userErrors: [] } } }));
  const r = await post({ email: "a@b.dk" });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
});

test("allerede tilmeldt kunde: ingen unødig skrivning", async () => {
  mockShopify((n) => n === 1
    ? res(200, { data: { customerCreate: { userErrors: [{ message: "Email has already been taken" }] } } })
    : res(200, { data: { customers: { edges: [{ node: { id: "gid://7", defaultEmailAddress: { marketingState: "SUBSCRIBED" } } }] } } }));
  const r = await post({ email: "a@b.dk" });
  assert.deepEqual(await r.json(), { ok: true, already: true, subscribed: true });
  assert.equal(calls.length, 2, "må ikke kalde consent-update når der allerede er consent");
});

test("REGRESSION: eksisterende kunde UDEN consent bliver faktisk tilmeldt", async () => {
  mockShopify((n) => {
    if (n === 1) return res(200, { data: { customerCreate: { userErrors: [{ message: "Email has already been taken" }] } } });
    if (n === 2) return res(200, { data: { customers: { edges: [{ node: { id: "gid://7", defaultEmailAddress: { marketingState: "NOT_SUBSCRIBED" } } }] } } });
    return res(200, { data: { customerEmailMarketingConsentUpdate: { customer: { id: "gid://7" }, userErrors: [] } } });
  });
  const r = await post({ email: "a@b.dk" });
  assert.deepEqual(await r.json(), { ok: true, already: true, subscribed: true });
  assert.equal(calls.length, 3, "consent-update skal faktisk kaldes");
  assert.match(JSON.stringify(calls[2].body), /SUBSCRIBED/);
});

test("«taken» men kunden findes ikke er en modsigelse, ikke en succes", async () => {
  mockShopify((n) => n === 1
    ? res(200, { data: { customerCreate: { userErrors: [{ message: "Email has already been taken" }] } } })
    : res(200, { data: { customers: { edges: [] } } }));
  assert.equal((await post({ email: "a@b.dk" })).status, 502);
});

test("honeypot rører aldrig Shopify", async () => {
  mockShopify(() => res(200, {}));
  const r = await post({ email: "a@b.dk", company: "bot" });
  assert.equal(r.status, 200);
  assert.equal(calls.length, 0);
});

test("ugyldig email afvises før upstream", async () => {
  mockShopify(() => res(200, {}));
  assert.equal((await post({ email: "ikke-en-email" })).status, 422);
  assert.equal(calls.length, 0);
});

test("for stor body afvises før JSON.parse", async () => {
  mockShopify(() => res(200, {}));
  const r = await post(JSON.stringify({ email: "a@b.dk", pad: "x".repeat(5000) }));
  assert.equal(r.status, 413);
  assert.equal(calls.length, 0);
});

test("kalder en Shopify-API-version der er understøttet (2024-10 var udløbet)", async () => {
  mockShopify(() => res(200, { data: { customerCreate: { customer: { id: "1" }, userErrors: [] } } }));
  await post({ email: "a@b.dk" });
  const version = calls[0].url.match(/\/admin\/api\/([0-9]{4}-[0-9]{2})\//)?.[1];
  assert.ok(version, "URL skal indeholde en API-version");
  assert.ok(["2025-10", "2026-01", "2026-04", "2026-07"].includes(version),
    `${version} er ikke i den understøttede liste (målt mod butikken 2026-08-21)`);
});
