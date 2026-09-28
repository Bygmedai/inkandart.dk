// QA-vagtens Book.dk-undtagelse (Haruki via Steven, 28/9 2026).
// Beskederne herunder er de ægte — kopieret fra vilde-qa på #346 og målt
// lokalt i Chromium mod inkart.book.dk den 28/9.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  BOOKDK_UDLOEB,
  bookdkAktiv,
  bookdkNote,
  erBookdkUndtaget,
} from "../scripts/qa/undtagelser.mjs";

const IDAG = new Date("2026-09-28T08:00:00Z");
const SIDE = "https://inkart.book.dk/";
const JS = "https://inkart.book.dk/assets/js/ob-therapy-groups.js?v=1790581450";
const CSS = "https://inkart.book.dk/assets/css/ob-therapy-groups.css?v=1790581450";

const DE_TRE = [
  ["Failed to load resource: the server responded with a status of 404 (Not Found)", JS],
  [
    `Refused to apply style from '${CSS}' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.`,
    SIDE,
  ],
  [
    `Refused to execute script from '${JS}' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.`,
    SIDE,
  ],
];

test("de tre kendte beskeder er undtaget (punkt 1)", () => {
  for (const [tekst, url] of DE_TRE) assert.equal(erBookdkUndtaget(tekst, url, IDAG), true, tekst);
});

test("negativ kontrol: alt andet fra inkart.book.dk er stadig et fund (punkt 3)", () => {
  const stadigFund = [
    // En anden fil på samme vært — fx selve bookingmotoren
    ["Failed to load resource: the server responded with a status of 404 (Not Found)", "https://inkart.book.dk/assets/js/v2-booking.js?v=1"],
    // Samme fil, anden status
    ["Failed to load resource: the server responded with a status of 500 (Internal Server Error)", JS],
    // Samme fil, anden fejl
    ["Uncaught TypeError: Cannot read properties of undefined (reading 'init')", JS],
    // En anden besked fra Book.dk's side
    ["Uncaught ReferenceError: flatpickr is not defined", SIDE],
    // Refused, men en anden fil
    [`Refused to execute script from 'https://inkart.book.dk/assets/js/mobilepay-direct.js' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.`, SIDE],
    // Samme sti på en anden vært — og på vores eget domæne
    ["Failed to load resource: the server responded with a status of 404 (Not Found)", "https://app.book.dk/assets/js/ob-therapy-groups.js"],
    ["Failed to load resource: the server responded with a status of 404 (Not Found)", "http://localhost:3299/assets/js/ob-therapy-groups.js"],
    // Refused med Book.dk-filen, men udløst fra vores egen side
    [`Refused to execute script from '${JS}' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.`, "http://localhost:3299/booking"],
    // Uden URL overhovedet
    ["Failed to load resource: the server responded with a status of 404 (Not Found)", ""],
  ];
  for (const [tekst, url] of stadigFund) {
    assert.equal(erBookdkUndtaget(tekst, url, IDAG), false, `${tekst} @ ${url}`);
  }
});

test("udløb: fra dagen efter udløbsdatoen tæller de tre igen (punkt 4)", () => {
  const sidsteDag = new Date(`${BOOKDK_UDLOEB}T23:59:00Z`);
  const dagenEfter = new Date(`${BOOKDK_UDLOEB}T23:59:00Z`);
  dagenEfter.setUTCDate(dagenEfter.getUTCDate() + 1);
  assert.equal(bookdkAktiv(sidsteDag), true);
  assert.equal(bookdkAktiv(dagenEfter), false);
  for (const [tekst, url] of DE_TRE) {
    assert.equal(erBookdkUndtaget(tekst, url, sidsteDag), true);
    assert.equal(erBookdkUndtaget(tekst, url, dagenEfter), false);
  }
});

test("udløbsdatoen er den aftalte og ligger i fremtiden fra i dag", () => {
  assert.equal(BOOKDK_UDLOEB, "2026-10-12");
  assert.equal(bookdkAktiv(IDAG), true);
});

test("noten nævner antallet — og siger det højt, når Book.dk har rettet (punkt 2)", () => {
  assert.equal(bookdkNote(30, IDAG), "Book.dk ob-therapy-groups 404 undtaget: 30 (udløber 12/10).");
  assert.match(bookdkNote(0, IDAG), /undtaget: 0 .*kan fjernes/);
  const efter = new Date("2026-10-13T06:00:00Z");
  assert.match(bookdkNote(30, efter), /udløb 12\/10.*tæller igen/);
});

test("vagten bruger undtagelsen i konsol-lytteren og skriver noten i rapporten", () => {
  const vagt = readFileSync(new URL("../scripts/qa/vagt.mjs", import.meta.url), "utf8");
  assert.match(vagt, /if \(erBookdkUndtaget\(m\.text\(\), url\)\) \{\s*bookdkUndtaget\+\+;\s*return;/);
  assert.match(vagt, /bookdkNote\(bookdkUndtaget\)/);
  // Ingen tavs generalundtagelse for hele værten
  assert.doesNotMatch(vagt, /includes\(["']inkart\.book\.dk["']\)/);
  assert.doesNotMatch(vagt, /includes\(["']book\.dk["']\)/);
});
