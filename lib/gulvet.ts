/**
 * Gulvet — husets logbog fra butiksgulvet (S579).
 *
 * HVORFOR EN DATABASE OG IKKE BROWSEREN. Tjeklisterne i teamguiden bor med
 * vilje i den enkeltes telefon: det er den enkeltes vagt. Det her er det
 * modsatte. Sonja tæller hvor mange der kommer ind ad døren, og det tal har
 * huset aldrig haft — «80-160 om måneden» var et gæt. Et tal ingen kan læse
 * bagefter er ikke en måling.
 *
 * HVORFOR IKKE EN ARTEFAKT-DATABASE. Første udgave lå hos Claude. Den kunne
 * kun skrives af nogen med en Claude-konto, og Steven kunne ikke selv åbne
 * den og kigge. Det er præcis den usynlige butik han lukkede ned i S550:
 * kanon skal ligge et sted han selv kan holde styr på.
 *
 * HVORFOR RÅ FETCH OG IKKE @supabase/supabase-js. Samme grund som i
 * lib/depositum.ts mod Shopify: et REST-kald er tolv linjer, og en
 * afhængighed er for evigt. Repoet har ni dependencies. Det bliver ved ni.
 *
 * SIKKERHED. Tabellerne har RLS slået til UDEN politikker — så hverken anon
 * eller authenticated kan røre dem. Kun service_role kommer igennem, og den
 * nøgle bor server-side i GULVET_SUPABASE_KEY. Den når aldrig browseren:
 * alt går gennem /api/gulvet, som selv er låst bag husets kode.
 *
 * Uden env er modulet SLUKKET, ikke åbent — samme valg som lib/vagt.ts.
 */

const TABEL_FUND = "gulvet_fund";
const TABEL_FREMDRIFT = "gulvet_fremdrift";
const TIMEOUT_MS = 8_000;

import type { Fremdrift, Fund } from "./gulvet-typer";

export type { Fremdrift, Fund };

/** Et nyt fund, som det kommer ind fra formularen — før validering. */
export type NytFund = {
  slag: unknown;
  tekst: unknown;
  dato: unknown;
  hvem: unknown;
  ind?: unknown;
  koebte?: unknown;
  salg?: unknown;
};

function opsaetning(): { url: string; key: string } | null {
  const url = process.env.GULVET_SUPABASE_URL;
  const key = process.env.GULVET_SUPABASE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

export function gulvetErSat(): boolean {
  return opsaetning() !== null;
}

async function kald(sti: string, init: RequestInit): Promise<Response | null> {
  const o = opsaetning();
  if (!o) return null;
  const ctrl = new AbortController();
  const ur = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${o.url}/rest/v1/${sti}`, {
      ...init,
      signal: ctrl.signal,
      cache: "no-store",
      headers: {
        apikey: o.key,
        Authorization: `Bearer ${o.key}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(ur);
  }
}

/* ---------------------------------------------------------------- læsning */

/**
 * Siden må aldrig gå i stykker fordi databasen har en dårlig dag. Et
 * fejlet opslag giver en tom liste, og fladen siger det højt. Det er
 * forskellen på en side der er tom og en side der er væk.
 */
export async function hentFund(graense = 40): Promise<Fund[]> {
  const n = Math.min(Math.max(Math.trunc(graense) || 40, 1), 200);
  const r = await kald(
    `${TABEL_FUND}?select=*&order=oprettet.desc&limit=${n}`,
    { method: "GET" },
  );
  if (!r?.ok) return [];
  const data = await r.json().catch(() => null);
  return Array.isArray(data) ? (data as Fund[]) : [];
}

export async function hentFremdrift(): Promise<Record<string, boolean>> {
  const r = await kald(`${TABEL_FREMDRIFT}?select=opgave,klaret&limit=200`, { method: "GET" });
  if (!r?.ok) return {};
  const data = await r.json().catch(() => null);
  if (!Array.isArray(data)) return {};
  const ud: Record<string, boolean> = {};
  for (const r2 of data as Fremdrift[]) if (r2?.opgave && r2.klaret) ud[r2.opgave] = true;
  return ud;
}

/* -------------------------------------------------------------- validering
 *
 * Ruten er låst bag husets kode, så det her er ikke et værn mod fremmede.
 * Det er et værn mod en klient der sender noget uventet, og mod at en
 * check-constraint i Postgres bliver til en 500 hos Sonja. Databasen har de
 * samme grænser; her fanges de bare pænt.
 */

const MAX_TEKST = 4_000;
const MAX_NAVN = 80;
const MAX_SLAG = 40;

function tekst(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Et tal, eller null. Aldrig NaN, aldrig negativt, aldrig absurd. */
export function heltal(v: unknown, loft: number): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 0 || i > loft) return null;
  return i;
}

const DATO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function rensFund(raa: NytFund, kendteSlags: string[]): Omit<Fund, "id" | "oprettet"> | null {
  const slag = tekst(raa.slag, MAX_SLAG);
  const t = tekst(raa.tekst, MAX_TEKST);
  const dato = tekst(raa.dato, 10);
  if (!t) return null;
  if (!DATO_RE.test(dato) || Number.isNaN(Date.parse(dato))) return null;
  // Ukendt slag er ikke en fejl — listen ændrer sig i gulvet.yml. Men den
  // må ikke kunne bruges til at smugle noget vilkårligt langt ind.
  const s = kendteSlags.includes(slag) ? slag : slag || "Andet";
  return {
    slag: s,
    tekst: t,
    dato,
    hvem: tekst(raa.hvem, MAX_NAVN) || "Holdet",
    ind: heltal(raa.ind, 100_000),
    koebte: heltal(raa.koebte, 100_000),
    salg: heltal(raa.salg, 10_000_000),
    spoergsmaal: s === "Spørgsmål",
    svar: null,
    svar_af: null,
  };
}

/* ---------------------------------------------------------------- skrivning */

export async function skrivFund(f: Omit<Fund, "id" | "oprettet">): Promise<boolean> {
  const r = await kald(TABEL_FUND, { method: "POST", body: JSON.stringify(f) });
  return Boolean(r?.ok);
}

export async function skrivSvar(id: string, svar: string, af: string): Promise<boolean> {
  // Kun uuid — ellers kan et id blive til en filterstreng i PostgREST.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  const s = tekst(svar, MAX_TEKST);
  if (!s) return false;
  const r = await kald(`${TABEL_FUND}?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ svar: s, svar_af: tekst(af, MAX_NAVN) || "Holdet" }),
  });
  return Boolean(r?.ok);
}

const OPGAVE_RE = /^o[0-9]{1,3}$/;

export async function saetKlaret(opgave: string, af: string): Promise<boolean> {
  if (!OPGAVE_RE.test(opgave)) return false;
  const r = await kald(TABEL_FREMDRIFT, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ opgave, klaret: true, af: tekst(af, MAX_NAVN) || "Holdet" }),
  });
  return Boolean(r?.ok);
}
