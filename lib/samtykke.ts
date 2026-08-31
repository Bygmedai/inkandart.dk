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

export type Samtykke = {
  navn: string;
  foedselsdato: string;
  email: string;
  telefon: string;
  kunstner: string;
  placering: string;
  motiv: string;
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

  const placering = s(d.placering);
  if (!placering) fejl.push({ felt: "placering", grund: "mangler" });

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
      email,
      telefon: s(d.telefon),
      kunstner: s(d.kunstner),
      placering,
      motiv,
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
 * Taggene huset ser paa kunden i Shopify. Whitelist, som /api/subscribe:
 * klienten sender aldrig raa tags.
 */
export function tags(v: Samtykke): string[] {
  const ud = ["samtykke"];
  if (v.foto_ok) ud.push("foto-ok");
  if (v.helbred.length) ud.push("samtykke-helbred");
  return ud;
}
