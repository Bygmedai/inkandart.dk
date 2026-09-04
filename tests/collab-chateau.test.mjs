import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const side = read("app/(da)/(rummet)/collab/chateau/page.tsx");
const flade = read("components/rummet/ChateauCollabFlade.tsx");
const hero = read("components/rummet/ChateauHero.tsx");
const css = read("components/rummet/rummet.css");

/** Synlig copy — strip kommentarer. */
const tekst = (flade + side)
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

test("collab/chateau er noindex, nofollow, nocache", () => {
  assert.match(side, /index: false/);
  assert.match(side, /follow: false/);
  assert.match(side, /nocache: true/);
});

test("collab/chateau står ikke i nav eller sitemap", () => {
  assert.doesNotMatch(read("components/rummet/Nav.tsx"), /collab|chateau/i);
  assert.doesNotMatch(read("app/sitemap.ts"), /collab|chateau/i);
});

test("titel er gæste-facing flash upstairs", () => {
  assert.match(side, /Flash upstairs at Chateau Motel/);
});

test("hero respekterer prefers-reduced-motion", () => {
  assert.match(hero, /prefers-reduced-motion/);
  assert.match(hero, /chateau-loop\.mp4/);
  assert.match(hero, /chateau-hero-stol\.png/);
  assert.match(hero, /muted/);
  assert.match(hero, /autoPlay|autoplay/i);
});

test("medier ligger klar under public/collab/chateau", () => {
  for (const f of [
    "chateau-hero-stol.png",
    "chateau-trapperum.png",
    "chateau-flash-setup.png",
    "chateau-loop.mp4",
  ]) {
    assert.ok(
      existsSync(join(root, "public/collab/chateau", f)),
      `mangler ${f}`,
    );
  }
});

test("copy undgår forbudte hype/CTA-linjer", () => {
  assert.doesNotMatch(tekst, /Roskilde|byens første|Book\.dk|temp tattoo/i);
  assert.doesNotMatch(tekst, /køb billet|900\s*kr/i);
  assert.doesNotMatch(tekst, /audacious souls/i);
});

test("forbyder B2B / partner-ops fraser", () => {
  assert.doesNotMatch(tekst, /walkthrough/i);
  assert.doesNotMatch(tekst, /myndighed/i);
  assert.doesNotMatch(tekst, /I stiller/);
  assert.doesNotMatch(tekst, /Vi medbringer/);
  assert.doesNotMatch(tekst, /[Cc]ut[- ]?aftales/);
  assert.doesNotMatch(tekst, /oskar/i);
  assert.doesNotMatch(tekst, /steven@bygmedai/i);
  assert.doesNotMatch(tekst, /Næste skridt/);
  assert.doesNotMatch(tekst, /Hvad Chateau får/);
  assert.doesNotMatch(tekst, /Økonomi/);
  assert.doesNotMatch(tekst, /Monir/);
  assert.doesNotMatch(tekst, /Simone \+ Steven/);
});

test("kontakt er booking@ for gæster", () => {
  assert.match(flade, /booking@inkandart\.dk/);
  assert.match(flade, /Skriv dig op/);
});

test("hero er gæste-atmosfære, ikke ops-brochure", () => {
  assert.match(flade, /Flash upstairs at Chateau Motel/);
  assert.match(flade, /Flash ovenpå hos Chateau Motel/);
  assert.doesNotMatch(
    flade.slice(0, flade.indexOf("chateau-collab__rail")),
    /Håndvask|engangsudstyr|Depositum|walkthrough/i,
  );
});

test("gæste-struktur: rail + sheet + expect + after + CTA", () => {
  assert.match(flade, /chateau-collab__rail/);
  assert.match(flade, /8–12 pladser/);
  assert.match(flade, /Flash only/);
  assert.match(flade, /Ædru ved stolen/);
  assert.match(flade, /følger Chateaus aften/i);
  assert.match(flade, /chateau-collab__sheet/);
  assert.match(flade, /Hvad du kan forvente/);
  assert.match(flade, /Larsbjørnsstræde 13/);
  assert.match(flade, /Skriv dig op/);
  assert.match(css, /chateau-collab__sheet/);
  assert.match(css, /chateau-collab__rail/);
});

test("ingen hus-ord som kundelabels", () => {
  // Stolen/Mærket/Natten/Hylden som rum-navne — plain chair/room/flash er OK.
  assert.doesNotMatch(tekst, /\bMærket\b/);
  assert.doesNotMatch(tekst, /\bHylden\b/);
  assert.doesNotMatch(tekst, /\bNatten\b/);
  // «Stolen» som hus-navn (kapital S midt i sætning / label) — undgå.
  assert.doesNotMatch(tekst, /(?<!ved |i |én |Én )Stolen\b/);
});
