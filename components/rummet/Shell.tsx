import { SkipLink } from "@/components/i18n/SkipLink";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Door } from "./Door";
import "./rummet.css";

/**
 * Rummets skal. `lang` er hele fladens sprog — ikke en oversættelse af
 * indholdet, men skallens eget sprog: skip-link, nav, footer og
 * Blackbook-døren.
 *
 * Før S574 var skallen dansk uanset siden. En engelsk kunde på /en mødte
 * «Betingelser · Privatliv» i footeren og blev sendt til danske sider
 * midt i købsrejsen (Sirius' fund #5). Nu følger skallen siden.
 *
 * Rumnavnene i navigationen oversættes ikke: Stolen, Mærket, Natten og
 * Gaden er husets egennavne.
 */
export function RummetShell({
  children,
  door = true,
  tone = "nat",
  lang = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  door?: boolean;
  tone?: "nat" | "salg";
  lang?: Locale;
}) {
  return (
    <div data-house="rummet" data-rummet="" data-tone={tone}>
      <SkipLink lang={lang} />
      <Nav lang={lang} />
      <div className="rum-main">{children}</div>
      {door ? <Door lang={lang} /> : null}
      <Footer lang={lang} />
    </div>
  );
}
