import type { Piercingpriser } from "@/lib/content";

/**
 * Prislisten. Ét tal pr. linje, hentet fra content/piercing-priser.yml —
 * samme tal paa begge sprog, fordi det kun findes ét sted.
 *
 * TABELLEN scroller vandret i sin EGEN beholder; siden goer ikke (Harukis
 * krav, og husets perf/a11y-gate: en side der scroller vandret paa mobil
 * er en side man taber sit sted i).
 *
 * `tabular-nums` paa tallene, saa kolonnen staar lige uanset om der staar
 * 50 eller 899.
 *
 * En rigtig <table> og ikke et grid: det ER tabeldata, og en skaermlaeser
 * skal kunne sige «Septum, 499 kroner» frem for to loesrevne celler.
 */
export function Prisliste({ priser }: { priser: Piercingpriser }) {
  if (priser.grupper.length === 0) return null;

  return (
    <div className="rum-priser">
      {priser.intro ? (
        <p className="rum-body-copy rum-priser__intro">{priser.intro}</p>
      ) : null}

      {priser.grupper.map((g) => (
        <section key={g.gruppe} className="rum-priser__gruppe">
          <h2 className="rum-label">{g.gruppe}</h2>
          <div className="rum-priser__rulle">
            <table className="rum-priser__tabel">
              <tbody>
                {g.linjer.map((l) => (
                  <tr key={l.navn}>
                    <th scope="row">{l.navn}</th>
                    <td className="rum-priser__tal">{l.pris}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {priser.tillaeg.length > 0 ? (
        <section className="rum-priser__gruppe">
          <div className="rum-priser__rulle">
            <table className="rum-priser__tabel">
              <tbody>
                {priser.tillaeg.map((l) => (
                  <tr key={l.navn}>
                    <th scope="row">{l.navn}</th>
                    <td className="rum-priser__tal">{l.pris}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {priser.note ? (
        <p className="rum-body-copy rum-priser__note">{priser.note}</p>
      ) : null}
    </div>
  );
}
