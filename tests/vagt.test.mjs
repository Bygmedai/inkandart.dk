import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

process.env.AFSTEMNING_KODE = "en-lang-saetning-der-er-husets-kode";
const { kodeErRigtig, lavToken, tokenErGyldigt, cookieStreng, cookieRyd } =
  await import("../lib/vagt.ts");

test("rigtig kode åbner, forkert gør ikke", async () => {
  assert.equal(await kodeErRigtig("en-lang-saetning-der-er-husets-kode"), true);
  assert.equal(await kodeErRigtig("forkert"), false);
  assert.equal(await kodeErRigtig(""), false);
  // Et præfiks af den rigtige kode er stadig forkert.
  assert.equal(await kodeErRigtig("en-lang-saetning-der-er-husets-kod"), false);
});

test("token kan laves, holder — og udløber af sig selv", async () => {
  const t = await lavToken();
  assert.ok(t && t.includes("."));
  assert.equal(await tokenErGyldigt(t), true);
  // 13 timer senere er den død (levetiden er 12).
  assert.equal(await tokenErGyldigt(t, Date.now() + 13 * 3600_000), false);
});

test("et token kan ikke forfalskes uden hemmeligheden", async () => {
  const t = await lavToken();
  const [udløb, sig] = t.split(".");
  // Forlæng udløbet og behold signaturen → skal afvises.
  const snydt = `${Number(udløb) + 86_400_000}.${sig}`;
  assert.equal(await tokenErGyldigt(snydt), false);
  // Frit opfundet signatur → afvises.
  assert.equal(await tokenErGyldigt(`${udløb}.${"a".repeat(64)}`), false);
  // Vrøvl → afvises, uden at kaste.
  for (const v of ["", "abc", "abc.def", "...", undefined]) {
    assert.equal(await tokenErGyldigt(v), false);
  }
});

test("uden en kode i miljøet er siden SLUKKET, ikke åben", async () => {
  const før = process.env.AFSTEMNING_KODE;
  delete process.env.AFSTEMNING_KODE;
  try {
    assert.equal(await kodeErRigtig(""), false, "tom kode må ikke åbne en uindstillet vagt");
    assert.equal(await kodeErRigtig("hvadsomhelst"), false);
    assert.equal(await lavToken(), null);
    assert.equal(await tokenErGyldigt("1.2"), false);
  } finally {
    process.env.AFSTEMNING_KODE = før;
  }
});

test("en for kort kode tæller ikke som en kode", async () => {
  const før = process.env.AFSTEMNING_KODE;
  process.env.AFSTEMNING_KODE = "kort";
  try {
    assert.equal(await kodeErRigtig("kort"), false, "under 16 tegn ignoreres — ellers er vagten teater");
  } finally {
    process.env.AFSTEMNING_KODE = før;
  }
});

test("cookien kan ikke læses af JavaScript og udløber selv", () => {
  const c = cookieStreng("x.y");
  for (const del of ["HttpOnly", "Secure", "SameSite=Lax", "Max-Age=43200", "Path=/"]) {
    assert.ok(c.includes(del), `cookien mangler ${del}`);
  }
  assert.match(cookieRyd(), /Max-Age=0/);
});

test("siden viser kun det matchningen kræver — ingen navne eller adresser", () => {
  const lib = read("lib/depositum.ts");
  const side = read("app/(da)/(rummet)/afstemning/page.tsx");
  // Mailen SKAL med — det er nøglen mellem Shopify og Book.dk.
  assert.match(lib, /emailAddress/);
  // Men resten skal ikke.
  for (const felt of ["firstName", "lastName", "displayName", "shippingAddress", "billingAddress", "phone"]) {
    assert.ok(!lib.includes(felt), `depositum.ts må ikke hente ${felt}`);
  }
  // Kun det der RENDERES måles — filens kommentar forklarer med vilje
  // hvilke felter der bevidst er udeladt.
  const render = side.slice(side.indexOf("export default"));
  assert.doesNotMatch(render, /<th[^>]*>\s*(Navn|Telefon|Adresse)/i, "kolonner vi ikke skal have");
  assert.match(render, />Mail</, "mailen er nøglen mellem de to systemer");
});

test("afstemningen er lukket for søgemaskiner og for cachen", () => {
  const side = read("app/(da)/(rummet)/afstemning/page.tsx");
  assert.match(side, /index: false/);
  assert.match(side, /dynamic = "force-dynamic"/, "en side med kundedata må ikke bygges statisk");
  assert.match(side, /revalidate = 0/);
  assert.doesNotMatch(read("app/sitemap.ts"), /inkandart\.dk\/afstemning/, "et sitemap er en invitation");
});

test("koden sendes som POST — aldrig i en URL", () => {
  const side = read("app/(da)/(rummet)/afstemning/page.tsx");
  const rute = read("app/api/vagt/route.ts");
  assert.match(side, /method="post"/);
  assert.match(side, /type="password"/);
  assert.doesNotMatch(side, /method="get"/);
  // Ruten svarer ens uanset om koden var forkert eller ikke sat.
  assert.match(rute, /fejl=1/);
  assert.doesNotMatch(rute, /ikke sat|unconfigured|mangler kode/i);
  assert.match(rute, /export async function POST/);
  assert.doesNotMatch(rute, /export async function GET/, "en GET ville lægge koden i loggen");
});
