/**
 * Samtykkeerklaeringen — felterne og reglerne, uden netvaerk.
 *
 * Formen kommer fra Simones egen formular (Fra Simone, 31/8). Ideen er
 * hans og den er rigtig: kunden udfylder det vaesentlige HJEMMEFRA, saa
 * stolen bruges paa arbejde og ikke paa papir.
 *
 * Én ting er lavet om. Hans version gemte i browserens eget lager, og et
 * skema udfyldt paa kundens telefon blev derfor liggende paa kundens
 * telefon — butikken saa det aldrig. Her sendes det i stedet.
 *
 * Reglerne bor her og ikke i ruten, saa de kan proeves uden en server.
 */

export const HELBRED = [
  "gravid",
  "blodfortyndende",
  "allergi",
  "hudlidelse",
  "andet",
] as const;

export const SAMTYKKER = ["atten", "permanent", "aftercare"] as const;

/**
 * Stoerrelse er et VALG, ikke fritekst. Modstrids-reglen «blodfortyndende
 * og en stor flade» skal kunne regnes ud; «ret stor, tror jeg» kan ikke
 * maales. Tre trin med en fysisk maalestok kunden selv kan se paa sig.
 */
export const STOERRELSER = ["lille", "mellem", "stor"] as const;
export const FARVER = ["sort", "farve"] as const;

export type Sprog = "da" | "en";

export type Samtykke = {
  /** Kundens sprog. Fladen sendte det allerede; valider() smed det vaek,
   *  saa en engelsk kunde fik «Din samtykkeerklaering» i indbakken.
   *  Sirius' fund 1/9 — et braendt EN-flow, ikke kosmetik. */
  sprog: Sprog;
  navn: string;
  foedselsdato: string;
  /** Dagen aftalen staar paa. Kunden taster den selv — Book.dk kan ikke
   *  levere den maskinelt, og et token-system er fravalgt (Steven 1/9). */
  aftale_dato: string;
  email: string;
  telefon: string;
  kunstner: string;
  placering: string;
  motiv: string;
  stoerrelse: string;
  farve: string;
  helbred: string[];
  helbred_note: string;
  foto_ok: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** ISO-dato. Kalenderfeltet leverer den; en skrevet dato skal ligne den. */
const DATO_RE = /^\d{4}-\d{2}-\d{2}$/;

const MAX = 400;
/** Felter brevet lover ORDRET. De maa aldrig klippes i tavshed. */
export const ORDRET = ["motiv", "helbred_note", "placering"] as const;
const s = (v: unknown) => (v == null ? "" : String(v).trim().slice(0, MAX));

export type Fejl = { felt: string; grund: string };

/**
 * FAIL-CLOSED. /api/subscribe var fail-open i S568 — et uventet svar faldt
 * igennem til ok, og kunden fik kvittering for noget der aldrig blev
 * skrevet. Her gaelder samme laere: er noget uklart, er det en fejl.
 */
export function valider(raw: unknown): { ok: true; vaerdi: Samtykke } | { ok: false; fejl: Fejl[] } {
  const fejl: Fejl[] = [];
  const d = (raw ?? {}) as Record<string, unknown>;

  const sprog: Sprog = d.sprog === "en" ? "en" : "da";

  const navn = s(d.navn);
  if (navn.length < 2) fejl.push({ felt: "navn", grund: "mangler" });

  // «Ordret» skal vaere sandt. Serveren klippede foer stiltiende ved 400
  // tegn, mens brevet lovede kundens egne ord ordret (Sirius' fund 1/9).
  // Nu er for lang tekst en FEJL kunden kan se, ikke et tab hun ikke
  // opdager. Fladen har samme graense, saa det sker aldrig i en browser.
  for (const felt of ORDRET) {
    if (typeof d[felt] === "string" && (d[felt] as string).trim().length > MAX) {
      fejl.push({ felt, grund: "for-lang" });
    }
  }

  const foedselsdato = s(d.foedselsdato);
  if (!DATO_RE.test(foedselsdato)) fejl.push({ felt: "foedselsdato", grund: "format" });
  else if (aarSiden(foedselsdato) < 18) fejl.push({ felt: "foedselsdato", grund: "under18" });

  const email = s(d.email);
  if (!EMAIL_RE.test(email)) fejl.push({ felt: "email", grund: "format" });

  const aftale_dato = s(d.aftale_dato);
  if (!DATO_RE.test(aftale_dato)) fejl.push({ felt: "aftale_dato", grund: "format" });

  const placering = s(d.placering);
  if (!placering) fejl.push({ felt: "placering", grund: "mangler" });

  const stoerrelse = s(d.stoerrelse);
  if (!(STOERRELSER as readonly string[]).includes(stoerrelse))
    fejl.push({ felt: "stoerrelse", grund: "mangler" });

  const farve = s(d.farve);
  if (!(FARVER as readonly string[]).includes(farve))
    fejl.push({ felt: "farve", grund: "mangler" });

  const motiv = s(d.motiv);
  if (!motiv) fejl.push({ felt: "motiv", grund: "mangler" });

  // Alle tre erklaeringer skal vaere krydset af. Et delvist ja er et nej.
  for (const k of SAMTYKKER) {
    if (d[k] !== true && d[k] !== "true" && d[k] !== "on") {
      fejl.push({ felt: k, grund: "ikke-accepteret" });
    }
  }

  const helbred = Array.isArray(d.helbred)
    ? d.helbred.map(String).filter((h) => (HELBRED as readonly string[]).includes(h))
    : [];

  if (fejl.length) return { ok: false, fejl };
  return {
    ok: true,
    vaerdi: {
      sprog,
      navn,
      foedselsdato,
      aftale_dato,
      email,
      telefon: s(d.telefon),
      kunstner: s(d.kunstner),
      placering,
      motiv,
      stoerrelse,
      farve,
      helbred,
      helbred_note: s(d.helbred_note),
      foto_ok: d.foto_ok === true || d.foto_ok === "true" || d.foto_ok === "on",
    },
  };
}

/** Hele aar mellem en ISO-dato og i dag. */
export function aarSiden(iso: string, nu = new Date()): number {
  const f = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(f.getTime())) return -1;
  let a = nu.getUTCFullYear() - f.getUTCFullYear();
  const m = nu.getUTCMonth() - f.getUTCMonth();
  if (m < 0 || (m === 0 && nu.getUTCDate() < f.getUTCDate())) a -= 1;
  return a;
}

