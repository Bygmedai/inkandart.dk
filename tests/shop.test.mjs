import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nextRedirects } from "../lib/redirects.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const page = read("app/(da)/(rummet)/shop/page.tsx");
const pageEn = read("app/(en)/(rummet)/en/shop/page.tsx");
const flade = read("components/rummet/MaerketFlade.tsx");
const sitemap = read("app/sitemap.ts");
const commerce = read("lib/commerce.ts");
const css = read("app/globals.css");

const emergeDa = "app/(da)/(emerge)/shop/page.tsx";
const emergeEn = "app/(en)/(emerge)/en/shop/page.tsx";
const oldMaerketDa = "app/(da)/(rummet)/maerket/page.tsx";
const oldMaerketEn = "app/(en)/(rummet)/en/maerket/page.tsx";

function redirectsFrom(source) {
  return nextRedirects.filter((r) => r.source === source || r.source === `${source}/`);
}

test("/shop er Rummets hylde — MaerketFlade, ikke Emerge-gaden", () => {
  assert.equal(existsSync(join(root, "app/(da)/(rummet)/shop/page.tsx")), true);
  assert.equal(existsSync(join(root, "app/(en)/(rummet)/en/shop/page.tsx")), true);
  assert.match(page, /MaerketFlade/);
  assert.match(page, /RummetShell/);
  assert.match(page, /hentHylden/);
  assert.match(page, /canonical: "\/shop"/);
  assert.match(page, /\.\.\.alternates\("\/shop"\)/);
  assert.match(pageEn, /MaerketFlade/);
  assert.match(pageEn, /<RummetShell lang="en"/);
  assert.match(pageEn, /canonical: "\/en\/shop"/);
  assert.match(sitemap, /inkandart\.dk\/shop"/);
  assert.match(sitemap, /inkandart\.dk\/en\/shop"/);
  assert.doesNotMatch(sitemap, /inkandart\.dk\/maerket"/);
  assert.doesNotMatch(sitemap, /inkandart\.dk\/en\/maerket"/);
});

test("Emerge-shoppen er død som kundens /shop — filerne findes ikke", () => {
  assert.equal(existsSync(join(root, emergeDa)), false, "dansk Emerge /shop lever stadig");
  assert.equal(existsSync(join(root, emergeEn)), false, "engelsk Emerge /shop lever stadig");
  assert.equal(existsSync(join(root, oldMaerketDa)), false, "/maerket-siden skal 308'e, ikke eksistere");
  assert.equal(existsSync(join(root, oldMaerketEn)), false, "/en/maerket-siden skal 308'e, ikke eksistere");
});

test("/maerket 308'er til /shop — også undersider, query bevares af Next", () => {
  for (const [from, to] of [
    ["/maerket", "/shop"],
    ["/en/maerket", "/en/shop"],
  ]) {
    const rows = redirectsFrom(from);
    assert.ok(rows.length >= 2, `${from} mangler slash-par`);
    for (const r of rows) {
      assert.equal(r.destination, to, `${r.source} → ${r.destination}`);
      assert.equal(r.statusCode, 308);
    }
  }
  const sub = nextRedirects.filter((r) => r.source.includes("/maerket/:path*"));
  assert.ok(sub.length >= 2, "undersider /maerket/:path* skal 308'e");
  for (const r of sub) {
    assert.match(r.destination, /\/shop\/:path\*/);
    assert.equal(r.statusCode, 308);
  }
  // Negativ: den levende hylde må ikke 308'es væk.
  assert.equal(redirectsFrom("/shop").length, 0);
  assert.equal(redirectsFrom("/en/shop").length, 0);
});

test("nav-døren hedder Shop og peger på /shop — ikke Mærket, ikke Hylden", async () => {
  const { t } = await import("../lib/i18n.ts");
  for (const lang of ["da", "en"]) {
    const shop = t(lang).rummet.rooms.find((r) => r.label === "Shop");
    assert.ok(shop, `${lang}: nav mangler etiketten Shop`);
    assert.equal(shop.href, "/shop");
    assert.notEqual(shop.href, "/maerket");
    assert.notEqual(shop.label, "Mærket");
    assert.notEqual(shop.label, "Hylden");
    assert.notEqual(shop.label, "Gaden sælger");
    assert.notEqual(shop.label, "The street sells");
  }
  const nav = read("components/rummet/Nav.tsx");
  assert.match(nav, /c\.rooms\.map\(/);
  const navSynlig = nav.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(navSynlig, /Mærket|Hylden|Gaden sælger|The street sells/);
  const gaden = read("components/rummet/GadenFlade.tsx");
  assert.match(gaden, /localePath\(lang, "\/shop"\)/);
  assert.doesNotMatch(gaden, /"\/maerket"/);
});

test("Emerge-shop-copy er væk fra kundens flade", () => {
  for (const src of [page, pageEn, flade]) {
    assert.doesNotMatch(src, /Gaden sælger|The street sells|gaden sælger|street sells/i);
    assert.doesNotMatch(src, /DepositumRaekke|KerbReservation|SHOP_PRINTS|PIERCINGS|FLASH_DEPOSITS/);
    assert.doesNotMatch(src, /gade__print-snart|gade__doors|Two small ones/);
    assert.doesNotMatch(src, /href: "\/walk-in"/);
  }
  // Walk-in-døren med pris hører ikke til hylden.
  assert.doesNotMatch(page + pageEn + flade, /900/);
  // Gavekort må blive — de står på Rummet-hylden i dag.
  assert.match(flade, /GavekortKoeb/);
});

test("prints uden live-variant får ALDRIG en købshandling (rails §4)", () => {
  const start = commerce.indexOf("export const SHOP_PRINTS");
  assert.ok(start > 0, "SHOP_PRINTS-listen findes");
  const blok = commerce.slice(start, commerce.indexOf("\n];", start));
  assert.doesNotMatch(blok, /live: true/, "demo-varer må ikke være live");
  assert.match(blok, /NEDLAGT SOM DEMO 2026-08-30|S574/, "kendelsen står ved varerne");
  // Og de hænger ikke som «Snart» på kundens hylde.
  assert.doesNotMatch(page + pageEn + flade, /c\.soon|gade__print-snart/);
});

test("siden er en server-komponent uden klient-JS (rails §5)", () => {
  assert.doesNotMatch(page, /^\s*["']use client["']/m);
  assert.doesNotMatch(pageEn, /^\s*["']use client["']/m);
});

test("småteksten i gaden holder AA-kontrast — opacity må ikke skride ned igen", () => {
  const alphaOf = (selector) => {
    const m = css.match(
      new RegExp(`\\.${selector}\\s*\\{[^}]*color:\\s*rgba\\(232,\\s*224,\\s*213,\\s*(0?\\.\\d+)\\)`),
    );
    assert.ok(m, `${selector} mangler sin rgba-farve i globals.css`);
    return Number(m[1]);
  };
  for (const s of ["gade__print-snart", "gade__door-linje", "gade__afsnit-label", "gade__note"]) {
    assert.ok(alphaOf(s) >= 0.58, `${s}: alpha ${alphaOf(s)} er under kontrast-gulvet`);
  }
});

test("tilbage-linket er dækket af tap-reglen på ALLE undersider", () => {
  const cssSrc = read("app/globals.css");
  assert.match(cssSrc, /main a\[href="\/"\]\s*\{[^}]*min-height:\s*24px/);

  const sider = [];
  const gaa = (mappe) => {
    for (const navn of readdirSync(mappe)) {
      const p = join(mappe, navn);
      if (statSync(p).isDirectory()) gaa(p);
      else if (navn === "page.tsx") sider.push(p);
    }
  };
  gaa(join(root, "app"));

  assert.ok(sider.length >= 7, `forventede undersider, fandt ${sider.length}`);
  for (const f of sider) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/href="\/"/g)) {
      const efter = src.slice(m.index, m.index + 90);
      assert.match(
        efter, /←/,
        `${f.split("/app/")[1]}: et href="/" der ikke er tilbage-linket — ` +
          "tap-reglen ville også ramme det; genovervej selektoren",
      );
    }
  }
});

test("negativ kontrol: hegnet bliver rødt hvis Emerge-shoppen kommer tilbage", () => {
  assert.equal(existsSync(join(root, emergeDa)), false);
  assert.doesNotMatch(flade, /localePath\(lang, "\/maerket"\)/);
  const i18n = read("lib/i18n.ts");
  assert.doesNotMatch(i18n, /\{ href: "\/maerket", label: "Shop" \}/);
  assert.match(i18n, /\{ href: "\/shop", label: "Shop" \}/);
});
