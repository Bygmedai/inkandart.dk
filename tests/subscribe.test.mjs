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

/* ── S568, Sirius' anden QA: konvolutten var lukket, operationerne var ikke.
      Hver af de her fejlede mod #156's foerste udgave. ─────────────────── */

const TAKEN = () => res(200, { data: { customerCreate: { userErrors: [{ message: "Email has already been taken" }] } } });
const FOUND = (state, mail = "a@b.dk") =>
  res(200, { data: { customers: { edges: [{ node: { id: "gid://9", defaultEmailAddress: { emailAddress: mail, marketingState: state } } }] } } });

test("REGRESSION: {data:{}} må ALDRIG blive til ok:true", async () => {
  mockShopify(() => res(200, { data: {} }));
  const r = await post({ email: "a@b.dk" });
  assert.equal(r.status, 502, "#156's første udgave svarede 200 ok:true her");
});

test("REGRESSION: succes uden customer.id er ikke en succes", async () => {
  mockShopify(() => res(200, { data: { customerCreate: { customer: {}, userErrors: [] } } }));
  assert.equal((await post({ email: "a@b.dk" })).status, 502);
});

test("REGRESSION: manglende userErrors er ikke nul fejl", async () => {
  mockShopify(() => res(200, { data: { customerCreate: { customer: { id: "gid://1" } } } }));
  assert.equal((await post({ email: "a@b.dk" })).status, 502);
});

test("REGRESSION: consent-update med {data:{}} er ikke en tilmelding", async () => {
  mockShopify((n) => (n === 1 ? TAKEN() : n === 2 ? FOUND("NOT_SUBSCRIBED") : res(200, { data: {} })));
  assert.equal((await post({ email: "a@b.dk" })).status, 502);
});

test("REGRESSION: consent-update uden customer.id er ikke en tilmelding", async () => {
  mockShopify((n) => (n === 1 ? TAKEN() : n === 2 ? FOUND("NOT_SUBSCRIBED")
    : res(200, { data: { customerEmailMarketingConsentUpdate: { userErrors: [] } } })));
  assert.equal((await post({ email: "a@b.dk" })).status, 502);
});

test("REGRESSION: vi sætter ALDRIG en anden persons consent på et delvist træf", async () => {
  mockShopify((n) => (n === 1 ? TAKEN() : FOUND("NOT_SUBSCRIBED", "anden@person.dk")));
  const r = await post({ email: "a@b.dk" });
  assert.equal(r.status, 422, "delvist søgetræf må ikke give skriveadgang til en fremmed");
  assert.equal(calls.length, 2, "consent-update må ikke kaldes");
});

test("«findes allerede» afgøres ved opslag, ikke ved strengmatch på fejlteksten", async () => {
  // UserError har intet code-felt (verificeret mod skemaet) — derfor slår vi op.
  mockShopify((n) => (n === 1
    ? res(200, { data: { customerCreate: { userErrors: [{ message: "noget helt tredje" }] } } })
    : FOUND("SUBSCRIBED")));
  const r = await post({ email: "a@b.dk" });
  assert.deepEqual(await r.json(), { ok: true, already: true, subscribed: true },
    "en dublet er en dublet uanset hvad Shopify kalder den");
});

test("ægte afvisning: ingen kunde med den email findes", async () => {
  mockShopify((n) => (n === 1
    ? res(200, { data: { customerCreate: { userErrors: [{ message: "Email is invalid" }] } } })
    : res(200, { data: { customers: { edges: [] } } })));
  assert.equal((await post({ email: "a@b.dk" })).status, 422);
});

test("email sendes som citeret søgeværdi, ikke rå interpolation", async () => {
  mockShopify((n) => (n === 1 ? TAKEN() : FOUND("SUBSCRIBED")));
  await post({ email: "a@b.dk" });
  assert.match(JSON.stringify(calls[1].body), /email:\\"a@b\.dk\\"/);
});

