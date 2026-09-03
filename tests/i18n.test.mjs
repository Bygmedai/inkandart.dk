import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, localePath, alternates, t } from "../lib/i18n.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const redirects = readFileSync(join(root, "lib/redirects.ts"), "utf8");
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8");
const daPage = readFileSync(join(root, "app/(da)/(emerge)/walk-in/page.tsx"), "utf8");
const enPage = readFileSync(join(root, "app/(en)/(emerge)/en/walk-in/page.tsx"), "utf8");
const sw = readFileSync(join(root, "components/i18n/LangSwitch.tsx"), "utf8");

test("dansk bor på roden, engelsk på /en — ingen rute er flyttet", () => {
  assert.deepEqual([...LOCALES], ["da", "en"]);
  assert.equal(localePath("da", "/walk-in"), "/walk-in");
  assert.equal(localePath("en", "/walk-in"), "/en/walk-in");
  assert.equal(localePath("en", "/"), "/en");
  assert.equal(existsSync(join(root, "app/(da)/(emerge)/walk-in/page.tsx")), true);
});

test("REGRESSION: en engelsk side vi HAR bygget må ikke 308'es væk", () => {
  // Redirects kører før routing i Next. Bliver reglen stående, er siden uopnåelig.
  assert.doesNotMatch(redirects, /slashPair\("\/en\/walk-in"/);
  assert.doesNotMatch(redirects, /from: "\/en\/walk-in\//);
});

test("REGRESSION: /en/flash er bygget (#245 A4) og maa ikke 308'es vaek", () => {
  // Samme faelde som /en/walk-in: redirects koerer FOER routing i Next.
  // Blev reglen staaende, ville app/(en)/(emerge)/en/flash/page.tsx aldrig
  // kunne naas — siden ville findes og alligevel ikke.
  assert.doesNotMatch(redirects, /slashPair\("\/en\/flash"/);
  assert.doesNotMatch(redirects, /from: "\/en\/flash\//);
  assert.equal(existsSync(join(root, "app/(en)/(emerge)/en/flash/page.tsx")), true);
});

test("ruter vi IKKE har bygget endnu 308'er stadig — ingen halve huller", () => {
  // /en/gavekort findes ikke som side → skal blive ved med at 308'e.
  // Hellere dansk end 404 (CLAUDE.md §1).
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
  // ligger i app/(en)/(rummet)/en/ — så den kan ikke glemme.
  const enDir = join(root, "app/(en)/(rummet)/en");
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
  // Det praktiske skal derimod være præcist — adressen er ens. Prisen står
  // kun på knappen, hvor kunden kan betale den (K7, S579).
  assert.match(en.lede("Larsbjørnsstræde 13"), /Larsbjørnsstræde 13/);
  assert.doesNotMatch(en.lede("Larsbjørnsstræde 13"), /900/);
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

test("periode-etiketten taler laeserens sprog — Stevens fund 31/8", async () => {
  const { periodeLabel } = await import("../lib/content.ts");
  const { t } = await import("../lib/i18n.ts");

  const fast = { periode: "fast" };
  const gaest = { periode: "gaest" };
  const gaestTil = { periode: "gaest", periode_til: "12. oktober" };

  // Dansk er standarden: hvert dansk kaldsted er uaendret uden argument.
  assert.equal(periodeLabel(fast), "Fast");
  assert.equal(periodeLabel(gaest), "Gæst");
  assert.equal(periodeLabel(gaestTil), "I studiet til 12. oktober");

  // Engelsk skal komme fra ordbogen, ikke fra et gaet.
  const en = t("en").rummet.periode;
  assert.equal(periodeLabel(fast, en), "Resident");
  assert.equal(periodeLabel(gaest, en), "Guest");
  assert.equal(periodeLabel(gaestTil, en), "In the studio until 12. oktober");

  // NEGATIV KONTROL: den engelske ordbog maa ikke baere danske ord.
  for (const v of Object.values(en)) {
    const s = typeof v === "function" ? v("x") : v;
    assert.doesNotMatch(s, /[æøåÆØÅ]/, `dansk i den engelske periode-etiket: ${s}`);
  }
});

test("fagets navn staar paa engelsk — og er skrevet af et menneske", async () => {
  const yaml = await import("yaml");
  const { readFileSync } = await import("node:fs");
  const artister = yaml
    .parse(readFileSync(join(root, "content/artists.yml"), "utf8"))
    .filter((a) => a.stol !== false && a.fornavn);

  for (const a of artister) {
    assert.ok(a.haandvaerk_en, `${a.id} mangler haandvaerk_en — /en falder tilbage til dansk`);
    assert.doesNotMatch(a.haandvaerk_en, /[æøåÆØÅ]/, `${a.id}: dansk i haandvaerk_en`);
  }

  // Anna staar EKSPLICIT selv om ordet er det samme paa begge sprog.
  // Uden det leverer den danske fallback det rigtige ord ved et tilfaelde,
  // og et hegn der holder ved et tilfaelde holder ikke naar teksten skifter.
  const anna = artister.find((a) => a.id === "anna");
  assert.equal(anna.haandvaerk_en, "Piercer");
});

test("artistens tider staar paa begge sprog — og paa korrekt dansk", async () => {
  const yaml = await import("yaml");
  const { readFileSync } = await import("node:fs");
  const emma = yaml
    .parse(readFileSync(join(root, "content/artists.yml"), "utf8"))
    .find((a) => a.id === "emma");

  // Tallene er Emmas egne, sendt 31/8. De maa aendres, men ikke udledes af
  // husets aabningstid — en artist kan vaere i huset uden at doeren er aaben.
  assert.equal(emma.tider.length, 3);
  assert.deepEqual(emma.tider[0], { dage: ["tir", "ons"], fra: "13", til: "23" });
  assert.deepEqual(emma.tider[1], { dage: ["tor"], fra: "16", til: "02.30" });
  assert.deepEqual(emma.tider[2], { dage: ["fre", "loer"], fra: "19", til: "05.30" });

  const { t } = await import("../lib/i18n.ts");
  // Dansk skriver ugedage med LILLE midt i en saetning; engelsk med stort.
  // Ordbogen holder dem som de ser ud midt i en saetning, og komponenten
  // stort-skriver kun foerste tegn. «Tirsdag og Onsdag» var forkert dansk.
  for (const d of Object.values(t("da").rummet.tider.dag)) {
    assert.match(d, /^[a-zæøå]/, `dansk ugedag med stort: ${d}`);
  }
  for (const d of Object.values(t("en").rummet.tider.dag)) {
    assert.match(d, /^[A-Z]/, `engelsk ugedag med lille: ${d}`);
    assert.doesNotMatch(d, /[æøåÆØÅ]/, `dansk i den engelske ugedag: ${d}`);
  }

  // Formateringen bor i lib/tider.ts, saa BAADE artistsiden, /gaden,
  // forsiden og FAQ'en bruger den samme regel. Ellers formaterer fire
  // flader den samme tid paa fire maader.
  const kilde = readFileSync(join(root, "lib/tider.ts"), "utf8");
  assert.match(kilde, /charAt\(0\)\.toUpperCase\(\)/, "linjen stort-skrives ikke");
});

test("et halvt tidsrum vises ikke — hellere ingen tid end en forkert", async () => {
  const { loadHouse } = await import("../lib/content.ts");
  // Parseren smider raekker uden dag eller uden klokkeslet vaek. En halv
  // aabningstid sender en kunde til en laast doer (rails §4).
  for (const a of loadHouse().artists) {
    for (const r of a.tider ?? []) {
      assert.ok(r.dage.length > 0 && r.fra && r.til, `${a.id}: halvt tidsrum sluppet igennem`);
    }
  }
});

test("butikkens tider staar ÉT sted og laeses af alle flader", async () => {
  const { loadAabningstider, loadGaden, loadGadenEn, loadHusetForside, loadHusetForsideEn } =
    await import("../lib/content.ts");
  const { formatTider, formatTiderIndlejret } = await import("../lib/tider.ts");
  const { t } = await import("../lib/i18n.ts");

  // Kilden findes. De konkrete tal proeves i «husets tider er husets» —
  // her handler det om at der KUN er én kilde. En proeve der laaser sig fast
  // paa tallene gaar roed hver gang huset aendrer aabningstid, og saa
  // vogter den ikke laengere det den blev skrevet for.
  const tider = loadAabningstider();
  assert.ok(tider.length > 0, "kilden er tom");

  // NEGATIV KONTROL — den vigtigste her: ingen af de gamle kopier maa baere
  // en tid. Den 31/8 stod den samme aabningstid i SEKS filer i to formater,
  // blev rettet to gange paa en time, og begge gange slap to filer igennem.
  assert.equal(loadGaden().walk_in, "", "gaden.yml er en kopi");
  assert.equal(loadGadenEn().walk_in, "", "gaden.en.yml er en kopi");
  assert.equal(loadGaden().aabent, "", "«Åbent» lover en doer huset ikke styrer");
  assert.equal(loadHusetForside().tider, "", "huset.yml er en kopi");
  assert.equal(loadHusetForsideEn().tider, "", "huset.en.yml er en kopi");

  // Og de to sprog kan ikke sige forskellige klokkeslet, fordi tallene kun
  // findes ét sted — kun dagene oversaettes.
  const da = formatTider(tider, t("da").rummet.tider);
  const en = formatTider(tider, t("en").rummet.tider);
  for (const tal of ["13–22", "13–02", "13–05"]) {
    assert.ok(da.includes(tal), `dansk mangler ${tal}`);
    assert.ok(en.includes(tal), `engelsk mangler ${tal}`);
  }
  // Bundet til REGLEN, ikke til ordene: en proeve der citerer linjen gaar
  // roed hver gang huset aendrer aabningstid, og saa vogter den intet.
  //
  // Dansk: stort paa foerste tegn, og INGEN storskrevet ugedag derefter.
  assert.match(da, /^[A-ZÆØÅ]/, "dansk: linjen starter ikke med stort");
  const danskeDage = Object.values(t("da").rummet.tider.dag);
  for (const dag of danskeDage) {
    const stor = dag.charAt(0).toUpperCase() + dag.slice(1);
    assert.doesNotMatch(da.slice(1), new RegExp(stor),
      `dansk: «${stor}» med stort midt i linjen`);
  }
  // Engelsk: hver ugedag der optraeder, skal vaere storskrevet.
  for (const dag of Object.values(t("en").rummet.tider.dag)) {
    if (en.includes(dag.toLowerCase())) {
      assert.fail(`engelsk: «${dag}» med lille`);
    }
  }

  // Indlejret i en saetning skal dansk begynde med lille.
  // Indlejret midt i en saetning: dansk starter med LILLE, engelsk med stort.
  // Igen bundet til reglen, ikke til hvilken dag der tilfaeldigvis er foerst.
  assert.match(formatTiderIndlejret(tider, t("da").rummet.tider), /^[a-zæøå]/,
    "dansk: ugedag med stort midt i en saetning");
  assert.match(formatTiderIndlejret(tider, t("en").rummet.tider), /^[A-Z]/,
    "engelsk: ugedag med lille");
});

test("FAQ'ens svar baerer en pladsholder, ikke en tid", () => {
  for (const f of ["content/faq.yml", "content/faq.en.yml"]) {
    const src = readFileSync(join(root, f), "utf8");
    assert.match(src, /\{tider\}/, `${f} mangler pladsholderen`);
    // Ingen klokkeslet i FAQ-teksten — saa kan den ikke drive fra kilden.
    assert.doesNotMatch(src.replace(/^\s*#.*$/gm, ""), /\d{1,2}[:.]\d{2}[–-]|\d{1,2}–\d{2}/, `${f} baerer en tid`);
  }
});

test("en ukendt dagnoegle bliver ikke tavst smidt vaek", async () => {
  // Harukis fund 1/9: han skrev «soen» i sit eget brief. Ordbogen bruger
  // «son». `dagerække` filtrerer ukendte noegler vaek med .filter(Boolean),
  // saa soendagen ville vaere forsvundet fra fladen UDEN at noget blev
  // roedt — hverken en fejl, en tom linje eller en test.
  //
  // Det er den dyreste slags fejl: den ser ud som om alt virker.
  const yaml = await import("yaml");
  const { readFileSync } = await import("node:fs");
  const { t } = await import("../lib/i18n.ts");

  const kendte = {
    da: new Set(Object.keys(t("da").rummet.tider.dag)),
    en: new Set(Object.keys(t("en").rummet.tider.dag)),
  };
  // Begge sprog skal kende de samme dage. Ellers falder en dag ud paa ét
  // sprog og staar paa det andet.
  assert.deepEqual([...kendte.da].sort(), [...kendte.en].sort(),
    "ordboegerne kender ikke de samme ugedage");

  const kilder = [
    ["content/aabningstider.yml", (d) => d.tider ?? []],
    ["content/artists.yml", (d) => d.flatMap((a) => a.tider ?? [])],
  ];
  for (const [fil, hent] of kilder) {
    for (const r of hent(yaml.parse(readFileSync(join(root, fil), "utf8")))) {
      for (const dag of r.dage ?? []) {
        assert.ok(kendte.da.has(dag), `${fil}: ukendt dagnoegle «${dag}» — den forsvinder tavst`);
      }
    }
  }
});

test("husets tider er husets, ikke en artists vagtplan", async () => {
  const yaml = await import("yaml");
  const { readFileSync } = await import("node:fs");
  const d = yaml.parse(readFileSync(join(root, "content/aabningstider.yml"), "utf8"));

  // Alle syv dage skal vaere daekket. Filen stod foerst med Emmas vagter,
  // hvor mandag og soendag manglede helt — huset var «lukket» to dage det
  // ikke er lukket.
  const daekket = new Set(d.tider.flatMap((r) => r.dage));
  for (const dag of ["man", "tir", "ons", "tor", "fre", "loer", "son"]) {
    assert.ok(daekket.has(dag), `${dag} mangler i husets tider`);
  }

  // 05.30 var Emmas nedlukning EFTER lukketid, ikke en aabningstid.
  // Et halvt minuttal her betyder at en artists kalender er sivet ind igen.
  for (const r of d.tider) {
    assert.doesNotMatch(r.til, /\.30$/, `${r.dage} lukker :30 — er det en artists nedlukning?`);
    assert.equal(r.fra, "13", `${r.dage} aabner ikke 13 — huset aabner samme tid hver dag`);
  }
});
