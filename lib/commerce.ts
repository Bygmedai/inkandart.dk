/**
 * Shopify commerce-handoff for inkandart.dk.
 *
 * Sitet er en statisk brand-flade; betalingen bor i Shopify (butikken
 * "Inkandart" · d1qp54-0w.myshopify.com · DKK). Vi afleverer kurven via en
 * cart-permalink, så checkout (MobilePay/kort/wallets) bliver liggende hos
 * Shopify — sitet håndterer aldrig selv penge eller credentials.
 *
 * KASSEN OG API'ET ER TO DOMÆNER — MED VILJE.
 *
 * Kunden ser adresselinjen mens hun betaler. Indtil 2/9 2026 stod der
 * `d1qp54-0w.myshopify.com` — et maskingenereret navn hun aldrig har hørt
 * om, på det øjeblik hvor hun taster sit kort. Det ligner phishing.
 * Husets kasse hedder nu `butik.inkandart.dk`.
 *
 * Men Storefront-API'et (lib/storefront.ts) og Admin-API'et
 * (lib/depositum.ts, /api/subscribe) skal blive på myshopify-domænet.
 * Shopify anbefaler det, og det er dér vi har målt at kaldene virker.
 * Derfor findes der to variabler:
 *
 *   NEXT_PUBLIC_SHOPIFY_KASSE   → det kunden ser: cart-permalinks, produkt-URL'er
 *   NEXT_PUBLIC_SHOPIFY_DOMAIN  → det koden taler med: API-kald
 *
 * Er KASSE ikke sat, falder kassen tilbage til API-domænet, og alt virker
 * som før. Så kan variablen sættes i Vercel den dag certifikatet er på
 * plads — uden at røre koden igen. Shopify viderestiller selv mellem
 * de to domæner, så et gammelt link i en mail dør aldrig.
 *
 * Variant-ID'erne er læst 1:1 fra det live Gavekort-produkt
 * (handle gavekort-100-til-ink-and-art); alle beløb er availableForSale
 * og publiceret på online-store-kanalen.
 */
const API_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN?.trim() || "d1qp54-0w.myshopify.com";

/** Kassen — det domæne kunden ser i adresselinjen når hun betaler. */
const KASSE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_KASSE?.trim() || API_DOMAIN;

/** Eksporteret så et vidne kan måle den — ikke så andre moduler bygger URL'er selv. */
export const kassensDomaene = (): string => KASSE_DOMAIN;

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
export const GIFT_CARD_PRODUCT_URL = `https://${KASSE_DOMAIN}/products/${GIFT_CARD_HANDLE}`;

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

export const WALKIN_PRODUCT_URL = `https://${KASSE_DOMAIN}/products/${WALKIN.handle}`;

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
  /**
   * Noegle til copy i i18n. Etiketten og skaermlaeser-saetningen laa foer
   * HER, paa dansk — og fulgte derfor med ud paa /en og /en/shop, hvor en
   * engelsk kunde moedte «Hold min plads» paa selve koebsknappen.
   * Samme greb som PIERCINGS: tal og ID'er her, ord i i18n.
   */
  id: string;
  kr: number;
  variantId: string;
};

export const RESERVATIONS: Reservation[] = [
  { id: "plads", kr: 100, variantId: "53492757627208" },
  { id: "heldag", kr: 1000, variantId: "53463786127688" },
];

/**
 * Prints & objekter til /shop-kataloget (Villy, S568 — vej B: shoppen foldet
 * ind i hub'en). RÅB: append-only-blok; Vilde ejer filen, Grok fylder
 * variantId'er via P3 når Shopify-varerne er publiceret.
 *
 * NEDLAGT SOM DEMO 2026-08-30 (Steven, S574): «det er ikke rigtige varer,
 * det er demo-varer. Sonja kommer til at lægge ægte varer op.» De var live
 * 24–30/8; nu er alle tre sat til DRAFT i Shopify og live:false her, saa
 * vaeggen viser den aerlige tom-tilstand til Sonjas rigtige katalog kommer.
 *
 * Maalt 2026-08-30 efter husets protokol med negativ kontrol:
 *   cart/53342061822280:1 → 410   Dolk (DRAFT)
 *   cart/53342061855048:1 → 410   Ouroboros (DRAFT)
 *   cart/53342061887816:1 → 410   Signetring (DRAFT)
 *   cart/99999999999999:1 → 410   negativ kontrol
 *   cart/53467075248456:1 → 302   gavekort 500 (positiv kontrol — lever)
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
    // S574 (Steven, 30/8): demo-vare — IKKE til salg. Sonja lægger ægte
    // varer op. Shopify-status sat til DRAFT samme dag; målt 410 på
    // cart-permalink (negativ kontrol 410, gavekort 302).
    live: false,
    variantId: "53342061822280",
    linje: "Et af husets motiver, trykt i hånden på tykt papir.",
  },
  {
    navn: "Ouroboros",
    kr: 250,
    handle: "ouroboros",
    // S574: demo — DRAFT i Shopify 30/8, målt 410.
    live: false,
    variantId: "53342061855048",
    linje: "Slangen der bider sig selv i halen. Lille oplag.",
  },
  {
    navn: "Signetring",
    kr: 1200,
    handle: "signetring",
    // S574: demo — DRAFT i Shopify 30/8, målt 410.
    live: false,
    variantId: "53342061887816",
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

/**
 * Cart-permalink for enhver variant (gavekort, flash, …): lægger varen i
 * kurven og sender direkte til Shopify-checkout.
 *
 * S580 (4/9): kassen har et sprog. Målt som kunde: fra /en/booking/tak
 * åbnede kassen på DANSK — «Betalingsproces», «Kontaktoplysninger»,
 * «Betal nu» — selvom Shopify har engelsk publiceret. Præfikset `/en/`
 * på permalinket giver den engelske kasse (målt: `/en/cart/…` → `en-dk`).
 * Dansk er standard, så alle gamle kald opfører sig som før.
 */
