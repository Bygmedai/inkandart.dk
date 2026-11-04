import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * S639 (Steven, 4/11 2026): Ink and Arts Shopify er lukket. Shop, gavekort,
 * depositum, walk-in, fredagsflash, nattespot og tilmeldingen solgte eller
 * skrev gennem Shopify. Hegnet her holder fast i, at ingen kunde kan lande
 * på en død kasse: ingen synlig flade linker dertil, og de gamle stier
 * 308'er til et levende sted.
 */
const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const LUKKET = ["/shop", "/en/shop", "/maerket", "/gavekort", "/en/gavekort", "/walk-in", "/en/walk-in", "/flash", "/en/flash", "/blackbook", "/en/blackbook"];

test("hver lukket sti har et 308-par til et levende sted", () => {
  const r = read("lib/redirects.ts");
  for (const sti of LUKKET) {
    assert.match(r, new RegExp(`slashPair\\("${sti.replace(/\//g, "\\/")}", "\\/`), `${sti} mangler sin 308`);
  }
  assert.doesNotMatch(r, /destination: "https:\/\/inkandart\.dk\/shop"/, "shop.inkandart.dk må ikke pege på /shop");
});

test("nav'en har ingen Shop-dør og ingen kurv", () => {
  assert.doesNotMatch(read("lib/i18n.ts"), /\{ href: "\/shop", label:/);
  const nav = read("components/rummet/Nav.tsx");
  assert.doesNotMatch(nav, /CartIndicator/);
  assert.doesNotMatch(nav, /<Blackbook/);
});

test("ingen levende Rummet-flade linker til shop eller gavekort", () => {
  const filer = ["components/rummet/GadenFlade.tsx", "components/rummet/ArtistKort.tsx", "components/rummet/NattenFlade.tsx",
    "app/(da)/(rummet)/stolen/[id]/page.tsx", "app/(en)/(rummet)/en/stolen/[id]/page.tsx"];
  for (const f of filer) {
    assert.doesNotMatch(read(f), /["'`(]\/(en\/)?(shop|gavekort)\b/, `${f} linker stadig til en lukket flade`);
  }
});

test("tak-siderne sender ikke kunden i en lukket kasse", () => {
  for (const f of ["app/(da)/(rummet)/booking/tak/page.tsx", "app/(en)/(rummet)/en/booking/tak/page.tsx"]) {
    const s = read(f);
    assert.doesNotMatch(s, /cartUrl\(|verificerDepositum|DepositumTjek/, `${f} taler stadig med Shopify`);
  }
});

test("tilmeldingsdøren er slukket — den skrev til Shopify", () => {
  assert.match(read("components/rummet/Shell.tsx"), /door = false/);
  assert.doesNotMatch(read("app/(da)/(rummet)/page.tsx"), /<Door/);
  assert.doesNotMatch(read("components/rummet/NattenFlade.tsx"), /<Door|nattespotCartUrl/);
});

test("sitemappet inviterer ikke til lukkede sider", () => {
  const sm = read("app/sitemap.ts");
  for (const sti of ["/shop", "/gavekort", "/walk-in", "/flash", "/blackbook"]) {
    assert.doesNotMatch(sm, new RegExp(`inkandart\\.dk(\\/en)?${sti}`), `${sti} står stadig i sitemap`);
  }
});

test("negativ kontrol: hegnet ville fange et shop-link", () => {
  assert.match('<a href={localePath(lang, "/shop")}>', /["'`(]\/(en\/)?(shop|gavekort)\b/);
});
