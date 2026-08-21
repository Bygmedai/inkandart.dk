/**
 * /api/subscribe — Blackbook/newsletter signup (portering af det gamle
 * Vercel Edge-endpoint, Haruki-review S566 F2: leadlisten må ikke dø ved
 * Emerge-cutoveret; Steven valgte portering 20/8).
 *
 * Opretter (eller no-op'er på) en Shopify-kunde med email-marketing-consent,
 * så signups lander hvor studiet allerede har email — ved siden af ordrer,
 * gavekort og depositum. Ingen tredjeparts-ESP.
 *
 * AUTH (2026): Dev Dashboard custom apps eksponerer ikke statiske shpat_-
 * tokens; vi holder Client ID + secret og veksler til et kortlivet (24h)
 * access token via client_credentials, cachet i memory. Legacy fallback:
 * er SHOPIFY_ADMIN_TOKEN sat, bruges det direkte.
 *
 * Hærdning (uændret fra originalen):
 *  - Credentials er server-only; når aldrig browseren.
 *  - Honeypot ("company") → lad-som-om-succes, drop bots stille.
 *  - Email valideret + længde-cappet før noget upstream-kald.
 *  - Idempotent: allerede-tilmeldt email → ok ("taken").
 *  - Server-side tag-whitelist — klienten sender `source`, aldrig rå tags.
 *
 * S568 (Sirius QA): endpointet var FAIL-OPEN. HTTP-status blev aldrig set
 * efter, og et uventet svar som `{}` faldt igennem til `{ok:true}` — kunden
 * fik «Du er i bogen» mens intet blev skrevet. Nu: res.ok, lukket
 * svar-validator, timeout på begge upstream-kald, body-loft, og en
 * allerede-kunde får rent faktisk sat sit marketing-consent.
 *
 * IKKE løst her, og bevidst ikke foregivet: rate-limit. Edge-runtime har
 * ingen delt tilstand, så en in-memory tæller ville være sikkerhedsteater.
 * Rigtig rate-limit kræver KV/Upstash — det er en beslutning med en pris,
 * ikke en kodelinje. Se #151.
 */

export const runtime = "edge";

const DEFAULT_STORE = "d1qp54-0w.myshopify.com";
const API_VERSION = "2026-07";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPSTREAM_TIMEOUT_MS = 8_000;
const MAX_BODY_BYTES = 4_096;

const TAGS_BY_SOURCE: Record<string, string[]> = {
  footer: ["newsletter", "site-signup"],
  emerge: ["newsletter", "site-signup", "emerge"],
  flash: ["newsletter", "site-signup", "blackbook", "flash-waitlist"],
  blackbook: ["newsletter", "site-signup", "blackbook"],
};

function env(...names: string[]): string | undefined {
  for (const n of names) {
    if (process.env[n]) return process.env[n];
  }
  return undefined;
}

function creds() {
  return {
    staticToken: env("SHOPIFY_ADMIN_TOKEN", "Shopify_admin_token"),
    clientId: env("SHOPIFY_CLIENT_ID", "Shopify_client_id", "SHOPIFY_CLIENTID"),
    clientSecret: env("SHOPIFY_CLIENT_SECRET", "Shopify_client_secret", "SHOPIFY_CLIENTSECRET"),
  };
}

let cachedToken: string | null = null;
let cachedExp = 0;

