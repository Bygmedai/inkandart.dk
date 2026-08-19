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
