import {
  GIFT_CARDS,
  giftCartUrl,
  kr,
} from "@/lib/commerce";

/**
 * Ét gavekort, samme beløb, samme navn — alle indgange viser hele sættet.
 * Steven S574: "Det bør være det samme og hedde det samme." Det tidligere
 * 3-beløbs-udsnit på Mærket er ophævet; kilden er GIFT_CARDS alene.
 */
export function GavekortKoeb() {
  const cards = GIFT_CARDS;
  return (
    <>
      <p className="rum-label" id="gavekort">Gavekort</p>
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
      </ul>
    </>
  );
}
