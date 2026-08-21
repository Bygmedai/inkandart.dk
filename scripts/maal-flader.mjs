/**
 * Måleværktøj for a11y-gaten: kontrast, tap-mål og «æder tap»-kollisioner.
 *
 * Hvorfor det ligger her: gennem S568 blev den samme lektie lært fire gange
 * — et estimat ud fra CSS er ikke en måling. Et par eksempler fra dagen:
 *
 *   «~3.25:1»   estimeret   →   7.24:1 målt efter fix (chip-kontrast)
 *   «~22 px»    estimeret   →   25 px målt (header-nav; linjehøjden var 17,
 *                                ikke 14 — estimatet var rimeligt og forkert)
 *   «geometrisk overlap»    →   elementFromPoint afgør om et tap faktisk
 *                                rammer figuren i stedet for købslinket
 *
 * Kør den. Gæt ikke.
 *
 *   npx next build && npx next start -p 3299 &
 *   node scripts/maal-flader.mjs            # alle sider, begge viewports
 *   node scripts/maal-flader.mjs /shop      # én side
 *
 * Kræver Playwright lokalt (ikke en repo-dependency, ikke i CI):
 *   mkdir -p /tmp/pwrig && cd /tmp/pwrig && npm i playwright
 *   PLAYWRIGHT_BROWSER=/opt/pw-browsers/chromium node scripts/maal-flader.mjs
 */
import { createRequire } from "node:module";

// Playwright er ikke en repo-dependency (den skal ikke i CI og ikke i
// produktionsbundtet). Scriptet leder derfor selv: først i repoet, dernæst
// i en lokal rig. Sæt PLAYWRIGHT_PATH hvis din ligger et tredje sted.
const require = createRequire(import.meta.url);
const stier = [
  "playwright",
  process.env.PLAYWRIGHT_PATH,
  "/tmp/pwrig/node_modules/playwright",
].filter(Boolean);
let chromium;
for (const sti of stier) {
  try { ({ chromium } = require(sti)); break; } catch { /* prøv næste */ }
}
if (!chromium) {
  console.error(
    "Playwright blev ikke fundet. Installér den lokalt:\n" +
    "  mkdir -p /tmp/pwrig && cd /tmp/pwrig && npm init -y && npm i playwright\n" +
    "Browseren ligger i /opt/pw-browsers/chromium (PLAYWRIGHT_BROWSER kan overstyre)."
  );
  process.exit(2);
}

const BASE = process.env.BASE || "http://localhost:3299";
const SIDER = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/shop", "/flash", "/walk-in", "/gavekort", "/aftercare", "/blackbook", "/privatlivspolitik"];
const VIEWPORTS = [
  { width: 390, height: 844, navn: "mobil" },
  { width: 1440, height: 900, navn: "desktop" },
];

