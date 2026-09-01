import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
/**
 * Strip kommentarer — men IKKE en URL.
 *
 * Foerste udgave brugte `/\/\/.*$/` og aad derfor alt efter «https://».
 * `limit=100` forsvandt, proeven gik roed, og de OEVRIGE assertions paa
 * samme linjer maalte stille ingenting. Et hegn der aeder sit eget maal.
 * `(?<!:)` holder skemaets to skraastreger ude.
 */
const udenKommentarer = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(?<!:)\/\/.*$/gm, "").replace(/^#.*$/gm, "");

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
  // Rapporten skal sige BAADE hvor mange af husets breve den saa paa, og
  // hvor stor siden var — ellers kan «alt vel» ikke skelnes fra «jeg saa
  // kun de nyeste».
  assert.match(s, /mine\.length\} af husets breve/, "rapporten siger ikke hvor mange");
  assert.match(s, /siden gav \$\{breve\.length\}/, "rapporten siger ikke hvor stor siden var");
});

test("AC3: rapporten baerer ingen kundedata — men vagten MAA laese det den filtrerer paa", () => {
  const s = udenKommentarer(read("scripts/leverancevagt.mjs"));

  // v1 forboed vagten at LAESE afsenderen. Det gjorde domaenefilteret
  // umuligt at bygge: uden `from` kan den ikke se hvis brev det er.
  // Kriteriet blandede to ting. Vagten maa SE hvad den skal bruge — den
  // maa bare aldrig SKRIVE det (Harukis fund 1/9).
  assert.match(s, /b\.from/, "uden afsenderen kan husets post ikke skilles fra andres");

  // Men modtager og emne roeres slet ikke.
  for (const felt of ["to", "subject", "cc", "bcc", "reply_to", "html", "text"]) {
    assert.doesNotMatch(s, new RegExp(`b\\.${felt}\\b`),
      `vagten laeser b.${felt} — det er der ingen grund til`);
  }

  // Og kun id, tilstand og tidspunkt gaar VIDERE til rapporten.
  const raekke = s.slice(s.indexOf("const raekke"), s.indexOf("\n", s.indexOf("const raekke")));
  assert.match(raekke, /x\.id/);
  assert.doesNotMatch(raekke, /from|to|subject/, "raekken i rapporten baerer mere end id og tilstand");
});

test("AC1b: et vindue der ikke blev daekket, er roedt", () => {
  const s = udenKommentarer(read("scripts/leverancevagt.mjs"));
  // Uden limit giver Resend 20 og has_more:true. Vagten lovede et doegn.
  assert.match(s, /limit=100/, "siden er ikke stoerre end standardens 20");
  assert.match(s, /VINDUE_TIMER/, "der er intet vindue at daekke");
  // Og hvis siden ikke naaede tilbage til vinduets start: roed.
  assert.match(s, /aeldste < VINDUE_TIMER[\s\S]{0,400}process\.exit\(1\)/,
    "en side der ikke naaede vinduets start, melder alt vel");
});

