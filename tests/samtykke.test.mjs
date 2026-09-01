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

  // EMNET er ét sprog — hendes. Det er dét hun ser i indbakkelisten.
  assert.match(kundeEmne(en), /Your consent form/);
  assert.doesNotMatch(kundeEmne(en), /samtykkeerklæring/i, "engelsk kunde faar dansk emne");
  assert.match(kundeEmne(da), /samtykkeerklæring/);

  // BREVET baerer begge sprog fra 1/9 (Stevens kald). Reglen er ikke
  // laengere «kun hendes sprog» — den er «hendes sprog staar FOERST».
  // Proeven laaste sig fast paa den gamle adfaerd, ikke paa reglen.
  assert.match(kundeBrev(en, "nu"), /^Hi /, "engelsk kunde moeder ikke engelsk foerst");
  assert.match(kundeBrev(da, "nu"), /^Hej /, "dansk kunde moeder ikke dansk foerst");
  assert.match(kundeBrev(en, "nu"), /YOU DECLARED/);
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

/**
 * Stevens end-to-end-proeve 1/9. Fire fejl var kun synlige for et
 * menneske der laeste brevet i sin egen indbakke — ingen proeve saa dem,
 * fordi de alle sammen var RIGTIGE strenge paa det FORKERTE sted.
 */

test("kundens brev taler TIL hende, ikke OM hende", async () => {
  const { valider, kundeBrev, husBrev } = await import("../lib/samtykke.ts");
  const mk = (sprog) => {
    const v = valider({
      sprog, navn: "Steven Wensley", foedselsdato: "1975-01-01",
      aftale_dato: "2026-09-23", email: "a@b.dk", telefon: "", kunstner: "Nizar",
      placering: "Ryg", motiv: "Satan", stoerrelse: "stor", farve: "farve",
      helbred: ["blodfortyndende"], helbred_note: "", foto_ok: true,
      atten: true, permanent: true, aftercare: true,
    });
    assert.ok(v.ok, JSON.stringify(v.fejl));
    return v.vaerdi;
  };

  // Brevet siger «Hej Steven» — saa maa det ikke to linjer nede tale om
  // ham i tredje person. Maalt i Stevens egen indbakke.
  const da = kundeBrev(mk("da"), "2026-09-01T11:05:10.727Z");
  assert.match(da, /Du tager blodfortyndende medicin/);
  assert.doesNotMatch(da, /Kunden /, "kundens eget brev taler om hende i tredje person");

  const en = kundeBrev(mk("en"), "2026-09-01T11:05:10.727Z");
  assert.match(en, /You take blood-thinning medication/);
  // Brevet baerer nu begge sprog, saa «ingen danske ord» er bevidst
  // falsk. Reglen der BESTAAR er anden person: hun maa aldrig omtales
  // som «Kunden» i sit eget brev — heller ikke i den danske blok.
  assert.match(en, /Du tager blodfortyndende medicin/);
  assert.doesNotMatch(en, /Kunden |The customer /,
    "kundens eget brev taler om hende i tredje person");

  // Og husets brev er ALTID dansk og altid tredje person — ogsaa naar
  // kunden er engelsk. Det er artisten der laeser det.
  const hus = husBrev(mk("en"), "nu");
  assert.match(hus, /Kunden tager blodfortyndende medicin/);
  assert.doesNotMatch(hus, /ABOUT YOUR BODY|WHAT YOU WANT|You take/,
    "husets brev blander sprog — «You» ville betyde kunden, men artisten laeser");
});

test("brevet er skrevet til et menneske, ikke til en maskine", async () => {
  const { valider, kundeBrev, husEmne } = await import("../lib/samtykke.ts");
  const v = valider({
    sprog: "da", navn: "Steven Wensley", foedselsdato: "1975-01-01",
    aftale_dato: "2026-09-23", email: "a@b.dk", telefon: "", kunstner: "Nizar",
    placering: "Ryg", motiv: "Satan", stoerrelse: "stor", farve: "farve",
    helbred: [], helbred_note: "", foto_ok: true,
    atten: true, permanent: true, aftercare: true,
  });
  assert.ok(v.ok);
  const b = kundeBrev(v.vaerdi, "2026-09-01T11:05:10.727Z");

  // Gmail linkificerede «2026-09-23» — den stod blaa og understreget i
  // kundens brev, som om det var et telefonnummer.
  assert.match(b, /23\. september 2026/);
  assert.doesNotMatch(b, /2026-09-23/, "ISO-datoen staar stadig i broedteksten");

  // «Sendt 2026-09-01T11:05:10.727Z» er maskinformat.
  assert.doesNotMatch(b, /T\d\d:\d\d:\d\d\.\d\d\dZ/, "raat tidsstempel i et brev");

  // «Foto maa bruges:ja» — padEnd(12) var kortere end etiketten.
  assert.match(b, /Foto må bruges: +ja/, "etiket og vaerdi klistrer sammen");

  // Men EMNET beholder ISO: det sorterer og soeges paa i en indbakke.
  assert.match(husEmne(v.vaerdi), /2026-09-23/);
});

