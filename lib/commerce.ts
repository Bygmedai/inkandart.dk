/**
 * Shopify commerce-handoff for inkandart.dk.
 *
 * Sitet er en statisk brand-flade; betalingen bor i Shopify (butikken
 * "Inkandart" · d1qp54-0w.myshopify.com · DKK). Vi afleverer kurven via en
 * cart-permalink, så checkout (MobilePay/kort/wallets) bliver liggende hos
 * Shopify — sitet håndterer aldrig selv penge eller credentials.
 *
 * Domænet kan overrides med NEXT_PUBLIC_SHOPIFY_DOMAIN (fx hvis butikken en
 * dag får et primært domæne). Variant-ID'erne er læst 1:1 fra det live
 * Gavekort-produkt (handle gavekort-100-til-ink-and-art); alle beløb er
 * availableForSale og publiceret på online-store-kanalen.
 */
const SHOPIFY_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN?.trim() || "d1qp54-0w.myshopify.com";

const GIFT_CARD_HANDLE = "gavekort-100-til-ink-and-art";

export type GiftCard = { kr: number; variantId: string };

/**
 * Gavekort-beløb vi viser som hurtige valg (DKK) → Shopify ProductVariant-ID.
 * Alle otte beløb er live cart-permalinks på /gavekort.
 * Produktsiden er password-gated — den er ikke en kundedør.
 */
export const GIFT_CARDS: GiftCard[] = [
  { kr: 100, variantId: "53467075182920" },
  { kr: 250, variantId: "53467075215688" },
  { kr: 500, variantId: "53467075248456" },
  { kr: 1000, variantId: "53467075281224" },
  { kr: 1500, variantId: "53467080393032" },
  { kr: 2000, variantId: "53467080425800" },
  { kr: 3000, variantId: "53467080458568" },
  { kr: 4000, variantId: "53467090420040" },
];

/**
 * @deprecated Produktsiden er password-gated ("butikken åbner snart").
 * Alle beløb sælges via cart-permalink på /gavekort. Beholdt så gamle
 * importører ikke knækker — brug den ikke som kundedør.
 */
export const GIFT_CARD_PRODUCT_URL = `https://${SHOPIFY_DOMAIN}/products/${GIFT_CARD_HANDLE}`;

/**
 * Walk-in: to små tattoos, 900 kr. Live Shopify-produkt
 * (handle 2-sma-tattoos-walk-in-tilbud, variant availableForSale).
 * Svalen i heroen er døren — checkout via cart-permalink, samme handoff som gavekort.
 */
export const WALKIN = {
  kr: 900,
  variantId: "53492552827208",
  handle: "2-sma-tattoos-walk-in-tilbud",
} as const;

export const WALKIN_PRODUCT_URL = `https://${SHOPIFY_DOMAIN}/products/${WALKIN.handle}`;

export function walkinCartUrl(): string {
  return cartUrl(WALKIN.variantId);
}

/** Cart-permalink for enhver variant (gavekort, flash, …): lægger varen i
    kurven og sender direkte til Shopify-checkout. */
export function cartUrl(variantId: string): string {
  return `https://${SHOPIFY_DOMAIN}/cart/${variantId}:1?skip_shop_pay=true`;
}

/** Gavekort-alias — bevaret for læsbarhed på gavekort-fladen. */
export function giftCartUrl(variantId: string): string {
  return cartUrl(variantId);
}

/** Dansk tusind-separator uden ICU-afhængighed (deterministisk server-render). */
export function kr(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
