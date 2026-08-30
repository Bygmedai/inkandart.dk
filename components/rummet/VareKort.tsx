import type { Vare } from "@/lib/content";
import { kr } from "@/lib/commerce";
import type { StorefrontProduct } from "@/lib/storefront";

/**
 * Et kort på hylden. Viser VAREN — ikke et værk.
 *
 * Plade.tsx viser et fotografi af en tatovering, og det er rigtigt på Væggen.
 * På hylden er det forkert: køber man dolke-printet, skal man se plakaten,
 * ikke huden. Prisen står under billedet, fordi det er dét øjet leder efter
 * på en salgsflade.
 */
export function VareKort({ vare, product }: { vare: Vare; product?: StorefrontProduct }) {
  const n = product ? Number(product.priceAmount) : NaN;
  const pris = Number.isFinite(n) ? `${kr(Math.round(n))} kr` : "";
  return (
    <figure className="rum-plade rum-vare">
      <div className="rum-plade__frame rum-vare__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vare.foto} alt={vare.titel} loading="lazy" />
      </div>
      <figcaption>
        <p className="rum-plade__titel rum-poster">{vare.titel}</p>
        {pris ? <p className="rum-vare__pris rum-poster">{pris}</p> : null}
        {vare.linje ? <p className="rum-billedtekst">{vare.linje}</p> : null}
      </figcaption>
    </figure>
  );
}
