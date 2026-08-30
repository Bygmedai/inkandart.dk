import { Door } from "@/components/rummet/Door";
import type { Nat, NattenCopy } from "@/lib/content";
import { localePath, t, type Locale } from "@/lib/i18n";

/**
 * Natten — én flade, to sprog.
 *
 * Natten er et koncept, ikke kun en kalender. En førstegangsbesøgende
 * skal kunne læse hvad det ER (intro fra natten(.en).yml) — og uden en
 * aktiv nat er sidens job at samle tilmeldinger, ikke at vise et
 * umotiveret foto af en tom sofa (Stevens QA 30/8). Plakaten vises kun
 * når der faktisk er en nat at vise plakat for.
 *
 * Navnet Natten oversættes ikke. Det er husets ord for aftenen.
 */
export function NattenFlade({
  copy,
  nat,
  lang,
}: {
  copy: NattenCopy;
  nat: Nat | null;
  lang: Locale;
}) {
  const c = t(lang).rummet;
  return (
    <main
      id="main"
      lang={lang === "en" ? "en" : undefined}
      className="rum-room rum-natten"
    >
      <h1 className="rum-room__title rum-poster">Natten</h1>
      {copy.intro ? (
        <p className="rum-body-copy rum-natten__intro">{copy.intro}</p>
      ) : null}
      {nat ? (
        <>
          <div className="rum-room__slot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={nat.plakatfoto || "/slots/H-02.jpg"}
              alt={nat.billedtekst || "Nattens plakat"}
            />
          </div>
          <div className="rum-nat__card rum-nat__card--live" style={{ marginTop: 28 }}>
            {nat.dato ? <p className="rum-nat__title rum-poster">{nat.dato}</p> : null}
            <p className="rum-chair__craft" style={{ marginTop: 10 }}>
              {nat.navne.length ? nat.navne.join(" · ") : c.guestDj}
            </p>
            {nat.tidsrum ? (
              <p className="rum-label rum-nat__meta">{nat.tidsrum}</p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="rum-empty" style={{ marginTop: 28 }}>
          <p className="rum-empty__title rum-poster">{copy.tom_titel}</p>
          {copy.tom_linje ? (
            <p className="rum-body-copy" style={{ marginTop: 12 }}>
              {copy.tom_linje}
            </p>
          ) : null}
        </div>
      )}
      <Door variant="inline" lang={lang} />
      <div className="rum-natten__out">
        <a href={localePath(lang, "/booking")} className="rum-book">
          {c.bookTid}
        </a>
        <a href={localePath(lang, "/gaden")} className="rum-book">
          Gaden
        </a>
      </div>
    </main>
  );
}
