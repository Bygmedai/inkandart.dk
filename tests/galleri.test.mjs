import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

/**
 * Galleri-slots på artistsiden — docs/accept/galleri.md.
 *
 * Rotationen er ren CSS. Det gør den robust i drift og skrøbelig i review:
 * der er ingen funktion at læse, kun et sæt regler der skal passe sammen.
 * Prøverne her holder netop de par der kan drive fra hinanden.
 */

/** Reglens egen krop — aldrig et udsnit der slutter ved filens ende.
 *  Et sådant hegn flytter sig, når naboen appender (CLAUDE.md §1). */
function ruleBody(css, selector) {
  const i = css.indexOf(selector);
  assert.notEqual(i, -1, `regel ${selector} findes ikke`);
  const open = css.indexOf("{", i);
  let depth = 0;
  for (let j = open; j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}" && --depth === 0) return css.slice(open + 1, j);
  }
  throw new Error(`regel ${selector} lukker aldrig`);
}

const css = read("components/rummet/rummet.css");
const content = read("lib/content.ts");
const komponent = read("components/rummet/Galleri.tsx");

const MAX = Number(content.match(/GALLERI_MAX = (\d+)/)?.[1]);

test("loftet i koden og keyframes i CSS'en er ét par", () => {
  assert.equal(MAX, 5, "GALLERI_MAX findes og er læsbar");

  // Positiv: hvert antal fra 2 til loftet HAR sine keyframes og sit --antal.
  for (let n = 2; n <= MAX; n++) {
    assert.match(
      css,
      new RegExp(`@keyframes rum-galleri-${n}\\b`),
      `antal ${n} mangler @keyframes — den slot ville stå sort`,
    );
    assert.match(
      css,
      new RegExp(`\\[data-antal="${n}"\\][^{]*\\{[^}]*--rum-galleri-antal: ${n}`),
      `antal ${n} mangler --rum-galleri-antal`,
    );
    assert.match(
      css,
      new RegExp(`\\[data-antal="${n}"\\][^}]*animation-name: rum-galleri-${n}`),
      `antal ${n} peger ikke på sine egne keyframes`,
    );
  }

  // Negativ kontrol: der findes INGEN keyframes over loftet. Fandtes de,
  // ville testen ovenfor være grøn uanset hvad loftet stod på.
  assert.doesNotMatch(
    css,
    new RegExp(`@keyframes rum-galleri-${MAX + 1}\\b`),
    `keyframes for ${MAX + 1} findes, men koden viser kun ${MAX} — hæv GALLERI_MAX i samme commit`,
  );
});

test("det synlige vindue er 100/n procent — ellers overlapper to billeder", () => {
  // Hvert billede skal være synligt præcis sin egen n-tedel af turen.
  // Er tallet forkert, kører to billeder oven på hinanden eller slotten
  // står tom et øjeblik. Begge dele ser ud som en fejl, ikke som design.
  for (let n = 2; n <= MAX; n++) {
    const krop = ruleBody(css, `@keyframes rum-galleri-${n}`);
    const nul = krop.match(/([\d.]+)% \{ opacity: 0; \}/);
    assert.ok(nul, `rum-galleri-${n} slukker aldrig`);
    assert.ok(
      Math.abs(Number(nul[1]) - 100 / n) < 0.01,
      `rum-galleri-${n} slukker ved ${nul[1]}%, ikke ${(100 / n).toFixed(3)}%`,
    );
    assert.match(krop, /0% \{ opacity: 1; \}/, `rum-galleri-${n} starter slukket`);
    assert.match(krop, /100% \{ opacity: 1; \}/, `rum-galleri-${n} fader ikke ind igen`);
  }
});

test("delayet er negativt — ellers er det første skift et hak", () => {
  // Et positivt delay lader billede 2 vente på opacity 0 og springe hårdt
  // ind ved første skift. Med (--i - antal) er alle animationer allerede i
  // gang ved indlæsning, og det første skift krydsfader som de øvrige.
  const krop = ruleBody(css, ".rum-galleri__foto {");
  assert.match(
    krop.replace(/\s+/g, " "),
    /animation-delay: calc\( ?\(var\(--i\) - var\(--rum-galleri-antal\)\) \* var\(--rum-galleri-trin\) ?\)/,
    "delayet er ikke (--i - antal) * trin",
  );
});

