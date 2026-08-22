import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CREW } from "../lib/crew.ts";
import { MUTTERS, MUTTER_FIRST } from "../lib/mutter.ts";
import { VOICE, linesOf, pickLine } from "../lib/voice.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
const motor = readFileSync(join(root, "components/emerge/MorMotor.tsx"), "utf8");
const bit = readFileSync(join(root, "components/emerge/CrewBit.tsx"), "utf8");
const tape = readFileSync(join(root, "components/emerge/GadeTape.tsx"), "utf8");
const css = readFileSync(join(root, "app/globals.css"), "utf8");

test("da and en voice tables have the same keys", () => {
  const da = Object.keys(VOICE.da).sort();
  const en = Object.keys(VOICE.en).sort();
  assert.deepEqual(da, en);
});

test("lines are dry sentences, not merch-caps", () => {
  assert.match(VOICE.da["rat.line"][0], /ikke noget at prale af/);
  assert.match(VOICE.da["skull.line"][0], /midlertidigt/);
  assert.match(VOICE.da["dice.line"][0], /Sødt/);
  for (const key of Object.keys(VOICE.da)) {
    if (key === "mor.sr") continue;
    for (const line of VOICE.da[key]) {
      assert.doesNotMatch(line, /^[A-ZÆØÅ0-9 .,'’-]+$/);
    }
  }
});

test("each figure has 4–5 rotatable lines, same count da/en", () => {
  for (const key of Object.keys(VOICE.da)) {
    if (key === "mor.sr") continue;
    const da = linesOf("da", key);
    const en = linesOf("en", key);
    assert.ok(da.length >= 4 && da.length <= 5, key);
    assert.equal(da.length, en.length, key);
    assert.equal(new Set(da).size, da.length, `${key} da dup`);
    assert.equal(new Set(en).size, en.length, `${key} en dup`);
  }
  const a = pickLine("da", "rat.line");
  assert.equal(VOICE.da["rat.line"].includes(a), true);
});

test("crew is swapped in, not piled on — existing assets only", () => {
  for (const c of CREW) {
    assert.match(scene, new RegExp(`who="${c.who}"`));
    assert.match(c.src, /^\/emerge\/v05\/(rat|dice|skull)\.svg$/);
  }
  assert.equal([...scene.matchAll(/<CrewBit /g)].length, CREW.length);
  assert.doesNotMatch(bit, /^\s*["']use client["']/m);
});

test("crew hops are box-model; slot is not transform-centered", () => {
  const slots = [...scene.matchAll(/className="crew-slot"[^>]*>/g)].map((m) => m[0]);
  assert.ok(slots.length >= 2);
  for (const s of slots) {
    assert.match(s, /data-depth=/);
    assert.match(s, /data-drift="0"/);
    assert.doesNotMatch(s, /transform/);
  }
  assert.match(css, /\.crew-slot\s*\{[^}]*pointer-events:\s*none/);
  assert.match(css, /\.crew\s*\{[^}]*left 0\.9s/);
  assert.doesNotMatch(css, /\.crew-slot\s*\{[^}]*transform:/);
});

test("no rAF — chaos is shuffled timeouts, cleared on unmount", () => {
  assert.doesNotMatch(motor, /requestAnimationFrame/);
  assert.match(motor, /crew:land/);
  assert.match(motor, /chaos/);
  assert.match(motor, /timers\.forEach\(\(t\) => window\.clearTimeout\(t\)\)/);
  assert.match(motor, /voiceFromLang/);
  assert.match(motor, /pickLine/);
  assert.match(motor, /quietUntil/);
  assert.match(motor, /IntersectionObserver/);
});

test("in-place mutters hook existing objects — no extra SVG, no hop on text", () => {
  for (const m of MUTTERS) {
    assert.match(scene, new RegExp(m.sel.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const m of MUTTER_FIRST) {
    assert.match(scene, new RegExp(m.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(css, /\.mutter__line\s*\{/);
  assert.match(css, /pointer-events:\s*none/);
  assert.doesNotMatch(motor, /requestAnimationFrame/);
  assert.equal(
    MUTTERS.every((m) => m.key.endsWith(".line")),
    true,
  );
});

test("Haruki's lang contract: html[lang=en] flips tape without JS", () => {
  assert.match(tape, /gade-tape__en/);
  assert.match(tape, /Still here/);
  assert.match(tape, /Not a statement/);
  assert.match(css, /html\[lang="en"\] \.gade-tape__da/);
  assert.match(css, /html\[lang="en"\] \.gade-tape__en/);
});

test("crew keep-out: no perch sits on the chalk band", () => {
  const under = [
    ".crew--rat-ledge[data-perch=\"a\"]",
    ".crew--rat-ledge[data-perch=\"b\"]",
    ".crew--rat-ledge[data-perch=\"c\"]",
    ".crew--dice-under[data-perch=\"a\"]",
    ".crew--dice-under[data-perch=\"b\"]",
    ".crew--skull-under[data-perch=\"a\"]",
    ".crew--skull-under[data-perch=\"b\"]",
  ];
  for (const sel of under) {
    const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}");
    const m = css.match(re);
    assert.ok(m, sel);
    const top = Number(/top:\s*([\d.]+)%/.exec(m[1])?.[1]);
    assert.ok(top < 70 || top > 86, `${sel} top ${top} sits on chalk/marquee`);
  }
});
