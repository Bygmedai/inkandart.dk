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
  assert.deepEqual(names, ["Nizar Saad", "Emma Winding"]);
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
  ].join("\n");
  for (const forbidden of ["Nizar Haddad", "Emma Ravn", "Kaya Lind", "900 kr", "fra 900", "gonzo"]) {
    assert.doesNotMatch(src, new RegExp(forbidden.replace(/[.*]/g, "\\$&")));
  }
  assert.match(src, /Nizar Saad/);
  assert.match(src, /Emma Winding/);
  assert.match(src, /Nylavet/);
  assert.match(src, /I stolen/);
  assert.match(src, /Walk-in når der er en fri stol — ellers book\. Larsbjørnsstræde 13, kælderen\./);
  assert.doesNotMatch(src, /Værket i dag/);
  assert.doesNotMatch(src, />\s*I huset\s*</);
  assert.doesNotMatch(src, /Walk-in og tider/);
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
  assert.match(huset, /rum-huset__maerke/);
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
  assert.match(kort, /værker i arkivet/);
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

test("M2 Hylden er tom uden edition_ref og siger den rigtige sætning", () => {
  const maerket = read("app/(rummet)/maerket/page.tsx");
  const yml = read("content/vaerker.yml");
  assert.match(maerket, /Vi laver ikke varer uden værk\./);
  assert.match(maerket, /Hylden/);
  assert.match(maerket, /Væggen/);
  assert.doesNotMatch(yml, /edition_ref:\s*"[^"]+"/);
  assert.doesNotMatch(yml, /edition_ref:\s*[A-Za-z0-9]/);
  assert.doesNotMatch(maerket, /Artistkortet kommer i næste rum/);
  assert.doesNotMatch(maerket, /Væggen bygges i næste rum/);
  assert.doesNotMatch(maerket, /href="\/shop"/);
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

test("M2 Book tid på Stolen er stadig et klædt hop, række ≥ 44px", () => {
  const stolen = read("app/(rummet)/stolen/page.tsx");
  const kort = read("components/rummet/ArtistKort.tsx");
  const door = read("components/rummet/BookDoor.tsx");
  const huset = read("app/(rummet)/page.tsx");
  const booking = read("app/(rummet)/booking/page.tsx");
  const css = read("components/rummet/rummet.css");
  assert.match(kort, /href="\/booking"/);
  assert.match(kort, /rum-book--row/);
  assert.match(kort, /Book tid/);
  assert.match(huset, /href="\/booking"/);
  assert.match(door, /https:\/\/inkart\.book\.dk\//);
  assert.match(booking, /Videre til booking/);
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
  assert.match(footer, /Ink and Art Cph ApS/);
  assert.doesNotMatch(footer, /Ink and Art Cph ·/);
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
  assert.match(huset, /rum-huset__maerke/);
  const pladeBlok = huset.slice(huset.indexOf("rum-huset__plade"), huset.indexOf("rum-huset__side"));
  assert.doesNotMatch(pladeBlok, /<Segl /);
  const nav = read("components/rummet/Nav.tsx");
  assert.match(huset, /rum-huset__chairs/);
  assert.match(huset, /className="rum-kort rum-chair"/);
  assert.doesNotMatch(natten, /rum-room__on/);
  assert.match(natten, /Ingen nat i aften/);
  assert.doesNotMatch(gaden, /rum-room__on/);
  assert.doesNotMatch(gaden, /\[TAL BEKRÆFTES\]/);
  assert.doesNotMatch(gave, /frit/);
  assert.doesNotMatch(gave, /GIFT_CARD_PRODUCT_URL/);
});
test("M2R runde 2: Gaden tal + footer CVR/telefon", () => {
  const footer = read("components/rummet/Footer.tsx");
  const gaden = read("app/(rummet)/gaden/page.tsx");
  assert.match(footer, /CVR 44226413/);
  assert.match(footer, /tel:\+4555248608/);
  assert.match(footer, /55 24 86 08/);
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

test("M2R runde 2: Huset mobil 58svh, slot uden px-cap", () => {
  const css = read("components/rummet/rummet.css");
  assert.match(css, /min-height:\s*58svh/);
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
  assert.match(yml, /aabent:\s*""/);
  assert.match(yml, /walk_in:\s*""/);
  assert.equal(info.aabent, "");
  assert.equal(info.walk_in, "");
  assert.doesNotMatch(gaden, /DEMO G-01/);
  assert.match(gaden, /gaden\.aabent \?/);
  assert.match(gaden, /gaden\.walk_in \?/);
});

test("M3 Natten: plakatfoto fra YAML, tom-tilstand uændret, ingen DEMO H-02", () => {
  const natten = read("app/(rummet)/natten/page.tsx");
  assert.match(natten, /nat\.plakatfoto/);
  assert.match(natten, /Ingen nat i aften/);
  assert.match(natten, /Næste nat står i Blackbook/);
  assert.doesNotMatch(natten, /DEMO H-02/);
  assert.doesNotMatch(natten, /rum-demo/);
});

test("M4 /booking: depositum-sætning, variant, Videre til booking", () => {
  const booking = read("app/(rummet)/booking/page.tsx");
  assert.match(booking, /Depositum 100 kr — fragår i prisen/);
  assert.match(booking, /53492757627208|cartUrl\(/);
  assert.match(booking, /Videre til booking/);
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
  assert.match(kort, /href="\/booking"/);
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
  assert.match(booking, /H-01\.jpg/);
  assert.match(tak, /H-01\.jpg/);
  assert.match(booking, /Depositum 100 kr — fragår i prisen/);
  assert.match(booking, /Videre til booking/);
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
});

test("Plader viser billedtekst, ikke DEMO-chip", () => {
  const plade = read("components/rummet/Plade.tsx");
  const yaml = read("content/vaerker.yml");
  assert.doesNotMatch(plade, /rum-demo/);
  assert.match(plade, /billedtekst/);
  assert.doesNotMatch(yaml, /demo:\s*true/);
  assert.match(yaml, /billedtekst:/);
  assert.match(yaml, /håndled/);
});
