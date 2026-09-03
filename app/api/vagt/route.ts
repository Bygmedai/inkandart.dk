import { cookieRyd, cookieStreng, kodeErRigtig, lavToken } from "@/lib/vagt";

export const runtime = "edge";

/**
 * Husets adgangsdør til afstemningen.
 *
 * Koden kommer som en almindelig formular-POST — aldrig i en URL, hvor
 * den ville stå i browserhistorik og serverlog. Er den rigtig, byttes
 * den til en signeret cookie og vi sender Sonja videre med 303.
 *
 * Svaret er DET SAMME uanset om koden var forkert eller om der slet
 * ikke er sat en kode i Vercel: ?fejl=1. En besked der skelner, fortæller
 * en fremmed om der overhovedet er noget at gætte på.
 *
 * RETURSTIEN ER HVIDLISTET. Døren bruges nu af to sider — afstemningen og
 * teamguiden på /personale — så den skal vide hvor den sender folk hen.
 * Den må kun kunne pege på husets egne sider: en fri retursti er en åben
 * viderestilling, og så kan en fremmed låne vores login-side til at sende
 * nogen et helt andet sted hen. Ukendt værdi → afstemningen.
 */
const RETUR: Record<string, string> = {
  afstemning: "/afstemning",
  personale: "/personale",
  "en/personale": "/en/personale",
  gulvet: "/gulvet",
};

function returSti(v: unknown): string {
  return RETUR[String(v ?? "")] ?? "/afstemning";
}
export async function POST(req: Request): Promise<Response> {
  const videre = (sti: string, cookie?: string) =>
    new Response(null, {
      status: 303,
      headers: {
        Location: new URL(sti, req.url).toString(),
        "Cache-Control": "no-store",
        ...(cookie ? { "Set-Cookie": cookie } : {}),
      },
    });

  const form = await req.formData().catch(() => null);
  if (!form) return videre("/afstemning?fejl=1");

  const hjem = returSti(form.get("retur"));

  if (String(form.get("handling") || "") === "ud") {
    return videre(hjem, cookieRyd());
  }

  const kode = String(form.get("kode") || "");
  if (!(await kodeErRigtig(kode))) return videre(`${hjem}?fejl=1`);

  const token = await lavToken();
  if (!token) return videre(`${hjem}?fejl=1`);
  return videre(hjem, cookieStreng(token));
}
