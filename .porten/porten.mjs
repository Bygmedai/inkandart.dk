#!/usr/bin/env node
/**
 * PORTEN — den ene tjek Steven kigger på.
 *
 * Hvorfor den findes:
 *   25.264 agent-PR'er målt (RIT, 2026): én menneskelig anmelder giver 81,2% merge-rate,
 *   to giver 80,3%. Anmelder nr. to tilfører ingenting. Steven er derfor ikke en langsom
 *   anmelder — han er en strukturelt værdiløs anmelder, og det er ikke hans skyld.
 *   Løsningen er ikke en hurtigere Steven. Det er en port han kan stole på.
 *
 * Hvad den IKKE gør:
 *   Den dømmer ikke. Den har ingen sprogmodel. Den sammenligner ingen strenge i prosa.
 *   Tre gange på én dag i S564 forvekslede jeg kode med kommentar ved strengsøgning.
 *   Porten læser struktur: check-runs, filstier, JSON. Intet andet.
 *
 * Fail-closed er konstruktionen, ikke en regel:
 *   Alt starter som SPÆRRET. Kun et positivt, struktureret bevis åbner. Manglende
 *   data er rødt. Tomt felt er rødt. Ukendt tilstand er rødt.
 *   S564: ''.includes('major') === false → tom metadata blev læst som «ikke major» → merget.
 *   Her kan det ikke ske, fordi intet felt kan sige ja ved at være tomt.
 */

export const SPAERRET = 'SPÆRRET';
export const AABEN = 'ÅBEN';
export const UMAALT = 'UMÅLT';

/** Stier hvor en agent aldrig må ændre noget uden et menneske. Sirius betingelse 5 + 10. */
export const LAASTE_STIER = [
  /^\.porten\//,   // F1 (præmortem #178): dommeren selv. Ændringer kræver menneske.
  /^\.github\/workflows\//,
  /^\.github\/actions\//,
  /^\.github\/CODEOWNERS$/,
  /^AGENTS\.md$/,
  /^CLAUDE\.md$/,
  /^REVIEW\.md$/,
  /^renovate\.json$/,
  /^\.claude\/settings\.json$/,
  /vitest\.config\./,
  /playwright\.config\./,
  /^supabase\/migrations\//,
];

/**
 * Stier der KUN er afhængighedsbogholderi. En PR der udelukkende rører disse,
 * har build+test som sit orakel — der er ingen kildekode at anmelde.
 *
 * Hvorfor det ikke er en slækkelse:
 *   Portens eget grundlag (RIT, 25.264 agent-PR'er): én anmelder giver 81,2 %
 *   merge-rate, to giver 80,3 %. At kræve en anmelder oven på grøn CI på en
 *   ren lockfile-diff er præcis den anmelder nr. to som målingen kalder værdiløs.
 *   Rører PR'en så meget som én kildefil, falder den ud af denne kategori.
 *   Låste stier vinder altid — de tjekkes før dette.
 */
export const AFHAENGIGHEDSFILER = [
  /^package\.json$/, /^package-lock\.json$/, /^npm-shrinkwrap\.json$/,
  /^pnpm-lock\.yaml$/, /^yarn\.lock$/, /^bun\.lockb$/,
  /(^|\/)package\.json$/, /(^|\/)package-lock\.json$/, /(^|\/)pnpm-lock\.yaml$/, /(^|\/)yarn\.lock$/,
  /^requirements[^/]*\.txt$/, /^poetry\.lock$/, /^pyproject\.toml$/, /^uv\.lock$/,
  /^Cargo\.toml$/, /^Cargo\.lock$/, /^go\.mod$/, /^go\.sum$/, /^Gemfile\.lock$/, /^composer\.lock$/,
];

/**
 * Anmeldere hvis dom er UDFØRELSE, ikke mening: de kører patchen mod det rigtige
 * build før de udtaler sig. Deres check-run-konklusion ER dommen — struktureret felt,
 * ikke prosa vi søger i.
 *
 * Sprogmodel-anmeldere hører IKKE til her. arXiv 2604.27727 (30/4 2026):
 * κ = 0,159, ROC-AUC 0,594 — knap over tilfældighed. En mening er ikke et orakel.
 */
