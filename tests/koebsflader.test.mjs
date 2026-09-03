import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

const commerce = read("lib/commerce.ts");
const i18n = read("lib/i18n.ts");
const raekke = read("components/emerge/DepositumRaekke.tsx");
const daShop = read("app/(da)/(rummet)/shop/page.tsx");
const enShop = read("app/(en)/(rummet)/en/shop/page.tsx");
const flade = read("components/rummet/MaerketFlade.tsx");

/**
 * Købsfladerne — vidner på at det vi KAN sælge, også STÅR der.
 *
 * Baggrunden (Villy, S569): Shopify havde ti levende varer; sitet havde en
 * flade for fire. De seks andre kunne købes af enhver der kendte linket, og
 * af ingen andre. Det er ikke en fejl nogen test kunne se, fordi alt der
 * stod på siden var korrekt — der manglede bare seks ting.
 *
 * CI kan ikke måle Shopify (variant-ID'er er live-data; se
 * scripts/maal-varianter.sh og rails §3). Derfor måler disse vidner det CI
 * FAKTISK kan se: at listerne har en flade, at fladen findes på begge sprog,
 * og at hvert `id` har ord at vise. Netværks-målingen er menneskets ansvar
 * og har en dato i commerce.ts.
 */

/** Klip én `export const NAVN: … = [ … ];` ud — bundet af sine egne klammer. */
function listeKrop(src, navn) {
  const i = src.indexOf(`export const ${navn}`);
  assert.notEqual(i, -1, `${navn} findes ikke i commerce.ts`);
  // NB: `indexOf("[")` ville ramme klammen i TYPEN (`Deposit[]`), som lukker
  // med det samme — udsnittet blev tomt og testen bestod på ingenting.
  // Bind derfor til tildelingen: den første "[" EFTER "=".
  const eq = src.indexOf("=", i);
  assert.notEqual(eq, -1, `${navn} har ingen tildeling`);
  const open = src.indexOf("[", eq);
  assert.notEqual(open, -1, `${navn} har ingen liste`);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === "[") depth++;
    else if (src[j] === "]" && --depth === 0) return src.slice(open + 1, j);
  }
  throw new Error(`${navn} lukker aldrig`);
}

const LISTER = ["PIERCINGS", "FLASH_DEPOSITS"];

test("hver post i en depositum-liste har et variant-ID (rails §4: ingen død handling)", () => {
  for (const navn of LISTER) {
    const krop = listeKrop(commerce, navn);
    const poster = krop.split("},").filter((p) => p.includes("id:"));
    assert.ok(poster.length > 0, `${navn} er tom`);
    for (const post of poster) {
      assert.match(post, /variantId: "\d{10,}"/, `post uden variantId i ${navn}: ${post.trim()}`);
    }
  }
});

test("negativ kontrol: listeKrop måler sin egen liste", () => {
  // Uden vidnet kunne udsnittet ramme hele filen og bestå på naboens data.
  const piercings = listeKrop(commerce, "PIERCINGS");
  assert.doesNotMatch(piercings, /GIFT_CARDS|WALKIN|SHOP_PRINTS/);
  assert.doesNotMatch(piercings, /53467075182920/, "gavekort-ID hører ikke til her");
});

