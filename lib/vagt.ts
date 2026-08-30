/**
 * Adgangsvagt til husets interne sider (S574).
 *
 * Afstemningssiden viser kundemails. Den må ikke ligge åbent, og den må
 * ikke ligge bag noget vi kalder sikkerhed uden at det er det.
 *
 * Modellen: Sonja skriver husets kode én gang. Koden byttes til en
 * cookie der er SIGNERET med den samme hemmelighed og bærer sin egen
 * udløbstid. Cookien kan altså ikke laves uden hemmeligheden, og den
 * kan ikke regnes tilbage til koden. Ingen session-database, intet at
 * passe på.
 *
 * ÆRLIGT OM GRÆNSEN: der er ingen rate-limit på kode-forsøg. Edge-runtime
 * har ingen delt tilstand, så en tæller i hukommelsen ville være
 * sikkerhedsteater (samme begrundelse som i /api/subscribe). Derfor skal
 * koden være LANG — en sætning, ikke et ord. Skriv den i Vercel som
 * AFSTEMNING_KODE. Uden den er siden slukket, ikke åben.
 */

const COOKIE = "ia_vagt";
const TIMER = 12;

function hemmelighed(): string | null {
  const v = process.env.AFSTEMNING_KODE;
  return v && v.length >= 16 ? v : null;
}

async function signer(besked: string, nøgle: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(nøgle),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(besked));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Konstant tid — en sammenligning der stopper tidligt lækker længden. */
function ligMed(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function kodeErRigtig(kode: string): Promise<boolean> {
  const h = hemmelighed();
  if (!h) return false;
  // Sammenlign HASH mod HASH: så afhænger tiden ikke af hvor mange
  // tegn der var rigtige, uanset hvad længden er.
  const [a, b] = await Promise.all([signer(kode, h), signer(h, h)]);
  return ligMed(a, b);
}

export async function lavToken(nu = Date.now()): Promise<string | null> {
  const h = hemmelighed();
  if (!h) return null;
  const udløb = String(nu + TIMER * 3600_000);
  return `${udløb}.${await signer(udløb, h)}`;
}

export async function tokenErGyldigt(v: string | undefined, nu = Date.now()): Promise<boolean> {
  const h = hemmelighed();
  if (!h || !v) return false;
  const [udløb, sig] = v.split(".");
  if (!udløb || !sig || !/^\d+$/.test(udløb)) return false;
  if (Number(udløb) < nu) return false;
  return ligMed(sig, await signer(udløb, h));
}

export const VAGT_COOKIE = COOKIE;
export const VAGT_TIMER = TIMER;

/** Cookie-strengen. httpOnly + Secure + SameSite=Lax: JS kan ikke læse
 *  den, den følger ikke med på tværs af sites, og den udløber selv. */
export function cookieStreng(token: string): string {
  return [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${TIMER * 3600}`,
  ].join("; ");
}

export function cookieRyd(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
