// Husets strukturerede data (Villy, 13/10 2026).
// Accept: docs/accept/json-ld.md · Steven 13/10: «Ja, du må bygge JSON-LD».
//
// Kriterierne der kan måles uden en browser. Kriterium 1 (det står i HTML'en
// serveren sender) måles også her — mod bygget output, hvis det findes —
// og live med curl efter merge (se docs/accept/json-ld.md).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
/** Kode uden kommentarer — en forklaring må gerne nævne det, koden ikke må gøre. */
const kode = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const J = await import("../lib/jsonld.ts");
const C = await import("../lib/content.ts");
const { site } = await import("../lib/site.ts");
const husets = () => ({ kontakt: C.loadKontakt(), tider: C.loadAabningstider(), site });

test("studiet: navn, adresse og telefon er husets egne (kriterium 1, 4)", () => {
  const s = J.studio(husets());
  const k = C.loadKontakt();
  assert.equal(s["@type"], "TattooParlor");
  assert.equal(s.name, "Ink & Art Copenhagen");
  assert.equal(s.address.streetAddress, "Larsbjørnsstræde 13", "postadressen, uden «kælderen»");
  assert.equal(s.address.postalCode, "1454");
  assert.equal(s.address.addressLocality, k.by);
  assert.equal(s.address.addressCountry, "DK");
  assert.equal(s.telephone, k.telefon_e164);
  assert.equal(s.telephone, "+45" + k.telefon_vist.replace(/\s/g, ""), "det man ringer til, er det der står på siden");
  assert.equal(s.email, k.email);
  assert.deepEqual(s.sameAs, ["https://www.instagram.com/ink.and.art.cph/"]);
  assert.equal(s.image, "https://inkandart.dk/og-inkandart-2026.jpg", "det nye filnavn, ikke /og-image.jpg");
});

test("ét studie på begge sprog — samme @id, ikke to butikker i samme gade (kriterium 3)", () => {
  const rod = read("components/rod/HusetsRod.tsx");
  // HusetsRod er roden for BÅDE app/(da) og app/(en); skemaet kender ikke sproget.
  assert.match(rod, /<JsonLd data=\{husetsGraf\(\{ kontakt: loadKontakt\(\), tider: loadAabningstider\(\), site \}\)\} \/>/);
  assert.doesNotMatch(rod, /husetsGraf\([^)]*lang/, "skemaet må ikke afhænge af sproget");
  for (const f of ["app/(da)/layout.tsx", "app/(en)/layout.tsx"]) assert.match(read(f), /HusetsRod/, f);
  const g = J.husetsGraf(husets());
  const ider = g["@graph"].map((n) => n["@id"]);
  assert.deepEqual(ider, ["https://inkandart.dk/#studio", "https://inkandart.dk/#website"]);
  assert.equal(g["@graph"][1].publisher["@id"], J.STUDIO_ID);
});

test("én kilde: skemaet følger kontakt.yml og aabningstider.yml (kriterium 5)", () => {
  const src = read("lib/jsonld.ts").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
  // Ingen afskrift af tal der bor i content/.
  assert.doesNotMatch(src, /91\s?88\s?73\s?96|4591887396/, "telefonnummeret er skrevet af");
  assert.doesNotMatch(src, /Larsbjørnsstræde/, "adressen er skrevet af");
  assert.doesNotMatch(src, /"(13|22|02|05):00"/, "et klokkeslæt er skrevet af");
  // Og det virker den anden vej: andre tider ind → andre tider ud.
  const anden = J.aabningstider([{ dage: ["man"], fra: "10", til: "18" }]);
  assert.deepEqual(anden, [{ "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "10:00", closes: "18:00" }]);
  assert.throws(() => J.aabningstider([{ dage: ["xyz"], fra: "10", til: "18" }]), /ukendt dag/);
});

test("ingen opdigtede stjerner, ingen priser der kan drive", () => {
  const json = JSON.stringify(J.husetsGraf(husets()));
  for (const ord of ["aggregateRating", "review", "Offer", "priceRange"]) {
    assert.doesNotMatch(json, new RegExp(ord), ord);
  }
});

test("sikkerJson: «</script>» kan ikke lukke elementet — og data kommer uændret tilbage", () => {
  const ond = { navn: "</script><script>alert(1)</script>", og: "a & b", ls: "x\u2028y\u2029z" };
  const ud = J.sikkerJson(ond);
  assert.doesNotMatch(ud, /<|>|&|\u2028|\u2029/, "et farligt tegn slap igennem");
  assert.deepEqual(JSON.parse(ud), ond, "escapingen ændrede indholdet");
  // Negativ kontrol: uden escaping står «</script>» der råt.
  assert.match(JSON.stringify(ond), /<\/script>/);

  const komp = read("components/seo/JsonLd.tsx");
  assert.match(komp, /<script type="application\/ld\+json">\{sikkerJson\(data\)\}<\/script>/, "komponenten skal gå gennem sikkerJson");
  assert.doesNotMatch(kode("components/seo/JsonLd.tsx"), /["']use client["']/, "skemaet skal i HTML'en fra serveren");
});

test("den gamle kopi er væk, og intet indlæser den (kriterium 7)", () => {
  assert.equal(existsSync(join(root, "public/seo-ld.js")), false, "public/seo-ld.js findes stadig");
  for (const f of ["components/rod/HusetsRod.tsx", "app/(da)/layout.tsx", "app/(en)/layout.tsx"]) {
    assert.doesNotMatch(kode(f), /seo-ld/, f);
  }
});

test("bygget HTML: skemaet står i det serveren sender (kriterium 1) — når der er en build", (t) => {
  const da = join(root, ".next/server/app/index.html");
  const en = join(root, ".next/server/app/en.html");
  if (!existsSync(da) || !existsSync(en)) {
    t.skip("ingen .next-build at måle — kør `npm run build` først");
    return;
  }
  for (const f of [da, en]) {
    const html = readFileSync(f, "utf8");
    const blokke = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(blokke.length, 1, `${f}: præcis én skemablok`);
    const g = JSON.parse(blokke[0][1]);
    assert.equal(g["@graph"][0]["@id"], J.STUDIO_ID);
    assert.equal(g["@graph"][0].address.streetAddress, "Larsbjørnsstræde 13");
    assert.equal(g["@graph"][0].openingHoursSpecification.length, C.loadAabningstider().length);
  }
  assert.equal(site.url, "https://inkandart.dk");
});
