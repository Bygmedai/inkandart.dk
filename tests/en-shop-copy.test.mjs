import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

test("S579 shop: EN siger Gift card og Add to cart, ikke Gavekort og Læg i kurv", async () => {
  const { t } = await import("../lib/i18n.ts");
  assert.equal(t("da").rummet.giftCard, "Gavekort");
  assert.equal(t("en").rummet.giftCard, "Gift card");
  assert.equal(t("da").rummet.addToCart, "Læg i kurv");
  assert.equal(t("en").rummet.addToCart, "Add to cart");
  assert.match(t("en").rummet.shipping, /studio/i);
  assert.doesNotMatch(t("en").rummet.shipping, /house|Huset/i);

  const gave = read("components/rummet/GavekortKoeb.tsx");
  assert.match(gave, /t\(lang\)\.rummet/);
  assert.match(gave, /c\.giftCard/);
  assert.doesNotMatch(gave, />Gavekort</);
  assert.match(read("components/rummet/MaerketFlade.tsx"), /<GavekortKoeb lang=\{lang\}/);

  for (const f of ["components/rummet/ProduktFlade.tsx", "components/rummet/VaerkFlade.tsx"]) {
    const src = read(f);
    assert.match(src, /c\.addToCart/, `${f}: købsknappen skal hente ordet i ordbogen`);
    assert.match(src, /c\.shipping/, `${f}: fragten skal hente ordet i ordbogen`);
    assert.doesNotMatch(src, /Læg i kurv/, `${f}: dansk købstekst må ikke være hardkodet`);
    assert.doesNotMatch(src, /Fri fragt fra 499/, `${f}: dansk fragt må ikke være hardkodet`);
  }
});