/**
 * Modstrid — der hvor kundens krop siger noget andet end kundens oenske.
 *
 * Stevens bestilling 1/9: artisten skal «kunne raadgive saafremt der er
 * ting der skal tages hensyn til, som kunden har beskrevet om sin krop og
 * sig selv, og som kan vaere i modstrid med kundens eget oenske.»
 *
 * DEN HER LISTE ER IKKE MEDICINSK RAADGIVNING. Den raaber; den afgoer
 * ikke om nogen maa tatoveres. Den skal godkendes af nogen der saetter
 * tusch i mennesker til daglig — indtil da er den et udkast der virker.
 *
 * Reglen er bevidst FORSIGTIG: er vi i tvivl, raaber vi. En overfloedig
 * bemaerkning koster en samtale; en manglende koster en skade.
 */
export type Modstrid = { noegle: string; tekst: string };

/**
 * @param sprog teksten skrives paa. Noeglen er den samme paa begge, saa
 *        de to udgaver kan parres.
 *
 * Husets brev baerer BEGGE sprog. Steven 1/9: «Vi har 40 % udenlandske
 * kunder og 50 % af vores artister er fra udlandet.» Jeg havde skrevet
 * «husets brev er altid dansk — det laeses af studiet», og det er
 * forkert. En udenlandsk artist fik sikkerhedsadvarslerne paa dansk.
 *
 * Og det loeses ikke ved at foelge KUNDENS sprog: den almindeligste
 * uheldige kombination er en udenlandsk artist med en dansk kunde.
 */
