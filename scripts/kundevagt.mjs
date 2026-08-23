#!/usr/bin/env node
/**
 * Kundevagt — læser produktet som en kunde, ikke som en server.
 *
 * Ratificeret S568: hvert produkt fødes med én kundesynlig vagt.
 * Liveness («svarer serveren») er ikke leverance («fik kunden sit»).
 * Geopol-lektien: 5.579 grønne cron-kørsler mens produktet stod stille.
 *
 * Hver positiv påstand har en negativ kontrol — et grønt resultat uden en
 * mulig rød er ingen måling (husets stående disciplin, S564-S568).
 */
const BASE = process.env.KUNDEVAGT_BASE ?? "https://inkandart.dk";
const SHOP = "https://d1qp54-0w.myshopify.com";

const fejl = [];
const ok = [];

async function hent(url, { follow = true } = {}) {
  const res = await fetch(url, {
    redirect: follow ? "follow" : "manual",
    signal: AbortSignal.timeout(20_000),
    headers: { "User-Agent": "inkandart-kundevagt/1 (+github.com/Bygmedai/inkandart.dk)" },
  });
  const body = follow ? await res.text() : "";
  return { status: res.status, body, location: res.headers.get("location") ?? "" };
}

async function tjek(navn, fn) {
  try {
    const grund = await fn();
    if (grund) fejl.push(`${navn}: ${grund}`);
    else ok.push(navn);
  } catch (e) {
    fejl.push(`${navn}: ${e.message}`); // netværksfejl er rød, ikke «ukendt»
  }
}

// ── Kunderejsen ────────────────────────────────────────────────────────
await tjek("forside: åbner og kan booke", async () => {
  const r = await hent(`${BASE}/`);
  if (r.status !== 200) return `HTTP ${r.status}`;
  if (!/inkart\.book/.test(r.body)) return "booking-linket er væk fra forsiden";
});

await tjek("engelsk flade: findes og er engelsk", async () => {
  const r = await hent(`${BASE}/en`);
  if (r.status !== 200) return `HTTP ${r.status}`;
  if (!/Walk-in/.test(r.body) || !/Gift card/.test(r.body))
    return "engelske kerneord mangler — er fladen faldet tilbage til dansk?";
});

await tjek("shop: kataloget står der", async () => {
  const r = await hent(`${BASE}/shop`);
  if (r.status !== 200) return `HTTP ${r.status}`;
  if (!r.body.includes("d1qp54-0w")) return "ingen kurv-links til butikken på /shop";
});

await tjek("gavekort: siden findes", async () => {
  const r = await hent(`${BASE}/gavekort`);
  if (r.status !== 200) return `HTTP ${r.status}`;
});

// ── Handelen: kan kurven faktisk tage imod? ────────────────────────────
await tjek("kurv: gavekort 250 kr er i live", async () => {
  const r = await hent(`${SHOP}/cart/53467075215688:1`, { follow: false });
  if (r.status !== 302) return `variant svarer ${r.status}, ikke 302 — død handel på gavekortsiden`;
});

await tjek("kurv: walk-in-depositum er i live", async () => {
  const r = await hent(`${SHOP}/cart/53492552827208:1`, { follow: false });
  if (r.status !== 302) return `variant svarer ${r.status}, ikke 302 — død handel på walk-in`;
});

await tjek("negativ kontrol: død variant læses som død", async () => {
  const r = await hent(`${SHOP}/cart/99999999999999:1`, { follow: false });
  if (r.status !== 410) return `forventede 410, fik ${r.status} — 302-målingerne ovenfor beviser så ingenting`;
});

// ── Døde døre ──────────────────────────────────────────────────────────
await tjek("en delt engelsk adresse dør aldrig (hellere dansk end 410)", async () => {
  const r = await hent(`${BASE}/en/gavekort`, { follow: false });
  if (![301, 302, 307, 308].includes(r.status))
    return `/en/gavekort svarer ${r.status} — en kunde med et delt link rammer en død dør`;
  if (!/\/gavekort/.test(r.location)) return `redirecter til «${r.location}», ikke til den danske side`;
});

await tjek("negativ kontrol: vrøvl foldes ikke ind i stilhed", async () => {
  const r = await hent(`${BASE}/en/xyzzy-findes-ikke`, { follow: false });
  if (![404, 410].includes(r.status)) return `forventede 404/410, fik ${r.status}`;
});

await tjek("negativ kontrol: 404 virker", async () => {
  const r = await hent(`${BASE}/denne-side-findes-ikke`, { follow: false });
  if (r.status !== 404) return `forventede 404, fik ${r.status} — 200-tjekkene ovenfor kan så ikke fejle`;
});

// ── Dom ────────────────────────────────────────────────────────────────
console.log(`\nKundevagt mod ${BASE}`);
for (const n of ok) console.log(`  ✓ ${n}`);
for (const f of fejl) console.log(`  ✗ ${f}`);
console.log(`\n${ok.length} grønne, ${fejl.length} røde`);
if (fejl.length) process.exit(1);
