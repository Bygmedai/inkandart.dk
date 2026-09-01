import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * Samtykkeerklaeringen. Simones formular, med hans felter — men den
 * sender, hvor hans gemte i browserens eget lager.
 */

const FELTER = ["navn", "foedselsdato", "email", "telefon", "kunstner", "placering", "motiv"];
const HELBRED = ["gravid", "blodfortyndende", "allergi", "hudlidelse", "andet"];
const ERKLAERING = ["atten", "permanent", "aftercare"];

test("alle Simones felter er med paa fladen", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx");
  for (const felt of FELTER) assert.match(f, new RegExp(`name="${felt}"`), felt);
  assert.match(f, /name="foto_ok"/, "fotosamtykket er sit eget felt");
});

test("helbred og erklaering staar i indholdet, begge sprog", () => {
  for (const fil of ["content/samtykke.yml", "content/samtykke.en.yml"]) {
    const s = read(fil);
    for (const id of HELBRED) assert.match(s, new RegExp(`id: ${id}\\b`), `${fil}: ${id}`);
    for (const id of ERKLAERING) assert.match(s, new RegExp(`id: ${id}\\b`), `${fil}: ${id}`);
  }
});

test("de to sprogfiler har de samme noegler", () => {
  const noegler = (f) =>
    read(f)
      .split("\n")
      .filter((l) => /^[a-z_]+:/.test(l))
      .map((l) => l.split(":")[0]);
  assert.deepEqual(noegler("content/samtykke.yml"), noegler("content/samtykke.en.yml"));
});

test("erklaeringen sendes — den gemmes ikke i browseren", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx");
  assert.match(f, /fetch\("\/api\/samtykke"/, "fladen poster ikke noget");
  assert.doesNotMatch(f, /localStorage|sessionStorage|indexedDB/i, "helbredsdata i browserens lager");
});

/**
 * S578: proeven laaste sig fast paa Shopify-implementeringen — `if
 * (!token) … 502` og `if (!res.ok)`. Ruten skriver ikke laengere til
 * Shopify, saa de to linjer maalte ingenting om REGLEN.
 *
 * Reglen er den samme og er nu haardere: der gives kun kvittering naar
 * BEGGE breve er afsendt. Det var praecis den fejl der kostede Stevens
 * egen erklaering 1/9 — fladen sagde «Vi har den», og intet var gemt.
 */
test("ruten er fail-closed: ingen kvittering uden at BEGGE breve gik afsted", () => {
  const r = read("app/api/samtykke/route.ts");

  // Begge led skal proeves, og hvert af dem skal kunne stoppe svaret.
  assert.match(r, /if \(!tilHuset\.ok\)[\s\S]{0,220}502/, "et fejlet brev til huset giver stadig kvittering");
  assert.match(r, /if \(!tilKunden\.ok\)[\s\S]{0,260}502/, "kundens manglende kopi giver stadig kvittering");

  // Det eneste 200 uden for honeypotten skal ligge EFTER begge kald.
  const iHus = r.indexOf("tilHuset");
  const iKunde = r.indexOf("tilKunden");
  const iOk = r.lastIndexOf("svar(200");
  assert.ok(iHus > -1 && iKunde > iHus && iOk > iKunde,
    "kvitteringen ligger ikke efter begge breve");

  assert.match(r, /company/, "honeypot mangler");
  assert.match(r, /MAX_BODY_BYTES/, "intet body-loft");
});

