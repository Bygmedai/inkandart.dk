import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readGiftNote } from "../lib/gift-note.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("hilsen keeps line breaks from the four-row textarea", () => {
  const note = readGiftNote({
    hilsen: "Kære Anna\nTillykke med dagen\nKh Mor",
  });
  assert.equal(note.hilsen, "Kære Anna\nTillykke med dagen\nKh Mor");
});

test("hilsen normalizes CRLF but still breaks lines", () => {
  const note = readGiftNote({ hilsen: "Kære Anna\r\nKh Mor" });
  assert.equal(note.hilsen, "Kære Anna\nKh Mor");
});

test("hilsen does not glue words across tabs", () => {
  const note = readGiftNote({ hilsen: "Kære\tAnna" });
  assert.equal(note.hilsen, "Kære Anna");
});

test("til and fra stay single-line", () => {
  const note = readGiftNote({ til: "Anna\nMarie", fra: "Mor" });
  assert.equal(note.til, "Anna Marie");
  assert.equal(note.fra, "Mor");
});

test("printed hilsen renders those line breaks", () => {
  const css = readFileSync(join(root, "app/globals.css"), "utf8");
  const block = css.match(/\.gift-note__hello\s*\{[^}]+\}/);
  assert.ok(block, ".gift-note__hello rule exists");
  assert.match(block[0], /white-space:\s*pre-line/);
});
