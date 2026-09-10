import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Heroens video — Nizars egen, stående (Steven, 10/9).
 *
 * Kanonens §4 siger at sitet ikke har bevægelse. Stevens kendelse løfter
 * den for heroen. Løftet blev udvidet samme dag: heroen er 9:16 og vises
 * i alle bredder, fordi det format er født på en telefon. Grænserne der
 * står tilbage, og som hegnet måler:
 *
 *   · aldrig for den der har bedt om ro
 *   · altid med fotoet i DOM'en, det er det skærmlæseren møder
 *   · rammen følger videoen (9:16), ikke omvendt
 *   · filen holder budgettet, så en 6,5 MB-eksport ikke lander lydløst
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * Budgettet, hævet fra 800 KB på Stevens kald 10/9 («Sæt hero budget op»).
 * Nizars video er 29,6 s stående og vejer 2.271 KB uden lyd ved crf 29.
 * 3 MB giver plads til en ny optagelse uden at åbne for en rå eksport:
 * originalen Nizar sendte var 6.646 KB med lyd, og den skal stadig falde.
 */
const BUDGET_KB = 3072;

test("heroen er stadig et billede med alt-tekst — videoen er et lag ovenpå", () => {
  const hero = read("components/rummet/HusetHero.tsx");
  assert.match(hero, /<img src=\{fold\.hero_foto\} alt=\{fold\.hero_billedtekst\} \/>/, "fotoet bærer alt-teksten");
  assert.match(hero, /aria-hidden="true"/, "videoen er pynt for skærmlæseren");
  assert.match(hero, /fold\.hero_video \? \(/, "tom hero_video = heroen som før");
  for (const attr of ["autoPlay", "muted", "loop", "playsInline", "disablePictureInPicture"]) {
    assert.match(hero, new RegExp(`\\b${attr}\\b`), `videoen mangler ${attr}`);
  }
  assert.doesNotMatch(hero, /\bcontrols\b/, "ingen kontroller på et loop");
  assert.match(hero, /preload="metadata"/, "hent ikke hele filen før nogen ser den");
});

test("begge forsider bruger samme hero, og seglet ligger stadig på den", () => {
  for (const side of ["app/(da)/(rummet)/page.tsx", "app/(en)/(rummet)/en/page.tsx"]) {
    const src = read(side);
    const blok = src.slice(src.indexOf("rum-huset__hero"), src.indexOf("rum-huset__side"));
    assert.match(blok, /<HusetHero fold=\{fold\} \/>/, `${side}: heroen skal komme fra HusetHero`);
    assert.match(blok, /<Segl /, `${side}: seglet skal blive på heroen`);
    assert.doesNotMatch(blok, /<img /, `${side}: billedet bor i komponenten, ikke to steder`);
  }
});

test("videoen viger for et ro-ønske, i alle bredder", () => {
  const css = read("components/rummet/rummet.css");
  const i = css.indexOf(".rum-huset__video { display: none; }");
  assert.notEqual(i, -1, "videoen skal være væk som udgangspunkt");
  const mq = css.slice(i, css.indexOf("}\n}", i) + 3);
  assert.match(mq, /@media \(prefers-reduced-motion: no-preference\)/, "ro-ønsket er den grænse der bliver");
  assert.doesNotMatch(mq, /min-width/, "bredde-grænsen er væk: 9:16 hører hjemme på en telefon");
  assert.match(mq, /display: block;/);
  // Seglet ligger over videoen. Uden z-index ville videoens lag (z 1)
  // male hen over det, selvom seglet står senere i DOM'en.
  const s = css.indexOf(".rum-huset__hero .rum-huset__segl {");
  const segl = css.slice(s, css.indexOf("}", s));
  assert.match(segl, /z-index: 2/, "seglet skal ligge over videoen");
  // Videoen fylder heroen (100 %) — rammen sætter formatet, ikke videoen.
  assert.match(mq, /height: 100%;/);
  // Kan videoen ikke hentes — en gammel build under udrulning, en
  // browser uden H.264 — skal fotoet nedenunder skinne igennem. En
  // baggrundsfarve på videoen gør heroen til en sort kasse i stedet.
  assert.match(mq, /background: transparent;/, "videoen skal være gennemsigtig når den ikke kan vise noget");
  assert.doesNotMatch(mq, /background: #/, "ingen farve bag videoen");
  // Rammen er stående og følger videoen. Et liggende udsnit skar tværs
  // gennem hvert motiv (målt 10/9 på fire frames), og det er hele grunden
  // til at wireframet blev lavet om.
  const rammeI = css.indexOf(".rum-huset__hero {");
  const ramme = css.slice(rammeI, css.indexOf("}", rammeI));
  assert.match(ramme, /aspect-ratio: 9 \/ 16;/, "heroen skal være 9:16");
  assert.match(ramme, /margin-inline: auto;/, "rammen skal stå centreret i sin spalte");
  assert.match(css, /\.rum-huset__hero > img \{[^}]*height: 100%;/, "fotoet fylder rammen");
  assert.doesNotMatch(css, /\.rum-huset__hero > img \{[^}]*height: min\(/, "det gamle liggende loft er væk");

  // Seglet ude af midten: på et portfolio-loop ligger arbejdet dér.
  const s2 = css.indexOf(".rum-huset__hero .rum-huset__segl {");
  const segl2 = css.slice(s2, css.indexOf("}", s2));
  assert.doesNotMatch(segl2, /translate\(-50%, -50%\)/, "seglet må ikke dække motivet");
  assert.match(segl2, /bottom: 16px;/, "seglet er et stempel i hjørnet");

  // Ingen anden regel må give videoen display. Første udgave havde
  // `.rum-huset__hero > video` i img-reglen; den vandt over display:
  // none på specificitet, og telefonen viste videoen stablet under
  // fotoet. Hegnet så det ikke, fordi det målte at reglen FANDTES.
  const udenKommentarer = css.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(udenKommentarer, /\.rum-huset__hero > video\b/, "video må ikke rammes af en selektor med højere specificitet end .rum-huset__video");
  const displayRegler = [...udenKommentarer.matchAll(/\.rum-huset__video\s*\{[^}]*display:\s*(\w+)/g)].map((m) => m[1]);
  assert.deepEqual(displayRegler, ["none", "block"], "præcis to regler: none som udgangspunkt, block i media-queryen");
});

test("filerne findes, og videoen holder sig under budgettet", async () => {
  const { loadHusetForside, loadHusetForsideEn } = await import("../lib/content.ts");
  const da = loadHusetForside();
  const en = loadHusetForsideEn();
  assert.equal(en.hero_video, da.hero_video, "EN deler heroen med DA, som fotoet");
  if (!da.hero_video) return; // tom = heroen er fotoet; intet at måle
  assert.ok(da.hero_video.startsWith("/"), "stien skal pege under public/");
  const fil = join(root, "public", da.hero_video);
  assert.ok(existsSync(fil), `videoen mangler: ${da.hero_video}`);
  const kb = statSync(fil).size / 1024;
  assert.ok(kb <= BUDGET_KB, `videoen er ${Math.round(kb)} KB — budgettet er ${BUDGET_KB} KB. En rå eksport må ikke lande lydløst.`);
  if (da.hero_video_plakat) {
    assert.ok(existsSync(join(root, "public", da.hero_video_plakat)), "plakaten mangler");
    assert.ok(statSync(join(root, "public", da.hero_video_plakat)).size / 1024 <= 150, "plakaten er LCP-billedet — hold den lille");
  }
});

test("negativ kontrol: budgettet kan blive rødt", () => {
  // De to rå eksporter huset har fået skal begge falde igennem:
  // Stevens 5.585.684 bytes og Nizars 6.804.679 bytes med lyd.
  assert.ok(5585684 / 1024 > BUDGET_KB, "Stevens original skal falde igennem");
  assert.ok(6804679 / 1024 > BUDGET_KB, "Nizars original skal falde igennem");
});
