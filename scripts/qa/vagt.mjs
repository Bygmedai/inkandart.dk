/**
 * QA-vagten — måler i en rigtig browser det som prøverne ikke kan se.
 *
 * Hvorfor den findes: sitet gik live 30/8 med fem fejl som 205 grønne
 * prøver ikke fangede. Ingen af dem var en logikfejl. Alle fem var noget
 * man kun ser når layoutet er lagt ud i en browser i en bestemt bredde —
 * en overskrift der skar i vindueskanten, et 16px trykmål, et kort uden
 * dør. En unit-prøve læser markup; den ser ikke geometri.
 *
 *   node scripts/qa/vagt.mjs                 # mål alt
 *   node scripts/qa/vagt.mjs --skud out/     # + screenshots
 *   BASE=http://localhost:3000 node scripts/qa/vagt.mjs
 *
 * Exit 0 med fund når ADVISORY=1 (den første uge). Uden ADVISORY er et
 * fund exit 1.
 *
 * ── Tre falske positiver, fundet før vagten blev bygget ────────────────
 * Mit første udkast gav 12 røde ud af 12. Alle på nær én var falske.
 * De tre fælder er hegnet ind her, med vilje og med navn:
 *
 *  1. `left: -9999px` er ikke overløb. Skip-linket og honeypot-feltet
 *     står uden for skærmen med vilje. En "stikker uden for viewporten"-
 *     regel udpeger dem hver gang — mens `scrollWidth > clientWidth`
 *     korrekt sagde 0. Det var skyldsudpegningen der løj, ikke målingen.
 *  2. `_vercel/insights` kan ikke filtreres på konsolbeskedens tekst.
 *     Beskeden er "Failed to load resource: 404" og indeholder ikke
 *     URL'en. Undtagelsen skal læses af `msg.location().url`.
 *  3. Next.js' prefetch afbryder RSC-kald med ERR_ABORTED som normal
 *     drift. En rå `requestfailed`-vagt flager den på hver eneste side.
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import {
  RUM, FLADER, BREDDER, SKUD_BREDDER,
  PADDING_FRA, PADDING_MIN, TAP_MIN, HANDLING_MIN, HANDLINGER,
} from "./flader.mjs";

const BASE = process.env.BASE || "http://localhost:3000";
const ADVISORY = process.env.ADVISORY === "1";
const skudIdx = process.argv.indexOf("--skud");
const SKUD_DIR = skudIdx > -1 ? process.argv[skudIdx + 1] : null;

// Playwright er ikke en repo-dependency (samme kald som scripts/maal-flader.mjs).
// Workflowet installerer den med --no-save; lokalt findes den i en rig.
const require = createRequire(import.meta.url);
let chromium;
for (const sti of ["playwright", process.env.PLAYWRIGHT_PATH, "/tmp/pwrig/node_modules/playwright"].filter(Boolean)) {
  try { ({ chromium } = require(sti)); break; } catch { /* prøv næste */ }
}
if (!chromium) {
  console.error("Playwright mangler. Lokalt:  mkdir -p /tmp/pwrig && cd /tmp/pwrig && npm i playwright");
  process.exit(2);
}

const fund = [];
const noter = [];
const ramt = new Map(HANDLINGER.map((s) => [s, 0]));
const forkertTag = new Map(HANDLINGER.map((s) => [s, 0]));
const manglerKoeb = new Set();
const læg = (alvor, flade, bredde, hvad) =>
  (alvor === "fund" ? fund : noter).push({ flade, bredde, hvad });

