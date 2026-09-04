import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

const { loadGulvet } = await import("../lib/content.ts");
const { rensFund, heltal, gulvetErSat } = await import("../lib/gulvet.ts");
const { regnDoeren, perOpgave, perSlag, perUgedag, perUge, isoUge, svartid, planModVirkelighed, effectiveTilstand } = await import("../lib/gulvet-tal.ts");

const c = loadGulvet();

/* ---------------------------------------------------------------- indholdet */

test("programmet er helt: 16 opgaver fordelt på 4 uger uden huller", () => {
  assert.equal(c.opgaver.length, 16);
  assert.equal(c.faser.length, 4);
  // Faserne skal dække præcis alle opgaver, uden overlap og uden mellemrum.
  let naaet = 0;
  for (const f of c.faser) {
    assert.equal(f.fra, naaet, `fase «${f.navn}» starter ikke hvor den forrige slap`);
    assert.ok(f.til > f.fra, `fase «${f.navn}» er tom`);
    naaet = f.til;
  }
  assert.equal(naaet, c.opgaver.length, "faserne dækker ikke alle opgaver");
});

test("hver opgave siger hvad vi tror, hvad hun gør, og hvad hun selv afgør", () => {
  for (const [i, o] of c.opgaver.entries()) {
    const hvor = `opgave ${i + 1} («${o.t}»)`;
    assert.ok(o.t, `${hvor}: mangler titel`);
    assert.ok(o.tror.length > 40, `${hvor}: «tror» er for tynd — det er hele pointen med sidemandsoplæring`);
    assert.ok(o.trin.length >= 2, `${hvor}: skal have mindst to trin`);
    assert.ok(o.afgoer, `${hvor}: mangler det hun selv skal afgøre`);
    assert.ok(o.b, `${hvor}: mangler hvad hun kommer tilbage med`);
    assert.ok(o.tid, `${hvor}: mangler tidsforventning`);
  }
});

test("guiderne findes, og ingen blok er faldet på gulvet i loaderen", () => {
  const raa = parse(read("content/gulvet.yml"));
  assert.deepEqual(c.guider.map((g) => g.id), ["book", "shop", "flow", "content"]);
  for (const [i, g] of raa.guider.entries()) {
    // En ukendt type droppes stille af loaderen. Det er med vilje — men så
    // skal testen fange det, ellers forsvinder en guide uden at nogen ser det.
    assert.equal(
      c.guider[i].blokke.length,
      g.blokke.length,
      `guide «${g.id}»: loaderen droppede en blok — ukendt type i gulvet.yml?`,
    );
  }
});

test("kundeflow-diagrammet har alle de tal det tegner", () => {
  for (const n of ["gaden", "instagram", "google", "telefon", "butikken", "dm",
                   "site", "stolen", "bookdk", "shop", "kassen", "koeb"]) {
    assert.ok(c.flow[n], `flow.${n} mangler — diagrammet ville tegne "undefined"`);
  }
  assert.equal(c.flow.knaek.length, 3);
});

test("«Spørgsmål» er et af de slags man kan skrive — ellers kan intet besvares", () => {
  assert.ok(c.slags.includes("Spørgsmål"));
  assert.ok(c.slags.includes("Vagt-tal"));
});

/* -------------------------------------------------------------- valideringen */

const nu = { slag: "Drift", tekst: "noget", dato: "2026-09-03", hvem: "Sonja" };

test("et fund uden tekst eller med en umulig dato afvises", () => {
  assert.equal(rensFund({ ...nu, tekst: "   " }, c.slags), null);
  assert.equal(rensFund({ ...nu, dato: "3. september" }, c.slags), null);
  assert.equal(rensFund({ ...nu, dato: "2026-13-45" }, c.slags), null);
  assert.equal(rensFund({ ...nu, dato: "" }, c.slags), null);
});

