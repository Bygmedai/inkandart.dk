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

/**
 * Reservationer — depositum der holder en plads (Villy, S567).
 *
 * Begge er live Shopify-produkter af typen "Depositum": beløbet trækkes fra
 * prisen på tatoveringen, og selve tiden aftales bagefter. Det er derfor
 * copy'en siger «trækkes fra» og ikke «du har en tid» (rails §4).
 *
 * Verificeret 2026-08-21 mod den rigtige butik — positiv OG negativ kontrol.
 * NB (Haruki, S568): en LEVENDE variant svarer 302 på et bart kald; de 200
 * dukker først op hvis du følger redirect (curl -L). En DØD svarer 410 med
 * det samme. Mål derfor 302-eller-fulgt-200 mod 410 — ikke «200 mod 410»:
 *   cart/53492757627208:1 → 302 (fulgt: 200)   reservér en tid · 100,-
 *   cart/53463786127688:1 → 302 (fulgt: 200)   heldags-session 4t+ · 1.000,-
 *   cart/99999999999999:1 → 410                negativ kontrol
 *
 * NB: de fire piercing-depositum-varianter er 410 (ikke købbare) og indgår
 * derfor ikke — en død handling er værre end ingen (rails §4).
 */
export type Reservation = {
  kr: number;
  variantId: string;
  /** Kridtets overlinje — hvad pladsen er. */
  label: string;
  /** Skærmlæser-sætningen; kridtet er grafik. */
  aria: string;
};

export const RESERVATIONS: Reservation[] = [
  {
    kr: 100,
    variantId: "53492757627208",
    label: "Hold min plads",
    aria: "Reservér en tid med 100 kroner i depositum",
  },
  {
    kr: 1000,
    variantId: "53463786127688",
    label: "Hele dagen",
    aria: "Reservér en heldags-session med 1.000 kroner i depositum",
  },
];

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
