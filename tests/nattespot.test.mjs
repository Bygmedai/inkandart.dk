import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

/**
 * Nattespot — Natten kan sælge noget (Stevens kald 30/8, docs/accept/nattespot.md).
 *
 * Prøverne er bundet til STRUKTUREN, ikke til ordene: copy'en er Stevens
 * og skal kunne rettes i Decap uden at CI går rød.
 */

test("beløbet står ét sted — siden og butikken kan ikke sige to tal", () => {
  const commerce = read("lib/commerce.ts");
  const blok = commerce.slice(
    commerce.indexOf("export const NATTESPOT"),
    commerce.indexOf("} as const;", commerce.indexOf("export const NATTESPOT")),
  );
  assert.match(blok, /kr: 300/, "300 kr er Stevens kald");
  assert.match(blok, /variantId: "\d{14}"/, "levende variant-ID");

  // Beløbet må IKKE stå i YAML. Står det to steder, driver de fra hinanden
  // i det øjeblik nogen retter prisen ét af stederne.
  for (const fil of ["content/natten.yml", "content/natten.en.yml"]) {
    assert.doesNotMatch(read(fil), /300/, `${fil} må ikke bære beløbet`);
  }
});

test("knappen er et rigtigt link — den virker uden JavaScript", () => {
  const flade = read("components/rummet/NattenFlade.tsx");
  const spot = flade.slice(flade.indexOf('className="rum-spot"'));
  assert.match(spot, /<a\s/, "et <a>, ikke en onClick-knap");
  assert.match(spot, /nattespotCartUrl\(\)/, "peger på Shopifys cart-permalink");
  assert.doesNotMatch(flade, /^\s*["']use client["']/m, "fladen er server-renderet");
});

test("REGRESSION: Nattespot tæller som depositum på /booking/tak", () => {
  // Harukis råb i commerce.ts: en ny depositum-vare SKAL med i
  // depositumVarianter(), ellers betaler kunden 300 kr og får at vide at
  // ordren ikke er en holdt tid. Den kobling er usynlig i diffen.
  const commerce = read("lib/commerce.ts");
  const fn = commerce.slice(commerce.indexOf("export function depositumVarianter"));
  assert.match(fn, /NATTESPOT\.variantId/);
});

test("sektionen kan slukkes fra Decap uden en udvikler", () => {
  // Tom spot_titel => ingen sektion. Så kan huset tage den af fladen
  // hvis natten holder pause, uden at nogen rører koden.
  const flade = read("components/rummet/NattenFlade.tsx");
  assert.match(flade, /copy\.spot_titel \? \(/);
});

test("begge sprog har alle fire felter — ingen halvtom engelsk sektion", () => {
  for (const fil of ["content/natten.yml", "content/natten.en.yml"]) {
    const y = read(fil);
    for (const n of ["spot_titel", "spot_linje", "spot_vilkaar", "spot_koeb"]) {
      assert.match(y, new RegExp(`^${n}:`, "m"), `${fil} mangler ${n}`);
    }
  }
});

test("copy'en lover ikke en dato, et antal eller en artist (kriterium 5)", () => {
  // Sitet er en brandflade for et rigtigt studie (rails §4). Vi ved ikke
  // hvem der sidder kl. 02 om tre uger, og et tal vi ikke tæller er en løgn.
  const da = read("content/natten.yml");
  const spot = da.slice(da.indexOf("spot_titel:"));
  assert.doesNotMatch(spot, /\b\d{1,2}\.\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)/i);
  assert.doesNotMatch(spot, /\b(Nizar|Emma|Anna)\b/, "ingen artist lovet");
  assert.doesNotMatch(spot, /\b\d+\s*(pladser|spots)\b/, "intet præcist antal");
});

test("REGRESSION: skærmlæser-sætningen taler kundens sprog", () => {
  // Fundet ved at måle den rigtige side: aria-etiketten var hårdkodet
  // dansk og fulgte med ud på /en, hvor en engelsk kunde fik «300 kroner
  // i depositum» læst op. For den der ikke kan se knappen, ER etiketten
  // knappen — så kriterium 3 gælder også her.
  const flade = read("components/rummet/NattenFlade.tsx");
  assert.match(flade, /aria-label=\{c\.spotAria\(/);
  assert.doesNotMatch(flade, /kroner i depositum/, "ingen dansk i markup");

  const i18n = read("lib/i18n.ts");
  assert.equal([...i18n.matchAll(/spotAria:/g)].length, 2, "begge sprog");
});
