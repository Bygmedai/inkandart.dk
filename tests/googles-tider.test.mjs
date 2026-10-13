import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * Googles virksomhedsdata har husets ÅBNINGSTIDER, ikke gamle.
 *
 * [GROWTH-OPS] fandt 2026-09-14: den håndskrevne kopi i public/seo-ld.js var
 * den gamle nightshift-plan (tor–lør til 23/23.30/14), mens huset siden 31/8
 * har haft man/tir/ons/søn 13–22, tor 13–02, fre/lør 13–05. En kunde der
 * dukker op efter det Google lovede, møder en lukket dør.
 *
 * Fra 13/10 2026 findes kopien ikke: lib/jsonld.ts bygger tiderne af
 * content/aabningstider.yml. Testen bliver alligevel stående og måler
 * skemaet dag for dag — en omskrivning af jsonld.ts må ikke kunne lukke
 * en dag eller flytte et klokkeslæt i stilhed.
 */

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

/** Skemaets OpeningHoursSpecification → Map(dag → {opens, closes}). */
function tiderISkema(specs) {
  const ud = new Map();
  for (const s of specs) {
    const dage = Array.isArray(s.dayOfWeek) ? s.dayOfWeek : [s.dayOfWeek];
    for (const d of dage) ud.set(d, { opens: s.opens, closes: s.closes });
  }
  return ud;
}

/** Afvigelser mellem husets tider og skemaets — tom liste = ens. */
function afvigelser(husets, fundet) {
  const ud = [];
  const forventede = new Set();
  for (const rum of husets) {
    for (const dagDa of rum.dage) {
      const dagEn = DAG_EN[dagDa];
      if (!dagEn) { ud.push(`ukendt dagkode ${dagDa}`); continue; }
      forventede.add(dagEn);
      const f = fundet.get(dagEn);
      if (!f) { ud.push(`${dagEn} mangler`); continue; }
      if (f.opens !== time(rum.fra)) ud.push(`${dagEn} åbner ${f.opens}, huset ${time(rum.fra)}`);
      if (f.closes !== time(rum.til)) ud.push(`${dagEn} lukker ${f.closes}, huset ${time(rum.til)}`);
    }
  }
  // Og omvendt: en dag i Googles data som huset ikke har, lover en åben dør.
  for (const d of fundet.keys()) if (!forventede.has(d)) ud.push(`${d} står i skemaet, ikke i huset`);
  return ud;
}

test("Googles åbningstider stemmer med husets (content/aabningstider.yml)", async () => {
  const { loadAabningstider, loadKontakt } = await import("../lib/content.ts");
  const { studio } = await import("../lib/jsonld.ts");
  const { site } = await import("../lib/site.ts");
  const husets = loadAabningstider();
  assert.ok(husets.length > 0, "negativ kontrol: aabningstider.yml gav ingen tider");

  const fundet = tiderISkema(studio({ kontakt: loadKontakt(), tider: husets, site }).openingHoursSpecification);
  assert.equal(fundet.size, 7, `alle syv dage skal stå i skemaet — fandt ${fundet.size}`);
  assert.deepEqual(afvigelser(husets, fundet), []);
});

test("negativ kontrol: sammenligningen kan se en forkert tid og en ekstra dag", () => {
  const husets = [{ dage: ["man", "tir"], fra: "13", til: "22" }];
  const gammel = tiderISkema([
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday"], opens: "13:00", closes: "23:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "14:00", closes: "05:00" },
  ]);
  assert.deepEqual(afvigelser(husets, gammel), [
    "Monday lukker 23:00, huset 22:00",
    "Tuesday lukker 23:00, huset 22:00",
    "Saturday står i skemaet, ikke i huset",
  ]);
});
