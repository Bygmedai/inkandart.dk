import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Husets maerke i toppen af hver underside — docs/accept/masthead.md.
 *
 * Kriterium 6 er tidsdimensionen: hver underside har PRAECIS ET segl. Ikke
 * to fordi nogen tilfoejede et mere, ikke nul fordi en ny side glemte det.
 * Det er den slags der skrider stille naar fire agenter bygger sider, saa
 * vidnet her taeller dem — i stedet for at vi opdager det naar en kunde
 * staar fast.
 */

/** Alle kundevendte undersider. /figur-lab er intern og med vilje uden. */
function kundesider() {
  const ud = [];
  const gaa = (mappe) => {
    for (const navn of readdirSync(mappe)) {
      const p = join(mappe, navn);
      if (statSync(p).isDirectory()) gaa(p);
      else if (navn === "page.tsx") ud.push(p);
    }
  };
  gaa(join(root, "app"));
  return ud
    .map((p) => p.replace(root + "/", ""))
    .filter((p) => !p.includes("(rummet)"))       // Rummet har Nav-segl, ikke Masthead
    .filter((p) => !p.includes("figur-lab"))      // intern, ikke linket
    .filter((p) => !p.endsWith("/en/page.tsx"))   // ER den engelske forside
    // En rute der kun kalder notFound() tegner ingen flade — den har hverken
    // segl eller vej hjem, fordi den aldrig naar at blive vist. Udledt af
    // indholdet, ikke af en navneliste, saa den ikke skal vedligeholdes.
    .filter((p) => !/notFound\(\)/.test(readFileSync(join(root, p), "utf8")));
}

test("hver kundevendt underside har praecis ét segl i toppen", () => {
  const sider = kundesider();
  assert.ok(sider.length >= 8, `fandt kun ${sider.length} undersider — leder vi det rigtige sted?`);
  for (const sti of sider) {
    const src = readFileSync(join(root, sti), "utf8");
    const antal = (src.match(/<Masthead\b/g) || []).length;
    assert.equal(antal, 1, `${sti} har ${antal} <Masthead> — der skal være præcis én`);
  }
});

test("de engelske sider peger hjem til engelsk, ikke til dansk", () => {
  for (const sti of kundesider().filter((p) => p.includes("/en/"))) {
    const src = readFileSync(join(root, sti), "utf8");
    assert.match(src, /<Masthead lang="en"/, `${sti} skal give Masthead lang="en"`);
  }
  // og komponenten skal faktisk bruge sproget til at vaelge maal
  const m = readFileSync(join(root, "components/brand/Masthead.tsx"), "utf8");
  assert.match(m, /lang === "en" \? "\/en" : "\/"/, "Masthead vælger ikke mål ud fra sproget");
});

test("seglet er stort nok til en tommelfinger (WCAG 2.2 SC 2.5.8)", () => {
  const css = readFileSync(join(root, "app/globals.css"), "utf8");
  const i = css.indexOf(".masthead__segl {");
  assert.notEqual(i, -1, "reglen for .masthead__segl findes ikke");
  const krop = css.slice(i, css.indexOf("}", i));
  const w = krop.match(/width:\s*(\d+)px/);
  assert.ok(w && Number(w[1]) >= 44, `seglet er ${w?.[1]}px — under 44px-gulvet`);
});

test("negativ kontrol: ingen kundeside er en blindgyde", () => {
  // Foer denne aendring kunne man ikke komme hjem fra /gavekort/giv og
  // /gavekort/kort. Vidnet kraever en vej hjem paa HVER side — enten
  // mastheaden eller et eksplicit link. Uden det ville testen ovenfor
  // bestaa selv om nogen fjernede alle veje hjem paa en side uden Masthead.
  const uden = [];
  for (const sti of kundesider()) {
    const src = readFileSync(join(root, sti), "utf8");
    if (!/<Masthead\b/.test(src) && !/<RummetShell\b/.test(src) && !/redirect\("\/#doer"\)/.test(src) && !/href="\/(en)?"/.test(src)) uden.push(sti);
  }
  assert.deepEqual(uden, [], `disse sider har ingen vej hjem: ${uden.join(", ")}`);
});

test("seglet findes som fil", () => {
  assert.ok(existsSync(join(root, "public/brand/logo-segl.svg")), "seglet mangler");
});

/**
 * S578. Fuld QA maalte at Blackbook-linket blev laest op TO gange paa
 * desktop: `innerText` var bogstaveligt «BLACKBOOK\nBLACKBOOK».
 *
 * Navnet kom to steder fra paa én gang — det synlige ord og et
 * `sr-only`-dubletord. `.rum-nav__book-word` er `display:none` under 900px
 * og `inline` over, men `sr-only` var der altid. Paa mobil var linket
 * derfor rigtigt, og fejlen fandtes KUN over 900px. Det er grunden til at
 * ingen saa den: den mobile udgave, som alle tjekker, var i orden.
 */
test("Blackbook har ét navn, ikke to (WCAG 4.1.2 / 2.5.3)", () => {
  const src = readFileSync(join(root, "components/rummet/Nav.tsx"), "utf8");
  const i = src.indexOf("function Blackbook");
  assert.ok(i > -1, "negativ kontrol: fandt ikke Blackbook-komponenten");
  // Udsnittet bindes til NAESTE toplevel-erklaering, ikke til det foerste
  // «\n}» — det rammer destruktureringens parentes og klipper blokken over
  // foer aria-label. Et hegn der maaler for lidt ser groent ud.
  const slut = src.indexOf("\nexport function", i);
  assert.ok(slut > i, "negativ kontrol: fandt ikke enden paa komponenten");
  // Kommentarer strippes: forklaringen paa fejlen NAEVNER «sr-only», og en
  // proeve der laeser sin egen begrundelse som kode maaler det forkerte.
  const blok = src.slice(i, slut).replace(/\/\/.*$/gm, "");

  // Ordet maa kun staa som SYNLIG tekst. Et sr-only-dublet ved siden af
  // det synlige ord er praecis den fejl der blev maalt.
  assert.doesNotMatch(blok, /sr-only/,
    "et sr-only-navn ved siden af det synlige ord bliver laest op to gange");

  // Og navnet skal findes, ogsaa naar ordet er skjult under 900px.
  assert.match(blok, /aria-label="Blackbook"/,
    "uden aria-label mister linket sit navn paa mobil, hvor ordet er skjult");

  // aria-label skal vaere ORDRET det synlige ord — ellers kan talestyring
  // ikke sige det man laeser (Label in Name, 2.5.3).
  const synligt = blok.match(/book-word">([^<]+)</);
  assert.equal(synligt?.[1], "Blackbook", "det synlige ord og navnet er ikke ens");
});