export const UDFOERENDE_ANMELDERE = ['Vercel Agent Review'];

/**
 * Konklusioner hvor anmelderen ER færdig, men bevidst ikke afgav nogen dom.
 * S570: dette er TAVSHED, ikke et fund. Se noten ved punkt 3.
 * «Review skipped — insufficient Credit» lander som `neutral`.
 */
export const TAVSE_KONKLUSIONER = new Set(['timed_out', 'cancelled', 'neutral', 'skipped', 'stale']);

/** check-run-konklusion → dom. Alt der ikke står her, er IKKE en dom. */
export const KONKLUSION_TIL_DOM = {
  success:         { normal: 0, nit: 0 },
  failure:         { normal: 1, nit: 0 },
  action_required: { normal: 1, nit: 0 },
  timed_out:       null,   // nåede aldrig frem til en dom
  cancelled:       null,
  neutral:         null,   // «Review skipped — insufficient Credit» lander her
  skipped:         null,
  stale:           null,
};

/** @param {string[]} filer @returns {boolean} */
export function kunAfhaengigheder(filer) {
  if (!Array.isArray(filer) || filer.length === 0) return false;   // tom liste beviser intet
  return filer.every((f) => AFHAENGIGHEDSFILER.some((m) => m.test(f)));
}

/**
 * Udleder en dom af en udførende anmelders check-run. Returnerer null hvis der
 * ikke ER en dom — og null betyder SPÆRRET, aldrig «fint».
 */
export function domFraCheck(checks, anmeldere = UDFOERENDE_ANMELDERE) {
  if (!Array.isArray(checks)) return null;
  for (const navn of anmeldere) {
    const c = checks.find((x) => x.navn === navn);
    if (!c) continue;
    if (c.status !== 'completed') return { kilde: navn, alvor: null, uafsluttet: true };
    const kendt = Object.prototype.hasOwnProperty.call(KONKLUSION_TIL_DOM, c.konklusion);
    const alvor = kendt ? KONKLUSION_TIL_DOM[c.konklusion] : null;
    // S570: skeln mellem «anmelderen tav» (kendt konklusion uden dom) og
    // «anmelderens dom kunne ikke læses» (ukendt konklusion). Det første er
    // tavshed. Det andet kan skjule et fund og skal blive ved med at spærre.
    return { kilde: navn, alvor, konklusion: c.konklusion, tavs: kendt && alvor === null };
  }
  return null;
}

/**
 * @param {{
 *   checks: Array<{navn:string, konklusion:string|null, status:string}>,
 *   paakraevede: string[],
 *   filer: string[],
 *   forfatterErAgent: boolean,
 *   anmeldelse: {kilde:string, alvor:{normal:number,nit:number}}|null,
 *   forhaandsvisning: string|null
 * }} kendsgerninger
 */
