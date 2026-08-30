import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Ingen engelsk side må linke til en /en-rute der ikke findes.
 *
 * `app/en/[...slug]/route.ts` svarer 410 GONE på ukendte engelske stier —
 * bevidst, så vi ikke folder dem stille ind i den danske forside. Men det
 * betyder også at et link til /en/noget-vi-ikke-har-bygget er en DØD
 * handling (rails §4), ikke bare et tomt sted.
 *
 * Målt ved bygningen af /en/shop (S568): mine tre første døre pegede på
 * /en/gavekort, /en/flash og /en/blackbook — to af dem 410. Reglen er
 * «hellere dansk end 404»: peg på den danske side indtil ejeren porterer
 * sin egen.
 */
const enRuter = () => {
  const dir = join(root, "app/(emerge)/en");
  const ud = new Set(["/en"]);
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith("[")) continue;
    if (existsSync(join(dir, d.name, "page.tsx"))) ud.add(`/en/${d.name}`);
  }
  return ud;
};

const enSider = () => {
  const dir = join(root, "app/(emerge)/en");
  const ud = [];
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const f = d.isDirectory() ? join(dir, d.name, "page.tsx") : join(dir, d.name);
    if (f.endsWith("page.tsx") && existsSync(f)) ud.push(f);
  }
  return ud;
};

test("ingen engelsk side linker til en /en-rute der svarer 410", () => {
  const findes = enRuter();
  const sider = enSider();
  assert.ok(sider.length >= 2, `forventede engelske sider, fandt ${sider.length}`);
  for (const f of sider) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/href="(\/en\/[a-z0-9-]+)"/g)) {
      assert.ok(
        findes.has(m[1]),
        `${f.split("/app/")[1]} linker til ${m[1]}, som svarer 410 — ` +
          "peg på den danske side indtil ejeren porterer sin egen"
      );
    }
  }
});

test("negativ kontrol: hegnet ville fange en rute vi ikke har bygget", () => {
  const findes = enRuter();
  assert.equal(findes.has("/en/findes-ikke"), false);
  assert.equal(findes.has("/en/walk-in"), true, "walk-in ER bygget og skal tælle som levende");
});

/* ── S568, Haruki: hegnet flyttet fra testen ind i funktionen ──────────────
   Vildes test ovenfor læser kildetekst. Et computed localePath(lang, "/x")
   er usynligt for et regex — og præcis dét lod fire døde døre nå produktion
   på /en. Nu KAN localePath ikke pege på en rute der ikke findes.          */

test("REGRESSION: localePath kan ikke bygge en engelsk rute vi ikke har", async () => {
  const { localePath, EN_ROUTES } = await import("../lib/i18n.ts");
  // Målt i produktion 22/8: /en/gavekort og /en/blackbook svarede 410 GONE,
  // og forsiden /en linkede til dem fire gange.
  assert.equal(localePath("en", "/gavekort"), "/gavekort");
  assert.equal(localePath("en", "/blackbook"), "/blackbook");
  // De byggede ruter skal stadig blive engelske.
  assert.equal(localePath("en", "/walk-in"), "/en/walk-in");
  assert.equal(localePath("en", "/shop"), "/en/shop");
  assert.equal(localePath("en", "/"), "/en");
  // Dansk er upåvirket.
  assert.equal(localePath("da", "/gavekort"), "/gavekort");
  // Fragment og query overlever.
  assert.equal(localePath("en", "/#booking"), "/en#booking");
});

test("registeret matcher de sider der faktisk findes på disken", async () => {
  const { EN_ROUTES } = await import("../lib/i18n.ts");
  const dir = join(root, "app/(emerge)/en");
  const paa_disken = new Set(["/"]);
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith("[")) continue;
    if (existsSync(join(dir, d.name, "page.tsx"))) paa_disken.add(`/${d.name}`);
  }
  assert.deepEqual([...EN_ROUTES].sort(), [...paa_disken].sort(),
    "EN_ROUTES skal opdateres i samme PR som en /en-side bygges eller fjernes");
});
