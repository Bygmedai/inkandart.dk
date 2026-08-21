#!/usr/bin/env node
/**
 * Gør Dolk / Ouroboros / Signetring klar som DRAFT. Publicerer aldrig.
 *
 *   node scripts/shopify-prepare-drafts.mjs           # dry-run
 *   node scripts/shopify-prepare-drafts.mjs --apply   # skriv copy + billeder, hold draft
 *
 * Credentials: SHOPIFY_ADMIN_TOKEN, eller SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET
 * (samme navne som /api/subscribe). Aldrig i repoet.
 *
 * Priser røres ikke. Piercing-varianterne røres ikke.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { SHOP_DRAFTS, PIERCE_DEAD } = await import(pathToFileURL(join(root, "lib/shop-drafts.ts")).href);

const APPLY = process.argv.includes("--apply");
const STORE = process.env.SHOPIFY_STORE?.trim() || "d1qp54-0w.myshopify.com";
const API = `https://${STORE}/admin/api/2024-10`;

function env(...names) {
  for (const n of names) if (process.env[n]) return process.env[n];
  return undefined;
}

async function token() {
  const staticToken = env("SHOPIFY_ADMIN_TOKEN", "Shopify_admin_token");
  if (staticToken) return staticToken;
  const clientId = env("SHOPIFY_CLIENT_ID", "Shopify_client_id");
  const clientSecret = env("SHOPIFY_CLIENT_SECRET", "Shopify_client_secret");
  if (!clientId || !clientSecret) {
    console.error("mangler SHOPIFY_ADMIN_TOKEN eller CLIENT_ID+SECRET");
    process.exit(2);
  }
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) {
    console.error("token-exchange", res.status, (await res.text()).slice(0, 300));
    process.exit(2);
  }
  const tok = await res.json();
  if (!tok?.access_token) {
    console.error("ingen access_token");
    process.exit(2);
  }
  return tok.access_token;
}

async function shopify(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": tokenOnce,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  if (!res.ok) {
    const err = new Error(`shopify ${method} ${path} ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

const tokenOnce = await token();

function variantIds(product) {
  return (product.variants ?? []).map((v) => String(v.id));
}

async function listDrafts() {
  const json = await shopify("/products.json?status=draft&limit=250");
  return json.products ?? [];
}

function findDraft(products, draft) {
  return products.find((p) => draft.match.test(p.title) || draft.match.test(p.body_html ?? ""));
}

console.log(APPLY ? "APPLY — skriver drafts, publicerer ikke" : "DRY-RUN — ingen skrivning");

const products = await listDrafts();
console.log("drafts i butikken:", products.length);

for (const p of products) {
  for (const id of variantIds(p)) {
    if (PIERCE_DEAD.includes(id)) {
      console.error("ABORT: piercing-variant i draft-listen", id, p.title);
      process.exit(3);
    }
  }
}

let missing = 0;
for (const draft of SHOP_DRAFTS) {
  const found = findDraft(products, draft);
  if (!found) {
    console.log("MANGLER", draft.title, "— ingen draft matchede", draft.match);
    missing += 1;
    continue;
  }
  const ids = variantIds(found);
  if (ids.some((id) => PIERCE_DEAD.includes(id))) {
    console.error("ABORT: ville røre piercing", found.title, ids);
    process.exit(3);
  }
  const price = found.variants?.[0]?.price;
  console.log(
    found.title,
    "id",
    found.id,
    "status",
    found.status,
    "pris",
    price,
    "placeholder",
    draft.pricePlaceholder,
  );

  if (!APPLY) continue;

  const plate = readFileSync(join(root, draft.plate));
  await shopify(`/products/${found.id}.json`, {
    method: "PUT",
    body: {
      product: {
        id: found.id,
        body_html: draft.bodyHtml,
        product_type: draft.type,
        status: "draft",
        published: false,
      },
    },
  });
  await shopify(`/products/${found.id}/images.json`, {
    method: "POST",
    body: {
      image: {
        attachment: plate.toString("base64"),
        filename: `${draft.key}.png`,
      },
    },
  });
  const check = await shopify(`/products/${found.id}.json`);
  if (check.product?.status !== "draft") {
    console.error("GATE BRUDT: status er", check.product?.status, "— forventede draft");
    process.exit(4);
  }
  console.log("skrevet som draft", draft.title);
}

if (missing) {
  console.log("dry-run/apply stoppede med", missing, "manglende drafts (opret dem i admin, kør igen)");
  if (APPLY) process.exit(1);
}