export function cartUrl(variantId: string, lang: "da" | "en" = "da"): string {
  if (lang === "en") {
    return `https://${KASSE_DOMAIN}/en/cart/${variantId}:1?skip_shop_pay=true`;
  }
  return `https://${KASSE_DOMAIN}/cart/${variantId}:1?skip_shop_pay=true`;
}

/** Gavekort-alias — bevaret for læsbarhed på gavekort-fladen. */
export function giftCartUrl(variantId: string, lang: "da" | "en" = "da"): string {
  return cartUrl(variantId, lang);
}

/** Dansk tusind-separator uden ICU-afhængighed (deterministisk server-render). */
export function kr(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * RÅB (Villy, S574 — Stevens kald 30/8 «Sælg natten»): ny append-only-blok.
 *
 * Nattespot — en holdt plads torsdag, fredag eller lørdag EFTER KL. 22.
 * De timer huset holder åbent, og som ingen anden tatovør i København
 * holder åbent. Fladen /natten kunne indtil nu ikke tage imod en krone:
 * målt 30/8 havde forsiden, /gaden og /natten NUL købslinks, mens
 * /shop, /maerket og /gavekort havde 16 hver.
 *
 * 300 kr er Stevens kald — et kraftigere no-show-filter end husets 100 kr,
 * uden at kræve fuld forudbetaling. Resten aftales i studiet, som på alt
 * andet end walk-in-tilbuddet; en opfundet fastpris ville være det første
 * tal på sitet der ikke kom fra huset.
 *
 * TO TRIN, ikke ét — gengivet live 30/8 så den næste ikke skal lære den igen:
 *   status ACTIVE alene  → bart 410  (varen fandtes, men lå på ingen kanal)
 *   + publishablePublish → bart 302, fulgt 200
 *
 * Målt 2026-08-30, husets protokol med negativ kontrol:
 *   cart/53929126854984:1 → 302 (fulgt 200)   Nattespot ·  300,-
 *   cart/99999999999999:1 → 410               negativ kontrol
 */
export const NATTESPOT = {
  kr: 300,
  variantId: "53929126854984",
  handle: "nattespot-hold-en-plads",
} as const;

export function nattespotCartUrl(): string {
  return cartUrl(NATTESPOT.variantId);
}

/**
 * Fredagsflash — hver fredag 18–24 (Haruki, #245 B1/B2. Villy, S576).
 *
 * Tid og priser står ÉT sted, fordi Nizar skal kunne bede om «19–01» uden
 * at nogen leder i tre filer. Kopierer du et af tallene ud i copy, har du
 * lavet det andet sted de kan drive fra hinanden.
 *
 * Produktet er DRAFT indtil Steven tænder det (Aktiv + udgivet til Webshop
 * og Inkandart Headless). Indtil da renderer blokken uden knap — se
 * `variantLager()` i lib/lager.ts. Det er ikke en fejltilstand; det er den
 * rigtige tilstand for en reservation huset endnu ikke har sagt ja til.
 */
export const FREDAGSFLASH = {
  dag: "fredag",
  aabner: "18",
  lukker: "24",
  lilleKr: 450,
  mellemKr: 800,
  depositumKr: 300,
  variantId: "53935797338440",
  handle: "fredagsflash-hold-en-plads",
} as const;

export function fredagsflashCartUrl(): string {
  return cartUrl(FREDAGSFLASH.variantId);
}

/**
 * RÅB (Haruki, S574 — Sirius P0-1): ny append-only-blok i Vildes fil.
 *
 * Alle varianter der TÆLLER som et depositum. Bruges af verifikationen
 * på /booking/tak, så en betalt ordre på et print ikke kan aflæses som
 * en holdt tid. Kommer der en ny depositum-vare, skal den med her —
 * ellers kan kunden ikke få sin betaling bekræftet.
 */
export function depositumVarianter(): ReadonlySet<string> {
  return new Set<string>([
    ...RESERVATIONS.map((r) => r.variantId),
    ...PIERCINGS.map((d) => d.variantId),
    ...FLASH_DEPOSITS.map((d) => d.variantId),
    // Nattespot er et depositum. Uden denne linje betaler kunden 300 kr og
    // faar at vide at ordren ikke er en holdt tid (Harukis raab ovenfor).
    NATTESPOT.variantId,
    // Fredagsflash ogsaa: 300 kr der «traekkes fra i stolen» ER et depositum.
    // Uden linjen her betaler kunden og faar at vide at ordren ikke er en
    // holdt plads.
    FREDAGSFLASH.variantId,
  ]);
}
