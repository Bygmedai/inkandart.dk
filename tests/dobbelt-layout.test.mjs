import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * En layout-klasse må kun tælle ÉN gang ned gennem siden.
 *
 * FEJLEN DEN FANGER (S578, /personale, live). Siden satte `rum-legal` på
 * sit <main>, og TeamguideFlade satte `rum-legal` på sin egen rod indeni.
 * Klassen bærer BÅDE et spaltemål (max-width: 68ch) OG husets gutter
 * (padding: 0 var(--gutter)). Anvendt to gange blev begge dele talt to
 * gange: på en 1440 px skærm stod teksten i en spalte på 198 px, og
 * overskriften hang ud over kanten. Ingen test blev rød. Byggeriet var
 * grønt. Siden så bare forkert ud — og det opdagede Steven, ikke porten.
 *
 * Klassen skal ikke bruges færre steder; den skal bruges ét sted ad
 * gangen. Enten ejer <main> layoutet, eller også gør komponenten.
 *
 * VAGTEN UDLEDER SIT OMRÅDE AF DISKEN. Den bygger et kort over hvilken
 * klasse hver komponent sætter på sin rod, og går derefter hver side
 * igennem: sætter <main> en spalteklasse, og render den en komponent der
 * sætter den samme, er det en dobbelt. Ingen liste over sider, ingen
 * liste over komponenter — så den dækker også den side nogen skriver i
 * morgen.
 */

/** Klasser der bærer både et mål og en gutter. Ses de to gange, tælles begge to gange. */
const SPALTEKLASSER = ["rum-legal", "rum-room"];

function filer(mappe, ud = []) {
  for (const n of readdirSync(mappe)) {
    const p = join(mappe, n);
    if (statSync(p).isDirectory()) filer(p, ud);
    else if (p.endsWith(".tsx")) ud.push(p);
  }
  return ud;
}

const klasserI = (s) => (s.match(/[\w-]+/g) ?? []);

/** Roden i en komponent: første className efter et `return (`. */
function rodklasser(kilde) {
  const ud = new Set();
  const re = /return \(\s*\n?\s*<[A-Za-z][\w.]*([^>]*?)>/g;
  let m;
  while ((m = re.exec(kilde))) {
    const c = /className="([^"]*)"/.exec(m[1]);
    if (c) klasserI(c[1]).forEach((k) => ud.add(k));
  }
  return ud;
}

/** Alle <main ...> i en side, med deres klasser. */
function mainKlasser(kilde) {
  return [...kilde.matchAll(/<main\b([^>]*)>/g)].map((m) => {
    const c = /className="([^"]*)"/.exec(m[1]);
    return new Set(c ? klasserI(c[1]) : []);
  });
}

/**
 * En side har flere `return (` — låseskærmen og den åbne side er to
 * forskellige træer. De skal måles hver for sig, ellers råber vagten op
 * over et <main> og en komponent der aldrig står på skærmen samtidig.
 */
function blokke(kilde) {
  return kilde.split(/\breturn \(/).slice(1);
}

function dobbelte(sider, komponenter) {
  const fejl = [];
  for (const [sti, kilde] of sider) {
    for (const blok of blokke(kilde)) {
      const brugte = [...komponenter.keys()].filter((navn) =>
        new RegExp(`<${navn}[\\s/>]`).test(blok),
      );
      for (const m of mainKlasser(blok)) {
        for (const navn of brugte) {
          for (const k of SPALTEKLASSER) {
            if (m.has(k) && komponenter.get(navn).has(k)) {
              fejl.push(`${sti}: <main class="…${k}…"> render <${navn}> der også sætter .${k}`);
            }
          }
        }
      }
    }
  }
  return [...new Set(fejl)].sort();
}

const komponenter = new Map(
  filer(join(root, "components")).map((p) => [
    /([\w]+)\.tsx$/.exec(p)[1],
    rodklasser(readFileSync(p, "utf8")),
  ]),
);

const sider = filer(join(root, "app"))
  .filter((p) => /page\.tsx$|not-found\.tsx$/.test(p))
  .map((p) => [relative(root, p), readFileSync(p, "utf8")]);

test("ingen side lægger den samme spalteklasse to gange oven i hinanden", () => {
  assert.ok(sider.length > 10, "der skal være sider at gå igennem");
  assert.ok(komponenter.size > 10, "der skal være komponenter at slå op i");
  assert.deepEqual(dobbelte(sider, komponenter), []);
});

test("negativ kontrol: vagten kan faktisk se en dobbelt", () => {
  const komp = new Map([["FalskFlade", new Set(["rum-legal", "rum-guide"])]]);
  const side = [["app/falsk/page.tsx", `return (\n    <main id="main" className="rum-room rum-legal">\n      <FalskFlade />\n`]];
  assert.equal(dobbelte(side, komp).length, 1);
  // og den råber ikke op når kun det ene sted har klassen
  const rent = [["app/falsk/page.tsx", `return (\n    <main id="main">\n      <FalskFlade />\n`]];
  assert.deepEqual(dobbelte(rent, komp), []);
});

test("positiv kontrol: teamguiden ejer sit eget layout", () => {
  assert.ok(komponenter.get("TeamguideFlade").has("rum-legal"), "fladen sætter rum-legal på sin rod");
  for (const f of ["app/(da)/(rummet)/personale/page.tsx", "app/(en)/(rummet)/en/personale/page.tsx"]) {
    const kilde = readFileSync(join(root, f), "utf8");
    const sidste = mainKlasser(kilde).at(-1);
    assert.ok(!sidste.has("rum-legal"), `${f}: <main> omkring guiden må ikke også sætte rum-legal`);
  }
});
