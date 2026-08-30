import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { cartUrl, RESERVATIONS } from "@/lib/commerce";
import { loadBookingCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Booking · Ink & Art",
  alternates: { canonical: "/booking/tak" },
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
 * Tak-siden efter Book.dk-hoppet. Ordene bor i content/booking.yml.
 *
 * `?betalt=1` er en URL-parameter, ikke et betalingsbevis (Sirius P0-1,
 * 30/8): systemet har ingen webhook og kan ikke se Shopify-ordren. Derfor
 * må betalt-grenen aldrig påstå "depositum er betalt" — den peger på
 * Shopify-kvitteringen som det bevis der faktisk findes. Den dag en
 * server-side ordrestatus eksisterer, kan siden love mere.
 */
export default async function BookingTakPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const copy = loadBookingCopy();
  const betalt = oneParam(params.betalt) === "1";
  const depositum = RESERVATIONS.find((r) => r.id === "plads");

  if (betalt) {
    return (
      <RummetShell tone="salg">
        <main id="main" className="rum-room rum-booking">
          <div className="rum-booking__koeb">
            <p className="rum-body-copy rum-room__note">{copy.tak_betalt}</p>
          </div>
          <Plade foto={copy.foto} alt={copy.billedtekst} />
        </main>
      </RummetShell>
    );
  }

  // [AFVENTER STEVEN] konsekvens ved ubetalt
  return (
    <RummetShell tone="salg">
      <main id="main" className="rum-room rum-booking">
        <div className="rum-booking__koeb">
          <h1 className="rum-room__title rum-poster">{copy.tak_titel}</h1>
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
        </div>
        <Plade foto={copy.foto} alt={copy.billedtekst} />
      </main>
    </RummetShell>
  );
}
