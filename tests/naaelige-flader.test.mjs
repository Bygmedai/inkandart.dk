import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Et hegn må ikke måle en flade kunden ikke kan nå.
 *
 * Målt 3/9 efter #304 («Én hylde: /shop slår de to butikker ihjel»):
 * de to Emerge-shopsider blev slettet, og med dem forsvandt hver eneste
 * depositum-knap fra sitet — fire piercing-pladser, to flash-tider og
 * kridtets to reservationer. `DepositumRaekke` renderes nu af INGEN side.
 * `KerbReservation` renderes kun af `SceneV05`, som selv ligger på ingen
 * rute. Otte købsknapper, uden en eneste rød prøve.
 *
 * Mit eget hegn fra samme dag — tests/label-in-name.test.mjs — målte
 * videre på `shop.piercing`, `shop.flashDepositum` og `kerb.*` og var
 * grønt hele vejen. Det er den værste slags hegn: det ser ud som om
 * nogen holder øje.
 *
 * Så dette hegn måler NÅELIGHED. Det går fra en side og følger
 * importerne. Kan en komponent ikke nås, skal den stå i PENSIONERET med
 * en grund — og det er en handling man kan se i et review, ikke en
 * stilhed.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * Flader der IKKE kan nås, og hvorfor. En række her er en påstand nogen
 * har skrevet under på — ikke en undtagelse hegnet selv har fundet.
 *
 * MÅLT, IKKE BESLUTTET: #304 fjernede de to Emerge-shopsider. Om husets
 * depositum-salg SKAL være væk, er Stevens kald, ikke kodens. Indtil han
 * har sagt det, står tallene her, så ingen tror det er sket ved et uheld.
 */
const PENSIONERET = {
  // ── Depositum-salget, fjernet 3/9 ──────────────────────────────────
  "components/emerge/DepositumRaekke.tsx":
    "#304 (3/9) slettede /shop og /en/shop i Emerge. Fire piercing-depositummer " +
    "og to flash-tider kan derefter ikke købes noget sted. Variant-ID'erne lever " +
    "(målt 302/fulgt-200 22/8). RAPPORTERET TIL STEVEN — hans kald, ikke kodens.",
  "components/emerge/KerbReservation.tsx":
    "Kridtet renderes kun af SceneV05, som ligger på ingen rute. To reservationer " +
    "(100,- og 1.000,-) er dermed utilgængelige. Samme kald som ovenfor.",

  // ── Emerge-forsiden og dens animationer ───────────────────────────
  // Rummet afløste Emerge-forsiden (K6, S574). Ingen side importerer
  // SceneV05, hverken statisk eller dynamisk — målt 3/9 — og hele øen
  // hænger kun sammen med sig selv. Produktionens forside viser intet
  // `mor__`, intet `crew__`, ingen due. Groks animationsarbejde er altså
  // ikke i drift. Om det SKAL tilbage er Stevens og Groks, ikke mit.
  "components/emerge/SceneV05.tsx": "Emerge-forsiden. Afløst af Rummet (K6, S574). Ingen rute importerer den.",
  "components/emerge/MorBird.tsx": "Mor-fuglen. Kun i SceneV05. Groks lane — rapporteret.",
  "components/emerge/MorMotor.tsx": "Mor-motoren. Kun i SceneV05/MorBird.",
  "components/emerge/SceneMotor.tsx": "Scenens parallax-motor. Kun i Emerge-øen.",
  "components/emerge/GiftRelic.tsx": "Gaverelikviet på Emerge-forsiden. Groks lane — rapporteret.",
  "components/emerge/MobileDock.tsx": "Emerge-forsidens mobil-dock. Rummet har sin egen i Nav.",
  "components/emerge/GadeTape.tsx": "Gadebåndet på Emerge-forsiden.",

  // ── Ubrugt stillads ───────────────────────────────────────────────
  "components/ui/button.tsx": "shadcn-stillads fra første opsætning. Ingen flade bruger den.",
};

/** Alle indgange en kunde kan ramme: sider, layouts og ruter. */
function indgange() {
  return readdirSync(join(root, "app"), { recursive: true })
    .map((f) => join("app", String(f)))
    .filter((f) => /\/(page|layout|route|opengraph-image|not-found)\.tsx?$/.test(f));
}

/**
 * Følg importerne fra en fil — BÅDE `@/…` og relative.
 *
 * Første udgave fulgte kun `@/…` og meldte derfor `Nav` og `Footer` døde:
 * skallen importerer dem som `./Nav`. Et hegn der råber op om noget der er
 * i orden, lærer folk at overhøre det — så den fejl skal ikke stå her.
 */
