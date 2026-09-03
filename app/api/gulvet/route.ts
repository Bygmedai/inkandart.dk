import { cookies } from "next/headers";
import { loadGulvet } from "@/lib/content";
import { rensFund, saetKlaret, skrivFund, skrivSvar } from "@/lib/gulvet";
import { VAGT_COOKIE, tokenErGyldigt } from "@/lib/vagt";

/**
 * /api/gulvet — det eneste sted holdet skriver til logbogen.
 *
 * DØREN ER DEN SAMME SOM SIDENS. Ruten læser husets vagt-cookie og afviser
 * alt uden den. Der er altså ingen vej til databasen der ikke går gennem
 * husets kode — også selvom nogen finder URL'en.
 *
 * IKKE EDGE. /api/vagt og /api/subscribe kører på edge, fordi de kun taler
 * med fetch. Denne rute læser content/gulvet.yml fra disken for at kende de
 * gyldige slags, og det kræver node-runtime.
 *
 * SVARET ER SMALT: { ok } og intet andet. En rute der fortæller hvorfor den
 * sagde nej, fortæller også en fremmed hvordan man kommer forbi.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const svar = (ok: boolean, status = ok ? 200 : 400) =>
  new Response(JSON.stringify({ ok }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

async function laast(): Promise<boolean> {
  const jar = await cookies();
  return !(await tokenErGyldigt(jar.get(VAGT_COOKIE)?.value));
}

/** Body-loft: en formular på en telefon fylder ikke 32 kB. */
async function krop(req: Request): Promise<Record<string, unknown> | null> {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > 32_768) return null;
  const b = await req.json().catch(() => null);
  return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
}

export async function POST(req: Request): Promise<Response> {
  if (await laast()) return svar(false, 401);
  const b = await krop(req);
  if (!b) return svar(false);

  const f = rensFund(
    { slag: b.slag, tekst: b.tekst, dato: b.dato, hvem: b.hvem, ind: b.ind, koebte: b.koebte, salg: b.salg },
    loadGulvet().slags,
  );
  if (!f) return svar(false);
  return svar(await skrivFund(f));
}

export async function PATCH(req: Request): Promise<Response> {
  if (await laast()) return svar(false, 401);
  const b = await krop(req);
  if (!b) return svar(false);

  const hvem = typeof b.hvem === "string" ? b.hvem : "";
  if (typeof b.opgave === "string") return svar(await saetKlaret(b.opgave, hvem));
  if (typeof b.id === "string" && typeof b.svar === "string") {
    return svar(await skrivSvar(b.id, b.svar, hvem));
  }
  return svar(false);
}
