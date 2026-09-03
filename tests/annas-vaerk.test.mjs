import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * S574: Steven fangede mig i at svare «vi bruger alle portraetterne» ud fra
 * repoet alene. Huset havde flere billeder end repoet viste. Rettelsen laa
 * i en patch der aldrig blev merged, og gik derfor tabt i seks dage.
 *
 * Testene her holder paa det der blev rettet — ikke paa et tal.
 */

test("Anna har mindst ét vaerk paa sin side", () => {
  assert.match(read("content/vaerker.yml"), /artist: anna/);
});

test("piercing-teksten har et foto i begge sprog", () => {
  for (const f of ["content/piercing.yml", "content/piercing.en.yml"]) {
    assert.match(read(f), /^foto: \/slots\/[A-Z]-\d\d\.jpg$/m, f);
    assert.match(read(f), /^billedtekst: \S/m, f);
  }
});

test("hvert foto i YAML findes paa disken", () => {
  const paaDisk = new Set(readdirSync(join(root, "public/slots")));
  const yml = readdirSync(join(root, "content")).filter((f) => f.endsWith(".yml"));
  let set = 0;
  for (const f of yml) {
    for (const m of read(join("content", f)).matchAll(/\/slots\/([\w.-]+\.jpg)/g)) {
      set += 1;
      assert.ok(paaDisk.has(m[1]), `${f} peger paa /slots/${m[1]}, som ikke findes`);
    }
  }
  assert.ok(set > 0, "negativ kontrol: testen maalte ingen fotos");
});

test("den engelske artistside sender ikke kunden til danske rum", () => {
  const s = read("app/(en)/(rummet)/en/stolen/[id]/page.tsx");
  for (const rum of ["gaden", "shop", "booking", "stolen"]) {
    const danske = s.match(new RegExp(`href=(?:"|\\{\`)/${rum}\\b`, "g")) || [];
    assert.deepEqual(danske, [], `/en/stolen linker til /${rum} i stedet for /en/${rum}`);
  }
  assert.match(s, /href="\/en\/gaden"/);
  assert.match(s, /\/en\/shop\?artist=/);
});

test("prisdoeren paa piercerens side foelger sproget", () => {
  assert.match(read("app/(da)/(rummet)/stolen/[id]/page.tsx"), /prisHref="\/piercing"/);
  assert.match(read("app/(en)/(rummet)/en/stolen/[id]/page.tsx"), /prisHref="\/en\/piercing"/);
});

test("piercing-blokken er én komponent, ikke to kopier", () => {
  for (const p of [
    "app/(da)/(rummet)/stolen/[id]/page.tsx",
    "app/(en)/(rummet)/en/stolen/[id]/page.tsx",
  ]) {
    assert.match(read(p), /<PiercingBlok\b/, p);
    assert.doesNotMatch(read(p), /rum-artist__piercing/, `${p} tegner blokken selv`);
  }
});
