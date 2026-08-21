import { GIFT_CARDS, GIFT_CARD_PRODUCT_URL, giftCartUrl, kr } from "@/lib/commerce";

/**
 * Gavekort-flade i Emerge-udtrykket. Server-renderet — rene <a>-links til
 * Shopify-checkout (cart-permalink), så den virker uden JS og uden at sitet
 * rører penge. Genbrugelig: bruges på /gavekort, kan senere embeddes i scenen.
 */
export function GiftCardOffer() {
  return (
    <section className="mt-12" aria-labelledby="gavekort-beloeb">
      <h2
        id="gavekort-beloeb"
        className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]"
      >
        Vælg beløb
      </h2>
      <ul className="mt-6 flex flex-wrap gap-3 list-none p-0">
        {GIFT_CARDS.map((g) => (
          <li key={g.variantId}>
            <a
              href={giftCartUrl(g.variantId)}
              className="inline-flex items-baseline gap-1 border border-[var(--gold)]/40 px-5 py-3 font-[family-name:var(--font-mono)] text-[13px] tracking-[0.12em] text-[var(--text)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              <span>{kr(g.kr)}</span>
              <span className="text-[var(--text-mute)]">kr</span>
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
  );
}
