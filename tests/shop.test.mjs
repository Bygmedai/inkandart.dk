import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

test("/shop er ikke forældreløs — der går en dør ind fra forsiden", () => {
  // Målt 2026-08-21 mod produktion: /shop lå i sitemap.xml, men forsiden
  // havde NUL links til den (kun /gavekort, /flash, /blackbook). Google
  // kunne indeksere kataloget; et menneske kunne ikke finde det. En side
  // uden en dør er ikke en side, den er en URL.
  const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
  assert.match(scene, /href="\/shop"/, "forsiden skal linke til kataloget");
});

test("tilbage-linket er dækket af tap-reglen på ALLE undersider", () => {
  // QA #168: reglen hed `main p a[href="/"]` og antog dermed en <p>-forælder
  // ingen havde lovet. Nu er selektoren fri af markup — men den hviler på at
  // `href="/"` KUN bruges til tilbage-linket. Det er den antagelse vi måler.
  const css = readFileSync(join(root, "app/globals.css"), "utf8");
  assert.match(css, /main a\[href="\/"\]\s*\{[^}]*min-height:\s*24px/);

  const sider = readdirSync(join(root, "app"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      const her = join(root, "app", d.name, "page.tsx");
      const under = readdirSync(join(root, "app", d.name), { withFileTypes: true })
        .filter((x) => x.isDirectory())
        .map((x) => join(root, "app", d.name, x.name, "page.tsx"));
      return [her, ...under];
    })
    .filter((f) => existsSync(f));

  assert.ok(sider.length >= 7, `forventede undersider, fandt ${sider.length}`);
  for (const f of sider) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/href="\/"/g)) {
      const efter = src.slice(m.index, m.index + 90);
      assert.match(
        efter, /←/,
        `${f.split("/app/")[1]}: et href="/" der ikke er tilbage-linket — ` +
          "tap-reglen ville også ramme det; genovervej selektoren"
      );
    }
  }
});