test("telefon alene opretter en Shopify-kunde med phone + blackbook-tag", async () => {
  mockShopify(() => res(200, { data: { customerCreate: { customer: { id: "gid://1" }, userErrors: [] } } }));
  const r = await post({ phone: "55248608", source: "blackbook" });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
  const input = calls[0].body.variables.input;
  assert.equal(input.phone, "+4555248608");
  assert.ok(input.tags.includes("blackbook"));
  assert.equal(input.email, undefined);
});

test("ugyldigt telefonnummer afvises før upstream", async () => {
  mockShopify(() => res(200, {}));
  assert.equal((await post({ phone: "12" })).status, 422);
  assert.equal(calls.length, 0);
});

test("honeypot med telefon rører aldrig Shopify", async () => {
  mockShopify(() => res(200, {}));
  const r = await post({ phone: "55248608", company: "bot", source: "blackbook" });
  assert.equal(r.status, 200);
  assert.equal(calls.length, 0);
});

test("REGRESSION: telefon-dublet slår op på defaultPhoneNumber, ikke 422", async () => {
  mockShopify((n) => {
    if (n === 1) {
      return res(200, { data: { customerCreate: { userErrors: [{ message: "Phone has already been taken" }] } } });
    }
    return res(200, { data: { customers: { edges: [{ node: { id: "gid://9", defaultPhoneNumber: { phoneNumber: "+4555248608" } } }] } } });
  });
  const r = await post({ phone: "55248608", source: "blackbook" });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, already: true });
  const q = JSON.stringify(calls[1].body);
  assert.match(q, /phone:/);
  assert.match(q, /defaultPhoneNumber/);
});

/* ── S574: én consent-dør. App'en (og webshop-proxyen) poster hertil med
   prefs; interesse-tags er whitelistede nøgler, aldrig rå tags fra klienten.
   CORS er en lukket liste — vilkårlige origins får ingen CORS-headers. */

test("S574 prefs: whitelistede interesser bliver tags, ukendte ignoreres", async () => {
  mockShopify(() => res(200, { data: { customerCreate: { customer: { id: "gid://1" }, userErrors: [] } } }));
  const r = await post({ email: "a@b.dk", source: "app", prefs: ["events", "merch", "hacker-tag", 42] });
  assert.equal(r.status, 200);
  const input = calls[0].body.variables.input;
  assert.ok(input.tags.includes("blackbook"));
  assert.ok(input.tags.includes("app-signup"));
  assert.ok(input.tags.includes("blackbook-events"));
  assert.ok(input.tags.includes("blackbook-merch"));
  assert.ok(!input.tags.includes("blackbook-drops"));
  assert.ok(!JSON.stringify(input.tags).includes("hacker"));
});

test("S574 CORS: app.inkandart.dk får headers, fremmed origin får ingen", async () => {
  mockShopify(() => res(200, { data: { customerCreate: { customer: { id: "gid://1" }, userErrors: [] } } }));
  const withOrigin = (origin) =>
    POST(new Request("https://inkandart.dk/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ email: "a@b.dk", source: "app" }),
    }));
  const ok = await withOrigin("https://app.inkandart.dk");
  assert.equal(ok.headers.get("Access-Control-Allow-Origin"), "https://app.inkandart.dk");
  const evil = await withOrigin("https://ond.example");
  assert.equal(evil.headers.get("Access-Control-Allow-Origin"), null);
});

test("S574 OPTIONS: preflight fra tilladt origin svarer 204 med metoder", async () => {
  const { OPTIONS } = await import("../app/api/subscribe/route.ts");
  const r = await OPTIONS(new Request("https://inkandart.dk/api/subscribe", {
    method: "OPTIONS", headers: { Origin: "https://shop.inkandart.dk" },
  }));
  assert.equal(r.status, 204);
  assert.match(r.headers.get("Access-Control-Allow-Methods"), /POST/);
});
