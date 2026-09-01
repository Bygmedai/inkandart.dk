import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const udenKommentarer = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/^#.*$/gm, "");

/**
 * Leverancevagten. Acceptkriterier: docs/accept/leverancevagt.md
 *
 * Den findes fordi et 2xx fra Resend betyder «accepteret til afsendelse»,
 * ikke «landet». Haruki fandt det i naturen 1/9: et brev til
 * `kontak@bygmedai.dk` (stavefejl) havde faaet 2xx og stod `suppressed`.
 */

test("AC2: en vagt der intet maaler, maa ikke ligne en der intet fandt", () => {
  const s = udenKommentarer(read("scripts/leverancevagt.mjs"));

  // Tre veje hvor vagten ikke har maalt noget. Alle tre skal AFSLUTTE
  // med en fejl, ikke falde igennem til «alt vel».
  for (const [navn, m] of [
    ["manglende noegle", /RESEND_READ_KEY[\s\S]{0,400}process\.exit\(1\)/],
    ["nul breve", /breve\.length === 0[\s\S]{0,300}process\.exit\(1\)/],
    ["uventet svar", /ingen liste at maale paa[\s\S]{0,120}process\.exit\(1\)/],
  ]) {
    assert.match(s, m, `${navn} melder ikke fejl`);
  }

  // Og den grønne vej skal SIGE hvor mange den saa paa.
  assert.match(s, /breve\.length\} breve maalt/, "rapporten siger ikke hvor mange");
});

test("AC3: rapporten baerer ingen kundedata", () => {
  const s = udenKommentarer(read("scripts/leverancevagt.mjs"));

  // Listen fra Resend HAR `to`, `subject`, `from`, `cc`, `bcc`.
  // Vagten maa ikke laese nogen af dem.
  for (const felt of ["\\.to\\b", "\\.subject\\b", "\\.from\\b", "\\.cc\\b", "\\.bcc\\b", "reply_to"]) {
    assert.doesNotMatch(s, new RegExp(`b\\.${felt.replace(/^\\\\\./, "")}`),
      `vagten laeser ${felt} — det hoerer ikke i en CI-log`);
  }

  // Kun id, tilstand og tidspunkt gaar i rapporten.
  assert.match(s, /id: b\.id/);
  assert.match(s, /last_event/);
});

test("AC4: sendenoeglen maa aldrig staa i vagten", () => {
  const wf = read(".github/workflows/leverancevagt.yml");
  assert.match(wf, /RESEND_READ_KEY/, "vagten har ingen laesenoegle");
  assert.doesNotMatch(wf, /RESEND_API_KEY/,
    "sendenoeglen staar i vagten — de to maa aldrig blive den samme");

  // Og scriptet skal sige det HOEJT hvis nogen alligevel bruger den.
  const s = read("scripts/leverancevagt.mjs");
  assert.match(s, /401[\s\S]{0,200}sending-only/,
    "et 401 forklares ikke — den naeste bruger et kvarter paa at gaette");
});

test("en tilstand der ikke er kendt, taeller som en fejl", async () => {
  // Det vigtigste valg i vagten: et UKENDT last_event maa ikke falde
  // igennem som «vel nok fint». Samme klasse som «en ukendt dagnoegle
  // bliver ikke tavst smidt vaek» (S577).
  const s = udenKommentarer(read("scripts/leverancevagt.mjs"));
  const i = s.indexOf("for (const b of breve)");
  assert.ok(i > -1, "negativ kontrol: fandt ikke loekken");
  const loekke = s.slice(i, s.indexOf("\n}", i));

  assert.match(loekke, /if \(LEVERET\.has\(e\)\) continue/);
  assert.match(loekke, /if \(UNDERVEJS\.has\(e\)\)/);
  // Alt andet — inklusive en tilstand Resend finder paa i morgen —
  // ender i gaaet_galt.
  assert.match(loekke, /gaaet_galt\.push/);
  assert.doesNotMatch(loekke, /else if[\s\S]*continue\s*;?\s*$/,
    "der er en vej ud af loekken der hverken maaler eller raaber");
});

test("vagten koerer paa en tidsplan og kan startes i haanden", () => {
  const wf = read(".github/workflows/leverancevagt.yml");
  assert.match(wf, /schedule:/);
  assert.match(wf, /workflow_dispatch:/, "kan ikke koeres i haanden naar noget braender");
  assert.match(wf, /permissions:\s*\n\s*contents: read/, "for brede rettigheder");
});