export function modstrid(v: Samtykke, sprog: Sprog = "da"): Modstrid[] {
  const ud: Modstrid[] = [];
  const har = (h: string) => v.helbred.includes(h);

  if (har("gravid")) {
    ud.push({
      noegle: "gravid",
      tekst: sprog === "en"
        ? "The customer has told us she is pregnant. Talk it through before you start."
        : "Kunden har oplyst at hun er gravid. Tag snakken før I går i gang.",
    });
  }
  // BEVIDST uden betingelse paa stoerrelse. PR-teksten sagde foerst
  // «blodfortyndende OG en stor flade» — det beskrev en spaerre der ikke
  // fandtes i koden (Sirius' fund 1/9). Af de to maader at rette det paa
  // vaelger jeg at skrive reglen som den er, ikke at bygge spaerren:
  // en LILLE tatovering bloeder ogsaa, og en regel der tier ved «lille»
  // ville vaere daarligere for kunden. Stoerrelsen staar i teksten, saa
  // artisten kan vaegte den — den afgoer bare ikke OM der raabes.
  if (har("blodfortyndende")) {
    ud.push({
      noegle: "bloedning",
      tekst: sprog === "en"
        ? `Blood-thinning medication reported, and the design is ${STOERRELSE_ORD_EN[v.stoerrelse] ?? v.stoerrelse}. Expect more bleeding and slower healing.`
        : `Blodfortyndende medicin oplyst, og motivet er ${STOERRELSE_ORD[v.stoerrelse] ?? v.stoerrelse}. Regn med mere blødning og længere heling.`,
    });
  }
  if (har("allergi") && v.farve === "farve") {
    ud.push({
      noegle: "pigment",
      tekst: sprog === "en"
        ? "Allergy reported, and the design is in colour. Ask what the allergy covers before you choose pigment."
        : "Allergi oplyst, og motivet skal være i farver. Spørg hvad allergien gælder, før I vælger pigment.",
    });
  }
  if (har("hudlidelse")) {
    ud.push({
      noegle: "hud",
      tekst: sprog === "en"
        ? `Skin condition reported. Ask whether it is on ${v.placering || "the placement"}.`
        : `Hudlidelse oplyst. Spørg om den sidder på ${v.placering || "det sted motivet skal sidde"}.`,
    });
  }
  if (har("andet") || v.helbred_note) {
    ud.push({
      noegle: "egne-ord",
      tekst: sprog === "en"
        ? "The customer wrote something in her own words. Read it."
        : "Kunden har skrevet noget med sine egne ord. Læs det.",
    });
  }
  return ud;
}

/** Stoerrelsen sagt som et menneske ville sige den. */
export const STOERRELSE_ORD: Record<string, string> = {
  lille: "mindre end en håndflade",
  mellem: "mellem en håndflade og en underarm",
  stor: "større end en underarm",
};


/* ─────────────────────────────────────────────────────────────────
 * BREVENE
 *
 * De bor i SAMME modul som reglerne, og det er et bevidst kald: en
 * proeve importerer denne fil direkte i node, og en relativ VAERDI-import
 * mellem to .ts-filer resolver ikke der. Med endelsen paa («./samtykke.ts»)
 * bliver node glad og TypeScript-bygget roedt. To filer kunne altsaa kun
 * faa det ene af de to til at virke.
 *
 * Samme laere som lib/content.ts og lib/tider.ts: naar husets opsaetning
 * og mit design er uenige, er det mit design der giver sig.
 * ─────────────────────────────────────────────────────────────────
 *
 * Brevene. To modtagere, to breve — bygget uden netvaerk, saa de kan
 * proeves uden en server.
 *
 * VIGTIGT om sproget: identifikatorer i koden er ASCII (aa/oe/ae), men
 * ALT en kunde eller en artist laeser, skal vaere rigtigt dansk. QA'en
 * 1/9 fandt «Foedselsdato» og «Se ogsaa» ude paa den levende flade —
 * repoets omskrivning var sivet ud i kundens tekst. Det maa ikke ske her.
 *
 * VIGTIGT om emnefeltet: et emnefelt staar i notifikationer, i
 * indbakkelister og i skaermbilleder. Derfor baerer det ALDRIG et
 * helbredsord — kun det neutrale maerke GENNEMGANG. Hvad der skal
 * gennemgaas, staar inde i brevet.
 */

/**
 * Helbredsordene i TRE udgaver, fordi de laeses af to forskellige
 * mennesker paa to sprog:
 *
 *   hus   → artisten laeser OM kunden.     «Kunden tager …»   altid dansk
 *   da    → kunden laeser om SIG SELV.     «Du tager …»
 *   en    → samme, paa engelsk.            «You take …»
 *
 * Foer 1/9 var der kun ÉN dansk udgave, skrevet i husets perspektiv, og
 * den blev genbrugt i kundens eget brev. Steven fik derfor et brev der
 * sagde «Hej Steven» og to linjer nede «Kunden tager blodfortyndende
 * medicin». Maalt i hans indbakke, ikke i en proeve.
 */
