import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const udenKommentarer = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * Kundevagten efter kasseskiftet (#291, 2/9). Den maalte kassen paa et
 * navn skrevet i filen — og navnet holdt op med at vaere kassen. Maalt
 * foer den naaede at gaa roed: 301/301/301 paa myshopify, 302/302/410
 * paa kassen. Fire maalinger ville have raabt «doed handel» om varianter
 * der lever fint.
 */

test("kundevagten maaler handelen dér hvor kunden sendes hen — ikke paa et navn i filen", () => {
  const s = udenKommentarer(read("scripts/kundevagt.mjs"));
  // Kassens vaert laeses ud af siden, som kunden goer.
  assert.match(s, /kasse = kurvVaert\(r\.body\)/, "vagten laeser ikke kassens vaert af /gavekort");
  // Og hver handelsmaaling bruger den — ingen af dem et haardkodet domaene.
  const kurv = s.match(/await hent\(`https:\/\/\$\{kasse\}\/cart\/[^`]*`/g) ?? [];
  assert.ok(kurv.length >= 3, `kun ${kurv.length} maaling(er) gaar via kassens vaert — der skal vaere positiv, positiv og negativ`);
  assert.doesNotMatch(s, /`\$\{SHOP\}\/cart\//, "en maaling bruger stadig det gamle SHOP-navn");
  assert.doesNotMatch(s, /d1qp54-0w\)\)/, "shop-siden maales stadig paa det gamle domaenenavn");
});

test("negativ kontrol og gamle links: begge maales, begge kan gaa roede", () => {
  const s = udenKommentarer(read("scripts/kundevagt.mjs"));
  assert.match(s, /99999999999999:1`, \{ follow: false \}\);\s*if \(r\.status !== 410\)/, "den doede variant maales ikke laengere som 410");
  // Det gamle domaene maales som det det ER nu: en viderestilling til kassen.
  assert.match(s, /API_HOST\}\/cart\//, "det gamle domaene maales slet ikke — et gammelt link i en mail kan doe uden at nogen ser det");
  assert.match(s, /til !== kasse/, "viderestillingen tjekkes ikke mod kassens vaert — 301 til hvad som helst ville vaere groent");
});

test("uden kassens vaert stopper handelsmaalingerne — de gaetter ikke", () => {
  const s = udenKommentarer(read("scripts/kundevagt.mjs"));
  const n = (s.match(/if \(!kasse\) return "kassens vært er ukendt/g) ?? []).length;
  assert.ok(n >= 4, `${n} af handelsmaalingerne fejler lukket uden vaert — alle skal`);
});
