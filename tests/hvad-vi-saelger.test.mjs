import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scene = readFileSync(join(root, "app/(rummet)/page.tsx"), "utf8");
const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");

/**
 * Sitet skal sige hvad huset sælger — med synlig tekst.
 *
 * Baggrund (Stevens beta-test, S568): to førstegangsbesøgende så forsiden og
 * spurgte «er det en tatoveringsbutik?». Målt bagefter i produktions-HTML:
 * ordet «tatovering» stod på forsiden PRÆCIS to gange, begge inde i en
 * aria-label. En skærmlæser fik det at vide; et menneske med øjne gjorde
 * ikke. «piercing» stod slet ikke på siden, selv om vi sælger det.
 *
 * Stemningen er hele pointen med Emerge — men den må ikke koste svaret på
 * «hvad er det her?». Disse vidner kræver at fagene står i SYNLIG tekst,
 * ikke kun i tilgængelighedsattributter.
 */
const synligTekst = (src) =>
  src
    // fjern alt inde i attributter (aria-label, alt, title, aria-*)
    .replace(/\b(aria-[a-z]+|alt|title)=(\{[^}]*\}|"[^"]*"|'[^']*')/g, "")
    // fjern JSX-udtryk og style-objekter
    .replace(/style=\{\{[^}]*\}\}/g, "");

test("forsiden siger med synlig tekst hvad vi laver", () => {
  const synlig = synligTekst(scene);
  assert.match(synlig, /Tatovering/i, "ordet «tatovering» skal stå synligt på Huset");
  assert.match(synlig, /piercing/i, "ordet «piercing» skal stå synligt på Huset");
});

test("negativ kontrol: en aria-label alene ville IKKE tælle", () => {
  // Vidnet skal måle det brugeren SER. Hvis det kunne snydes af en
  // attribut, ville det have været grønt hele vejen gennem beta-testen.
  const kunAttribut = '<a aria-label="Walk-in: to små tatoveringer, 900 kr"><svg /></a>';
  assert.doesNotMatch(synligTekst(kunAttribut), /tatovering/i);
});

/**
 * Læs ét objekt-literal, bundet af sine egne krøllede parenteser.
 *
 * Første udgave klippede fra `indexOf("export const metadata")` til
 * `indexOf("export const viewport")` — altså et hegn der hviler på at en
 * ANDEN eksport står bagefter i filen. Det er samme anti-mønster som CSS-
 * udsnittet CLAUDE.md advarer mod, og QA på #169 fangede det. Tredje gang
 * i dag: bind til strukturen, ikke til naboen.
 */
function objektEfter(src, noegle) {
  const i = src.indexOf(noegle);
  assert.notEqual(i, -1, `${noegle} findes ikke`);
  const start = src.indexOf("{", i);
  assert.notEqual(start, -1, `${noegle} har ingen krop`);
  let dybde = 0;
  for (let j = start; j < src.length; j++) {
    if (src[j] === "{") dybde++;
    else if (src[j] === "}" && --dybde === 0) return src.slice(start, j + 1);
  }
  throw new Error(`${noegle} lukker aldrig`);
}

test("negativ kontrol: metadata-udsnittet stopper ved sin egen krølle", () => {
  const fixtur = 'export const metadata = { title: "A" };\nexport const viewport = { themeColor: "#fff" };';
  const blok = objektEfter(fixtur, "export const metadata");
  assert.match(blok, /title/);
  assert.doesNotMatch(blok, /themeColor/, "udsnittet må ikke løbe ind i naboens eksport");
});

test("titel og beskrivelse svarer på «hvad er det her?»", () => {
  const blok = objektEfter(layout, "export const metadata");
  for (const ord of [/tatovering/i, /piercing/i, /Larsbjørnsstræde/]) {
    assert.match(blok, ord, `metadata mangler ${ord}`);
  }
  // Titlen er det Google viser: brandet først, faget lige efter.
  const titel = blok.match(/title:\s*"([^"]+)"/);
  assert.ok(titel, "titel mangler");
  assert.match(titel[1], /^Ink & Art/, "brandet skal stå først i titlen");
  assert.match(titel[1], /tatovering/i, "titlen skal bære faget");
  assert.ok(titel[1].length <= 65, `titlen er ${titel[1].length} tegn — Google klipper ved ~60`);
});
