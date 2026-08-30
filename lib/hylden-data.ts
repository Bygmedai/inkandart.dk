import { loadHylden, type Vare } from "@/lib/content";
import {
  productsByHandles,
  productsInCollection,
  vareFromCollectionProduct,
  type StorefrontProduct,
} from "@/lib/storefront";

/**
 * Hylden hentes ét sted, bruges af begge sprog (S574).
 *
 * Kilden er Shopify-kollektionen `hylden`. Svarer Storefront ikke — ingen
 * env, fejl, timeout, manglende kollektion — falder vi tilbage til
 * hylden.yml + productsByHandles. Fallbacken filtrerer varer uden levende
 * variant fra: en hylde må hellere være tom end bære en død knap.
 */
export async function hentHylden(): Promise<
  { vare: Vare; product?: StorefrontProduct }[]
> {
  const coll = await productsInCollection("hylden");
  if (coll.ok) {
    return coll.products.map((p) => ({
      vare: vareFromCollectionProduct(p),
      product: p,
    }));
  }
  const varer = loadHylden();
  const sf = await productsByHandles(varer.map((v) => v.handle));
  return varer
    .map((vare) => ({
      vare,
      product: sf.products.find((p) => p.handle === vare.handle),
    }))
    .filter((x) => Boolean(x.product?.variantGid));
}
