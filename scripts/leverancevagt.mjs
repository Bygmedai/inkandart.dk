/**
 * Leverancevagt — ser om husets breve rent faktisk kom frem.
 *
 * Acceptkriterier: docs/accept/leverancevagt.md
 *
 * HVORFOR DEN FINDES
 *
 * `/api/samtykke` er fail-closed mod mailudbyderen: fejler kaldet, siger
 * fladen det. Men et 2xx fra Resend betyder «accepteret til afsendelse»,
 * ikke «landet i indbakken». Sirius pegede paa graensen 1/9; Haruki fandt
 * den i naturen samme dag — et brev fra en anden af husets ruter til
 * `kontak@bygmedai.dk` (stavefejl, mangler et t) havde faaet 2xx og stod
 * `suppressed`. Ingen fik det at vide.
 *
 * INGEN KUNDEDATA I RAPPORTEN
 *
 * Listen fra Resend baerer modtagerens adresse OG emnet — og vores emne
 * baerer kundens navn («Samtykke · Navn · dato»). Rapporten her skriver
 * hverken navn, adresse eller emne. Kun brevets id, dets tilstand og
 * hvornaar det blev sendt.
 *
 * Id'et er en henvisning ind i et system der allerede har adgangsstyring.
 * En CI-log er det ikke.
 *
 * TO NOEGLER, ALDRIG ÉN
 *
 * Den noegle `/api/samtykke` sender med, er sending-only og laast til ét
 * domaene. Den kan ikke laese, og det skal den blive ved med ikke at
 * kunne. Vagten har sin egen laesenoegle.
 */

/**
 * VINDUET. `GET /emails` uden `limit` giver **20** og `has_more: true` —
 * maalt paa husets konto 1/9 af Haruki. Vagten lovede «inden for et
 * doegn» og leverede «de 20 nyeste, uanset hvornaar». Paa kontoen som
 * den ser ud i dag daekker 20 breve fire doegn, saa den SER rigtig ud.
 * Det er praecis dét der goer den farlig: en fredag med flash og
 * erklaeringer kan 20 breve vaere under en time.
 *
 * Rigget fangede det ikke, fordi det svarer med det man giver det.
 * Vinduet blev aldrig sat paa proeve. Derfor har det sit eget scenarie nu.
 */
const API = "https://api.resend.com/emails?limit=100";
const VINDUE_TIMER = 26;

/**
 * Husets eget domaene. Teamet deles med andre kunder, saa uden dette
 * filter gaar husets vagt roed paa en ANDENS stavefejl.
 *
 * Bemaerk forskellen mellem hvad koden SER og hvad loggen BAERER: vagten
 * skal laese afsenderen for at kunne filtrere — den maa bare aldrig
 * skrive den. Mit foerste acceptkriterium blandede de to, og saa kunne
 * filteret ikke bygges (Harukis fund 1/9).
 */
const HUSET = "inkandart.dk";
const TIMEOUT_MS = 15_000;

/**
 * Tilstande der betyder «kom frem». `opened` og `clicked` forudsaetter
 * levering, saa de taeller med.
 */
const LEVERET = new Set(["delivered", "opened", "clicked"]);

/**
 * Tilstande der endnu ikke har sagt noget. Et brev sendt for et minut
 * siden er ikke en fejl — det er undervejs.
 */
const UNDERVEJS = new Set(["sent", "queued", "scheduled", "delivery_delayed"]);

/** Hvor laenge et brev maa vaere «undervejs» foer det taeller som tavst. */
const TAALMODIGHED_TIMER = 6;

function noegle() {
  const k = process.env.RESEND_READ_KEY;
  if (!k) {
    console.error(
      "FEJL: RESEND_READ_KEY mangler.\n" +
        "Vagten kan ikke maale noget, og en vagt der intet maaler maa\n" +
        "aldrig ligne en vagt der intet fandt (AC2).",
    );
    process.exit(1);
  }
  return k;
}

