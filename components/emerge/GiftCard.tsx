import { GIFT_CARDS, GIFT_CARD_PRODUCT_URL, giftCartUrl, kr } from "@/lib/commerce";
import { site } from "@/lib/site";
import { GiftVoucher } from "./GiftVoucher";

/** Atmosfærisk rækkevidde — ikke en prisliste. */
const REACH: Record<number, string> = {
  500: "Et smykke. En lille start.",
  1000: "En session der kan blive til noget.",
  1500: "Plads til at sidde i stolen.",
  2000: "Et stykke der bliver.",
  3000: "Vælg frit. Rest gemmes.",
};

const SHARE_TEXT = `Giv blæk videre — et gavekort til Ink & Art Copenhagen.\n${site.url}/gavekort`;
const SHARE_WA = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`;

/**
 * Gavekort-flade i Emerge-udtrykket. Server-renderet — rene <a>-links til
 * Shopify-checkout (cart-permalink), så den virker uden JS og uden at sitet
 * rører penge. Kortet er objektet; beløbene er stemplerne man trykker.
 *
 * To købsstier, samme produkt:
 *   beløb-stempel → cart-permalink (koden lander hos køberen)
 *   "Send som gave" → Shopify-produktsiden, hvor "Modtagerens mail" allerede lever
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
                <span className="gift-denom__reach">{REACH[g.kr] ?? "Veksles når der betales."}</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="gift-share">
          <a
            href={GIFT_CARD_PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Send som gave — koden lander i modtagerens mail (åbner i nyt vindue)"
          >
            Send som gave →
          </a>
          <a
            href={SHARE_WA}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Send linket i WhatsApp (åbner i nyt vindue)"
          >
            Send linket i WhatsApp →
          </a>
        </p>
        <p className="mt-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
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
