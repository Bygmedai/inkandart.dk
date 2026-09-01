import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const læs = (f) => readFileSync(join(root, f), "utf8");

/**
 * Sproget paa dokumentet — <html lang>.
 *
 * Fejlen vidnet er født af: hele sitet skrev `lang="da"`, ogsaa paa /en, hvor
 * teksten er engelsk. Skaermlaeseren laeste engelsk op med dansk udtale, og
 * samme side sagde to modstridende ting til Google (lang=da, hreflang=en).
 *
 * Vidnet udleder sit omraade fra disken: hver side under app/ skal ligge i
 * den rod hvis sprog svarer til dens adresse. Tilfoejer nogen en ny engelsk
 * side i den danske rod — eller retter et rod-layout til det forkerte sprog —
 * gaar den roed uden at nogen skal huske at opdatere en liste.
 */

/** Alle page.tsx under app/, som stier relativt til roden. */
function sider() {
  const ud = [];
  const gaa = (mappe) => {
    for (const navn of readdirSync(mappe)) {
      const sti = join(mappe, navn);
      if (statSync(sti).isDirectory()) gaa(sti);
      else if (navn === "page.tsx") ud.push(sti.replace(root + "/", ""));
    }
  };
  gaa(join(root, "app"));
  return ud;
}

/** Adressen en side svarer paa — rutegrupper i parentes taeller ikke med. */
function adresse(sti) {
  return (
    "/" +
    sti
      .replace(/^app\//, "")
      .replace(/\/page\.tsx$/, "")
      .split("/")
      .filter((s) => !/^\(.*\)$/.test(s))
      .join("/")
  );
}

test("hvert rod-layout saetter det sprog dets gruppe hedder", () => {
  for (const [gruppe, sprog] of [["(da)", "da"], ["(en)", "en"]]) {
    const layout = læs(`app/${gruppe}/layout.tsx`);
    assert.match(
      layout,
      new RegExp(`<HusetsRod lang="${sprog}"`),
      `app/${gruppe}/layout.tsx skal give HusetsRod lang="${sprog}"`,
    );
  }
});

test("skallen skriver sproget fra sin egenskab — ikke en fast streng", () => {
  const skal = læs("components/rod/HusetsRod.tsx");
  assert.match(skal, /<html lang=\{lang\}>/, "sproget er haardkodet i skallen");
  assert.doesNotMatch(skal, /<html lang="/, "et fast sprog i skallen slaar begge rødder ihjel");
});

test("kun rødderne skriver <html> — ingen anden fil maa goere det", () => {
  const traef = [];
  const gaa = (mappe) => {
    for (const navn of readdirSync(mappe)) {
      const sti = join(mappe, navn);
      if (statSync(sti).isDirectory()) gaa(sti);
      else if (/\.tsx$/.test(navn) && /<html\b/.test(readFileSync(sti, "utf8")))
        traef.push(sti.replace(root + "/", ""));
    }
  };
  gaa(join(root, "app"));
  gaa(join(root, "components"));
  assert.deepEqual(traef, ["components/rod/HusetsRod.tsx"], `<html> staar ogsaa i: ${traef}`);
});

test("engelske adresser bor i den engelske rod — og kun der", () => {
  const forkerte = [];
  for (const sti of sider()) {
    const url = adresse(sti);
    const engelskAdresse = url === "/en" || url.startsWith("/en/");
    const engelskRod = sti.startsWith("app/(en)/");
    if (engelskAdresse !== engelskRod) forkerte.push(`${url} → ${sti}`);
  }
  assert.deepEqual(forkerte, [], `sider i den forkerte sprogrod: ${forkerte.join(", ")}`);
});

test("negativ kontrol: vidnet ville fange en engelsk side lagt i dansk rod", () => {
  // Samme regel koert mod en opdigtet fil. Bestaar den her, uden at reglen
  // ovenfor kan fejle, er reglen ikke et hegn men en dekoration.
  const opdigtet = "app/(da)/(rummet)/en/pris/page.tsx";
  const url = adresse(opdigtet);
  assert.equal(url, "/en/pris");
  assert.equal(opdigtet.startsWith("app/(en)/"), false);
  assert.notEqual(url.startsWith("/en"), opdigtet.startsWith("app/(en)/"));
});