async function hentBreve(k) {
  let res;
  try {
    res = await fetch(API, {
      headers: { Authorization: `Bearer ${k}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    console.error("FEJL: kunne ikke naa Resend (timeout eller netvaerk).");
    process.exit(1);
  }
  if (!res.ok) {
    // Sendenoeglen giver 401/403 her — og det er MENINGEN. Bruger nogen
    // den ved en fejl, skal vagten sige det, ikke tie.
    console.error(
      `FEJL: Resend svarede ${res.status}.\n` +
        (res.status === 401 || res.status === 403
          ? "Er det sendenoeglen? Den er sending-only med vilje (AC4).\n" +
            "Vagten skal have sin EGEN laesenoegle."
          : ""),
    );
    process.exit(1);
  }
  const d = await res.json().catch(() => null);
  const liste = Array.isArray(d?.data) ? d.data : null;
  if (!liste) {
    console.error("FEJL: uventet svar fra Resend — ingen liste at maale paa.");
    process.exit(1);
  }
  return liste;
}

function fraHuset(b) {
  const f = String(b.from ?? "");
  return f.includes(`@${HUSET}`) || f.includes(`.${HUSET}`);
}

function timerSiden(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 3_600_000;
}

const breve = await hentBreve(noegle());

// AC2's negative kontrol: nul breve er IKKE «alt vel». Enten er noeglen
// bundet til et tomt team, eller ogsaa har huset ikke sendt noget — og i
// begge tilfaelde har vagten intet maalt.
if (breve.length === 0) {
  console.error(
    "FEJL: Resend gav nul breve tilbage.\n" +
      "Vagten har intet maalt. Det er ikke det samme som at intet er galt.",
  );
  process.exit(1);
}

// DAEKKEDE VI VINDUET? Er det AELDSTE brev paa siden nyere end vinduets
// start, har vi ikke set hele doegnet — og «100 breve maalt» ville lyde
// som daekning. Samme regel som «tom er roed»: et vindue der ikke
// passede, er ogsaa noget vagten ikke har maalt.
const aeldste = Math.max(...breve.map((b) => timerSiden(b.created_at)));
if (aeldste < VINDUE_TIMER) {
  console.error(
    `FEJL: vinduet blev ikke daekket.\n` +
      `Siden gav ${breve.length} breve, og det aeldste er ${aeldste.toFixed(1)} timer gammelt —\n` +
      `mindre end de ${VINDUE_TIMER} timer vagten skal se paa. Der ligger breve\n` +
      `uden for siden som ingen har set. Haev limit, eller koer oftere.`,
  );
  process.exit(1);
}

// Kun husets egne breve. Vi LAESER afsenderen for at filtrere; vi
// SKRIVER den aldrig.
const mine = breve.filter((b) => fraHuset(b) && timerSiden(b.created_at) <= VINDUE_TIMER);

const gaaet_galt = [];
const tavse = [];

for (const b of mine) {
  const e = String(b.last_event ?? "");
  if (LEVERET.has(e)) continue;
  if (UNDERVEJS.has(e)) {
    if (timerSiden(b.created_at) > TAALMODIGHED_TIMER) {
      tavse.push({ id: b.id, e, t: b.created_at });
    }
    continue;
  }
  gaaet_galt.push({ id: b.id, e, t: b.created_at });
}

const raekke = (x) => `  ${x.id}   ${x.e.padEnd(18)} ${x.t}`;

console.log(
  `Leverancevagt · ${mine.length} af husets breve i de sidste ${VINDUE_TIMER} timer\n` +
    `(siden gav ${breve.length}, aeldste ${aeldste.toFixed(1)} timer)\n`,
);

if (gaaet_galt.length === 0 && tavse.length === 0) {
  console.log(`Alle ${mine.length} er leveret. Ingen bemaerkninger.`);
  process.exit(0);
}

if (gaaet_galt.length) {
  console.log(`**${gaaet_galt.length} brev(e) kom ikke frem:**\n`);
  console.log(gaaet_galt.map(raekke).join("\n"));
  console.log("");
}
if (tavse.length) {
  console.log(
    `**${tavse.length} brev(e) har vaeret undervejs i over ${TAALMODIGHED_TIMER} timer:**\n`,
  );
  console.log(tavse.map(raekke).join("\n"));
  console.log("");
}

console.log(
  "Slaa id'et op i Resend for at se hvem og hvad. Det staar med vilje\n" +
    "ikke her: en CI-log er ikke et sted for en kundes adresse.",
);
process.exit(1);
