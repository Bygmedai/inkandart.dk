import { DEFAULT_LOCALE, localePath, t, type Locale } from "@/lib/i18n";

/**
 * Sprogskifter. Peger på SAMME side i det andet sprog — ikke på forsiden.
 * At smide en turist tilbage på forsiden, fordi hun klikkede «English», er
 * den mest almindelige i18n-fejl der findes.
 */
export function LangSwitch({ lang, path }: { lang: Locale; path: string }) {
  const other: Locale = lang === DEFAULT_LOCALE ? "en" : DEFAULT_LOCALE;
  return (
    <a
      href={localePath(other, path)}
      hrefLang={other}
      lang={other}
      className="lang-switch"
      aria-label={other === "en" ? "Read this page in English" : "Læs denne side på dansk"}
    >
      {t(lang).otherLangName}
    </a>
  );
}
