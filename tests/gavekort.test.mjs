import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");
const offer = readFileSync(join(root, "components/emerge/GiftCard.tsx"), "utf8");
const page = readFileSync(join(root, "app/gavekort/page.tsx"), "utf8");
const giv = readFileSync(join(root, "app/gavekort/giv/page.tsx"), "utf8");
const kort = readFileSync(join(root, "app/gavekort/kort/page.tsx"), "utf8");
const tildig = readFileSync(join(root, "app/gavekort/til-dig/page.tsx"), "utf8");
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8");

test("gift cards keep live Shopify variants and skip Shop Pay interstitial", () => {
  const variants = [
    "53467075182920",
    "53467075215688",
    "53467075248456",
    "53467075281224",
    "53467080393032",
    "53467080425800",
    "53467080458568",
    "53467090420040",
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

test("gavekort does not send customers to the password-gated product page", () => {
  assert.doesNotMatch(offer, /GIFT_CARD_PRODUCT_URL/);
  assert.doesNotMatch(offer, /myshopify\.com\/products/);
  assert.doesNotMatch(page, /myshopify\.com\/products/);
  assert.doesNotMatch(giv, /myshopify\.com\/products/);
});

test("gavekort is a first-class route", () => {
  assert.match(sitemap, /inkandart\.dk\/gavekort/);
  assert.match(sitemap, /inkandart\.dk\/gavekort\/giv/);
  assert.match(sitemap, /inkandart\.dk\/gavekort\/til-dig/);
  assert.match(page, /Har du fået et kort\?/);
});

test("giving the card stays on our site", () => {
  assert.match(offer, /\/gavekort\/giv/);
  assert.match(giv, /method="get"/);
  assert.match(giv, /action="\/gavekort\/kort"/);
  assert.match(kort, /GiftNoteCard/);
  assert.match(tildig, /Det venter på dig/);
  assert.doesNotMatch(kort, /use client/);
});

test("homepage relic is a single link to /gavekort, not a checkout", () => {
  const relic = readFileSync(join(root, "components/emerge/GiftRelic.tsx"), "utf8");
  // S568: linket følger nu sproget (/gavekort på dansk, /en/gavekort på engelsk).
  // Intentionen er uændret — relikviet er en DØR til gavekortsiden, ikke en checkout.
  assert.match(relic, /localePath\(lang, "\/gavekort"\)/);
  assert.doesNotMatch(relic, /giftCartUrl/);
  assert.doesNotMatch(relic, /\/cart\//);
  assert.doesNotMatch(relic, /use client/);
});

test("note card grows with the greeting — credit-card lock is the offer voucher only", () => {
  const css = readFileSync(join(root, "app/globals.css"), "utf8");
  const card = readFileSync(join(root, "components/emerge/GiftNoteCard.tsx"), "utf8");
  const voucher = readFileSync(join(root, "components/emerge/GiftVoucher.tsx"), "utf8");
  const offerBlock = css.slice(
    css.indexOf(".gift-voucher {"),
    css.indexOf(".gift-voucher__inset"),
  );
  assert.match(offerBlock, /aspect-ratio:\s*1\.586\s*\/\s*1/);
  const note = css.slice(css.indexOf(".gift-voucher--note {"));
  const noteRule = note.slice(0, note.indexOf(".gift-voucher--note .gift-voucher__inset"));
  assert.match(noteRule, /aspect-ratio:\s*auto/);
  assert.match(note, /\.gift-voucher--note \.gift-voucher__inset\s*\{[^}]*position:\s*static/);
  assert.match(card, /gift-note__foot/);
  assert.match(card, /gift-note__code/);
  assert.doesNotMatch(voucher, /gift-voucher--note/);
  assert.match(css, /@media print[\s\S]*\.gift-voucher--note[\s\S]*break-inside:\s*avoid/);
});

test("gavekort ships its own OG image (exact type, not a product shot)", () => {
  const og = readFileSync(join(root, "app/gavekort/opengraph-image.tsx"), "utf8");
  assert.match(og, /ImageResponse/);
  assert.match(og, /Giv blæk videre/);
  assert.match(og, /1200/);
  assert.doesNotMatch(og, /woff2/);
});
