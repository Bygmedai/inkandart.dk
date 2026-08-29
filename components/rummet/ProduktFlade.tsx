import type { Artist, Vaerk } from "@/lib/content";
import type { StorefrontProduct } from "@/lib/storefront";
import { kr } from "@/lib/commerce";
import { RummetShell } from "./Shell";
import { Plade } from "./Plade";

function priceLabel(product: StorefrontProduct): string {
  const n = Number(product.priceAmount);
  if (!Number.isFinite(n)) return "";
  return `${kr(Math.round(n))} kr`;
}

export function ProduktFlade({
  vaerk,
  artist,
  product,
}: {
  vaerk: Vaerk;
  artist?: Artist;
  product: StorefrontProduct | null;
}) {
  const buy = product ? priceLabel(product) : "";
  return (
    <RummetShell tone="salg">
      <main id="main" className="rum-room rum-produkt">
        <p className="rum-label">Mærket</p>
        <h1 className="rum-room__title rum-poster">{vaerk.titel || vaerk.id}</h1>
        <div className="rum-produkt__plade">
          <Plade vaerk={vaerk} artist={artist} />
        </div>
        <p className="rum-label rum-produkt__fragt">Fri fragt fra 499</p>
        {product?.variantGid && buy ? (
          <form className="rum-produkt__koeb" action="/api/rummet/cart" method="post">
            <input type="hidden" name="variantId" value={product.variantGid} />
            <button type="submit" className="rum-book rum-book--row">
              {buy}
            </button>
          </form>
        ) : null}
      </main>
    </RummetShell>
  );
}