async function getAccessToken(store: string): Promise<string | null> {
  const { staticToken, clientId, clientSecret } = creds();
  if (staticToken) return staticToken;
  if (!clientId || !clientSecret) return null;
  if (cachedToken && Date.now() < cachedExp - 60_000) return cachedToken;

  let res: Response;
  try {
    res = await fetch(`https://${store}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("subscribe: token exchange timed out or failed", err);
    return null;
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("subscribe: token exchange failed", res.status, detail.slice(0, 300));
    return null;
  }
  const tok = await res.json();
  if (!tok?.access_token) {
    console.error("subscribe: token exchange returned no access_token");
    return null;
  }
  cachedToken = tok.access_token;
  cachedExp = Date.now() + (Number(tok.expires_in) || 86399) * 1000;
  return cachedToken;
}

/**
 * Fail-CLOSED kald mod Shopify Admin GraphQL.
 *
 * Kaster ved: timeout, netvaerksfejl, ikke-2xx, ikke-JSON, manglende
 * `data`-objekt, eller `errors` i svaret. Kun en veldefineret succes
 * kommer retur. Det er hele forskellen fra S566-versionen, hvor `{}`
 * blev til `{ok:true}`.
 */
async function shopGraphql(
  store: string,
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (res.status === 401) {
    cachedToken = null;
    cachedExp = 0;
  }
  if (!res.ok) {
    throw new Error(`shopify_http_${res.status}`);
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new Error("shopify_not_json");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("shopify_bad_shape");
  }
  const p = payload as { errors?: unknown; data?: unknown };
  if (p.errors) {
    throw new Error(`shopify_graphql_errors:${JSON.stringify(p.errors).slice(0, 300)}`);
  }
  if (!p.data || typeof p.data !== "object") {
    throw new Error("shopify_no_data");
  }
  return p.data as Record<string, unknown>;
}

const CREATE_CUSTOMER = `mutation newsletterSignup($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer { id }
    userErrors { field message }
  }
}`;

const FIND_CUSTOMER = `query findCustomer($q: String!) {
  customers(first: 1, query: $q) {
    edges { node { id defaultEmailAddress { marketingState } } }
  }
}`;

const UPDATE_CONSENT = `mutation setConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
  customerEmailMarketingConsentUpdate(input: $input) {
    customer { id }
    userErrors { field message }
  }
}`;

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request): Promise<Response> {
  // Body-loft foer parsing: et uendeligt payload skal ikke naa JSON.parse.
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "too_large" }, 413);
  }

  let body: { email?: unknown; company?: unknown; source?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const honeypot = String(body?.company || "").trim();
  const source = String(body?.source || "footer");
  const tags = TAGS_BY_SOURCE[source] || TAGS_BY_SOURCE.footer;

  if (honeypot) return json({ ok: true });

  if (!email || email.length > 200 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 422);
  }

  const { staticToken, clientId, clientSecret } = creds();
  if (!staticToken && (!clientId || !clientSecret)) {
    console.error("subscribe: no Shopify credentials set (need SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET)");
    return json({ ok: false, error: "unconfigured" }, 500);
  }
  const store = env("SHOPIFY_STORE", "Shopify_store") || DEFAULT_STORE;

  const token = await getAccessToken(store);
  if (!token) return json({ ok: false, error: "unconfigured" }, 500);

  try {
    const created = await shopGraphql(store, token, CREATE_CUSTOMER, {
      input: {
        email,
        emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
        tags,
      },
    });

    const errs =
      (created?.customerCreate as { userErrors?: Array<{ message?: string }> } | undefined)?.userErrors || [];

    if (!errs.length) return json({ ok: true });

    // Findes kunden allerede? Saa er "taken" ikke en fejl — men den er
    // heller ikke en tilmelding foer vi har set consent-tilstanden efter.
    if (errs.some((e) => /taken|already/i.test(e?.message || ""))) {
      return await ensureSubscribed(store, token, email);
    }

    console.error("subscribe: userErrors", JSON.stringify(errs));
    return json({ ok: false, error: "rejected" }, 422);
  } catch (err) {
    console.error("subscribe: upstream failed", err instanceof Error ? err.message : err);
    return json({ ok: false, error: "upstream" }, 502);
  }
}

/**
 * En allerede eksisterende kunde har ikke noedvendigvis sagt ja til
 * markedsfoering. S566-versionen svarede `{ok:true, already:true}` uden at
 * se efter — UI'et sagde «Du er i bogen» til nogen der ikke var i den.
 * Her laeser vi consent-tilstanden og saetter den hvis den mangler; det er
 * praecis det brugeren netop har bedt om ved at sende formularen.
 */
async function ensureSubscribed(store: string, token: string, email: string): Promise<Response> {
  const found = await shopGraphql(store, token, FIND_CUSTOMER, { q: `email:${email}` });
  const node = (
    found?.customers as
      | { edges?: Array<{ node?: { id?: string; defaultEmailAddress?: { marketingState?: string } } }> }
      | undefined
  )?.edges?.[0]?.node;

  if (!node?.id) {
    // Shopify sagde "taken", men vi kan ikke finde kunden. Det er en
    // modsigelse, ikke en succes.
    throw new Error("shopify_taken_but_not_found");
  }

  if (node.defaultEmailAddress?.marketingState === "SUBSCRIBED") {
    return json({ ok: true, already: true, subscribed: true });
  }

  const updated = await shopGraphql(store, token, UPDATE_CONSENT, {
    input: {
      customerId: node.id,
      emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
    },
  });
  const uerrs =
    (updated?.customerEmailMarketingConsentUpdate as { userErrors?: Array<{ message?: string }> } | undefined)
      ?.userErrors || [];
  if (uerrs.length) {
    console.error("subscribe: consent update failed", JSON.stringify(uerrs));
    return json({ ok: false, error: "rejected" }, 422);
  }
  return json({ ok: true, already: true, subscribed: true });
}