test("afsenderen fejler lukket uden noegle — og noeglen staar aldrig i repoet", () => {
  const m = read("lib/mail.ts");
  assert.match(m, /if \(!noegle\) return \{ ok: false/, "uden noegle skal den fejle, ikke tie");
  assert.match(m, /AbortSignal\.timeout/, "ingen timeout paa upstream");
  assert.match(m, /process\.env/, "noeglen laeses ikke fra miljoeet");

  // Negativ kontrol: en rigtig noegle maa ALDRIG staa i en fil.
  for (const f of ["lib/mail.ts", "app/api/samtykke/route.ts"]) {
    assert.doesNotMatch(read(f), /re_[A-Za-z0-9]{16,}|Bearer\s+[A-Za-z0-9_-]{20,}/,
      `${f} baerer noget der ligner en noegle`);
  }
});

/** Kommentarer strippes: rutens hoved FORKLARER hvad der blev fjernet og
 *  naevner derfor «customerCreate». En proeve der laeser sin egen
 *  begrundelse som kode maaler det forkerte. */
const udenKommentarer = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

test("Shopify roerer ikke en helbredsoplysning", () => {
  const r = udenKommentarer(read("app/api/samtykke/route.ts"));
  // Ruten skrev foer til kundekortet med tags som «samtykke-helbred».
  // Et tag er selv en helbredsoplysning: det staar i lister, i soegning
  // og i eksporter. Stedet var forkert (Sirius' review, 1/9).
  for (const spor of ["customerCreate", "myshopify", "X-Shopify-Access-Token", "metafields"]) {
    assert.ok(!r.includes(spor), `ruten roerer Shopify igen: ${spor}`);
  }
  assert.doesNotMatch(read("lib/samtykke.ts"), /export function tags/,
    "tag-funktionen er tilbage — helbred maa ikke blive til maerkater");
});

test("fladen kvitterer kun paa et rent svar", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx");
  assert.match(f, /if \(res\.ok\) setTilstand\("tak"\)/);
});

test("begge sprogruter findes og peger paa hver sin betingelsesside", () => {
  assert.match(read("app/(rummet)/samtykke/page.tsx"), /betingelserHref="\/betingelser"/);
  assert.match(read("app/(rummet)/en/samtykke/page.tsx"), /betingelserHref="\/en\/betingelser"/);
});

test("formularen kan printes til dem uden telefon", () => {
  assert.match(read("components/rummet/rummet.css"), /@media print[\s\S]{0,400}rum-samtykke__form/);
});

/**
 * S578 — det nye i flowet. Acceptkriterier: docs/accept/samtykke-flow.md v3.
 */

test("AC4: en ren erklaering TIER ikke — den siger at der intet er", async () => {
  const { valider } = await import("../lib/samtykke.ts");
  const { husBrev, husEmne } = await import("../lib/samtykke.ts");
  const base = {
    navn: "Test Person", foedselsdato: "1990-01-01", aftale_dato: "2026-09-14",
    email: "a@b.dk", telefon: "", kunstner: "emma", placering: "underarm",
    motiv: "slange", stoerrelse: "stor", farve: "farve",
    helbred: [], helbred_note: "", foto_ok: false,
    atten: true, permanent: true, aftercare: true,
  };
  const ren = valider(base);
  assert.ok(ren.ok, "grundskemaet validerer ikke");

  // En tom skaerm og en ren skaerm skal se FORSKELLIGE ud. Ellers kan
  // «ingenting galt» ikke skelnes fra «ikke modtaget».
  assert.match(husBrev(ren.vaerdi, "nu"), /INGEN BEMÆRKNINGER/);
  assert.match(husEmne(ren.vaerdi), /ingen bemærkninger/);

  const flag = valider({ ...base, helbred: ["blodfortyndende"] });
  assert.ok(flag.ok);
  assert.match(husBrev(flag.vaerdi, "nu"), /GENNEMGANG KRÆVES/);
  assert.match(husEmne(flag.vaerdi), /GENNEMGANG/);

  // Negativ kontrol: de to emner maa ikke vaere ens, ellers maaler
  // proeven ingenting.
  assert.notEqual(husEmne(ren.vaerdi), husEmne(flag.vaerdi));
});