test("pausen virker uden JavaScript, og knappen hedder det den gør", () => {
  // WCAG 2.2 SC 2.2.2: bevægelse over fem sekunder skal kunne stoppes.
  assert.match(
    css,
    /\.rum-galleri__kontakt:checked ~ \.rum-galleri__foto \{\s*animation-play-state: paused;/,
    "checkboxen pauser ikke billederne",
  );
  // Ingen klient-JS på fladen: label + checkbox, ikke en onClick.
  assert.doesNotMatch(komponent, /use client/, "galleriet må ikke være en klientkomponent");
  assert.doesNotMatch(komponent, /onClick|useState/, "pausen må ikke afhænge af JavaScript");
  assert.match(komponent, /htmlFor="rum-galleri-pause"/, "labelen peger ikke på checkboxen");

  // display:none — ikke opacity/visibility — så det skjulte ord er UDE af
  // tilgængelighedstræet. Ellers hedder knappen «Pause billederne Afspil
  // billederne» for en skærmlæser, uanset hvad øjet ser.
  assert.match(css, /\.rum-galleri__ord--gaa \{ display: none; \}/);
  assert.match(
    css,
    /:checked ~ \.rum-galleri__pause \.rum-galleri__ord--stop \{ display: none; \}/,
  );
});

test("reducér bevægelse koster ikke et billede", () => {
  const i = css.indexOf(".rum-galleri {");
  const media = css.indexOf("@media (prefers-reduced-motion: reduce)", i);
  assert.notEqual(media, -1, "galleri-blokken har ingen reduced-motion-hale");
  const krop = css.slice(media, css.indexOf("\n}", css.indexOf(".rum-galleri__kontakt", media)));

  assert.match(krop, /animation: none/, "noget bevæger sig stadig");
  // Alle slots skal stå samtidig — ikke kun den første. En rotation der
  // bliver til ét billede skjuler resten for netop de brugere.
  assert.match(krop, /opacity: 1/, "de øvrige billeder er stadig usynlige");
  assert.match(krop, /display: grid/, "stakken bliver ikke til et kontaktark");
  // Og pauseknappen er væk: der er intet at pause.
  assert.match(krop, /\.rum-galleri__pause,\s*\n?\s*\.rum-galleri__kontakt \{\s*display: none;/);
});

test("knappens tekst findes på begge sprog", () => {
  const i18n = read("lib/i18n.ts");
  for (const noegle of ["galleriPause", "galleriAfspil"]) {
    const traef = i18n.match(new RegExp(`${noegle}: "`, "g")) ?? [];
    assert.equal(traef.length, 2, `${noegle} står ${traef.length} gange — der er to ordbøger`);
  }
  // Negativ kontrol: teksten må ikke være hårdkodet i komponenten. Det er
  // præcis den fejlklasse der gav danske aria-labels på /en (#232).
  assert.doesNotMatch(komponent, /Pause billederne|Play the photos/);
});

test("én slot ser ud som før galleriet fandtes", () => {
  // Fem af seks profiler har ét foto i dag. De må ikke få en pauseknap
  // eller en animation — der er ikke noget at rotere.
  const artists = read("content/artists.yml");
  const fotos = artists.match(/^\s+fotos:/gm) ?? [];
  assert.ok(fotos.length <= 1, "flere artister med slots end forventet — mål siden igen");

  assert.match(komponent, /fotos\.length === 1/, "der er ingen én-billed-gren");
  const gren = komponent.slice(
    komponent.indexOf("fotos.length === 1"),
    komponent.indexOf("data-antal"),
  );
  assert.doesNotMatch(gren, /rum-galleri__pause/, "én slot får en pauseknap");
  assert.doesNotMatch(gren, /rum-galleri__foto/, "én slot får en animation");
});

test("loftet staar i kontrakten, ikke kun i koden", () => {
  // Kontrakten, ikke en editor-config: fladen er nedlagt, listen staar ved magt.
  const decap = read("docs/cms/indholds-kontrakt.yml");
  const felt = decap.slice(decap.indexOf("name: fotos"), decap.indexOf("name: fotos") + 900);
  assert.match(felt, /widget: list/);
  assert.match(felt, /max: 4/, "loftet står ikke i kontrakten");
  // 4 ekstra + portrættet = GALLERI_MAX. Driver de to fra hinanden, kan hun
  // lægge et billede på der aldrig bliver vist.
  assert.equal(4 + 1, MAX, "Decaps max og GALLERI_MAX er ikke det samme loft");
  for (const f of ["name: fil", "name: tekst", "name: fokus"]) {
    assert.match(felt, new RegExp(f), `feltet ${f} mangler i Decap`);
  }
});
