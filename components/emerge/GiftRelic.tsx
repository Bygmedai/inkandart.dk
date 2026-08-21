/**
 * Gavekortet som fundet objekt i landskabet — ikke en shop-modul.
 * Hele kortet er ét link til /gavekort. Ingen beløb, ingen checkout.
 * Prisen bor på destinationen.
 *
 * Drop-in til SceneV05 (Vildes fil) — booking-zonen, data-drift="0"
 * så motoren ikke flytter et klikbart objekt:
 *
 *   import { GiftRelic } from "./GiftRelic";
 *   <div
 *     className="gift-relic-slot"
 *     data-depth="0.85"
 *     data-drift="0"
 *     style={{position:'absolute',left:'7%',top:'36%',width:'min(38vw,280px)',zIndex:'8'}}
 *   >
 *     <GiftRelic />
 *   </div>
 */
export function GiftRelic() {
  return (
    <a className="gift-relic" href="/gavekort" aria-label="Gavekort — giv blæk videre">
      <article className="gift-voucher gift-voucher--relic">
        <div className="gift-voucher__inset">
          <p className="gift-voucher__meta">Ink &amp; Art · Copenhagen</p>
          <p className="gift-voucher__brand">
            INK <em>&amp;</em> ART
          </p>
          <p className="gift-voucher__line">Giv blæk videre</p>
          <p className="gift-voucher__place">fra 500 kr · Pisserenden</p>
        </div>
        <span className="gift-voucher__stamp">13</span>
      </article>
    </a>
  );
}
