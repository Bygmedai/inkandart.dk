import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { DepositumTjek } from "@/components/rummet/DepositumTjek";
import { cartUrl, depositumVarianter, RESERVATIONS } from "@/lib/commerce";
import { loadBookingCopyEn } from "@/lib/content";
import { verificerDepositum, type DepositumStatus } from "@/lib/depositum";

export const metadata: Metadata = {
  title: "Booking · Ink & Art",
  alternates: { canonical: "/en/booking/tak" },
  robots: { index: false, follow: true },
};

function oneParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

function Plade({ foto, alt }: { foto: string; alt: string }) {
  return (
    <div className="rum-booking__plade">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={foto} alt={alt} />
    </div>
  );
}

/**
 * Tak-siden efter Book.dk-hoppet.
 *
 * FØR (Sirius P0-1): `?betalt=1` viste «Depositum er betalt». Det var en
 * URL-parameter — enhver kunne skrive den i adresselinjen, og systemet
 * havde aldrig set en betaling.
 *
 * NU: kunden (eller Sonja ved disken) skriver ordrenummeret fra
 * kvitteringen, og siden spørger Shopify. Svaret er det Shopify siger:
 * betalt, ikke betalt endnu, ukendt nummer — eller «vi kan ikke slå op
 * lige nu», hvis opslaget fejler. Vi gætter aldrig på kundens vegne.
 *
 * `?betalt=1` er bevidst fjernet som sandhedskilde. Den gamle tekst står
 * stadig i booking.yml og bruges når kunden lige er kommet tilbage fra
 * checkout — men den påstår kun det den kan holde: at kvitteringen
 * kommer fra Shopify.
 */
export default async function BookingTakPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const copy = loadBookingCopyEn();
  const ordre = oneParam(params.ordre);
  const status: DepositumStatus | null = ordre
    ? await verificerDepositum(ordre, depositumVarianter())
    : null;
  const depositum = RESERVATIONS.find((r) => r.id === "plads");

  return (
    <RummetShell lang="en" tone="salg">
      <main id="main" lang="en" className="rum-room rum-booking">
        <div className="rum-booking__koeb">
          <h1 className="rum-room__title rum-poster">{copy.tak_titel}</h1>
          <p className="rum-body-copy rum-booking__note">{copy.tak_betalt}</p>
          {depositum ? (
            <p style={{ marginTop: 24 }}>
              <a
                className="rum-book rum-book--row rum-booking__pris"
                href={cartUrl(depositum.variantId)}
                rel="noopener noreferrer"
              >
                {copy.depositum_label}
              </a>
            </p>
          ) : null}
          <DepositumTjek
            copy={copy}
            status={status}
            ordre={ordre}
            action="/en/booking/tak"
          />
        </div>
        <Plade foto={copy.foto} alt={copy.billedtekst} />
      </main>
    </RummetShell>
  );
}
