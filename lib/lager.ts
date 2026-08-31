import { storefrontQuery } from "@/lib/storefront";
import {
  FLASH_QUERY,
  VARIANT_QUERY,
  foersteVariant,
  lagerstatus,
  laesFlashVarer,
  type FlashVare,
  type Lager,
} from "@/lib/lager-regler";

/** Reglerne selv bor i lib/lager-regler.ts — den har ingen runtime-imports
 *  og kan derfor prøves direkte. Her er kun turen ud på nettet. */
export * from "@/lib/lager-regler";

function obj(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

export async function flashVarer(
  handle: string,
): Promise<{ ok: boolean; varer: FlashVare[] }> {
  const h = handle.trim();
  if (!h) return { ok: false, varer: [] };
  try {
    const data = await storefrontQuery(FLASH_QUERY, { handle: h });
    if (!data) return { ok: false, varer: [] };
    if (obj(data.collection) == null) return { ok: false, varer: [] };
    return { ok: true, varer: laesFlashVarer(data) };
  } catch {
    return { ok: false, varer: [] };
  }
}

/**
 * Lagerstatus for ét produkt, slået op på handle.
 *
 * Et DRAFT-produkt er ikke udgivet og findes derfor slet ikke på Storefront.
 * Så svarer `product` null → «ubevist» → knappen renderer ikke. Det er netop
 * den tilstand Fredagsflash står i indtil Steven tænder produktet, og det er
 * den rigtige tilstand at stå i.
 */
export async function variantLager(handle: string): Promise<Lager> {
  const h = handle.trim();
  if (!h) return { status: "ubevist", antal: null, grund: "intet handle" };
  try {
    const data = await storefrontQuery(VARIANT_QUERY, { handle: h });
    if (!data) {
      return { status: "ubevist", antal: null, grund: "Storefront svarede ikke" };
    }
    const produkt = obj(data.product);
    if (!produkt) {
      return {
        status: "ubevist",
        antal: null,
        grund: "produktet er ikke udgivet (draft eller ikke på kanalen)",
      };
    }
    return lagerstatus(foersteVariant(produkt));
  } catch {
    return { status: "ubevist", antal: null, grund: "opslaget fejlede" };
  }
}
