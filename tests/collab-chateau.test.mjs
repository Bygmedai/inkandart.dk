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

test("collab/chateau er noindex, nofollow, nocache", () => {
  assert.match(side, /index: false/);
  assert.match(side, /follow: false/);
  assert.match(side, /nocache: true/);
});

test("collab/chateau står ikke i nav eller sitemap", () => {
  assert.doesNotMatch(read("components/rummet/Nav.tsx"), /collab|chateau/i);
  assert.doesNotMatch(read("app/sitemap.ts"), /collab|chateau/i);
});

test("titel er Ink & Art × Chateau Motel", () => {
  assert.match(side, /Ink & Art × Chateau Motel/);
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
  // Strip comments — forbud gælder synlig copy, ikke dok-noter.
  const tekst = (flade + side)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  assert.doesNotMatch(tekst, /Roskilde|byens første|Book\.dk|temp tattoo/i);
  assert.doesNotMatch(tekst, /køb billet|Book\.dk|900\s*kr/i);
});

test("kontakt peger på Simone + Steven", () => {
  assert.match(flade, /Simone \+ Steven/);
  assert.match(flade, /steven@bygmedai\.dk/);
});
