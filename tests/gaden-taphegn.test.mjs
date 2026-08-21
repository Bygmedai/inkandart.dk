import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "app/globals.css"), "utf8");

/**
 * Tap-hegnet: intet bevægeligt objekt må parkere oven på en købshandling.
 *
 * Baggrund (målt 2026-08-21 med Playwright + elementFromPoint i selve
 * overlap-rektanglet, 390×844): fuglens «gutter»-perch stod på top: 64% og
 * dækkede 2554 px² af kridtets 100 kr-mærke — et dødt hjørne på husets
 * billigste indgang. Geometrisk overlap er ligegyldigt; det er hit-testen
 * der afgør om et tap rammer figuren i stedet for linket.
 *
 * Kridt-MÆRKERNE (de to cart-permalinks) måltes til båndet 63,0%–82,4% af
 * «Under gaden»-sektionen på mobil. Parallax mellem mor-slot (data-depth
 * 1.12) og kerb-slot (0.62) giver ±45 px ≈ ±3,6% relativ drift, så hegnet
 * lægges med 5% luft: intet mobil-perch må lande i 58%–87%.
 *
 * Ændrer kridtets layout sig, skal båndet herunder måles om — ikke gættes.
 */
const MAERKE_BAAND = { fra: 58, til: 87 };

function mobilBlok(src) {
  // Sidste @media (max-width: 640px)-blok med figur-percher, bundet af
  // sine egne krøllede parenteser (ikke et udsnit til filens ende).
  const i = src.lastIndexOf('@media (max-width: 640px)');
  assert.notEqual(i, -1, "mobil-blokken findes ikke");
  const open = src.indexOf("{", i);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}" && --depth === 0) return src.slice(open + 1, j);
  }
  throw new Error("mobil-blokken lukker aldrig");
}

test("ingen figur-perch parkerer i kridtets mærke-bånd på mobil", () => {
  const blok = mobilBlok(css);
  const perches = [...blok.matchAll(/\.(mor|crew)--[a-z-]+\[data-perch="[a-z]+"\]\s*\{[^}]*top:\s*([\d.]+)%/g)];
  assert.ok(perches.length >= 1, "der skal findes mindst ét mobil-perch at måle");
  for (const [, slags, top] of perches) {
    const t = Number(top);
    const iBaandet = t >= MAERKE_BAAND.fra && t <= MAERKE_BAAND.til;
    assert.equal(
      iBaandet, false,
      `${slags}-perch på top: ${t}% ligger i kridtets mærke-bånd ` +
        `(${MAERKE_BAAND.fra}–${MAERKE_BAAND.til}%) — den vil æde et tap på en cart-permalink`
    );
  }
});

test("negativ kontrol: hegnet ville fange den perch der stod i produktion", () => {
  // 64% er den værdi der faktisk lå i main og målte 2554 px² på mærket.
  assert.equal(64 >= MAERKE_BAAND.fra && 64 <= MAERKE_BAAND.til, true,
    "hegnet skal dække den fejl vi rettede — ellers beskytter det intet");
  // og en perch klar af kridtet skal stadig være lovlig
  assert.equal(50 >= MAERKE_BAAND.fra && 50 <= MAERKE_BAAND.til, false);
});
