import type { BookingCopy } from "@/lib/content";
import type { DepositumStatus } from "@/lib/depositum";

/**
 * Opslags-formen på tak-siden: skriv ordrenummeret, få det rigtige svar.
 *
 * Den er en almindelig GET-form uden JavaScript. Det er ikke nøjsomhed —
 * husreglen siger at handelsflader skal virke uden JS, og det her er den
 * flade en kunde står med ved disken når hun er i tvivl. En form der
 * kræver JS ville fejle præcis dér.
 *
 * Svaret kommer fra Shopify, ikke fra URL'en. Derfor kan siden sige
 * «betalt» og mene det.
 */
export function DepositumTjek({
  copy,
  status,
  ordre,
  action,
}: {
  copy: BookingCopy;
  status: DepositumStatus | null;
  ordre: string;
  action: string;
}) {
  const svar: Record<DepositumStatus, string> = {
    betalt: copy.svar_betalt,
    ikke_betalt: copy.svar_ikke_betalt,
    ukendt: copy.svar_ukendt,
    ugyldigt: copy.svar_ugyldigt,
    kan_ikke_tjekke: copy.svar_kan_ikke_tjekke,
  };

  return (
    <section className="rum-tjek" aria-labelledby="tjek">
      <h2 id="tjek" className="rum-label">
        {copy.tjek_titel}
      </h2>
      <p className="rum-body-copy">{copy.tjek_hjaelp}</p>
      <form method="get" action={action} className="rum-tjek__form">
        <label htmlFor="ordre" className="rum-label">
          #
        </label>
        <input
          id="ordre"
          name="ordre"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          defaultValue={ordre}
        />
        <button type="submit" className="rum-book rum-book--row">
          {copy.tjek_knap}
        </button>
      </form>
      {status ? (
        <p
          className="rum-body-copy rum-tjek__svar"
          data-status={status}
          role="status"
        >
          {svar[status]}
        </p>
      ) : null}
    </section>
  );
}
