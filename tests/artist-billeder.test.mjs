import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const rod = join(dirname(fileURLToPath(import.meta.url)), "..");
const artister = parse(readFileSync(join(rod, "content/artists.yml"), "utf8"));

/**
 * En artist i stolen SKAL have et billede der findes.
 *
 * ArtistKort renderer `<img src={artist.foto} alt={alt} />` — uden
 * fallback. En tom sti giver `<img src="">`: et brækket billede på
 * forsiden, og en tom alt-tekst oveni.
 *
 * Skrevet da Okan kom til (14/9 2026). Steven havde ni billeder af hans
 * ARBEJDE, men intet portræt af ham, og der er ingen måde at lægge en
 * artist halvt ind: `aktiv: false` skjuler ham ikke (se prøven nedenfor).
 * Så hellere en rød prøve der siger præcis hvad der mangler, end en
 * artist der lander med et hul hvor ansigtet skulle være.
 */
const stolen = artister.filter((a) => a.stol === true);

test("alle i stolen har et billede, og filen findes", () => {
  assert.ok(stolen.length >= 4, `negativ kontrol: fandt kun ${stolen.length} i stolen`);

  const mangler = [];
  for (const a of stolen) {
    // Gæstestolen uden navn er en TOM stol, ikke et menneske — den har
    // sit eget billede, men ingen bio og intet navn. Den tælles med her,
    // fordi kortet stadig renderer et billede.
    if (!a.foto) { mangler.push(`${a.id}: intet foto`); continue; }
    const sti = join(rod, "public", a.foto.replace(/^\//, ""));
    if (!existsSync(sti)) mangler.push(`${a.id}: ${a.foto} findes ikke på disken`);
    if (!a.billedtekst) mangler.push(`${a.id}: billedtekst tom — billedet får ingen alt-tekst`);
  }
  assert.deepEqual(mangler, [], "artister i stolen mangler billeder:\n" + mangler.join("\n"));
});

test("hvert ekstra galleri-billede findes også", () => {
  const mangler = [];
  for (const a of artister) {
    for (const f of a.fotos ?? []) {
      if (!f?.fil) { mangler.push(`${a.id}: tom galleri-række`); continue; }
      const sti = join(rod, "public", f.fil.replace(/^\//, ""));
      if (!existsSync(sti)) mangler.push(`${a.id}: ${f.fil} findes ikke`);
      if (!f.tekst) mangler.push(`${a.id}: ${f.fil} uden alt-tekst`);
    }
  }
  assert.deepEqual(mangler, [], "galleri-billeder mangler:\n" + mangler.join("\n"));
});

/**
 * `aktiv: false` er IKKE en skjul-knap for en artist i stolen.
 *
 * Forsiden og /stolen lister via chairArtists(), som filtrerer på
 * `stol && periode !== "gaest"` — UDEN at se på `aktiv`. Men siderne
 * genereres af profiledArtists(), som KRÆVER `aktiv`. En artist med
 * stol: true og aktiv: false får altså et kort på forsiden der linker
 * til /stolen/<id> — en side der aldrig blev bygget. 404.
 *
 * Ingen i huset står sådan i dag, så prøven er grøn. Den er en
 * regressionsvagt: opdager nogen «aktiv» som en måde at parkere en
 * artist på, går den rød her i stedet for i drift.
 */
test("hvert kort i stolen har en side at linke til", () => {
  const kort = artister.filter((a) => a.stol === true && a.periode !== "gaest" && a.fornavn);
  const sider = artister.filter((a) => a.aktiv === true && a.stol === true && a.fornavn);
  const uden = kort.filter((k) => !sider.some((s) => s.id === k.id)).map((k) => k.id);
  assert.deepEqual(uden, [], `kort uden side (404 ved klik): ${uden.join(", ")}`);
});

test("negativ kontrol: hegnet kan blive rødt", () => {
  const tjek = (a) => {
    if (!a.foto) return "intet foto";
    return existsSync(join(rod, "public", a.foto.replace(/^\//, ""))) ? null : "findes ikke";
  };
  assert.equal(tjek({ foto: "" }), "intet foto");
  assert.equal(tjek({ foto: "/slots/findes-ikke.jpg" }), "findes ikke");
  assert.equal(tjek({ foto: "/slots/S-04.jpg" }), null, "et rigtigt billede skal give grønt");
});
