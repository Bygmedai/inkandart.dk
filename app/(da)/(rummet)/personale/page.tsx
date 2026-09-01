import type { Metadata } from "next";
import { cookies } from "next/headers";
import { RummetShell } from "@/components/rummet/Shell";
import { TeamguideFlade } from "@/components/rummet/TeamguideFlade";
import { loadTeamguide, loadKontakt, loadAabningstider, loadPiercingpriser } from "@/lib/content";
import { t } from "@/lib/i18n";
import { tiderListe } from "@/lib/tider";
import { VAGT_COOKIE, tokenErGyldigt } from "@/lib/vagt";

export const metadata: Metadata = {
  title: "Teamguide · Ink & Art",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Husets teamguide. IKKE offentlig — bag den samme kode som afstemningen,
 * og noindex, nofollow, nocache, saa den hverken kan slaas op eller findes.
 *
 * Den ligger paa sitet i stedet for i en fil der sendes rundt, fordi en fil
 * der sendes rundt bliver gammel i seks indbakker. Her er der én udgave.
 *
 * Aabningstider og piercingpriser HENTES fra aabningstider.yml og
 * piercing-priser.yml — de skrives ikke af. Det er hele grunden til at
 * guiden hoerer hjemme her og ikke i et dokument: aendrer huset en tid,
 * aendrer guiden sig med.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PersonalePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const c = loadTeamguide();
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
              <input type="hidden" name="retur" value="personale" />
              <label htmlFor="kode" className="rum-label">
                Kode
              </label>
              <input
                id="kode"
                name="kode"
                type="password"
                autoComplete="current-password"
                required
              />
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

  const kontakt = loadKontakt();
  return (
    <RummetShell>
      <main id="main">
        <TeamguideFlade
          c={c}
          tider={tiderListe(loadAabningstider(), t("da").rummet.tider)}
          kontakt={{
            adresse: kontakt.adresse,
            telefon_vist: kontakt.telefon_vist,
            telefon_e164: kontakt.telefon_e164,
            mail: kontakt.email,
            instagram: kontakt.instagram,
          }}
          priser={loadPiercingpriser("da").grupper}
          retur="personale"
          ordAf="af"
          ordNulstil="Nulstil"
        />
      </main>
    </RummetShell>
  );
}
