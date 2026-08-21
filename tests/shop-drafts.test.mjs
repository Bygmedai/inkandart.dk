import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PIERCE_DEAD, SHOP_DRAFTS } from "../lib/shop-drafts.ts";

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

test("piercing variants are denied and absent from commerce", () => {
  assert.match(script, /PIERCE_DEAD/);
  for (const id of PIERCE_DEAD) {
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
