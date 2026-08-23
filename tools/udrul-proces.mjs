#!/usr/bin/env node
/**
 * Udrul processen til et repo.
 *
 * Lander den procespakke enhver agent skal kunne finde selv — uanset om det
 * er Claude Code, Grok eller Copilot der bliver spundet op:
 *
 *   AGENTS.md                  processen (krydsleverandør, læses af alle)
 *   docs/briefs/               bygger- og dommerbrief + reglerne
 *   docs/accept/SKABELON.md    hvordan acceptkriterier skrives
 *   .claude/commands/          /praemortem og /accept
 *   scripts/fabriksmaal.mjs    måler om det virker
 *
 * Porten og kundevagten følger IKKE med: Porten kræver repoets egne
 * check-navne, og kundevagten kræver repoets egne kunderejser. Begge skal
 * skrives med hånden pr. repo — en generisk vagt der ikke måler noget
 * kundenært er værre end ingen vagt.
 *
 *   node tools/udrul-proces.mjs --til ../andet-repo [--skriv]
 *
 * Uden --skriv viser den kun hvad der ville ske (tørløb er standard).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TIL = arg('--til');
const SKRIV = process.argv.includes('--skriv');
if (!TIL) { console.error('brug: node tools/udrul-proces.mjs --til <sti> [--skriv]'); process.exit(2); }

const HER = resolve(dirname(new URL(import.meta.url).pathname), '..');
const MAAL = resolve(TIL);
if (HER === MAAL) { console.error('kilde og mål er samme repo'); process.exit(2); }
if (!existsSync(join(MAAL, '.git'))) { console.error(`${MAAL} ligner ikke et git-repo`); process.exit(2); }

// Filer udrulleren EJER — overskrives, fordi de skal være ens overalt.
const PAKKE = [
  'docs/PROCES.md',
  'docs/briefs/README.md',
  'docs/briefs/BYGGER.md',
  'docs/briefs/DOMMER.md',
  'docs/accept/SKABELON.md',
  '.claude/commands/praemortem.md',
  '.claude/commands/accept.md',
  'scripts/fabriksmaal.mjs',
];

let nye = 0, uaendrede = 0, konflikter = 0, opdateret = 0;
for (const f of PAKKE) {
  const kilde = join(HER, f);
  if (!existsSync(kilde)) { console.log(`  MANGLER I KILDEN  ${f}`); continue; }
  const ny = readFileSync(kilde, 'utf8');
  const maal = join(MAAL, f);

  if (existsSync(maal)) {
    const gl = readFileSync(maal, 'utf8');
    if (gl === ny) { uaendrede++; continue; }
    if (f === 'docs/PROCES.md') {
      // Udrulleren ejer processen: den SKAL være ens i alle repoer, ellers
      // er der ingen proces. Repospecifikt hører hjemme i AGENTS.md.
      opdateret++;
      console.log(`  ${SKRIV ? 'opdateret' : 'ville opdatere'} ${f}`);
      if (SKRIV) writeFileSync(maal, ny);
      continue;
    }
    // Alt andet kan være tilpasset af et menneske. Vi overskriver ALDRIG i
    // stilhed — det er samme fejlklasse som at melde noget «done».
    konflikter++;
    console.log(`  KONFLIKT          ${f}  (findes og er anderledes — ret i hånden)`);
    continue;
  }
  nye++;
  console.log(`  ${SKRIV ? 'skrevet' : 'ville skrive'}   ${f}`);
  if (SKRIV) { mkdirSync(dirname(maal), { recursive: true }); writeFileSync(maal, ny); }
}

console.log(`\n${MAAL}`);
console.log(`  ${nye} nye · ${opdateret} opdateret · ${uaendrede} uændrede · ${konflikter} konflikter`);

// AGENTS.md ejes af repoet — men den SKAL pege på processen, ellers finder
// en frisk agent den aldrig. Vi indsætter kun pegepinden hvis den mangler.
const agents = join(MAAL, 'AGENTS.md');
if (existsSync(agents)) {
  const a = readFileSync(agents, 'utf8');
  if (!a.includes('docs/PROCES.md')) {
    console.log(`  ${SKRIV ? 'indsat' : 'ville indsætte'}    pegepind til docs/PROCES.md i AGENTS.md`);
    if (SKRIV) writeFileSync(agents, a.trimEnd() + '\n\n' + readFileSync(join(HER, 'tools/peger-paa-proces.md'), 'utf8'));
  }
} else {
  console.log('  ADVARSEL          AGENTS.md findes ikke — en Grok- eller Codex-session finder ikke processen selv');
}
if (!SKRIV) console.log('  tørløb — kør igen med --skriv for at lande det');
console.log(`
  Mangler stadig, med hånden, pr. repo:
   .github/workflows/porten.yml   repoets egne check-navne
   scripts/kundevagt.mjs          repoets egne kunderejser
   docs/accept/<navn>.md          kriterier pr. leverance
`);
