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
const css = readFileSync(join(root, "app/globals.css"), "utf8");
const pkg = readFileSync(join(root, "package.json"), "utf8");

test("one MorBird slot-line per zone, no leftover spec-birds", () => {
  for (const zone of MOR_ZONES) {
    assert.match(scene, new RegExp(`<MorBird zone="${zone}"`));
  }
  assert.equal([...scene.matchAll(/<MorBird /g)].length, MOR_ZONES.length);
  assert.doesNotMatch(scene, /bird-mor\.svg/);
});

test("slot uses box-model hops — no transform on the data-depth box", () => {
  const slots = [...scene.matchAll(/className="mor-slot"[^>]*>/g)].map((m) => m[0]);
  assert.equal(slots.length, MOR_ZONES.length);
  for (const s of slots) {
    assert.match(s, /data-depth=/);
    assert.match(s, /data-drift="0"/);
    assert.doesNotMatch(s, /transform/);
  }
  const block = css.slice(css.indexOf(".mor-slot"));
  assert.match(block, /left 1\.1s/);
  assert.match(block, /top 1\.1s/);
  assert.doesNotMatch(block.slice(0, 400), /mor-slot[^{]*\{[^}]*transform/);
});

test("works without JS and sits still under reduced motion", () => {
  assert.doesNotMatch(bird, /^\s*["']use client["']/m);
  assert.match(bird, /bird-mor\.svg/);
  assert.match(motor, /prefers-reduced-motion/);
  const block = css.slice(css.indexOf("Fuglemor"));
  assert.match(block, /prefers-reduced-motion: reduce/);
  assert.match(block, /\.mor:hover:not\(\.is-airborne\) \.mor__body \{\s*transform: none/);
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
  ]) {
    assert.equal(lines.includes(line), true, line);
  }
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
