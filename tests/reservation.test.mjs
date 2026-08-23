import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");
const kerb = readFileSync(join(root, "components/emerge/KerbReservation.tsx"), "utf8");
const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
const css = readFileSync(join(root, "app/globals.css"), "utf8");

test("reservationerne bruger de verificerede live-varianter", () => {
  // Levende variant: 302 på et bart kald (200 hvis man følger redirect).
  // Død variant: 410. Se anvisningen i commerce.ts (Haruki, S568).
  assert.match(commerce, /53492757627208/); // reservér en tid · 100,-
  assert.match(commerce, /53463786127688/); // heldags-session · 1.000,-
  assert.match(commerce, /RESERVATIONS/);
});

test("piercing-varianterne er levende nu — og bor i PIERCINGS, ikke i kridtet", () => {
  // Hegnet stod tidligere omvendt: de fire var 410 den 2026-08-21, og testen
  // holdt dem UDE af handelslaget. Det var rigtigt dengang. De måler
  // 302/fulgt-200 den 2026-08-22 (scripts/maal-varianter.sh, negativ kontrol
  // i samme kørsel), så hegnet er vendt — ikke slettet. Reglen det håndhæver
  // er uændret: et variant-ID må kun stå i handelslaget hvis nogen har målt
  // det levende. CI kan ikke måle netværk; derfor måler denne test at ID'et
  // står i den liste vi har målt, og at ingen af dem er sluppet ind i
  // RESERVATIONS (kantstenen på forsiden er bevidst kun de to).
  const piercings = commerce.slice(
    commerce.indexOf("export const PIERCINGS"),
    commerce.indexOf("export const FLASH_DEPOSITS"),
  );
  assert.ok(piercings.length > 0, "PIERCINGS-blokken findes ikke");
  for (const id of ["53511714570568", "53511714996552", "53511715422536", "53511715881288"]) {
    assert.match(piercings, new RegExp(id), `piercing-variant ${id} mangler`);
  }
  const reservations = commerce.slice(
    commerce.indexOf("export const RESERVATIONS"),
    commerce.indexOf("export const SHOP_PRINTS"),
  );
  for (const id of ["53511714570568", "53511714996552", "53511715422536", "53511715881288"]) {
    assert.doesNotMatch(reservations, new RegExp(id), `${id} hører ikke til på kantstenen`);
  }
});

test("negativ kontrol: udsnittene måler deres egen blok", () => {
  // Vidnet. Uden det kunne begge slice() ramme hele filen og bestå på ingenting.
  const piercings = commerce.slice(
    commerce.indexOf("export const PIERCINGS"),
    commerce.indexOf("export const FLASH_DEPOSITS"),
  );
  assert.doesNotMatch(piercings, /53467075182920/, "gavekort-ID lækker ind i PIERCINGS-udsnittet");
  assert.doesNotMatch(piercings, /53463786094920/, "flash-ID lækker ind i PIERCINGS-udsnittet");
});

test("kridtet er en checkout-handoff uden klient-JS (rails §5)", () => {
  assert.match(kerb, /cartUrl\(/);
  // Direktivet — ikke ordet. Doc-kommentaren nævner "use client" med vilje.
  assert.doesNotMatch(kerb, /^\s*["']use client["']/m);
  assert.match(kerb, /aria-label=\{c\.ariaSlots\[/, "kridtet skal hente skærmlæser-teksten fra ordbogen");
});

test("copy'en lover ikke en tid vi ikke har (rails §4)", () => {
  // Copy'en flyttede til i18n (S569): den laa hardkodet dansk i komponenten
  // og fulgte derfor med ud paa /en og /en/shop. Loeftet maales nu dér hvor
  // ordene bor — og paa BEGGE sprog, saa den engelske ikke kan love mere.
  const i18n = readFileSync(join(root, "lib/i18n.ts"), "utf8");
  assert.match(i18n, /Trækkes fra prisen/);
  assert.match(i18n, /Comes off the price/);
  assert.match(i18n, /Tiden aftaler vi bagefter/);
  assert.match(i18n, /We agree the time afterwards/);
  // ingen påstand om at depositummet ER en booket tid
  assert.doesNotMatch(i18n, /du har (nu )?en tid/i);
  assert.doesNotMatch(i18n, /you (now )?have an appointment/i);
});

test("slotten er ét slot i Under gaden — og ligger over zonens bundfade", () => {
  assert.match(scene, /KerbReservation/);
  assert.match(scene, /className="kerb-slot"/);
  // Bundfaden er zIndex 9; kridtet skal ligge over den for ikke at blive dæmpet.
  // [\s\S] matcher hen over linjeskift, så testen overlever en reformatering
  // af scenen — den måler reglen, ikke hvordan filen tilfældigvis er brudt.
  const z = scene.match(/className="kerb-slot"[\s\S]{0,400}?zIndex:\s*['"]?(\d+)/);
  assert.ok(z, "kerb-slot mangler zIndex");
  assert.ok(Number(z[1]) > 9, `kerb-slot skal ligge over bundfaden (z-9), var z-${z[1]}`);
});

/**
 * Læs ÉN CSS-regels krop — bundet af sine egne krøllede parenteser.
 *
 * Tidligere klippede denne fil fra `indexOf(selector)` til filens ende. Det
 * hegn flytter sig hver gang naboen appender: da Fuglemor og gade-crew lagde
 * blokke til halen af globals.css, målte udsnittet pludselig andres CSS
 * (Haruki, S568 — samme fælde kostede #152 en runde). Nu måler vi reglen.
 */
function ruleBody(css, selector) {
  const i = css.indexOf(selector);
  assert.notEqual(i, -1, `regel ${selector} findes ikke i globals.css`);
  const open = css.indexOf("{", i);
  assert.notEqual(open, -1, `regel ${selector} har ingen krop`);
  let depth = 0;
  for (let j = open; j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}" && --depth === 0) return css.slice(open + 1, j);
  }
  throw new Error(`regel ${selector} lukker aldrig`);
}

test("mobil-placeringen bruger boks-model, ikke transform (lektionen fra #146)", () => {
  const mobile = ruleBody(css, ".emerge-v05 .kerb-slot");
  assert.match(mobile, /left: 5% !important/);
  assert.match(mobile, /right: 5% !important/);
  // Motoren ejer transform på [data-depth]-bokse — centrering er boks-model.
  assert.doesNotMatch(mobile, /transform/);
});

test("negativ kontrol: ruleBody måler reglen, ikke resten af filen", () => {
  // Vidnet på hegnet. Naboens CSS må ikke kunne læses ind i vores regel:
  // .kerb-slot-kroppen indeholder ikke fuglens eller crewets erklæringer,
  // selv om de ligger i samme fil.
  const mobile = ruleBody(css, ".emerge-v05 .kerb-slot");
  assert.doesNotMatch(mobile, /mor__|crew__|gade__/);
});
