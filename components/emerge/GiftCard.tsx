import { GIFT_CARDS, GIFT_CARD_PRODUCT_URL, giftCartUrl, kr } from "@/lib/commerce";
import { GiftVoucher } from "./GiftVoucher";

/** Atmosfærisk rækkevidde — ikke en prisliste. */
const REACH: Record<number, string> = {
  500: "Et smykke. En lille start.",
  1000: "En session der kan blive til noget.",
  1500: "Plads til at sidde i stolen.",
  2000: "Et stykke der bliver.",
  3000: "Vælg frit. Rest gemmes.",
};

/**
 * Gavekort-flade i Emerge-udtrykket. Server-renderet — rene <a>-links til
 * Shopify-checkout (cart-permalink), så den virker uden JS og uden at sitet
 * rører penge. Kortet er objektet; beløbene er stemplerne man trykker.
 */
export function GiftCardOffer() {
  return (
    <div className="gift-stage">
      <GiftVoucher />

      <section aria-labelledby="gavekort-beloeb">
        <h2
          id="gavekort-beloeb"
          className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]"
        >
          Vælg beløb
        </h2>
        <ul className="gift-denoms">
          {GIFT_CARDS.map((g) => (
            <li key={g.variantId}>
              <a
                href={giftCartUrl(g.variantId)}
                data-kr={g.kr}
                className="gift-denom"
                aria-label={`Køb gavekort på ${kr(g.kr)} kr`}
              >
                <span className="gift-denom__amount">
                  {kr(g.kr)} <em>kr</em>
                </span>
                <span className="gift-denom__reach">{REACH[g.kr] ?? "Veksles i studiet."}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
          <a
            href={GIFT_CARD_PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Alle gavekort-beløb (åbner i nyt vindue)"
            className="border-b border-[var(--gold)]/40 pb-1 text-[var(--gold)]"
          >
            Andre beløb →
          </a>
        </p>
      </section>
    </div>
  );
}
