import type { Artist, Vaerk } from "@/lib/content";
import type { StorefrontProduct } from "@/lib/storefront";
import { kr } from "@/lib/commerce";
import { DEFAULT_LOCALE, localePath, t, type Locale } from "@/lib/i18n";
import { RummetShell } from "./Shell";
import { Plade } from "./Plade";

/**
 * Et værk der ogsaa kan koebes som edition — print af en rigtig tatovering,
 * med arkivnummer. Her ER motivet varen, og derfor viser den Plade.
 * Almindelige varer (print, smykker, toej) bor paa hylden og bruger
 * ProduktFlade; de to blev skilt ad i S573.
 */
export function VaerkFlade({
  vaerk,
  artist,
  product,
  lang = DEFAULT_LOCALE,
}: {
  vaerk: Vaerk;
  artist?: Artist;
  product: StorefrontProduct | null;
  lang?: Locale;
}) {
  const c = t(lang).rummet;
  const n = product ? Number(product.priceAmount) : NaN;
  const buy = Number.isFinite(n) ? `${kr(Math.round(n))} kr` : "";
  return (
    <RummetShell lang={lang} tone="salg">
      <main id="main" lang={lang === "en" ? "en" : undefined} className="rum-room rum-produkt">
        <p className="rum-label">
          <a href={localePath(lang, "/shop")}>{c.shopLabel}</a> · {c.wallLabel}
        </p>
        <h1 className="rum-room__title rum-poster">{vaerk.titel || vaerk.id}</h1>
        <div className="rum-produkt__plade">
          <Plade vaerk={vaerk} artist={artist} />
        </div>
        {product?.variantGid && buy ? (
          <form className="rum-produkt__koeb" action="/api/rummet/cart" method="post">
            <input type="hidden" name="variantId" value={product.variantGid} />
            <button type="submit" className="rum-book rum-book--row">
              Læg i kurv — {buy}
            </button>
          </form>
        ) : null}
        <p className="rum-label rum-produkt__fragt">Fri fragt fra 499 · afhentes også i butikken</p>
      </main>
    </RummetShell>
  );
}
