import { porten, LAASTE_STIER, AABEN, SPAERRET, kunAfhaengigheder, domFraCheck, UDFOERENDE_ANMELDERE, KONKLUSION_TIL_DOM } from './porten.mjs';
let n = 0, f = 0;
const t = (navn, fn) => { n++; try { fn(); } catch (e) { f++; console.log(`  ✗ ${navn}\n      ${e.message}`); return; } console.log(`  ✓ ${navn}`); };
const er = (a, b, m) => { if (a !== b) throw new Error(`${m ?? ''} fik ${JSON.stringify(a)}, ville have ${JSON.stringify(b)}`); };

const grøn = {
  paakraevede: ['build', 'test'],
  checks: [{ navn: 'build', status: 'completed', konklusion: 'success' }, { navn: 'test', status: 'completed', konklusion: 'success' }],
  filer: ['src/side.tsx'], forfatterErAgent: true,
  anmeldelse: { kilde: 'vercel-agent', alvor: { normal: 0, nit: 2 } },
  forhaandsvisning: 'https://x-abc.vercel.app',
};

console.log('PORTEN — fail-closed ved konstruktion\n');
t('grøn sag åbner', () => er(porten(grøn).dom, AABEN));
t('tomt input spærrer', () => er(porten({}).dom, SPAERRET));
t('undefined spærrer', () => er(porten(undefined).dom, SPAERRET));
t('null spærrer', () => er(porten(null).dom, SPAERRET));
t('ingen påkrævede checks spærrer (port uden krav er ingen port)', () => er(porten({ ...grøn, paakraevede: [] }).dom, SPAERRET));
t('check der ikke har rapporteret spærrer', () => er(porten({ ...grøn, checks: [grøn.checks[0]] }).dom, SPAERRET));
t('check der stadig kører spærrer', () => er(porten({ ...grøn, checks: [grøn.checks[0], { navn: 'test', status: 'in_progress', konklusion: null }] }).dom, SPAERRET));
t('rød check spærrer', () => er(porten({ ...grøn, checks: [grøn.checks[0], { navn: 'test', status: 'completed', konklusion: 'failure' }] }).dom, SPAERRET));
t('konklusion=null på completed spærrer', () => er(porten({ ...grøn, checks: [grøn.checks[0], { navn: 'test', status: 'completed', konklusion: null }] }).dom, SPAERRET));
t('agent der rører .github/workflows spærrer', () => er(porten({ ...grøn, filer: ['.github/workflows/ci.yml'] }).dom, SPAERRET));
t('agent der rører supabase/migrations spærrer', () => er(porten({ ...grøn, filer: ['supabase/migrations/001.sql'] }).dom, SPAERRET));
t('agent der rører AGENTS.md spærrer', () => er(porten({ ...grøn, filer: ['AGENTS.md'] }).dom, SPAERRET));
t('menneske må godt røre låst sti', () => er(porten({ ...grøn, filer: ['.github/workflows/ci.yml'], forfatterErAgent: false }).dom, AABEN));
t('manglende filliste spærrer', () => er(porten({ ...grøn, filer: null }).dom, SPAERRET));
t('ingen anmelderdom spærrer', () => er(porten({ ...grøn, anmeldelse: null }).dom, SPAERRET));
t('anmelderdom uden alvorstal spærrer', () => er(porten({ ...grøn, anmeldelse: { kilde: 'x', alvor: {} } }).dom, SPAERRET));
t('anmelderdom med normal>0 spærrer', () => er(porten({ ...grøn, anmeldelse: { kilde: 'x', alvor: { normal: 1, nit: 0 } } }).dom, SPAERRET));
t('S564-fælden: tom streng må ALDRIG læses som nul', () => er(porten({ ...grøn, anmeldelse: { kilde: 'x', alvor: { normal: '' } } }).dom, SPAERRET));
t('S564-fælden 2: "0" som streng er ikke tallet 0', () => er(porten({ ...grøn, anmeldelse: { kilde: 'x', alvor: { normal: '0' } } }).dom, SPAERRET));
t('manglende forhåndsvisning spærrer IKKE — den noteres', () => er(porten({ ...grøn, forhaandsvisning: null }).dom, AABEN));
t('forfatterErAgent udefineret behandles ikke som agent, men filliste kræves stadig', () => er(porten({ ...grøn, forfatterErAgent: undefined, filer: ['src/a.ts'] }).dom, AABEN));


// ═══════════════════════════════════════════════════════════════════════════
// S565 · UDFØRELSE SOM ORAKEL
//
// Porten krævede før en anmelderdom på HVER PR. Det modsiger dens eget grundlag:
// RIT, 25.264 agent-PR'er — én anmelder 81,2 %, to anmeldere 80,3 %. At kræve en
// anmelder oven på grøn CI på en ren lockfile-diff ER anmelder nr. to.
// Nu: ren afhængigheds-PR → build+test er oraklet. Kildekode → en anmelder der
// KØRTE patchen. Sprogmodel-meninger tæller ikke (κ = 0,159).
// ═══════════════════════════════════════════════════════════════════════════

