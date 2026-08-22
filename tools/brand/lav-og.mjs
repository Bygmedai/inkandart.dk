#!/usr/bin/env node
/**
 * lav-og.mjs — bygger delekortet (og:image) ud fra husets egne dele.
 *
 * Hvorfor et script og ikke en committet HTML-fil: første udgave var netop
 * det, med fontene base64-indlejret. Den fil blev 159 kB med én linje på
 * 85.358 tegn — og størstedelen var font-bytes der allerede ligger i
 * app/fonts/. To kopier af det samme, hvoraf den ene kunne blive forældet.
 *
 * Nu læses fonte og segl fra repoet på kørselstidspunktet. Kortet kan altså
 * ikke komme til at vise en anden skrift end sitet selv.
 *
 *   node tools/brand/lav-og.mjs public/og-inkandart-2026.jpg
 *
 * Kræver Playwright lokalt (samme rig som scripts/maal-flader.mjs):
 *   mkdir -p /tmp/pwrig && cd /tmp/pwrig && npm i playwright
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rod = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const require = createRequire(import.meta.url);

let chromium;
for (const sti of ["playwright", process.env.PLAYWRIGHT_PATH, "/tmp/pwrig/node_modules/playwright"].filter(Boolean)) {
  try { ({ chromium } = require(sti)); break; } catch { /* prøv næste */ }
}
if (!chromium) {
  console.error("Playwright mangler:  mkdir -p /tmp/pwrig && cd /tmp/pwrig && npm i playwright");
  process.exit(1);
}

const b64 = (p) => readFileSync(join(rod, p)).toString("base64");
const font = (n) => b64(`app/fonts/${n}`);
const segl = b64("public/brand/logo-segl.svg");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;src:url(data:font/woff2;base64,${font("CormorantGaramond-500-latin.woff2")}) format('woff2');font-weight:500}
@font-face{font-family:M;src:url(data:font/woff2;base64,${font("SpaceMono-Regular.woff2")}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0d0a09;overflow:hidden;position:relative;
  display:flex;align-items:center;justify-content:center;gap:64px}
body::before{content:"";position:absolute;inset:0;
  background:radial-gradient(120% 100% at 50% 30%, rgba(60,40,34,.55), transparent 62%)}
body::after{content:"";position:absolute;inset:0;opacity:.10;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.segl{width:300px;height:300px;position:relative;z-index:2;filter:drop-shadow(0 22px 54px rgba(0,0,0,.8))}
.tekst{position:relative;z-index:2;color:#e8e0d5}
h1{font-family:D,serif;font-weight:500;font-size:86px;line-height:.94;letter-spacing:.03em;text-transform:uppercase;color:#efe7db}
.fag{font-family:M,monospace;font-size:23px;letter-spacing:.30em;text-transform:uppercase;margin-top:22px;color:#cfc4b4}
.adr{font-family:M,monospace;font-size:16px;letter-spacing:.22em;text-transform:uppercase;margin-top:16px;color:#9d9384}
.streg{width:118px;height:2px;background:#c9a227;margin-top:30px;opacity:.9}
</style></head><body>
<img class="segl" src="data:image/svg+xml;base64,${segl}" alt="">
<div class="tekst">
  <h1>Ink &amp; Art</h1>
  <p class="fag">Tatovering &amp; piercing</p>
  <p class="adr">Larsbjørnsstræde 13 · Pisserenden · København K</p>
  <div class="streg"></div>
</div>
</body></html>`;

const ud = process.argv[2] ?? "public/og-inkandart-2026.jpg";
const b = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_BROWSER });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: "load" });
await p.waitForTimeout(400);
const png = await p.screenshot({ type: "png" });
await b.close();

// 2x ned til 1200x630 som JPEG — platformene vil have præcis de mål
const { execFileSync } = await import("node:child_process");
writeFileSync("/tmp/og-2x.png", png);
execFileSync("python3", ["-c", `
from PIL import Image
Image.open("/tmp/og-2x.png").convert("RGB").resize((1200,630), Image.LANCZOS).save("${join(rod, ud)}", "JPEG", quality=88, optimize=True)
`]);
console.log(`  ${ud} skrevet`);
