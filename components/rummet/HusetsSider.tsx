/**
 * Stribe mellem husets to interne sider.
 *
 * Begge ligger bevidst uden for navigationen — de er ikke kundens. Men det
 * betød ogsaa at de ikke kendte hinanden: Sonja kunne staa paa afstemningen
 * uden at vide at teamguiden fandtes, og omvendt. Man kom kun ind ved at
 * kende adressen udenad.
 *
 * Striben vises KUN naar man allerede er igennem laasen. Den aabner
 * ingenting; den fortaeller hvad der er derinde.
 */
export function HusetsSider({
  her,
  lang = "da",
}: {
  her: "personale" | "afstemning";
  lang?: "da" | "en";
}) {
  const sider =
    lang === "en"
      ? [
          { id: "personale", navn: "Team guide", sti: "/en/personale" },
          { id: "afstemning", navn: "Reconciliation", sti: "/afstemning" },
        ]
      : [
          { id: "personale", navn: "Teamguide", sti: "/personale" },
          { id: "afstemning", navn: "Afstemning", sti: "/afstemning" },
        ];

  return (
    <nav className="rum-husnav" aria-label={lang === "en" ? "House pages" : "Husets sider"}>
      <span>{lang === "en" ? "The house" : "Husets sider"}</span>
      {sider.map((s) =>
        s.id === her ? (
          <b key={s.id} aria-current="page">
            {s.navn}
          </b>
        ) : (
          <a key={s.id} href={s.sti}>
            {s.navn}
          </a>
        ),
      )}
    </nav>
  );
}
