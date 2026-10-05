// Ugeskemaet, timeprisen og /api/huset (Villy, 5/10 2026).
//
// Accept: inkandart-webshop docs/accept/app-gennemgang.md (godkendt 5/10).
// Steven: «Emma har sendt os denne oversigt og hvem der er på de forskellige
// dage.» · «Han [Nizar] er på alle dage. Det er hans sted.» · skemaet også
// på sitet · FAQ'en rettes, så den siger det samme som appen.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const C = await import("../lib/content.ts");
const { byggHuset } = await import("../lib/huset.ts");

const navne = (personer) => personer.map((p) => p.id);

/* ── Skemaet ─────────────────────────────────────────────────────────── */

test("skemaet er Emmas oversigt, med Nizar alle dage", () => {
  const s = C.loadSkema();
  for (const d of ["man", "son"]) {
    assert.deepEqual(navne(s.dage[d]), ["nizar", "alex", "adriana"], d);
  }
  for (const d of ["tir", "ons", "tor", "fre", "loer"]) {
    assert.deepEqual(navne(s.dage[d]), ["nizar", "emma", "okan"], d);
  }
  assert.deepEqual(Object.keys(s.dage), C.UGEN, "alle syv dage, i ugens rækkefølge");
});

test("kun folk med en artistside linker — Alex og Adriana står med navn alene", () => {
  const s = C.loadSkema();
  const alle = Object.values(s.dage).flat();
  const profil = Object.fromEntries(alle.map((p) => [p.id, p.profil]));
  assert.deepEqual(profil, { nizar: true, alex: false, adriana: false, emma: true, okan: true });
  // Navnet på en profil er det samme som på kortet i /stolen.
  const emma = alle.find((p) => p.id === "emma");
  assert.equal(emma.navn, "Emma Wind");

  const komp = read("components/rummet/Ugeskema.tsx");
  assert.match(komp, /p\.profil \? <a href=\{localePath\(lang, `\/stolen\/\$\{p\.id\}`\)\}>/,
    "kun en profil får et link — ellers et link der ender i 404");
});

test("negativ kontrol: et id der hverken er artist eller navn stopper bygningen", () => {
  const artists = C.loadHouse().artists;
  assert.throws(
    () => C.loadSkema({ dage: { man: ["nizar", "alexx"] }, navne: { alex: "Alex" } }, artists),
    /«alexx» er hverken/,
  );
  // En artist uden profil (fx Anna efter 28/9) må heller ikke snige sig ind.
  assert.throws(() => C.loadSkema({ dage: { man: ["anna"] } }, artists), /«anna»/);
});

test("skemaet står på /stolen på begge sprog", () => {
  const da = read("app/(da)/(rummet)/stolen/page.tsx");
  const en = read("app/(en)/(rummet)/en/stolen/page.tsx");
  assert.match(da, /<Ugeskema skema=\{loadSkema\(\)\} \/>/);
  assert.match(en, /<Ugeskema skema=\{loadSkema\(\)\} lang="en" \/>/);
});

/* ── Timeprisen ──────────────────────────────────────────────────────── */

