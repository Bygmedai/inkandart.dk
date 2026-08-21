import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");
const offer = readFileSync(join(root, "components/emerge/GiftCard.tsx"), "utf8");
const page = readFileSync(join(root, "app/gavekort/page.tsx"), "utf8");
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8");

test("gift cards keep live Shopify variants and skip Shop Pay interstitial", () => {
  const variants = [
    "53467075248456",
    "53467075281224",
    "53467080393032",
    "53467080425800",
    "53467080458568",
  ];
  for (const id of variants) {
    assert.match(commerce, new RegExp(id));
  }
  assert.match(commerce, /skip_shop_pay=true/);
  assert.match(commerce, /giftCartUrl/);
});

test("offer is still a server-rendered permalink handoff", () => {
  assert.match(offer, /giftCartUrl\(g\.variantId\)/);
  assert.match(offer, /data-kr=\{g\.kr\}/);
  assert.doesNotMatch(offer, /use client/);
  assert.doesNotMatch(page, /use client/);
});

test("gavekort is a first-class route", () => {
  assert.match(sitemap, /inkandart\.dk\/gavekort/);
  assert.match(page, /Har du fået et kort\?/);
});
