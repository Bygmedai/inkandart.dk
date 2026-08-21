import { kr } from "@/lib/commerce";
import type { GiftNote } from "@/lib/gift-note";

/**
 * Kortet man giver. Til/fra/hilsen er query — koden skrives i hånden
 * (den lander i køberens Shopify-mail, aldrig i URL'en).
 */
export function GiftNoteCard({ note }: { note: GiftNote }) {
  return (
    <article className="gift-voucher gift-voucher--note">
      <div className="gift-voucher__inset">
        <p className="gift-voucher__meta">Ink &amp; Art · Copenhagen</p>
        <p className="gift-voucher__brand">
          INK <em>&amp;</em> ART
        </p>
        <p className="gift-voucher__line">Giv blæk videre</p>
        {note.til ? (
          <p className="gift-note__to">
            Til <em>{note.til}</em>
          </p>
        ) : null}
        {note.hilsen ? <p className="gift-note__hello">{note.hilsen}</p> : null}
        {note.fra ? (
          <p className="gift-note__from">
            Fra <em>{note.fra}</em>
          </p>
        ) : (
          <p className="gift-voucher__value">fra {kr(500)} kr</p>
        )}
        <p className="gift-note__code">Kode · · · · · · · · · ·</p>
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
