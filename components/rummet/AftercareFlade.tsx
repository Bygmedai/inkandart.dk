import type { AftercareCopy } from "@/lib/content";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

/**
 * Aftercare — én flade, to sprog. Ordene bor i content/aftercare(.en).yml.
 *
 * Trinnene nummereres af koden (01, 02, …), ikke af teksten: så kan et
 * trin skrives ind eller ud i Decap uden at nogen skal huske at rette
 * rækkefølgen bagefter.
 */
export function AftercareFlade({
  copy,
  lang,
}: {
  copy: AftercareCopy;
  lang: Locale;
}) {
  const liste = (trin: AftercareCopy["tattoo"]) => (
    <ol>
      {trin.map((step, i) => (
        <li key={step.t}>
          <span className="rum-label">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3>{step.t}</h3>
            <p className="rum-body-copy">{step.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <main
      id="main"
      lang={lang === "en" ? "en" : undefined}
      className="rum-legal"
    >
      <p className="rum-label">{copy.file}</p>
      <h1 className="rum-poster">{copy.titel}</h1>
      <p className="rum-body-copy rum-room__note">{copy.lead}</p>

      <section>
        <h2 className="rum-poster">{copy.tattoo_titel}</h2>
        {liste(copy.tattoo)}
      </section>

      <section>
        <h2 className="rum-poster">{copy.piercing_titel}</h2>
        {liste(copy.piercing)}
      </section>

      <aside className="rum-empty" style={{ marginTop: 48 }}>
        <p className="rum-label">{copy.tvivl_label}</p>
        <p className="rum-body-copy" style={{ marginTop: 12 }}>
          {copy.tvivl}
        </p>
        <a
          className="rum-book"
          style={{ marginTop: 20 }}
          href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.skriv_cta}
        </a>
      </aside>
    </main>
  );
}