/**
 * S578 — det engelske spor hele vejen.
 *
 * Steven 1/9: «Vi har 40 % udenlandske kunder og 50 % af vores artister
 * er fra udlandet.» Det vaelter en antagelse jeg selv skrev ind samme
 * morgen: «husets brev er altid dansk — det laeses af studiet».
 */

const mkSamtykke = async (o = {}) => {
  const { valider } = await import("../lib/samtykke.ts");
  const v = valider({
    sprog: "da", navn: "Mette Hansen", foedselsdato: "1990-01-01",
    aftale_dato: "2026-09-23", email: "a@b.dk", telefon: "", kunstner: "Jane",
    placering: "Ryg", motiv: "slange", stoerrelse: "stor", farve: "farve",
    helbred: ["gravid"], helbred_note: "", foto_ok: true,
    atten: true, permanent: true, aftercare: true, ...o,
  });
  assert.ok(v.ok, JSON.stringify(v.fejl));
  return v.vaerdi;
};

test("AC1: en udenlandsk artist kan laese advarslen — ogsaa om en DANSK kunde", async () => {
  const { husBrev, husEmne } = await import("../lib/samtykke.ts");

  // Den almindeligste uheldige kombination: udenlandsk artist, dansk
  // kunde. Den loeses IKKE ved at foelge kundens sprog.
  const b = husBrev(await mkSamtykke({ sprog: "da" }), "2026-09-01T11:00:00.000Z");
  assert.match(b, /⚠ GENNEMGANG KRÆVES/);
  assert.match(b, /⚠ REVIEW REQUIRED/, "en dansk kunde giver ingen engelsk advarsel");
  assert.match(b, /The customer has told us she is pregnant/);

  // Negativ kontrol: og omvendt. En engelsk kunde skal stadig give dansk.
  const e = husBrev(await mkSamtykke({ sprog: "en" }), "2026-09-01T11:00:00.000Z");
  assert.match(e, /⚠ GENNEMGANG KRÆVES/, "en engelsk kunde giver ingen dansk advarsel");
  assert.match(e, /⚠ REVIEW REQUIRED/);

  // AC3: emnet kan scannes af begge, og baerer stadig intet helbredsord.
  const emne = husEmne(await mkSamtykke({}));
  assert.match(emne, /GENNEMGANG \/ REVIEW/);
  for (const ord of ["gravid", "pregnant", "blodfortyndende"]) {
    assert.ok(!emne.toLowerCase().includes(ord), `emnet baerer «${ord}»`);
  }
});

