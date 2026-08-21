import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");
const relic = readFileSync(join(root, "components/emerge/WalkinRelic.tsx"), "utf8");
const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
const page = readFileSync(join(root, "app/walk-in/page.tsx"), "utf8");
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8");

test("walk-in 900 uses the live Shopify variant and skip_shop_pay", () => {
  assert.match(commerce, /53492552827208/);
  assert.match(commerce, /2-sma-tattoos-walk-in-tilbud/);
  assert.match(commerce, /walkinCartUrl/);
  assert.match(commerce, /skip_shop_pay=true/);
});

test("hero relic is a checkout handoff, not a hop to /walk-in", () => {
  assert.match(relic, /walkinCartUrl\(\)/);
  assert.doesNotMatch(relic, /href="\/walk-in"/);
  assert.doesNotMatch(relic, /use client/);
  assert.match(scene, /WalkinRelic/);
  assert.match(scene, /walkin-relic-slot/);
});

test("walk-in is a first-class route for QR", () => {
  assert.match(sitemap, /inkandart\.dk\/walk-in/);
  assert.match(page, /To små/);
  assert.match(page, /walkinCartUrl/);
});
