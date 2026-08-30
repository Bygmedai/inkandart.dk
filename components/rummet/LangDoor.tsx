"use client";

import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, enExists, localePath, t, type Locale } from "@/lib/i18n";

/**
 * Sprogdøren i Rummets footer (S574).
 *
 * Rummet havde INGEN vej til engelsk: /en fandtes, men ingen side pegede
 * på den. En turist skulle gætte URL'en. Emerge har haft en LangSwitch
 * hele tiden — Rummet arvede den aldrig, fordi ingen side ejede skallen.
 *
 * To regler, begge lært af tidligere fejl:
 *
 * 1. Døren peger på SAMME side i det andet sprog, aldrig på forsiden.
 * 2. Døren vises KUN når den anden sprogudgave findes. `localePath`
 *    falder tilbage til dansk for ukendte ruter — så et «English» der
 *    lander på en dansk side ville være et løfte vi bryder i klikket.
 *    Ingen dør er bedre end en dør der lyver (rails §4).
 *
 * Stien udledes af pathname i stedet for at blive prop-drillet gennem
 * hver eneste side: så kan den ikke drifte fra den rute brugeren faktisk
 * står på.
 */
export function LangDoor({ lang = DEFAULT_LOCALE }: { lang?: Locale }) {
  const pathname = usePathname() || "/";
  const bare = pathname.startsWith("/en/")
    ? pathname.slice(3)
    : pathname === "/en"
      ? "/"
      : pathname;

  const other: Locale = lang === DEFAULT_LOCALE ? "en" : DEFAULT_LOCALE;

  // Findes den anden udgave? Dansk findes altid; engelsk kun hvor vi
  // faktisk har bygget siden — enExists kender både ruter og familier.
  if (other !== DEFAULT_LOCALE && !enExists(bare)) return null;

  return (
    <a
      className="rum-lang"
      href={localePath(other, bare)}
      hrefLang={other}
      lang={other}
      aria-label={other === "en" ? "Read this page in English" : "Læs denne side på dansk"}
    >
      {t(lang).otherLangName}
    </a>
  );
}
