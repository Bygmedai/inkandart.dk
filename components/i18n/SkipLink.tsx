import { t, type Locale } from "@/lib/i18n";

/**
 * Skip-linket bor pr. side, ikke i layoutet.
 *
 * Grunden er målt: et `headers()`-opslag i root-layoutet (for at kende sproget)
 * gjorde HVER eneste rute dynamisk — hele sitet mistede statisk generering.
 * På en forside der allerede måler 0,68 i Lighthouse er det ikke en pris værd
 * at betale for ét ord. Så sproget kommer fra siden, og layoutet forbliver koldt.
 */
export function SkipLink({ lang }: { lang: Locale }) {
  return (
    <a href="#main" className="skip-link">
      {t(lang).skipToContent}
    </a>
  );
}
