import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
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
  assert.match(label, /V-01/);
  assert.doesNotMatch(label, /Sort hjort|masterpiece/i);

  // Empty-state functions with explicit data (negativ + positiv).
  assert.equal(guestState([{ stol: true, periode: "gaest", aktiv: false, fornavn: "", id: "g", haandvaerk: "", foto: "" }]).kind, "empty");
  assert.equal(guestState([{ stol: true, periode: "gaest", aktiv: true, fornavn: "Ada", id: "g", haandvaerk: "", foto: "" }]).kind, "named");
  assert.equal(shelfEmpty([{ maa_vises: true, edition_ref: "gid://1", id: "x", titel: "", artist: "", aar: "", arkivnr: "", foto: "", demo: false, i_dag: false }]), false);
  assert.equal(activeNat([{ aktiv: true, nr: "07", dato: "", navne: [], tidsrum: "", plakatfoto: "" }])?.nr, "07");
});

test("ingen dummy-navne eller opdigtede priser på Huset", () => {
  const src = [
    read("app/page.tsx"),
    read("content/artists.yml"),
    read("content/vaerker.yml"),
    read("content/nat.yml"),
  ].join("\n");
  for (const forbidden of ["Nizar Haddad", "Emma Ravn", "Kaya Lind", "900 kr", "fra 900", "gonzo"]) {
    assert.doesNotMatch(src, new RegExp(forbidden.replace(/[.*]/g, "\\$&")));
  }
  assert.match(src, /Nizar Saad/);
  assert.match(src, /Emma Winding/);
  assert.match(src, /\[TAL BEKRÆFTES\]/);
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

  const layout = read("app/layout.tsx");
  assert.match(layout, /Anton-latin\.woff2/);
  assert.match(layout, /InstrumentSans-latin\.woff2/);
  assert.doesNotMatch(layout, /fonts\.googleapis\.com/);
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
  for (const p of ["app/stolen/page.tsx", "app/maerket/page.tsx", "app/natten/page.tsx", "app/gaden/page.tsx"]) {
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

test("Book.dk er et klædt hop, ikke et embed", () => {
  const door = read("components/rummet/BookDoor.tsx");
  assert.match(door, /https:\/\/inkart\.book\.dk\//);
  assert.doesNotMatch(door, /<iframe/);
});
