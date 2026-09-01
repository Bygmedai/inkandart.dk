import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * Samtykkeerklaeringen. Simones formular, med hans felter — men den
 * sender, hvor hans gemte i browserens eget lager.
 */

const FELTER = ["navn", "foedselsdato", "email", "telefon", "kunstner", "placering", "motiv"];
const HELBRED = ["gravid", "blodfortyndende", "allergi", "hudlidelse", "andet"];
const ERKLAERING = ["atten", "permanent", "aftercare"];

test("alle Simones felter er med paa fladen", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx");
  for (const felt of FELTER) assert.match(f, new RegExp(`name="${felt}"`), felt);
  assert.match(f, /name="foto_ok"/, "fotosamtykket er sit eget felt");
});

test("helbred og erklaering staar i indholdet, begge sprog", () => {
  for (const fil of ["content/samtykke.yml", "content/samtykke.en.yml"]) {
    const s = read(fil);
    for (const id of HELBRED) assert.match(s, new RegExp(`id: ${id}\\b`), `${fil}: ${id}`);
    for (const id of ERKLAERING) assert.match(s, new RegExp(`id: ${id}\\b`), `${fil}: ${id}`);
  }
});

test("de to sprogfiler har de samme noegler", () => {
  const noegler = (f) =>
    read(f)
      .split("\n")
      .filter((l) => /^[a-z_]+:/.test(l))
      .map((l) => l.split(":")[0]);
  assert.deepEqual(noegler("content/samtykke.yml"), noegler("content/samtykke.en.yml"));
});

test("erklaeringen sendes — den gemmes ikke i browseren", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx");
  assert.match(f, /fetch\("\/api\/samtykke"/, "fladen poster ikke noget");
  assert.doesNotMatch(f, /localStorage|sessionStorage|indexedDB/i, "helbredsdata i browserens lager");
});

test("ruten er fail-closed", () => {
  const r = read("app/api/samtykke/route.ts");
  assert.match(r, /if \(!res\.ok\)/, "svarets status ses ikke efter");
  assert.match(r, /if \(!token\)[\s\S]{0,200}502/, "uden Shopify-adgang skal den fejle, ikke kvittere");
  assert.match(r, /company/, "honeypot mangler");
  assert.match(r, /MAX_BODY_BYTES/, "intet body-loft");
  assert.match(r, /AbortSignal\.timeout/, "ingen timeout paa upstream");
});

test("fladen kvitterer kun paa et rent svar", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx");
  assert.match(f, /if \(res\.ok\) setTilstand\("tak"\)/);
});

test("begge sprogruter findes og peger paa hver sin betingelsesside", () => {
  assert.match(read("app/(da)/(rummet)/samtykke/page.tsx"), /betingelserHref="\/betingelser"/);
  assert.match(read("app/(en)/(rummet)/en/samtykke/page.tsx"), /betingelserHref="\/en\/betingelser"/);
});

test("formularen kan printes til dem uden telefon", () => {
  assert.match(read("components/rummet/rummet.css"), /@media print[\s\S]{0,400}rum-samtykke__form/);
});
