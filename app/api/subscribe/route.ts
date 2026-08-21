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
 */

export const runtime = "edge";

const DEFAULT_STORE = "d1qp54-0w.myshopify.com";
const API_VERSION = "2024-10";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TAGS_BY_SOURCE: Record<string, string[]> = {
  footer: ["newsletter", "site-signup"],
  emerge: ["newsletter", "site-signup", "emerge"],
  flash: ["newsletter", "site-signup", "blackbook", "flash-waitlist"],
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

  const res = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
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

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request): Promise<Response> {
  let body: { email?: unknown; company?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
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

  const query = `mutation newsletterSignup($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }`;
  const variables = {
    input: {
      email,
      emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
      tags,
    },
  };

  let data: {
    errors?: unknown;
    data?: { customerCreate?: { userErrors?: Array<{ field?: string[]; message?: string }> } };
  };
  try {
    const res = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query, variables }),
    });
    if (res.status === 401) {
      cachedToken = null;
      cachedExp = 0;
    }
    data = await res.json();
  } catch (err) {
    console.error("subscribe: shopify fetch failed", err);
    return json({ ok: false, error: "upstream" }, 502);
  }

  if (data?.errors) {
    console.error("subscribe: graphql errors", JSON.stringify(data.errors));
    return json({ ok: false, error: "upstream" }, 502);
  }

  const errs = data?.data?.customerCreate?.userErrors || [];
  if (errs.length) {
    if (errs.some((e) => /taken|already/i.test(e?.message || ""))) return json({ ok: true, already: true });
    console.error("subscribe: userErrors", JSON.stringify(errs));
    return json({ ok: false, error: "rejected" }, 422);
  }

  return json({ ok: true });
}
