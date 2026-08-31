import type { FlashPiece } from "@/lib/flash";

/**
 * Kan vi BEVISE at der er ét stykke tilbage?
 *
 * Baggrunden (Haruki, målt 31/8, #245 A1): alle 20 produkter i butikken
 * havde `tracksInventory: false`. En utrakteret variant svarer
 * `availableForSale: true` for evigt — uanset `inventoryPolicy: DENY`.
 * Derfor kunne `claimed: !availableForSale` aldrig blive sand, «Taget»
 * renderede aldrig, og et unikt motiv kunne sælges ti gange.
 *
 * Vi vender bevisbyrden om: et motiv vises kun hvis lageret kan bevise sig
 * selv. Kan det ikke, vises det ikke. Det er den rigtige vej at fejle — en
 * manglende vare er en skuffelse, en dobbeltsolgt vare er en kunde der har
 * betalt for noget huset ikke har.
 *
 * Reglen holder uanset hvad Shopify svarer for en utrakteret variant, og det
 * er med vilje: Storefront-nøglens scopes kan jeg ikke læse herfra (Admin
 * nægter adgang til `storefrontAccessTokens`, målt 31/8), så koden må ikke
 * afhænge af hvad svaret er.
 *
 * Filen har INGEN runtime-imports. Det er derfor reglen kan prøves direkte
 * i `npm test` frem for at blive påstået gennem kildetekst.
 */

export type LagerStatus =
  /** Trakteret og på lager — må sælges. */
  | "ledig"
  /** Trakteret og udsolgt — vises udtonet som «Taget», bliver stående. */
  | "taget"
  /** Kan ikke bevise sig selv — vises ikke, og vi siger hvorfor. */
  | "ubevist";

export type Lager = {
  status: LagerStatus;
  /** Antallet Storefront kunne bevise. null = ikke oplyst. */
  antal: number | null;
  /** Kun sat når status er «ubevist». Én linje, egnet til en log. */
  grund: string;
};

export function lagerstatus(raw: unknown): Lager {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { status: "ubevist", antal: null, grund: "ingen variant" };
  }
  const v = raw as {
    availableForSale?: unknown;
    quantityAvailable?: unknown;
    currentlyNotInStock?: unknown;
  };
  const tilSalg = v.availableForSale === true;
  const antal = typeof v.quantityAvailable === "number" ? v.quantityAvailable : null;

  // Restordre: Shopify siger selv at varen kan købes UDEN at være på lager.
  // Det er præcis den dobbeltsalgs-vej vi er her for at lukke.
  if (v.currentlyNotInStock === true) {
    return { status: "ubevist", antal, grund: "kan købes uden lager (restordre)" };
  }

  // Intet tal at gå efter. Enten er varianten utrakteret, eller også mangler
  // nøglen scopet `unauthenticated_read_product_inventory`. Begge dele
  // betyder det samme her: vi kan ikke bevise noget.
  if (antal === null) {
    return {
      status: "ubevist",
      antal: null,
      grund:
        "Storefront oplyser ikke quantityAvailable (utrakteret variant, eller nøglen mangler unauthenticated_read_product_inventory)",
    };
  }

  if (tilSalg && antal > 0) return { status: "ledig", antal, grund: "" };
  if (!tilSalg && antal <= 0) return { status: "taget", antal, grund: "" };

  // Uenighed mellem de to felter. Den typiske form er `availableForSale: true`
  // med `quantityAvailable: 0` — signaturen på en utrakteret variant.
  return {
    status: "ubevist",
    antal,
    grund: `til salg=${tilSalg} men lager=${antal} — varianten bakker ikke sit eget salg op`,
  };
}

/**
 * EGNE forespørgsler, ikke den delte `COLLECTION_QUERY`.
 *
 * Ikke pedanteri: `storefrontQuery` returnerer `null` når GraphQL svarer med
 * `errors` (lib/storefront.ts, linje 95). Afviser Storefront
 * `quantityAvailable` fordi nøglen mangler scopet, ville feltet i den DELTE
 * forespørgsel tømme Hylden på `/shop` sammen med flash. Isoleret her kan
 * kun `/flash` degradere — og den degraderer til «Næste drop er på vej»,
 * som er sandt.
 */
