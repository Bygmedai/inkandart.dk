import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const redirectsSrc = readFileSync(join(root, "lib/redirects.ts"), "utf8");
const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");

test("next.config uses the explicit redirect matrix", () => {
  assert.match(nextConfig, /nextRedirects/);
  assert.doesNotMatch(nextConfig, /\/en\/:path\*/);
  assert.doesNotMatch(nextConfig, /\/en\/\*/);
});

test("matrix covers the retired 11ty routes", () => {
  const required = [
    "/walk-in/",
    "/artister/",
    "/artister/nizar/",
    "/flash/",
    "/find-din-tatovering/",
    "/del-din-ide/",
    "/en/privacy/",
    "/en/aftercare/",
    "/en/walk-in/",
    "/en/artists/",
    "/en/flash/",
    "/en/find-your-tattoo/",
    "/en/share-your-idea/",
  ];
  for (const from of required) {
    assert.match(redirectsSrc, new RegExp(from.replace(/[.*]/g, "\\$&")));
  }
});

test("named artist keeps its own anchor", () => {
  assert.match(redirectsSrc, /\/artister\/nizar\/", to: "\/#artist-nizar"/);
});

test("all next redirects are 308", () => {
  const codes = [...redirectsSrc.matchAll(/statusCode:\s*(\d+)/g)].map((m) => m[1]);
  assert.ok(codes.length > 0);
  for (const code of codes) assert.equal(code, "308");
});

test("no English catch-all onto the Danish home", () => {
  assert.doesNotMatch(redirectsSrc, /\/en\/:path\*/);
  assert.doesNotMatch(redirectsSrc, /source:\s*"\/en\/:\w+\*"/);
});

test("every fragment destination points at an anchor that actually exists", () => {
  // F1 (Haruki-review S566): matrixen pegede på /#artists og /#artist-nizar,
  // men scenen bar kun id="artist" — 6 af 17 rækker landede stille på toppen.
  // Dette vidne læser BEGGE sider af kontrakten, så drift fanges i CI.
  const fragments = [...redirectsSrc.matchAll(/to: "\/#([a-z0-9-]+)"/g)].map((m) => m[1]);
  assert.ok(fragments.length >= 4, "matrixen skal bære fragment-destinationer");
  const surfaces = [
    readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8"),
    readFileSync(join(root, "app/page.tsx"), "utf8"),
  ].join("\n");
  for (const id of new Set(fragments)) {
    assert.match(surfaces, new RegExp(`id="${id}"`), `anker #${id} findes ikke i scenen`);
  }
});

test("negativ kontrol: et opdigtet anker ville blive fanget", () => {
  const surfaces = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
  assert.doesNotMatch(surfaces, /id="findes-ikke-anker"/);
});
