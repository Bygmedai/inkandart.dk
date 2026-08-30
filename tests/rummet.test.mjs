import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

test("content-filerne parse'r og tom-tilstandene følger data", async () => {
  const {
    loadHouse,
    activeNat,
    guestState,
    shelfEmpty,
    chairArtists,
    featuredVaerk,
    vaerkLabel,
    artistById,
  } = await import("../lib/content.ts");

  const house = loadHouse();
  assert.ok(house.artists.length >= 3, "artister skal kunne læses");
  assert.equal(activeNat(house.nats), null, "ingen aktiv nat → tom-tilstand");
  assert.equal(shelfEmpty(house.vaerker), true, "ingen edition_ref → hylden er tom");

  const guest = guestState(house.artists);
  assert.equal(guest.kind, "pending", "gæst uden navn er pending, ikke opdigtet");

  const chairs = chairArtists(house.artists);
  const names = chairs.map((a) => a.fornavn);
  // S573: Anna Ogłuszka er husets piercer fra 31/8. En piercer sidder i
  // stolen paa linje med tatovoererne — det er samme rum og samme booking.
  assert.deepEqual(names, ["Nizar Saad", "Emma Windinnalls", "Anna Ogłuszka"]);
  assert.ok(!names.includes("Sonja Rebner"), "Sonja sidder ikke i stolen");

  const featured = featuredVaerk(house.vaerker);
  assert.ok(featured, "der skal være et værk i dag");
  const artist = artistById(house.artists, featured.artist);
  const label = vaerkLabel(featured, artist);
  assert.match(label, /håndled/);
  assert.doesNotMatch(label, /Sort hjort|masterpiece/i);

  // Empty-state functions with explicit data (negativ + positiv).
  assert.equal(guestState([{ stol: true, periode: "gaest", aktiv: false, fornavn: "", id: "g", haandvaerk: "", foto: "" }]).kind, "empty");
  assert.equal(guestState([{ stol: true, periode: "gaest", aktiv: true, fornavn: "Ada", id: "g", haandvaerk: "", foto: "" }]).kind, "named");
  assert.equal(shelfEmpty([{ maa_vises: true, edition_ref: "gid://1", id: "x", titel: "", artist: "", aar: "", arkivnr: "", foto: "", demo: false, i_dag: false }]), false);
  assert.equal(activeNat([{ aktiv: true, nr: "07", dato: "", navne: [], tidsrum: "", plakatfoto: "" }])?.nr, "07");
});

test("ingen dummy-navne eller opdigtede priser på Huset", () => {
  const src = [
    read("app/(rummet)/page.tsx"),
    read("content/artists.yml"),
    read("content/vaerker.yml"),
    read("content/nat.yml"),
    read("content/huset.yml"),
    read("content/kontakt.yml"),
  ].join("\n");
  for (const forbidden of ["Nizar Haddad", "Emma Ravn", "Kaya Lind", "900 kr", "fra 900", "gonzo"]) {
    assert.doesNotMatch(src, new RegExp(forbidden.replace(/[.*]/g, "\\$&")));
  }
  assert.match(src, /Nizar Saad/);
  assert.match(src, /Emma Windinnalls/); // det lange navn er det rigtige (Steven 30/8)
  assert.match(src, /I stolen/);
  assert.match(src, /Larsbjørnsstræde 13, kælderen\. Walk-in når der er en fri stol — ellers book\./);
  assert.doesNotMatch(src, /Værket i dag/);
  assert.doesNotMatch(src, />\s*I huset\s*</);
  assert.doesNotMatch(src, /Walk-in og tider/);
});

test("Huset er layout, ikke tekst: ord og kontakt kommer fra YAML", async () => {
  const huset = read("app/(rummet)/page.tsx");
  // Fladen læser data — den ejer den ikke.
  assert.match(huset, /loadHusetForside/);
  assert.match(huset, /loadKontakt/);
  assert.match(huset, /\{fold\.titel\}/);
  assert.match(huset, /\{fold\.lede\}/);
  assert.match(huset, /kontakt\.telefon_e164/);
  // Hardcodede ord i markup er fejlen vi lige har fjernet. Hold den ude.
  assert.doesNotMatch(huset, /Tatovering og piercing i Pisserenden/);
  assert.doesNotMatch(huset, /55 24 86 08/);
  assert.doesNotMatch(huset, />Fast</);
  const { loadHusetForside, loadKontakt } = await import("../lib/content.ts");
  const fold = loadHusetForside();
  assert.ok(fold.titel.length > 0, "huset.yml skal have en titel");
  assert.ok(fold.hero_foto.startsWith("/"), "hero_foto skal pege på et af husets billeder");
  assert.ok(fold.hero_billedtekst.length > 0, "heroen skal have en billedtekst");
  const k = loadKontakt();
  assert.match(k.telefon_e164, /^\+45\d{8}$/);
  assert.ok(k.email.includes("@"));
});

