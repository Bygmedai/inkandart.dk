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
        <div className="gift-note__body">
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
        </div>
        <div className="gift-note__foot">
          <p className="gift-note__code">Kode · · · · · · · · · ·</p>
          <p className="gift-voucher__place">Larsbjørnsstræde 13 · Pisserenden</p>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* Bliver på v05 med vilje (Villy, S569). Kassen er låst til 88×96, og
          v06-rosen har forholdet 0,768 — den ville blive maset 19 % fladere.
          En SVG letterboxer i en skæv kasse; en WebP strækkes. Målt i
          browseren, og hegnet i tests/figur-form.test.mjs holder det fast.
          Skal den skiftes, skal kassen samtidig til 88×115 — og det er
          layout i Groks Gift*-lane, ikke en asset-udskiftning. */}
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
