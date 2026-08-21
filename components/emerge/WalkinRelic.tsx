import { walkinCartUrl } from "@/lib/commerce";

/**
 * Walk-in som fundet skilt i heroen — søster til Larsbjørnsstræde-skiltet.
 * Hele fladen er Shopify-checkout (900 kr, to små). Ingen hop via /walk-in.
 */
export function WalkinRelic() {
  return (
    <a
      className="walkin-relic"
      href={walkinCartUrl()}
      aria-label="Walk-in: to små tatoveringer, 900 kr"
    >
      <svg
        className="walkin-relic__sign"
        viewBox="0 0 380 148"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="walkin-wobble" x="-12%" y="-18%" width="124%" height="136%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="97" />
            <feDisplacementMap in="SourceGraphic" scale="3" />
          </filter>
        </defs>
        <g filter="url(#walkin-wobble)">
          <rect x="4" y="4" width="372" height="140" fill="#22333a" stroke="#ddd2bf" strokeWidth="5" />
          <rect x="16" y="16" width="348" height="116" fill="none" stroke="rgba(221,210,191,.4)" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="4" fill="#b8ac97" />
          <circle cx="366" cy="14" r="4" fill="#b8ac97" />
          <circle cx="14" cy="134" r="4" fill="#b8ac97" />
          <circle cx="366" cy="134" r="4" fill="#b8ac97" />
          <text
            x="190"
            y="52"
            textAnchor="middle"
            fill="rgba(221,210,191,.7)"
            fontFamily="var(--font-mono), 'Space Mono', monospace"
            fontSize="13"
            letterSpacing="5"
          >
            WALK-IN
          </text>
          <text
            x="190"
            y="92"
            textAnchor="middle"
            fill="#e8e0d5"
            fontFamily="var(--font-mono), 'Space Mono', monospace"
            fontSize="28"
            letterSpacing="2"
          >
            2 SMÅ · 900
          </text>
          <text
            x="190"
            y="122"
            textAnchor="middle"
            fill="rgba(201,162,39,.85)"
            fontFamily="var(--font-mono), 'Space Mono', monospace"
            fontSize="12"
            letterSpacing="4"
          >
            INGEN BOOKING
          </text>
        </g>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="walkin-relic__swallow"
        src="/emerge/v05/swallow.svg"
        alt=""
        width={80}
        height={70}
      />
    </a>
  );
}
