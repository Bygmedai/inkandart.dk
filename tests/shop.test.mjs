import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(join(root, "app/shop/page.tsx"), "utf8");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8");

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
