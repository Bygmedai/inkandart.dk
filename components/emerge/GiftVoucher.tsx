/* eslint-disable @next/next/no-img-element */
import { kr } from "@/lib/commerce";

const SHOWN = [500, 1000, 1500, 2000, 3000] as const;

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
          {SHOWN.map((n) => (
            <span key={n} className={`gift-voucher__hot gift-voucher__hot--${n}`}>
              {kr(n)} kr
            </span>
          ))}
        </p>
        <p className="gift-voucher__place">Larsbjørnsstræde 13 · Pisserenden</p>
      </div>
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
