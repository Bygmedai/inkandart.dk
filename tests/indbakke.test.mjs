// Indbakken må aldrig nå main med billeder i (Villy, 6/10 2026).
//
// indbakke/ er hvor Steven lægger råt billedmateriale direkte på en PR-gren
// (Nizars nye billeder, 6/10). Filerne er ikke gennemgået: vi ved ikke om
// det er hans arbejde eller ham selv, om en kunde er genkendelig, eller om
// de er web-klare (et telefonfoto er 3–5 MB). Først når hvert billede er
// gennemgået, omdøbt og lagt i public/slots/, tømmes mappen.
//
// Derfor er prøven RØD så længe der ligger et billede her. Det er meningen:
// en PR med uafklarede billeder kan ikke merges ved et uheld.
import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indbakke = join(root, "indbakke");
const BILLEDE = /\.(jpe?g|png|heic|heif|webp|gif|tiff?|mov|mp4)$/i;

function filer(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? filer(p) : [p];
  });
}

test("indbakken er tom for billeder — alt er gennemgået og lagt på plads", () => {
  const rest = filer(indbakke).filter((p) => BILLEDE.test(p)).map((p) => relative(root, p));
  assert.deepEqual(rest, [], `ugennemgåede billeder i indbakken:\n${rest.join("\n")}`);
});

test("negativ kontrol: prøven kan se et billede, også med et WhatsApp-navn", () => {
  for (const n of ["WhatsApp Image 2026-10-06 at 09.12.44 (1).jpeg", "IMG_1234.HEIC", "klip.mov"]) {
    assert.ok(BILLEDE.test(n), n);
  }
  assert.ok(!BILLEDE.test("README.md"));
});
