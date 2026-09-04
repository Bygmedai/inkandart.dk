import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "_site") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) acc.push(p);
  }
  return acc;
}

test("vercel CSP matches lib/csp.ts and describes runtime", async () => {
  const cspMod = readFileSync(join(root, "lib/csp.ts"), "utf8");
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const header = vercel.headers
    .flatMap((h) => h.headers)
    .find((h) => h.key === "Content-Security-Policy").value;

  const { CONTENT_SECURITY_POLICY } = await import("../lib/csp.ts");
  assert.equal(header, CONTENT_SECURITY_POLICY);

  assert.match(cspMod, /object-src 'none'/);
  assert.match(cspMod, /default-src 'self'/);
  assert.match(cspMod, /frame-ancestors 'none'/);
  // Book.dk-rammen i /booking (#318) — og INTET andet maa rammes ind.
  assert.match(header, /frame-src https:\/\/inkart\.book\.dk(;|$)/, "frame-src skal vaere praecis Book.dk");
  assert.match(cspMod, /base-uri 'self'/);
  assert.doesNotMatch(cspMod, /blob:/);
  assert.doesNotMatch(cspMod, /vercel-insights/);
  assert.doesNotMatch(header, /blob:/);
  assert.doesNotMatch(header, /vercel-insights/);
  assert.match(header, /object-src 'none'/);
  assert.match(header, /img-src [^;]*https:\/\/cdn\.shopify\.com/);
  assert.match(cspMod, /https:\/\/cdn\.shopify\.com/);

  const scriptSrc = header.match(/script-src ([^;]+)/)[1].trim().split(/\s+/);
  for (const token of scriptSrc) {
    assert.ok(["'self'", "'unsafe-inline'"].includes(token), `unexpected script origin: ${token}`);
  }
});

test("no HTML sinks in application source", () => {
  const files = walk(join(root, "app")).concat(walk(join(root, "components")), walk(join(root, "lib")));
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    if (/dangerouslySetInnerHTML/.test(text)) hits.push(`${file}: dangerouslySetInnerHTML`);
    if (/\.innerHTML\s*=/.test(text)) hits.push(`${file}: innerHTML assignment`);
  }
  assert.deepEqual(hits, []);
});

test("no third-party script origins in script-src", () => {
  const header = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"))
    .headers.flatMap((h) => h.headers)
    .find((h) => h.key === "Content-Security-Policy").value;
  const scriptSrc = header.match(/script-src ([^;]+)/)[1];
  assert.doesNotMatch(scriptSrc, /https?:\/\//);
});