export const FLASH_QUERY = `query FlashDrop($handle: String!) {
  collection(handle: $handle) {
    handle
    products(first: 250) {
      nodes {
        title
        handle
        featuredImage { url altText }
        images(first: 1) { nodes { url altText } }
        variants(first: 10) {
          nodes {
            id
            availableForSale
            currentlyNotInStock
            quantityAvailable
            price { amount currencyCode }
          }
        }
      }
    }
  }
}`;

export const VARIANT_QUERY = `query VariantLager($handle: String!) {
  product(handle: $handle) {
    handle
    variants(first: 10) {
      nodes {
        id
        availableForSale
        currentlyNotInStock
        quantityAvailable
      }
    }
  }
}`;

export type FlashVare = {
  handle: string;
  titel: string;
  billede: string;
  prisKr: number;
  variantId: string;
  lager: Lager;
};

function obj(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function tekst(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function numerisk(gid: unknown): string {
  const m = tekst(gid).match(/(\d+)\s*$/);
  return m ? m[1] : "";
}

/** Første variant, uanset om den kan købes. Flash er ét motiv = én variant. */
export function foersteVariant(node: unknown): unknown {
  const p = obj(node);
  const v = p ? obj(p.variants) : null;
  const nodes = v && Array.isArray(v.nodes) ? v.nodes : [];
  return nodes[0] ?? null;
}

function billede(node: unknown): string {
  const p = obj(node);
  if (!p) return "";
  const fremhaevet = obj(p.featuredImage);
  const url = tekst(fremhaevet?.url);
  if (url) return url;
  const images = obj(p.images);
  const nodes = images && Array.isArray(images.nodes) ? images.nodes : [];
  return tekst(obj(nodes[0])?.url);
}

function prisKr(variant: unknown): number {
  const pris = obj(obj(variant)?.price);
  return Math.round(Number(tekst(pris?.amount)) || 0);
}

export function laesFlashVarer(data: unknown): FlashVare[] {
  const coll = obj(obj(data)?.collection);
  if (!coll) return [];
  const produkter = obj(coll.products);
  const nodes = produkter && Array.isArray(produkter.nodes) ? produkter.nodes : [];
  const ud: FlashVare[] = [];
  for (const node of nodes) {
    const p = obj(node);
    if (!p) continue;
    const handle = tekst(p.handle);
    const titel = tekst(p.title);
    if (!handle || !titel) continue;
    const variant = foersteVariant(node);
    ud.push({
      handle,
      titel,
      billede: billede(node),
      prisKr: prisKr(variant),
      variantId: numerisk(obj(variant)?.id),
      lager: lagerstatus(variant),
    });
  }
  return ud;
}

/**
 * Dommen omsat til kort. Ren funktion, så fail-closed-reglen kan prøves
 * uden et netværkskald — det er den regel hele #245 A1 handler om.
 */
export function tilFlashPieces(varer: FlashVare[]): FlashPiece[] {
  const ud: FlashPiece[] = [];
  for (const v of varer) {
    if (v.lager.status === "ubevist") {
      console.warn(
        `[flash-drop] ${v.handle} vises ikke — lageret kan ikke bevise sig selv: ${v.lager.grund}`,
      );
      continue;
    }
    const taget = v.lager.status === "taget";
    ud.push({
      id: v.handle,
      title: v.titel,
      // Artist og størrelse hører til motivet; indtil Shopify bærer dem
      // struktureret, står de i NAVNET. Vi sætter dem ikke — et felt der
      // altid lyver er værre end et felt der mangler (#245 A2).
      artist: "",
      // Et taget motiv viser ingen pris — «Taget» er hele beskeden (#236).
      priceKr: taget ? 0 : v.prisKr,
      img: v.billede,
      // Et taget motiv får INTET variantId. Uden det kan siden ikke rende en
      // købsknap på noget der er væk, heller ikke ved en fejl i view-laget.
      variantId: taget ? undefined : v.variantId,
      oneOff: true,
      claimed: taget,
    });
  }
  return ud;
}
