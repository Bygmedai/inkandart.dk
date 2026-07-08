/**
 * /api/subscribe — Vercel Edge Function.
 *
 * Newsletter signup for inkandart.dk. Creates (or no-ops on) a Shopify customer
 * with email marketing consent, so signups land where the studio already does
 * email — next to orders, gift cards and deposits. No third-party ESP, no data
 * to sync, no list to maintain by hand.
 *
 * AUTH (2026): the store's app "Orbit signup" is a Dev Dashboard custom app.
 * Those apps do NOT expose a static Admin API token (shpat_) anymore. Instead we
 * hold the app's Client ID + Client secret and exchange them for a short-lived
 * (24h) access token via the client_credentials grant, then call the Admin API.
 * See shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens.
 *
 * Security / hardening:
 *   - Client ID/secret are server-side only, never shipped to the browser.
 *   - Access token is fetched on demand + cached in memory; never persisted.
 *   - Honeypot field ("company") → silently accept + drop bot submissions.
 *   - Email validated + length-capped before any upstream call.
 *   - Idempotent: an already-subscribed email returns ok (Shopify "taken").
 *
 * Config on Vercel (Project → Settings → Environment Variables), all envs:
 *   SHOPIFY_CLIENT_ID      (required) Dev Dashboard app Client ID
 *   SHOPIFY_CLIENT_SECRET  (required) Dev Dashboard app Client secret
 *   SHOPIFY_STORE          (optional) myshopify domain; defaults below
 * Legacy fallback: if SHOPIFY_ADMIN_TOKEN (a static shpat_ token) is set, it is
 * used directly and the exchange is skipped — so both models keep working.
 * Env names are read case-insensitively for the two Shopify credentials.
 */

export const config = { runtime: "edge" };

const DEFAULT_STORE = "d1qp54-0w.myshopify.com";
const API_VERSION = "2024-10";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server-side tag whitelist — client sends a `source`, never raw tags.
const TAGS_BY_SOURCE = {
  footer: ["newsletter", "site-signup"],
  "kinky-sundae": ["orbit", "event:kinky-sundae", "interesse:events"]
};

// Read an env var tolerant of casing (Vercel keys are case-sensitive; the
// dashboard was configured as Shopify_client_id / Shopify_client_secret).
function env(...names) {
  for (const n of names) {
    if (process.env[n]) return process.env[n];
  }
  return undefined;
}

function creds() {
  return {
    staticToken: env("SHOPIFY_ADMIN_TOKEN", "Shopify_admin_token"),
    clientId: env("SHOPIFY_CLIENT_ID", "Shopify_client_id", "SHOPIFY_CLIENTID"),
    clientSecret: env("SHOPIFY_CLIENT_SECRET", "Shopify_client_secret", "SHOPIFY_CLIENTSECRET")
  };
}

// In-memory token cache (survives while the Edge instance stays warm).
let cachedToken = null;
let cachedExp = 0; // epoch ms

async function getAccessToken(store) {
  const { staticToken, clientId, clientSecret } = creds();
  if (staticToken) return staticToken; // legacy path — no exchange needed
  if (!clientId || !clientSecret) return null;

  if (cachedToken && Date.now() < cachedExp - 60_000) return cachedToken;

  const res = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    })
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

export default async function handler(req) {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad_request" }, 400); }

  const email = String(body?.email || "").trim().toLowerCase();
  const honeypot = String(body?.company || "").trim();
  const source = String(body?.source || "footer");
  const tags = TAGS_BY_SOURCE[source] || TAGS_BY_SOURCE.footer;

  // Bot: honeypot filled → pretend success, do nothing.
  if (honeypot) return json({ ok: true });

  if (!email || email.length > 200 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 422);
  }

  const { staticToken, clientId, clientSecret } = creds();
  if (!staticToken && (!clientId || !clientSecret)) {
    console.error("subscribe: no Shopify credentials set (need SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET)");
    return json({ ok: false, error: "unconfigured" }, 500);
  }
  const store = process.env.SHOPIFY_STORE || process.env.Shopify_store || DEFAULT_STORE;

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
      tags
    }
  };

  let data;
  try {
    const res = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query, variables })
    });
    // A stale cached token would 401 — drop it so the next call re-exchanges.
    if (res.status === 401) { cachedToken = null; cachedExp = 0; }
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
    // Already a customer → already on the list. Treat as success (idempotent).
    if (errs.some((e) => /taken|already/i.test(e?.message || ""))) return json({ ok: true, already: true });
    console.error("subscribe: userErrors", JSON.stringify(errs));
    return json({ ok: false, error: "rejected" }, 422);
  }

  return json({ ok: true });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