/** WCAG-luminans med korrekt sammensat baggrund (alpha lagt sammen nedad). */
const MAALER = () => {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const parse = (s) => {
    const m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
  };
  const over = (t, b) => { const a = t[3]; return [t[0]*a+b[0]*(1-a), t[1]*a+b[1]*(1-a), t[2]*a+b[2]*(1-a), 1]; };
  const effBg = (el) => {
    const kaede = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      // En gradient tæller som baggrund. Uden dette så værktøjet en fyldt
      // guldknap som «gennemsigtig» og meldte mørk-på-mørk (1.05:1) — en
      // falsk alarm, og et værktøj der råber forkert bliver ignoreret.
      const grad = cs.backgroundImage && cs.backgroundImage !== "none"
        ? parse((cs.backgroundImage.match(/rgba?\([^)]+\)/) || [""])[0])
        : null;
      if (grad) { kaede.push([grad[0], grad[1], grad[2], 1]); break; }
      const bg = parse(cs.backgroundColor);
      if (bg && bg[3] > 0) kaede.push(bg);
      if (bg && bg[3] >= 1) break;
    }
    let base = [10, 10, 10, 1]; // --void
    for (let i = kaede.length - 1; i >= 0; i--) base = over(kaede[i], base);
    return base;
  };
  const synlig = (el) => {
    const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return b.width > 0 && b.height > 0 && cs.visibility !== "hidden" && cs.opacity !== "0";
  };

  const kontrast = [];
  for (const el of document.querySelectorAll("p,a,span,li,h1,h2,h3,button,label")) {
    if (!synlig(el) || !el.textContent.trim() || el.children.length > 0) continue;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color); if (!fg) continue;
    const bg = effBg(el);
    const sammensat = fg[3] < 1 ? over(fg, bg) : fg;
    const [hi, lo] = [lum(sammensat), lum(bg)].sort((a, b) => b - a);
    const forhold = Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
    const px = parseFloat(cs.fontSize);
    const stor = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    const krav = stor ? 3 : 4.5;
    if (forhold < krav) kontrast.push({ tekst: el.textContent.trim().slice(0, 28), forhold, px, krav, farve: cs.color });
  }

  // Tap-mål. Links INDE i en sætning er undtaget i SC 2.5.8 — vi kender dem
  // på at forælderen har anden tekst end linket selv.
  const tap = [];
  for (const el of document.querySelectorAll("a[href],button,[role=button],input,select")) {
    if (!synlig(el)) continue;
    const b = el.getBoundingClientRect();
    if (b.width >= 24 && b.height >= 24) continue;
    const foraelder = el.parentElement;
    const iSaetning = foraelder && foraelder.textContent.trim().length > el.textContent.trim().length + 3;
    tap.push({ tekst: (el.textContent || "").trim().slice(0, 24), w: Math.round(b.width), h: Math.round(b.height), undtaget: !!iSaetning });
  }

  // Æder et bevægeligt objekt et tap på en handling?
  const spis = [];
  // NB: 'book' som delstreng ville også fange /blackbook (QA #168). Vi vil
  // have booking-systemet, ikke nyhedsbrevet — derfor værtsnavnet.
  const handlinger = [
    ...document.querySelectorAll(
      ".kerb__mark, a[href*='/cart/'], a[href*='inkart.book.dk'], a[href^='tel:']"
    ),
  ];
  for (const m of document.querySelectorAll("[data-mor],[data-crew],[data-mutter]")) {
    const mb = m.getBoundingClientRect();
    if (mb.bottom < 0 || mb.top > window.innerHeight) continue;
    for (const h of handlinger) {
      const hb = h.getBoundingClientRect();
      if (hb.width === 0) continue;
      const w = Math.min(hb.right, mb.right) - Math.max(hb.left, mb.left);
      const ht = Math.min(hb.bottom, mb.bottom) - Math.max(hb.top, mb.top);
      if (w <= 0 || ht <= 0) continue;
      const top = document.elementFromPoint(Math.max(hb.left, mb.left) + w / 2, Math.max(hb.top, mb.top) + ht / 2);
      if (top && (top.closest("[data-mor]") || top.closest("[data-crew]") || top.closest("[data-mutter]"))) {
        spis.push({ figur: m.dataset.mor || m.dataset.crew || m.dataset.mutter, areal: Math.round(w * ht), maal: (h.getAttribute("aria-label") || h.textContent || "").trim().slice(0, 30) });
      }
    }
  }
  return { kontrast, tap, spis };
};

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_BROWSER || "/opt/pw-browsers/chromium" });
let fejl = 0;

for (const vp of VIEWPORTS) {
  for (const sti of SIDER) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const jsFejl = [];
    page.on("pageerror", (e) => jsFejl.push(String(e).slice(0, 80)));
    await page.goto(BASE + sti, { waitUntil: "networkidle" });
    await page.waitForTimeout(sti === "/" ? 4200 : 1200);
    // scroll til kridtet, så «Under gaden» er i view når vi måler kollisioner
    await page.evaluate(() => {
      const k = document.querySelector(".kerb");
      if (k) window.scrollTo(0, k.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5);
    });
    await page.waitForTimeout(900);
    const r = await page.evaluate(MAALER);

    const linjer = [];
    for (const k of r.kontrast) linjer.push(`KONTRAST ${k.forhold}:1 (krav ${k.krav}) ${k.px}px ${k.farve} «${k.tekst}»`);
    for (const t of r.tap.filter((x) => !x.undtaget)) linjer.push(`TAP ${t.w}×${t.h} «${t.tekst}»`);
    for (const s of r.spis) linjer.push(`ÆDER TAP: ${s.figur} dækker ${s.areal} px² af «${s.maal}»`);
    for (const e of jsFejl) linjer.push(`JS-FEJL ${e}`);
    fejl += linjer.length;

    console.log(`${vp.navn.padEnd(8)} ${sti.padEnd(20)} ${linjer.length ? "" : "rent ✓"}`);
    for (const l of linjer) console.log(`    ${l}`);
    const undtaget = r.tap.filter((x) => x.undtaget).length;
    if (undtaget) console.log(`    (${undtaget} link${undtaget > 1 ? "s" : ""} under 24px er undtaget: inde i en sætning, SC 2.5.8)`);
    await page.close();
  }
}
await browser.close();
console.log(`\n${fejl ? fejl + " fund" : "ingen fund"} · ${SIDER.length} sider × ${VIEWPORTS.length} viewports`);
process.exit(fejl ? 1 : 0);
