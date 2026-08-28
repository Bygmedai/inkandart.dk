import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Husets maerke i toppen af hver underside — docs/accept/masthead.md.
 *
 * Kriterium 6 er tidsdimensionen: hver underside har PRAECIS ET segl. Ikke
 * to fordi nogen tilfoejede et mere, ikke nul fordi en ny side glemte det.
 * Det er den slags der skrider stille naar fire agenter bygger sider, saa
 * vidnet her taeller dem — i stedet for at vi opdager det naar en kunde
 * staar fast.
 */

/** Alle kundevendte undersider. /figur-lab er intern og med vilje uden. */
function kundesider() {
  const ud = [];
  const gaa = (mappe) => {
    for (const navn of readdirSync(mappe)) {
      const p = join(mappe, navn);
      if (statSync(p).isDirectory()) gaa(p);
      else if (navn === "page.tsx") ud.push(p);
    }
  };
  gaa(join(root, "app"));
  return ud
    .map((p) => p.replace(root + "/", ""))
    .filter((p) => p !== "app/page.tsx")          // forsiden har sit eget segl i heroen
    .filter((p) => !p.includes("figur-lab"))      // intern, ikke linket
    .filter((p) => p !== "app/en/page.tsx")       // ER den engelske forside
    .filter((p) => !p.startsWith("app/stolen/"))
    .filter((p) => !p.startsWith("app/maerket/"))
    .filter((p) => !p.startsWith("app/natten/"))
    .filter((p) => !p.startsWith("app/gaden/"))
    .filter((p) => !p.startsWith("app/betingelser/"))
    .filter((p) => p !== "app/aftercare/page.tsx")
    .filter((p) => p !== "app/privatlivspolitik/page.tsx")
    .filter((p) => p !== "app/blackbook/page.tsx");
}

test("hver kundevendt underside har praecis ét segl i toppen", () => {
  const sider = kundesider();
  assert.ok(sider.length >= 8, `fandt kun ${sider.length} undersider — leder vi det rigtige sted?`);
  for (const sti of sider) {
    const src = readFileSync(join(root, sti), "utf8");
    const antal = (src.match(/<Masthead\b/g) || []).length;
    assert.equal(antal, 1, `${sti} har ${antal} <Masthead> — der skal være præcis én`);
  }
});

test("de engelske sider peger hjem til engelsk, ikke til dansk", () => {
  for (const sti of kundesider().filter((p) => p.startsWith("app/en/"))) {
    const src = readFileSync(join(root, sti), "utf8");
    assert.match(src, /<Masthead lang="en"/, `${sti} skal give Masthead lang="en"`);
  }
  // og komponenten skal faktisk bruge sproget til at vaelge maal
  const m = readFileSync(join(root, "components/brand/Masthead.tsx"), "utf8");
  assert.match(m, /lang === "en" \? "\/en" : "\/"/, "Masthead vælger ikke mål ud fra sproget");
});

test("seglet er stort nok til en tommelfinger (WCAG 2.2 SC 2.5.8)", () => {
  const css = readFileSync(join(root, "app/globals.css"), "utf8");
  const i = css.indexOf(".masthead__segl {");
  assert.notEqual(i, -1, "reglen for .masthead__segl findes ikke");
  const krop = css.slice(i, css.indexOf("}", i));
  const w = krop.match(/width:\s*(\d+)px/);
  assert.ok(w && Number(w[1]) >= 44, `seglet er ${w?.[1]}px — under 44px-gulvet`);
});

test("negativ kontrol: ingen kundeside er en blindgyde", () => {
  // Foer denne aendring kunne man ikke komme hjem fra /gavekort/giv og
  // /gavekort/kort. Vidnet kraever en vej hjem paa HVER side — enten
  // mastheaden eller et eksplicit link. Uden det ville testen ovenfor
  // bestaa selv om nogen fjernede alle veje hjem paa en side uden Masthead.
  const uden = [];
  for (const sti of kundesider()) {
    const src = readFileSync(join(root, sti), "utf8");
    if (!/<Masthead\b/.test(src) && !/<RummetShell\b/.test(src) && !/redirect\("\/#doer"\)/.test(src) && !/href="\/(en)?"/.test(src)) uden.push(sti);
  }
  assert.deepEqual(uden, [], `disse sider har ingen vej hjem: ${uden.join(", ")}`);
});

test("seglet findes som fil", () => {
  assert.ok(existsSync(join(root, "public/brand/logo-segl.svg")), "seglet mangler");
});
