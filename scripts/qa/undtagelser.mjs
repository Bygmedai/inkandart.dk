/**
 * Undtagelser i QA-vagten for fejl der ikke er vores — snævre og med udløb.
 *
 * ── Book.dk ob-therapy-groups (Haruki via Steven, 28/9 2026) ──────────────
 * Book.dk's bookingside henter assets/js/ob-therapy-groups.js og
 * assets/css/ob-therapy-groups.css, og begge svarer 404. Det er
 * platformsdækkende: samme 404 på allanfrisor, arik, herrefrisoren og
 * leanderhairstudio.book.dk den 28/9, og filerne findes heller ikke på
 * app.book.dk. Kunden mærker intet — bookingen virker hele vejen til
 * kalenderen. Book.dk har fået en fejlmelding.
 *
 * En vagt der står rød på noget ingen af os kan rette, lærer alle at overse
 * rødt. Derfor undtages præcis de tre beskeder Chromium giver for de to
 * filer — og intet andet:
 *
 *   Failed to load resource: the server responded with a status of 404 …
 *     → URL'en står KUN i location().url (samme fælde som /_vercel/insights)
 *   Refused to apply style from '<url>' …
 *   Refused to execute script from '<url>' …
 *     → URL'en står i teksten; location().url er bookingsiden selv
 *
 * Enhver anden besked fra inkart.book.dk — en anden fil, en anden status,
 * en anden fejl fra samme fil — er stadig et fund.
 *
 * UDLØB: efter BOOKDK_UDLOEB virker undtagelsen ikke længere, og fundene
 * bliver røde igen. Så skal nogen tage stilling: er Book.dk's fejl rettet,
 * slettes undtagelsen; er den ikke, forlænges den med en ny dato og en
 * grund. Den forlænges ikke i stilhed.
 */

export const BOOKDK_UDLOEB = "2026-10-12";

const BOOKDK_HOST = "inkart.book.dk";
const BOOKDK_FILER = new Set([
  "/assets/js/ob-therapy-groups.js",
  "/assets/css/ob-therapy-groups.css",
]);

function erBookdkFil(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  return u.protocol === "https:" && u.hostname === BOOKDK_HOST && BOOKDK_FILER.has(u.pathname);
}

/** Gælder undtagelsen stadig på dagen `nu`? Til og med udløbsdatoen (UTC). */
export function bookdkAktiv(nu = new Date()) {
  return nu.toISOString().slice(0, 10) <= BOOKDK_UDLOEB;
}

/**
 * Er denne console.error Book.dk's kendte ob-therapy-groups-404?
 * `tekst` er msg.text(), `url` er msg.location().url.
 */
export function erBookdkUndtaget(tekst, url, nu = new Date()) {
  if (!bookdkAktiv(nu)) return false;
  if (/^Failed to load resource: the server responded with a status of 404\b/.test(tekst)) {
    return erBookdkFil(url);
  }
  const m = /^Refused to (?:apply style|execute script) from '([^']+)'/.exec(tekst);
  if (m) {
    return erBookdkFil(m[1]) && erBookdkSide(url);
  }
  return false;
}

/** Beskeden skal også komme fra Book.dk's egen side, ikke fra os. */
function erBookdkSide(url) {
  try {
    return new URL(url).hostname === BOOKDK_HOST;
  } catch {
    return false;
  }
}

/** Linjen i rapporten. Undtagne beskeder forsvinder aldrig i stilhed. */
export function bookdkNote(antal, nu = new Date()) {
  const dato = `${BOOKDK_UDLOEB.slice(8, 10).replace(/^0/, "")}/${BOOKDK_UDLOEB.slice(5, 7).replace(/^0/, "")}`;
  if (!bookdkAktiv(nu)) {
    return `Book.dk ob-therapy-groups-undtagelsen udløb ${dato}. Fundene tæller igen — tag stilling i scripts/qa/undtagelser.mjs.`;
  }
  if (antal === 0) {
    return `Book.dk ob-therapy-groups 404 undtaget: 0 (udløber ${dato}). Book.dk ser ud til at have rettet fejlen — undtagelsen kan fjernes fra scripts/qa/undtagelser.mjs.`;
  }
  return `Book.dk ob-therapy-groups 404 undtaget: ${antal} (udløber ${dato}).`;
}
