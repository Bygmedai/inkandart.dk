import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
const LOGO = "public/brand/logo-segl.svg";

/**
 * Husets officielle segl i heroen.
 *
 * Baggrunden (Villy, S569): logoet fandtes kun som build-rest fra det
 * pensionerede 11ty-site, i en mappe der er gitignoreret. Kilden var slettet
 * i Next-migrationen. Den er hentet ud af historikken (7f8dfb7^), befriet for
 * sin sorte bagplade, vektoriseret med potrace og lagt i repoet — så ingen
 * skal grave efter den igen.
 *
 * Vektoren er ikke pynt: den vejer 14 kB gzip'et mod rasterens 31 kB OG kan
 * vises i enhver størrelse. Derfor kunne seglet vokse fra 188px til 300px på
 * desktop uden at koste noget.
 *
 * Vidnerne holder tre ting fast: at seglet FAKTISK er hero-mærket, at det har
 * en tilgængelig tekst (h1'en har ingen anden), og at det ikke bliver vist
 * større end kilden kan bære.
 */

/** Bredde/højde fra en WebP-header. */
function webpMaal(sti) {
  const b = readFileSync(sti);
  const type = b.subarray(12, 16).toString("ascii");
  if (type === "VP8X") return [(b.readUIntLE(24,3)&0xffffff)+1, (b.readUIntLE(27,3)&0xffffff)+1];
  if (type === "VP8L") { const v = b.readUInt32LE(21); return [(v&0x3fff)+1, ((v>>14)&0x3fff)+1]; }
  if (type === "VP8 ") return [b.readUInt16LE(26)&0x3fff, b.readUInt16LE(28)&0x3fff];
  return null;
}

test("seglet ligger i repoet — ikke i en gitignoreret build-mappe", () => {
  assert.ok(existsSync(join(root, LOGO)), `${LOGO} mangler`);
  assert.ok(
    existsSync(join(root, "assets/logo-original.png")),
    "originalen skal ligge med, så ingen skal grave i git-historikken igen",
  );
});

/** Hero-h1'en, bundet til sit eget element — ikke til en position i filen. */
function heroOverskrift() {
  const i = scene.indexOf("<h1");
  assert.notEqual(i, -1, "der er ingen <h1> i scenen");
  const slut = scene.indexOf("</h1>", i);
  assert.notEqual(slut, -1, "h1 lukker aldrig");
  return scene.slice(i, slut);
}

test("heroens h1 ER det officielle segl, og det har en tilgængelig tekst", () => {
  const h1 = heroOverskrift();
  // Bind til konstanten, ikke til et filnavn skrevet to steder — ellers
  // fejler vidnet næste gang formatet skifter, i stedet for at måle reglen.
  const sti = "/" + LOGO.replace(/^public\//, "");
  assert.ok(h1.includes(`src="${sti}"`), `heroen bruger ikke ${sti}`);
  const alt = h1.match(/alt="([^"]+)"/);
  assert.ok(alt, "seglet mangler alt-tekst — h1'en ville stå uden navn");
  assert.match(alt[1], /Ink/i, `alt-teksten siger «${alt[1]}» og navngiver ikke huset`);
});

test("er seglet en vektor, er størrelsen fri — er det et raster, gælder 2x-reglen", () => {
  // Reglen følger formatet, ikke omvendt. Skifter nogen tilbage til en WebP
  // og beholder de 300px, skal vidnet sige fra: en raster i 300px kræver en
  // kilde på 600px, og den findes ikke. Originalen er 389px.
  const h1 = heroOverskrift();
  const clamp = h1.match(/width:'clamp\((\d+)px,[^,]+,(\d+)px\)'/);
  assert.ok(clamp, "seglets bredde er ikke en clamp — så kan reglen ikke efterses");
  const maks = Number(clamp[2]);

  if (LOGO.endsWith(".svg")) {
    const svg = readFileSync(join(root, LOGO), "utf8");
    assert.match(svg, /<svg[^>]*viewBox=/, "SVG'en mangler viewBox — så skalerer den ikke");
    assert.match(svg, /<path/, "SVG'en indeholder ingen kurver — er den blevet til et indlejret billede?");
    assert.doesNotMatch(svg, /<image[^>]+href/, "SVG'en har et indlejret raster i sig — det er ikke en vektor");
  } else {
    const [bredde] = webpMaal(join(root, LOGO));
    assert.ok(maks * 2 <= bredde, `seglet vises op til ${maks}px, men rasterkilden er kun ${bredde}px`);
  }
});

test("heroens knap kolliderer ikke med scroll-teksten", () => {
  // Målt i browseren S569: da seglet voksede fra 188px til 300px, skubbede
  // hero-blokken BOOK TID 112px ned og 3.913 px² ind i «Scroll down to
  // emerge». Rettet ved at løfte paddingTop fra 30svh til 25svh — målt
  // efter: 0 px² på begge viewports, 27px luft.
  //
  // CI har ingen browser, så vidnet holder fast i de to tal der styrer
  // forholdet. Ændrer nogen dem, skal de måle igen med scripts/maal-flader.mjs.
  const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
  const hero = scene.match(/data-depth="0\.6" data-drift="0" style=\{\{position:'relative',zIndex:'18',paddingTop:'([\d.]+)svh'/);
  assert.ok(hero, "hero-blokkens paddingTop kunne ikke læses");
  assert.ok(
    Number(hero[1]) <= 25,
    `paddingTop er ${hero[1]}svh — over 25 skubbede knappen ind i scroll-teksten da seglet blev 300px`,
  );
});

test("negativ kontrol: vidnet læser den rigtige clamp", () => {
  // Uden det her kunne regexen ramme en anden clamp i den 72 kB store
  // scenefil og bestå på et fremmed tal.
  const h1 = heroOverskrift();
  assert.ok(h1.length < 1200, `h1-udsnittet er ${h1.length} tegn — det har grebet for meget`);
  assert.doesNotMatch(h1, /data-depth|v05\/|hero-cta/, "udsnittet har fanget nabo-markup");
});
