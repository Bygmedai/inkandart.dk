import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
// S574: Gadens døre bor i fladen (én komponent, to sprog) — siden er
// blevet et par linjer der vælger sprog og data. Reglen måles hvor
// dørene faktisk står.
const gaden = readFileSync(join(root, "components/rummet/GadenFlade.tsx"), "utf8");

/**
 * S573: Gaden pegede på /shop — Emerge-fladen, som stadig bygges og stadig
 * annoncerer walk-in-tilbuddet med pris. Rummet må ikke sende en kunde ind i
 * det pensionerede design, og K7 siger walk-in-prisen kun findes fysisk.
 * Husets salgsdør er Mærket.
 */
test("Gaden sender kunden til Mærket, ikke til Emerge-shoppen", () => {
  assert.match(gaden, /localePath\(lang, "\/maerket"\)/);
  assert.doesNotMatch(gaden, /"\/shop"/);
});

test("Gadens døre er kun Rummet-ruter", () => {
  // Dørene er nu localePath(lang, "…") — samme regel, ny form.
  const doere = [
    ...[...gaden.matchAll(/href="(\/[a-zæøå0-9/-]*)"/g)].map((m) => m[1]),
    ...[...gaden.matchAll(/localePath\(lang, "(\/[a-zæøå0-9/-]*)"\)/g)].map((m) => m[1]),
  ];
  assert.ok(doere.length >= 3, "Gaden skal have sine døre");
  const rummet = new Set([
    "/", "/booking", "/maerket", "/gavekort", "/natten", "/stolen",
    "/gaden", "/blackbook", "/aftercare", "/betingelser", "/privatlivspolitik",
  ]);
  for (const d of doere) {
    assert.ok(rummet.has(d), `Gaden linker til en ikke-Rummet-rute: ${d}`);
  }
});
