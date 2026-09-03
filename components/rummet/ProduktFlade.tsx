import type { Vare } from "@/lib/content";
import type { StorefrontProduct } from "@/lib/storefront";
import { kr } from "@/lib/commerce";
import { DEFAULT_LOCALE, localePath, t, type Locale } from "@/lib/i18n";
import { RummetShell } from "./Shell";

function priceLabel(product: StorefrontProduct): string {
  const n = Number(product.priceAmount);
  if (!Number.isFinite(n)) return "";
  return `${kr(Math.round(n))} kr`;
}

/**
 * Produktsiden viser VAREN. Den viste før et fotografi af en tatovering,
 * fordi hylden hang på værkerne — så købte man et print og så et stykke hud.
 * Rækkefølgen er nu den en køber leder efter: billede, navn, pris, knap,
 * og først derefter ordene om varen.
 */
export function ProduktFlade({
  vare,
  product,
  lang = DEFAULT_LOCALE,
}: {
  vare: Vare;
  product: StorefrontProduct | null;
  lang?: Locale;
}) {
  const c = t(lang).rummet;
  const buy = product ? priceLabel(product) : "";
  return (
    <RummetShell lang={lang} tone="salg">
      <main id="main" lang={lang === "en" ? "en" : undefined} className="rum-room rum-produkt">
        <p className="rum-label">
          <a href={localePath(lang, "/shop")}>{c.shopLabel}</a>
          {vare.gruppe ? ` · ${vare.gruppe}` : ""}
        </p>
        <h1 className="rum-room__title rum-poster">{vare.titel}</h1>
        <div className="rum-produkt__plade">
          <figure className="rum-plade rum-vare">
            <div className="rum-plade__frame rum-vare__frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={vare.foto} alt={vare.titel} />
            </div>
          </figure>
        </div>
        {product?.variantGid && buy ? (
          <form className="rum-produkt__koeb" action="/api/rummet/cart" method="post">
            <input type="hidden" name="variantId" value={product.variantGid} />
            <button type="submit" className="rum-book rum-book--row">
              {c.addToCart} — {buy}
            </button>
          </form>
        ) : null}
        {vare.linje ? <p className="rum-body-copy rum-produkt__om">{vare.linje}</p> : null}
        <p className="rum-label rum-produkt__fragt">{c.shipping}</p>
      </main>
    </RummetShell>
  );
}
