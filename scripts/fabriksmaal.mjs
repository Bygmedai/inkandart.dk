#!/usr/bin/env node
/**
 * Fabriksmål — måler om tiltagene faktisk gør fabrikken bedre.
 *
 * Regel: hvert tal udledes af ARTEFAKTER (PRs, kørsler, labels), aldrig af
 * en agents egen rapport. Målt: udviklere der brugte AI blev 19 % langsommere
 * og troede de var 20 % hurtigere (METR RCT). Selvrapport er ikke data.
 *
 *   node scripts/fabriksmaal.mjs [--repo Bygmedai/inkandart.dk] [--siden 2026-08-01]
 *
 * Kræver GH_TOKEN.
 */
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const REPO  = arg('--repo', 'Bygmedai/inkandart.dk');
const SIDEN = arg('--siden', new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10));
const TOKEN = process.env.GH_TOKEN;
if (!TOKEN) { console.error('mangler GH_TOKEN'); process.exit(2); }

async function gh(sti) {
  const r = await fetch(`https://api.github.com/${sti}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw new Error(`GitHub ${r.status} på ${sti}`);
  return r.json();
}
async function alle(sti) {
  const ud = [];
  for (let side = 1; side <= 5; side++) {
    const d = await gh(`${sti}${sti.includes('?') ? '&' : '?'}per_page=100&page=${side}`);
    const r = Array.isArray(d) ? d : (d.workflow_runs ?? []);
    ud.push(...r);
    if (r.length < 100) break;
  }
  return ud;
}
const efter = (iso) => iso && iso.slice(0, 10) >= SIDEN;
const timer = (a, b) => (new Date(b) - new Date(a)) / 36e5;
const median = (xs) => xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : null;
const pct = (a, b) => (a + b === 0 ? null : (100 * a) / (a + b));

const prs = (await alle(`repos/${REPO}/pulls?state=all&sort=created&direction=desc`)).filter(p => efter(p.created_at));
const issues = (await alle(`repos/${REPO}/issues?state=all&labels=undsluppet`)).filter(i => efter(i.created_at));

let vagt = [];
try { vagt = (await alle(`repos/${REPO}/actions/workflows/kundevagt.yml/runs`)).filter(r => efter(r.created_at)); }
catch { /* vagten findes ikke i dette repo endnu */ }

const merged   = prs.filter(p => p.merged_at);
const returret = prs.filter(p => p.state === 'closed' && !p.merged_at);
const cyklus   = merged.map(p => timer(p.created_at, p.merged_at));

// Fangstgrad (DRE): fanget før accept ÷ (fanget før + undsluppet efter).
// «Undsluppet» = issue med label «undsluppet», eller en rød kundevagt-kørsel.
// Fanget før = blokkere talt i dommer-/præmortem-kommentarer (markør nedenfor).
const MARKOER = /BLOKKER(E)?:\s*(\d+)/i;
let fangetFoer = 0;
for (const p of merged) {
  try {
    const kom = await gh(`repos/${REPO}/issues/${p.number}/comments`);
    for (const c of kom) { const m = MARKOER.exec(c.body ?? ''); if (m) fangetFoer += Number(m[2]); }
  } catch { /* springes over */ }
}
const vagtRoed = vagt.filter(r => r.conclusion === 'failure').length;
const undsluppet = issues.length + vagtRoed;

const dage = Math.max(1, Math.round((Date.now() - new Date(SIDEN)) / 864e5));
const tal = [
  ['leverancer accepteret (merged)',      merged.length],
  ['returneret (lukket uden merge)',      returret.length],
  ['returrate',                           merged.length + returret.length ? `${(100 * returret.length / (merged.length + returret.length)).toFixed(0)} %` : '—'],
  ['cyklustid median',                    cyklus.length ? `${median(cyklus).toFixed(1)} t` : '—'],
  ['cyklustid p90',                       cyklus.length ? `${[...cyklus].sort((a,b)=>a-b)[Math.floor(cyklus.length*0.9)].toFixed(1)} t` : '—'],
  ['blokkere fanget FØR accept',          fangetFoer || '— (ingen «BLOKKERE: n» i kommentarer)'],
  ['undsluppet EFTER accept',             `${undsluppet} (${issues.length} issues + ${vagtRoed} røde vagtkørsler)`],
  ['FANGSTGRAD (DRE)',                    pct(fangetFoer, undsluppet) === null ? '— (mangler data)' : `${pct(fangetFoer, undsluppet).toFixed(0)} %`],
  ['kundevagt-kørsler',                   vagt.length || '— (vagten kører ikke her endnu)'],
  ['røde vagtdage pr. 30 dage',           vagt.length ? (30 * vagtRoed / dage).toFixed(1) : '—'],
];

console.log(`\nFabriksmål · ${REPO} · siden ${SIDEN} (${dage} dage)\n`);
for (const [n, v] of tal) console.log(`  ${n.padEnd(34)} ${v}`);
console.log(`
  Fangstgrad er det tal der betyder noget: hvor stor en del af fejlene blev
  fanget FØR Steven eller en kunde så dem. Den kan først beregnes når
  dommere skriver «BLOKKERE: n» i deres rapport, og undslupne fejl får
  label «undsluppet». Konventionen indføres nu — tallet findes om en måned.
`);