const HELBRED_ORD: Record<string, Record<string, string>> = {
  "hus-en": {
    gravid: "The customer is pregnant",
    blodfortyndende: "The customer takes blood-thinning medication",
    allergi: "The customer has an allergy",
    hudlidelse: "The customer has a skin condition",
    andet: "The customer noted something else",
  },
  hus: {
    gravid: "Kunden er gravid",
    blodfortyndende: "Kunden tager blodfortyndende medicin",
    allergi: "Kunden har en allergi",
    hudlidelse: "Kunden har en hudlidelse",
    andet: "Kunden har noteret noget andet",
  },
  da: {
    gravid: "Du er gravid",
    blodfortyndende: "Du tager blodfortyndende medicin",
    allergi: "Du har en allergi",
    hudlidelse: "Du har en hudlidelse",
    andet: "Du har noteret noget andet",
  },
  en: {
    gravid: "You are pregnant",
    blodfortyndende: "You take blood-thinning medication",
    allergi: "You have an allergy",
    hudlidelse: "You have a skin condition",
    andet: "You noted something else",
  },
};

const FARVE_ORD: Record<string, string> = { sort: "sort blæk", farve: "farver" };

const FARVE_ORD_EN: Record<string, string> = { sort: "black ink", farve: "colour" };
export const STOERRELSE_ORD_EN: Record<string, string> = {
  lille: "smaller than a palm",
  mellem: "between a palm and a forearm",
  stor: "larger than a forearm",
};

/** Emnet til huset. Bærer aldrig et helbredsord — kun et neutralt mærke. */
export function husEmne(v: Samtykke): string {
  const m = modstrid(v);
  // Begge sprog i emnet, saa en artist kan scanne indbakkelisten uden at
  // aabne noget — uanset hvad hun laeser. Stadig intet helbredsord.
  const hale = m.length ? "GENNEMGANG / REVIEW" : "ingen bemærkninger / no notes";
  return `Samtykke · ${v.navn} · ${v.aftale_dato} · ${hale}`;
}

/**
 * Kundens eget emne — paa HENDES sprog.
 *
 * Husets brev er altid dansk: det laeses af studiet. Kundens er ikke.
 * Fladen sendte allerede `sprog`, men valider() smed det vaek, saa en
 * engelsk kunde fik «Din samtykkeerklaering» i indbakken.
 */
export function kundeEmne(v: Samtykke): string {
  return v.sprog === "en"
    ? `Your consent form · Ink & Art · ${v.aftale_dato}`
    : `Din samtykkeerklæring · Ink & Art · ${v.aftale_dato}`;
}

/** 16 fordi «Foto maa bruges:» og «Photos allowed:» er de laengste.
 *  padEnd(12) gav «Foto maa bruges:ja» uden mellemrum — maalt i Stevens
 *  indbakke 1/9. */
/**
 * Datoer som et menneske skriver dem.
 *
 * «2026-09-23» blev linkificeret af Gmail — det staar blaat og
 * understreget i kundens brev, som om det var et telefonnummer (maalt i
 * Stevens indbakke 1/9). Og «Sendt 2026-09-01T11:05:10.727Z» er
 * maskinformat i et brev til et menneske.
 *
 * ISO-datoen bliver staaende i FELTET; det er kun visningen der aendres.
 */
const MAANED: Record<string, string[]> = {
  da: ["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};

export function datoOrd(iso: string, sprog: "da" | "en" = "da"): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, aar, md, dag] = m;
  const navn = MAANED[sprog][Number(md) - 1];
  if (!navn) return iso;
  return sprog === "en"
    ? `${Number(dag)} ${navn} ${aar}`
    : `${Number(dag)}. ${navn} ${aar}`;
}

/** Tidspunkt uden millisekunder og uden Z. Dansk tid, sagt som en tid. */
export function tidOrd(iso: string, sprog: "da" | "en" = "da"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dato = datoOrd(d.toISOString(), sprog);
  const kl = d.toLocaleTimeString(sprog === "en" ? "en-GB" : "da-DK", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Copenhagen",
  });
  return sprog === "en" ? `${dato} at ${kl}` : `${dato} kl. ${kl}`;
}

const linje = (n: string, v: string) => `  ${n.padEnd(16)}${v || "—"}`;

function oensket(v: Samtykke, sprog: string): string {
  if (sprog === "en" || sprog === "hus-en") {
    return [
      // «WHAT YOU WANT» til en artist ville betyde HENDES oenske. Anden
      // person mod den forkerte laeser — samme fejl som i morges, i ny
      // form. AC2 findes netop for at fange den.
      sprog === "hus-en" ? "WHAT THE CUSTOMER WANTS" : "WHAT YOU WANT",
      linje("Design:", v.motiv),
      linje("Placement:", v.placering),
      linje("Size:", STOERRELSE_ORD_EN[v.stoerrelse] ?? v.stoerrelse),
      linje("Colour:", FARVE_ORD_EN[v.farve] ?? v.farve),
    ].join("\n");
  }
  return [
    "ØNSKET",
    linje("Motiv:", v.motiv),
    linje("Placering:", v.placering),
    linje("Størrelse:", STOERRELSE_ORD[v.stoerrelse] ?? v.stoerrelse),
    linje("Farve:", FARVE_ORD[v.farve] ?? v.farve),
  ].join("\n");
}

