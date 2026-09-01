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
  // Bundet til REGLEN, ikke til linjens form: proeven laaste sig foer
  // fast paa `if (res.ok) setTilstand("tak")` og gik roed da grenen fik
  // kroellede parenteser — uden at noget var i stykker.
  const f = read("components/rummet/SamtykkeFlade.tsx").replace(/\s+/g, " ");
  const kvitteringer = f.match(/setTilstand\("tak"\)/g) || [];
  assert.equal(kvitteringer.length, 1, "der kvitteres flere steder end ét");
  assert.match(f, /if \(res\.ok\) \{? ?setTilstand\("tak"\)/,
    "kvitteringen haenger ikke paa res.ok");
});

test("begge sprogruter findes og peger paa hver sin betingelsesside", () => {
  assert.match(read("app/(da)/(rummet)/samtykke/page.tsx"), /betingelserHref="\/betingelser"/);
  assert.match(read("app/(en)/(rummet)/en/samtykke/page.tsx"), /betingelserHref="\/en\/betingelser"/);
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

test("et svar fra kunden forsvinder ikke — paa begge sprog", async () => {
  // Afsenderen er et send-subdomaene uden modtagelse. Inviterer brevet
  // til svar, SKAL svaret have en vej hjem.
  //
  // Proeven maalte foer paa ordene «skriv til os» og gik roed da teksten
  // blev bedre. Nu maaler den brevet som det RENDERER, paa begge sprog.
  const m = read("lib/mail.ts");
  assert.match(m, /reply_to: husAdresse\(\)/, "kundens svar har ingen vej hjem");

  const { valider, kundeBrev } = await import("../lib/samtykke.ts");
  for (const [sprog, ord] of [["da", /svar|skriv til os/i], ["en", /reply|write to us/i]]) {
    const v = valider({
      sprog, navn: "Test Person", foedselsdato: "1990-01-01", aftale_dato: "2026-09-14",
      email: "a@b.dk", telefon: "", kunstner: "", placering: "ryg", motiv: "x",
      stoerrelse: "lille", farve: "sort", helbred: [], helbred_note: "", foto_ok: false,
      atten: true, permanent: true, aftercare: true,
    });
    assert.ok(v.ok, JSON.stringify(v.fejl));
    assert.match(kundeBrev(v.vaerdi, "nu"), ord, `${sprog}: brevet inviterer ikke til svar`);
  }
});

/**
 * Sirius' fire fund, 1/9. Alle fire var rigtige og efterproevet i koden
 * foer de blev rettet. Proeverne her holder paa rettelserne.
 */

test("FUND 1: en engelsk kunde faar et engelsk brev", async () => {
  const { valider, kundeEmne, kundeBrev, husEmne } = await import("../lib/samtykke.ts");
  const mk = (sprog) => {
    const v = valider({
      sprog, navn: "Test Person", foedselsdato: "1990-01-01", aftale_dato: "2026-09-14",
      email: "a@b.dk", telefon: "", kunstner: "", placering: "ryg", motiv: "x",
      stoerrelse: "lille", farve: "sort", helbred: ["gravid"], helbred_note: "", foto_ok: false,
      atten: true, permanent: true, aftercare: true,
    });
    assert.ok(v.ok, JSON.stringify(v.fejl));
    return v.vaerdi;
  };
  const da = mk("da"), en = mk("en");

  assert.equal(da.sprog, "da");
  assert.equal(en.sprog, "en", "sproget bliver stadig smidt vaek i valider()");

  assert.match(kundeEmne(en), /Your consent form/);
  assert.doesNotMatch(kundeEmne(en), /samtykkeerklæring/i, "engelsk kunde faar dansk emne");
  assert.match(kundeBrev(en, "nu"), /YOU DECLARED/);
  assert.doesNotMatch(kundeBrev(en, "nu"), /DU ERKLÆREDE/);

  // Negativ kontrol: den danske skal stadig vaere dansk.
  assert.match(kundeEmne(da), /samtykkeerklæring/);
  assert.match(kundeBrev(da, "nu"), /DU ERKLÆREDE/);

  // Husets brev er ALTID dansk — det laeses af studiet, ikke af kunden.
  assert.match(husEmne(en), /Samtykke ·/);
});

test("FUND 2: reglen er som den staar skrevet — stoerrelsen afgoer ikke OM der raabes", async () => {
  const { valider, modstrid } = await import("../lib/samtykke.ts");
  const mk = (stoerrelse) => {
    const v = valider({
      sprog: "da", navn: "T P", foedselsdato: "1990-01-01", aftale_dato: "2026-09-14",
      email: "a@b.dk", telefon: "", kunstner: "", placering: "ryg", motiv: "x",
      stoerrelse, farve: "sort", helbred: ["blodfortyndende"], helbred_note: "", foto_ok: false,
      atten: true, permanent: true, aftercare: true,
    });
    assert.ok(v.ok);
    return v.vaerdi;
  };
  // En LILLE tatovering bloeder ogsaa. En regel der tier ved «lille» ville
  // vaere daarligere for kunden end en overfloedig samtale.
  for (const st of ["lille", "mellem", "stor"]) {
    assert.deepEqual(modstrid(mk(st)).map((m) => m.noegle), ["bloedning"], st);
  }
  // Men stoerrelsen skal STAA der, saa artisten kan vaegte den.
  assert.match(modstrid(mk("stor"))[0].tekst, /større end en underarm/i);
  assert.match(modstrid(mk("lille"))[0].tekst, /mindre end en håndflade/i);
});

test("FUND 3: kundens egne ord bliver aldrig klippet i tavshed", async () => {
  const { valider, ORDRET } = await import("../lib/samtykke.ts");
  const langt = "a".repeat(401);
  for (const felt of ORDRET) {
    const v = valider({
      sprog: "da", navn: "T P", foedselsdato: "1990-01-01", aftale_dato: "2026-09-14",
      email: "a@b.dk", telefon: "", kunstner: "", placering: "ryg", motiv: "x",
      stoerrelse: "lille", farve: "sort", helbred: [], helbred_note: "", foto_ok: false,
      atten: true, permanent: true, aftercare: true, [felt]: langt,
    });
    assert.ok(!v.ok, `${felt} paa 401 tegn blev accepteret — og klippet i tavshed`);
    assert.ok(v.fejl.some((f) => f.felt === felt && f.grund === "for-lang"), felt);
  }
  // Og fladen viser graensen, saa det aldrig sker i en browser.
  const f = read("components/rummet/SamtykkeFlade.tsx");
  assert.equal((f.match(/maxLength=\{400\}/g) || []).length, ORDRET.length,
    "et ordret felt mangler sin synlige graense");
});

test("FUND 4: en halv fejl siger ikke «proev igen»", () => {
  const r = read("app/api/samtykke/route.ts");
  const f = read("components/rummet/SamtykkeFlade.tsx");

  // Ruten skelner mellem de to led.
  assert.match(r, /led: "hus"/);
  assert.match(r, /led: "kunde"/);
  // Og fladen LAESER det. Foer gjorde den ikke, saa en kunde hvis kopi
  // fejlede fik at vide at intet var sendt — og sendte igen. Dublet.
  assert.match(f, /led === "kunde"/, "fladen laeser ikke hvilket led der faldt");
  assert.match(f, /"halvt"/, "der er ingen halv-tilstand");

  for (const fil of ["content/samtykke.yml", "content/samtykke.en.yml"]) {
    const c = read(fil);
    assert.match(c, /^fejl_halvt:/m, `${fil} mangler teksten til den halve fejl`);
  }
  // Negativ kontrol: teksten maa IKKE bede om et nyt forsoeg.
  assert.doesNotMatch(read("content/samtykke.yml").split("fejl_halvt:")[1].split("\nfejl_felter")[0],
    /Prøv igen/i, "den halve fejl beder om en dublet");
});

test("brevene taler rigtigt dansk — repoets ASCII maa ikke sive ud", async () => {
  // Jeg fandt praecis den her fejl paa den levende /samtykke om morgenen
  // 1/9 («Foedselsdato», «Se ogsaa») — og lavede den saa selv i modstrids-
  // teksterne samme dag: «stoerre end en underarm», «Regn med mere
  // bloedning». En artist laeser de saetninger.
  //
  // Vagten maaler det RENDEREDE brev, ikke kilden. Identifikatorer i
  // koden maa gerne vaere ASCII; det en kunde eller en artist laeser, maa
  // ikke vaere det.
  const { valider, husBrev, husEmne, kundeBrev, modstrid } = await import("../lib/samtykke.ts");
  const HELBRED = ["gravid", "blodfortyndende", "allergi", "hudlidelse", "andet"];

  const mistanke =
    /\b\w*(?:aabn|paa\b|saa\b|faa\b|gaa|maa\b|kaede|laeng|vaer|aendr|foer\b|oere|oeje|hoej|stoer|groen|koeb|foed|gaeld|faerdig|taenk|afgoer|foelg|ogsaa|bloed|laes|spoerg|haand)\w*\b/i;

  for (const stoerrelse of ["lille", "mellem", "stor"]) {
    const v = valider({
      sprog: "da", navn: "Test Person", foedselsdato: "1990-01-01",
      aftale_dato: "2026-09-14", email: "a@b.dk", telefon: "12345678",
      kunstner: "emma", placering: "underarm", motiv: "slange",
      stoerrelse, farve: "farve", helbred: HELBRED, helbred_note: "noget",
      foto_ok: true, atten: true, permanent: true, aftercare: true,
    });
    assert.ok(v.ok, JSON.stringify(v.fejl));

    for (const [navn, tekst] of [
      ["husBrev", husBrev(v.vaerdi, "nu")],
      ["husEmne", husEmne(v.vaerdi)],
      ["kundeBrev", kundeBrev(v.vaerdi, "nu")],
      ...modstrid(v.vaerdi).map((m) => [`modstrid:${m.noegle}`, m.tekst]),
    ]) {
      const traf = tekst.match(mistanke);
      assert.equal(traf, null, `${navn} (${stoerrelse}) baerer ASCII: «${traf?.[0]}»`);
    }
  }

  // Negativ kontrol: moenstret SKAL fange den fejl vi lige rettede.
  assert.match("motivet er stoerre end en underarm", mistanke);
});
