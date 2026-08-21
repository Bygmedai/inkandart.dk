/**
 * Collage i Under gaden — et stykke tape med tusch. Altid synligt, aldrig
 * en dør: pointer-events none, aria-hidden. Inline SVG, nul nye requests.
 */
export function GadeTape() {
  return (
    <svg
      className="gade-tape"
      viewBox="0 0 280 168"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="tape-wobble" x="-12%" y="-18%" width="124%" height="136%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="13" />
          <feDisplacementMap in="SourceGraphic" scale="3.4" />
        </filter>
      </defs>
      <g filter="url(#tape-wobble)" transform="rotate(-7 140 84)">
        <rect x="8" y="18" width="264" height="132" fill="#cbb896" stroke="#0d0a08" strokeWidth="2.4" />
        <rect x="14" y="24" width="252" height="120" fill="none" stroke="rgba(13,10,8,.28)" strokeWidth="1.1" />
        <path d="M22 28 H50 M230 138 H258" stroke="#8b1e1e" strokeWidth="6" strokeLinecap="square" />
        <g className="gade-tape__da">
          <text x="140" y="68" textAnchor="middle" fill="#17110e" fontFamily="var(--font-mono), 'Space Mono', monospace" fontSize="28" letterSpacing="6">TUSSE</text>
          <text x="140" y="104" textAnchor="middle" fill="#8b1e1e" fontFamily="var(--font-mono), 'Space Mono', monospace" fontSize="18" letterSpacing="4">IKKE TERAPI</text>
        </g>
        <g className="gade-tape__en">
          <text x="140" y="68" textAnchor="middle" fill="#17110e" fontFamily="var(--font-mono), 'Space Mono', monospace" fontSize="26" letterSpacing="5">INK</text>
          <text x="140" y="104" textAnchor="middle" fill="#8b1e1e" fontFamily="var(--font-mono), 'Space Mono', monospace" fontSize="16" letterSpacing="3">NOT THERAPY</text>
        </g>
        <text x="140" y="132" textAnchor="middle" fill="rgba(23,17,14,.55)" fontFamily="var(--font-mono), 'Space Mono', monospace" fontSize="9" letterSpacing="3.4">PISSERENDEN 13</text>
        <circle cx="248" cy="36" r="7" fill="none" stroke="#8b1e1e" strokeWidth="1.6" />
      </g>
    </svg>
  );
}