/**
 * @param maalgruppe "hus" (artisten laeser om kunden) eller "da"/"en"
 *        (kunden laeser om sig selv). Perspektivet er et ARGUMENT — det
 *        maa ikke udledes af v.sprog, for husets brev er altid dansk og
 *        altid i tredje person, ogsaa naar kunden er engelsk.
 */
function kroppen(v: Samtykke, maalgruppe: "hus" | "hus-en" | "da" | "en"): string {
  const ord = HELBRED_ORD[maalgruppe];
  const en = maalgruppe === "en" || maalgruppe === "hus-en";
  const tom = {
    hus: "Kunden har ikke krydset noget af.",
    "hus-en": "The customer did not tick anything.",
    da: "Du har ikke krydset noget af.",
    en: "You did not tick anything.",
  }[maalgruppe];
  const kryds = v.helbred.length
    ? v.helbred.map((h) => `  · ${ord[h] ?? h}`).join("\n")
    : `  · ${tom}`;
  const egne = v.helbred_note
    ? `\n\n  ${
        maalgruppe === "hus-en"
          ? "The customer's own words"
          : maalgruppe === "en"
            ? "In your own words"
            : maalgruppe === "hus"
              ? "Kundens egne ord"
              : "Med egne ord"
      }:\n  «${v.helbred_note}»`
    : "";
  const overskrift = {
    hus: "OPLYST OM KROPPEN",
    "hus-en": "ABOUT THE CUSTOMER'S BODY",
    da: "OPLYST OM KROPPEN",
    en: "ABOUT YOUR BODY",
  }[maalgruppe];
  return `${overskrift}\n${kryds}${egne}`;
}

/**
 * Brevet til huset. Modstriden staar OEVERST — en artist skal ikke rulle
 * ned forbi en adresse for at finde ud af at kunden er gravid.
 *
 * Og en ren erklaering TIER IKKE. Den siger udtrykkeligt at der intet er.
 * En tom skaerm og en ren skaerm skal se forskellige ud (acceptkriterium
 * AC4) — ellers kan «ingenting» ikke skelnes fra «ikke modtaget».
 */
export function husBrev(v: Samtykke, tidspunkt: string): string {
  return [...blok(v, tidspunkt, "da"), "", STREG, "", ...blok(v, tidspunkt, "en")].join("\n");
}

const STREG =
  "──────────────────────────────────────────────────────────────";

/**
 * Én sproglig blok af husets brev. HEL — aldrig en dansk overskrift med
 * en engelsk linje under. Det var fejlen i morges, og den maa ikke komme
 * igen i en ny form (acceptkriterium AC2).
 */
function blok(v: Samtykke, tidspunkt: string, sprog: Sprog): string[] {
  const en = sprog === "en";
  const m = modstrid(v, sprog);
  const top = m.length
    ? [
        en
          ? "⚠ REVIEW REQUIRED — talk to the customer before you start"
          : "⚠ GENNEMGANG KRÆVES — tal med kunden før I går i gang",
        ...m.map((x) => `  · ${x.tekst}`),
      ].join("\n")
    : en
      ? "NO NOTES — the customer reported nothing that speaks against what she wants."
      : "INGEN BEMÆRKNINGER — kunden har ikke oplyst noget der taler imod ønsket.";

  return [
    en ? `CONSENT — ${v.navn}` : `SAMTYKKE — ${v.navn}`,
    en
      ? `Appointment: ${datoOrd(v.aftale_dato, "en")}   ·   Artist: ${v.kunstner || "not given"}`
      : `Aftale: ${datoOrd(v.aftale_dato)}   ·   Artist: ${v.kunstner || "ikke oplyst"}`,
    "",
    top,
    "",
    oensket(v, en ? "hus-en" : "da"),
    "",
    kroppen(v, en ? "hus-en" : "hus"),
    "",
    en ? "THE CUSTOMER" : "KUNDEN",
    linje(en ? "Name:" : "Navn:", v.navn),
    linje(en ? "Born:" : "Født:", v.foedselsdato),
    linje(en ? "Email:" : "Mail:", v.email),
    linje(en ? "Phone:" : "Telefon:", v.telefon),
    "",
    en ? "THE CUSTOMER DECLARED" : "ERKLÆRET AF KUNDEN",
    en ? "  · That she is 18 or older" : "  · Er fyldt 18 år",
    en ? "  · That she understands a tattoo is permanent" : "  · Forstår at en tatovering er permanent",
    en ? "  · That she follows the aftercare she is given" : "  · Følger den aftercare hun får med",
    linje(en ? "Photos allowed:" : "Foto må bruges:", v.foto_ok ? (en ? "yes" : "ja") : (en ? "no" : "nej")),
    "",
    en ? `Filled in ${tidOrd(tidspunkt, "en")}` : `Udfyldt ${tidOrd(tidspunkt)}`,
    "",
    en
      ? "This letter is the whole form. There is no copy in any other\nsystem — not in Shopify, not in a database of ours."
      : "Dette brev er hele erklæringen. Der ligger ikke en kopi i noget\nandet system — hverken i Shopify eller i en database hos os.",
  ];
}


