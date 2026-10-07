// Billedkarussellen på forsidens kort (Villy, 6/10 2026).
// Steven: «Gider du flette samme feature ind på forsiden under Nizar som
// under hans profil. Dvs en billed karussel.» · «Kun Nizar.»
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const C = await import("../lib/content.ts");

test("kun Nizar har karussellen på forsiden — og han har billederne til den", () => {
  const artists = C.loadHouse().artists;
  const med = artists.filter((a) => a.forside_galleri).map((a) => a.id);
  assert.deepEqual(med, ["nizar"]);
  assert.ok(C.artistFotos(artists.find((a) => a.id === "nizar")).length > 1);
  // Okan har også et galleri på profilen, men ikke på forsiden.
  assert.ok(C.artistFotos(artists.find((a) => a.id === "okan")).length > 1);
  assert.equal(artists.find((a) => a.id === "okan").forside_galleri, false);
});

test("forsiden beder om karussellen; /stolen gør ikke", () => {
  for (const f of ["app/(da)/(rummet)/page.tsx", "app/(en)/(rummet)/en/page.tsx"]) {
    assert.match(read(f), /galleri=\{a\.forside_galleri\}/, f);
  }
  for (const f of ["app/(da)/(rummet)/stolen/page.tsx", "app/(en)/(rummet)/en/stolen/page.tsx"]) {
    assert.doesNotMatch(read(f), /galleri=/, f);
  }
});

test("hvert kort har sin egen pauseknap, og knappen ligger uden for linket", () => {
  const kort = read("components/rummet/ArtistKort.tsx");
  assert.match(kort, /pauseId=\{`rum-galleri-pause-\$\{artist\.id\}`\}/,
    "to gallerier på samme side må ikke dele ét id");
  const g = read("components/rummet/Galleri.tsx");
  const link = g.indexOf('<a href={href} className="rum-galleri__link"');
  const slut = g.indexOf("</a>", link);
  const label = g.indexOf("<label htmlFor={pauseId}");
  assert.ok(link > -1 && slut > link && label > slut,
    "pauseknappen ligger inde i linket — så navigerer den også");
});

test("pausen virker gennem linket, og kortet holder sin højde ved reducér bevægelse", () => {
  const css = read("components/rummet/rummet.css");
  assert.match(css, /\.rum-galleri__kontakt:checked ~ \.rum-galleri__link \.rum-galleri__foto \{\s*animation-play-state: paused;/);
  const i = css.indexOf("Galleriet på forsidens kort");
  const blok = css.slice(i, css.indexOf("Artistens tider", i));
  assert.match(blok, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(blok, /\.rum-galleri\.rum-galleri--kort \{\s*display: block;\s*aspect-ratio: 4 \/ 5;/,
    "kortet bliver et kontaktark og skubber forsiden");
  assert.match(blok, /\.rum-galleri--kort \.rum-galleri__foto:not\(:first-of-type\) \{\s*display: none;/);
});

test("negativ kontrol: uden flaget står kortet med portrættet, som før", () => {
  const kort = read("components/rummet/ArtistKort.tsx");
  assert.match(kort, /galleri = false/, "karussellen er slået til som standard");
  assert.match(kort, /galleri && href \?/);
});

/* ── En mand der ikke arbejder i huset, står ingen steder (7/10 2026) ──── */
// Nizar, via Steven: «Denne person arbejder her ikke mere. Fjern ham fra
// alle flader.» S-12 og S-13 var tekstet som Nizar, men viste en anden.
const FJERNET = ["S-12", "S-13"];

/** Alle billedstier i husets indhold — det sitet og /api/huset kan vise. */
function billedstier() {
  const filer = ["artists.yml", "vaerker.yml", "huset.yml", "huset.en.yml", "hylden.yml"];
  return filer.flatMap((f) => [...read(`content/${f}`).replace(/^\s*#.*$/gm, "").matchAll(/\/[\w./-]+\.(?:jpe?g|png|webp)/g)].map((m) => m[0]));
}

test("billederne af manden der er gået, er væk fra indholdet og fra disken", () => {
  const stier = billedstier();
  assert.ok(stier.length > 20, `negativ kontrol: fandt kun ${stier.length} billedstier — er læseren i stykker?`);
  for (const id of FJERNET) {
    assert.ok(!stier.some((s) => s.includes(`/${id}.`)), `${id} står stadig i indholdet`);
    assert.throws(() => readFileSync(join(root, `public/slots/${id}.jpg`)), `public/slots/${id}.jpg findes stadig`);
  }
  // Og prøven kan se det, når det står der.
  assert.ok(["/slots/S-12.jpg"].some((s) => FJERNET.some((id) => s.includes(`/${id}.`))));
  // Nizar har stadig sin karussel: portrættet plus billederne af ham selv.
  const nizar = C.loadHouse().artists.find((a) => a.id === "nizar");
  assert.deepEqual(C.artistFotos(nizar).map((f) => f.fil), ["/slots/S-04.jpg", "/slots/S-11.jpg", "/slots/S-10.jpg"]);
});
