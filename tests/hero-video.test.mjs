import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Heroens video — et vindue med liv i, ikke en biograf (Steven, 10/9).
 *
 * Kanonens §4 siger at sitet ikke har bevægelse. Stevens kendelse løfter
 * den for heroen, og hegnet her sikrer at løftet forbliver afgrænset:
 * kun brede skærme, aldrig for den der har bedt om ro, altid med fotoet
 * i DOM'en, og aldrig en fil der æder forsidens Lighthouse-budget.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/** Én fil der er for stor gør forsiden rød i CI. Budgettet er en prøve. */
const BUDGET_KB = 800;

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

test("videoen findes kun på brede skærme og kun uden ro-ønske", () => {
  const css = read("components/rummet/rummet.css");
  const i = css.indexOf(".rum-huset__video { display: none; }");
  assert.notEqual(i, -1, "videoen skal være væk som udgangspunkt");
  const mq = css.slice(i, css.indexOf("}\n}", i) + 3);
  assert.match(mq, /@media \(min-width: 721px\) and \(prefers-reduced-motion: no-preference\)/, "løftet skal være bundet til BÅDE bredde og ro");
  assert.match(mq, /display: block;/);
  // Seglet ligger over videoen. Uden z-index ville videoens lag (z 1)
  // male hen over det, selvom seglet står senere i DOM'en.
  const s = css.indexOf(".rum-huset__hero .rum-huset__segl {");
  const segl = css.slice(s, css.indexOf("}", s));
  assert.match(segl, /z-index: 2/, "seglet skal ligge over videoen");
  // Videoen fylder heroen (100 %), den sætter ikke selv et loft — så
  // heroens højde er stadig fotoets, og billedreglen står som før.
  assert.match(mq, /height: 100%;/);
  assert.match(css, /\.rum-huset__hero > img \{[^}]*height: min\(/);

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
  assert.ok(kb <= BUDGET_KB, `videoen er ${Math.round(kb)} KB — budgettet er ${BUDGET_KB} KB. En 5 MB-eksport må ikke lande lydløst.`);
  if (da.hero_video_plakat) {
    assert.ok(existsSync(join(root, "public", da.hero_video_plakat)), "plakaten mangler");
    assert.ok(statSync(join(root, "public", da.hero_video_plakat)).size / 1024 <= 150, "plakaten er LCP-billedet — hold den lille");
  }
});

test("negativ kontrol: budgettet kan blive rødt", () => {
  // Originalen Steven sendte var 5.585.684 bytes. Den skal falde igennem.
  assert.ok(5585684 / 1024 > BUDGET_KB);
});