test("AC2: de to sprog blandes ikke, og ingen taler til den forkerte laeser", async () => {
  const { husBrev } = await import("../lib/samtykke.ts");
  const b = husBrev(await mkSamtykke({}), "2026-09-01T11:00:00.000Z");
  const [da, en] = b.split(/─{10,}/);
  assert.ok(da && en, "brevet er ikke delt i to hele blokke");

  // Hver blok er HEL. Ingen engelsk overskrift i den danske halvdel.
  assert.doesNotMatch(da, /WHAT THE CUSTOMER|ABOUT THE CUSTOMER|REVIEW REQUIRED/);
  assert.doesNotMatch(en, /ØNSKET|OPLYST OM KROPPEN|GENNEMGANG KRÆVES/);

  // Og husets engelske blok taler om kunden i TREDJE person. «WHAT YOU
  // WANT» til en artist ville betyde HENDES oenske — samme fejl som i
  // morges, i ny form.
  assert.match(en, /WHAT THE CUSTOMER WANTS/);
  assert.match(en, /ABOUT THE CUSTOMER'S BODY/);
  assert.doesNotMatch(en, /WHAT YOU WANT|ABOUT YOUR BODY|You take|You are pregnant/,
    "husets brev taler til artisten som om hun var kunden");
});

test("AC4: kundens brev baerer BEGGE sprog — hendes eget foerst", async () => {
  const { kundeBrev } = await import("../lib/samtykke.ts");

  // Steven 1/9: «De flere kan sagtens laese en mail med to sprog. Ellers
  // skal vi have et kompliceret setup.»
  //
  // Jeg argumenterede foerst imod: «hendes kopi er hendes erklaering».
  // Det var for staerkt sagt — brevet er en KVITTERING, ikke et
  // modunderskrevet dokument. Og ét format er simplere end to; det var
  // netop to kodeveje der skabte sprogblandingen samme morgen.
  for (const [sprog, foerst, andet] of [
    ["da", /^Hej /, "Hi "],
    ["en", /^Hi /, "Hej "],
  ]) {
    const b = kundeBrev(await mkSamtykke({ sprog }), "2026-09-01T11:00:00.000Z");
    assert.match(b, foerst, `${sprog}: hendes eget sprog staar ikke foerst`);
    assert.ok(b.includes(andet), `${sprog}: det andet sprog mangler`);
    assert.match(b, /─{10,}/, `${sprog}: de to blokke er ikke adskilt`);

    // Hver blok er HEL — aldrig en dansk overskrift med en engelsk linje
    // under. Samme regel som husets brev (AC2).
    const [a, c] = b.split(/─{10,}/);
    const dansk = /ØNSKET|OPLYST OM KROPPEN|DU ERKLÆREDE/;
    const engelsk = /WHAT YOU WANT|ABOUT YOUR BODY|YOU DECLARED/;
    const [dBlok, eBlok] = sprog === "da" ? [a, c] : [c, a];
    assert.match(dBlok, dansk); assert.doesNotMatch(dBlok, engelsk);
    assert.match(eBlok, engelsk); assert.doesNotMatch(eBlok, dansk);
  }

  // Og kunden tiltales i ANDEN person paa begge sprog — aldrig «Kunden».
  const b = kundeBrev(await mkSamtykke({ sprog: "da" }), "nu");
  assert.match(b, /Du er gravid/);
  assert.match(b, /You are pregnant/);
  assert.doesNotMatch(b, /Kunden |The customer /,
    "kundens eget brev taler om hende i tredje person");
});

test("AC5: begge samtykke-sider staar i sitemappet", () => {
  const s = read("app/sitemap.ts");
  assert.match(s, /inkandart\.dk\/samtykke"/, "den danske side mangler");
  assert.match(s, /inkandart\.dk\/en\/samtykke"/, "den engelske side mangler");
});

/**
 * S578, sidste runde — Stevens fund paa den ENGELSKE flade 1/9:
 *
 *   «Men den fejler. Og jeg kan ikke som kunde se hvad jeg skal aendre.»
 *
 * Han havde tastet en foedselsdato i FREMTIDEN. Ruten svarede korrekt
 *   422 { ok:false, fejl:[{felt:"foedselsdato",grund:"under18"}] }
 * og fladen smed listen vaek og skrev «check the marked fields» — uden
 * at markere noget. Maalt i Vercels runtime-log: tre 422'ere paa 44
 * sekunder (11:45:40, 11:46:02, 11:46:24 UTC). Han proevede tre gange og
 * kunne ikke se hvorfor.
 *
 * Jeg havde selv skrevet i E2E-guiden at den tilstand ikke kunne naas
 * fra en browser, fordi felterne er `required`. Det var forkert:
 * `required` maaler at der STAAR noget, ikke at det passer.
 */

test("FUND: fladen viser HVAD der er galt — den smider ikke listen vaek", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx").replace(/\s+/g, " ");

  // 422-grenen skal LAESE kroppen. Bundet til reglen: der findes en
  // 422-gren, og den saetter fejl-listen foer den skifter tilstand.
  assert.match(f, /res\.status === 422/, "der er ingen 422-gren mere");
  assert.match(
    f,
    /res\.status === 422.{0,400}setFejl\(.{0,120}\.fejl.{0,120}\).{0,120}setTilstand\("felter"\)/,
    "422-grenen laeser ikke fejl-listen fra svaret",
  );

  // Og listen skal RENDERES med baade feltets navn og grunden. Uden
  // begge to staar der «noget er galt» uden at sige hvad eller hvorfor.
  assert.match(f, /feltnavn\(c, f\.felt\)/, "feltets navn vises ikke");
  assert.match(f, /grundord\(c, f\.grund\)/, "grunden vises ikke");

  // Negativ kontrol paa proeven selv: den maa ikke gaa groen paa en
  // flade der har ordene men aldrig naar dem. Listen skal haenge paa
  // fejl-tilstanden, ikke staa frit.
  assert.match(f, /tilstand === "felter" \?/, "listen haenger ikke paa felter-tilstanden");
});

test("FUND: de afviste felter bliver faktisk MARKERET", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx").replace(/\s+/g, " ");

  // «Se de markerede felter» var en paastand uden daekning. Maerket skal
  // komme fra serverens egen liste — ikke fra en haandholdt gaetteliste
  // der driver fra den.
  assert.match(f, /new Set\(fejl\.map\(\(f\) => f\.felt\)\)/, "maerket bygger ikke paa svaret");
  assert.match(f, /"aria-invalid": true/, "der er intet maerke for skaermlaeseren");

  // Hvert felt serveren kan naevne, skal kunne maerkes paa fladen.
  for (const felt of ["navn", "foedselsdato", "email", "aftale_dato", "placering", "motiv"]) {
    assert.match(f, new RegExp(`maerk\\("${felt}"\\)`), `${felt} kan ikke maerkes`);
  }
  // De to skalaer er radioknapper — de maerkes paa deres fieldset.
  for (const felt of ["stoerrelse", "farve"]) {
    assert.match(f, new RegExp(`daarlige\\.has\\("${felt}"\\)`), `${felt} kan ikke maerkes`);
  }

  // Farven maa ikke baere beskeden alene: der SKAL staa ord ved siden af.
  const css = read("components/rummet/rummet.css");
  assert.match(css, /rum-samtykke__fejl-liste/, "der er ingen liste at laese maerket i");
});

test("FUND: hver grund serveren kan give, har ord paa BEGGE sprog", async () => {
  const { loadSamtykke, loadSamtykkeEn } = await import("../lib/content.ts");

  // Grundene laeses ud af valideringens egen kildekode, ikke af en liste
  // jeg skriver ved siden af. Tilfoejer nogen en ny grund, gaar denne
  // proeve roed indtil den har ord — paa begge sprog.
  const kilde = read("lib/samtykke.ts").replace(/\/\*[\s\S]*?\*\//g, "");
  const grunde = new Set([...kilde.matchAll(/grund: "([a-z0-9-]+)"/g)].map((m) => m[1]));
  assert.ok(grunde.size >= 5, `fandt kun ${grunde.size} grunde — laeste proeven noget?`);

  for (const [navn, copy] of [["da", loadSamtykke()], ["en", loadSamtykkeEn()]]) {
    const har = new Set(copy.fejl_grunde.map((g) => g.id));
    for (const g of grunde) assert.ok(har.has(g), `${navn}: grunden «${g}» har ingen ord`);
    for (const g of copy.fejl_grunde) {
      assert.ok(g.tekst.trim(), `${navn}: «${g.id}» har en tom tekst`);
    }
  }

  // «mangler» hedder faktisk «mangler» paa dansk, saa id !== tekst duer
  // ikke som negativ kontrol. Den rigtige kontrol er at de to sprog ER
  // forskellige — ellers har nogen kopieret den ene fil til den anden.

  // Og de to sprog maa ikke vaere det samme — saa maalte proeven ingenting.
  assert.notDeepEqual(
    loadSamtykke().fejl_grunde.map((g) => g.tekst),
    loadSamtykkeEn().fejl_grunde.map((g) => g.tekst),
  );
});

test("FUND: browseren kender de graenser serveren maaler paa", () => {
  const f = read("components/rummet/SamtykkeFlade.tsx").replace(/\s+/g, " ");

  // 18-aars-reglen staar i browseren OG paa serveren. Den i browseren
  // sparer kunden en tur over nettet; den paa serveren er porten.
  assert.match(f, /name="foedselsdato"[^>]{0,200}max=\{attenAar/, "foedselsdatoen har ingen graense");
  assert.match(f, /name="aftale_dato"[^>]{0,200}min=\{idag/, "aftaledatoen har ingen graense");

  // Graenserne saettes efter mount. Regnes de under server-renderen,
  // staar serveren i UTC og kunden hvor hun staar — og de to er ikke
  // enige omkring midnat.
  assert.match(f, /useEffect\(\(\) => \{ setIdag\(idagLokalt\(\)\)/, "graenserne regnes paa serveren");
});

test("FUND: 18-aars-graensen i browseren er den SAMME regel som serverens", async () => {
  const { aarSiden } = await import("../lib/samtykke.ts");
  const f = read("components/rummet/SamtykkeFlade.tsx");

  // Proeven regner browserens graense efter med komponentens egen formel,
  // og holder den op mod serverens aarSiden(). To dage: graensen selv
  // (skal give praecis 18) og dagen efter (skal give 17).
  const nu = new Date(2026, 8, 1);
  const p = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const graense = iso(new Date(nu.getFullYear() - 18, nu.getMonth(), nu.getDate()));

  assert.equal(aarSiden(graense, nu), 18, "graensen selv giver ikke 18 aar");
  const dagenEfter = new Date(nu.getFullYear() - 18, nu.getMonth(), nu.getDate() + 1);
  assert.equal(aarSiden(iso(dagenEfter), nu), 17, "dagen efter graensen giver ikke 17");

  // Og komponenten skal regne den paa samme maade — ikke «i dag» og
  // heller ikke et aarstal alene.
  assert.match(
    f.replace(/\s+/g, " "),
    /senesteFoedselsdato\(d = new Date\(\)\).{0,200}d\.getFullYear\(\) - 18, d\.getMonth\(\), d\.getDate\(\)/,
    "komponenten regner 18-aars-graensen anderledes end serveren",
  );
});
