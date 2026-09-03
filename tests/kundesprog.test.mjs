import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Kundens sprog (S579, Groks brief 3/9 efter Stevens anvisning).
 *
 * Husets interne navne — Stolen, Mærket, Hylden, Væggen, Natten, Gaden,
 * Blackbook, Huset, Nattespot — bliver i URL'er, CSS-klasser, filnavne og
 * Shopify-handles. Men kunden møder dem ikke: nav, dør, h1, title, rum-label
 * og YAML siger Artister/Artists, Shop, Prints, Arbejde/Work, Aftener/Nights,
 * Find os/Find us, Skriv dig op/Join the list, Studiet/Studio.
 *
 * Hegnet måler SYNLIG tekst: JSX-tekstnoder og strengliteraler, uden
 * kommentarer. Et lowercase «/stolen» eller «rum-stolen» er en sti, ikke et
 * ord til kunden — kun det store forbogstav er markøren. Negativ kontrol
 * nederst: hegnet skal kunne blive rødt, ellers måler det ingenting.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const HUSETS_ORD = [
  "Stolen", "Mærket", "Hylden", "Væggen", "Natten", "Gaden",
  "Blackbook", "Huset", "Nattespot", "The house",
];

/** JSX-tekst og strenge — det kunden kan komme til at se. Kommentarer strippes. */
function synligTekst(src) {
  const kode = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const bidder = [];
  for (const m of kode.matchAll(/>([^<>{}]+)</g)) bidder.push(m[1]);
  for (const m of kode.matchAll(/"([^"\n]*)"/g)) bidder.push(m[1]);
  for (const m of kode.matchAll(/`([^`]*)`/g)) bidder.push(m[1]);
  return bidder;
}

/** Husets ord som HELE ord med stort forbogstav — «StolenPage» og «/stolen» tæller ikke. */
function husetsOrdI(src) {
  const fund = [];
  for (const bid of synligTekst(src)) {
    for (const ord of HUSETS_ORD) {
      const re = new RegExp(`(^|[^\\p{L}/\\-_])${ord}(?![\\p{L}\\-_])`, "u");
      if (re.test(bid)) fund.push(`«${ord}» i »${bid.trim()}«`);
    }
  }
  return fund;
}

/** Alle page.tsx under en rod — undtagen personalets sider bag koden. */
function kundesider(dir) {
  const staff = /\/(afstemning|personale|gulvet)\//;
  return readdirSync(join(root, dir), { recursive: true })
    .map((f) => join(dir, String(f)))
    .filter((f) => f.endsWith("page.tsx") && !staff.test(`/${f}/`));
}

const KOMPONENTER = [
  "components/rummet/Nav.tsx",
  "components/rummet/Door.tsx",
  "components/rummet/Shell.tsx",
  "components/rummet/MaerketFlade.tsx",
  "components/rummet/NattenFlade.tsx",
  "components/rummet/GadenFlade.tsx",
  "components/rummet/ArtistKort.tsx",
  "components/rummet/ProduktFlade.tsx",
  "components/rummet/VaerkFlade.tsx",
  // Render-målingen 3/9 fandt «Blackbook — first look at flash & guest
  // spots» på /flash og /en/flash: første udgave af hegnet scannede siderne,
  // ikke komponenten de importerer. Nu står den her.
  "components/emerge/BlackbookSignup.tsx",
  "lib/i18n.ts",
];

test("S579 nav: kundens fire døre hedder det samme på begge sprog, og URL'erne er husets", async () => {
  const { t } = await import("../lib/i18n.ts");
  assert.deepEqual(t("da").rummet.rooms, [
    { href: "/stolen", label: "Artister" },
    { href: "/shop", label: "Shop" },
    { href: "/natten", label: "Aftener" },
    { href: "/gaden", label: "Find os" },
  ]);
  assert.deepEqual(t("en").rummet.rooms, [
    { href: "/stolen", label: "Artists" },
    { href: "/shop", label: "Shop" },
    { href: "/natten", label: "Nights" },
    { href: "/gaden", label: "Find us" },
  ]);
  assert.equal(t("da").rummet.listName, "Skriv dig op");
  assert.equal(t("en").rummet.listName, "Join the list");
  assert.equal(t("da").rummet.roomsLabel, "Menu", "aria på nav er en etiket, ikke poesi");
  assert.equal(t("en").rummet.roomsLabel, "Menu");

  // Nav og dør læser ordbogen — en hardkodet ROOMS-liste er præcis det
  // sted «Stolen» ville komme tilbage.
  const nav = read("components/rummet/Nav.tsx");
  assert.doesNotMatch(nav, /const ROOMS\b/, "nav'ens døre bor i i18n, ikke i komponenten");
  assert.match(nav, /c\.rooms\.map\(/);
  assert.match(nav, /aria-label=\{c\.listName\}/);
  assert.match(read("components/rummet/Door.tsx"), /rum-door__name">\{c\.listName\}</);
  const signup = read("components/emerge/BlackbookSignup.tsx");
  assert.match(signup, /lang = DEFAULT_LOCALE/, "tilmeldingen skal tage et sprog");
  assert.match(signup, /t\(lang\)\.rummet/, "tilmeldingen henter sine ord i ordbogen");
  for (const f of ["app/(da)/(emerge)/flash/page.tsx", "app/(en)/(emerge)/en/flash/page.tsx"]) {
    const lang = f.includes("(en)") ? "en" : "da";
    assert.match(read(f), new RegExp(`<BlackbookSignup source="flash" lang="${lang}" />`), `${f}: sproget skal gives videre`);
  }
});

test("S579 h1 og title siger det samme som nav'en", async () => {
  const { loadGaden, loadGadenEn, loadNattenCopy, loadNattenCopyEn } = await import("../lib/content.ts");
  assert.match(read("app/(da)/(rummet)/stolen/page.tsx"), /rum-poster">Artister<\/h1>/);
  assert.match(read("app/(da)/(rummet)/stolen/page.tsx"), /title: "Artister · Ink & Art"/);
  assert.match(read("app/(en)/(rummet)/en/stolen/page.tsx"), /rum-poster">Artists<\/h1>/);
  assert.match(read("app/(en)/(rummet)/en/stolen/page.tsx"), /title: "Artists · Ink & Art"/);
  assert.match(read("components/rummet/MaerketFlade.tsx"), /rum-poster">\{c\.shopLabel\}<\/h1>/);
  assert.match(read("components/rummet/NattenFlade.tsx"), /rum-poster">\{c\.nightsLabel\}<\/h1>/);
  for (const side of ["app/(da)/(rummet)/shop/page.tsx", "app/(en)/(rummet)/en/shop/page.tsx"]) {
    assert.match(read(side), /title: "Shop · Ink & Art"/);
  }
  assert.match(read("app/(da)/(rummet)/natten/page.tsx"), /title: "Aftener · Ink & Art"/);
  assert.match(read("app/(en)/(rummet)/en/natten/page.tsx"), /title: "Nights · Ink & Art"/);
  assert.match(read("app/(da)/(rummet)/gaden/page.tsx"), /title: "Find os · Ink & Art"/);
  assert.match(read("app/(en)/(rummet)/en/gaden/page.tsx"), /title: "Find us · Ink & Art"/);
  assert.equal(loadGaden().titel, "Find os");
  assert.equal(loadGadenEn().titel, "Find us");
  assert.equal(loadNattenCopy().spot_titel, "Walk-in om natten");
  assert.equal(loadNattenCopyEn().spot_titel, "Late walk-in");

  // Forsiden og husets sider: Studiet / Studio, ikke Huset / The house.
  assert.match(read("app/(da)/(rummet)/page.tsx"), /className="rum-label">Studiet</);
  assert.match(read("app/(en)/(rummet)/en/page.tsx"), /className="rum-label">Studio</);
});

test("S579 husets ord står ikke som synlig tekst på kundens sider", () => {
  const filer = [
    ...KOMPONENTER,
    ...kundesider("app/(da)/(rummet)"),
    ...kundesider("app/(en)/(rummet)"),
    ...kundesider("app/(da)/(emerge)"),
    ...kundesider("app/(en)/(emerge)"),
  ];
  assert.ok(filer.length >= 30, `for få filer målt: ${filer.length}`);
  const fund = [];
  for (const f of filer) {
    for (const x of husetsOrdI(read(f))) fund.push(`${relative(root, join(root, f))}: ${x}`);
  }
  assert.deepEqual(fund, [], "husets ord på kundens skærm:\n" + fund.join("\n"));
});

test("S579 YAML Sonja retter i: ingen Blackbook, Nattespot eller Gaden som kundens ord", () => {
  for (const f of [
    "content/natten.yml", "content/natten.en.yml",
    "content/gaden.yml", "content/gaden.en.yml",
    "content/privatliv.yml", "content/privatliv.en.yml",
    "content/huset.yml", "content/huset.en.yml",
  ]) {
    const udenKommentarer = read(f).replace(/^\s*#.*$/gm, "");
    const fund = [];
    for (const ord of HUSETS_ORD) {
      const re = new RegExp(`(^|[^\\p{L}/\\-_])${ord}(?![\\p{L}\\-_])`, "mu");
      if (re.test(udenKommentarer)) fund.push(ord);
    }
    assert.deepEqual(fund, [], `${f}: ${fund.join(", ")}`);
  }
});

test("S579 K7: walk-in-prisen står kun hvor kunden kan betale den", async () => {
  const { t } = await import("../lib/i18n.ts");
  for (const lang of ["da", "en"]) {
    assert.doesNotMatch(t(lang).walkin.lede("Larsbjørnsstræde 13"), /900/, `${lang}: lede`);
    assert.doesNotMatch(t(lang).walkin.metaDescription, /900/, `${lang}: metaDescription`);
    assert.doesNotMatch(t(lang).shop.doors.walkin, /900/, `${lang}: shop-døren`);
    assert.doesNotMatch(t(lang).shop.metaDescription, /900|gaden sælger|street sells/i, `${lang}: shop-beskrivelse`);
    assert.doesNotMatch(t(lang).shop.title, /sælger|sells/i, `${lang}: shop-titel`);
  }
  // Knappen må stadig bære beløbet — dér betaler kunden i samme sekund.
  assert.match(t("en").walkin.cta("900"), /900/);

  const shopDa = read("app/(da)/(rummet)/shop/page.tsx");
  assert.doesNotMatch(shopDa, /900,-|Gaden sælger/);
  assert.match(shopDa, /title: "Shop · Ink & Art"/);
  const walkinDa = read("app/(da)/(emerge)/walk-in/page.tsx");
  assert.doesNotMatch(walkinDa, /for 900 kr|tatoveringer for \{kr\(WALKIN\.kr\)\}/, "prosa uden pris");
  assert.match(walkinDa, /Betal \{kr\(WALKIN\.kr\)\} kr/, "knappen beholder beløbet");
  assert.doesNotMatch(read("content/huset.en.yml"), /900/);
});

test("negativ kontrol: hegnet kan blive rødt — og bliver det ikke af en sti", () => {
  assert.deepEqual(husetsOrdI('<a href="/stolen">Stolen</a>'), ["«Stolen» i »Stolen«"]);
  assert.deepEqual(husetsOrdI('{ href: "/stolen", label: "Stolen" }'), ["«Stolen» i »Stolen«"]);
  assert.deepEqual(husetsOrdI('<p className="rum-label">The house</p>'), ["«The house» i »The house«"]);
  assert.deepEqual(husetsOrdI('<a className="rum-stolen" href="/stolen">Artister</a>'), []);
  assert.deepEqual(husetsOrdI('<StolenPage /> {/* Stolen hed det før */}'), []);
  assert.deepEqual(husetsOrdI('// Stolen\nconst x = "StolenPage";'), []);
  assert.deepEqual(husetsOrdI('<section aria-labelledby="nattespot" id="hylden" />'), []);
});
