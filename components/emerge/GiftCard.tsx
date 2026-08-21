import { GIFT_CARDS, giftCartUrl, kr } from "@/lib/commerce";
import { site } from "@/lib/site";
import { GiftVoucher } from "./GiftVoucher";

/** Atmosfærisk rækkevidde — ikke en prisliste. */
const REACH: Record<number, string> = {
  100: "En lille gestus.",
  250: "Et smykke. En start.",
  500: "Et smykke. En lille start.",
  1000: "En session der kan blive til noget.",
  1500: "Plads til at sidde i stolen.",
  2000: "Et stykke der bliver.",
  3000: "Vælg frit. Rest gemmes.",
  4000: "Plads til det hele.",
};

const SHARE_TEXT = `Giv blæk videre — et gavekort til Ink & Art Copenhagen.\n${site.url}/gavekort`;
const SHARE_WA = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`;

/**
 * Gavekort-flade. Server-renderet cart-permalinks — ingen Shopify-produktside
 * (den er password-gated). Gaveøjeblikket bor på /gavekort/giv.
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
          <a href="/gavekort/giv">Giv det videre →</a>
          <a
            href={SHARE_WA}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Send linket i WhatsApp (åbner i nyt vindue)"
          >
            Send linket i WhatsApp →
          </a>
        </p>
      </section>
    </div>
  );
}
