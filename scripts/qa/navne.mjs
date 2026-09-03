/**
 * Kan man SIGE det man kan LÆSE? (WCAG 2.5.3, Label in Name)
 *
 * En der styrer med stemmen siger de ord der står på knappen. Matcher
 * knappens navn ikke de ord, sker der ingenting — og fejlen er usynlig
 * for alle andre, fordi knappen ser rigtig ud og virker med mus.
 *
 *   node scripts/qa/navne.mjs                  # mod BASE (default :3000)
 *   BASE=http://localhost:3299 node scripts/qa/navne.mjs
 *
 * HVORFOR EN BROWSER OG IKKE HTML: den synlige etiket er to spans uden
 * mellemrum imellem («Hold plads» + «100,-»). Læser man kildens tekst,
 * bliver det til «Hold plads100,-», og hver eneste knap melder falsk
 * rødt. `innerText` kender layoutet og skriver det brugeren SER. Målt
 * 3/9: samme side gav 8 falske fund på HTML og 0 i browseren.
 *
 * HVORFOR ORDENE OG IKKE HELE STRENGEN: prisen står på knappen som
 * «100,-», men navnet siger «100 kroner» — det er den rigtige oplæsning,
 * og en der taler siger verbet, ikke beløbet. Pile og prikker er
 * dekoration. Tilbage står de ord et menneske faktisk ville sige.
 *
 * IKKE ET GATE ENDNU. Husets egne købsknapper (kridtet, piercing,
 * flash-tider, nattespot) er rene siden S579. `/gavekort` og
 * walk-in-relikviet er ikke, og de er Groks lane — copy er ikke omfattet
 * af a11y-undtagelsen i CLAUDE.md, så jeg må ikke rette dem. Den dag de
 * er nul, er dette ét kald i scripts/qa/vagt.mjs fra at være et hegn.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const RUTER = [
  "/", "/shop", "/en/shop", "/natten", "/en/natten", "/gavekort",
  "/walk-in", "/en/walk-in", "/maerket", "/en/maerket", "/booking", "/flash",
];

/** De ord man ville sige: uden tal, uden pynt. */
const taleord = (v) =>
  v
    .toLowerCase()
    .split(/\s+/)
    .map((o) => o.replace(/^[.,:;!?—–·→]+|[.,:;!?—–·→]+$/g, ""))
    .filter((o) => /[a-zæøåäöü]/.test(o))
    .join(" ");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const side = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const fund = [];
let målte = 0;

for (const rute of RUTER) {
  const svar = await side.goto(BASE + rute, { waitUntil: "networkidle" });
  if (!svar || svar.status() !== 200) {
    console.log(`  ${rute}: HTTP ${svar ? svar.status() : "?"} — sprunget over`);
    continue;
  }
  const knapper = await side.evaluate(() => {
    const ud = [];
    for (const el of document.querySelectorAll("a[aria-label],button[aria-label]")) {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") continue;
      if (!el.getBoundingClientRect().width) continue;
      ud.push({ set: el.innerText.replace(/\s+/g, " ").trim(), navn: el.getAttribute("aria-label") });
    }
    return ud;
  });
  for (const k of knapper) {
    if (!k.set) continue; // et ikon-link har ingen synlig etiket at matche
    const ord = taleord(k.set);
    if (!ord) continue; // kun tal og pynt — intet at sige
    målte++;
    if (!k.navn.toLowerCase().includes(ord)) {
      fund.push(`${rute}: man læser «${k.set.slice(0, 40)}» — knappen hedder «${k.navn}»`);
    }
  }
}
await browser.close();

console.log(`\n${målte} knapper med både synlig tekst og et navn.`);
if (fund.length === 0) {
  console.log("Ingen fund: hver knap hedder det man kan læse på den.");
} else {
  console.log(`\n${fund.length} kan ikke siges:\n` + fund.map((f) => "  · " + f).join("\n"));
}
// Ingen exit-kode endnu: dette er et værktøj, ikke et hegn. Se toppen.
