import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Husets telefonnummer står ÉT sted — og de to kilder skal være enige.
 *
 * `content/gaden.yml` siger det allerede: «Adressen og nummeret findes ét
 * sted for hele huset — den dag huset flytter, flytter det sig her.» Men
 * det passede ikke. Nummeret lå to steder:
 *
 *   content/kontakt.yml   Rummet: forside, gaden, artistsider, 404,
 *                         footer, personale — via loadKontakt()
 *   lib/site.ts           Emerge: /gavekort/til-dig, MobileDock,
 *                         KerbReservation på /shop — via site.phone
 *
 * De KAN ikke slås sammen: kontakt.yml læses med fs på serveren, og
 * site.ts bruges i klientkomponenter. Så de forbliver to — og hegnet her
 * holder dem mod hinanden i stedet.
 *
 * Fundet 10/9, da Steven gav huset et nyt nummer: fem filer skulle rettes,
 * og ingen prøve ville have sagt til hvis én blev glemt. En kunde der
 * ringer på et nummer huset ikke har, ringer ikke igen.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/** Otte cifre efter +45. Ikke en validering af nummeret — en af formen. */
const E164 = /^\+45\d{8}$/;

test("de to kilder er enige om husets nummer", async () => {
  const { loadKontakt } = await import("../lib/content.ts");
  const { site } = await import("../lib/site.ts");
  const k = loadKontakt();

  assert.match(k.telefon_e164, E164, "kontakt.yml: e164-formen");
  assert.match(site.phoneIntl, E164, "site.ts: e164-formen");
  assert.equal(site.phoneIntl, k.telefon_e164, "site.ts og kontakt.yml ringer til hvert sit nummer");
  assert.equal(site.phone, k.telefon_vist, "site.ts og kontakt.yml VISER hvert sit nummer");

  // Det viste nummer og det man ringer til skal være samme tal. Ellers
  // læser en skærmlæser ét op og linket ringer til et andet.
  assert.equal("+45" + site.phone.replace(/\s/g, ""), site.phoneIntl, "det viste og det kaldte nummer er ikke det samme");
});

test("Googles virksomhedsdata har husets nummer, ikke et gammelt", async () => {
  // seo-ld.js er en statisk fil (CSP: script-src 'self') og kan ikke
  // importere kontakt.yml. Derfor er den det oplagte sted at glemme.
  // Google viser det nummer der står her, i søgeresultatet.
  const { loadKontakt } = await import("../lib/content.ts");
  const ld = read("public/seo-ld.js");
  const fundet = ld.match(/telephone:\s*"([^"]+)"/);
  assert.ok(fundet, "seo-ld.js mangler telephone");
  assert.equal(fundet[1], loadKontakt().telefon_e164, "structured data ringer til et andet nummer end huset");
});

/**
 * Hvert dansk nummer i en tekst, som otte cifre.
 *
 * Landekoden skal med i mønsteret, ikke ignoreres. Første udgave brugte
 * `\b\d\d \d\d \d\d \d\d\b` og læste «45 91 88 73» ud af
 * «+45 91 88 73 96» — den meldte de engelske filer røde for et nummer
 * der var helt rigtigt. Et hegn der råber om noget der er i orden,
 * lærer folk at overhøre det.
 */
function numreI(tekst) {
  return [...tekst.matchAll(/(?:\+45[\s ]?)?\b\d\d[\s ]\d\d[\s ]\d\d[\s ]\d\d\b/g)]
    .map((m) => m[0].replace(/\D/g, ""))
    .map((d) => (d.length === 10 && d.startsWith("45") ? d.slice(2) : d))
    .filter((d) => d.length === 8);
}

test("husets vilkår og privatliv opgiver det nummer huset har", async () => {
  const { loadKontakt } = await import("../lib/content.ts");
  const cifre = loadKontakt().telefon_vist.replace(/\D/g, "");
  for (const f of ["betingelser.yml", "betingelser.en.yml", "privatliv.yml", "privatliv.en.yml"]) {
    const numre = numreI(read(join("content", f)));
    assert.ok(numre.length > 0, `${f}: ingen kontakttelefon — juridisk tekst skal kunne ringes til`);
    for (const n of numre) assert.equal(n, cifre, `${f} opgiver ${n}, huset har ${cifre}`);
  }
});

test("ingen flade skriver nummeret i markup", () => {
  // Skrevet i hånden ét sted er skrevet forkert et andet den dag det
  // skifter. Målt 10/9: SceneV05 havde tel:+45… og cifrene i markup, med
  // site.phone i sin egen aria-label — samme linje, to numre.
  const filer = readdirSync(join(root, "components"), { recursive: true })
    .map((f) => join("components", String(f)))
    .filter((f) => f.endsWith(".tsx"));
  assert.ok(filer.length >= 20, `negativ kontrol: fandt kun ${filer.length} komponenter`);
  const fund = [];
  for (const f of filer) {
    const src = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const n of numreI(src)) fund.push(`${f}: ${n}`);
    for (const m of src.matchAll(/\+45\d{8}/g)) fund.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(fund, [], "telefonnummer skrevet i hånden:\n" + fund.join("\n"));
});

test("negativ kontrol: hegnet kan blive rødt", () => {
  assert.match("+4591887396", E164);
  assert.doesNotMatch("91887396", E164, "uden +45 er det ikke e164");
  assert.doesNotMatch("+45918873961", E164, "ni cifre er ikke et dansk nummer");
  assert.equal("+45" + "91 88 73 96".replace(/\s/g, ""), "+4591887396");
  assert.notEqual("+45" + "55 24 86 08".replace(/\s/g, ""), "+4591887396");

  // Fælden der fældede hegnet selv: landekoden må ikke spises som cifre.
  assert.deepEqual(numreI("Call +45 91 88 73 96 or write"), ["91887396"]);
  assert.deepEqual(numreI("ring på 91 88 73 96 eller"), ["91887396"]);
  assert.deepEqual(numreI("CVR 44226413 · booking@inkandart.dk"), [], "et CVR er ikke et telefonnummer");
  assert.deepEqual(numreI("gammelt: 55 24 86 08"), ["55248608"], "et forkert nummer skal stadig findes");
});
