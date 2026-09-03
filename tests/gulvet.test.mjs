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
const { regnDoeren, perOpgave, perSlag } = await import("../lib/gulvet-tal.ts");

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
  for (const n of ["lede", "tom", "web_linje", "svar_lede", "opgave_lede", "omraade_lede"]) {
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