export function porten(kendsgerninger) {
  const k = kendsgerninger ?? {};
  const grunde = [];
  const noter = [];
  let dom = SPAERRET;

  // ---- 1. Er hver påkrævet check bevisligt grøn? ----
  const paakraevede = Array.isArray(k.paakraevede) ? k.paakraevede : null;
  if (!paakraevede || paakraevede.length === 0) {
    grunde.push('Ingen påkrævede checks defineret på dette repo. En port uden krav er ikke en port.');
    return { dom: SPAERRET, grunde, noter };
  }
  const checks = Array.isArray(k.checks) ? k.checks : [];
  // F2 (præmortem #178): et Map pr. navn er last-wins — en senere, forfalsket
  // eller genkørt post med samme navn ville overdøve en ægte rød. ALLE poster
  // med navnet skal være grønne; én rød/uafsluttet blandt dubletter spærrer.
  for (const navn of paakraevede) {
    const alle = checks.filter((c) => c && c.navn === navn);
    if (alle.length === 0) { grunde.push(`Påkrævet check «${navn}» har ikke rapporteret. Manglende svar er ikke et ja.`); continue; }
    const igang = alle.find((c) => c.status !== 'completed');
    if (igang) { grunde.push(`Påkrævet check «${navn}» kører stadig (${igang.status}).`); continue; }
    const roed = alle.find((c) => c.konklusion !== 'success');
    if (roed) { grunde.push(`Påkrævet check «${navn}» sluttede som «${roed.konklusion ?? 'uden konklusion'}»${alle.length > 1 ? ` (${alle.length} poster med samme navn — den værste tæller)` : ''}.`); continue; }
  }

  // ---- 2. Rører PR'en en låst sti? ----
  const filer = Array.isArray(k.filer) ? k.filer : null;
  if (filer === null) {
    grunde.push('Filliste kunne ikke hentes. Uden den ved jeg ikke om forsyningskæden blev rørt.');
  } else {
    const ramt = filer.filter((f) => LAASTE_STIER.some((m) => m.test(f)));
    // F4 (præmortem #178): agent-klassifikation pr. login-fragment fejlede
    // ÅBENT (login «koko» = menneske). Klassifikation kan spoofes; et
    // menneskes merge kan ikke. Låst sti => porten er rød for ALLE, og
    // Steven merger selv med sin dokumenterede vurdering.
    if (ramt.length) {
      grunde.push(`Rører ${ramt.length} låst sti: ${ramt.slice(0, 4).join(', ')}${ramt.length > 4 ? ' …' : ''}. Kræver et menneskes merge — uanset forfatter.`);
    }
  }

  // ---- 3. Hvem er oraklet for netop denne PR? ----
  //
  // S565: Porten krævede før en anmelderdom på HVER PR. Det er selvmodsigende.
  // Dens eget grundlag er at anmelder nr. to intet tilfører (81,2 % → 80,3 %).
  // På en ren afhængigheds-diff ER build+test oraklet — der er ingen kildekode
  // at have en mening om. På kildekode kræves en anmelder der KØRTE patchen.
  // F5 (præmortem #178): stier alene identificerer ingen afsender. En
  // package.json-only PR fra hvem som helst kunne før tage dependabot-banen
  // med en postinstall i lasten. Banen kræver nu positivt bevist afsender.
  let anmelderTav = false;
  const kunDepsFiler = filer !== null && kunAfhaengigheder(filer);
  const kunDeps = kunDepsFiler && k.erDependabot === true;

  // S570: diffens FORM og afsenderens IDENTITET skal være enige. Er de ikke
  // det, er PR'en formet som noget den ikke er, og så er tavshed ikke god nok.
  //   · ren afhængigheds-diff fra en der IKKE er dependabot   → F5, præmortem #178:
  //     enhver kunne før tage dependabot-banen med en postinstall i lasten.
  //   · dependabot der ALLIGEVEL rører kildekode              → botten gør noget den ikke gør.
  // I begge tilfælde kræves en rigtig dom. Det er ikke fryse-risikoen —
  // fryse-risikoen var almindelige kildekode-PR'er, og dem rører dette ikke.
  const afsenderUenigMedForm = filer !== null
    && ((kunDepsFiler && k.erDependabot !== true) || (!kunDepsFiler && k.erDependabot === true));

  if (kunDeps) {
    noter.push(`Ren afhængigheds-PR fra dependabot (${filer.length} fil${filer.length === 1 ? '' : 'er'}). Build og test er oraklet — ingen anmelder krævet.`);
  } else {
    // S570 · MÅLT 23/8: Porten spærrede på tavshed. I bygmedai-adskillelse
    // afgav «Vercel Agent Review» en brugbar dom 0 af 10 seneste PR'er —
    // resten var `neutral` («Review skipped — insufficient Credit») eller helt
    // fraværende. På inkandart.dk: 11 `neutral` i træk før kreditten blev slået
    // til 23/8. En port der kræver en anmelder man ikke kan købe mere af, er
    // ikke en port — den er en lukket dør. Gjort til påkrævet check havde den
    // frosset seks repoer.
    //
    // Reglen nu: tavshed er en NOTE. Repoets egne påkrævede checks er oraklet,
    // og de er allerede afgjort i punkt 1 ovenfor. Det følger husets eget
    // S565-grundlag: anmelder nr. to flyttede 81,2 % → 80,3 %.
    //
    // Tre ting spærrer stadig, og de er ikke tavshed:
    //   · anmelderen fandt noget          → et fund er et fund
    //   · anmelderen er ikke færdig       → vi har allerede ventet fristen ud
    //   · anmelderens dom kunne ikke læses → ulæselig dom kan skjule et fund
    const a = k.anmeldelse ?? domFraCheck(checks, k.anmeldere);
    const tavshedSpaerrer = afsenderUenigMedForm;
    if (!a || typeof a !== 'object' || a.tavs === true) anmelderTav = true;
    const tavshedsgrund = 'Diffens form og afsenderens identitet er uenige — her gætter jeg ikke på tavshed.';
    if (!a || typeof a !== 'object') {
      (tavshedSpaerrer ? grunde : noter).push(tavshedSpaerrer
        ? `Ingen udførende anmelder har afgivet dom. ${tavshedsgrund}`
        : 'Ingen udførende anmelder var til stede. Repoets egne checks er oraklet.');
    } else if (a.uafsluttet) {
      grunde.push(`Anmelder «${a.kilde}» er ikke færdig endnu.`);
    } else if (a.tavs === true) {
      (tavshedSpaerrer ? grunde : noter).push(tavshedSpaerrer
        ? `Anmelder «${a.kilde}» afgav ingen dom (${a.konklusion}). ${tavshedsgrund}`
        : `Anmelder «${a.kilde}» afgav ingen dom (${a.konklusion}). Repoets egne checks er oraklet.`);
    } else if (!a.alvor || typeof a.alvor.normal !== 'number') {
      grunde.push(`Anmelder «${a.kilde ?? 'ukendt'}» afgav en ulæselig dom${a.konklusion ? ` (${a.konklusion})` : ''}. Ulæselig dom er ikke tavshed — den kan skjule et fund.`);
    } else if (a.alvor.normal > 0) {
      grunde.push(`Anmelder «${a.kilde}» fandt ${a.alvor.normal} fund af vægt.`);
    } else {
      noter.push(`Anmelder «${a.kilde}»: 0 af vægt, ${a.alvor.nit ?? 0} pedanteri.`);
    }
  }

  // ---- 4. Kan Steven klikke og se det virke? ----
  if (typeof k.forhaandsvisning === 'string' && /^https:\/\//.test(k.forhaandsvisning)) {
    noter.push(`Forhåndsvisning: ${k.forhaandsvisning}`);
  } else {
    noter.push('Ingen forhåndsvisning. Porten kan stadig være grøn — men så kan du ikke selv prøve den.');
  }

  if (grunde.length === 0) dom = AABEN;
  return { dom, grunde, noter, anmelderTav };
}

export function kvittering({ dom, grunde, noter, anmelderTav }) {
  if (dom === AABEN) {
    // S570: sig aldrig at anmelderen fandt intet, når hun ikke sagde noget.
    // Et grønt lys skal kunne læses som det er: hvem der målte hvad.
    const linje = anmelderTav
      ? 'Alle påkrævede checks er grønne, og ingen låst sti er rørt. Anmelderen tav — repoets egne checks er oraklet her.'
      : 'Alle påkrævede checks er grønne, ingen låst sti er rørt, og anmelderen fandt intet af vægt.';
    return ['## 🟢 Porten er åben', '', linje, '', ...noter.map((n) => `- ${n}`), '', '_Du behøver ikke læse diffen. Porten har målt det du ellers skulle gætte._'].join('\n');
  }
  return ['## 🔴 Porten er spærret', '', 'Den skal ikke merges endnu. Her er hvorfor:', '', ...grunde.map((g) => `- ${g}`), ...(noter.length ? ['', '<sub>' + noter.join(' · ') + '</sub>'] : [])].join('\n');
}
