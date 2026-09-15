import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const rod = join(dirname(fileURLToPath(import.meta.url)), "..");
const læs = (p) => readFileSync(join(rod, p), "utf8");
const artister = parse(læs("content/artists.yml"));

const SIDER = [
  "app/(da)/(rummet)/stolen/[id]/page.tsx",
  "app/(en)/(rummet)/en/stolen/[id]/page.tsx",
];

/**
 * Et handle er ikke det samme paa to platforme.
 *
 * Okan hedder «artfulltattoo» paa Instagram og «okan.artfulltattoo» paa
 * TikTok (bekraeftet 15/9 2026). Havde vi genbrugt ét felt til begge,
 * ville det ene link have peget forkert — og et forkert link paa en
 * artists kort er en doed handling (CLAUDE.md §4).
 *
 * Handle'et skrives UDEN @ og uden URL; komponenten bygger adressen.
 * Skriver nogen «@okan» eller en hel https-adresse i feltet, bliver
 * linket til .../@@okan eller .../@https://… — begge doede.
 */
test("handles står uden @ og uden URL", () => {
  const fund = [];
  for (const a of artister) {
    for (const felt of ["instagram", "tiktok"]) {
      const v = a[felt];
      if (!v) continue;
      if (v.startsWith("@")) fund.push(`${a.id}.${felt}: «${v}» starter med @`);
      if (/https?:|\//.test(v)) fund.push(`${a.id}.${felt}: «${v}» er en URL, ikke et handle`);
      if (v !== v.trim()) fund.push(`${a.id}.${felt}: mellemrum i enderne`);
    }
  }
  assert.deepEqual(fund, [], "handles er ikke rene:\n" + fund.join("\n"));
});

/**
 * Label-in-Name (WCAG 2.5.3): den synlige tekst skal indgaa i det
 * tilgaengelige navn. Linket VISER «@handle» og hedder «Instagram
 * @handle» — saa en skaermlaeser siger hvilken platform det er, og en
 * talestyring kan stadig sige «klik @handle».
 */
test("begge links siger hvilken platform de er, på begge sprog", () => {
  for (const f of SIDER) {
    const src = læs(f);
    assert.match(src, /aria-label=\{`Instagram @\$\{artist\.instagram\}`\}/, `${f}: Instagram uden platformnavn`);
    assert.match(src, /aria-label=\{`TikTok @\$\{artist\.tiktok\}`\}/, `${f}: TikTok uden platformnavn`);
    assert.match(src, /https:\/\/www\.tiktok\.com\/@\$\{artist\.tiktok\}/, `${f}: forkert TikTok-URL`);
    assert.match(src, /https:\/\/www\.instagram\.com\/\$\{artist\.instagram\}\//, `${f}: forkert Instagram-URL`);
  }
});

test("negativ kontrol: prøven kan blive rød", () => {
  const urent = (v) => v.startsWith("@") || /https?:|\//.test(v);
  assert.equal(urent("@okan"), true);
  assert.equal(urent("https://www.tiktok.com/@okan"), true);
  assert.equal(urent("okan.artfulltattoo"), false, "et rent handle skal give grønt");
});