test("Rummet-tokens og fonte er self-hostet", () => {
  const css = read("components/rummet/rummet.css");
  assert.match(css, /--nat:\s*#070707/);
  assert.match(css, /--hud:\s*#e8dcc8/i);
  assert.match(css, /--blod:\s*#b91c1c/i);
  assert.match(css, /--strobe:\s*#c8ff3d/i);
  assert.match(css, /--beton:\s*#8a8580/i);
  assert.match(css, /outline:\s*2px solid var\(--hud\)/);
  assert.match(css, /outline-offset:\s*2px/);

  const rootLayout = read("app/layout.tsx");
  const rummetLayout = read("app/(rummet)/layout.tsx");
  const emergeLayout = read("app/(emerge)/layout.tsx");
  assert.match(rummetLayout, /Anton-latin\.woff2/);
  assert.match(rummetLayout, /InstrumentSans-latin\.woff2/);
  assert.doesNotMatch(rummetLayout, /fonts\.googleapis\.com/);
  assert.doesNotMatch(rummetLayout, /CormorantGaramond/);
  assert.doesNotMatch(rummetLayout, /SpaceGrotesk/);
  assert.doesNotMatch(rootLayout, /CormorantGaramond/);
  assert.doesNotMatch(rootLayout, /SpaceGrotesk/);
  assert.doesNotMatch(rootLayout, /Anton-latin/);
  assert.doesNotMatch(rootLayout, /InstrumentSans/);
  assert.doesNotMatch(rootLayout, /emerge-boot/);
  assert.doesNotMatch(rootLayout, /className="grain"/);
  assert.match(emergeLayout, /CormorantGaramond/);
  assert.match(emergeLayout, /SpaceGrotesk/);
  assert.match(emergeLayout, /emerge-boot\.js/);
  assert.match(emergeLayout, /className="grain"/);
  for (const f of [
    "app/fonts/Anton-latin.woff2",
    "app/fonts/Anton-latin-ext.woff2",
    "app/fonts/InstrumentSans-latin.woff2",
    "app/fonts/InstrumentSans-latin-ext.woff2",
  ]) {
    assert.ok(existsSync(join(root, f)), `${f} mangler`);
  }
});

test("rum-ruter og slots findes", () => {
  for (const p of ["app/(rummet)/stolen/page.tsx", "app/(rummet)/maerket/page.tsx", "app/(rummet)/natten/page.tsx", "app/(rummet)/gaden/page.tsx", "app/(rummet)/booking/page.tsx", "app/(rummet)/booking/tak/page.tsx"]) {
    assert.ok(existsSync(join(root, p)), `${p} mangler`);
  }
  const slots = readdirSync(join(root, "public/slots")).filter((n) => n.endsWith(".jpg"));
  assert.ok(slots.length >= 20, `forventede slot-jpg, fandt ${slots.length}`);
  assert.ok(existsSync(join(root, "public/admin/config.yml")));
});

test("metadata opfinder ikke walk-in 900 kr", () => {
  const layout = read("app/layout.tsx");
  assert.doesNotMatch(layout, /900 kr/);
  const blok = layout.slice(layout.indexOf("export const metadata"), layout.indexOf("export const viewport"));
  assert.doesNotMatch(blok, /900/);
  assert.match(layout, /tatovering/i);
  assert.match(layout, /piercing/i);
  assert.match(layout, /Larsbjørnsstræde/);
});

test("Emerge-scatter rammer ikke Rummet", () => {
  const shell = read("components/rummet/Shell.tsx");
  const rummetLayout = read("app/(rummet)/layout.tsx");
  const css = read("app/globals.css");
  assert.match(shell, /data-rummet/);
  assert.match(rummetLayout, /data-rummet/);
  assert.match(css, /body:not\(:has\(\.emerge-v05\)\):not\(:has\(\[data-rummet\]\)\)::before/);
  assert.match(css, /body:not\(:has\(\.emerge-v05\)\):not\(:has\(\[data-rummet\]\)\)::after/);
  assert.doesNotMatch(css, /body:not\(:has\(\.emerge-v05\)\)::before/);
  assert.doesNotMatch(css, /body:not\(:has\(\.emerge-v05\)\)::after/);
});

test("Rummet-nav har segl på undersider, stort segl kun på Huset", () => {
  const nav = read("components/rummet/Nav.tsx");
  const css = read("components/rummet/rummet.css");
  const huset = read("app/(rummet)/page.tsx");
  assert.match(nav, /logo-segl\.svg/);
  assert.match(nav, /onHuset/);
  assert.match(nav, /className="rum-nav__mark"/);
  assert.match(nav, /href="\/"/);
  assert.match(nav, /Ink & Art/);
  assert.doesNotMatch(nav, /Ink and Art/);
  assert.match(huset, /rum-huset__segl/);
  assert.match(huset, /<Segl /);
  const i = css.indexOf(".rum-nav__mark {");
  assert.notEqual(i, -1, "rum-nav__mark-reglen mangler");
  const krop = css.slice(i, css.indexOf("}", i));
  assert.match(krop, /min-height:\s*44px/);
});

test("Book.dk er et klædt hop, ikke et embed", () => {
  const door = read("components/rummet/BookDoor.tsx");
  assert.match(door, /https:\/\/inkart\.book\.dk\//);
  assert.doesNotMatch(door, /<iframe/);
});

test("M2 cross-link tæller synlige værker fra YAML og udelader N=0", async () => {
  const { loadHouse, visibleCountForArtist } = await import("../lib/content.ts");
  const house = loadHouse();
  assert.equal(visibleCountForArtist(house.vaerker, "nizar"), 4);
  assert.equal(visibleCountForArtist(house.vaerker, "emma"), 4);
  assert.equal(visibleCountForArtist(house.vaerker, "gaest"), 0);

  const kort = read("components/rummet/ArtistKort.tsx");
  assert.match(kort, /workCount > 0/);
  assert.match(kort, /maerket\?artist=/);
  assert.match(kort, /arbejder på Væggen/);
  assert.doesNotMatch(kort, /0 værker/);
});

test("M2 artist-filter er shareable via ?artist=", async () => {
  const maerket = read("app/(rummet)/maerket/page.tsx");
  assert.match(maerket, /searchParams/);
  assert.match(maerket, /maerket\?artist=/);
  assert.match(maerket, /filterVisibleByArtist/);

  const { loadHouse, filterVisibleByArtist } = await import("../lib/content.ts");
  const house = loadHouse();
  const nizar = filterVisibleByArtist(house.vaerker, "nizar");
  const emma = filterVisibleByArtist(house.vaerker, "emma");
  const alle = filterVisibleByArtist(house.vaerker, "");
  assert.ok(nizar.length > 0 && nizar.every((v) => v.artist === "nizar"));
  assert.ok(emma.length > 0 && emma.every((v) => v.artist === "emma"));
  assert.equal(alle.length, nizar.length + emma.length);
  assert.deepEqual(
    filterVisibleByArtist(house.vaerker, "findes-ikke").map((v) => v.id),
    [],
  );
});

test("S573: Hylden læser hylden.yml, ikke værkerne", () => {
  // M2 bandt hylden til `edition_ref` i vaerker.yml. Det betød at der ikke
  // kunne findes en vare uden at nogen først havde fotograferet en tatovering
  // — og så kan huset ikke sælge en næsering. Hylden har nu sin egen kilde.
  const maerket = read("app/(rummet)/maerket/page.tsx");
  assert.match(maerket, /loadHylden/);
  assert.doesNotMatch(maerket, /shelfVaerker|shelfEmpty/);
  assert.match(maerket, /Hylden/);
  assert.match(maerket, /Væggen/);
  assert.doesNotMatch(maerket, /Artistkortet kommer i næste rum/);
  assert.doesNotMatch(maerket, /Væggen bygges i næste rum/);
  assert.doesNotMatch(maerket, /href="\/shop"/);
});

test("S573: hver vare på hylden har handle, foto og en linje", () => {
  const yml = read("content/hylden.yml");
  const handles = [...yml.matchAll(/^- handle:\s*(\S+)/gm)].map((m) => m[1]);
  const fotos = [...yml.matchAll(/^\s+foto:\s*(\S+)/gm)].map((m) => m[1]);
  const titler = [...yml.matchAll(/^\s+titel:\s*(.+)$/gm)].map((m) => m[1].trim());
  assert.ok(handles.length >= 1, "hylden må ikke være tom uden grund");
  assert.equal(fotos.length, handles.length, "hver vare skal have et foto");
  assert.equal(titler.length, handles.length, "hver vare skal have en titel");
  // Varen skal vises som vare, ikke som hud.
  for (const f of fotos) assert.doesNotMatch(f, /^\/slots\//, `${f} er et værk-slot, ikke et produktbillede`);
});

test("S573: produktsiden viser varen, ikke et værk", () => {
  const flade = read("components/rummet/ProduktFlade.tsx");
  assert.match(flade, /Læg i kurv/);
  assert.doesNotMatch(flade, /Plade/);
  // Prisen skal stå på knappen — en knap uden tal er et spørgsmål, ikke et tilbud.
  assert.match(flade, /\{buy\}/);
});

test("M2 kurv-indikator vises kun med indhold — ingen 0-badge", () => {
  const src = read("components/rummet/CartIndicator.tsx");
  const nav = read("components/rummet/Nav.tsx");
  assert.match(src, /if \(count < 1\) return null/);
  assert.match(nav, /CartIndicator/);
  assert.match(nav, /rum-dock__cluster/);
  assert.doesNotMatch(src, />0</);
  assert.doesNotMatch(src, /badge.*0|0.*badge/i);
});

test("M2 Døren sidder på Stolen, Mærket og produkt/gave-flader", () => {
  const stolen = read("app/(rummet)/stolen/page.tsx");
  const maerket = read("app/(rummet)/maerket/page.tsx");
  const produkt = read("components/rummet/ProduktFlade.tsx");
  const gave = read("components/rummet/GavekortKoeb.tsx");
  const shell = read("components/rummet/Shell.tsx");
  for (const src of [stolen, maerket, produkt]) {
    assert.match(src, /RummetShell/);
    assert.doesNotMatch(src, /door=\{false\}/);
  }
  assert.match(shell, /\{door \? <Door \/> : null\}/);
  assert.match(maerket, /GavekortKoeb/);
  assert.match(gave, /GIFT_CARDS/);
  assert.match(produkt, /Fri fragt fra 499/);
});

test("M2 opfinder ikke walk-in 900, «fra»-priser eller dummy-navne", () => {
  const src = [
    read("app/(rummet)/stolen/page.tsx"),
    read("app/(rummet)/maerket/page.tsx"),
    read("components/rummet/ArtistKort.tsx"),
    read("components/rummet/GavekortKoeb.tsx"),
    read("components/rummet/ProduktFlade.tsx"),
  ].join("\n");
  for (const forbidden of [
    "Nizar Haddad",
    "Emma Ravn",
    "Kaya Lind",
    "900 kr",
    "fra 900",
    "WALKIN",
    "skriv for pris",
  ]) {
    assert.doesNotMatch(src, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(src, /Artistkortet kommer i næste rum/);
  const gave = read("components/rummet/GavekortKoeb.tsx");
  assert.match(gave, /500/);
  assert.match(gave, /1000/);
  assert.match(gave, /2000/);
  assert.doesNotMatch(gave, /frit/);
  assert.match(gave, /new Set\(\[500, 1000, 2000\]\)/);
  assert.doesNotMatch(gave, /1500|3000|4000/);
});

test("M2 Storefront kaster ikke uden env", async () => {
  const prevT = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const prevD = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  delete process.env.SHOPIFY_STOREFRONT_TOKEN;
  delete process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  try {
    const { productsByHandles, productByHandle, cartQuantity, storefrontConfig } =
      await import("../lib/storefront.ts");
    assert.equal(storefrontConfig().ok, false);
    const empty = await productsByHandles(["sort-hjort-hoodie"]);
    assert.equal(empty.ok, false);
    assert.deepEqual(empty.products, []);
    assert.equal(await productByHandle("sort-hjort-hoodie"), null);
    assert.equal(await cartQuantity("gid://shopify/Cart/1"), 0);
  } finally {
    if (prevT !== undefined) process.env.SHOPIFY_STOREFRONT_TOKEN = prevT;
    else delete process.env.SHOPIFY_STOREFRONT_TOKEN;
    if (prevD !== undefined) process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN = prevD;
    else delete process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  }
});

test("M2 Hylden står to i bredden også på telefonen", () => {
  const css = read("components/rummet/rummet.css");
  const blok = css.match(/\.rum-hylden \{[^}]*\}/);
  assert.ok(blok, "hylden skal have sin egen regel");
  assert.match(blok[0], /grid-template-columns:\s*1fr 1fr/, "to kolonner uden for media query — altså også på mobil");
  const mobil = css.match(/@media \(max-width[^)]*\)\s*\{[^@]*\.rum-hylden\s*\{[^}]*grid-template-columns:\s*1fr\s*;/);
  assert.equal(mobil, null, "ingen regel må sætte hylden tilbage til én i bredden");
});

test("M2 Hylden tømmes ikke tavst af en manglende domæne-env", async () => {
  const prevT = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const prevD = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  process.env.SHOPIFY_STOREFRONT_TOKEN = "prøve-token";
  delete process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  try {
    const { storefrontConfig } = await import("../lib/storefront.ts");
    const cfg = storefrontConfig();
    assert.equal(cfg.ok, true, "token alene skal være nok — domænet er husets, ikke en hemmelighed");
    assert.equal(cfg.domain, "d1qp54-0w.myshopify.com");
  } finally {
    if (prevT !== undefined) process.env.SHOPIFY_STOREFRONT_TOKEN = prevT;
    else delete process.env.SHOPIFY_STOREFRONT_TOKEN;
    if (prevD !== undefined) process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN = prevD;
    else delete process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  }
});

test("M2 Book tid står over folden på telefonen", () => {
  const css = read("components/rummet/rummet.css");
  assert.match(
    css,
    /@media \(max-width: 699px\)\s*\{\s*\.rum-stolen__grid \.rum-kort__foto\s*\{[^}]*max-height/,
    "portrættet skal have et loft på telefonen, ellers ligger Book tid under folden",
  );
  assert.match(css, /\.rum-kort__foto img\s*\{[^}]*object-fit: cover/, "loftet må beskære, ikke klemme ansigtet");
});

test("CI kører på integrationsgrenene, ellers kan Porten aldrig se 'check'", () => {
  const ci = read(".github/workflows/ci.yml");
  const porten = read(".github/workflows/porten.yml");
  const kraevede = porten.match(/`([^`]*)`\.split\(','\)/);
  assert.ok(kraevede, "Porten skal navngive sine påkrævede checks");
  assert.match(kraevede[1], /\bcheck\b/, "Porten kræver jobbet 'check'");
  const trigger = ci.match(/pull_request:[\s\S]*?branches:\s*\[([^\]]*)\]/);
  assert.ok(trigger, "ci.yml skal have en pull_request-trigger");
  for (const gren of ["main", "rummet-m1", "rummet-m2"]) {
    assert.match(trigger[1], new RegExp(`\\b${gren}\\b`), `CI skal køre mod ${gren}`);
  }
  assert.match(ci, /jobs:\s*\n\s*check:/, "jobbet skal hedde 'check'");
});

test("M2 Book tid på Stolen er stadig et klædt hop, række ≥ 44px", () => {
  const stolen = read("app/(rummet)/stolen/page.tsx");
  const kort = read("components/rummet/ArtistKort.tsx");
  const door = read("components/rummet/BookDoor.tsx");
  const huset = read("app/(rummet)/page.tsx");
  const booking = read("app/(rummet)/booking/page.tsx");
  const css = read("components/rummet/rummet.css");
  assert.match(kort, /\/booking\?artist=\$\{artist\.id\}/, "kortets dør bærer artistens id med");
  assert.match(kort, /rum-book--row/);
  assert.match(kort, /Book tid/);
  assert.match(huset, /href="\/booking"/);
  assert.match(door, /https:\/\/inkart\.book\.dk\//);
  assert.match(read("content/booking.yml"), /Videre til booking/);
  assert.doesNotMatch(stolen, /s8|depositum/i);
  const i = css.indexOf(".rum-book--row {");
  assert.notEqual(i, -1, "rum-book--row mangler");
  const krop = css.slice(i, css.indexOf("}", i));
  assert.match(krop, /min-height:\s*44px/);
});

test("M2 edition_ref er handle, ikke GID — dokumenteret", () => {
  const cfg = read("public/admin/config.yml");
  const ind = read("docs/handoff-rummet/M2-INDSTILLINGER.md");
  assert.match(cfg, /Shopify product handle, not GID/);
  assert.match(ind, /edition_ref = Shopify product handle/);
  assert.match(ind, /SHOPIFY_STOREFRONT_TOKEN/);
  assert.match(ind, /NEXT_PUBLIC_SHOPIFY_DOMAIN/);
});

test("M2R navn-familie: kort / langt / legal", () => {
  const nav = read("components/rummet/Nav.tsx");
  const footer = read("components/rummet/Footer.tsx");
  const segl = read("components/rummet/Segl.tsx");
  const layout = read("app/layout.tsx");
  assert.match(nav, /Ink & Art/);
  assert.doesNotMatch(nav, /Ink and Art/);
  // Navnet bor i kontakt.yml — footeren læser det, den ejer det ikke.
  assert.match(footer, /loadKontakt/);
  assert.match(read("content/kontakt.yml"), /Ink and Art Cph ApS/);
  assert.doesNotMatch(read("content/kontakt.yml"), /Ink and Art Cph ·/);
  assert.match(segl, /alt="Ink & Art Copenhagen"/);
  assert.match(segl, /size = 220/);
  assert.match(segl, /placement/);
  const og = layout.slice(layout.indexOf("openGraph"), layout.indexOf("viewport"));
  assert.match(og, /Ink & Art Copenhagen/);
});

test("M2R globals void matcher nat", () => {
  const g = read("app/globals.css");
  const i = g.indexOf(":root {");
  const krop = g.slice(i, g.indexOf("}", i));
  assert.match(krop, /--void:\s*#070707/);
  assert.doesNotMatch(krop, /--void:\s*#0a0a0a/);
});

test("M2R rum-flader: 1680, ingen 560 på slot, væg 4, stolen 3", () => {
  const css = read("components/rummet/rummet.css");
  const i = css.indexOf(".rum-room {");
  assert.notEqual(i, -1, ".rum-room mangler");
  const room = css.slice(i, css.indexOf("}", i));
  assert.match(room, /max-width:\s*min\(100%,\s*1680px\)/);
  assert.doesNotMatch(room, /1100px/);

  const s = css.indexOf(".rum-room__slot {");
  assert.notEqual(s, -1, ".rum-room__slot mangler");
  const slot = css.slice(s, css.indexOf("}", s));
  assert.doesNotMatch(slot, /560px/);
  assert.doesNotMatch(slot, /62svh/);
  assert.doesNotMatch(slot, /42svh/);
  assert.doesNotMatch(slot, /720px/);
  assert.match(slot, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(slot, /width:\s*100%/);

  const plade = css.indexOf(".rum-produkt__plade {");
  const pladek = css.slice(plade, css.indexOf("}", plade));
  assert.match(pladek, /max-width:\s*560px/);

  assert.match(css, /@media \(min-width: 1200px\) \{\s*\.rum-vaeg \{[^}]*grid-template-columns:\s*1fr 1fr 1fr 1fr/s);
  assert.match(css, /@media \(min-width: 1200px\) \{\s*\.rum-stolen__grid \{[^}]*grid-template-columns:\s*1fr 1fr 1fr/s);

  const hy = css.indexOf(".rum-maerket__hylden {");
  const hyk = css.slice(hy, css.indexOf("}", hy));
  assert.doesNotMatch(hyk, /1100px/);
});

test("M2R Huset: segl + kort, Natten/Gaden overlay, ingen frit", () => {
  const huset = read("app/(rummet)/page.tsx");
  const natten = read("app/(rummet)/natten/page.tsx");
  const gaden = read("app/(rummet)/gaden/page.tsx");
  const gave = read("components/rummet/GavekortKoeb.tsx");
  assert.match(huset, /from "@\/components\/rummet\/Segl"/);
  assert.match(huset, /<Segl /);
  // Seglet ligger PÅ heroen — det er husets mærke på husets billede
  // (Stevens kendelse 30/8), ikke en klistermærke i en sidekolonne.
  const heroBlok = huset.slice(huset.indexOf("rum-huset__hero"), huset.indexOf("rum-huset__side"));
  assert.match(heroBlok, /<Segl /);
  const nav = read("components/rummet/Nav.tsx");
  assert.match(huset, /rum-huset__chairs/);
  assert.match(huset, /<ArtistKort/);
  assert.doesNotMatch(natten, /rum-room__on/);
  assert.match(natten, /copy\.tom_titel/);
  assert.match(read("content/natten.yml"), /Ingen nat i aften/);
  assert.doesNotMatch(gaden, /rum-room__on/);
  assert.doesNotMatch(gaden, /\[TAL BEKRÆFTES\]/);
  assert.doesNotMatch(gave, /frit/);
  assert.doesNotMatch(gave, /GIFT_CARD_PRODUCT_URL/);
});
test("M2R runde 2: Gaden tal + footer CVR/telefon", () => {
  const footer = read("components/rummet/Footer.tsx");
  const gaden = read("app/(rummet)/gaden/page.tsx");
  const kontakt = read("content/kontakt.yml");
  // Tallene bor i kontakt.yml; footeren læser dem.
  assert.match(footer, /loadKontakt/);
  assert.match(footer, /CVR \{k\.cvr\}/);
  assert.match(kontakt, /44226413/);
  assert.match(kontakt, /\+4555248608/);
  assert.match(kontakt, /55 24 86 08/);
  assert.match(gaden, /Larsbjørnsstræde 13 kld, 1454 København K/);
  assert.match(gaden, /tel:\+4555248608/);
  assert.match(gaden, /Depositum fra 100 kr/);
  assert.doesNotMatch(gaden, /\[TAL BEKRÆFTES\]/);
});

test("M2R runde 2: Mærket salgsflade på hud", () => {
  const shell = read("components/rummet/Shell.tsx");
  const maerket = read("app/(rummet)/maerket/page.tsx");
  const produkt = read("components/rummet/ProduktFlade.tsx");
  const css = read("components/rummet/rummet.css");
  const nav = read("components/rummet/Nav.tsx");
  assert.match(shell, /tone = "nat"/);
  assert.match(shell, /data-tone=\{tone\}/);
  assert.match(maerket, /tone="salg"/);
  assert.match(produkt, /tone="salg"/);
  assert.match(css, /\[data-tone="salg"\] \.rum-main/);
  assert.match(css, /background:\s*var\(--hud\)/);
  assert.doesNotMatch(css, /#d9cbb4/);
  const vaeg = css.slice(css.indexOf(".rum-vaeg {"), css.indexOf("}", css.indexOf(".rum-vaeg {")));
  assert.match(vaeg, /grid-template-columns:\s*1fr 1fr/);
  assert.doesNotMatch(nav, /Segl/);
  assert.match(nav, /Ink & Art/);
});

test("Huset-hero er et vindue, ikke en biograf", () => {
  const css = read("components/rummet/rummet.css");
  // Heroen har et loft i begge retninger. Det gamle 100svh-hero fyldte
  // hele skærmen med ét makrofoto (QA 30/8) — det må ikke komme igen.
  const i = css.indexOf(".rum-huset__hero > img");
  assert.notEqual(i, -1, "hero-billedreglen mangler");
  const krop = css.slice(i, css.indexOf("}", i));
  assert.match(krop, /height:\s*min\(/, "heroens højde skal have et loft");
  assert.doesNotMatch(css, /calc\(100svh - 88px\)/);
  const s = css.indexOf(".rum-room__slot {");
  const slot = css.slice(s, css.indexOf("}", s));
  assert.doesNotMatch(slot, /max-height/);
});

test("M3 Gaden: ingen [TAL BEKRÆFTES], Ring på, tomme timer udelades", async () => {
  const gaden = read("app/(rummet)/gaden/page.tsx");
  const yml = read("content/gaden.yml");
  const { loadGaden } = await import("../lib/content.ts");
  const info = loadGaden();
  assert.doesNotMatch(gaden, /\[TAL BEKRÆFTES\]/);
  assert.match(gaden, /Ring på/);
  assert.match(gaden, /tel:\+4555248608/);
  // 30/8: huset HAR åbningstider nu (Stevens kendelse: tor-lør til kl. 05).
  // Reglen der består: tider kommer fra YAML og opdigtes aldrig i kode.
  assert.match(yml, /Torsdag, fredag og lørdag/);
  assert.match(info.aabent, /10–05/);
  assert.match(yml, /walk_in:\s*""/);
  assert.equal(info.walk_in, "");
  assert.doesNotMatch(gaden, /DEMO G-01/);
  assert.match(gaden, /gaden\.aabent \?/);
  assert.match(gaden, /gaden\.walk_in \?/);
});

test("M3 Natten: plakatfoto fra YAML, tom-tilstand uændret, ingen DEMO H-02", () => {
  const natten = read("app/(rummet)/natten/page.tsx");
  assert.match(natten, /nat\.plakatfoto/);
  // Tom-tilstandens ord bor i natten.yml (S574) — og siden forklarer konceptet.
  assert.match(natten, /copy\.tom_titel/);
  assert.match(natten, /rum-natten__intro/);
  assert.match(read("content/natten.yml"), /Ingen nat i aften/);
  assert.doesNotMatch(natten, /DEMO H-02/);
  assert.doesNotMatch(natten, /rum-demo/);
});

test("M4 /booking: depositum-sætning, variant, Videre til booking", () => {
  const booking = read("app/(rummet)/booking/page.tsx");
  const bookingYml = read("content/booking.yml");
  assert.match(bookingYml, /Depositum 100 kr — fragår i prisen/);
  assert.match(booking, /cartUrl\(/);
  assert.match(bookingYml, /Videre til booking/);
  assert.match(booking, /BookDoor/);
  const door = read("components/rummet/BookDoor.tsx");
  assert.match(door, /label = "Book tid"/);
  assert.match(door, /https:\/\/inkart\.book\.dk\//);
});

test("M4 /booking/tak: ubetalt copy, betalt-gren, ingen konsekvens-kundetekst", () => {
  const tak = read("app/(rummet)/booking/tak/page.tsx");
  assert.match(tak, /Din tid er sat\. Betal depositum nu/);
  assert.match(tak, /params\.betalt/);
  assert.match(tak, /Depositum er betalt/);
  assert.match(tak, /\[AFVENTER STEVEN\] konsekvens ved ubetalt/);
  assert.match(tak, /\/\/ \[AFVENTER STEVEN\] konsekvens ved ubetalt/);
});

test("U7 Decap GitHub OAuth-config", () => {
  const cfg = read("public/admin/config.yml");
  const html = read("public/admin/index.html");
  assert.match(cfg, /name:\s*github/);
  assert.match(cfg, /base_url:\s*https:\/\/oauth\.bygmedai\.dk/);
  assert.match(cfg, /repo:\s*Bygmedai\/inkandart\.dk/);
  assert.match(cfg, /branch:\s*main/);
  assert.match(cfg, /publish_mode:\s*simple/);
  assert.doesNotMatch(cfg, /git-gateway/);
  assert.doesNotMatch(cfg, /local_backend/);
  assert.match(html, /\.\/decap-cms\.js/);
  assert.doesNotMatch(html, /unpkg/);
  assert.ok(existsSync(join(root, "public/admin/decap-cms.js")), "decap-cms.js mangler");
});

test("ingen [TAL BEKRÆFTES] under app/(rummet) kundeflader", () => {
  const dir = join(root, "app/(rummet)");
  const hits = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx|ts|jsx|js)$/.test(name)) {
        const src = readFileSync(p, "utf8");
        if (/\[TAL BEKRÆFTES\]/.test(src)) hits.push(p.slice(root.length + 1));
      }
    }
  };
  walk(dir);
  assert.deepEqual(hits, []);
});

test("ArtistKort og Huset går via /booking; række ≥ 44px", () => {
  const kort = read("components/rummet/ArtistKort.tsx");
  const huset = read("app/(rummet)/page.tsx");
  const css = read("components/rummet/rummet.css");
  assert.match(kort, /\/booking\?artist=/, "kortet går via /booking med kontekst");
  assert.match(huset, /href="\/booking"/);
  assert.doesNotMatch(kort, /BookDoor/);
  const i = css.indexOf(".rum-book--row {");
  assert.notEqual(i, -1, "rum-book--row mangler");
  const krop = css.slice(i, css.indexOf("}", i));
  assert.match(krop, /min-height:\s*44px/);
});
test("F14 booking er salgsflade på hud med handling først", () => {
  const booking = read("app/(rummet)/booking/page.tsx");
  const tak = read("app/(rummet)/booking/tak/page.tsx");
  const css = read("components/rummet/rummet.css");
  assert.match(booking, /tone="salg"/);
  assert.match(tak, /tone="salg"/);
  assert.match(booking, /rum-booking__pris/);
  // S573: booking og kvitteringen viser receptionen (H-04) — det sted kunden
  // faktisk ankommer til — i stedet for et moerkt studiebillede. Maalt: lys
  // paa folden 54,5 % -> 68,6 % ved 1440.
  assert.match(read("content/booking.yml"), /H-04\.jpg/);
  assert.match(tak, /H-04\.jpg/);
  assert.match(read("content/booking.yml"), /Depositum 100 kr — fragår i prisen/);
  assert.match(booking, /copy\.door_label/);
  const koeb = booking.indexOf("rum-booking__koeb");
  const plade = booking.indexOf("rum-booking__plade");
  assert.ok(koeb !== -1 && plade !== -1 && koeb < plade, "handling før billede");
  assert.match(css, /\.rum-booking__pris/);
  assert.match(css, /font-size:\s*20px/);
  assert.doesNotMatch(css, /\.rum-skilt/);
});

test("F15 lyst værk på Huset, S-04 på Stolen", () => {
  const vaerker = read("content/vaerker.yml");
  const artists = read("content/artists.yml");
  const v01 = vaerker.slice(vaerker.indexOf("- id: V-01"), vaerker.indexOf("- id: V-02"));
  const v06 = vaerker.slice(vaerker.indexOf("- id: V-06"), vaerker.indexOf("- id: V-07"));
  assert.match(v06, /i_dag:\s*true/);
  assert.match(v01, /i_dag:\s*false/);
  const nizar = artists.slice(artists.indexOf("- id: nizar"), artists.indexOf("- id: emma"));
  assert.match(nizar, /S-04\.jpg/);
});

test("F16 dock 12px, DEMO 11px, ingen TAL i layout-kommentar", () => {
  const css = read("components/rummet/rummet.css");
  const layout = read("app/layout.tsx");
  const dock = css.indexOf(".rum-dock a {");
  const dockk = css.slice(dock, css.indexOf("}", dock));
  assert.match(dockk, /font-size:\s*12px/);
  const demo = css.indexOf(".rum-demo {");
  const demok = css.slice(demo, css.indexOf("}", demo));
  assert.match(demok, /font-size:\s*11px/);
  assert.doesNotMatch(layout, /TAL BEKRÆFTES/);
});

test("Blackbook tager email, ikke telefon", () => {
  const door = read("components/rummet/Door.tsx");
  assert.match(door, /type="email"/);
  assert.match(door, /name="email"/);
  assert.match(door, /Email/);
  assert.doesNotMatch(door, /Telefonnummer/);
  assert.doesNotMatch(door, /type="tel"/);
  assert.match(door, /Vi sender kun natten/);
  assert.doesNotMatch(door, /Afmeld med STOP/);
  assert.match(door, /Afmeld nederst i mailen/);
});

test("Plader viser ikke DEMO-chip og ingen rum-billedtekst", () => {
  const plade = read("components/rummet/Plade.tsx");
  const yaml = read("content/vaerker.yml");
  assert.doesNotMatch(plade, /rum-demo/);
  assert.doesNotMatch(plade, /rum-billedtekst/);
  assert.doesNotMatch(yaml, /demo:\s*true/);
  assert.match(yaml, /billedtekst:/);
  assert.match(yaml, /håndled/);
});

test("ingen synlig billedtekst under fotos (Stolen/Huset/Gaden/booking/Natten)", () => {
  const kort = read("components/rummet/ArtistKort.tsx");
  const huset = read("app/(rummet)/page.tsx");
  const stolen = read("app/(rummet)/stolen/page.tsx");
  const gaden = read("app/(rummet)/gaden/page.tsx");
  const booking = read("app/(rummet)/booking/page.tsx");
  const tak = read("app/(rummet)/booking/tak/page.tsx");
  const natten = read("app/(rummet)/natten/page.tsx");
  const plade = read("components/rummet/Plade.tsx");

  for (const [name, src] of [
    ["ArtistKort", kort],
    ["Huset", huset],
    ["Stolen", stolen],
    ["Gaden", gaden],
    ["Booking", booking],
    ["Tak", tak],
    ["Natten", natten],
    ["Plade", plade],
  ]) {
    assert.doesNotMatch(src, /rum-billedtekst/, `${name} renderer rum-billedtekst`);
    assert.doesNotMatch(src, /rum-demo/, `${name} har DEMO-chip`);
  }

  const artistJsx = kort + huset + stolen;
  assert.doesNotMatch(artistJsx, /Station ovenfra/);
  assert.doesNotMatch(artistJsx, /Handskede hænder/);
  assert.doesNotMatch(artistJsx, /Tom stol, station/);
  assert.doesNotMatch(booking + tak, /Stolen under lampen/);
});

/**
 * S573: /booking er husets pengeside — den var ikke i sitemap.
 * En side Google ikke får at vide om, findes kun for dem der allerede
 * kender den. Alle seks Rummet-flader skal stå der.
 */
test("alle Rummets flader står i sitemap", () => {
  const sm = readFileSync(join(root, "app/sitemap.ts"), "utf8");
  for (const rute of ["/", "/stolen", "/maerket", "/natten", "/gaden", "/booking"]) {
    const m = rute === "/" ? /inkandart\.dk\/"/ : new RegExp(`inkandart\\.dk${rute}"`);
    assert.match(sm, m, `${rute} mangler i sitemap`);
  }
});

test("S573 booking h1 Booking", () => {
  const booking = read("app/(rummet)/booking/page.tsx");
  assert.match(booking, /<h1/);
  assert.match(booking, /rum-room__title/);
  assert.match(booking, /Booking/);
});

test("S573 Huset h1", () => {
  const huset = read("app/(rummet)/page.tsx");
  const yml = read("content/huset.yml");
  assert.match(huset, /rum-huset__title/);
  assert.match(yml, /Tatovering og piercing i Pisserenden/);
  assert.match(huset, /className="rum-label">Huset</);
  assert.match(huset, /tel:\$\{kontakt\.telefon_e164\}/);
  assert.match(yml, /cta_book: Book tid/);
});

test("S573 salg-label, slot 4/5, rum-tel, booking go", () => {
  const css = read("components/rummet/rummet.css");
  assert.match(css, /\[data-tone="salg"\] \.rum-label/);
  assert.match(css, /#5f5a54/);
  assert.match(css, /@media \(max-width:\s*899px\) \{[\s\S]*?\.rum-room__slot \{[\s\S]*?4\s*\/\s*5/);
  const tel = css.indexOf(".rum-tel {");
  assert.notEqual(tel, -1, "rum-tel mangler");
  const telk = css.slice(tel, css.indexOf("}", tel));
  assert.match(telk, /min-height:\s*44px/);
  assert.match(css, /\.rum-booking__go/);
});

test("S573 Gavekort label", () => {
  const gave = read("components/rummet/GavekortKoeb.tsx");
  assert.match(gave, /className="rum-label"/);
  assert.match(gave, /Gavekort/);
});

test("S573 Door afmelding", () => {
  const door = read("components/rummet/Door.tsx");
  assert.match(door, /Afmeld nederst i mailen/);
});

test("S573 Gaden walk-in + tel", () => {
  const gaden = read("app/(rummet)/gaden/page.tsx");
  assert.match(gaden, /Walk-in når der er en fri stol/);
  assert.match(gaden, /tel:\+4555248608/);
  assert.match(gaden, /rum-tel/);
});

test("S573 Stolen walk-in", () => {
  const stolen = read("app/(rummet)/stolen/page.tsx");
  assert.match(stolen, /Walk-in når der er en fri stol/);
});

test("G1 Huset intro i første fold", () => {
  const huset = read("app/(rummet)/page.tsx");
  const css = read("components/rummet/rummet.css");
  const yml = read("content/huset.yml");
  assert.match(huset, /rum-huset__intro/);
  assert.match(huset, /className="rum-label">Huset</);
  assert.match(huset, /<h1 className="rum-huset__title rum-poster">\{fold\.titel\}<\/h1>/);
  assert.match(yml, /Tatovering og piercing i Pisserenden/);
  assert.match(
    yml,
    /Larsbjørnsstræde 13, kælderen\. Walk-in når der er en fri stol — ellers book\./,
  );
  assert.match(huset, /id="booking"/);
  assert.match(huset, /href="\/booking"/);
  assert.match(huset, /className="rum-tel"/);
  const intro = huset.indexOf("rum-huset__intro");
  const hero = huset.indexOf("rum-huset__hero");
  const bookingId = huset.indexOf('id="booking"');
  assert.ok(intro !== -1 && hero !== -1 && intro < hero, "intro før hero");
  assert.ok(bookingId !== -1 && bookingId < hero, "id=booking i fold-CTA");
  assert.equal((huset.match(/id="booking"/g) || []).length, 1);
  assert.doesNotMatch(huset, /className="rum-fact"/);
  assert.doesNotMatch(huset, /rum-room__title/);
  const introCss = css.indexOf(".rum-huset__intro {");
  assert.notEqual(introCss, -1, "rum-huset__intro mangler");
  const introKrop = css.slice(introCss, css.indexOf("}", introCss));
  assert.match(introKrop, /grid-column:\s*1\s*\/\s*-1/);
});

test("G2 Natten har vej ud", () => {
  const natten = read("app/(rummet)/natten/page.tsx");
  const css = read("components/rummet/rummet.css");
  assert.match(natten, /from "@\/components\/rummet\/Door"/);
  assert.match(natten, /<Door variant="inline"/);
  assert.match(natten, /href="\/booking"/);
  assert.match(natten, /href="\/gaden"/);
  assert.match(natten, /door=\{false\}/);
  assert.match(natten, /copy\.tom_titel/);
  assert.match(natten, /copy\.tom_linje/);
  assert.match(natten, /rum-natten__out/);
  const out = css.indexOf(".rum-natten__out {");
  assert.notEqual(out, -1, "rum-natten__out mangler");
});

test("G3 booking-foto max-height 240px under 899px", () => {
  const css = read("components/rummet/rummet.css");
  assert.match(
    css,
    /@media \(max-width:\s*899px\) \{[\s\S]*?\.rum-booking__plade img \{[\s\S]*?max-height:\s*240px/,
  );
});

/**
 * S573: en ny artist maa ikke faa opdigtet indhold med paa vejen ind.
 * Annas bio og vagtskema er ikke bekraeftet endnu, og tomme felter
 * udelades — de fyldes ikke med noget der lyder rigtigt.
 */
test("Anna er paa uden opdigtet bio eller vagtskema", async () => {
  const { loadHouse, chairArtists } = await import("../lib/content.ts");
  const anna = chairArtists(loadHouse().artists).find((a) => a.id === "anna");
  assert.ok(anna, "Anna skal sidde i stolen");
  assert.equal(anna.fornavn, "Anna Ogłuszka");
  assert.equal(anna.haandvaerk, "Piercer");
  assert.ok(!anna.periode_til, "ingen slutdato — hun er fast");
  // Kun de linjer der kan naa en kunde — YAML-kommentarer er byggeplads.
  const data = readFileSync(join(root, "content/artists.yml"), "utf8")
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"))
    .join("\n");
  assert.doesNotMatch(data, /\[AFVENTER\]|\[TAL BEKRÆFTES\]/, "byggepladsens sprog gaar aldrig live");
});

/**
 * S573: en artist uden kalender maa ikke tilbyde en tid.
 * Anna starter 31/8 og er walk-in indtil hun er sat op i Book.dk.
 * Kortet skal sige walk-in — ikke «Book tid» til en doer der ikke aabner.
 */
test("en artist uden booking faar walk-in, ikke en tid vi ikke kan give", async () => {
  const { loadHouse, chairArtists } = await import("../lib/content.ts");
  const chairs = chairArtists(loadHouse().artists);
  const anna = chairs.find((a) => a.id === "anna");
  assert.equal(anna.booking, false, "Anna er walk-in indtil kalenderen staar");
  for (const a of chairs) {
    if (a.id !== "anna") assert.equal(a.booking, true, `${a.id} skal kunne bookes`);
  }
  const kort = readFileSync(join(root, "components/rummet/ArtistKort.tsx"), "utf8");
  assert.match(kort, /artist\.booking \?/, "kortet skal forgrene paa booking");
  assert.match(kort, /Walk-in — kom forbi/);
});

test("S573 QA: artisterne er døre, ikke plakater", async () => {
  const kort = read("components/rummet/ArtistKort.tsx");
  // Foto og navn linker til artistens egen side.
  assert.match(kort, /href = pending \? null : `\/stolen\/\$\{artist\.id\}`/);
  assert.match(kort, /rum-kort__link/);
  // Perioden kommer fra data — aldrig et hardcodet «Fast».
  assert.match(kort, /periodeLabel\(artist\)/);
  assert.doesNotMatch(kort, />Fast</);
  // Siden findes, og den genereres fra artists.yml.
  const side = read("app/(rummet)/stolen/[id]/page.tsx");
  assert.match(side, /generateStaticParams/);
  assert.match(side, /profiledArtists/);
  assert.match(side, /notFound\(\)/);
  const { loadHouse, profiledArtists } = await import("../lib/content.ts");
  const profiler = profiledArtists(loadHouse().artists);
  assert.ok(profiler.length >= 3, "mindst tre artister skal have en side");
  for (const a of profiler) assert.ok(a.id && a.fornavn);
});

test("S573 QA: Væggens chips fører aldrig ind i et tomt rum", async () => {
  const { loadHouse, wallChipArtists, visibleCountForArtist } = await import("../lib/content.ts");
  const house = loadHouse();
  const chips = wallChipArtists(house.artists, house.vaerker);
  for (const a of chips) {
    assert.ok(
      visibleCountForArtist(house.vaerker, a.id) > 0,
      `${a.id} har en chip men ingen værker — det er en blindgyde`,
    );
  }
  // Og rammer nogen alligevel et tomt filter via URL, står der en forklaring.
  const maerket = read("app/(rummet)/maerket/page.tsx");
  assert.match(maerket, /wall\.length === 0 && filteredArtist/);
  assert.match(maerket, /på væggen endnu/);
});

test("S573 QA: footerens handlinger kan rammes med en tommelfinger", () => {
  const css = read("components/rummet/rummet.css");
  const i = css.indexOf(".rum-footer a {");
  assert.notEqual(i, -1);
  const krop = css.slice(i, css.indexOf("}", i));
  assert.match(krop, /min-height:\s*44px/);
});

test("S573 QA: kontakt.yml er den eneste kilde til husets nummer", () => {
  // Ingen komponent eller side i Rummet må bære nummeret selv.
  const filer = [
    "app/(rummet)/page.tsx",
    "app/(rummet)/stolen/page.tsx",
    "app/(rummet)/stolen/[id]/page.tsx",
    "components/rummet/Footer.tsx",
    "components/rummet/ArtistKort.tsx",
  ];
  for (const f of filer) {
    assert.doesNotMatch(read(f), /\+4555248608|55 24 86 08/, `${f} hardcoder telefonnummeret`);
  }
});

test("S573 QA: sitemap kender artistsiderne og lyver ikke om /blackbook", () => {
  const sitemap = read("app/sitemap.ts");
  assert.match(sitemap, /profiledArtists/);
  assert.match(sitemap, /stolen\/\$\{a\.id\}/);
  // /blackbook er en 307 til /#doer — en redirect er ikke en side.
  assert.doesNotMatch(sitemap, /\/blackbook/);
});

test("S574: Decap kender hver content-fil koden læser", () => {
  const cms = read("public/admin/config.yml");
  // Læser koden en fil, skal Sonja kunne redigere den uden en editor.
  for (const fil of [
    "content/artists.yml",
    "content/vaerker.yml",
    "content/nat.yml",
    "content/huset.yml",
    "content/kontakt.yml",
    "content/gaden.yml",
    "content/booking.yml",
    "content/natten.yml",
    "content/faq.yml",
    "content/faq.en.yml",
    "content/piercing.yml",
    "content/huset.en.yml",
    "content/betingelser.yml",
    "content/betingelser.en.yml",
  ]) {
    assert.ok(cms.includes(fil), `${fil} mangler i Decap — Sonja kan ikke redigere den`);
  }
  // Og booking-kontakten: Anna skal kunne tændes fra CMS'et, ikke fra en PR.
  assert.match(cms, /name: booking, widget: boolean/);
});

test("S574 Vilde-fund: links i etiket-linjer er trykmål, ikke tekst", () => {
  const css = read("components/rummet/rummet.css");
  const i = css.indexOf(".rum-label a {");
  assert.notEqual(i, -1, "mønster-reglen for etiket-links mangler");
  const krop = css.slice(i, css.indexOf("}", i));
  assert.match(krop, /min-height:\s*44px/);
});

test("S574: en artists egne ord står på hendes side — og kun hendes egne", async () => {
  const { loadHouse, artistById } = await import("../lib/content.ts");
  const artists = loadHouse().artists;
  const emma = artistById(artists, "emma");
  assert.ok(emma.bio.length > 100, "Emmas bio (hendes præsentation) skal være på siden");
  // Anna har ikke skrevet en bio — så har hun heller ikke en.
  assert.equal(artistById(artists, "anna").bio, "", "vi digter ikke en bio");
  const side = read("app/(rummet)/stolen/[id]/page.tsx");
  assert.match(side, /artist\.bio \?/, "bio uden indhold udelades");
});

test("S574: booking er en trappe med kontekst, ikke to konkurrerende links", async () => {
  const side = read("app/(rummet)/booking/page.tsx");
  assert.match(side, /rum-booking__trin/, "trinnene skal være en nummereret trappe");
  assert.match(side, /searchParams/, "siden skal kunne modtage ?artist=");
  assert.match(side, /Hos \{artist\.fornavn\}/, "konteksten fra artistens side må ikke forsvinde");
  assert.match(side, /loadBookingCopy/, "ordene bor i booking.yml");
  assert.doesNotMatch(side, /"53492757627208"/, "variant-id'et bor i commerce.ts, ikke i en side");
  // Døren fra artistsiden og kortet bærer konteksten med.
  assert.match(read("app/(rummet)/stolen/[id]/page.tsx"), /\/booking\?artist=\$\{artist\.id\}/);
  assert.match(read("components/rummet/ArtistKort.tsx"), /\/booking\?artist=\$\{artist\.id\}/);
});

test("S574: Natten forklarer sig — og viser kun plakat når der ER en nat", () => {
  const side = read("app/(rummet)/natten/page.tsx");
  assert.match(side, /loadNattenCopy/, "sidens ord bor i natten.yml");
  assert.match(side, /rum-natten__intro/, "intro-linjen skal stå under titlen");
  // Fotoet må kun stå inde i nat-grenen — tom-tilstanden er tekst og dør.
  const tomBlok = side.slice(side.indexOf('className="rum-empty"'), side.indexOf("</main>"));
  assert.doesNotMatch(tomBlok, /<img/, "tom-tilstanden viser ikke et umotiveret foto");
  const css = read("components/rummet/rummet.css");
  const i = css.indexOf(".rum-empty__title {");
  const krop = css.slice(i, css.indexOf("}", i));
  assert.match(krop, /color:\s*var\(--hud\)/, "tom-titlen skal kunne læses — ikke grå på sort");
});

test("K6: den engelske forside bor i Rummet, ikke i Emerge", () => {
  const en = read("app/(rummet)/en/page.tsx");
  assert.match(en, /RummetShell/, "EN-forsiden skal bære Rummets dragt");
  assert.match(en, /loadHusetForsideEn/, "ordene bor i huset.en.yml");
  assert.match(en, /lang="en"/);
  // Ingen døde døre: alle interne href'er på EN-forsiden skal findes.
  for (const m of en.matchAll(/href="(\/[a-z-]*)"/g)) {
    assert.ok(
      ["/booking", "/stolen", "/"].some((r) => m[1] === r || m[1].startsWith("/stolen")),
      `uventet dør på EN-forsiden: ${m[1]}`,
    );
  }
  assert.equal(existsSync(join(root, "app/(emerge)/en/page.tsx")), false, "Emerge-EN-forsiden er pensioneret");
  const yml = read("content/huset.en.yml");
  assert.match(yml, /Book a session/);
});

test("S574 hullerne: tider i folden, FAQ på begge sprog, piercing-tekst, konsultation", async () => {
  const { loadHusetForside, loadHusetForsideEn, loadFaq, loadFaqEn, loadPiercing, loadBookingCopy, loadKontakt } =
    await import("../lib/content.ts");
  assert.match(loadHusetForside().tider, /[Tt]orsdag/, "H1: tiderne skal stå i folden");
  assert.match(loadHusetForsideEn().tider, /Thursday/);
  assert.ok(loadFaq().sporgsmal.length >= 8, "H5: FAQ skal bære husets svar");
  assert.equal(loadFaq().sporgsmal.length, loadFaqEn().sporgsmal.length, "EN-FAQ følger DA");
  const pi = loadPiercing();
  assert.match(pi.tekst, /frihed|fejring|markør/i, "H6: teksten bærer Stevens vinkel");
  assert.match(pi.priser, /efter aftale/i);
  assert.match(loadBookingCopy().konsultation, /gratis og uforpligtende/, "H3: Iron & Ink-standarden");
  assert.equal(loadKontakt().instagram, "ink.and.art.cph", "H2: husets handle");
  const footer = read("components/rummet/Footer.tsx");
  assert.match(footer, /instagram\.com/);
  assert.match(footer, /href="\/faq"/);
});
