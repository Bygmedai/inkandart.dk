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
 * NB: de fire piercing-depositum-varianter VAR 410 den 2026-08-21 og blev
 * holdt ude med vilje. De er levende i dag og bor nu i PIERCINGS nedenfor
 * (ny måling dér). Kantstenen selv står uændret på to mærker.
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

/**
 * Prints & objekter til /shop-kataloget (Villy, S568 — vej B: shoppen foldet
 * ind i hub'en). RÅB: append-only-blok; Vilde ejer filen, Grok fylder
 * variantId'er via P3 når Shopify-varerne er publiceret.
 *
 * ALLE tre er drafts i Shopify i dag og priserne afventer Stevens
 * bekræftelse — derfor `live: false` og INGEN variantId. Kataloget viser dem
 * som «snart på væggen» uden købshandling (rails §4: tom hylde skal se tom
 * ud, og en død knap er værre end ingen). Når P3 publicerer og prisgaten er
 * åbnet: sæt live: true + variantId (verificér 302/fulgt-200 mod 410 først).
 */
export type ShopPrint = {
  navn: string;
  kr: number;
  /** Shopify-handle — findes allerede som draft. */
  handle: string;
  /** Kun true når varen er publiceret OG prisen er bekræftet af Steven. */
  live: boolean;
  variantId?: string;
  /** Én linje i universets stemme — kridtsproget, ikke webshop-dansk. */
  linje: string;
};

export const SHOP_PRINTS: ShopPrint[] = [
  {
    navn: "Dolk",
    kr: 250,
    handle: "dolk",
    live: false,
    linje: "Et af husets motiver, trykt i hånden på tykt papir.",
  },
  {
    navn: "Ouroboros",
    kr: 250,
    handle: "ouroboros",
    live: false,
    linje: "Slangen der bider sig selv i halen. Lille oplag.",
  },
  {
    navn: "Signetring",
    kr: 1200,
    handle: "signetring",
    live: false,
    linje: "Støbt i sterlingsølv efter en af husets tegninger.",
  },
];

/**
 * Depositum-flader (Villy, S569) — de LEVENDE varer der ikke stod nogen steder.
 *
 * Fundet ved at holde Shopify-kataloget op mod den rensede side: ti produkter
 * er ACTIVE og availableForSale, men kun fire havde en flade på sitet. De
 * seks herunder kunne købes af enhver der kendte linket — og af ingen andre.
 *
 * Målt 2026-08-22 mod d1qp54-0w.myshopify.com efter husets protokol
 * (LEVENDE = 302 bart / 200 fulgt · DØD = 410 med det samme), positiv OG
 * negativ kontrol i samme kørsel — scripts/maal-varianter.sh:
 *   cart/53463786062152:1 → 302 (fulgt 200)   flash på Module ·   100,-
 *   cart/53463786094920:1 → 302 (fulgt 200)   flash i shoppen ·   500,-
 *   cart/53511714570568:1 → 302 (fulgt 200)   piercing · øre ·    100,-
 *   cart/53511714996552:1 → 302 (fulgt 200)   piercing · krop ·   100,-
 *   cart/53511715422536:1 → 302 (fulgt 200)   piercing · ansigt · 100,-
 *   cart/53511715881288:1 → 302 (fulgt 200)   piercing · mund ·   100,-
 *   cart/53342061822280:1 → 410               Dolk (draft)      negativ kontrol
 *   cart/99999999999999:1 → 410               findes ikke       negativ kontrol
 *
 * Copy'en bor i lib/i18n.ts (nøglet på `id`), ikke her — så fladen kan tales
 * på begge sprog uden at handelslaget kender til sprog. Kun tal og ID'er her.
 */
export type Deposit = {
  /** Nøgle til copy i i18n (shop.piercing.slots / flash.depositum). */
  id: string;
  /** DKK. Depositum — trækkes fra prisen på selve arbejdet. */
  kr: number;
  /** Shopify ProductVariant-ID. Kun verificeret levende ID hører til her. */
  variantId: string;
  /** Shopify-handle — så en fremtidig læser kan finde varen igen. */
  handle: string;
};

/**
 * Piercing — fire steder på kroppen, samme depositum.
 *
 * Dette er også svaret på beta-testen ("Er det en tatto shop?"): ordet
 * «piercing» fandtes ikke ét sted på sitet, selv om huset har solgt det i
 * Shopify siden juli. Nu er det både en sætning og en handling.
 */
export const PIERCINGS: Deposit[] = [
  { id: "ore", kr: 100, variantId: "53511714570568", handle: "piercing-ore-reserver-tid" },
  { id: "krop", kr: 100, variantId: "53511714996552", handle: "piercing-krop-reserver-tid" },
  { id: "ansigt", kr: 100, variantId: "53511715422536", handle: "piercing-ansigt-reserver-tid" },
  { id: "mund", kr: 100, variantId: "53511715881288", handle: "piercing-mund-reserver-tid" },
];

/**
 * Flash-tider. To steder, to depositummer — huset har sat begge priser.
 *
 * NB: `flash`-listen i lib/flash.ts er tom (motiverne er ikke leveret endnu).
 * Det er ikke i modstrid: depositummet holder en TID, ikke et bestemt motiv —
 * præcis som Shopify-varens egen beskrivelse siger. Copy'en må derfor aldrig
 * love et motiv (rails §4).
 */
export const FLASH_DEPOSITS: Deposit[] = [
  { id: "shoppen", kr: 500, variantId: "53463786094920", handle: "depositum-flash-i-shoppen" },
  { id: "module", kr: 100, variantId: "53463786062152", handle: "depositum-flash-pa-module" },
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
