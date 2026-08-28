/**
 * Read-only Shopify Storefront for Rummet M2 (Hylden + cart count).
 *
 * Secrets only via env. Missing token or domain → empty, never a throw.
 * edition_ref in YAML is a product handle, not a GID.
 */

const API_VERSION = "2026-07";

export type StorefrontProduct = {
  handle: string;
  variantGid: string;
  variantNumericId: string;
  priceAmount: string;
  currency: string;
};

export type StorefrontResult = {
  ok: boolean;
  products: StorefrontProduct[];
};

export type StorefrontCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
};

export type StorefrontConfig = {
  domain: string;
  token: string;
  ok: boolean;
};

export function storefrontConfig(): StorefrontConfig {
  const domain = (process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "").trim();
  const token = (process.env.SHOPIFY_STOREFRONT_TOKEN || "").trim();
  return { domain, token, ok: Boolean(domain && token) };
}

function endpoint(cfg: StorefrontConfig): string {
  return `https://${cfg.domain}/api/${API_VERSION}/graphql.json`;
}

async function storefrontQuery(
  query: string,
  variables: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const cfg = storefrontConfig();
  if (!cfg.ok) return null;
  try {
    const res = await fetch(endpoint(cfg), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": cfg.token,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const payload: unknown = await res.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    const p = payload as { errors?: unknown; data?: unknown };
    if (p.errors) return null;
    if (!p.data || typeof p.data !== "object") return null;
    return p.data as Record<string, unknown>;
  } catch {
    return null;
  }
}

function numericId(gid: string): string {
  const m = gid.match(/(\d+)\s*$/);
  return m ? m[1] : "";
}

function readProduct(raw: unknown): StorefrontProduct | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as {
    handle?: unknown;
    variants?: { nodes?: unknown };
  };
  const handle = typeof p.handle === "string" ? p.handle.trim() : "";
  if (!handle) return null;
  const nodes = Array.isArray(p.variants?.nodes) ? p.variants.nodes : [];
  const live =
    nodes.find((n) => {
      const v = n as { availableForSale?: unknown };
      return v && v.availableForSale === true;
    }) ?? nodes[0];
  if (!live || typeof live !== "object") return null;
  const v = live as {
    id?: unknown;
    price?: { amount?: unknown; currencyCode?: unknown };
  };
  const variantGid = typeof v.id === "string" ? v.id : "";
  if (!variantGid) return null;
  const priceAmount = typeof v.price?.amount === "string" ? v.price.amount : "";
  const currency = typeof v.price?.currencyCode === "string" ? v.price.currencyCode : "";
  return {
    handle,
    variantGid,
    variantNumericId: numericId(variantGid),
    priceAmount,
    currency,
  };
}

const PRODUCT_QUERY = `query Product($handle: String!) {
  product(handle: $handle) {
    handle
    variants(first: 10) {
      nodes {
        id
        availableForSale
        price { amount currencyCode }
      }
    }
  }
}`;

export async function productByHandle(handle: string): Promise<StorefrontProduct | null> {
  const h = handle.trim();
  if (!h) return null;
  if (!storefrontConfig().ok) return null;
  try {
    const data = await storefrontQuery(PRODUCT_QUERY, { handle: h });
    if (!data) return null;
    return readProduct(data.product);
  } catch {
    return null;
  }
}

export async function productsByHandles(handles: string[]): Promise<StorefrontResult> {
  try {
    const cfg = storefrontConfig();
    if (!cfg.ok) return { products: [], ok: false };
    const unique = [...new Set(handles.map((h) => h.trim()).filter(Boolean))];
    if (!unique.length) return { products: [], ok: true };
    const products: StorefrontProduct[] = [];
    for (const handle of unique) {
      const p = await productByHandle(handle);
      if (p) products.push(p);
    }
    return { products, ok: true };
  } catch {
    return { products: [], ok: false };
  }
}

function readCart(raw: unknown): StorefrontCart | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as { id?: unknown; checkoutUrl?: unknown; totalQuantity?: unknown };
  const id = typeof c.id === "string" ? c.id : "";
  const checkoutUrl = typeof c.checkoutUrl === "string" ? c.checkoutUrl : "";
  const totalQuantity = typeof c.totalQuantity === "number" ? c.totalQuantity : 0;
  if (!id) return null;
  return { id, checkoutUrl, totalQuantity: totalQuantity > 0 ? totalQuantity : 0 };
}

const CART_QUERY = `query Cart($id: ID!) {
  cart(id: $id) {
    id
    checkoutUrl
    totalQuantity
  }
}`;

export async function readCartById(cartId: string): Promise<StorefrontCart | null> {
  const id = cartId.trim();
  if (!id) return null;
  if (!storefrontConfig().ok) return null;
  try {
    const data = await storefrontQuery(CART_QUERY, { id });
    if (!data) return null;
    return readCart(data.cart);
  } catch {
    return null;
  }
}

export async function cartQuantity(cartId: string | undefined | null): Promise<number> {
  try {
    if (!cartId) return 0;
    const cart = await readCartById(cartId);
    return cart && cart.totalQuantity > 0 ? cart.totalQuantity : 0;
  } catch {
    return 0;
  }
}

const CART_CREATE = `mutation CartCreate($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) {
    cart { id checkoutUrl totalQuantity }
    userErrors { message }
  }
}`;

const CART_ADD = `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart { id checkoutUrl totalQuantity }
    userErrors { message }
  }
}`;

function noUserErrors(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const errs = (node as { userErrors?: unknown }).userErrors;
  return Array.isArray(errs) && errs.length === 0;
}

export async function addCartLine(
  cartId: string | null | undefined,
  variantGid: string,
): Promise<StorefrontCart | null> {
  const gid = variantGid.trim();
  if (!gid) return null;
  if (!storefrontConfig().ok) return null;
  const lines = [{ merchandiseId: gid, quantity: 1 }];
  try {
    if (cartId) {
      const added = await storefrontQuery(CART_ADD, { cartId, lines });
      const node = added?.cartLinesAdd;
      if (noUserErrors(node)) {
        const cart = readCart((node as { cart?: unknown }).cart);
        if (cart) return cart;
      }
    }
    const created = await storefrontQuery(CART_CREATE, { lines });
    const node = created?.cartCreate;
    if (!noUserErrors(node)) return null;
    return readCart((node as { cart?: unknown }).cart);
  } catch {
    return null;
  }
}
