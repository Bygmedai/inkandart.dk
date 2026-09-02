import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * Hvad QA-vagten SER paa — ikke hvad den maaler.
 *
 * S578: en fuld gennemgang fandt fire fejl paa fladen. Ingen af dem gik
 * roede i porten, fordi vagten ikke saa paa de ruter. `/piercing`,
 * `/samtykke` og HELE den engelske flade laa uden for hegnet, og porten
 * meldte groent paa #267 og #270 — ikke fordi der ikke var noget at se,
 * men fordi den ikke kiggede.
 *
 * En haardkodet liste loeser det ikke: den drifter igen naeste gang nogen
 * tilfoejer en side. Proeverne her er reglerne der holder listen aerlig.
 */

test("QA-vagten ser begge sprog: hver vagtet flade med en engelsk tvilling er parret", async () => {
  const { FLADER } = await import("../scripts/qa/flader.mjs");
  const { EN_ROUTES, EN_ROUTE_PREFIXES } = await import("../lib/i18n.ts");

  const vagtet = new Set(FLADER.map((f) => f.rute));
  const harEngelsk = (r) =>
    EN_ROUTES.has(r) || EN_ROUTE_PREFIXES.some((p) => r.startsWith(p));

  const uparrede = [];
  for (const rute of vagtet) {
    if (rute.startsWith("/en")) continue;
    // Forsiden er sin egen tvilling: «/» ↔ «/en».
    const tvilling = rute === "/" ? "/en" : `/en${rute}`;
    if (rute !== "/" && !harEngelsk(rute)) continue;
    if (!vagtet.has(tvilling)) uparrede.push(`${rute} → ${tvilling}`);
  }
  assert.deepEqual(uparrede, [],
    "vagtet paa dansk, men ikke paa engelsk — turisten moeder en flade ingen har set");

  // Negativ kontrol: uden den er «ingen uparrede» ogsaa sandt for en tom
  // liste, eller hvis harEngelsk holdt op med at svare ja til noget.
  const danske = [...vagtet].filter((r) => !r.startsWith("/en") && harEngelsk(r));
  assert.ok(danske.length >= 5, `proeven maalte kun ${danske.length} parbare ruter`);
});

test("en flade der tager imod penge eller en underskrift er vagtet", async () => {
  const { FLADER } = await import("../scripts/qa/flader.mjs");
  const vagtet = new Set(FLADER.map((f) => f.rute));

  // Grunden staar ved siden af, saa den der fjerner en raekke kan se hvad
  // det koster. Et overloeb paa en af disse er penge eller en underskrift.
  const kritiske = {
    "/booking": "tager imod en booking",
    "/flash": "tager imod penge (flash-droppet, S574)",
    "/gavekort": "tager imod penge",
    "/maerket/dolk": "vareside med koebsknap",
    "/piercing": "husets priser — en forkert pris er et loefte vi ikke holder",
    "/samtykke": "tager imod en underskrift",
  };
  for (const [rute, grund] of Object.entries(kritiske)) {
    assert.ok(vagtet.has(rute), `${rute} er uvagtet — ${grund}`);
  }
});

/**
 * S579 (2/9) — de to vagter skal faktisk kunne gaa roede.
 *
 * Begge stod groenne i maaneder UDEN at maale:
 *
 *   vilde-qa   ADVISORY=1 → exit 0 uanset fund. Den stod groen hele
 *              vejen gennem ti PR'er den 2/9 med 33 fund i sit summary.
 *   lighthouse `aggregationMethod` laa ved siden af `assertMatrix`, og
 *              lhci afviser den kombination: «Cannot use assertMatrix
 *              with other options». Assert-trinnet kastede hver eneste
 *              gang — og jobbet blev alligevel groent, fordi fejlen
 *              kom EFTER maalingen. Ingen taerskel er nogensinde blevet
 *              haandhaevet paa dette repo.
 *
 * Det er husets tilbagevendende fejl i sin reneste form: et hegn der ser
 * groent ud fordi det ikke maaler noget.
 */

test("QA-vagten er blokkerende — ADVISORY slaar den fra", () => {
  const wf = read(".github/workflows/vilde-qa.yml");
  const aktive = wf
    .split("\n")
    .filter((l) => l.includes("ADVISORY") && !l.trim().startsWith("#"));
  assert.deepEqual(aktive, [], `ADVISORY er sat igen: ${aktive.join(" · ")}`);
  // Negativ kontrol: proeven skal kunne se en aktiv linje, ikke bare
  // fravaeret af ordet — kommentaren der forklarer omskifteren naevner det.
  assert.match(wf, /ADVISORY/, "forklaringen af omskifteren er ogsaa vaek");
});

test("Lighthouse-konfigurationen kan faktisk vurdere — assertMatrix staar alene", () => {
  const cfg = JSON.parse(read(".github/lighthouse-config.json"));
  const a = cfg.ci.assert;
  assert.ok(a.assertMatrix, "der er ingen assertMatrix");
  // lhci: «Cannot use assertMatrix with other options». Enhver soesternoegle
  // faar assert-trinnet til at kaste, og saa vurderes intet.
  assert.deepEqual(Object.keys(a), ["assertMatrix"],
    `assertMatrix deler assert-blokken med: ${Object.keys(a).filter((k) => k !== "assertMatrix")}`);
  // Og hver post skal stadig baere sin egen aggregering — ellers faldt
  // «pessimistic» stiltiende tilbage til standarden da den blev flyttet.
  for (const m of a.assertMatrix) {
    assert.ok(m.matchingUrlPattern, "en matrix-post uden URL-moenster");
    assert.equal(m.aggregationMethod, "pessimistic",
      `${m.matchingUrlPattern} mistede sin aggregering`);
    assert.ok(Object.keys(m.assertions ?? {}).length > 0,
      `${m.matchingUrlPattern} vurderer ingenting`);
  }
});
