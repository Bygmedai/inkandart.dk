import { porten, kvittering, LAASTE_STIER, AABEN, SPAERRET, kunAfhaengigheder, domFraCheck, UDFOERENDE_ANMELDERE, KONKLUSION_TIL_DOM, TAVSE_KONKLUSIONER } from './porten.mjs';
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
// F4 (præmortem #178): «menneske må godt» hvilede på en klassifikation der
// fejlede ÅBENT (login «koko» = menneske). Låst sti spærrer nu for ALLE —
// mennesket udøver sin ret ved selv at merge, ikke ved at porten gætter.
t('låst sti spærrer også for et menneske — mennesket merger selv', () => er(porten({ ...grøn, filer: ['.github/workflows/ci.yml'], forfatterErAgent: false }).dom, SPAERRET));
t('F4: agent med ukendt login («koko») spærres på låst sti', () => er(porten({ ...grøn, filer: ['.github/workflows/ci.yml'], forfatterErAgent: false }).dom, SPAERRET));
t('F1: .porten/ er selv en låst sti — dommeren kan ikke ombygges i stilhed', () => er(porten({ ...grøn, filer: ['.porten/porten.mjs'] }).dom, SPAERRET));
t('manglende filliste spærrer', () => er(porten({ ...grøn, filer: null }).dom, SPAERRET));
// S570: tavshed spærrer ikke længere — se porten.mjs punkt 3.
t('ingen anmelder til stede åbner, når repoets egne checks er grønne', () => er(porten({ ...grøn, anmeldelse: null }).dom, AABEN));
t('MODPRØVE: ingen anmelder + RØD egen check spærrer stadig', () => er(porten({ ...grøn, anmeldelse: null, checks: [grøn.checks[0], { navn: 'test', status: 'completed', konklusion: 'failure' }] }).dom, SPAERRET));
t('anmelderdom uden alvorstal spærrer (ulæselig ≠ tavs)', () => er(porten({ ...grøn, anmeldelse: { kilde: 'x', alvor: {} } }).dom, SPAERRET));
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
t('ren afhængigheds-PR fra DEPENDABOT + grøn CI → ÅBEN uden anmelder',
  () => er(porten({...CI, filer:['package.json','package-lock.json'], erDependabot:true}).dom, AABEN));
// F5 (præmortem #178): stier er ikke afsender. package.json-only fra en
// vilkårlig forfatter kunne før tage dependabot-banen med postinstall i lasten.
t('F5: samme diff UDEN dependabot-identitet kræver anmelder → SPÆRRET',
  () => er(porten({...CI, filer:['package.json','package-lock.json']}).dom, SPAERRET));
// F2 (præmortem #178): Map pr. navn var last-wins — en senere post med samme
// navn (fx en forfalsket commit-status) overdøvede en ægte rød check-run.
t('F2: rød check-run efterfulgt af grøn post med SAMME navn → SPÆRRET', () =>
  er(porten({...CI, checks:[
    {navn:'build',status:'completed',konklusion:'failure'},
    {navn:'build',status:'completed',konklusion:'success'},
    {navn:'test',status:'completed',konklusion:'success'},
  ], filer:['package.json'], erDependabot:true}).dom, SPAERRET));
t('F2 spejlvendt: grøn først, rød sidst → stadig SPÆRRET (rækkefølge er ligegyldig)', () =>
  er(porten({...CI, checks:[
    {navn:'build',status:'completed',konklusion:'success'},
    {navn:'build',status:'completed',konklusion:'failure'},
    {navn:'test',status:'completed',konklusion:'success'},
  ], filer:['package.json'], erDependabot:true}).dom, SPAERRET));
t('afhængigheds-PR med RØD CI → SPÆRRET',
  () => er(porten({...CI, checks:[{navn:'build',status:'completed',konklusion:'success'},{navn:'test',status:'completed',konklusion:'failure'}], filer:['package.json'], erDependabot:true}).dom, SPAERRET));
t('afhængigheds-PR der også rører kildekode → kræver anmelder → SPÆRRET',
  () => er(porten({...CI, filer:['package.json','src/a.ts'], erDependabot:true}).dom, SPAERRET));
t('afhængigheds-PR der rører en LÅST sti → SPÆRRET uanset hvad',
  () => er(porten({...CI, filer:['package.json','.github/workflows/ci.yml'], erDependabot:true}).dom, SPAERRET));
t('kildekode + udførende anmelder grøn → ÅBEN',
  () => er(porten({...medAnmelder('success'), filer:['src/a.ts']}).dom, AABEN));
t('S570: kildekode + anmelder sprunget over (manglende kredit) → ÅBEN, noteret',
  () => er(porten({...medAnmelder('neutral'), filer:['src/a.ts']}).dom, AABEN));
t('S570 MODPRØVE: samme tavse anmelder + RØD egen check → SPÆRRET',
  () => er(porten({...medAnmelder('neutral'), filer:['src/a.ts'],
    checks:[{navn:'build',status:'completed',konklusion:'success'},{navn:'test',status:'completed',konklusion:'failure'},{navn:'Vercel Agent Review',status:'completed',konklusion:'neutral'}]}).dom, SPAERRET));
t('S570: tavshed skal STÅ i kvitteringen — et grønt lys må ikke skjule hvorfor',
  () => { const r = porten({...medAnmelder('neutral'), filer:['src/a.ts']});
    if (!r.noter.some((n) => /afgav ingen dom \(neutral\)/.test(n))) throw new Error('tavsheden blev ikke noteret: '+JSON.stringify(r.noter)); er(true,true); });
