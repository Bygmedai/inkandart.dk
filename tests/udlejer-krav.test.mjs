import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Lejemålet sætter grænsen for hvad sitet må love (11/9 2026).
 *
 * Udlejeren, Semper Ejendomme, skrev til Nizar: sitet reklamerede med
 * «en aften med DJ, drinks og flash-tattoos» i kælderen. Høj musik er
 * ikke tilladt i lejemålet, og udskænkning af spiritus kræver en
 * lejlighedsbevilling huset ikke har — og loven skelner ikke mellem om
 * alkoholen koster penge eller gives væk. Nizar, som ejer:
 * «Du må meget gerne fjerne det fra hjemmesiden.»
 *
 * Det er ikke en smagssag der kan skride tilbage ved næste copy-runde.
 * Derfor et hegn: husets EGNE flader må ikke love musik, bar eller
 * alkohol på Larsbjørnsstræde 13.
 *
 * HVAD DER STADIG MÅ STÅ: at der tatoveres om natten. Det er husets
 * bevilling, det er sandt, og det er det eneste sted i byen der gør det.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * Helt ord, med danske bogstaver.
 *
 * `\b` kender kun [A-Za-z0-9_]. I «skænker øl og» står der et mellemrum
 * før `ø`, og begge er ikke-ord-tegn for regexmotoren — så `\bøl\b`
 * matcher ALDRIG. Målt 11/9: den negative kontrol fandt «musik» i
 * sætningen, men ikke «øl». Et hegn mod alkohol der ikke kan se ordet
 * «øl» er værre end ingen. Unicode-lookaround i stedet.
 */
const helt = (ord) => new RegExp(`(?<![\\p{L}])(?:${ord})(?![\\p{L}])`, "iu");

/**
 * Ord der lover noget lejemålet ikke tillader.
 *
 * Alkohol-ordene matcher også SAMMENSÆTNINGER: dansk skriver «cocktailbar»
 * og «ølbar» i ét ord, og en ren hele-ord-regel så dem ikke (målt 11/9 —
 * «Vi har en cocktailbar» slap igennem). Derfor `ord + \p{L}*`.
 *
 * «bar», «musik» og «DJ» bliver hele ord. Uden den grænse ville «bar»
 * ramme «barsk», «bare» og «barberet» — og et hegn der råber om husets
 * eget sprog, bliver slået fra.
 */
const FORBUDTE = [
  helt("DJ'?s?"),
  helt("drink\\p{L}*"),
  helt("cocktail\\p{L}*"),
  helt("spiritus\\p{L}*"),
  helt("alkohol\\p{L}*"),
  helt("alcohol\\p{L}*"),
  helt("øl\\p{L}*"),
  helt("beer\\p{L}*"),
  helt("bar"),
  helt("musik"),
  helt("music"),
];

/**
 * ANDRE ADRESSER — pop-ups og co-labs uden for lejemålet.
 *
 * Steven, 11/9: «Vi må godt skrive om pop-up events andre steder, og
 * co-labs. Bare intet om Larsbjørnstræde.» Og: «Du skal ikke fjerne
 * Chateau-siden — det er en anden udlejer. Med en anden bevilling.»
 *
 * Begrænsningen er altså ADRESSEN, ikke sitet. En aften på Chateau
 * Motel må gerne have DJ og bar: det er deres hus og deres bevilling.
 * Ink & Art står for stolen, ikke baren.
 *
 * Ny co-lab? Skriv fladen på listen her med stedets navn. Så er det en
 * beslutning man kan se i et review — ikke en stille undtagelse.
 */
const ANDRE_ADRESSER = [
  { flade: /[Cc]hateau/, sted: "Chateau Motel, Knabrostræde 3" },
];
const påAndenAdresse = (f) => ANDRE_ADRESSER.some((a) => a.flade.test(f));

/**
 * Personalets egne sider bag husets kode er ikke reklame.
 *
 * Teamguiden siger «Musikken er på» i åbningsrutinen, og gulvet.yml
 * siger «ingen musik hen over» om et foto. Ingen af delene lover en
 * kunde noget; udlejerens indsigelse gælder hvad SITET REKLAMERER MED.
 * Om der må spilles musik på gulvet er Nizars aftale med udlejeren,
 * ikke en streng i et repo — og et hegn der blander de to, lærer folk
 * at slå det fra.
 */
const PERSONALETS = [/teamguide/, /gulvet/, /afstemning/, /personale/];

