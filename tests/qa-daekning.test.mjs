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
    "/shop/dolk": "vareside med koebsknap",
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

/**
 * S579 (3/9) — sidste skridt i «slaa CI til».
 *
 * At en vagt SIGER sandt er ikke det samme som at nogen lytter. Foer i dag
 * stod vilde-qa og lighthouse uden for Portens `paakraevede`-liste: de
 * kunne gaa roede uden at spaerre noget som helst. Og Porten er det eneste
 * branch protection kraever, saa en roed vagt var en roed lampe ved siden
 * af en aaben doer.
 *
 * De kom paa listen FOERST da begge var maalt groenne (#296, #297) — at
 * kraeve en vagt der ikke kan bestaa, er den laas Steven kaldte ud 2/9:
 * «Det giver jo ikke en mening at have en port der aldrig kan blive groen.»
 */

test("Porten kraever begge vagter — og de to lister i filen siger det samme", () => {
  const wf = read(".github/workflows/porten.yml");
  // Bundet til VARIABELNAVNENE, ikke til «en liste i backticks». Filen har
  // ogsaa en liste over agent-login-fragmenter, og et moenster der bare
  // leder efter backticks fangede den som en tredje «paakraevet»-liste.
  const lister = ["paakraevedeNavne", "paakraevede"].map((navn) => {
    const m = wf.match(new RegExp(`const ${navn} = \`([^\`]*)\``));
    assert.ok(m, `fandt ikke ${navn} i porten.yml`);
    return m[1];
  });
  // De to skal vaere ENS. Driver de fra hinanden, venter porten paa ét
  // saet og doemmer paa et andet — og saa er dommen faldet foer svaret kom.
  assert.equal(lister[0], lister[1],
    `ventelisten og domslisten er ikke ens:\n  ${lister[0]}\n  ${lister[1]}`);
  for (const navn of ["check", "Scan for secrets", "vilde-qa", "lighthouse"]) {
    assert.match(lister[0], new RegExp(`(^|,)\\s*${navn}\\s*(,|$)`),
      `«${navn}» er ikke paakraevet`);
  }
});

test("hvert paakraevet navn er et job der faktisk findes og koerer paa PR", () => {
  // Et paakraevet check der ikke findes, rapporterer aldrig — og Porten
  // spaerrer for evigt paa «har ikke rapporteret». Samme klasse som laasen
  // uden noegle: en regel der ikke kan opfyldes.
  const wf = read(".github/workflows/porten.yml");
  const navne = wf.match(/const paakraevede = `([^`]*)`/)[1].split(",").map((s) => s.trim());
  const filer = ["ci.yml", "trufflehog.yml", "vilde-qa.yml", "lighthouse-ci.yml"]
    .map((f) => read(`.github/workflows/${f}`));
  for (const navn of navne) {
    const fundet = filer.some((f) => {
      const jobs = [...f.matchAll(/^ {2}([a-z0-9-]+):$/gm)].map((m) => m[1]);
      const visteNavne = [...f.matchAll(/^\s*name: (.+)$/gm)].map((m) => m[1].trim());
      return jobs.includes(navn) || visteNavne.includes(navn);
    });
    assert.ok(fundet, `det paakraevede check «${navn}» findes ikke som job i nogen workflow`);
  }
  // Og de skal koere paa pull_request — ellers rapporterer de aldrig paa en PR.
  for (const f of ["vilde-qa.yml", "lighthouse-ci.yml"]) {
    assert.match(read(`.github/workflows/${f}`), /^on:[\s\S]*?pull_request:/m,
      `${f} koerer ikke paa pull_request`);
  }
});
