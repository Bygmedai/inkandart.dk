import type { ReactNode } from "react";
import { t, type Locale } from "@/lib/i18n";

/**
 * Husets maerke i toppen af hver underside — og vejen hjem.
 *
 * Baggrunden (Villy, S569): der var fire forskellige moenstre oeverst paa
 * undersiderne, og to sider — /gavekort/giv og /gavekort/kort — havde ingen
 * vej hjem overhovedet. Midt i gavekort-flowet. En kunde der landede der,
 * var fanget.
 *
 * Seglet er derfor baade maerket og doeren. Det er lille med vilje
 * (kriterium 5): et anker, ikke en overskrift — sidens eget emne skal stadig
 * vinde. Tap-maalet er 48px, over WCAG 2.2 SC 2.5.8's 24px.
 *
 * `hjem` peger paa /en for engelske sider, saa man ikke smides over i dansk
 * ved at trykke paa maerket (kriterium 4).
 */
export function Masthead({ lang, children }: { lang: Locale; children?: ReactNode }) {
  const c = t(lang);
  const hjem = lang === "en" ? "/en" : "/";
  return (
    <p className="masthead">
      <a className="masthead__segl" href={hjem} aria-label={c.mastheadAria}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-segl.svg" alt="" width={376} height={376} />
      </a>
      {children}
    </p>
  );
}
