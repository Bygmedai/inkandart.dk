import {
  GIFT_CARDS,
  giftCartUrl,
  kr,
} from "@/lib/commerce";
import { DEFAULT_LOCALE, t, type Locale } from "@/lib/i18n";

/**
 * Ét gavekort, samme beløb, samme navn — alle indgange viser hele sættet.
 * Steven S574: "Det bør være det samme og hedde det samme." Det tidligere
 * 3-beløbs-udsnit på Mærket er ophævet; kilden er GIFT_CARDS alene.
 * Ordet kommer fra i18n, så /en/shop siger Gift card, ikke Gavekort.
 */
export function GavekortKoeb({ lang = DEFAULT_LOCALE }: { lang?: Locale } = {}) {
  const c = t(lang).rummet;
  const cards = GIFT_CARDS;
  return (
    <>
      <p className="rum-label" id="gavekort">{c.giftCard}</p>
      <ul className="rum-gave" role="list">
        {cards.map((g) => (
          <li key={g.variantId}>
            <a
              className="rum-book rum-gave__n"
              href={giftCartUrl(g.variantId)}
              rel="noopener noreferrer"
              aria-label={`${c.giftCard} ${kr(g.kr)} kr`}
            >
              {kr(g.kr)}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