/**
 * Ord der peger på lejemålet. Står et af dem i samme sætning som en bar,
 * en DJ eller en øl, er det præcis det udlejeren skrev om.
 */
const ADRESSEN = [helt("Larsbjørnsstræde"), helt("kælderen"), /\bthe basement\b/i];

/**
 * Flader der ER Larsbjørnsstræde 13. Her behøver adressen ikke stå i
 * sætningen — siden handler om huset, punktum. Aftener, forsiden og
 * Find os beskriver lejemålet, uanset hvordan sætningen er formuleret.
 */
const ER_HUSET = [
  /content\/(natten|nat|huset|gaden|aabningstider)\b/,
  /app\/\((da|en)\)\/\(rummet\)\/(natten|gaden|page)/,
  /components\/rummet\/(NattenFlade|GadenFlade)/,
  // i18n er husets egen ordbog. «Gæste-DJ» stod HER, ikke i en YAML, og
  // blev renderet på både Aftener og forsiden — begge huset. Mutation M3
  // (11/9) satte ordet tilbage og hegnet blev grønt, fordi strengen
  // «Gæste-DJ» ikke selv nævner adressen. En co-lab et andet sted har
  // sine egne ord i sin egen fil (som Chateau har), ikke her.
  /^lib\/i18n\.ts$/,
];

/** Kundens sider og indhold — det udlejeren kan læse. */
function husetsEgneFlader() {
  const sider = readdirSync(join(root, "app"), { recursive: true })
    .map((f) => join("app", String(f)))
    .filter((f) => f.endsWith("page.tsx"));
  const flader = readdirSync(join(root, "components"), { recursive: true })
    .map((f) => join("components", String(f)))
    .filter((f) => f.endsWith(".tsx"));
  const tekst = readdirSync(join(root, "content"))
    .filter((f) => f.endsWith(".yml"))
    .map((f) => join("content", f));
  return [...sider, ...flader, ...tekst, "lib/i18n.ts"].filter(
    (f) => !påAndenAdresse(f) && !PERSONALETS.some((u) => u.test(f)),
  );
}

