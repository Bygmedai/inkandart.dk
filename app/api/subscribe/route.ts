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
  customers(first: 5, query: $q) {
    edges { node { id defaultEmailAddress { emailAddress marketingState } } }
  }
}`;

const UPDATE_CONSENT = `mutation setConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
  customerEmailMarketingConsentUpdate(input: $input) {
    customer { id }
    userErrors { field message }
  }
}`;

/* ────────────────────────────────────────────────────────────────────────
 * Lukkede dekodere — én pr. operation.
 *
 * S568, Sirius' anden QA: shopGraphql() validerede kun konvolutten, saa
 * `{data:{}}` slap igennem som succes. Fejlen var ikke vaek, den var flyttet
 * ét objekt ned. En validator er foerst lukket naar den er lukket HELE vejen
 * ned til den vaerdi der udloeser succes.
 *
 * Reglerne her: `userErrors` skal FINDES som array (fravaer != nul fejl), og
 * en succes skal baere det id operationen lover. Alt andet kaster.
 * ──────────────────────────────────────────────────────────────────────── */

function op(data: Record<string, unknown>, name: string): Record<string, unknown> {
  const node = data?.[name];
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`shopify_missing_operation:${name}`);
  }
  return node as Record<string, unknown>;
}

/** Fravaer af userErrors er IKKE nul fejl — det er et ukendt svar. */
function userErrors(node: Record<string, unknown>, name: string): Array<{ message?: string }> {
  const errs = node.userErrors;
  if (!Array.isArray(errs)) throw new Error(`shopify_missing_userErrors:${name}`);
  return errs as Array<{ message?: string }>;
}

function customerId(node: Record<string, unknown>, name: string): string {
  const c = node.customer as { id?: unknown } | undefined;
  const id = typeof c?.id === "string" ? c.id.trim() : "";
  if (!id) throw new Error(`shopify_missing_customer_id:${name}`);
  return id;
}

/** Shopify-soegesyntaks: vaerdien skal i anfoerselstegn og escapes. */
function emailQuery(email: string): string {
  return `email:"${email.replace(/["\\]/g, "")}"`;
}

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
    const created = op(
      await shopGraphql(store, token, CREATE_CUSTOMER, {
        input: {
          email,
          emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
          tags,
        },
      }),
      "customerCreate",
    );

    const errs = userErrors(created, "customerCreate");

    if (!errs.length) {
      customerId(created, "customerCreate"); // succes uden id er ikke en succes
      return json({ ok: true });
    }

    // Der ER fejl. Om det betyder «findes allerede» afgoeres IKKE ved at
    // laese fejlteksten — `customerCreate.userErrors` er af typen UserError,
    // som slet ikke har et `code`-felt (verificeret mod skemaet S568). Vi
    // spoerger butikken i stedet: findes kunden med praecis denne email?
    return await resolveExisting(store, token, email, errs);
  } catch (err) {
    console.error("subscribe: upstream failed", err instanceof Error ? err.message : err);
    return json({ ok: false, error: "upstream" }, 502);
  }
}

/**
 * Afgoer en fejlet oprettelse ved opslag, ikke ved strengmatch.
 *
 * Findes kunden med PRAECIS denne email? Saa var fejlen en dublet, og
 * brugeren har netop bedt om at komme paa listen — saet consent hvis det
 * mangler. Findes hun ikke, var fejlen en aegte afvisning.
 *
 * Den praecise sammenligning er ikke pedanteri: `customers(query:)` er en
 * SOEGNING. Uden den kunne vi saette en HELT ANDEN persons marketing-consent
 * paa et delvist traef. (Sirius, S568.)
 */
async function resolveExisting(
  store: string,
  token: string,
  email: string,
  createErrors: Array<{ message?: string }>,
): Promise<Response> {
  const found = op(await shopGraphql(store, token, FIND_CUSTOMER, { q: emailQuery(email) }), "customers");
  const edges = found.edges;
  if (!Array.isArray(edges)) throw new Error("shopify_missing_edges:customers");

  const exact = (edges as Array<{ node?: { id?: string; defaultEmailAddress?: { emailAddress?: string; marketingState?: string } } }>)
    .map((e) => e?.node)
    .filter((n) => typeof n?.id === "string" && n?.defaultEmailAddress?.emailAddress?.toLowerCase() === email);

  if (exact.length === 0) {
    // Ingen kunde med den email — saa var oprettelsesfejlen aegte.
    console.error("subscribe: userErrors", JSON.stringify(createErrors));
    return json({ ok: false, error: "rejected" }, 422);
  }
  if (exact.length > 1) {
    throw new Error("shopify_ambiguous_customer");
  }

  const node = exact[0]!;
  if (node.defaultEmailAddress?.marketingState === "SUBSCRIBED") {
    return json({ ok: true, already: true, subscribed: true });
  }

  const updated = op(
    await shopGraphql(store, token, UPDATE_CONSENT, {
      input: {
        customerId: node.id,
        emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
      },
    }),
    "customerEmailMarketingConsentUpdate",
  );
  const uerrs = userErrors(updated, "customerEmailMarketingConsentUpdate");
  if (uerrs.length) {
    console.error("subscribe: consent update failed", JSON.stringify(uerrs));
    return json({ ok: false, error: "rejected" }, 422);
  }
  customerId(updated, "customerEmailMarketingConsentUpdate"); // ellers ved vi ikke at den skrev
  return json({ ok: true, already: true, subscribed: true });
}