test("spoergsmaal sættes af slaget — ikke af klienten", () => {
  // Klienten kan ikke lyve sig til et spørgsmål, og kan ikke undgå at blive et.
  assert.equal(rensFund({ ...nu, slag: "Spørgsmål" }, c.slags).spoergsmaal, true);
  assert.equal(rensFund({ ...nu, slag: "Drift" }, c.slags).spoergsmaal, false);
});

test("et fund kommer aldrig ind med et svar allerede sat", () => {
  const f = rensFund({ ...nu, svar: "ja", svar_af: "en fremmed" }, c.slags);
  assert.equal(f.svar, null);
  assert.equal(f.svar_af, null);
});

test("tal er tal — eller null. Aldrig NaN, aldrig negativt, aldrig absurd", () => {
  assert.equal(heltal("12", 100), 12);
  assert.equal(heltal(12.7, 100), 12);
  assert.equal(heltal("", 100), null);
  assert.equal(heltal(null, 100), null);
  assert.equal(heltal("mange", 100), null);
  assert.equal(heltal("-3", 100), null);
  assert.equal(heltal("101", 100), null, "over loftet skal afvises, ikke klippes");
});

test("for lange felter klippes i stedet for at ramme databasens check-constraint", () => {
  const f = rensFund({ ...nu, tekst: "a".repeat(9_000), hvem: "b".repeat(300) }, c.slags);
  assert.equal(f.tekst.length, 4_000);
  assert.equal(f.hvem.length, 80);
});

test("ukendt slag falder tilbage, men kan ikke bruges til at smugle noget langt ind", () => {
  const f = rensFund({ ...nu, slag: "x".repeat(200) }, c.slags);
  assert.ok(f.slag.length <= 40);
  assert.equal(rensFund({ ...nu, slag: "" }, c.slags).slag, "Andet");
});

test("uden env er logbogen slukket, ikke åben", () => {
  const før = process.env.GULVET_SUPABASE_URL;
  delete process.env.GULVET_SUPABASE_URL;
  assert.equal(gulvetErSat(), false);
  if (før) process.env.GULVET_SUPABASE_URL = før;
});

/* ------------------------------------------------------------------ døren */