test("FAQ'en siger ikke længere «ingen timepris» — tallet kommer fra teamguiden", () => {
  const da = read("content/faq.yml").replace(/^\s*#.*$/gm, "");
  const en = read("content/faq.en.yml").replace(/^\s*#.*$/gm, "");
  assert.doesNotMatch(da, /Ingen timepris/);
  assert.doesNotMatch(en, /No hourly rate/);
  assert.match(da, /\{timepris\}/);
  assert.match(en, /\{timepris\}/);
  // Ingen kopi af tallet i FAQ'en, der kan drive fra teamguiden.
  assert.doesNotMatch(da, /1[.,]?000 kr/);
  assert.doesNotMatch(en, /1[.,]?000 kr/);

  assert.equal(C.timepris(), 1000);
  for (const f of ["app/(da)/(rummet)/faq/page.tsx", "app/(en)/(rummet)/en/faq/page.tsx"]) {
    assert.match(read(f), /\.replace\("\{timepris\}", `\$\{timepris\(\)\.toLocaleString/, `${f} indsætter ikke timeprisen`);
  }
});

test("negativ kontrol: uden en timepris-linje i teamguiden kaster den", () => {
  assert.throws(() => C.timepris({ priser_tattoo: [{ ydelse: "4 timers session", pris: 3600 }] }), /Timepris/);
});

/* ── /api/huset ──────────────────────────────────────────────────────── */

function husetNu() {
  const house = C.loadHouse();
  const profiler = new Set(C.profiledArtists(house.artists).map((a) => a.id));
  const tg = C.loadTeamguide();
  const tgEn = C.loadTeamguideEn();
  return byggHuset({
    stolen: C.chairArtists(house.artists).filter((a) => profiler.has(a.id)),
    vaerkerFor: (id) => C.visibleVaerkerForArtist(house.vaerker, id),
    kontakt: C.loadKontakt(),
    whatsapp: "+4550279123",
    booking: "https://inkart.book.dk",
    aabningstider: C.loadAabningstider(),
    skema: C.loadSkema(undefined, house.artists),
    priserTattoo: { da: tg.priser_tattoo, en: tgEn.priser_tattoo },
    priserFlash: { da: tg.priser_flash, en: tgEn.priser_flash },
    billede: (src) => (src ? `https://inkandart.dk${src}` : ""),
  });
}

test("appen får de samme artister som /stolen, i samme rækkefølge, med samme navn og bio", () => {
  const h = husetNu();
  const yml = C.loadHouse().artists;
  const stolen = C.chairArtists(yml).filter((a) => C.profiledArtists(yml).includes(a));
  assert.deepEqual(h.artister.map((a) => a.id), stolen.map((a) => a.id));
  assert.deepEqual(h.artister.map((a) => a.navn), ["Nizar Saad", "Emma Wind", "Okan"]);
  const nizar = h.artister.find((a) => a.id === "nizar");
  assert.equal(nizar.bio.da, yml.find((a) => a.id === "nizar").bio, "Nizars egne ord, ordret");
  assert.match(nizar.bio.da, /^Allerede som barn/);
  for (const a of h.artister) {
    assert.match(a.foto, /^https:\/\/inkandart\.dk\//, `${a.id}: foto skal være en absolut URL`);
    assert.ok(a.vaerker.every((v) => v.foto.startsWith("https://inkandart.dk/")), `${a.id}: værker`);
  }
  assert.ok(h.artister.find((a) => a.id === "emma").vaerker.length > 0, "Emmas værker kommer med");
});

test("kontakt, tider og priser er sitets egne — tal for tal", () => {
  const h = husetNu();
  const k = C.loadKontakt();
  assert.equal(h.kontakt.telefon_vist, k.telefon_vist);
  assert.equal(h.kontakt.telefon_e164, "+4591887396");
  assert.deepEqual(h.aabningstider, C.loadAabningstider());
  const tattoo = h.priser.tattoo.map((p) => p.pris);
  assert.ok(tattoo.includes(1000) && tattoo.includes(900) && tattoo.includes(700), "teamguidens priser");
  assert.ok(h.priser.tattoo.every((p) => p.da && p.en), "hver pris har et navn på begge sprog");
  assert.equal(h.priser.tattoo.length, C.loadTeamguideEn().priser_tattoo.length,
    "dansk og engelsk prisliste har lige mange linjer — ellers parres de forkert");
  assert.equal(h.priser.flash.length, C.loadTeamguideEn().priser_flash.length);
});

test("negativ kontrol: folk der er gået, og det der er lukket, står ingen steder i husets data", () => {
  const json = JSON.stringify(husetNu());
  for (const ord of ["Anna", "Maria", "Isac", "Kolev", "Kinky", "Module", "Windinnalls"]) {
    assert.doesNotMatch(json, new RegExp(ord), ord);
  }
  // Og prøven kan se det, når det står der.
  assert.match(JSON.stringify({ x: "Mød Maria" }), /Maria/);
});

test("ruten er statisk, åben for appen uden credentials, og bruger byggHuset", () => {
  const r = read("app/api/huset/route.ts");
  assert.match(r, /export const dynamic = "force-static"/);
  assert.match(r, /"Access-Control-Allow-Origin": "\*"/);
  assert.doesNotMatch(r, /Allow-Credentials/);
  assert.match(r, /byggHuset\(/);
});
