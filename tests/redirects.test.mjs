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
    "/artister/",
    "/artister/nizar/",
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

test("Danish walk-in is a live page, not a 308 to the chair", () => {
  assert.doesNotMatch(redirectsSrc, /slashPair\("\/walk-in"/);
  assert.doesNotMatch(redirectsSrc, /from: "\/walk-in\/", to: "\/#booking"/);
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

test("shop.inkandart.dk sendes til kataloget — host-gated 308 (vej B, S568)", () => {
  const m = redirectsSrc.match(
    /source:\s*"\/:path\*",\s*has:\s*\[\{\s*type:\s*"host",\s*value:\s*"shop\.inkandart\.dk"\s*\}\],\s*destination:\s*"https:\/\/inkandart\.dk\/shop",\s*statusCode:\s*308/
  );
  assert.ok(m, "host-reglen mangler eller er skilt fra sin host-vagt");
  assert.match(nextConfig, /hostRedirects/);
});

test("enhver wildcard-source bærer sin egen host-vagt", () => {
  // En /:path*-redirect uden host-betingelse ville sende HELE hub'en til
  // /shop. Vidnet kræver at vagten står i samme objekt som wildcarden.
  const hits = [...redirectsSrc.matchAll(/source:\s*"\/:path\*"/g)];
  assert.ok(hits.length >= 1, "host-reglen skal findes");
  for (const h of hits) {
    const ctx = redirectsSrc.slice(h.index, h.index + 220);
    assert.match(ctx, /has:\s*\[\{\s*type:\s*"host"/, "wildcard-redirect uden host-vagt");
  }
});
