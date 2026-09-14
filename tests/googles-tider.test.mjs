import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Googles virksomhedsdata (public/seo-ld.js) har husets ÅBNINGSTIDER, ikke
 * gamle. Samme fælde som husets-nummer.test.mjs: seo-ld.js er en statisk
 * fil (CSP: script-src 'self') og kan ikke importere content/aabningstider.yml
 * — så tiderne står der som en håndskrevet kopi, og en kopi der ikke måles
 * driver.
 *
 * [GROWTH-OPS] fandt 2026-09-14: kopien var den gamle nightshift-plan
 * (tor–lør til 23/23.30/14), mens huset siden 31/8 har haft man/tir/ons/søn
 * 13–22, tor 13–02, fre/lør 13–05. Google viste altså forkerte åbningstider
 * i søgeresultatet — en kunde der dukker op efter det Google lovede, møder
 * en lukket dør.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const DAG_EN = {
  man: "Monday",
  tir: "Tuesday",
  ons: "Wednesday",
  tor: "Thursday",
  fre: "Friday",
  loer: "Saturday",
  son: "Sunday",
};

const time = (t) => (t.includes(":") ? t : `${t.padStart(2, "0")}:00`);

/**
 * Finder hver OpeningHoursSpecification-blok i seo-ld.js: dag(e) → {opens, closes}.
 *
 * Matcher direkte i hele filen i stedet for først at afgrænse arrayet med
 * `[...]` — dayOfWeek er selv et array (`["Friday", "Saturday"]`), så en
 * ikke-grådig `[\s\S]*?\]` stopper ved den FØRSTE `]` den ser, altså midt i
 * det første element. Målt her: gav 0 fund i stedet for en fejl.
 */
function tiderIStructuredData(js) {
  const ud = new Map();
  const re = /"@type":\s*"OpeningHoursSpecification",\s*dayOfWeek:\s*(\[[^\]]*\]|"[A-Za-z]+")\s*,\s*opens:\s*"([\d:]+)"\s*,\s*closes:\s*"([\d:]+)"/g;
  for (const m of js.matchAll(re)) {
    const dage = m[1].startsWith("[")
      ? [...m[1].matchAll(/"([A-Za-z]+)"/g)].map((d) => d[1])
      : [m[1].replace(/"/g, "")];
    for (const d of dage) ud.set(d, { opens: m[2], closes: m[3] });
  }
  return ud;
}

test("Googles åbningstider stemmer med husets (content/aabningstider.yml)", async () => {
  const { loadAabningstider } = await import("../lib/content.ts");
  const husets = loadAabningstider();
  assert.ok(husets.length > 0, "negativ kontrol: aabningstider.yml gav ingen tider");

  const fundet = tiderIStructuredData(read("public/seo-ld.js"));
  assert.ok(fundet.size >= 3, `negativ kontrol: fandt kun ${fundet.size} dage i seo-ld.js`);

  const forventedeDage = new Set();
  for (const rum of husets) {
    for (const dagDa of rum.dage) {
      const dagEn = DAG_EN[dagDa];
      assert.ok(dagEn, `ukendt dagkode i aabningstider.yml: ${dagDa}`);
      forventedeDage.add(dagEn);
      const faktisk = fundet.get(dagEn);
      assert.ok(faktisk, `seo-ld.js mangler ${dagEn}`);
      assert.equal(faktisk.opens, time(rum.fra), `${dagEn}: seo-ld.js åbner et andet tidspunkt end huset`);
      assert.equal(faktisk.closes, time(rum.til), `${dagEn}: seo-ld.js lukker et andet tidspunkt end huset`);
    }
  }

  // Og omvendt: en dag i Googles data som huset ikke har, er en dag der
  // lover en åben dør huset ikke holder.
  const ukendte = [...fundet.keys()].filter((d) => !forventedeDage.has(d));
  assert.deepEqual(ukendte, [], "seo-ld.js nævner dage aabningstider.yml ikke har: " + ukendte.join(", "));
});

test("negativ kontrol: parseren kan finde en forkert tid", () => {
  const js = `openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday"], opens: "13:00", closes: "23:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "14:00", closes: "05:00" }
  ]`;
  const fundet = tiderIStructuredData(js);
  assert.equal(fundet.get("Monday").closes, "23:00");
  assert.equal(fundet.get("Saturday").opens, "14:00");
  assert.equal(fundet.size, 3);
});
