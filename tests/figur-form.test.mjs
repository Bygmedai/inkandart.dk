import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Figurer med LÅST kasse skal passe til deres fils egen form.
 *
 * Baggrunden (Villy, S569): v06-figurerne kom som WebP, hvor v05 var SVG.
 * En SVG strækkes ind i enhver kasse; en WebP har ét fast forhold. Da jeg
 * skiftede rose, kranie og svale ind, tjekkede jeg for `width`+`height` —
 * men kun i SceneV05.tsx. Fire kaldsteder i Groks relikvier sætter BEGGE,
 * og de afveg 15–23 % fra de nye filer. At de blev stående var held: en
 * find-replace mere, og en rose ville være blevet trukket 19px flad.
 *
 * Vidnet her læser figurens FAKTISKE form ud af filen — SVG'ens viewBox,
 * WebP'ens header — og holder den op mod den kasse markup'en låser den i.
 * Så kan ingen bytte et aktiv uden også at rette kassen.
 *
 * KUN RASTER FEJLER. Målt i browseren, fordi de to formater ikke opfører sig
 * ens i en låst kasse:
 *
 *   <img src="dagger.svg"    width=90 height=160>  -> tegnes 43x150, LETTERBOXET
 *   <img src="rose-940.webp" width=88 height=96>   -> fylder kassen, MASET
 *
 * En SVG med viewBox skalerer til at passe og efterlader tom plads; det er
 * spild af kasse, ikke en deformation. En WebP strækkes. Første udgave af
 * dette vidne dumpede på en SVG-daggert der bare stod letterboxet — falsk
 * alarm. Vi måler det der faktisk går i stykker.
 */

/** Bredde/højde fra en SVG's viewBox. */
function svgForhold(sti) {
  const s = readFileSync(sti, "utf8").slice(0, 4000);
  const m = s.match(/viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/);
  return m ? Number(m[1]) / Number(m[2]) : null;
}

/** Bredde/højde fra en WebP-header (VP8X, VP8L eller VP8 ). */
function webpForhold(sti) {
  const b = readFileSync(sti);
  const type = b.subarray(12, 16).toString("ascii");
  let w, h;
  if (type === "VP8X") {
    w = (b.readUIntLE(24, 3) & 0xffffff) + 1;
    h = (b.readUIntLE(27, 3) & 0xffffff) + 1;
  } else if (type === "VP8L") {
    const bits = b.readUInt32LE(21);
    w = (bits & 0x3fff) + 1;
    h = ((bits >> 14) & 0x3fff) + 1;
  } else if (type === "VP8 ") {
    w = b.readUInt16LE(26) & 0x3fff;
    h = b.readUInt16LE(28) & 0x3fff;
  } else return null;
  return w / h;
}

function forhold(offentligSti) {
  const sti = join(root, "public", offentligSti);
  if (offentligSti.endsWith(".svg")) return svgForhold(sti);
  if (offentligSti.endsWith(".webp")) return webpForhold(sti);
  return null;
}

/** Alle .tsx under app/ og components/. */
function tsxFiler(mappe, ud = []) {
  for (const navn of readdirSync(mappe)) {
    const p = join(mappe, navn);
    if (statSync(p).isDirectory()) tsxFiler(p, ud);
    else if (navn.endsWith(".tsx")) ud.push(p);
  }
  return ud;
}

/**
 * Find <img>-elementer der peger på en emerge-figur OG låser begge mål.
 * Rækkefølgen af attributter er ligegyldig — vi læser hele elementet.
 */
function laasteKaldsteder() {
  const fund = [];
  for (const fil of tsxFiler(join(root, "app")).concat(tsxFiler(join(root, "components")))) {
    const src = readFileSync(fil, "utf8");
    for (const m of src.matchAll(/<img\b[\s\S]{0,600}?\/>/g)) {
      const el = m[0];
      const s = el.match(/src="(\/emerge\/[^"]+)"/);
      if (!s) continue;
      const w = el.match(/\bwidth=\{?(\d+)\}?/);
      const h = el.match(/\bheight=\{?(\d+)\}?/);
      if (!w || !h) continue;
      // Kun raster kan strækkes. SVG letterboxer — se doc-blokken ovenfor.
      if (!/\.(webp|png|jpe?g|avif)$/i.test(s[1])) continue;
      fund.push({ fil: fil.replace(root + "/", ""), figur: s[1], w: +w[1], h: +h[1] });
    }
  }
  return fund;
}

const AFVIGELSE = 0.08; // 8 % — nok til afrunding, ikke nok til en synlig deformation

test("et RASTER-aktiv med låst kasse passer til sin egen fils form", () => {
  const kaldsteder = laasteKaldsteder();
  // Nul er et gyldigt resultat: lige nu låser ingen af raster-kaldstederne
  // begge mål. Vidnets værdi er at det fanger den dag nogen gør.
  for (const k of kaldsteder) {
    const filForhold = forhold(k.figur);
    assert.ok(filForhold, `kunne ikke læse formen af ${k.figur}`);
    const kasse = k.w / k.h;
    const afv = Math.abs(kasse - filForhold) / filForhold;
    assert.ok(
      afv <= AFVIGELSE,
      `${k.fil}: ${k.figur} har forholdet ${filForhold.toFixed(3)}, men låses i ` +
        `${k.w}×${k.h} (${kasse.toFixed(3)}) — ${(afv * 100).toFixed(1)} % skæv. ` +
        `Ret kassen til ${k.w}×${Math.round(k.w / filForhold)} eller behold det gamle aktiv.`,
    );
  }
});

test("vidnet kigger overhovedet efter noget", () => {
  // Uden det her kunne regexen være knækket, og testen ovenfor ville bestå
  // på en tom liste for evigt. Vi kræver at parseren finder de LÅSTE
  // kaldsteder der faktisk findes — uanset format.
  const alle = [];
  for (const fil of tsxFiler(join(root, "app")).concat(tsxFiler(join(root, "components")))) {
    const src = readFileSync(fil, "utf8");
    for (const m of src.matchAll(/<img\b[\s\S]{0,600}?\/>/g)) {
      const el = m[0];
      if (!/src="\/emerge\//.test(el)) continue;
      if (/\bwidth=\{?\d+\}?/.test(el) && /\bheight=\{?\d+\}?/.test(el)) alle.push(el);
    }
  }
  assert.ok(alle.length >= 4, `parseren fandt kun ${alle.length} låste kaldsteder — mønsteret er nok ændret`);
});

test("negativ kontrol: vidnet kan overhovedet se en skæv kasse", () => {
  // Uden det her ved vi ikke om testen ovenfor består fordi alt passer,
  // eller fordi den ikke måler noget. Vi regner på de rigtige tal fra i dag:
  // v06-rosen er 940×1224 (0,768) og relikviet låser den i 88×96 (0,917).
  const filForhold = 940 / 1224;
  const kasse = 88 / 96;
  const afv = Math.abs(kasse - filForhold) / filForhold;
  assert.ok(afv > AFVIGELSE, "vidnet ville ikke have fanget dagens nærved-fejl");
  assert.equal(Math.round(88 / filForhold), 115, "den foreslåede rettelse skal være 88×115");
});