test("AC3b: husets vagt raaber ikke paa en andens post", () => {
  const s = udenKommentarer(read("scripts/leverancevagt.mjs"));
  assert.match(s, /fraHuset/, "der er intet domaenefilter");
  assert.match(s, /breve\.filter\(\(b\) => fraHuset\(b\)/,
    "filteret bruges ikke foer breve taelles op");
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
  const i = s.indexOf("for (const b of mine)");
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

/**
 * S578 — noeglens raekkevidde er nu en MAALING, ikke en advarsel.
 *
 * v2 skrev i workflow-filen: «saet ikke hemmeligheden foer teamet er
 * skilt ad». Betingelsen var rigtig, og Haruki opfyldte den samme dag.
 * Men den stod som en aftale i hukommelsen — og den slags holder indtil
 * den ikke goer. Om et halvt aar roterer nogen noeglen i en fart.
 *
 * Proeverne herunder koerer VAGTEN, ikke dens kildetekst. Resend
 * erstattes af en stub der saettes ind foer scriptet starter — der er
 * ingen port, og dermed ingen forladt server at maale paa ved en fejl.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
const koer = promisify(execFile);

const HUSETS_DOMAENE = { data: [{ name: "send.inkandart.dk" }, { name: "inkandart.dk" }] };
const ET_BREV = (timer, event = "delivered") => ({
  id: "x", from: "samtykke@send.inkandart.dk", last_event: event,
  created_at: new Date(Date.now() - timer * 3600_000).toISOString(),
});

async function vagten(plan, noegle = "en-laesenoegle") {
  try {
    const r = await koer(
      process.execPath,
      ["--import", "./tests/fixtures/resend-stub.mjs", "scripts/leverancevagt.mjs"],
      { cwd: root, env: { ...process.env, RESEND_READ_KEY: noegle, STUB: JSON.stringify(plan) } },
    );
    return { kode: 0, ud: r.stdout + r.stderr };
  } catch (e) {
    return { kode: e.code ?? 1, ud: (e.stdout ?? "") + (e.stderr ?? "") };
  }
}

test("AC4: vagten spoerger hvad noeglen raekker over — FOER den henter et brev", async () => {
  // Stubben har KUN et svar til domaene-opslaget. Henter vagten breve
  // alligevel, kaster stubben — og saa er raekkefoelgen forkert.
  const fremmed = { data: [{ name: "inkandart.dk" }, { name: "en-anden-kunde.dk" }] };
  const r = await vagten({ "/domains": { krop: fremmed } });

  assert.equal(r.kode, 1, "en for bred noegle blev accepteret");
  assert.match(r.ud, /raekker ud over huset/, "vagten siger ikke hvorfor den stopper");
  assert.match(r.ud, /1 domaene/, "vagten siger ikke HVOR MANGE fremmede den saa");

  // Og navnet paa den anden kunde staar IKKE i loggen.
  assert.doesNotMatch(r.ud, /en-anden-kunde/, "en anden kundes domaene staar i vores CI-log");

  // Negativ kontrol: den maa ikke vaere naaet til brevene. Stubben har
  // intet svar paa /emails, saa et forsoeg ville se anderledes ud.
  assert.doesNotMatch(r.ud, /stubben har intet svar/, "vagten hentede breve foer den havde tjekket noeglen");
});

test("AC4: en noegle hvis raekkevidde ikke kan aflaeses, er ogsaa roed", async () => {
  /**
   * Bundet til GRUNDEN, ikke bare til exit-koden.
   *
   * Foerste udgave af denne proeve maalte kun `kode === 1` og fravaeret
   * af «Ingen bemaerkninger». Den gik GROEN da jeg fjernede
   * tom-liste-tjekket i en mutation: vagten faldt igennem til
   * brevhentningen, stubben havde intet svar dér, og vagten doede med 1
   * af en helt anden aarsag. Et hegn der bestod fordi det ikke maalte
   * noget — praecis den fejl vagten selv findes for at fange.
   */
  for (const [navn, plan, grund] of [
    ["tom liste", { "/domains": { krop: { data: [] } } }, /kunne ikke se hvilke domaener/],
    ["uventet svar", { "/domains": { krop: { noget: "andet" } } }, /kunne ikke se hvilke domaener/],
    // `data` der ikke er en liste. Uden `Array.isArray` slipper en
    // streng igennem og bliver laest tegn for tegn — den maalte proeve
    // for den vagt, ikke bare for den tomme liste.
    ["data er ikke en liste", { "/domains": { krop: { data: "noget" } } }, /kunne ikke se hvilke domaener/],
    ["sendenoeglen (401)", { "/domains": { status: 401, krop: {} } }, /domaene-opslaget[\s\S]*sending-only/],
  ]) {
    const r = await vagten(plan);
    assert.equal(r.kode, 1, `${navn}: vagten faldt igennem til groen`);
    assert.match(r.ud, grund, `${navn}: vagten stoppede, men ikke af den grund den skulle`);
    assert.doesNotMatch(r.ud, /Ingen bemaerkninger/, `${navn}: vagten meldte alt vel`);
    // Og den naaede aldrig brevene: stubben har intet svar paa /emails,
    // saa et forsoeg ville efterlade sit eget spor.
    assert.doesNotMatch(r.ud, /stubben har intet svar/,
      `${navn}: vagten hentede breve med en noegle den ikke kendte raekkevidden af`);
  }
});

test("AC4: husets EGEN noegle slipper igennem — og vagten maaler videre", async () => {
  // Den positive kontrol. Uden den beviser de roede prøver ingenting:
  // en vagt der altid gaar roed ville ogsaa bestaa dem.
  const r = await vagten({
    "/domains": { krop: HUSETS_DOMAENE },
    "/emails": { krop: { data: [ET_BREV(2), ET_BREV(30)] } },
  });
  assert.equal(r.kode, 0, `husets egen noegle blev afvist:\n${r.ud}`);
  assert.match(r.ud, /Ingen bemaerkninger/, "vagten naaede aldrig frem til rapporten");
});

test("AC4: et brev der IKKE kom frem, gaar stadig roedt bag den nye port", async () => {
  // Vagtens egentlige opgave maa ikke vaere blevet spaerret inde bag
  // noegletjekket. `suppressed` er praecis den tilstand Haruki fandt.
  const r = await vagten({
    "/domains": { krop: HUSETS_DOMAENE },
    "/emails": { krop: { data: [ET_BREV(2, "suppressed"), ET_BREV(30)] } },
  });
  assert.equal(r.kode, 1, "et brev der ikke kom frem, blev meldt som alt vel");
  assert.match(r.ud, /kom ikke frem/);
});