/**
 * Kundens egen kopi. Hendes svar ordret — men UDEN husets vurdering.
 * Modstriden er noget vi laeser ud af hendes svar; den er ikke noget hun
 * har sagt, og den skal ikke laegges i munden paa hende.
 */
export function kundeBrev(v: Samtykke, tidspunkt: string): string {
  // HENDES sprog foerst — hun aabner brevet og skal se sit eget med det
  // samme. Det andet staar under stregen.
  const andet: Sprog = v.sprog === "en" ? "da" : "en";
  return [
    ...kundeBlok(v, tidspunkt, v.sprog),
    "",
    STREG,
    "",
    ...kundeBlok(v, tidspunkt, andet),
  ].join("\n");
}

/**
 * Én sproglig blok af kundens brev. Anden person — det er hende der
 * laeser om sig selv.
 *
 * Kundens brev baerer BEGGE sprog fra 1/9. Jeg argumenterede foerst imod:
 * «hendes kopi er hendes erklaering, og to udgaver rejser spoergsmaalet
 * om hvilken hun sagde ja til.» Steven vendte den, og han har ret —
 * brevet er en KVITTERING, ikke et modunderskrevet dokument. Hun
 * indsendte ét skema paa ét sprog; en oversaettelse ved siden af aendrer
 * ikke hvad hun indsendte.
 *
 * Og det praktiske argument slaar det juridiske: ÉT brevformat er
 * simplere end to. Det var netop to kodeveje der skabte sprogblandingen
 * samme morgen.
 */
function kundeBlok(v: Samtykke, tidspunkt: string, sprog: Sprog): string[] {
  const en = sprog === "en";
  const fornavn = v.navn.split(" ")[0];
  return [
    en ? `Hi ${fornavn}` : `Hej ${fornavn}`,
    "",
    en
      ? "Here is the form you sent to Ink & Art. Keep it — it is your own\ncopy, and you should not have to ask us for it."
      : "Her er den erklæring du sendte til Ink & Art. Gem den — det er din\negen kopi, og du skal ikke bede os om den.",
    "",
    en
      ? `Appointment: ${datoOrd(v.aftale_dato, "en")}   ·   Artist: ${v.kunstner || "not given"}`
      : `Aftale: ${datoOrd(v.aftale_dato)}   ·   Artist: ${v.kunstner || "ikke oplyst"}`,
    "",
    oensket(v, sprog),
    "",
    kroppen(v, sprog),
    "",
    en ? "YOU DECLARED" : "DU ERKLÆREDE",
    en ? "  · That you are 18 or older" : "  · At du er fyldt 18 år",
    en ? "  · That you understand a tattoo is permanent" : "  · At du forstår at en tatovering er permanent",
    en ? "  · That you follow the aftercare you are given" : "  · At du følger den aftercare du får med",
    linje(en ? "Photos allowed:" : "Foto må bruges:", v.foto_ok ? (en ? "yes" : "ja") : (en ? "no" : "nej")),
    "",
    en ? `Sent ${tidOrd(tidspunkt, "en")}` : `Sendt ${tidOrd(tidspunkt)}`,
    "",
    en
      ? "If anything is wrong, reply to this email — we will fix it at the counter."
      : "Er noget forkert, så svar på denne mail — så retter vi det ved disken.",
  ];
}


