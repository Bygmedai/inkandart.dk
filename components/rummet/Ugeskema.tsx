import { Fragment } from "react";
import { UGEN, type Skema } from "@/lib/content";
import { localePath, t, type Locale } from "@/lib/i18n";

/**
 * Ugen i stolen — hvem der er her hvilke dage (Villy, 5/10).
 *
 * Kilden er content/skema.yml, den samme som appen henter via /api/huset.
 * Dagene kommer fra ordbogen; navnene fra skemaet. Har personen en
 * artistside, linker navnet dertil — ellers står navnet alene, aldrig et
 * link der ender i en 404.
 *
 * Ingen «i dag»-markering her: siden bygges statisk, så «i dag» ville være
 * byggedagen. Appen viser dagen; sitet viser ugen.
 */
export function Ugeskema({ skema, lang = "da" }: { skema: Skema; lang?: Locale }) {
  const dag = t(lang).rummet.tider.dag as Record<string, string>;
  const titel = lang === "en" ? skema.titel_en : skema.titel;
  const note = lang === "en" ? skema.note_en : skema.note;
  const og = t(lang).rummet.tider.og;

  return (
    <section className="rum-skema" aria-labelledby="rum-skema-titel">
      <h2 id="rum-skema-titel" className="rum-label">{titel}</h2>
      <dl className="rum-skema__uge">
        {UGEN.map((d) => {
          const folk = skema.dage[d];
          const navn = dag[d] ?? d;
          return (
            <div key={d} className="rum-skema__dag">
              <dt>{navn.charAt(0).toUpperCase() + navn.slice(1)}</dt>
              <dd>
                {folk.map((p, i) => (
                  <Fragment key={p.id}>
                    {i > 0 ? (i === folk.length - 1 ? ` ${og} ` : ", ") : null}
                    {p.profil ? <a href={localePath(lang, `/stolen/${p.id}`)}>{p.navn}</a> : p.navn}
                  </Fragment>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
      {note ? <p className="rum-fact">{note}</p> : null}
    </section>
  );
}
