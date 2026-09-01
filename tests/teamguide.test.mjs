import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const yml = (p) => parse(read(p));

const da = yml("content/teamguide.yml");
const en = yml("content/teamguide.en.yml");
const side = read("app/(rummet)/personale/page.tsx");
const sideEn = read("app/(rummet)/en/personale/page.tsx");

/**
 * Teamguiden paa /personale.
 *
 * Stevens maal: alle medarbejdere skal kunne SLAA DEN OP, paa begge sprog,
 * og den maa IKKE vaere offentlig. De to krav trakker hver sin vej, saa de
 * har hver sin vagt her.
 */

test("guiden er ikke offentlig — bag koden paa begge sprog", () => {
  for (const [navn, s] of [["da", side], ["en", sideEn]]) {
    assert.match(s, /tokenErGyldigt/, `${navn}: ingen laas`);
    assert.match(s, /VAGT_COOKIE/, `${navn}: laesers ikke cookien`);
    // Uden det her ville laasen kunne cackes vaek af Vercel.
    assert.match(s, /dynamic = "force-dynamic"/, `${navn}: siden maa ikke caches`);
    assert.match(s, /revalidate = 0/, `${navn}`);
  }
});

test("guiden kan ikke findes af en soegemaskine", () => {
  for (const [navn, s] of [["da", side], ["en", sideEn]]) {
    assert.match(s, /index: false/, `${navn}: mangler noindex`);
    assert.match(s, /follow: false/, `${navn}: mangler nofollow`);
    assert.match(s, /nocache: true/, `${navn}`);
  }
});

test("aabningstider og piercingpriser HENTES — de skrives ikke af", () => {
  // Hele grunden til at guiden hoerer hjemme paa sitet. Skriver nogen en
  // aabningstid ind i teamguide.yml, er den den syvende kopi igen.
  for (const [navn, s] of [["da", side], ["en", sideEn]]) {
    assert.match(s, /loadAabningstider/, `${navn}`);
    assert.match(s, /loadPiercingpriser/, `${navn}`);
  }
  for (const [navn, d] of [["da", da], ["en", en]]) {
    const tekst = JSON.stringify(d);
    assert.doesNotMatch(tekst, /13[–-]22|13[–-]0[25]|Mandag[^"]*13/, `${navn}: en aabningstid er skrevet ind i guiden`);
    assert.doesNotMatch(tekst, /Enkelt øreflip|Single lobe/, `${navn}: en piercingpris er skrevet ind i guiden`);
  }
});

test("de to sprog har de samme noegler og lige lange lister", () => {
  assert.deepEqual(Object.keys(da).sort(), Object.keys(en).sort());
  for (const k of ["vaerdier", "aabning", "lukning", "roller", "regler", "kultur",
                   "salg_mindset", "salg_faser", "salg_indvendinger",
                   "priser_tattoo", "priser_flash", "kontakt"]) {
    assert.equal(da[k].length, en[k].length, `${k} er ikke lige lang paa de to sprog`);
  }
});

test("tjeklisterne har punkter — en tom liste er ingen liste", () => {
  for (const d of [da, en]) {
    for (const g of [...d.aabning, ...d.lukning]) {
      assert.ok(g.titel, "gruppe uden titel");
      assert.ok(g.punkter.length > 0, `«${g.titel}» har ingen punkter`);
    }
  }
});

test("laasen sender folk tilbage til den side de kom fra", () => {
  const rute = read("app/api/vagt/route.ts");
  // En fri retursti er en aaben viderestilling. Kun husets egne sider.
  assert.match(rute, /const RETUR: Record<string, string>/);
  assert.match(rute, /afstemning: "\/afstemning"/);
  assert.match(rute, /personale: "\/personale"/);
  assert.match(rute, /"en\/personale": "\/en\/personale"/);
  assert.match(rute, /\?\?\s*"\/afstemning"/, "ukendt vaerdi skal falde tilbage, ikke gaa igennem");
  assert.match(side, /name="retur" value="personale"/);
  assert.match(sideEn, /name="retur" value="en\/personale"/);
});

test("den engelske rute staar i registeret", async () => {
  const { EN_ROUTES } = await import("../lib/i18n.ts");
  assert.ok(EN_ROUTES.has("/personale"), "uden den 308'er sprogskifteren til dansk");
});

test("guiden staar ikke i navigationen — den findes kun for dem der kender den", () => {
  const nav = read("components/rummet/Nav.tsx");
  assert.doesNotMatch(nav, /personale/);
});
