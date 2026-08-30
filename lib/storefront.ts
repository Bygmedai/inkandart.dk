/**
 * Read-only Shopify Storefront for Rummet M2 (Hylden + cart count).
 *
 * Secrets only via env. Missing token or domain → empty, never a throw.
 * edition_ref in YAML is a product handle, not a GID.
 *
 * Hylden (S574) læser kollektionen `hylden` via productsInCollection.
 * collectionByHandle er deprecated i 2026-07 — feltet er collection(handle:).
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

/**
 * Vare fra en Storefront-kollektion. VareKort læser kun StorefrontProduct-
 * felterne; titel/foto/gruppe mappes til Vare på siden.
 */
export type CollectionProduct = StorefrontProduct & {
  title: string;
  availableForSale: boolean;
  imageUrl: string;
  imageAlt: string;
  productType: string;
};

export type CollectionResult = {
  ok: boolean;
  products: CollectionProduct[];
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

/**
 * Husets butiksdomæne. Ikke en hemmelighed — det står allerede i
 * lib/commerce.ts og i hver cart-permalink vi sender kunden hen på.
 * Fallbacken findes, fordi en manglende NEXT_PUBLIC_SHOPIFY_DOMAIN
 * ellers tømmer Hylden tavst, selv når token er sat.
 */
const DEFAULT_DOMAIN = "d1qp54-0w.myshopify.com";

export function storefrontConfig(): StorefrontConfig {
  const domain = (process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "").trim() || DEFAULT_DOMAIN;
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

function asObject(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function strField(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function variantNodes(raw: unknown): unknown[] {
  const obj = asObject(raw);
  if (!obj) return [];
  const variants = asObject(obj.variants);
  if (!variants) return [];
  return Array.isArray(variants.nodes) ? variants.nodes : [];
}

function firstAvailableVariant(nodes: unknown[]): {
  id: string;
  priceAmount: string;
  currency: string;
} | null {
  for (const node of nodes) {
    const v = asObject(node);
    if (!v || v.availableForSale !== true) continue;
    const id = strField(v.id);
    if (!id) continue;
    const price = asObject(v.price);
    return {
      id,
      priceAmount: strField(price?.amount),
      currency: strField(price?.currencyCode),
    };
  }
  return null;
}

function readImage(raw: Record<string, unknown>): { url: string; alt: string } {
  const feat = asObject(raw.featuredImage);
  const featUrl = strField(feat?.url);
  if (featUrl) return { url: featUrl, alt: strField(feat?.altText) };
  const images = asObject(raw.images);
  const nodes = Array.isArray(images?.nodes) ? images.nodes : [];
  const first = asObject(nodes[0]);
  const url = strField(first?.url);
  if (url) return { url, alt: strField(first?.altText) };
  return { url: "", alt: "" };
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

/** One GraphQL product node → CollectionProduct. Junk → null. Never throws. */
export function readCollectionProduct(raw: unknown): CollectionProduct | null {
  try {
    const p = asObject(raw);
    if (!p) return null;
    const handle = strField(p.handle);
    if (!handle) return null;
    const live = firstAvailableVariant(variantNodes(p));
    const image = readImage(p);
    return {
      handle,
      variantGid: live?.id ?? "",
      variantNumericId: live ? numericId(live.id) : "",
      priceAmount: live?.priceAmount ?? "",
      currency: live?.currency ?? "",
      title: strField(p.title),
      availableForSale: p.availableForSale === true,
      imageUrl: image.url,
      imageAlt: image.alt,
      productType: strField(p.productType),
    };
  } catch {
    return null;
  }
}

function collectionNode(data: unknown): unknown {
  const root = asObject(data);
  if (!root) return null;
  if ("collection" in root) return root.collection;
  if ("collectionByHandle" in root) return root.collectionByHandle;
  return null;
}

function productNodes(coll: unknown): unknown[] {
  const c = asObject(coll);
  if (!c) return [];
  const products = asObject(c.products);
  if (!products) return [];
  if (Array.isArray(products.nodes)) return products.nodes;
  if (Array.isArray(products.edges)) {
    return products.edges.map((e) => asObject(e)?.node);
  }
  return [];
}

/**
 * Pure parser: GraphQL `data` → live collection products.
 * availableForSale false and nodes without an available variant are omitted.
 * Junk nodes are skipped. Never throws.
 */
export function parseCollectionProducts(data: unknown): CollectionProduct[] {
  try {
    const coll = collectionNode(data);
    if (coll == null) return [];
    const out: CollectionProduct[] = [];
    for (const node of productNodes(coll)) {
      const p = readCollectionProduct(node);
      if (!p) continue;
      if (p.availableForSale !== true) continue;
      if (!p.variantGid) continue;
      out.push(p);
    }
    return out;
  } catch {
    return [];
  }
}

/** Vare-shape til VareKort / ProduktFlade. linje er tom — YAML-copy er kun fallback. */
export function vareFromCollectionProduct(p: CollectionProduct): {
  handle: string;
  titel: string;
  foto: string;
  linje: string;
  gruppe: string;
} {
  return {
    handle: p.handle,
    titel: p.title,
    foto: p.imageUrl,
    linje: "",
    gruppe: p.productType,
  };
}

const PRODUCT_QUERY = `query Product($handle: String!) {
  product(handle: $handle) {
    handle
    title
    availableForSale
    productType
    featuredImage { url altText }
    images(first: 1) { nodes { url altText } }
    variants(first: 10) {
      nodes {
        id
        availableForSale
        price { amount currencyCode }
      }
    }
  }
}`;

export async function productByHandle(handle: string): Promise<CollectionProduct | null> {
  const h = handle.trim();
  if (!h) return null;
  if (!storefrontConfig().ok) return null;
  try {
    const data = await storefrontQuery(PRODUCT_QUERY, { handle: h });
    if (!data) return null;
    return readCollectionProduct(data.product);
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

const COLLECTION_QUERY = `query CollectionByHandle($handle: String!) {
  collection(handle: $handle) {
    handle
    products(first: 250) {
      nodes {
        title
        handle
        availableForSale
        productType
        featuredImage { url altText }
        images(first: 1) { nodes { url altText } }
        variants(first: 10) {
          nodes {
            id
            availableForSale
            price { amount currencyCode }
          }
        }
      }
    }
  }
}`;

export async function productsInCollection(handle: string): Promise<CollectionResult> {
  try {
    const h = handle.trim();
    if (!h) return { ok: false, products: [] };
    const cfg = storefrontConfig();
    if (!cfg.ok) return { ok: false, products: [] };
    const data = await storefrontQuery(COLLECTION_QUERY, { handle: h });
    if (!data) return { ok: false, products: [] };
    const coll = collectionNode(data);
    if (coll == null) return { ok: false, products: [] };
    return { ok: true, products: parseCollectionProducts(data) };
  } catch {
    return { ok: false, products: [] };
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
