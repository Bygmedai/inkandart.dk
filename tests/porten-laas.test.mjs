import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * Hegn paa LAASEN — .github/workflows/porten.yml.
 *
 * Noeglen (scripts/porten-frigivelse.mjs) og laasen kom foerst i samme
 * PR (#290). Porten laeser noeglen fra main — og den PR der lagde den
 * paa main, var selv laast. Steven, 2/9: «Vi skal jo ikke bygge en
 * port, som vi ikke kan finde noeglerne til.» Noeglen kom derfor foerst,
 * i sin egen PR (#292); laasen bagefter.
 *
 * Denne fil laeser KUN workflowet som tekst. Den importerer ikke
 * noeglen, saa check-jobbet er groent uanset om noeglen er merget —
 * det er porten selv der skal sige det, ikke check.
 *
 * Logikken bag frigivelsen proeves i tests/porten-frigivelse.test.mjs.
 */

test("porten vaagner naar et menneske godkender — og naar en godkendelse trukket tilbage", () => {
  const wf = read(".github/workflows/porten.yml");
  const m = wf.match(/pull_request_review:\s*\n\s*types:\s*\[([^\]]*)\]/);
  assert.ok(m, "porten koerer ikke paa reviews — saa kan en godkendelse aldrig naa den");
  assert.match(m[1], /\bsubmitted\b/);
  assert.match(m[1], /\bdismissed\b/, "en trukket godkendelse skal ogsaa gen-doemme");
});

test("porten henter frigivelsen fra default-branch og bruger dommerens egen liste over laaste stier", () => {
  const wf = read(".github/workflows/porten.yml");
  assert.match(wf, /porten-frigivelse\.mjs/, "porten kalder ikke frigivelsen");
  // Listen over hvem der maa laase op staar IKKE i workflowet — der kunne
  // en PR aendre den. Den staar i scriptet, som hentes fra default-branch.
  assert.doesNotMatch(wf, /MAA_LAASE_OP\s*=/, "allowlisten er defineret i workflowet");
  assert.doesNotMatch(wf, /stevenwensley-a11y/, "en konto er haardkodet i workflowet");
  // Laaste stier findes ét sted: dommeren. Workflowet importerer dem derfra.
  assert.match(wf, /LAASTE_STIER/, "workflowet kender ikke dommerens laaste stier");
  assert.doesNotMatch(wf, /LAASTE_STIER\s*=\s*\[/, "workflowet har sin egen liste over laaste stier");
  // Kun laast-sti-grunden maa fjernes — aldrig en roed check.
  // Anvendelsen sker i scriptet (proevet nedenfor), ikke som glue her —
  // og det er det ENDELIGE resultat der baade kvitteres og doemmes paa.
  assert.match(wf, /anvendFrigivelse\(resultat/, "workflowet anvender ikke frigivelsen");
  assert.match(wf, /kvittering\(endelig\)/, "kvitteringen viser dommen FOER frigivelsen");
  assert.match(wf, /if \(endelig\.dom !== AABEN\) core\.setFailed/, "check-run'en doemmes paa dommen FOER frigivelsen");
  assert.doesNotMatch(wf, /kvittering\(resultat\)/, "en kvittering bruger stadig det ufrigivne resultat");

  // MAALT paa #290: importen kastede ERR_MODULE_NOT_FOUND foer scriptet laa
  // paa main, og porten doede uden kvittering. Roedt uden forklaring er den
  // samme sygdom som «roed for evigt». Importen skal staa i et try/catch,
  // og catch-grenen skal give en note — ikke en aaben port.
  // Udsnittet bindes til blokkens EGNE kroellede parenteser paa deres
  // indrykning — ikke til «naeste }», som rammer ${e.message} foerst.
  // Foerste udgave gjorde netop det og maalte tre tegn. CLAUDE.md §1.
  const m = wf.match(/\n( +)try \{\n([\s\S]*?)\n\1\} catch \(e\) \{\n([\s\S]*?)\n\1\}/);
  assert.ok(m, "importen af frigivelsen staar ikke i et try/catch");
  const [, , proev, fang] = m;
  assert.ok(proev.includes("porten-frigivelse.mjs"), "importen staar uden for try-blokken");
  assert.match(fang, /kunne ikke frigives/, "catch-grenen forklarer ikke hvorfor der ikke blev laast op");
  assert.doesNotMatch(fang, /AABEN/, "catch-grenen aabner porten");
  assert.match(fang, /endelig = /, "catch-grenen efterlader dommen uden note");
});

test("review-koerslen doemmer ikke selv — den genstarter push-koerslen, og hedder ikke «porten»", () => {
  /**
   * Stevens screenshot 2/9 08:11: «Porten / porten (pull_request)» roed og
   * paakraevet, «Porten / porten (pull_request_review)» groen og paakraevet
   * — side om side. GitHub grupperer pr. navn + haendelse; den groene
   * loefter ikke den roede. Dommen skal derfor falde i push-koerslen.
   */
  const wf = read(".github/workflows/porten.yml");
  // Kun push-koerslen hedder «porten». Review-koerslen har et andet navn,
  // saa der aldrig staar to «porten» paa samme commit.
  assert.match(wf, /name: \$\{\{ github\.event_name == 'pull_request_review' && '[a-z-]+' \|\| 'porten' \}\}/,
    "review-koerslen hedder ogsaa «porten» — saa staar der to");
  // Review-grenen genstarter push-koerslen paa NETOP dette head, og stopper.
  const m = wf.match(/if \(context\.eventName === 'pull_request_review'\) \{([\s\S]*?)\n\s{12}\}/);
  assert.ok(m, "der er ingen review-gren");
  const gren = m[1];
  assert.match(gren, /event: 'pull_request'/, "genstarter ikke en push-koersel");
  assert.match(gren, /head_sha: pr\.head\.sha/, "genstarter ikke paa netop dette head");
  assert.match(gren, /reRunWorkflowFailedJobs/, "genstarter ingenting");
  assert.match(gren, /status !== 'completed'[\s\S]*?return/, "roerer en koersel der stadig er i gang");
  assert.doesNotMatch(gren, /porten\(|kvittering\(|setFailed/, "review-grenen doemmer selv");
  assert.ok(gren.trim().endsWith("return;"), "review-grenen falder igennem til dommen");
  // Genstart kraever rettigheden — og kun den.
  assert.match(wf, /permissions:[\s\S]*?actions: write/, "ingen ret til at genstarte egne koersler");
  // Og review-koerslen maa aldrig AFLYSE push-koerslen (maalt 08:02:02).
  assert.match(wf, /group: porten-\$\{\{ github\.event_name \}\}-/, "review og push deler concurrency-gruppe — den ene aflyser den anden");
});
