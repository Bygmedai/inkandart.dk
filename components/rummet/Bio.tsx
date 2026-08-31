import type { Locale } from "@/lib/i18n";

/**
 * En artists bio, med afsnittene i behold.
 *
 * Bio'en lå i ét `<p>`, og det var rigtigt så længe teksten var ét afsnit.
 * Stevens kendelse 31/8 gjorde Nizars bio til TRE afsnit — og i HTML
 * kollapser et linjeskift, så teksten ville løbe sammen til én klump uden
 * at nogen test gik rød og uden at nogen havde besluttet det.
 *
 * Derfor: ét `<p>` pr. afsnit. `.rum-artist__bio` har allerede
 * `margin-top: 18px`, så luften mellem afsnittene kommer af sig selv.
 *
 * Teksten røres ikke — kun opdelt. En bio er et menneskes egne ord, og vi
 * hverken skriver, forkorter eller oversætter den (CLAUDE.md / S574).
 */
export function Bio({ tekst, lang }: { tekst: string; lang?: Locale }) {
  const afsnit = tekst
    .split(/\n\s*\n/)
    .map((a) => a.trim())
    .filter(Boolean);

  if (afsnit.length === 0) return null;

  return (
    <>
      {afsnit.map((a, i) => (
        <p key={i} className="rum-body-copy rum-artist__bio" lang={lang}>
          {a}
        </p>
      ))}
    </>
  );
}