function importer(fil) {
  const src = read(fil).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const mappe = dirname(fil);
  const ud = [];
  for (const m of src.matchAll(/from\s+"(@\/[^"]+|\.[^"]*)"/g)) {
    const spec = m[1];
    const grund = spec.startsWith("@/") ? spec.slice(2) : normalize(join(mappe, spec));
    for (const ext of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
      if (existsSync(join(root, grund + ext)) && /\.tsx?$/.test(grund + ext)) {
        ud.push(grund + ext);
        break;
      }
    }
  }
  return ud;
}

/** Hver komponentfil der kan nås fra en indgang. */
function naaelige() {
  const set = new Set();
  const kø = indgange();
  while (kø.length) {
    const f = kø.pop();
    for (const næste of importer(f)) {
      if (set.has(næste)) continue;
      set.add(næste);
      kø.push(næste);
    }
  }
  return set;
}

test("hver komponent under components/ kan nås fra en side — ellers står den som pensioneret", () => {
  const kan = naaelige();
  assert.ok(kan.size >= 30, `negativ kontrol: naaede kun ${kan.size} filer`);
  assert.ok(kan.has("components/rummet/Shell.tsx"), "negativ kontrol: skallen skal kunne nås");

  const alle = readdirSync(join(root, "components"), { recursive: true })
    .map((f) => join("components", String(f)))
    .filter((f) => f.endsWith(".tsx"));
  assert.ok(alle.length >= 30, `negativ kontrol: fandt kun ${alle.length} komponenter`);

  const døde = alle.filter((f) => !kan.has(f) && !(f in PENSIONERET));
  assert.deepEqual(
    døde,
    [],
    "komponenter ingen side kan nå. Er det med vilje, skriv dem i PENSIONERET " +
      "med en grund — så står det i diffen:\n" + døde.join("\n"),
  );

  // Og omvendt: en pensioneret flade der ER kommet tilbage, skal ud af
  // listen. Ellers samler listen støv og bliver en løgn i den anden retning.
  const genopstået = Object.keys(PENSIONERET).filter((f) => kan.has(f));
  assert.deepEqual(genopstået, [], "disse er nåelige igen — fjern dem fra PENSIONERET:\n" + genopstået.join("\n"));
});

test("Label-in-Name-hegnet måler præcis de knapper en kunde kan nå", () => {
  // Grunden hegnet findes: label-in-name.test.mjs målte videre på
  // piercing-, flash- og kridt-navnene efter #304 havde fjernet dem, og
  // var grønt. Nu holdes de to filer mod hinanden i BEGGE retninger:
  // måler hegnet en død flade, går det rødt — og kommer en flade
  // tilbage uden at hegnet følger med, går det også rødt. Ellers ville
  // depositummerne kunne genopstå uden et navn man kan sige.
  const kan = naaelige();
  const hegn = read("tests/label-in-name.test.mjs");
  const flader = {
    "kerb.slots": "components/emerge/KerbReservation.tsx",
    "shop.piercing": "components/emerge/DepositumRaekke.tsx",
    "shop.flashDepositum": "components/emerge/DepositumRaekke.tsx",
    "rummet.spotAria": "components/rummet/NattenFlade.tsx",
  };
  const fund = [];
  for (const [nøgle, fil] of Object.entries(flader)) {
    const levende = kan.has(fil);
    const måles = hegn.includes(nøgle);
    if (måles && !levende) {
      fund.push(`«${nøgle}»: hegnet lover at holde øje, men ${fil} kan ikke nås fra nogen side`);
    }
    if (levende && !måles) {
      fund.push(`«${nøgle}»: ${fil} er nåelig igen — hegnet skal måle den, ellers kan navnet skride ubemærket`);
    }
  }
  assert.deepEqual(fund, [], fund.join("\n"));

  // Og mindst én skal være levende — ellers måler hegnet intet overhovedet.
  assert.ok(
    Object.values(flader).some((f) => kan.has(f)),
    "ingen købsflade er nåelig: Label-in-Name-hegnet måler intet",
  );
});

test("negativ kontrol: nåeligheden er transitiv, ikke bare ét niveau", () => {
  const kan = naaelige();
  // NattenFlade importeres af /natten (ét niveau), og den importerer selv
  // Door — som altså skal med. Uden transitivitet ville et hegn på Door
  // tro at den var død.
  assert.ok(kan.has("components/rummet/NattenFlade.tsx"), "ét niveau virker ikke");
  assert.ok(kan.has("components/rummet/Door.tsx"), "nåeligheden stopper efter ét niveau");
  // Og SceneV05 må IKKE være nåelig — det er hele fundet.
  assert.ok(!kan.has("components/emerge/SceneV05.tsx"), "SceneV05 ligger på ingen rute");
});
