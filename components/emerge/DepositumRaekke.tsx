import { cartUrl, kr, type Deposit } from "@/lib/commerce";

/**
 * En række depositum-kort — husets ene købsflade for «hold en plads».
 *
 * Hvorfor en komponent og ikke markup på hver side: piercing (4 kort) og
 * flash-tider (2 kort) er samme handling med forskellige ord, og de skal se
 * ens ud på dansk og engelsk. Copy'en kommer ind som funktioner, så laget
 * her ikke kender til sprog — variant-ID'erne bor i commerce.ts, sætningerne
 * i i18n.ts, og denne fil kender kun formen.
 *
 * Kundetesten (S568) styrer udseendet: «knapperne skal være større og mere
 * tydelige». Derfor er hele kortet ikke klikbart-men-utydeligt — der er ét
 * fyldt, guldfarvet felt med et verbum OG prisen i, mindst 56px højt. Prisen
 * står på knappen, ikke ved siden af: man skal ikke lede efter hvad den koster.
 *
 * Server-komponent (rails §5: ingen `use client` på handelsflader). Virker
 * uden JS — det er et almindeligt link til Shopify-checkout.
 */
export function DepositumRaekke({
  varer,
  sted,
  ariaSted,
  koeb,
  aria,
}: {
  varer: Deposit[];
  /**
   * id → stednavn i brugerens sprog ("Øre", "Ear", "På Module", …).
   *
   * Tabellen kommer ind som den er, ikke som en opslags-funktion. Første
   * udgave gjorde det omvendt, og hvert kaldsted måtte skrive
   * `slots[id as keyof typeof slots]` — et kast der tier TypeScript og
   * returnerer `undefined` i drift hvis et id ikke matcher (QA #177). Nu
   * er der intet kast at skrive, og et manglende ord viser sit eget id
   * i stedet for ordet «undefined». Hegnet i tests/koebsflader.test.mjs
   * fanger stadig manglen i CI — men fejlen kan ikke længere nå brugeren.
   */
  sted: Record<string, string>;
  /** id → samme sted, bøjet så det kan HØRES i en sætning ("øret"). */
  ariaSted: Record<string, string>;
  /** Verbet på knappen ("Hold plads" / "Hold a slot"). */
  koeb: string;
  /** Skærmlæser-sætningen. Knappens synlige tekst er kort med vilje. */
  aria: (sted: string, pris: string) => string;
}) {
  return (
    <ul className="depot" role="list">
      {varer.map((v) => {
        const navn = sted[v.id] ?? v.id;
        return (
          <li key={v.variantId} className="depot__kort">
            <span className="depot__sted">{navn}</span>
            <a
              className="depot__koeb"
              href={cartUrl(v.variantId)}
              aria-label={aria(ariaSted[v.id] ?? navn, kr(v.kr))}
              data-hz-handle={v.id}
              data-hz-pris={v.kr}
            >
              <span className="depot__verbum">{koeb}</span>
              <span className="depot__pris">{kr(v.kr)},-</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
