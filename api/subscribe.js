/**
 * /api/subscribe — Vercel Edge Function.
 *
 * Newsletter signup for inkandart.dk. Creates (or no-ops on) a Shopify customer
 * with email marketing consent, so signups land where the studio already does
 * email — next to orders, gift cards and deposits. No third-party ESP, no data
 * to sync, no list to maintain by hand.
 *
 * Security / hardening:
 *   - Token is server-side only (env SHOPIFY_ADMIN_TOKEN, scope write_customers),
 *     never shipped to the browser.
 *   - Honeypot field ("company") → silently accept + drop bot submissions.
 *   - Email validated + length-capped before any upstream call.
 *   - Idempotent: an already-subscribed email returns ok (Shopify "taken").
 *
 * Config needed on Vercel (Project → Settings → Environment Variables):
 *   SHOPIFY_ADMIN_TOKEN   (required) Admin API access token, scope write_customers
 *   SHOPIFY_STORE         (optional) defaults to the myshopify domain below
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

  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) {
    console.error("subscribe: SHOPIFY_ADMIN_TOKEN not set");
    return json({ ok: false, error: "unconfigured" }, 500);
  }
  const store = process.env.SHOPIFY_STORE || DEFAULT_STORE;

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