/** Kun det kunden LÆSER: JSX-tekst og strenge, uden kommentarer. */
function synligTekst(src) {
  const kode = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*(\/\/|#).*$/gm, "");
  const bidder = [];
  for (const m of kode.matchAll(/>([^<>{}]+)</g)) bidder.push(m[1]);
  for (const m of kode.matchAll(/"([^"\n]*)"/g)) bidder.push(m[1]);
  for (const m of kode.matchAll(/'([^'\n]*)'/g)) bidder.push(m[1]);
  for (const m of kode.matchAll(/`([^`]*)`/g)) bidder.push(m[1]);
  // YAML: alt der ikke er en kommentar
  if (!kode.includes("<")) bidder.push(kode);
  return bidder;
}

test("intet på sitet lover musik, bar eller alkohol PÅ LARSBJØRNSSTRÆDE", () => {
  const filer = husetsEgneFlader();
  assert.ok(filer.length >= 40, `negativ kontrol: målte kun ${filer.length} filer`);

  const fund = [];
  for (const f of filer) {
    const erHuset = ER_HUSET.some((h) => h.test(f));
    for (const bid of synligTekst(read(f))) {
      const forbudt = FORBUDTE.map((o) => bid.match(o)).find(Boolean);
      if (!forbudt) continue;
      // På husets egne sider er adressen underforstået. Andre steder skal
      // den stå i SAMME sætning — så en pop-up et andet sted er fri.
      const bundet = erHuset || ADRESSEN.some((a) => a.test(bid));
      if (bundet) fund.push(`${f}: «${forbudt[0]}» i »${bid.trim().slice(0, 70)}«`);
    }
  }
  assert.deepEqual(fund, [], "lejemålet tillader det ikke:\n" + fund.join("\n"));
});

test("en pop-up et andet sted må gerne have DJ og bar", () => {
  // Stevens regel, målt som den er skrevet: begrænsningen er adressen.
  // Uden den her ville hegnet spærre for husets egen forretning.
  const bundet = (bid, erHuset = false) => {
    const forbudt = FORBUDTE.some((o) => o.test(bid));
    return forbudt && (erHuset || ADRESSEN.some((a) => a.test(bid)));
  };
  assert.equal(bundet("DJ og bar hele natten på Module"), false, "et andet sted er frit");
  assert.equal(bundet("Flash upstairs — natten kører nedenunder"), false, "Chateaus aften er fri");
  assert.equal(bundet("DJ og drinks i kælderen"), true, "kælderen er lejemålet");
  assert.equal(bundet("Bar og musik på Larsbjørnsstræde 13"), true, "adressen er lejemålet");
  assert.equal(bundet("DJ, drinks og flash-tattoos", true), true, "på husets egen side er adressen underforstået");
  assert.equal(bundet("Flash-tattoos i kælderen", true), false, "det huset FAKTISK gør er stadig frit");
});

test("Aftener siger stadig det huset FAKTISK gør om natten", async () => {
  const { loadNattenCopy, loadNattenCopyEn } = await import("../lib/content.ts");
  const da = loadNattenCopy();
  const en = loadNattenCopyEn();
  // Uden det her kunne hegnet ovenfor opfyldes ved at tømme siden.
  assert.match(da.intro, /flash|tattoo|tatover/i, "den danske aften skal stadig sige hvad den er");
  assert.match(en.intro, /flash|tattoo/i, "den engelske ligeså");
  assert.match(da.spot_linje, /efter kl\. 22|åbent/i, "åbningstiden er fakta og må stå");
  assert.ok(da.intro.length > 30 && en.intro.length > 30, "en tom side er ikke en løsning");
});

test("personalets sider er undtaget — de reklamerer ikke", () => {
  // Uden undtagelsen meldte hegnet teamguidens åbningsrutine
  // («Musikken er på») og gulvets fotoregel («ingen musik hen over»)
  // som brud. Begge står bag husets kode og lover ingen kunde noget.
  const filer = husetsEgneFlader();
  for (const p of ["content/teamguide.yml", "content/gulvet.yml"]) {
    assert.ok(!filer.includes(p), `${p} skal være undtaget`);
  }
  // Men de skal stadig FINDES — forsvinder de, er undtagelsen en løgn.
  assert.match(read("content/teamguide.yml"), /kontakt_titel/);
});

test("Chateau-siden er undtaget — bevidst, ikke glemt", () => {
  // Steven, 11/9: anden udlejer, anden bevilling. Siden skal blive, og
  // undtagelsen skal kunne ses. Forsvinder siden, skal hegnet sige til,
  // så ingen fjerner den i den tro at den var omfattet.
  const flade = "components/rummet/ChateauCollabFlade.tsx";
  assert.ok(husetsEgneFlader().every((f) => f !== flade), "Chateau skal være undtaget");
  assert.match(read(flade), /Chateau Motel/, "Chateau-siden findes stadig");
  // Bundet til BRUGEN, ikke til importlinjen. Mutation M7 (11/9) fjernede
  // <ChateauCollabFlade /> fra siden og hegnet blev grønt — fordi ordet
  // stadig stod i `import`. En test der måler et navn måler ingenting.
  assert.match(
    read("app/(da)/(rummet)/collab/chateau/page.tsx"),
    /<ChateauCollabFlade\s*\/>/,
    "siden skal faktisk rendere fladen",
  );
});

test("negativ kontrol: hegnet kan blive rødt", () => {
  const ramt = (tekst) => FORBUDTE.filter((o) => o.test(tekst)).length;
  assert.ok(ramt("DJ, drinks og flash-tattoos i kælderen") >= 2, "den gamle sætning skal fældes");
  assert.ok(ramt("DJ, drinks and flash tattoos in the basement") >= 2, "også på engelsk");
  // Netop denne fældede hegnet selv: «øl» blev ikke set, fordi \b ikke
  // kender danske bogstaver. Den står her, så det ikke kan ske igen.
  assert.deepEqual(
    FORBUDTE.filter((o) => o.test("Vi skænker øl og spiller musik")).map((o) => "Vi skænker øl og spiller musik".match(o)[0]),
    ["øl", "musik"],
    "både øl og musik skal ses",
  );
  assert.ok(ramt("Der serveres alkohol") >= 1);
  assert.ok(ramt("Vi har en cocktailbar") >= 1);
  assert.equal(ramt("Flash-tattoos i kælderen, når huset holder åbent til natten"), 0, "den nye sætning er ren");
  // «bar» må ikke ramme almindelige danske ord.
  assert.equal(ramt("Barsk streg, bare kom forbi, barberet ryg"), 0, "bar skal være bundet som helt ord");
  assert.equal(ramt("Blackbar"), 0);
  assert.ok(ramt("Der er en bar i kælderen") >= 1, "men en rigtig bar skal fanges");
});
