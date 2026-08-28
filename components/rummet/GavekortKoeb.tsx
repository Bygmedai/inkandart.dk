import {
  GIFT_CARDS,
  GIFT_CARD_PRODUCT_URL,
  giftCartUrl,
  kr,
} from "@/lib/commerce";

/** Mærket U5 — only 500 / 1.000 / 2.000 from the live variants, plus frit. */
const SHOWN = new Set([500, 1000, 2000]);

export function GavekortKoeb() {
  const cards = GIFT_CARDS.filter((g) => SHOWN.has(g.kr));
  return (
    <ul className="rum-gave" role="list">
      {cards.map((g) => (
        <li key={g.variantId}>
          <a
            className="rum-book rum-gave__n"
            href={giftCartUrl(g.variantId)}
            rel="noopener noreferrer"
            aria-label={`Gavekort ${kr(g.kr)} kr`}
          >
            {kr(g.kr)}
          </a>
        </li>
      ))}
      <li>
        <a
          className="rum-book rum-gave__n"
          href={GIFT_CARD_PRODUCT_URL}
          rel="noopener noreferrer"
        >
          frit
        </a>
      </li>
    </ul>
  );
}