test("hvert id har ord at vise — på begge sprog", () => {
  // Fladen slår copy op med `slots[id as keyof …]`. Det `as` er en åben dør:
  // en tastefejl i et id ville rendere `undefined` i knappen uden at tsc
  // siger noget. Dette vidne lukker døren.
  const par = [
    ["PIERCINGS", "piercing"],
    ["FLASH_DEPOSITS", "flashDepositum"],
  ];
  for (const [liste, nøgle] of par) {
    const ids = [...listeKrop(commerce, liste).matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
    assert.ok(ids.length > 0, `ingen id'er i ${liste}`);

    // Begge ordbøger har blokken; vi kræver id'et i dem alle.
    const blokke = [...i18n.matchAll(new RegExp(`${nøgle}: \\{[\\s\\S]*?\\n    \\},`, "g"))].map(
      (m) => m[0],
    );
    assert.equal(blokke.length, 2, `${nøgle} skal findes i præcis to ordbøger (da + en)`);
    for (const blok of blokke) {
      // To kort pr. id: etiketten man SER, og den bøjning man HØRER. Begge
      // slås op med `as keyof`, så begge kan blive `undefined` uden at tsc
      // siger noget. Tæl derfor forekomster — ikke bare «findes».
      for (const id of ids) {
        const fund = [...blok.matchAll(new RegExp(`\\b${id}:`, "g"))].length;
        assert.equal(
          fund,
          2,
          `${nøgle} skal have «${id}» i BÅDE slots og ariaSlots (fandt ${fund})`,
        );
      }
      assert.match(blok, /ariaSlots: \{/, `${nøgle} mangler ariaSlots`);
    }
  }
});

test("depositum og flash-hold hører IKKE til hylden", () => {
  // Én hylde (3/9 2026): piercing-hold og flash-hold lever på /piercing og
  // /flash — ikke som varer på /shop. En dør tilbage ind på Emerge-shoppen
  // er en regression.
  for (const src of [daShop, enShop, flade]) {
    for (const navn of LISTER) {
      assert.doesNotMatch(src, new RegExp("\\b" + navn + "\\b"), navn + " staar paa hylden");
    }
    assert.doesNotMatch(src, /DepositumRaekke|KerbReservation/);
  }
});

test("depositum-kortet er en checkout-handoff uden klient-JS (rails §5)", () => {
  assert.match(raekke, /cartUrl\(/);
  // Direktivet — ikke ordet. Doc-kommentaren nævner "use client" med vilje.
  assert.doesNotMatch(raekke, /^\s*["']use client["']/m);
  // Prisen står PÅ knappen, ikke ved siden af (kundetesten, S568).
  const knap = raekke.slice(raekke.indexOf('className="depot__koeb"'));
  assert.match(knap, /depot__pris/, "prisen skal stå inde i selve knappen");
  assert.match(
    raekke,
    /aria-label=\{aria\(/,
    "knappen skal have en skærmlæser-sætning",
  );
});

test("knappen er stor nok til en utålmodig tommelfinger", () => {
  // WCAG 2.2 SC 2.5.8 kræver 24×24. Kundetesten krævede mere: «knapperne
  // skal være større og mere tydelige». Vi måler gulvet i CSS'en.
  const css = read("app/globals.css");
  const i = css.indexOf("a.depot__koeb {");
  assert.notEqual(i, -1, "reglen for .depot__koeb findes ikke");
  const krop = css.slice(i, css.indexOf("}", i));
  const min = krop.match(/min-height:\s*(\d+)px/);
  assert.ok(min, ".depot__koeb mangler min-height");
  assert.ok(Number(min[1]) >= 44, `knappen er ${min[1]}px høj — under 44px-gulvet`);
});

test("skærmlæser-sætningen er en sætning, ikke en etiket", () => {
  // Første forsøg genbrugte den synlige etiket i aria-label. Målt i bygget
  // HTML lød flash-tiden: «Hold en flash-tid I shoppen · Larsbjørnsstræde 13
  // med 500 kroner…» — stort I midt i en sætning og et punktum-tegn læst højt.
  // Etiketter skimmes, sætninger høres; de er ikke det samme ord.
  // Bind til de kroellede parenteser, ikke til indrykningen. Foerste udgave
  // sluttede paa "\n      }," — seks mellemrum — og da kerb-blokken kom til
  // paa fire, loeb det lazy match videre ind i naboens indhold og dumpede
  // paa et «·» der slet ikke var i en ariaSlots. Samme faelde som CSS-hegnene.
  const blokke = [];
  for (const m of i18n.matchAll(/ariaSlots: \{/g)) {
    let dybde = 0;
    for (let j = m.index + m[0].length - 1; j < i18n.length; j++) {
      if (i18n[j] === "{") dybde++;
      else if (i18n[j] === "}" && --dybde === 0) { blokke.push(i18n.slice(m.index, j + 1)); break; }
    }
  }
  assert.ok(blokke.length >= 4, `fandt kun ${blokke.length} ariaSlots-blokke`);
  // negativ kontrol: en blok maa ikke have slugt naboen
  for (const b of blokke) assert.ok(b.length < 700, `en ariaSlots-blok er ${b.length} tegn — den har grebet for meget`);
  for (const blok of blokke) {
    assert.doesNotMatch(blok, /·/, "et «·» kan ikke læses højt");
  }
});

test("guldknappen står uden for den generelle købsflade-regel", () => {
  // Lektionen bag dette vidne, målt i browseren: det er IKKE nok at min regel
  // står sidst i filen. Den generelle regel har én klasse mere i selektoren
  // (0,3,3 mod 0,2,3) og vinder uanset rækkefølge. Resultatet var mørk tekst
  // på en næsten gennemsigtig gradient: 1.07:1 — ulæseligt. Efter fix: 8.57:1.
  // Kridtet blev friholdt med :not(.kerb__mark); guldknappen skal friholdes
  // på samme måde, ellers kommer fejlen snigende tilbage næste gang nogen
  // rører den generelle regel.
  // Fjern kommentarer først: filen FORKLARER reglen i prosa flere steder,
  // og en forklaring er ikke en selektor. Uden dette målte vidnet sin egen
  // dokumentation og dumpede på den.
  const css = read("app/globals.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const generelle = [...css.matchAll(/a\[href\*="\/cart\/"\][^\s{,]*/g)].map(
    (m) => m[0],
  );
  assert.ok(generelle.length >= 4, "den generelle købsflade-regel findes ikke");
  for (const sel of generelle) {
    assert.match(sel, /:not\(\.depot__koeb\)/, `${sel} friholder ikke guldknappen`);
  }
});

test("kridtet henter hvert ord fra ordbogen — ikke fra komponenten", () => {
  // Baggrunden (S569): KerbReservation tog intet sprog, og etiketterne laa
  // paa dansk i lib/commerce.ts. En engelsk kunde paa /en/shop moedte
  // «Hold min plads» og «Traekkes fra prisen» paa selve koebsknapperne.
  const kerb = read("components/emerge/KerbReservation.tsx");
  assert.match(kerb, /\{ lang = "da" \}/, "kridtet skal tage et sprog");
  assert.match(kerb, /t\(lang\)\.kerb/, "kridtet skal hente ord fra ordbogen");
  // Ingen dansk tilbage i det der RENDERES. Kommentarerne forklarer med
  // vilje hvad der stod foer — en forklaring er ikke en streng, og foerste
  // udgave af vidnet dumpede paa sin egen doc-blok.
  const udenKommentarer = kerb.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  for (const ord of ["Kantstenen", "Hold min plads", "Trækkes fra prisen", "eller ring"]) {
    assert.ok(!udenKommentarer.includes(ord), `«${ord}» står stadig hardkodet i markup`);
  }
  // og handelslaget baerer kun tal og ID'er
  const res = commerce.slice(
    commerce.indexOf("export const RESERVATIONS"),
    commerce.indexOf("\n];", commerce.indexOf("export const RESERVATIONS")),
  );
  assert.doesNotMatch(res, /label:|aria:/, "RESERVATIONS må ikke bære copy");
  assert.match(res, /id: "plads"/);
});

test("hvert kaldsted giver kridtet og fuglen det rigtige sprog", () => {
  const scene = read("components/emerge/SceneV05.tsx");
  assert.match(scene, /<KerbReservation lang=\{lang\}/, "scenen giver ikke sit sprog videre");
  const morSlots = [...scene.matchAll(/<MorBird zone="\w+"([^/]*)\/>/g)];
  assert.ok(morSlots.length >= 4, `fandt kun ${morSlots.length} MorBird-slots`);
  for (const m of morSlots) {
    assert.match(m[1], /lang=\{lang\}/, `en MorBird-slot mangler sproget: ${m[0]}`);
  }
});

test("de tosprogede par peger paa hinanden (hreflang begge veje)", () => {
  // /shop havde INGEN hreflang mens /en/shop pegede paa begge. Et ensrettet
  // par tæller ikke hos Google.
  for (const [sti, kald] of [
    ["app/(da)/(rummet)/shop/page.tsx", '/shop'],
    ["app/(en)/(rummet)/en/shop/page.tsx", '/shop'],
    ["app/(da)/(emerge)/walk-in/page.tsx", '/walk-in'],
    ["app/(en)/(emerge)/en/walk-in/page.tsx", '/walk-in'],
  ]) {
    const src = read(sti);
    assert.ok(
      src.includes(`alternates("${kald}")`),
      `${sti} kalder ikke alternates("${kald}") — parret bliver ensrettet`,
    );
  }
});
