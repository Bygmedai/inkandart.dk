import type { Metadata } from "next";
import { cookies } from "next/headers";
import { RummetShell } from "@/components/rummet/Shell";
import { GulvetFlade } from "@/components/rummet/GulvetFlade";
import { loadGulvet } from "@/lib/content";
import { gulvetErSat, hentFremdrift, hentFund } from "@/lib/gulvet";
import { VAGT_COOKIE, tokenErGyldigt } from "@/lib/vagt";

export const metadata: Metadata = {
  title: "Gulvet · Ink & Art",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Gulvet — husets oplæringsmåned og logbog. IKKE offentlig: bag den samme
 * kode som afstemningen og teamguiden, og noindex, nofollow, nocache.
 *
 * Hvorfor den ligger her og ikke i et dokument: en oplæringsplan i en fil
 * bliver gammel i seks indbakker, og det Sonja skriver skal kunne læses af
 * andre end hendes egen telefon. Samme begrundelse som teamguiden — men her
 * skrives der også, og derfor er der en database bag (lib/gulvet.ts).
 *
 * Priser, åbningstider og tjeklister står IKKE her. De bor på /personale, og
 * siden linker derhen. Én sandhed, to sider.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GulvetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const c = loadGulvet();
  const jar = await cookies();
  const aaben = await tokenErGyldigt(jar.get(VAGT_COOKIE)?.value);

  if (!aaben) {
    return (
      <RummetShell>
        <main id="main" className="rum-room rum-legal">
          <section className="rum-vagt">
            <h1 className="rum-poster">{c.laas_titel}</h1>
            <p className="rum-body-copy rum-legal__lede">{c.laas_lede}</p>
            <form method="post" action="/api/vagt" className="rum-tjek__form">
              <input type="hidden" name="retur" value="gulvet" />
              <label htmlFor="kode" className="rum-label">
                Kode
              </label>
              <input id="kode" name="kode" type="password" autoComplete="current-password" required />
              <button type="submit" className="rum-book rum-book--row">
                {c.laas_knap}
              </button>
            </form>
            {params.fejl ? (
              <p className="rum-body-copy rum-tjek__svar" role="status">
                {c.laas_fejl}
              </p>
            ) : null}
          </section>
        </main>
      </RummetShell>
    );
  }

  // Uden env er logbogen slukket, ikke åben: programmet og guiderne virker
  // stadig, men fladen siger højt at intet bliver gemt. En knap der lader
  // som om den gemte er værre end en knap der siger den ikke kan.
  const sat = gulvetErSat();
  const [fund, fremdrift] = sat
    ? await Promise.all([hentFund(40), hentFremdrift()])
    : [[], {}];

  return (
    <RummetShell>
      <main id="main">
        {!sat ? (
          <p className="gulv-advarsel gulv-advarsel--top" role="status">
            <strong>Logbogen er ikke sat op endnu.</strong> Du kan læse programmet og guiderne,
            men det du skriver bliver ikke gemt. Sig det til Steven.
          </p>
        ) : null}
        <GulvetFlade c={c} fund={fund} fremdrift={fremdrift} hvem="" />
      </main>
    </RummetShell>
  );
}
