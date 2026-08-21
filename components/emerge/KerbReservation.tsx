import { RESERVATIONS, cartUrl, kr } from "@/lib/commerce";
import { site } from "@/lib/site";

/**
 * Kantstenen som venteværelse — reservationen kridtet på fortovet.
 *
 * Grebet kommer fra zonens eget sprog: legend-båndet ovenover siger allerede
 * «KANTSTENEN ER VORES VENTEVÆRELSE». Så pladsen bliver kridtet dér, som når
 * nogen sætter kryds på asfalten for at holde en plads. Ingen knapper i
 * gaden — fundne mærker der tilfældigvis er døre til checkout.
 *
 * Server-komponent (rails §5: ingen `use client` på handelsflader). Kridtet
 * er ren markup + inline SVG; virker uden JS, og uden motoren.
 */

/** Håndtegnet ramme — fire streger der ikke helt mødes, som kridt gør. */
function ChalkFrame({ seed }: { seed: number }) {
  const id = `kerb-chalk-${seed}`;
  return (
    <svg
      className="kerb__frame"
      viewBox="0 0 320 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id={id} x="-10%" y="-18%" width="120%" height="136%">
          <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="3" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="4.5" />
        </filter>
      </defs>
      <g
        filter={`url(#${id})`}
        fill="none"
        stroke="rgba(232,224,213,.5)"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        {/* strøgene overskyder hjørnerne en anelse — hånd, ikke lineal */}
        <path d="M9 13 H309" />
        <path d="M311 11 V107" />
        <path d="M313 106 H12" />
        <path d="M11 109 V15" />
      </g>
    </svg>
  );
}

export function KerbReservation() {
  return (
    <div className="kerb">
      <p className="kerb__legend">Kantstenen er vores venteværelse</p>

      <ul className="kerb__marks" role="list">
        {RESERVATIONS.map((r, i) => (
          <li key={r.variantId} className="kerb__slot">
            <a className="kerb__mark" href={cartUrl(r.variantId)} aria-label={r.aria}>
              <ChalkFrame seed={i === 0 ? 41 : 83} />
              <span className="kerb__text">
                <span className="kerb__label">{r.label}</span>
                <span className="kerb__amount">{kr(r.kr)},-</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Ærligt: depositummet holder pladsen — tiden aftales bagefter. */}
      <p className="kerb__note">
        Trækkes fra prisen. Tiden aftaler vi bagefter —{" "}
        <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer">
          book
        </a>{" "}
        eller ring{" "}
        <a href={`tel:${site.phoneIntl}`} aria-label={`Ring til ${site.name}, ${site.phone}`}>
          {site.phone}
        </a>
        .
      </p>
    </div>
  );
}
