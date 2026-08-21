import { GIFT_CARDS, kr } from "@/lib/commerce";

/**
 * Det fysiske kort. Ren dekoration — beløbene bor i de rigtige links.
 * Hover/fokus på et beløb spejles her via CSS :has() i .gift-stage.
 */
export function GiftVoucher() {
  return (
    <article className="gift-voucher" aria-hidden="true">
      <div className="gift-voucher__inset">
        <p className="gift-voucher__meta">Ink &amp; Art · Copenhagen</p>
        <p className="gift-voucher__brand">
          INK <em>&amp;</em> ART
        </p>
        <p className="gift-voucher__line">Giv blæk videre</p>
        <p className="gift-voucher__value">
          <span className="gift-voucher__hot gift-voucher__hot--default">fra 500 kr</span>
          {GIFT_CARDS.map((g) => (
            <span key={g.kr} className={`gift-voucher__hot gift-voucher__hot--${g.kr}`}>
              {kr(g.kr)} kr
            </span>
          ))}
        </p>
        <p className="gift-voucher__place">Larsbjørnsstræde 13 · Pisserenden</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="gift-voucher__rose"
        src="/emerge/v05/rose.svg"
        alt=""
        width={88}
        height={96}
      />
      <span className="gift-voucher__stamp">13</span>
    </article>
  );
}
