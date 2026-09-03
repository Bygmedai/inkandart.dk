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
 * Én hylde (3/9 2026): /shop ER Rummets hylde. Gaden skal åbne den —
 * ikke den pensionerede Emerge-butik, og ikke /maerket (308).
 */
test("Gaden sender kunden til /shop, ikke til /maerket", () => {
  assert.match(gaden, /localePath\(lang, "\/shop"\)/);
  assert.doesNotMatch(gaden, /"\/maerket"/);
});

test("Gadens døre er kun Rummet-ruter", () => {
  const doere = [
    ...[...gaden.matchAll(/href="(\/[a-zæøå0-9/-]*)"/g)].map((m) => m[1]),
    ...[...gaden.matchAll(/localePath\(lang, "(\/[a-zæøå0-9/-]*)"\)/g)].map((m) => m[1]),
  ];
  assert.ok(doere.length >= 3, "Gaden skal have sine døre");
  const rummet = new Set([
    "/", "/booking", "/shop", "/gavekort", "/natten", "/stolen",
    "/gaden", "/blackbook", "/aftercare", "/betingelser", "/privatlivspolitik",
  ]);
  for (const d of doere) {
    assert.ok(rummet.has(d), `Gaden linker til en ikke-Rummet-rute: ${d}`);
  }
});
