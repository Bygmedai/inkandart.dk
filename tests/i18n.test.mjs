import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, localePath, alternates, t } from "../lib/i18n.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const redirects = readFileSync(join(root, "lib/redirects.ts"), "utf8");
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8");
const daPage = readFileSync(join(root, "app/(emerge)/walk-in/page.tsx"), "utf8");
const enPage = readFileSync(join(root, "app/(emerge)/en/walk-in/page.tsx"), "utf8");
const sw = readFileSync(join(root, "components/i18n/LangSwitch.tsx"), "utf8");

test("dansk bor på roden, engelsk på /en — ingen rute er flyttet", () => {
  assert.deepEqual([...LOCALES], ["da", "en"]);
  assert.equal(localePath("da", "/walk-in"), "/walk-in");
  assert.equal(localePath("en", "/walk-in"), "/en/walk-in");
  assert.equal(localePath("en", "/"), "/en");
  assert.equal(existsSync(join(root, "app/(emerge)/walk-in/page.tsx")), true);
});

test("REGRESSION: en engelsk side vi HAR bygget må ikke 308'es væk", () => {
  // Redirects kører før routing i Next. Bliver reglen stående, er siden uopnåelig.
  assert.doesNotMatch(redirects, /slashPair\("\/en\/walk-in"/);
  assert.doesNotMatch(redirects, /from: "\/en\/walk-in\//);
});

test("ruter vi IKKE har bygget endnu 308'er stadig — ingen halve huller", () => {
  // /en/flash findes ikke som side → skal blive ved med at 308'e.
  assert.match(redirects, /slashPair\("\/en\/flash"/);
  assert.match(redirects, /slashPair\("\/en\/gavekort"/);
});

test("S574 REGRESSION: en bygget EN-side må ALDRIG have en redirect-række", () => {
  // Vildes fund 30/8: /en/aftercare og /en/privatlivspolitik var bygget,
  // udrullet — og umulige at nå, fordi to glemte rækker i redirects.ts
  // stadig 308'ede dem. Next kører redirects FØR routing, så siden kan
  // aldrig vises. Ingen test var rød; ingen build fejlede.
  //
  // CLAUDE.md siger reglen: «en engelsk rute holder op med at 308'e i
  // samme commit som siden findes.» Den blev håndhævet af en liste over
  // ruter, og en liste glemmer. Nu udledes den af hvad der FAKTISK
  // ligger i app/(rummet)/en/ — så den kan ikke glemme.
  const enDir = join(root, "app/(rummet)/en");
  const ruter = [];
  const gaa = (dir, sti) => {
    for (const navn of readdirSync(dir)) {
      const p = join(dir, navn);
      if (statSync(p).isDirectory()) gaa(p, `${sti}/${navn}`);
      else if (navn === "page.tsx" && sti) ruter.push(sti);
    }
  };
  gaa(enDir, "");

  assert.ok(ruter.length >= 5, `forventede byggede EN-sider, fandt ${ruter.length}`);
  for (const rute of ruter) {
    // Dynamiske segmenter ([id]) har ingen egen redirect-række.
    if (rute.includes("[")) continue;
    const re = new RegExp(`slashPair\\("/en${rute.replace(/[.*+?^$()|[\]\\]/g, "\\$&")}"`);
    assert.doesNotMatch(
      redirects,
      re,
      `/en${rute} ER bygget, men 308'es stadig i lib/redirects.ts — siden kan aldrig vises`,
    );
  }
});

test("hreflang er gensidigt og har x-default", () => {
  const a = alternates("/walk-in");
  assert.equal(a.languages["da-DK"], "/walk-in");
  assert.equal(a.languages["en"], "/en/walk-in");
  assert.equal(a.languages["x-default"], "/walk-in");
  assert.match(daPage, /alternates\("\/walk-in"\)/);
  assert.match(enPage, /alternates\("\/walk-in"\)/);
  assert.match(enPage, /canonical: "\/en\/walk-in"/);
});

test("begge sprog står i sitemap", () => {
  assert.match(sitemap, /inkandart\.dk\/walk-in"/);
  assert.match(sitemap, /inkandart\.dk\/en\/walk-in"/);
});

test("sprogskifteren peger på SAMME side, ikke på forsiden", () => {
  assert.match(sw, /localePath\(other, path\)/);
  assert.doesNotMatch(sw, /href="\/"/);
  assert.match(sw, /hrefLang=\{other\}/);
  assert.match(sw, /aria-label=/);
  assert.match(daPage, /<LangSwitch lang="da" path="\/walk-in" \/>/);
  assert.match(enPage, /<LangSwitch lang="en" path="\/walk-in" \/>/);
});

test("engelsk er en genskrivning, ikke en maskinoversættelse", () => {
  const da = t("da").walkin, en = t("en").walkin;
  assert.notEqual(da.title, en.title);
  assert.equal(en.title, "Two small ones. Tonight.");
  // Det praktiske skal derimod være præcist — prisen og adressen er ens.
  assert.match(en.lede("900", "Larsbjørnsstræde 13"), /900 DKK/);
  assert.match(en.lede("900", "Larsbjørnsstræde 13"), /Larsbjørnsstræde 13/);
  assert.equal(en.steps.length, da.steps.length);
});

test("den engelske side er mærket lang=en", () => {
  assert.match(enPage, /lang="en"/);
  assert.doesNotMatch(enPage, /lang="da"/);
});

test("hegnet er dybt — ordbøgerne har samme form hele vejen ned", () => {
  // Første udgave mappede kun topniveauet; en manglende nestet nøgle slap
  // igennem. Fundet med negativ kontrol, ikke med held.
  const shape = (o) =>
    o && typeof o === "object" && !Array.isArray(o)
      ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, shape(o[k])]))
      : typeof o;
  assert.deepEqual(shape(t("en")), shape(t("da")));
});

test("S574 sprogdøren står hvor den kan ses — ikke kun nederst i footeren", () => {
  const nav = readFileSync(join(root, "components/rummet/Nav.tsx"), "utf8");
  const css = readFileSync(join(root, "components/rummet/rummet.css"), "utf8");
  const dør = readFileSync(join(root, "components/rummet/LangDoor.tsx"), "utf8");

  // Stevens fund 30/8: den fandtes, men stod som sidste led i footeren
  // efter telefon, betingelser, privatliv, FAQ, mail og Instagram.
  // En turist ruller ikke derned. Nu står den også i navigationen.
  assert.match(nav, /<LangDoor lang=\{lang\} variant="nav" \/>/);
  assert.equal(
    (nav.match(/variant="nav"/g) || []).length,
    2,
    "én i rooms-rækken (desktop) og én i headeren (mobil)",
  );

  // Begge udgaver følger husets egen 900px-grænse — aldrig begge synlige.
  assert.match(css, /\.rum-nav > \.rum-lang--nav \{ display: inline-flex; \}/);
  assert.match(css, /@media \(min-width: 900px\) \{\s*\.rum-nav > \.rum-lang--nav \{ display: none; \}/);

  // Trykmål: 44px som husets øvrige handlinger.
  const i = css.indexOf(".rum-lang--nav {");
  const krop = css.slice(i, css.indexOf("}", i));
  assert.match(krop, /min-height:\s*44px/);
  assert.match(krop, /min-width:\s*44px/);

  // Den korte form i navigationen, den lange i footeren.
  assert.match(dør, /kort = other === "en" \? "EN" : "DA"/);
  assert.match(dør, /variant === "nav" \? kort : t\(lang\)\.otherLangName/);

  // Og reglen fra før består: en dør der lyver er værre end ingen dør.
  assert.match(dør, /enExists\(bare\)/);
});
