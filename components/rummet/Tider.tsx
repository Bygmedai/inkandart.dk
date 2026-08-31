import type { ArtistTid } from "@/lib/content";

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
  if (tider.length === 0) return null;

  const dagerække = (dage: string[]): string => {
    const navne = dage.map((d) => t.dag[d]).filter(Boolean);
    if (navne.length === 0) return "";
    if (navne.length === 1) return navne[0];
    return `${navne.slice(0, -1).join(", ")} ${t.og} ${navne[navne.length - 1]}`;
  };

  // Kun linjens foerste tegn stort-skrives. Ordbogen holder dagene som de
  // ser ud midt i en saetning — smaa paa dansk, store paa engelsk — saa
  // den ene regel giver korrekt sprog begge steder.
  const stort = (l: string) => l.charAt(0).toUpperCase() + l.slice(1);

  const linjer = tider
    .map((r) => {
      const dage = dagerække(r.dage);
      return dage ? stort(`${dage} ${r.fra}–${r.til}`) : "";
    })
    .filter(Boolean);

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
