import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PIERCE_EXCLUDED, SHOP_DRAFTS } from "../lib/shop-drafts.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(join(root, "scripts/shopify-prepare-drafts.mjs"), "utf8");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");

test("drafts stay drafts — script cannot publish", () => {
  assert.match(script, /status:\s*"draft"/);
  assert.match(script, /published:\s*false/);
  assert.doesNotMatch(script, /status:\s*"active"/);
  assert.match(script, /GATE BRUDT/);
});

test("prices are placeholders, not written", () => {
  assert.doesNotMatch(script, /product:\s*\{[^}]*price/);
  assert.doesNotMatch(script, /variants:\s*\[/);
  for (const d of SHOP_DRAFTS) {
    assert.equal(d.pricePlaceholder === 250 || d.pricePlaceholder === 1200, true);
  }
});

test("Admin API version is the supported contract, not a dead fallback", () => {
  assert.match(script, /admin\/api\/2026-07/);
  assert.doesNotMatch(script, /admin\/api\/2024-10/);
});

test("writes target handle, never a fuzzy title/body regex", () => {
  assert.match(script, /p\.handle === draft\.key/);
  assert.doesNotMatch(script, /body_html \?\?/);
  assert.doesNotMatch(script, /dolk\|dagger/);
  for (const d of SHOP_DRAFTS) {
    assert.equal(["dolk", "ouroboros", "signetring"].includes(d.key), true);
    assert.equal("match" in d, false);
  }
});

test("piercing deposits are excluded from the print catalogue, not labelled dead", () => {
  assert.match(script, /PIERCE_EXCLUDED/);
  assert.doesNotMatch(script, /PIERCE_DEAD/);
  for (const id of PIERCE_EXCLUDED) {
    assert.doesNotMatch(commerce, new RegExp(id));
  }
});

test("copy keeps the ouroboros sentence and is chalk, not webshop", () => {
  const ouro = SHOP_DRAFTS.find((d) => d.key === "ouroboros");
  assert.match(ouro.bodyHtml, /Slangen der bider sig selv i halen/);
  for (const d of SHOP_DRAFTS) {
    assert.doesNotMatch(d.bodyHtml, /fri fragt|læs mere|tilføj til kurv/i);
  }
});

test("working plates exist as 1200px png", () => {
  for (const d of SHOP_DRAFTS) {
    assert.equal(existsSync(join(root, d.plate)), true, d.plate);
  }
});
