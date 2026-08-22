import { localePath, t, type Locale } from "@/lib/i18n";
/**
 * Gavekortet som fundet objekt i landskabet.
 * Samme sprog som gadeskiltet: turbulence, nitte, dobbeltramme.
 * Hele fladen linker til /gavekort — ingen beløb, ingen checkout.
 */
export function GiftRelic({ lang = "da" }: { lang?: Locale } = {}) {
  return (
    <a className="gift-relic" href={localePath(lang, "/gavekort")} aria-label={t(lang).giftRelicAria}>
      <span className="gift-relic__stack" aria-hidden="true" />
      <svg
        className="gift-relic__card"
        viewBox="0 0 380 240"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="gift-wobble" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" seed="41" />
            <feDisplacementMap in="SourceGraphic" scale="3.2" />
          </filter>
          <linearGradient id="gift-paper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a1814" />
            <stop offset="0.48" stopColor="#14100e" />
            <stop offset="1" stopColor="#0c0908" />
          </linearGradient>
          <linearGradient id="gift-foil" x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0" stopColor="#8a7018" />
            <stop offset="0.45" stopColor="#e4c45a" />
            <stop offset="1" stopColor="#c9a227" />
          </linearGradient>
        </defs>
        <g filter="url(#gift-wobble)">
          <rect
            x="7"
            y="7"
            width="366"
            height="226"
            fill="url(#gift-paper)"
            stroke="url(#gift-foil)"
            strokeWidth="3.2"
          />
          <rect
            x="20"
            y="20"
            width="340"
            height="200"
            fill="none"
            stroke="rgba(201,162,39,.38)"
            strokeWidth="1.15"
          />
          <circle cx="17" cy="17" r="3.6" fill="#c9a227" />
          <circle cx="363" cy="17" r="3.6" fill="#c9a227" />
          <circle cx="17" cy="223" r="3.6" fill="#c9a227" />
          <circle cx="363" cy="223" r="3.6" fill="#c9a227" />
          <text
            x="36"
            y="52"
            fill="rgba(232,224,213,.55)"
            fontFamily="var(--font-mono), 'Space Mono', monospace"
            fontSize="11"
            letterSpacing="3.4"
          >
            INK &amp; ART · COPENHAGEN
          </text>
          <text
            x="36"
            y="118"
            fill="#e8e0d5"
            fontFamily="var(--font-display), 'Cormorant Garamond', serif"
            fontSize="42"
            letterSpacing="3"
            fontWeight="500"
          >
            INK &amp; ART
          </text>
          <text
            x="36"
            y="158"
            fill="#c9a227"
            fontFamily="var(--font-display), 'Cormorant Garamond', serif"
            fontSize="26"
            fontStyle="italic"
          >
            Giv blæk videre
          </text>
          <text
            x="36"
            y="204"
            fill="rgba(232,224,213,.5)"
            fontFamily="var(--font-mono), 'Space Mono', monospace"
            fontSize="11"
            letterSpacing="2.8"
          >
            LARSBJØRNSSTRÆDE 13
          </text>
          <rect
            x="318"
            y="28"
            width="32"
            height="32"
            fill="none"
            stroke="#8b1e1e"
            strokeWidth="1.4"
            transform="rotate(8 334 44)"
          />
          <text
            x="334"
            y="50"
            textAnchor="middle"
            fill="#c45a5a"
            fontFamily="var(--font-display), 'Cormorant Garamond', serif"
            fontSize="16"
            fontStyle="italic"
          >
            13
          </text>
        </g>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="gift-relic__seal"
        src="/emerge/v05/rose.svg"
        alt=""
        width={88}
        height={96}
      />
    </a>
  );
}
