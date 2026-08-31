import type { ArtistTid } from "@/lib/content";
import { tiderListe } from "@/lib/tider";

type Tekster = {
  label: string;
  og: string;
  dag: Record<string, string>;
};

/**
 * Hvornaar en artist er i huset.
 *
 * Dagene kommer fra ordbogen, klokkeslettene fra artists.yml. Derfor kan
 * linjen siges paa engelsk uden at nogen oversaetter «tirsdag» — og uden
 * at et klokkeslet kan drive fra det andet sprog.
 *
 * VIGTIGT: dette er artistens tider, ikke husets aabningstid. De to er
 * ikke det samme, og siden maa ikke faa dem til at ligne hinanden. Er der
 * en konflikt mellem dem, er det en beslutning for et menneske — ikke
 * noget denne komponent skal udglatte.
 */
export function Tider({ tider, t }: { tider: ArtistTid[]; t: Tekster }) {
  const linjer = tiderListe(tider, t);
  if (linjer.length === 0) return null;

  return (
    <div className="rum-artist__tider">
      <p className="rum-label">{t.label}</p>
      <ul className="rum-artist__tider-liste" role="list">
        {linjer.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
