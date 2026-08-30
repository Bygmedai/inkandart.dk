import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(join(root, "app/(emerge)/shop/page.tsx"), "utf8");
const commerce = readFileSync(join(root, "lib/commerce.ts"), "utf8");
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8");
const css = readFileSync(join(root, "app/globals.css"), "utf8");

test("/shop er en rigtig rute med canonical og plads i sitemap", () => {
  // hreflang kom til (S569): parret var ensrettet — /en/shop pegede paa
  // begge sprog, /shop pegede ikke tilbage. Canonical staar stadig.
  assert.match(page, /canonical: "\/shop"/);
  assert.match(page, /\.\.\.alternates\("\/shop"\)/, "/shop mangler hreflang mod den engelske udgave");
  assert.match(sitemap, /inkandart\.dk\/shop/);
});

test("REGRESSION: /en/shop har egen linje i sitemap.xml, ikke kun /shop", () => {
  // /en/shop er en rigtig, indekserbar side (canonical: /en/shop, ingen
  // robots-noindex) — men stod ikke i app/sitemap.ts. Testen ovenfor
  // matcher kun understrengen "inkandart.dk/shop", som IKKE findes i
  // ".../en/shop" (der ligger "/en" imellem), så den fangede ikke hullet.
  assert.match(sitemap, /inkandart\.dk\/en\/shop"/);
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

test("salgsdøren er ikke forældreløs — der går en dør ind fra huset", () => {
  // Rummet M1 skrev: «Gaden bærer stadig døren til /shop indtil M2 bygger
  // væggen.» M2 HAR bygget væggen — Mærket findes med hylde, produktside og
  // kurv. Betingelsen i den gamle påstand er dermed indfriet, og døren flyttes
  // (S573). Den må ikke pege på /shop igen: Emerge-fladen annoncerer walk-in
  // med pris, og K7 siger at det tal kun findes fysisk i og uden for butikken.
  const nav = readFileSync(join(root, "components/rummet/Nav.tsx"), "utf8");
  // S574: Gadens døre bor i GadenFlade (én komponent, to sprog).
  const gaden = readFileSync(join(root, "components/rummet/GadenFlade.tsx"), "utf8");
  assert.match(nav, /href: "\/maerket"/, "Huset skal have en dør til Mærket");
  assert.match(gaden, /localePath\(lang, "\/maerket"\)/, "Gaden skal åbne Mærket");
});

test("tilbage-linket er dækket af tap-reglen på ALLE undersider", () => {
  // QA #168: reglen hed `main p a[href="/"]` og antog dermed en <p>-forælder
  // ingen havde lovet. Nu er selektoren fri af markup — men den hviler på at
  // `href="/"` KUN bruges til tilbage-linket. Det er den antagelse vi måler.
  const css = readFileSync(join(root, "app/globals.css"), "utf8");
  assert.match(css, /main a\[href="\/"\]\s*\{[^}]*min-height:\s*24px/);

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
          "tap-reglen ville også ramme det; genovervej selektoren"
      );
    }
  }
});

test("prints-væggen er ærligt lukket: demo-varerne er live:false", () => {
  // S574 (Steven, 30/8): Dolk/Ouroboros/Signetring er DEMO-varer — Sonja
  // lægger ægte varer op. Shopify-status DRAFT samme dag, målt 410 på alle
  // tre cart-permalinks (negativ kontrol 410, gavekort 302). Testen vender:
  // før håndhævede den «alle tre live», nu håndhæver den at ingen demo-vare
  // kan få en købsknap. Når Sonjas rigtige varer kommer, skrives testen om
  // sammen med kataloget — ikke før.
  const start = commerce.indexOf("export const SHOP_PRINTS");
  assert.ok(start > 0, "SHOP_PRINTS-listen findes");
  const blok = commerce.slice(start, commerce.indexOf("\n];", start));
  assert.doesNotMatch(blok, /live: true/, "demo-varer må ikke være live");
  assert.match(blok, /NEDLAGT SOM DEMO 2026-08-30|S574/, "kendelsen står ved varerne");
});

test("REGRESSION: den danske væg-blok læser fra ordbogen, ikke fra markup", () => {
  // Sprogtjek S570: rubrikken var flyttet til `c.wallTitle`, mens etiket,
  // intro, «Snart» og noten blev stående hårdkodet i app/shop/page.tsx. Da
  // varerne gik live sagde /en/shop «On the wall.» og /shop stod stadig med
  // «De hænger her, når de er klar». Drift ét ord ad gangen er stadig drift.
  const vaeg = page.slice(page.indexOf("gade__prints") - 900);
  for (const noegle of ["c.wallLabel", "c.wallTitle", "c.wallIntro", "c.soon", "c.note", "c.noteLink"]) {
    assert.ok(vaeg.includes(noegle), `væg-blokken bruger ${noegle}`);
  }
  // Negativ kontrol: den gamle hårdkodede sætning må ikke være i filen.
  assert.doesNotMatch(page, /De hænger her, når de er klar/);
  assert.doesNotMatch(page, /<span className="gade__print-snart">Snart</);
});
