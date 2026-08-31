/**
 * /api/samtykke — kundens samtykkeerklaering, udfyldt foer besoeget.
 *
 * Simones ide, hans felter (Fra Simone, 31/8). Én ting er lavet om: hans
 * version gemte i browserens localStorage, saa et skema udfyldt hjemme paa
 * kundens telefon blev liggende PAA kundens telefon. Butikken saa det
 * aldrig, og formularen kunne derfor ikke goere det den findes for.
 *
 * Den skriver til Shopify-kunden, ikke til et nyt system. Huset har
 * Shopify, Sonja er der hver dag, og /api/subscribe gaar allerede samme
 * vej — én kundeliste, ét sted at slaa op ved stolen. Ingen ny database,
 * ingen ny adgangskode, ingen ny flade at vedligeholde.
 *
 * Haerdning, laert af /api/subscribe (S568-review):
 *  - FAIL-CLOSED. res.ok tjekkes; et uventet svar er en fejl, ikke et ja.
 *  - Honeypot ("company") → lad-som-om-succes, drop bots stille.
 *  - Body-loft foer noget parses.
 *  - Timeout paa alle upstream-kald.
 *  - Credentials er server-only og naar aldrig browseren.
 *  - Server-side tag-whitelist; klienten sender aldrig raa tags.
 *
 * IKKE loest, og bevidst ikke foregivet: rate-limit. Edge-runtime har
 * ingen delt tilstand, saa en in-memory taeller ville vaere teater. Samme
 * situation som /api/subscribe — se #151.
 *
 * Token-vekslingen er en lille kopi af den i /api/subscribe. Bevidst: den
 * rute er haerdet og virker, og en udtraekning kl. 3 om natten er en
 * refaktorering af noget der ikke fejler. Skal de samles, saa gaa den vej
 * med begge tests i haanden.
 */
import { valider, tags } from "@/lib/samtykke";

export const runtime = "edge";

const DEFAULT_STORE = "d1qp54-0w.myshopify.com";
const API_VERSION = "2026-07";
const UPSTREAM_TIMEOUT_MS = 8_000;
const MAX_BODY_BYTES = 8_192;

function env(...names: string[]): string | undefined {
  for (const n of names) if (process.env[n]) return process.env[n];
  return undefined;
}

let cachedToken: string | null = null;
let cachedExp = 0;

async function getAccessToken(store: string): Promise<string | null> {
  const staticToken = env("SHOPIFY_ADMIN_TOKEN", "Shopify_admin_token");
  if (staticToken) return staticToken;
  const clientId = env("SHOPIFY_CLIENT_ID", "Shopify_client_id", "SHOPIFY_CLIENTID");
  const clientSecret = env("SHOPIFY_CLIENT_SECRET", "Shopify_client_secret", "SHOPIFY_CLIENTSECRET");
  if (!clientId || !clientSecret) return null;
  if (cachedToken && Date.now() < cachedExp - 60_000) return cachedToken;
  try {
    const res = await fetch(`https://${store}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("samtykke: token exchange failed", res.status);
      return null;
    }
    const tok = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!tok.access_token) return null;
    cachedToken = tok.access_token;
    cachedExp = Date.now() + (tok.expires_in ?? 86_400) * 1_000;
    return cachedToken;
  } catch (err) {
    console.error("samtykke: token exchange threw", err);
    return null;
  }
}

const MUTATION = `mutation upsert($input: CustomerInput!) {
  customerCreate(input: $input) { customer { id } userErrors { field message } }
}`;

const svar = (status: number, krop: Record<string, unknown>) =>
  new Response(JSON.stringify(krop), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export async function POST(req: Request): Promise<Response> {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return svar(413, { ok: false });

  let d: Record<string, unknown>;
  try {
    d = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return svar(400, { ok: false });
  }

  // Honeypot: bots faar et ja de ikke kan bruge til noget.
  if (typeof d.company === "string" && d.company.trim() !== "") {
    return svar(200, { ok: true });
  }

  const v = valider(d);
  if (!v.ok) return svar(422, { ok: false, fejl: v.fejl });

  const store = env("SHOPIFY_STORE_DOMAIN") ?? DEFAULT_STORE;
  const token = await getAccessToken(store);
  if (!token) {
    console.error("samtykke: ingen adgang til Shopify — erklaeringen blev IKKE gemt");
    return svar(502, { ok: false });
  }

  const s = v.vaerdi;
  const input = {
    email: s.email,
    firstName: s.navn.split(" ")[0],
    lastName: s.navn.split(" ").slice(1).join(" ") || undefined,
    phone: s.telefon || undefined,
    tags: tags(s),
    note: [
      `Samtykke ${new Date().toISOString().slice(0, 10)}`,
      `Placering: ${s.placering}`,
      `Motiv: ${s.motiv}`,
      s.kunstner ? `Kunstner: ${s.kunstner}` : "",
      s.helbred.length ? `Helbred: ${s.helbred.join(", ")}` : "",
      s.helbred_note ? `Note: ${s.helbred_note}` : "",
      `Foto: ${s.foto_ok ? "ja" : "nej"}`,
    ]
      .filter(Boolean)
      .join("\n"),
    metafields: [
      {
        namespace: "samtykke",
        key: "erklaering",
        type: "json",
        value: JSON.stringify({ ...s, tidspunkt: new Date().toISOString() }),
      },
    ],
  };

  let res: Response;
  try {
    res = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query: MUTATION, variables: { input } }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("samtykke: Shopify timeout", err);
    return svar(502, { ok: false });
  }
  if (!res.ok) {
    console.error("samtykke: Shopify svarede", res.status);
    return svar(502, { ok: false });
  }

  const ud = (await res.json().catch(() => null)) as {
    data?: { customerCreate?: { customer?: { id?: string }; userErrors?: unknown[] } };
  } | null;
  const skabt = ud?.data?.customerCreate;
  const fejl = skabt?.userErrors ?? [];

  // Findes kunden i forvejen, er "taken" ikke en fejl — men alt andet er.
  const kendt = JSON.stringify(fejl).includes("taken");
  if (!skabt?.customer?.id && !kendt) {
    console.error("samtykke: uventet svar fra Shopify", JSON.stringify(fejl).slice(0, 300));
    return svar(502, { ok: false });
  }

  return svar(200, { ok: true });
}
