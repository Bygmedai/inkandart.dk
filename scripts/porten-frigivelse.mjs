/**
 * Frigivelse af en laast sti — hvornaar taeller et menneskes godkendelse?
 *
 * Porten spaerrer enhver PR der roerer en laast sti (.github/workflows/,
 * .porten/, CLAUDE.md …) og siger «kraever et menneskes merge». Indtil 2/9
 * var det en port der ALDRIG kunne blive groen: dommeren fik ingen
 * godkendelse som input, og workflowet koerte ikke paa reviews. Steven
 * godkendte #289 tolv sekunder efter portens sidste koersel — og porten
 * stod roed for evigt. Steven, 2/9: «Det giver jo ikke en mening at have
 * en port der aldrig kan blive groen.»
 *
 * En port der er roed EFTER mennesket har gjort det den bad om, laerer
 * folk at merge hen over roedt. Saa er alle de andre roede ogsaa
 * ligegyldige.
 *
 * HVORFOR EN ALLOWLISTE OG IKKE «ligner et menneske»
 *
 * F4 (praemortem #178): klassifikation efter login-fragment fejlede
 * AABENT — «koko» lignede et menneske. Den fejl gentages ikke her:
 *
 *   · Kun navngivne konti kan laase op. Ukendt godkender taeller for nul.
 *   · Listen ligger i DENNE fil paa default-branch. Workflowet henter
 *     den derfra, ikke fra PR'ens trae — saa en PR kan ikke skrive sig
 *     selv ind i den.
 *   · Godkendelsen skal sidde paa NETOP det commit der doemmes. Pushes
 *     der efter, er den vaerdiloes igen. En gammel godkendelse daekker
 *     ikke ny kode.
 *   · Seneste review pr. konto taeller. «Godkendt, saa aendringer
 *     kraevet» er ikke godkendt. Afvist (dismissed) er ikke godkendt.
 *   · Forfatteren kan ikke laase sin egen PR op, og en Bot-konto kan
 *     ikke laase noget op — uanset navn.
 *
 * KENDT GRAENSE, sagt hoejt: Grok pusher via `stevenwensley-a11y`
 * (CLAUDE.md §1). En godkendelse fra den konto kan derfor i princippet
 * vaere en agents. Det er en kontohygiejne-sag der gaelder ALT paa
 * repoet — ogsaa merge-knappen — og den loeses ikke her. Listen goer
 * i det mindste antagelsen synlig i stedet for implicit.
 *
 * Ren funktion, ingen I/O: den kan proeves med rigtige inputs og
 * mutationer. Workflowet henter reviews og giver dem videre.
 */

/**
 * Konti hvis godkendelse frigiver en laast sti. Aendres kun via PR paa main.
 *
 * TEKSTERNE HERUNDER LAESES AF MENNESKER. `grund` og noterne ender i
 * portens kvittering paa PR'en. Kildekoden skriver aa/oe/ae af vane —
 * og den vane sivede ud i kvitteringen 2/9 08:14: «Ingen gyldig
 * godkendelse paa dette commit fra en konto der maa laase op» stod
 * ved siden af «Låst sti frigives af en godkendelse på netop …».
 * Samme fejl som paa /samtykke 1/9. Alt der returneres som tekst,
 * skrives derfor med æ, ø og å — og en proeve maaler OUTPUTTET.
 */
export const MAA_LAASE_OP = ['stevenwensley-a11y'];

const login = (u) => String(u?.login ?? '').trim().toLowerCase();

/**
 * @param {object} k
 * @param {Array}  k.reviews   GitHub reviews (pulls.listReviews), vilkaarlig orden
 * @param {string} k.headSha   PR'ens nuvaerende head-commit
 * @param {string} k.forfatter PR'ens forfatter-login
 * @param {string[]} [k.maaLaaseOp]
 * @returns {{ frigivet: boolean, af: string|null, grund: string }}
 */
export function frigivelse(k) {
  const reviews = Array.isArray(k?.reviews) ? k.reviews : [];
  const headSha = typeof k?.headSha === 'string' ? k.headSha : '';
  const forfatter = String(k?.forfatter ?? '').trim().toLowerCase();
  const liste = (Array.isArray(k?.maaLaaseOp) ? k.maaLaaseOp : MAA_LAASE_OP)
    .map((s) => String(s).trim().toLowerCase())
    .filter(Boolean);

  if (!headSha) return { frigivet: false, af: null, grund: 'Intet head-commit at binde godkendelsen til.' };
  if (!liste.length) return { frigivet: false, af: null, grund: 'Ingen konto må låse op.' };
  if (!reviews.length) return { frigivet: false, af: null, grund: 'Ingen reviews.' };

  // Seneste review pr. konto. Sorteret paa tid, saa raekkefoelgen i input
  // ikke betyder noget — GitHub giver dem aeldste foerst, men det er ikke
  // noget vi vil staa og falde med.
  const seneste = new Map();
  for (const r of [...reviews].sort((a, b) => Date.parse(a?.submitted_at ?? 0) - Date.parse(b?.submitted_at ?? 0))) {
    const l = login(r?.user);
    if (l) seneste.set(l, r);
  }

  for (const [l, r] of seneste) {
    if (!liste.includes(l)) continue;
    if (l === forfatter) continue;
    if (r?.user?.type === 'Bot') continue;
    if (String(r?.state ?? '').toUpperCase() !== 'APPROVED') continue;
    if (r?.commit_id !== headSha) continue;
    return { frigivet: true, af: r.user.login, grund: `@${r.user.login} godkendte ${headSha.slice(0, 7)}.` };
  }
  return { frigivet: false, af: null, grund: 'Ingen gyldig godkendelse på dette commit fra en konto der må låse op.' };
}

/** Dommerens egen ordlyd for en laast sti. Aendres den ved en udrulning, gaar en proeve roed. */
export const LAAST_STI_GRUND = /^Rører \d+ låst sti/;

/**
 * Anvender en frigivelse paa dommerens resultat — uden at roere dommeren.
 *
 * Den ENESTE grund der kan fjernes, er laast-sti-grunden. En roed check,
 * et manglende svar, en anmelder der fandt noget: intet af det kan en
 * godkendelse frigive. Er der andre grunde tilbage, forbliver dommen
 * spaerret, og noten siger hvad der blev frigivet alligevel — saa
 * kvitteringen ikke lyver om hvad godkendelsen naaede.
 *
 * Returnerer et NYT resultat. Input roeres ikke.
 */
export function anvendFrigivelse(resultat, { fri, ramt, headSha, AABEN }) {
  const r = resultat ?? {};
  const grunde = Array.isArray(r.grunde) ? [...r.grunde] : [];
  const noter = Array.isArray(r.noter) ? [...r.noter] : [];
  const stier = Array.isArray(ramt) ? ramt : [];
  const kort = String(headSha ?? '').slice(0, 7);
  const vist = `${stier.slice(0, 4).join(', ')}${stier.length > 4 ? ' …' : ''}`;

  if (!stier.length) return { ...r, grunde, noter };

  if (!fri?.frigivet) {
    noter.push(`Låst sti frigives af en godkendelse på netop ${kort} fra en konto der må låse op. ${fri?.grund ?? ''}`.trim());
    return { ...r, grunde, noter };
  }

  const tilbage = grunde.filter((g) => !LAAST_STI_GRUND.test(String(g)));
  noter.push(`Låst sti (${vist}) frigivet: @${fri.af} godkendte ${kort}.`);
  const dom = tilbage.length === 0 && typeof AABEN === 'string' ? AABEN : r.dom;
  return { ...r, dom, grunde: tilbage, noter };
}
