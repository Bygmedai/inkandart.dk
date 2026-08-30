import { loadKontakt } from "@/lib/content";

/**
 * Footeren læser husets stamdata fra content/kontakt.yml.
 * Retter Sonja nummeret dér, er det rettet her — og på forsiden,
 * og på artistsiderne. Ingen flade ejer sit eget telefonnummer.
 */
export function Footer() {
  const k = loadKontakt();
  return (
    <footer className="rum-footer">
      {k.navn} · CVR {k.cvr} ·{" "}
      <a href={`tel:${k.telefon_e164}`}>{k.telefon_vist}</a>
      {" · "}
      <a href="/betingelser">Betingelser</a>
      {" · "}
      <a href="/privatlivspolitik">Privatliv</a>
      {" · "}
      <a href="/faq">FAQ</a>
      {" · "}
      <a href={`mailto:${k.email}`}>{k.email}</a>
      {k.instagram ? (
        <>
          {" · "}
          <a href={`https://www.instagram.com/${k.instagram}/`} rel="noopener noreferrer">
            @{k.instagram}
          </a>
        </>
      ) : null}
    </footer>
  );
}