const CI = { paakraevede: ['build','test'],
  checks: [{navn:'build',status:'completed',konklusion:'success'},{navn:'test',status:'completed',konklusion:'success'}],
  forfatterErAgent: true, anmeldelse: null, forhaandsvisning: null };
const medAnmelder = (konklusion, status='completed') => ({...CI,
  checks:[...CI.checks,{navn:'Vercel Agent Review',status,konklusion}]});

console.log('\n  — kunAfhaengigheder —');
t('lockfile + manifest = ren afhængigheds-PR', () => er(kunAfhaengigheder(['package.json','package-lock.json']), true));
t('monorepo-underkatalog tæller med', () => er(kunAfhaengigheder(['apps/web/package.json','apps/web/pnpm-lock.yaml']), true));
t('én kildefil ophæver det', () => er(kunAfhaengigheder(['package.json','src/a.ts']), false));
t('tom filliste beviser INTET (fail-closed)', () => er(kunAfhaengigheder([]), false));
t('null filliste beviser INTET', () => er(kunAfhaengigheder(null), false));
t('workflow-fil er ikke en afhængighedsfil', () => er(kunAfhaengigheder(['.github/workflows/ci.yml']), false));

console.log('\n  — domFraCheck: konklusion er dommen, ikke prosaen —');
t('success → 0 fund af vægt', () => er(domFraCheck(medAnmelder('success').checks).alvor.normal, 0));
t('failure → fund af vægt', () => er(domFraCheck(medAnmelder('failure').checks).alvor.normal, 1));
t('action_required → fund af vægt', () => er(domFraCheck(medAnmelder('action_required').checks).alvor.normal, 1));
t('neutral («Review skipped — insufficient Credit») er INGEN dom',
  () => er(domFraCheck(medAnmelder('neutral').checks).alvor, null));
t('skipped er ingen dom', () => er(domFraCheck(medAnmelder('skipped').checks).alvor, null));
t('cancelled er ingen dom', () => er(domFraCheck(medAnmelder('cancelled').checks).alvor, null));
t('ukendt konklusion er ingen dom (allowlist, ikke denylist)',
  () => er(domFraCheck([{navn:'Vercel Agent Review',status:'completed',konklusion:'noget_nyt'}]).alvor, null));
t('anmelder der stadig kører markeres uafsluttet',
  () => er(domFraCheck(medAnmelder(null,'in_progress').checks).uafsluttet, true));
t('ingen anmelder til stede → null', () => er(domFraCheck(CI.checks), null));
t('vilde-qa tæller IKKE som udførende anmelder (sprogmodel-dom)',
  () => er(domFraCheck([{navn:'vilde-qa',status:'completed',konklusion:'success'}]), null));
t('KONKLUSION_TIL_DOM har ingen sandhedsværdi der kan opstå ved tomhed',
  () => { for (const [k,v] of Object.entries(KONKLUSION_TIL_DOM)) if (v && v.normal === 0 && k !== 'success') throw new Error(`${k} åbner uden at være success`); er(true,true); });

console.log('\n  — Porten samlet —');
t('ren afhængigheds-PR + grøn CI → ÅBEN uden anmelder',
  () => er(porten({...CI, filer:['package.json','package-lock.json']}).dom, AABEN));
t('afhængigheds-PR med RØD CI → SPÆRRET',
  () => er(porten({...CI, checks:[{navn:'build',status:'completed',konklusion:'success'},{navn:'test',status:'completed',konklusion:'failure'}], filer:['package.json']}).dom, SPAERRET));
t('afhængigheds-PR der også rører kildekode → kræver anmelder → SPÆRRET',
  () => er(porten({...CI, filer:['package.json','src/a.ts']}).dom, SPAERRET));
t('afhængigheds-PR der rører en LÅST sti → SPÆRRET uanset hvad',
  () => er(porten({...CI, filer:['package.json','.github/workflows/ci.yml']}).dom, SPAERRET));
t('kildekode + udførende anmelder grøn → ÅBEN',
  () => er(porten({...medAnmelder('success'), filer:['src/a.ts']}).dom, AABEN));
t('kildekode + anmelder sprunget over (manglende kredit) → SPÆRRET',
  () => er(porten({...medAnmelder('neutral'), filer:['src/a.ts']}).dom, SPAERRET));
t('kildekode + anmelder fandt noget → SPÆRRET',
  () => er(porten({...medAnmelder('failure'), filer:['src/a.ts']}).dom, SPAERRET));
t('manglende filliste → aldrig ren afhængigheds-PR → SPÆRRET',
  () => er(porten({...CI, filer:null}).dom, SPAERRET));
t('eksplicit anmeldelse slår stadig igennem (bagudkompatibel)',
  () => er(porten({...CI, filer:['src/a.ts'], anmeldelse:{kilde:'harbor',alvor:{normal:0,nit:1}}}).dom, AABEN));
t('eksplicit anmeldelse med fund spærrer, selv om Vercel er grøn',
  () => er(porten({...medAnmelder('success'), filer:['src/a.ts'], anmeldelse:{kilde:'harbor',alvor:{normal:2,nit:0}}}).dom, SPAERRET));

console.log(`\n${n - f}/${n} bestået`);
process.exit(f ? 1 : 0);