t('S570: helt fraværende anmelder skal OGSÅ stå i kvitteringen',
  () => { const r = porten({...CI, filer:['src/a.ts']});
    if (!r.noter.some((n) => /Ingen udførende anmelder var til stede/.test(n))) throw new Error('fraværet blev ikke noteret: '+JSON.stringify(r.noter)); er(true,true); });
t('S570: hver tavs konklusion åbner — enkeltvis, ikke kun neutral',
  () => { for (const kk of TAVSE_KONKLUSIONER) { if (kk === 'timed_out') continue;
      const d = porten({...medAnmelder(kk), filer:['src/a.ts']}).dom;
      if (d !== AABEN) throw new Error(`${kk} spærrede`); } er(true,true); });
t('S570 MODPRØVE: en UKENDT konklusion er ikke tavshed → SPÆRRET',
  () => er(porten({...medAnmelder('noget_helt_nyt'), filer:['src/a.ts']}).dom, SPAERRET));
t('S570 MODPRØVE: anmelder der stadig kører spærrer stadig — fristen er ventet ud',
  () => er(porten({...medAnmelder(null,'in_progress'), filer:['src/a.ts']}).dom, SPAERRET));
t('S570 MODPRØVE: tavs anmelder ophæver ikke låst sti',
  () => er(porten({...medAnmelder('neutral'), filer:['.porten/porten.mjs']}).dom, SPAERRET));
t('S570: domFraCheck mærker tavshed, ikke ulæselighed',
  () => { er(domFraCheck(medAnmelder('neutral').checks).tavs, true);
          er(domFraCheck([{navn:'Vercel Agent Review',status:'completed',konklusion:'noget_nyt'}]).tavs, false); });
t('kildekode + anmelder fandt noget → SPÆRRET',
  () => er(porten({...medAnmelder('failure'), filer:['src/a.ts']}).dom, SPAERRET));
t('manglende filliste → aldrig ren afhængigheds-PR → SPÆRRET',
  () => er(porten({...CI, filer:null}).dom, SPAERRET));
t('eksplicit anmeldelse slår stadig igennem (bagudkompatibel)',
  () => er(porten({...CI, filer:['src/a.ts'], anmeldelse:{kilde:'harbor',alvor:{normal:0,nit:1}}}).dom, AABEN));
t('eksplicit anmeldelse med fund spærrer, selv om Vercel er grøn',
  () => er(porten({...medAnmelder('success'), filer:['src/a.ts'], anmeldelse:{kilde:'harbor',alvor:{normal:2,nit:0}}}).dom, SPAERRET));

console.log('\n  — S570: form og afsender skal være enige —');
t('F5 bevaret: dependency-diff uden dependabot-identitet + TAVS anmelder → SPÆRRET',
  () => er(porten({...medAnmelder('neutral'), filer:['package.json'], erDependabot:false}).dom, SPAERRET));
t('F5 bevaret: samme, men slet ingen anmelder → SPÆRRET',
  () => er(porten({...CI, filer:['package.json'], erDependabot:false}).dom, SPAERRET));
t('dependabot der rører kildekode + tavs anmelder → SPÆRRET',
  () => er(porten({...medAnmelder('neutral'), filer:['package.json','src/a.ts'], erDependabot:true}).dom, SPAERRET));
t('MODPRØVE: almindelig kildekode-PR (form og afsender enige) + tavs anmelder → ÅBEN',
  () => er(porten({...medAnmelder('neutral'), filer:['src/a.ts'], erDependabot:false}).dom, AABEN));
t('MODPRØVE: ægte dependabot-diff er stadig ÅBEN uden anmelder overhovedet',
  () => er(porten({...CI, filer:['package.json','package-lock.json'], erDependabot:true}).dom, AABEN));
t('uenig form + RIGTIG grøn anmelderdom → ÅBEN (det er tavsheden der spærrer, ikke formen)',
  () => er(porten({...medAnmelder('success'), filer:['package.json'], erDependabot:false}).dom, AABEN));
t('grunden skal NAVNGIVE uenigheden — ikke bare sige nej',
  () => { const r = porten({...medAnmelder('neutral'), filer:['package.json'], erDependabot:false});
    if (!r.grunde.some((g) => /form og afsenderens identitet er uenige/.test(g))) throw new Error('grunden forklarer ikke: '+JSON.stringify(r.grunde)); er(true,true); });


console.log('\n  — S570: kvitteringen må ikke påstå mere end den ved —');
t('tavs anmelder → kvitteringen siger IKKE «fandt intet af vægt»', () => {
  const r = porten({...medAnmelder('neutral'), filer:['src/a.ts']});
  const k = kvittering(r);
  if (/fandt intet af vægt/.test(k)) throw new Error('kvitteringen påstår en dom der aldrig blev afgivet');
  if (!/Anmelderen tav/.test(k)) throw new Error('kvitteringen skjuler at anmelderen tav');
  er(true, true);
});
t('MODPRØVE: rigtig grøn dom → kvitteringen SIGER «fandt intet af vægt»', () => {
  const k = kvittering(porten({...medAnmelder('success'), filer:['src/a.ts']}));
  if (!/fandt intet af vægt/.test(k)) throw new Error('den rigtige dom forsvandt');
  er(true, true);
});

console.log(`\n${n - f}/${n} bestået`);

process.exit(f ? 1 : 0);