test("AC5: intet helbredsord i et emnefelt", async () => {
  const { valider, HELBRED } = await import("../lib/samtykke.ts");
  const { husEmne, kundeEmne } = await import("../lib/samtykke.ts");
  const v = valider({
    navn: "Test Person", foedselsdato: "1990-01-01", aftale_dato: "2026-09-14",
    email: "a@b.dk", telefon: "", kunstner: "emma", placering: "underarm",
    motiv: "slange", stoerrelse: "stor", farve: "farve",
    helbred: [...HELBRED], helbred_note: "noget privat om min krop", foto_ok: false,
    atten: true, permanent: true, aftercare: true,
  });
  assert.ok(v.ok);

  // Et emnefelt staar i notifikationer, indbakkelister og skaermbilleder.
  for (const emne of [husEmne(v.vaerdi), kundeEmne(v.vaerdi)]) {
    for (const ord of HELBRED) {
      assert.ok(!emne.toLowerCase().includes(ord), `emnet baerer «${ord}»: ${emne}`);
    }
    assert.ok(!emne.includes("privat om min krop"), "kundens egne ord staar i emnet");
  }
  // Negativ kontrol: kunden HAR krydset alt af, saa der ER noget at laekke.
  assert.equal(v.vaerdi.helbred.length, HELBRED.length);
});

test("AC2: kundens kopi baerer hendes svar — ikke husets vurdering", async () => {
  const { valider } = await import("../lib/samtykke.ts");
  const { kundeBrev, husBrev } = await import("../lib/samtykke.ts");
  const v = valider({
    navn: "Test Person", foedselsdato: "1990-01-01", aftale_dato: "2026-09-14",
    email: "a@b.dk", telefon: "", kunstner: "emma", placering: "underarm",
    motiv: "slange", stoerrelse: "stor", farve: "farve",
    helbred: ["gravid"], helbred_note: "", foto_ok: false,
    atten: true, permanent: true, aftercare: true,
  });
  assert.ok(v.ok);
  const hendes = kundeBrev(v.vaerdi, "nu");

  // Hendes egne svar skal staa der, ordret.
  assert.match(hendes, /slange/);
  assert.match(hendes, /underarm/);
  assert.match(hendes, /gravid/);

  // Men husets vurdering er ikke noget hun har sagt, og den skal ikke
  // laegges i munden paa hende.
  assert.doesNotMatch(hendes, /GENNEMGANG KRÆVES/);
  assert.match(husBrev(v.vaerdi, "nu"), /GENNEMGANG KRÆVES/, "negativ kontrol: huset ser den");
});

test("modstriden er forsigtig, og den afgoer ingenting", async () => {
  const { modstrid, valider } = await import("../lib/samtykke.ts");
  const mk = (o) => {
    const v = valider({
      navn: "T P", foedselsdato: "1990-01-01", aftale_dato: "2026-09-14",
      email: "a@b.dk", telefon: "", kunstner: "", placering: "ryg",
      motiv: "x", stoerrelse: "lille", farve: "sort",
      helbred: [], helbred_note: "", foto_ok: false,
      atten: true, permanent: true, aftercare: true, ...o,
    });
    assert.ok(v.ok, JSON.stringify(v.fejl));
    return v.vaerdi;
  };

  assert.deepEqual(modstrid(mk({})), [], "en ren erklaering udloeser en advarsel");
  assert.deepEqual(modstrid(mk({ helbred: ["gravid"] })).map((m) => m.noegle), ["gravid"]);
  // Allergi alene er ikke en modstrid — allergi PLUS farve er.
  assert.deepEqual(modstrid(mk({ helbred: ["allergi"] })).map((m) => m.noegle), []);
  assert.deepEqual(modstrid(mk({ helbred: ["allergi"], farve: "farve" })).map((m) => m.noegle), ["pigment"]);

  // Ordene maa aldrig laese som en afgoerelse. Den raaber; den doemmer ikke.
  for (const m of modstrid(mk({ helbred: ["gravid", "blodfortyndende", "hudlidelse"] }))) {
    assert.doesNotMatch(m.tekst, /må ikke|kan ikke tatoveres|afvis|nægt/i,
      `modstriden afgoer noget den ikke maa: «${m.tekst}»`);
  }
});

test("et svar fra kunden forsvinder ikke", () => {
  // Kundens brev siger «skriv til os». Afsenderen er et send-subdomaene
  // uden modtagelse, saa uden reply_to ville svaret gaa i ingenting.
  const m = read("lib/mail.ts");
  assert.match(m, /reply_to: husAdresse\(\)/, "kundens svar har ingen vej hjem");
  assert.match(read("lib/samtykke.ts"), /skriv til os/, "brevet inviterer ikke til svar");
});
