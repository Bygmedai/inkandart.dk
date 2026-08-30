import { loadKontakt } from "@/lib/content";
import { DEFAULT_LOCALE, localePath, t, type Locale } from "@/lib/i18n";
import { LangDoor } from "./LangDoor";

/**
 * Footeren læser husets stamdata fra content/kontakt.yml.
 * Retter Sonja nummeret dér, er det rettet her — og på forsiden,
 * og på artistsiderne. Ingen flade ejer sit eget telefonnummer.
 *
 * S574: etiketterne og linkene følger sidens sprog. `localePath` sørger
 * for at en engelsk side linker til /en/betingelser når den findes — og
 * til den danske når den ikke gør. Hellere dansk end 404.
 */
export function Footer({ lang = DEFAULT_LOCALE }: { lang?: Locale }) {
  const k = loadKontakt();
  const c = t(lang).rummet;
  return (
    <footer className="rum-footer">
      {k.navn} · CVR {k.cvr} ·{" "}
      <a href={`tel:${k.telefon_e164}`}>{k.telefon_vist}</a>
      {" · "}
      <a href={localePath(lang, "/betingelser")}>{c.terms}</a>
      {" · "}
      <a href={localePath(lang, "/privatlivspolitik")}>{c.privacy}</a>
      {" · "}
      <a href={localePath(lang, "/faq")}>{c.faq}</a>
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
      {" · "}
      <LangDoor lang={lang} />
    </footer>
  );
}
