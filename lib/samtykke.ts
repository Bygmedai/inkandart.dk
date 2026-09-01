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

export type Samtykke = {
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

  const navn = s(d.navn);
  if (navn.length < 2) fejl.push({ felt: "navn", grund: "mangler" });

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

export function modstrid(v: Samtykke): Modstrid[] {
  const ud: Modstrid[] = [];
  const har = (h: string) => v.helbred.includes(h);

  if (har("gravid")) {
    ud.push({
      noegle: "gravid",
      tekst: "Kunden har oplyst at hun er gravid. Tag snakken foer I gaar i gang.",
    });
  }
  if (har("blodfortyndende")) {
    ud.push({
      noegle: "bloedning",
      tekst: `Blodfortyndende medicin oplyst, og motivet er ${STOERRELSE_ORD[v.stoerrelse] ?? v.stoerrelse}. Regn med mere bloedning og laengere heling.`,
    });
  }
  if (har("allergi") && v.farve === "farve") {
    ud.push({
      noegle: "pigment",
      tekst: "Allergi oplyst, og motivet skal vaere i farver. Spoerg hvad allergien gaelder, foer I vaelger pigment.",
    });
  }
  if (har("hudlidelse")) {
    ud.push({
      noegle: "hud",
      tekst: `Hudlidelse oplyst. Spoerg om den sidder paa ${v.placering || "det sted motivet skal sidde"}.`,
    });
  }
  if (har("andet") || v.helbred_note) {
    ud.push({
      noegle: "egne-ord",
      tekst: "Kunden har skrevet noget med sine egne ord. Laes det.",
    });
  }
  return ud;
}

/** Stoerrelsen sagt som et menneske ville sige den. */
export const STOERRELSE_ORD: Record<string, string> = {
  lille: "mindre end en haandflade",
  mellem: "mellem en haandflade og en underarm",
  stor: "stoerre end en underarm",
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

const HELBRED_ORD: Record<string, string> = {
  gravid: "gravid",
  blodfortyndende: "tager blodfortyndende medicin",
  allergi: "har en allergi",
  hudlidelse: "har en hudlidelse",
  andet: "har noteret noget andet",
};

const FARVE_ORD: Record<string, string> = { sort: "sort blæk", farve: "farver" };

/** Emnet til huset. Bærer aldrig et helbredsord — kun et neutralt mærke. */
export function husEmne(v: Samtykke): string {
  const m = modstrid(v);
  const hale = m.length ? "GENNEMGANG" : "ingen bemærkninger";
  return `Samtykke · ${v.navn} · ${v.aftale_dato} · ${hale}`;
}

/** Kundens eget emne. Siger intet om hendes krop. */
export function kundeEmne(v: Samtykke): string {
  return `Din samtykkeerklæring · Ink & Art · ${v.aftale_dato}`;
}

const linje = (n: string, v: string) => `  ${n.padEnd(12)}${v || "—"}`;

function oensket(v: Samtykke): string {
  return [
    "ØNSKET",
    linje("Motiv:", v.motiv),
    linje("Placering:", v.placering),
    linje("Størrelse:", STOERRELSE_ORD[v.stoerrelse] ?? v.stoerrelse),
    linje("Farve:", FARVE_ORD[v.farve] ?? v.farve),
  ].join("\n");
}

function kroppen(v: Samtykke): string {
  const kryds = v.helbred.length
    ? v.helbred.map((h) => `  · Kunden ${HELBRED_ORD[h] ?? h}`).join("\n")
    : "  · Kunden har ikke krydset noget af.";
  const egne = v.helbred_note ? `\n\n  Med egne ord:\n  «${v.helbred_note}»` : "";
  return `OPLYST OM KROPPEN\n${kryds}${egne}`;
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
  const m = modstrid(v);
  const top = m.length
    ? ["⚠ GENNEMGANG KRÆVES — tal med kunden før I går i gang", ...m.map((x) => `  · ${x.tekst}`)].join("\n")
    : "INGEN BEMÆRKNINGER — kunden har ikke oplyst noget der taler imod ønsket.";

  return [
    `SAMTYKKE — ${v.navn}`,
    `Aftale: ${v.aftale_dato}   ·   Artist: ${v.kunstner || "ikke oplyst"}`,
    "",
    top,
    "",
    oensket(v),
    "",
    kroppen(v),
    "",
    "KUNDEN",
    linje("Navn:", v.navn),
    linje("Født:", v.foedselsdato),
    linje("Mail:", v.email),
    linje("Telefon:", v.telefon),
    "",
    "ERKLÆRET AF KUNDEN",
    "  · Er fyldt 18 år",
    "  · Forstår at en tatovering er permanent",
    "  · Følger den aftercare hun får med",
    linje("Foto må bruges:", v.foto_ok ? "ja" : "nej"),
    "",
    `Udfyldt ${tidspunkt}`,
    "",
    "Dette brev er hele erklæringen. Der ligger ikke en kopi i noget",
    "andet system — hverken i Shopify eller i en database hos os.",
  ].join("\n");
}

/**
 * Kundens egen kopi. Hendes svar ordret — men UDEN husets vurdering.
 * Modstriden er noget vi laeser ud af hendes svar; den er ikke noget hun
 * har sagt, og den skal ikke laegges i munden paa hende.
 */
export function kundeBrev(v: Samtykke, tidspunkt: string): string {
  return [
    `Hej ${v.navn.split(" ")[0]}`,
    "",
    "Her er den erklæring du sendte til Ink & Art. Gem den — det er din",
    "egen kopi, og du skal ikke bede os om den.",
    "",
    `Aftale: ${v.aftale_dato}   ·   Artist: ${v.kunstner || "ikke oplyst"}`,
    "",
    oensket(v),
    "",
    kroppen(v),
    "",
    "DU ERKLÆREDE",
    "  · At du er fyldt 18 år",
    "  · At du forstår at en tatovering er permanent",
    "  · At du følger den aftercare du får med",
    linje("Foto må bruges:", v.foto_ok ? "ja" : "nej"),
    "",
    `Sendt ${tidspunkt}`,
    "",
    "Er noget forkert, så skriv til os — så retter vi det ved disken.",
  ].join("\n");
}