/** Kører i browseren. Alt herinde skal kunne stå alene — ingen closure. */
function målISiden(cfg) {
  const de = document.documentElement;
  const W = de.clientWidth;

  // Synlig = tegnes OG er ikke parkeret uden for skærmen med vilje.
  const synlig = (el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    if (r.right < 0 || r.left > W + 2000) return false; // fælde 1
    return true;
  };

  // 1 — vandret overløb, og HVEM der stikker ud (kun hvis der ER overløb)
  const overlob = de.scrollWidth - de.clientWidth;
  const syndere = [];
  if (overlob > 0) {
    for (const el of document.querySelectorAll("body *")) {
      if (!synlig(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > W + 1) {
        const k = (el.className || "").toString().trim().split(/\s+/)[0] || "";
        syndere.push(`${el.tagName.toLowerCase()}${k ? "." + k : ""} → ${Math.round(r.right)}px`);
      }
    }
  }

  // 2 — trykmål
  const smaa = [];
  const handlingSmaa = [];
  const handlingRamt = {};
  for (const el of document.querySelectorAll("a,button")) {
    if (!synlig(el)) continue;
    const r = el.getBoundingClientRect();
    const navn = `${el.tagName.toLowerCase()} "${(el.textContent || "").trim().slice(0, 24) || el.getAttribute("aria-label") || "?"}"`;
    if (r.width < cfg.TAP_MIN || r.height < cfg.TAP_MIN) {
      smaa.push(`${navn} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }
  const handlingTags = {};
  for (const sel of cfg.HANDLINGER) {
    const els = [...document.querySelectorAll(sel)].filter(synlig);
    handlingRamt[sel] = els.length;
    // En selektor der rammer en div eller en form måler ikke et trykmål —
    // den måler en kasse, består altid, og skjuler knappen indeni.
    handlingTags[sel] = els.filter((e) => e.tagName !== "A" && e.tagName !== "BUTTON").length;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.height < cfg.HANDLING_MIN) {
        handlingSmaa.push(`${sel} "${(el.textContent || "").trim().slice(0, 20)}" h=${Math.round(r.height)}`);
      }
    }
  }

  // 3 — venstre gutter i <main>. Fixed-elementer hører til chromen, ikke indholdet.
  const main = document.querySelector("main");
  let gutter = null;
  if (main) {
    let min = Infinity;
    for (const el of main.querySelectorAll("*")) {
      if (!synlig(el)) continue;
      if (getComputedStyle(el).position === "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.left >= 0 && r.left < min) min = r.left;
    }
    gutter = min === Infinity ? null : Math.round(min);
  }

  // 4 — et kort der nævner et menneske skal være en dør.
  //     Briefen sagde "hvert .rum-kort indeholder et link". Målt: det ville
  //     være rødt på Huset og Stolen fra dag ét, fordi gæstekortet ("Gæst ·
  //     navn følger") med VILJE ikke har en dør — der er ingen side at gå
  //     til. ArtistKort.tsx siger det selv: «en gæst uden navn får ingen
  //     død dør». Reglen håndhæver derfor intentionen: et kort med håndværk
  //     eller periode er et menneske, og et menneske skal kunne trykkes på.
  const kort = [...document.querySelectorAll(".rum-kort")];
  const plakater = [];
  let tomme = 0;
  for (const k of kort) {
    const harDør = !!k.querySelector("a");
    const erMenneske = !!(k.querySelector(".rum-chair__craft") || k.querySelector(".rum-chair__meta"));
    if (harDør) continue;
    if (erMenneske) {
      plakater.push((k.querySelector("h2")?.textContent || "").trim().slice(0, 30) || "(uden navn)");
    } else {
      tomme++;
    }
  }

  // 6 — alt-tekster. Dekorative billeder skal være aria-hidden, ikke alt-løse.
  const udenAlt = [...document.querySelectorAll("img")]
    .filter((i) => !i.hasAttribute("alt") && i.getAttribute("aria-hidden") !== "true")
    .map((i) => i.getAttribute("src") || "(uden src)");

  // Er der en købsflade her? Uden Shopify-env gates købsformen ud
  // (`product?.variantGid && buy`), og så måler vi en side uden den knap
  // huset lever af. Grønt og tomt. Rapporteres, aldrig fortiet.
  const erVareside = !!document.querySelector(".rum-produkt");
  const harKoeb = !!document.querySelector(".rum-produkt__koeb");

  return { overlob, syndere: syndere.slice(0, 5), smaa, handlingSmaa, handlingRamt, handlingTags,
           gutter, plakater, tommeKort: tomme, antalKort: kort.length, udenAlt,
           erVareside, harKoeb };
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_BROWSER || undefined,
});

for (const bredde of BREDDER) {
  const ctx = await browser.newContext({ viewport: { width: bredde, height: 900 } });
  for (const { navn, rute } of FLADER) {
    const page = await ctx.newPage();
    const konsol = [];
    const d404 = [];

    // Fælde 2: URL'en står i location(), ikke i teksten.
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const url = m.location()?.url || "";
      if (url.includes("/_vercel/insights")) return;
      konsol.push(`${m.text().slice(0, 90)}${url ? ` [${url}]` : ""}`);
    });
    // Egne 404'er. Vercel-beaconen findes kun hos Vercel og er undtaget.
    page.on("response", (r) => {
      if (r.status() !== 404) return;
      let u;
      try { u = new URL(r.url()); } catch { return; }
      if (u.origin !== BASE) return;
      if (u.pathname.startsWith("/_vercel/insights")) return;
      d404.push(u.pathname);
    });
    // Fælde 3: prefetch-afbrud er normal drift, ikke en fejl. Bevidst ingen
    // requestfailed-vagt — den ville flage ERR_ABORTED på hver eneste side.

    const svar = await page.goto(BASE + rute, { waitUntil: "networkidle" });
    if (!svar || svar.status() >= 400) {
      læg("fund", navn, bredde, `ruten svarede ${svar ? svar.status() : "intet"}`);
      await page.close();
      continue;
    }

    const m = await page.evaluate(målISiden, { TAP_MIN, HANDLING_MIN, HANDLINGER });

    for (const [sel, n] of Object.entries(m.handlingRamt)) ramt.set(sel, ramt.get(sel) + n);
    for (const [sel, n] of Object.entries(m.handlingTags)) forkertTag.set(sel, forkertTag.get(sel) + n);

    if (m.overlob > 0) {
      læg("fund", navn, bredde, `vandret overløb +${m.overlob}px — ${m.syndere.join(" · ") || "ingen synlig synder fundet"}`);
    }
    for (const s of m.smaa) læg("fund", navn, bredde, `trykmål under ${TAP_MIN}px: ${s}`);
    for (const s of m.handlingSmaa) læg("fund", navn, bredde, `handling under ${HANDLING_MIN}px: ${s}`);
    if (bredde >= PADDING_FRA && m.gutter !== null && m.gutter < PADDING_MIN) {
      læg("fund", navn, bredde, `indhold starter ${m.gutter}px fra vindueskanten (krav ≥ ${PADDING_MIN}px)`);
    }
    for (const p of m.plakater) læg("fund", navn, bredde, `kort uden dør: «${p}» — et menneske skal kunne trykkes på`);
    for (const u of m.udenAlt) læg("fund", navn, bredde, `img uden alt: ${u}`);
    for (const c of konsol) læg("fund", navn, bredde, `console.error: ${c}`);
    for (const p of [...new Set(d404)]) læg("fund", navn, bredde, `404 på egen sti: ${p}`);

    if (m.erVareside && !m.harKoeb && bredde === BREDDER[0]) {
      manglerKoeb.add(navn);
    }
    if (m.tommeKort && bredde === BREDDER[0]) {
      læg("note", navn, bredde, `${m.tommeKort} af ${m.antalKort} kort er en tom plads uden navn — ingen dør forventet`);
    }

    if (SKUD_DIR && SKUD_BREDDER.includes(bredde) && RUM.some((r) => r.rute === rute)) {
      mkdirSync(SKUD_DIR, { recursive: true });
      await page.screenshot({ path: join(SKUD_DIR, `${bredde}-${navn}.png`), fullPage: true });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();

// ── Rapport ───────────────────────────────────────────────────────────
// Et hegn der måler nul er værre end intet hegn: det ser grønt ud for evigt.
const døde = [...ramt.entries()].filter(([, n]) => n === 0).map(([s]) => s);

const linjer = [];
linjer.push(`## QA-vagt · ${FLADER.length} flader × ${BREDDER.length} bredder`);
linjer.push("");
if (fund.length === 0) {
  linjer.push(`**Ingen fund.** ${FLADER.length * BREDDER.length} sidevisninger målt.`);
} else {
  linjer.push(`**${fund.length} fund.**`);
  linjer.push("");
  linjer.push("| flade | bredde | hvad |");
  linjer.push("|---|---|---|");
  for (const f of fund) linjer.push(`| ${f.flade} | ${f.bredde} | ${f.hvad.replace(/\|/g, "\\|")} |`);
}
if (noter.length) {
  linjer.push("");
  linjer.push("<details><summary>Noter (ikke fund)</summary>");
  linjer.push("");
  for (const n of noter) linjer.push(`- ${n.flade} @ ${n.bredde}: ${n.hvad}`);
  linjer.push("");
  linjer.push("</details>");
}
if (døde.length) {
  linjer.push("");
  linjer.push(`⚠️ **Disse handlings-selektorer matchede intet på nogen flade:** \`${døde.join("`, `")}\``);
  linjer.push("");
  linjer.push("Et hegn bundet til markup der ikke findes måler ingenting og bliver ved med at se grønt ud. Ret selektoren i `scripts/qa/flader.mjs` eller fjern den.");
}
if (manglerKoeb.size) {
  linjer.push("");
  linjer.push(`⚠️ **Købsknappen blev ikke målt på:** ${[...manglerKoeb].join(", ")}`);
  linjer.push("");
  linjer.push(
    "Varesiden gater sin købsform bag et svar fra Shopify Storefront " +
      "(`product?.variantGid`). Uden `SHOPIFY_STOREFRONT_TOKEN` renderes knappen ikke, " +
      "og så er dette job grønt uden at have rørt husets vigtigste kontrol. " +
      "Det er ikke en fejl på siden — det er et hul i dækningen, og det skal stå her " +
      "frem for at blive forvekslet med et bestået trykmål."
  );
}
const kasser = [...forkertTag.entries()].filter(([, n]) => n > 0).map(([s]) => s);
if (kasser.length) {
  linjer.push("");
  linjer.push(`⚠️ **Disse handlings-selektorer rammer noget der ikke er \`a\` eller \`button\`:** \`${kasser.join("`, `")}\``);
  linjer.push("");
  linjer.push("En `div` eller `form` er ikke et trykmål. Selektoren måler kassen, består altid, og lader knappen indeni være umålt — grønt og tomt. Skærp den til den faktiske kontrol.");
}

const rapport = linjer.join("\n");
console.log(rapport.replace(/\|/g, " ").replace(/^#+ /gm, ""));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, rapport + "\n");
if (process.env.QA_RAPPORT) writeFileSync(process.env.QA_RAPPORT, rapport + "\n");

if (fund.length && !ADVISORY) process.exit(1);
