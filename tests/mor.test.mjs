import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MOR_PERCHES, MOR_SR, MOR_ZONES } from "../lib/mor.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
const bird = readFileSync(join(root, "components/emerge/MorBird.tsx"), "utf8");
const motor = readFileSync(join(root, "components/emerge/MorMotor.tsx"), "utf8");
const tape = readFileSync(join(root, "components/emerge/GadeTape.tsx"), "utf8");
const css = readFileSync(join(root, "app/globals.css"), "utf8");
const pkg = readFileSync(join(root, "package.json"), "utf8");
const morSvg = readFileSync(join(root, "public/emerge/v05/bird-mor.svg"), "utf8");

function rule(selector) {
  const re = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{[^}]*\\}",
  );
  const m = css.match(re);
  assert.ok(m, `mangler regel ${selector}`);
  return m[0];
}

test("one MorBird slot-line per zone, no leftover spec-birds", () => {
  for (const zone of MOR_ZONES) {
    assert.match(scene, new RegExp(`<MorBird zone="${zone}"`));
  }
  assert.equal([...scene.matchAll(/<MorBird /g)].length, MOR_ZONES.length);
  assert.doesNotMatch(scene, /bird-mor\.svg/);
});

test("Fuglemor CSS lives in the file — not lost to a rebase taking main", () => {
  assert.match(css, /\.mor-slot\s*\{/);
  assert.match(css, /\.mor__body/);
  assert.match(css, /\.mor__flip/);
  assert.match(css, /\.mor__line\s*\{/);
  const slot = rule(".mor-slot");
  assert.match(slot, /pointer-events:\s*none/);
  assert.match(slot, /inset:\s*0/);
});

test("#154 reduced-motion block is closed before Fuglemor starts", () => {
  assert.match(
    css,
    /\.gade__door, \.gade__door:hover, \.gade__door:focus-visible \{ transition: none; \}\s*\}\s*\/\*[\s\S]{0,120}Fuglemor[\s\S]{0,500}?\.mor-slot\s*\{/,
  );
});

test("slot uses box-model hops — no transform on the data-depth box", () => {
  const slots = [...scene.matchAll(/className="mor-slot"[^>]*>/g)].map((m) => m[0]);
  assert.equal(slots.length, MOR_ZONES.length);
  for (const s of slots) {
    assert.match(s, /data-depth=/);
    assert.match(s, /data-drift="0"/);
    assert.doesNotMatch(s, /transform/);
  }
  const slot = rule(".mor-slot");
  assert.doesNotMatch(slot, /transform/);
  assert.match(css, /\.mor\s*\{[^}]*left 1\.1s/);
});

test("works without JS and sits still under reduced motion", () => {
  assert.doesNotMatch(bird, /^\s*["']use client["']/m);
  assert.match(bird, /bird-mor\.svg/);
  assert.match(motor, /prefers-reduced-motion/);
  assert.match(css, /\.mor:hover:not\(\.is-airborne\) \.mor__body \{\s*transform: none/);
});

test("MorMotor clears hop timers on unmount — same contract as SceneMotor", () => {
  assert.match(motor, /const timers: number\[\] = \[\]/);
  assert.match(motor, /timers\.push\(\s*window\.setTimeout/);
  assert.match(motor, /timers\.forEach\(\(t\) => window\.clearTimeout\(t\)\)/);
});

test("under-gutter on mobile does not sit on the chalk", () => {
  assert.match(
    css,
    /@media \(max-width: 640px\)[\s\S]*?\.mor--under\[data-perch="gutter"\]\s*\{[^}]*left:\s*82%/,
  );
});

test("lines are chalk-caps, aria-hidden, one sr-only description", () => {
  assert.equal(MOR_SR.length > 20, true);
  assert.match(bird, /aria-hidden="true"/);
  assert.match(bird, /sr-only/);
  assert.match(bird, /MOR_SR/);
  const lines = Object.values(MOR_PERCHES).flatMap((p) => p.map((x) => x.line));
  for (const line of [
    "HUN HAR SET DET HELE FRA TAGRENDEN",
    "KOM IND. DER ER VARMT.",
    "DEN PLADS HOLDER JEG",
    "GIV DET VIDERE",
    "TO SMÅ. I AFTEN.",
    "INGEN FLYVER HERFRA UMÆRKET",
    "JEG RYGER MIN. IKKE DIN.",
    "HOLD KÆFT OG SÆT DIG",
  ]) {
    assert.equal(lines.includes(line), true, line);
  }
});

test("collage tape is a found scrap, not a door", () => {
  assert.match(scene, /<GadeTape/);
  assert.doesNotMatch(scene, /gade-tape-slot"[^>]*data-depth/);
  assert.doesNotMatch(tape, /^\s*["']use client["']/m);
  assert.match(tape, /aria-hidden="true"/);
  assert.match(tape, /TUSSE/);
  assert.match(tape, /IKKE TERAPI/);
  const slot = rule(".gade-tape-slot");
  assert.match(slot, /pointer-events:\s*none/);
  assert.doesNotMatch(tape, /<img /);
});

test("she smokes in the same SVG — no extra request", () => {
  assert.match(morSvg, /#c45a5a/);
  assert.match(bird, /bird-mor\.svg/);
  assert.doesNotMatch(bird, /cigarette\.svg/);
});

test("no new dependency for the bird", () => {
  const before = ["gsap", "lottie", "animejs", "motion"];
  const deps = {
    ...JSON.parse(pkg).dependencies,
    ...JSON.parse(pkg).devDependencies,
  };
  for (const name of before) {
    assert.equal(name in deps, false, name);
  }
  assert.doesNotMatch(bird, /from ["']framer-motion/);
  assert.doesNotMatch(motor, /from ["']framer-motion/);
});
