import type { Metadata } from "next";
import { cookies } from "next/headers";
import { RummetShell } from "@/components/rummet/Shell";
import { HusetsSider } from "@/components/rummet/HusetsSider";
import { depositumVarianter } from "@/lib/commerce";
import { depositumOrdrer } from "@/lib/depositum";
import { VAGT_COOKIE, VAGT_TIMER, tokenErGyldigt } from "@/lib/vagt";

export const metadata: Metadata = {
  title: "Afstemning · Ink & Art",
  robots: { index: false, follow: false, nocache: true },
};

/** Siden viser kundedata. Den må aldrig caches, hverken hos os eller hos Vercel. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

function Laas({ fejl }: { fejl: boolean }) {
  return (
    <section className="rum-vagt">
      <h1 className="rum-poster">Afstemning</h1>
      <p className="rum-body-copy rum-legal__lede">
        Husets side. Skriv koden for at se depositum-betalingerne.
      </p>
      <form method="post" action="/api/vagt" className="rum-tjek__form">
        <input type="hidden" name="retur" value="afstemning" />
        <label htmlFor="kode" className="rum-label">
          Kode
        </label>
        <input id="kode" name="kode" type="password" autoComplete="current-password" required />
        <button type="submit" className="rum-book rum-book--row">
          Luk op
        </button>
      </form>
      {fejl ? (
        <p className="rum-body-copy rum-tjek__svar" role="status">
          Koden passer ikke. Spørg Steven.
        </p>
      ) : null}
    </section>
  );
}

function dansk(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("da-DK", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Copenhagen",
  }).format(d);
}

/**
 * Afstemningen: hvem har betalt et depositum?
 *
 * Book.dk har hverken API eller webhooks (målt 30/8), så koden kan ikke
 * se kalenderen. Den halvdel er derfor Sonjas: hun holder listen her op
 * mod bookingerne og ringer til dem der har betalt uden at booke.
 *
 * Siden viser KUN det matchningen kræver — nummer, tid, mail, beløb.
 * Ikke navn, ikke telefon, ikke adresse. Mindre på skærmen i en butik
 * hvor kunder står ved disken.
 */
export default async function AfstemningPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const jar = await cookies();
  const aaben = await tokenErGyldigt(jar.get(VAGT_COOKIE)?.value);

  if (!aaben) {
    return (
      <RummetShell door={false}>
        <main id="main" className="rum-room rum-legal">
          <Laas fejl={params.fejl === "1"} />
        </main>
      </RummetShell>
    );
  }

  const { ok, ordrer } = await depositumOrdrer(depositumVarianter());

  return (
    <RummetShell door={false}>
      <main id="main" className="rum-room rum-legal">
        <p className="rum-label">Huset</p>
        <HusetsSider her="afstemning" />
        <h1 className="rum-poster">Afstemning</h1>
        <p className="rum-body-copy rum-legal__lede">
          Depositum-betalinger de seneste 60 dage. Hold dem op mod
          bookingerne i Book.dk og match på mailadressen. Er der betalt
          uden en booking, så ring til kunden.
        </p>

        {!ok ? (
          <div className="rum-empty" style={{ marginTop: 24 }}>
            <p className="rum-empty__title rum-poster">Kan ikke hente listen</p>
            <p className="rum-body-copy" style={{ marginTop: 12 }}>
              Vi kunne ikke spørge Shopify lige nu. Prøv igen om lidt — og
              brug Shopifys egen ordreliste hvis det haster.
            </p>
          </div>
        ) : ordrer.length === 0 ? (
          <div className="rum-empty" style={{ marginTop: 24 }}>
            <p className="rum-empty__title rum-poster">Ingen depositum-betalinger endnu</p>
          </div>
        ) : (
          <div className="rum-tabel__ramme">
            <table className="rum-tabel">
              <caption className="sr-only">
                Depositum-betalinger, nyeste først
              </caption>
              <thead>
                <tr>
                  <th scope="col">Ordre</th>
                  <th scope="col">Tid</th>
                  <th scope="col">Mail</th>
                  <th scope="col">Beløb</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {ordrer.map((o) => (
                  <tr key={o.nummer}>
                    <td>{o.nummer}</td>
                    <td>{dansk(o.tid)}</td>
                    <td>{o.email || "—"}</td>
                    <td>{o.belob}</td>
                    <td>{o.betalt ? "Betalt" : "Afventer"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form method="post" action="/api/vagt" style={{ marginTop: 40 }}>
          <input type="hidden" name="handling" value="ud" />
          <input type="hidden" name="retur" value="afstemning" />
          <button type="submit" className="rum-book rum-book--row">
            Log ud
          </button>
        </form>
        <p className="rum-body-copy" style={{ marginTop: 16, color: "var(--beton)" }}>
          Adgangen lukker sig selv efter {VAGT_TIMER} timer.
        </p>
      </main>
    </RummetShell>
  );
}
