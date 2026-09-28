import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Et foto i telefonstørrelse (Villy, accept: docs/accept/billeder-mobil.md).
 *
 * Mobilversionerne laves ved hver udrulning af lib/fotovarianter.ts og står
 * i public/_v/. Manifestet siger hvilke bredder der FINDES for hvert
 * billede, og kun dem kommer i srcset. Det er hele pointen: en browser falder
 * ikke tilbage fra et srcset-kandidat der svarer 404 — den viser et brudt
 * billede. Så intet manifest (dev, test, en build der fejlede), eller et
 * billede manifestet ikke kender, giver bare det originale src, som i dag.
 *
 * `sizes` er komponentens egen oplysning om hvor bred pladsen er. Den skal
 * passe til CSS'en; er den for lille, bliver billedet sløret på en stor skærm.
 */

export const VARIANT_MAPPE = "/_v";
export const MANIFEST = "public/_v/manifest.json";

export type FotoManifest = Record<string, number[]>;

let cache: FotoManifest | null | undefined;

function manifest(): FotoManifest | null {
  if (cache !== undefined) return cache;
  try {
    cache = JSON.parse(readFileSync(join(process.cwd(), MANIFEST), "utf8"));
  } catch {
    cache = null;
  }
  return cache ?? null;
}

export function variantSti(src: string, bredde: number): string {
  return `${VARIANT_MAPPE}${src.replace(/\.[a-z0-9]+$/i, "")}-${bredde}.webp`;
}

export function foto(
  src: string,
  sizes: string,
  m: FotoManifest | null = manifest(),
): { src: string; srcSet?: string; sizes?: string } {
  const bredder = src && m ? m[src] : undefined;
  if (!bredder?.length) return { src };
  return {
    src,
    srcSet: bredder.map((w) => `${variantSti(src, w)} ${w}w`).join(", "),
    sizes,
  };
}
