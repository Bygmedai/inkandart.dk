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

/**
 * KASSEN MÅLES DÉR HVOR KUNDEN SENDES HEN — IKKE PÅ ET NAVN I DENNE FIL.
 *
 * Indtil 2/9 stod der `const SHOP = "https://d1qp54-0w.myshopify.com"`.
 * Samme dag flyttede kassen til `butik.inkandart.dk` (#291), og myshopify
 * begyndte at svare 301 på alt. Vagten ville være gået rød fire steder
 * kl. 14:23 — for varianter der lever fint, bare et andet sted. Målt før
 * det skete: 301/301/301 på myshopify, 302/302/410 på kassen.
 *
 * Så vagten læser nu kassens vært ud af /gavekort-siden, som kunden gør,
 * og måler dér. Flytter kassen igen, følger vagten med af sig selv.
 * Det gamle domæne måles stadig — men som det det er nu: en dør der
 * skal viderestille, så et link i en gammel bekræftelsesmail aldrig dør.
 */
const API_HOST = "d1qp54-0w.myshopify.com";
let kasse = null; // sættes af /gavekort-målingen; alt der handler, venter på den

function kurvVaert(html) {
  const m = html.match(/https:\/\/([a-z0-9.-]+)\/cart\//i);
  return m ? m[1].toLowerCase() : null;
}

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
  // Book først, betal efter (#230): forsiden linker ikke længere direkte
  // til inkart.book.dk — den går via husets egen /booking-side. Målingen
  // følger den arkitektur, ikke den forladte streng.
  const r = await hent(`${BASE}/`);
  if (r.status !== 200) return `HTTP ${r.status}`;
  if (!/id="booking"\s+href="\/booking"/.test(r.body)) return "booking-linket er væk fra forsiden";
});

await tjek("engelsk flade: findes og er engelsk", async () => {
  const r = await hent(`${BASE}/en`);
  if (r.status !== 200) return `HTTP ${r.status}`;
  if (!/walk-in/i.test(r.body) || !/Book a session/.test(r.body))
    return "engelske kerneord mangler — er fladen faldet tilbage til dansk?";
});

await tjek("shop: kataloget står der", async () => {
  const r = await hent(`${BASE}/shop`);
  if (r.status !== 200) return `HTTP ${r.status}`;
  if (!r.body.includes("/cart/")) return "ingen kurv-links til butikken på /shop";
});

await tjek("gavekort: siden findes — og siger hvor kassen er", async () => {
  const r = await hent(`${BASE}/gavekort`);
  if (r.status !== 200) return `HTTP ${r.status}`;
  kasse = kurvVaert(r.body);
  if (!kasse) return "ingen kurv-links på /gavekort — så kan handelen ikke måles";
});

// ── Handelen: kan kurven faktisk tage imod? ────────────────────────────
await tjek("kurv: gavekort 250 kr er i live", async () => {
  if (!kasse) return "kassens vært er ukendt — /gavekort-målingen fejlede";
  const r = await hent(`https://${kasse}/cart/53467075215688:1`, { follow: false });
  if (r.status !== 302) return `variant svarer ${r.status} på ${kasse}, ikke 302 — død handel på gavekortsiden`;
});

await tjek("kurv: walk-in-depositum er i live", async () => {
  if (!kasse) return "kassens vært er ukendt — /gavekort-målingen fejlede";
  const r = await hent(`https://${kasse}/cart/53492552827208:1`, { follow: false });
  if (r.status !== 302) return `variant svarer ${r.status} på ${kasse}, ikke 302 — død handel på walk-in`;
});

await tjek("negativ kontrol: død variant læses som død", async () => {
  if (!kasse) return "kassens vært er ukendt — /gavekort-målingen fejlede";
  const r = await hent(`https://${kasse}/cart/99999999999999:1`, { follow: false });
  if (r.status !== 410) return `forventede 410, fik ${r.status} — 302-målingerne ovenfor beviser så ingenting`;
});

await tjek("gamle links lever: myshopify viderestiller til kassen", async () => {
  // Bekræftelsesmails sendt før 2/9 peger på myshopify. Shopify skal
  // sende dem videre til kassen — holder Shopify op med det, dør de
  // links stille, og ingen kunde fortæller os det.
  if (!kasse) return "kassens vært er ukendt — /gavekort-målingen fejlede";
  const r = await hent(`https://${API_HOST}/cart/53467075215688:1`, { follow: false });
  if (![301, 302, 307, 308].includes(r.status)) return `myshopify svarer ${r.status} — et gammelt link i en mail er dødt`;
  let til = null;
  try { til = new URL(r.location).host.toLowerCase(); } catch { /* ugyldig location */ }
  if (til !== kasse) return `myshopify sender til «${til ?? r.location}», ikke til kassen ${kasse}`;
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
