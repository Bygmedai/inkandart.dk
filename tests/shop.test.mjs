import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(join(root, "app/shop/page.tsx"), "utf8");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8");
const css = readFileSync(join(root, "app/globals.css"), "utf8");

test("/shop er en rigtig rute med canonical og plads i sitemap", () => {
  assert.match(page, /alternates: \{ canonical: "\/shop" \}/);
  assert.match(sitemap, /inkandart\.dk\/shop/);
});

test("prints uden live-variant får ALDRIG en købshandling (rails §4)", () => {
  // Købslinket er gated bag `p.live && p.variantId` — en draft kan ikke
  // rendere en knap der ikke kan købe.
  assert.match(page, /\{p\.live && p\.variantId \? \(/);
  // Og skelettet i commerce.ts starter ærligt: alle tre er live: false.
  const blok = commerce.slice(commerce.indexOf("SHOP_PRINTS"));
  const lives = [...blok.matchAll(/live: (true|false)/g)].map((m) => m[1]);
  assert.equal(lives.length, 3, "tre prints i skelettet");
  // Når P3 + prisgaten åbner varerne, flippes de til true — testen kræver
  // kun at live:true ALTID følges af et variantId i samme objekt.
  const objekter = blok.split(/\},\s*\{/);
  for (const o of objekter.slice(0, 4)) {
    if (/live: true/.test(o)) {
      assert.match(o, /variantId: "\d{14}"/, "live:true kræver variantId");
    }
  }
});

test("dørene peger på flader der findes — ingen genopbygning", () => {
  for (const door of ["/gavekort", "/walk-in", "/flash"]) {
    assert.match(page, new RegExp(`href: "${door}"`), `dør til ${door}`);
  }
  // Kridtet genbruges som komponent (min egen) — ikke kopieret markup.
  assert.match(page, /<KerbReservation \/>/);
});

test("siden er en server-komponent uden klient-JS (rails §5)", () => {
  assert.doesNotMatch(page, /^\s*["']use client["']/m);
});

test("småteksten i gaden holder AA-kontrast — opacity må ikke skride ned igen", () => {
  // QA-blocker på #154: «Snart»-chippen stod med alpha 0.4 ved 10px — målt
  // ~3.2:1 mod kortets near-black; AA kræver 4.5:1 under 18px. Testen måler
  // reglen (alpha-værdien), ikke den præcise streng, så en omformatering
  // overlever — men en dæmpning under 0.6 går rød.
  const alphaOf = (selector) => {
    const m = css.match(
      new RegExp(`\\.${selector}\\s*\\{[^}]*color:\\s*rgba\\(232,\\s*224,\\s*213,\\s*(0?\\.\\d+)\\)`)
    );
    assert.ok(m, `${selector} mangler sin rgba-farve i globals.css`);
    return Number(m[1]);
  };
  // Gulv 0.58 = kridt-præcedensen fra #149: målt ≥5.6:1 på near-black —
  // margin over AA-kravet, også på dørens lidt lysere baggrund.
  for (const s of ["gade__print-snart", "gade__door-linje", "gade__afsnit-label", "gade__note"]) {
    assert.ok(alphaOf(s) >= 0.58, `${s}: alpha ${alphaOf(s)} er under kontrast-gulvet`);
  }
});
