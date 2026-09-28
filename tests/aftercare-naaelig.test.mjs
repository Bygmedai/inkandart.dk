// Aftercare skal kunne findes (Emma, 28/9 2026).
//
// Artisterne sender kunden hjem med «læs aftercare på hjemmesiden». Siden
// /aftercare fandtes hele tiden, men intet på sitet linkede til den — så
// kunden kunne ikke finde den, og Emma troede den var væk. Ingen prøve gik
// rød, fordi naaelige-flader.test.mjs følger imports, ikke links.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

test("footeren linker til aftercare — på begge sprog via localePath", () => {
  const footer = read("components/rummet/Footer.tsx");
  assert.match(footer, /<a href=\{localePath\(lang, "\/aftercare"\)\}>Aftercare<\/a>/);
});

test("begge aftercare-sider findes, så linket ikke peger ud i ingenting", () => {
  assert.ok(existsSync(join(root, "app/(da)/(rummet)/aftercare/page.tsx")));
  assert.ok(existsSync(join(root, "app/(en)/(rummet)/en/aftercare/page.tsx")));
});