test("api-ruten afviser alt uden husets cookie, og siger ikke hvorfor", () => {
  const src = read("app/api/gulvet/route.ts");
  assert.match(src, /tokenErGyldigt/, "ruten tjekker ikke vagt-cookien");
  assert.match(src, /401/, "en låst rute skal svare 401");
  for (const m of ["POST", "PATCH"]) {
    const krop = src.slice(src.indexOf(`export async function ${m}`));
    assert.match(krop.slice(0, 200), /await laast\(\)/, `${m} tjekker ikke døren først`);
  }
  // Svaret må ikke røbe hvorfor. Findes der en fejlbesked, er den for meget.
  assert.doesNotMatch(src, /fejl:\s*["'`]/, "svaret fortæller hvorfor det gik galt");
});

test("vagt-døren kender /gulvet — ellers sender koden hende til afstemningen", () => {
  assert.match(read("app/api/vagt/route.ts"), /gulvet:\s*"\/gulvet"/);
});

test("siden er lukket for søgemaskiner og bliver aldrig cachet", () => {
  const src = read("app/(da)/(rummet)/gulvet/page.tsx");
  assert.match(src, /index:\s*false/);
  assert.match(src, /nocache:\s*true/);
  assert.match(src, /force-dynamic/);
  assert.match(src, /tokenErGyldigt/, "siden viser indhold uden at tjekke koden");
});

test("service-role-nøglen forlader aldrig serveren", () => {
  const flade = read("components/rummet/GulvetFlade.tsx");
  assert.doesNotMatch(flade, /GULVET_SUPABASE/, "klientfladen kender serverens env");
  assert.doesNotMatch(flade, /supabase\.co/, "klientfladen taler direkte med databasen");
  // Klienten importerer typer fra gulvet-typer, ikke fra serverens modul.
  assert.doesNotMatch(flade, /from "@\/lib\/gulvet"/);
});

/* -------------------------------------------------------------------- CSS */

/** Reglens egen krop, afgrænset af dens krøllede parenteser — ikke et
 *  udsnit til filens ende, som flytter sig når naboen bygger (CLAUDE.md §1). */
function ruleBody(css, selector) {
  // Selektoren skal slutte hvor den slutter: indexOf(".gulv-fane") ramte
  // ".gulv-faner" og målte den forkerte regel. Fanget af testen selv.
  const m = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`).exec(css);
  assert.ok(m, `fandt ikke ${selector}`);
  const start = css.indexOf("{", m.index);
  return css.slice(start + 1, css.indexOf("}", start));
}

test("lister ligger ikke i grid — det hakker en sætning med fed midt over", () => {
  const css = read("components/rummet/rummet.css");
  for (const sel of [".gulv-trin li", ".gulv-opskrift li"]) {
    assert.doesNotMatch(ruleBody(css, sel), /display:\s*grid/, `${sel} er et grid igen`);
    assert.match(ruleBody(css, sel), /position:\s*relative/, `${sel} mangler sit anker`);
  }
});

test("gulvets blok slutter med sin egen reduced-motion — ingen fælles hale", () => {
  const css = read("components/rummet/rummet.css");
  const blok = css.slice(css.indexOf("Gulvet: husets oplæringsmåned"));
  assert.match(blok, /@media \(prefers-reduced-motion: reduce\)/);
  // Negativ kontrol: blokken må ikke røre noget uden for sit eget præfiks.
  const selektorer = blok.match(/^\.[a-z-]+/gm) ?? [];
  for (const s of selektorer) assert.ok(s.startsWith(".gulv"), `blokken rører ${s} — uden for lanen`);
});

test("trykflader er mindst 44 px høje", () => {
  const css = read("components/rummet/rummet.css");
  for (const sel of [".gulv-fane", ".gulv-seg button", ".gulv-slag button", ".gulv-knap"]) {
    assert.match(ruleBody(css, sel), /min-height: 4[48]px/, `${sel} har intet trykfelt-gulv`);
  }
});

/* ------------------------------------------------------- fanen «Overblik» */

test("overblikkets tekster og husets to tal står i gulvet.yml, ikke i koden", () => {
  for (const n of ["lede", "tom", "web_linje", "svar_lede", "opgave_lede",
                   "laerte_lede", "laerte_tom", "ugedag_lede", "uge_lede"]) {
    assert.ok(c.overblik[n], `overblik.${n} mangler — fanen ville vise en tom overskrift`);
  }
  assert.ok(c.overblik.vagter_min >= 1, "en grænse på nul betyder «regn et månedstal på ingenting»");
  assert.ok(c.tal.timepris > 0 && c.tal.stoletime > 0);
  assert.ok(c.undertitel, "værktøjet skal sige hvad det er");
});

const vagt = (o) => ({
  id: "00000000-0000-4000-8000-000000000000", slag: "Vagt-tal", tekst: "t",
  dato: "2026-09-03", hvem: "Sonja", ind: null, koebte: null, salg: null,
  spoergsmaal: false, svar: null, svar_af: null, opgave: null,
  oprettet: "2026-09-03T00:00:00Z", ...o,
});

test("ingen målinger giver null — ikke et nul. «Ikke målt» er ikke «målt til nul»", () => {
  assert.equal(regnDoeren([], 5, 1000), null);
  assert.equal(regnDoeren([vagt({ slag: "Drift" })], 5, 1000), null, "en note uden tal er ikke en vagt");
});

test("en vagt uden nogen ind ad døren giver ingen lukkerate — aldrig NaN", () => {
  const d = regnDoeren([vagt({ ind: 0, koebte: 0, salg: 0 })], 5, 1000);
  assert.equal(d.lukke, null, "0/0 må ikke blive til NaN i en overskrift");
  assert.equal(d.prHoved, null);
  assert.equal(d.vagter, 1);
});

test("tallene lægges sammen, og datoerne spænder fra første til sidste vagt", () => {
  const d = regnDoeren([
    vagt({ dato: "2026-09-05", ind: 10, koebte: 2, salg: 400 }),
    vagt({ dato: "2026-09-01", ind: 30, koebte: 8, salg: 1600 }),
  ], 5, 1000);
  assert.equal(d.ind, 40);
  assert.equal(d.koebte, 10);
  assert.equal(d.salg, 2000);
  assert.equal(d.lukke, 0.25);
  assert.equal(d.prHoved, 50);
  assert.equal(d.fra, "2026-09-01");
  assert.equal(d.til, "2026-09-05");
  assert.equal(d.stoletimer, 2);
});

test("under husets grænse regnes der ikke månedstal — siden siger stikprøve", () => {
  const to = [vagt({ dato: "2026-09-01", ind: 4 }), vagt({ dato: "2026-09-02", ind: 4 })];
  const d = regnDoeren(to, 5, 1000);
  assert.equal(d.nok, false);
  assert.equal(d.mangler, 3);
  // Bemærk: en «vagt» uden ét eneste tal tælles ikke med. Det er med vilje —
  // en tom formular er ikke en måling. Derfor har alle fem et tal her.
  const fem = [...to, vagt({ dato: "2026-09-03", ind: 4 }), vagt({ dato: "2026-09-04", ind: 4 }),
               vagt({ dato: "2026-09-05", ind: 4 })];
  assert.equal(regnDoeren([...to, vagt({ dato: "2026-09-06" })], 5, 1000).vagter, 2,
    "en tom formular er ikke en måling");
  assert.equal(regnDoeren(fem, 5, 1000).nok, true);
  assert.equal(regnDoeren(fem, 5, 1000).mangler, 0);
});

test("hvert fund hører til den opgave det kom fra — det er regnskabet", () => {
  const m = perOpgave([
    vagt({ opgave: "o1", tekst: "a" }), vagt({ opgave: "o1", tekst: "b" }),
    vagt({ opgave: null, tekst: "c" }),
  ]);
  assert.equal(m.get("o1").length, 2);
  assert.equal(m.has("o2"), false, "en opgave uden fund må ikke opfinde en tom liste");
});

test("et opgavemærke er «o1»…«o999» eller ingenting — aldrig en filterstreng", () => {
  assert.equal(rensFund({ ...nu, opgave: "o7" }, c.slags).opgave, "o7");
  assert.equal(rensFund({ ...nu, opgave: "" }, c.slags).opgave, null);
  assert.equal(rensFund({ ...nu, opgave: "o1;drop" }, c.slags).opgave, null);
  assert.equal(rensFund({ ...nu, opgave: "eq.o1" }, c.slags).opgave, null);
  assert.equal(rensFund({ ...nu }, c.slags).opgave, null);
});

test("alle områder tælles med — også dem ingen har rørt", () => {
  const r = perSlag([vagt({ slag: "Instagram" }), vagt({ slag: "Instagram" })], c.slags);
  assert.equal(r.length, c.slags.length, "et område med nul er den mest brugbare linje i tabellen");
  assert.deepEqual(r[0], ["Instagram", { n: 2, seneste: "2026-09-03" }]);
  assert.ok(r.some(([, x]) => x.n === 0));
});

test("et spørgsmål kan faktisk besvares fra fladen — ellers er «Skriv» en kirkegård", () => {
  const flade = read("components/rummet/GulvetFlade.tsx");
  assert.match(flade, /svarPaa/, "der er ingen vej fra et ubesvaret spørgsmål til et svar");
  assert.match(flade, /JSON\.stringify\(\{ id, svar: t, hvem \}\)/, "svaret sendes ikke til ruten");
  // Ruten tager kun imod et rigtigt uuid; en netop gemt post har et
  // midlertidigt id, og så må knappen ikke vises.
  assert.match(flade, /ER_UUID\.test\(p\.id\)/);
});

test("fundet bærer den opgave hun står i — ellers kan måneden ikke gøres op", () => {
  const flade = read("components/rummet/GulvetFlade.tsx");
  assert.match(flade, /opgave: valgtOpgave/);
});

test("de nye trykflader er også mindst 44 px", () => {
  const css = read("components/rummet/rummet.css");
  assert.match(ruleBody(css, ".gulv-fold > summary"), /min-height: 44px/);
  assert.match(ruleBody(css, ".gulv-felt select"), /min-height: 4[48]px/);
});

/* ------------------------------------------------------- ugedage og uger */

test("ugedagen regnes rigtigt, og mandag er først — ikke søndag som i JS", () => {
  // 2026-09-07 er en mandag, 2026-09-13 en søndag.
  const r = perUgedag([vagt({ dato: "2026-09-07", ind: 10 }), vagt({ dato: "2026-09-13", ind: 30, koebte: 3 })]);
  assert.equal(r[0].dag, "man");
  assert.equal(r[0].indPrVagt, 10);
  assert.equal(r[6].dag, "søn");
  assert.equal(r[6].indPrVagt, 30);
  assert.equal(r[6].lukke, 0.1);
  assert.equal(r[1].vagter, 0, "en dag uden vagt er nul vagter, ikke en fejl");
  assert.equal(r[1].lukke, null);
});

test("ugedage er pr. vagt — den dag der er talt flest gange vinder ikke bare", () => {
  const r = perUgedag([
    vagt({ dato: "2026-09-11", ind: 40 }), vagt({ dato: "2026-09-18", ind: 40 }), // to fredage à 40
    vagt({ dato: "2026-09-12", ind: 60 }),                                        // én lørdag à 60
  ]);
  assert.equal(r[4].indPrVagt, 40);
  assert.equal(r[5].indPrVagt, 60, "lørdag skal stå højere pr. vagt selv om fredag har flere vagter i alt");
});

test("ISO-ugen er den samme nøgle som gulvet_analyse.uge — ellers kan de to ikke joines", () => {
  assert.equal(isoUge("2026-09-03"), "2026-W36");
  assert.equal(isoUge("2026-09-07"), "2026-W37");
  assert.equal(isoUge("2026-01-01"), "2026-W01");
  assert.equal(isoUge("2027-01-01"), "2026-W53", "nytår hører til det gamle års sidste uge når det er fredag");
});

test("uge for uge tæller noter og vagter hver for sig, og kommer i rækkefølge", () => {
  const r = perUge([
    vagt({ dato: "2026-09-10", ind: 20, koebte: 5 }),
    vagt({ dato: "2026-09-03", slag: "Drift" }),
    vagt({ dato: "2026-09-04", ind: 10 }),
  ]);
  assert.deepEqual(r.map((u) => u.uge), ["2026-W36", "2026-W37"]);
  assert.equal(r[0].noter, 2);
  assert.equal(r[0].vagter, 1, "en note uden tal er ikke en vagt");
  assert.equal(r[1].lukke, 0.25);
});

/* ------------------------------------------------------------- svartid */

const spm = (o) => vagt({ slag: "Spørgsmål", spoergsmaal: true, oprettet: "2026-09-01T10:00:00Z", ...o });

test("svartiden er en median, så ét glemt spørgsmål ikke skjuler at de andre fik svar samme dag", () => {
  const r = svartid([
    spm({ svar: "ja", svar_paa: "2026-09-01T12:00:00Z" }),
    spm({ svar: "ja", svar_paa: "2026-09-01T14:00:00Z" }),
    spm({ svar: "ja", svar_paa: "2026-09-22T10:00:00Z" }),
  ], new Date("2026-09-23T10:00:00Z"));
  assert.equal(r.besvarede, 3);
  assert.ok(r.medianDage < 1, "medianen er timer, ikke tre uger");
  assert.equal(r.aabne, 0);
});

test("det ældste åbne spørgsmål måles i dage fra det blev stillet — ikke fra i dag", () => {
  const r = svartid([spm({}), spm({ oprettet: "2026-09-08T10:00:00Z" })], new Date("2026-09-10T10:00:00Z"));
  assert.equal(r.aabne, 2);
  assert.equal(Math.round(r.aeldsteAabenDage), 9);
  assert.equal(r.medianDage, null, "ingen besvarede → ingen median, ikke nul");
});

/* -------------------------------------------------- plan mod virkelighed */

test("planen ved hvilken uge det er, og hvor mange der burde være klaret", () => {
  const faser = [{ navn: "1", linje: "", fra: 0, til: 4 }, { navn: "2", linje: "", fra: 4, til: 8 },
                 { navn: "3", linje: "", fra: 8, til: 12 }, { navn: "4", linje: "", fra: 12, til: 16 }];
  const p = planModVirkelighed({ o1: true, o2: true, o3: true }, faser, "2026-09-07", new Date("2026-09-16T12:00:00Z"));
  assert.equal(p.ugeNr, 2);
  assert.equal(p.forventet, 8);
  assert.equal(p.klaret, 3);
  assert.equal(p.bagud, 5);
  // Efter måneden låses ugen til den sidste — planen kan ikke kræve mere end 16.
  assert.equal(planModVirkelighed({}, faser, "2026-09-07", new Date("2026-12-01T12:00:00Z")).forventet, 16);
  assert.equal(planModVirkelighed({}, faser, "", new Date()), null, "uden startdato regnes der ikke");
});

/* --------------------------------------------------- den ugentlige kørsel */

test("scriptet og fladen kender de samme tal-nøgler — ellers skrives der tal ingen ser", () => {
  const py = read("scripts/gulvet-uge.py");
  const blok = py.slice(py.indexOf("TAL_NOEGLER = {"), py.indexOf("}", py.indexOf("TAL_NOEGLER = {")));
  const script = new Set([...blok.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]));
  const flade = read("components/rummet/GulvetFlade.tsx");
  const fblok = flade.slice(flade.indexOf("const TAL_NAVNE"), flade.indexOf("];", flade.indexOf("const TAL_NAVNE")));
  const side = new Set([...fblok.matchAll(/\["([a-z_]+)",/g)].map((m) => m[1]));
  assert.ok(script.size >= 8, "scriptets nøgleliste blev ikke fundet");
  assert.deepEqual([...script].sort(), [...side].sort());
});

test("kørslen er beskrevet, og scriptet nægter ukendte nøgler", () => {
  assert.match(read("docs/GULVET-UGE.md"), /gulvet-uge\.py skriv/);
  assert.match(read("scripts/gulvet-uge.py"), /ukendte tal-nøgler/);
});

test("analyser hentes nyeste først og med et loft — fladen viser kun den seneste", () => {
  const src = read("lib/gulvet.ts");
  assert.ok(src.includes('const TABEL_ANALYSE = "gulvet_analyse"'));
  assert.ok(src.includes("${TABEL_ANALYSE}?select=*&order=skrevet.desc&limit="));
  assert.doesNotMatch(src, /skrivAnalyse/, "fladen må ikke kunne skrive opsamlinger — det gør kørslen");
});


/* -------------------------------------------------------------- rytme / tilstand */

test("tilstand og rytme-tekster loades fra gulvet.yml — defensive default er oplæring", () => {
  assert.equal(c.tilstand, "oplæring");
  for (const n of [
    "lede", "i_dag_titel", "i_dag_vagt_knap", "i_dag_naeste_tom",
    "i_dag_walkin_label", "i_dag_walkin_knap", "i_dag_walkin_placeholder",
    "uge_titel", "uge_doer_titel", "uge_doer_maal_linje", "uge_kanal_titel",
    "uge_hylden_titel", "uge_hylden_linje", "venter_titel", "venter_tom",
    "skiftet_linje", "oplæring_guide_navn",
  ]) {
    assert.ok(c.rytme[n], `rytme.${n} mangler — båndet ville vise en tom overskrift`);
  }
  assert.equal(c.rytme.oplæring_guide_navn, "Oplæring");
  const raa = parse(read("content/gulvet.yml"));
  assert.equal(raa.tilstand, "oplæring");
  assert.equal(c.opgaver.length, 16, "rytme må ikke røre ved de 16 opgaver");
});

test("effectiveTilstand: YAML rytme vinder over alt", () => {
  assert.equal(effectiveTilstand({
    tilstand: "rytme", fremdrift: {}, opgaveAntal: 16,
    start: "", vagterMin: 5, vagterTalt: 0,
  }), "rytme");
});

test("effectiveTilstand: alle opgaver klaret → rytme", () => {
  const fremdrift = Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`o${i + 1}`, true]));
  assert.equal(effectiveTilstand({
    tilstand: "oplæring", fremdrift, opgaveAntal: 16,
    start: "", vagterMin: 5, vagterTalt: 0,
  }), "rytme");
  // Én mangler → stadig oplæring
  delete fremdrift.o16;
  assert.equal(effectiveTilstand({
    tilstand: "oplæring", fremdrift, opgaveAntal: 16,
    start: "", vagterMin: 5, vagterTalt: 0,
  }), "oplæring");
});

test("effectiveTilstand: 28 dage + nok vagter → rytme, ellers oplæring", () => {
  const base = {
    tilstand: "oplæring", fremdrift: {}, opgaveAntal: 16,
    start: "2026-08-01", vagterMin: 5, vagterTalt: 5,
    nu: new Date("2026-09-01T12:00:00Z"), // 31 dage
  };
  assert.equal(effectiveTilstand(base), "rytme");
  assert.equal(effectiveTilstand({ ...base, vagterTalt: 4 }), "oplæring", "for få vagter");
  assert.equal(effectiveTilstand({
    ...base, nu: new Date("2026-08-20T12:00:00Z"), // 19 dage
  }), "oplæring", "under 28 dage");
  assert.equal(effectiveTilstand({ ...base, start: "" }), "oplæring", "uden start ingen tids-trigger");
  assert.equal(effectiveTilstand({ ...base, start: "ikke-en-dato" }), "oplæring");
});

test("effectiveTilstand: ukendt tilstand behandles som oplæring, ikke rytme", () => {
  assert.equal(effectiveTilstand({
    tilstand: "noget-andet", fremdrift: {}, opgaveAntal: 16,
    start: "", vagterMin: 5, vagterTalt: 0,
  }), "oplæring");
});

test("fladen har rytme-grene — «Nu» parkerer ikke kun på opgave 16 i rytme", () => {
  const flade = read("components/rummet/GulvetFlade.tsx");
  assert.match(flade, /effectiveTilstand/, "fladen kalder ikke tilstands-hjælperen");
  assert.match(flade, /mode === "rytme"/, "ingen rytme-gren i Nu");
  assert.match(flade, /mode === "oplæring"/, "oplæring-grenen forsvandt");
  assert.match(flade, /aabnSkriv\("Vagt-tal"\)/, "I dag-knappen åbner ikke vagt-tal");
  assert.match(flade, /aabnSkriv\("Drift"/, "walk-in åbner ikke Drift i Skriv");
  assert.match(flade, /inkandart\.dk\/shop/, "hylden linker ikke til den offentlige shop");
  assert.match(flade, /oplæring_guide_navn/, "Guider mangler Oplæring-segmentet");
  assert.match(flade, /skiftet_linje/, "auto-skift-noten mangler");
  // Negativ: rytme-Nu må ikke være den gamle «parkér på sidste opgave»-sti alene.
  assert.doesNotMatch(
    flade,
    /fane === "nu" && opg \?/,
    "Nu er stadig kun bundet til opg — rytme ville parkere på opgave 16",
  );
});

test("docs forklarer rytme, tilstand og triggers", () => {
  const d = read("docs/GULVET.md");
  assert.match(d, /effectiveTilstand/);
  assert.match(d, /tilstand/);
  assert.match(d, /28 dage/);
});
