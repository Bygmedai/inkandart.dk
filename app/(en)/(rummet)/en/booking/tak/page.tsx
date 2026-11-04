import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { loadBookingCopyEn } from "@/lib/content";
import { foto as fotoProps } from "@/lib/foto";

export const metadata: Metadata = {
  title: "Booking · Ink & Art",
  alternates: { canonical: "/en/booking/tak" },
  robots: { index: false, follow: true },
};

function Plade({ foto, alt }: { foto: string; alt: string }) {
  return (
    <div className="rum-booking__plade">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...fotoProps(foto, "(min-width: 800px) 50vw, 100vw")} alt={alt} />
    </div>
  );
}

/**
 * Tak-siden efter Book.dk-hoppet.
 *
 * S639 (Steven, 4/11): Shopify er lukket. Depositum-knappen og opslaget
 * mod Shopify er fjernet; siden bekræfter kun bookingen.
 */
export default function BookingTakPage() {
  const copy = loadBookingCopyEn();

  return (
    <RummetShell lang="en" tone="salg">
      <main id="main" lang="en" className="rum-room rum-booking">
        <div className="rum-booking__koeb">
          <h1 className="rum-room__title rum-poster">{copy.tak_titel}</h1>
          <p className="rum-body-copy rum-booking__note">{copy.tak_betalt}</p>
          {/* Tak-siden er stedet hvor kunden ER faerdig med at booke. Foer
              2/9 foerte intet paa hele sitet til samtykket — den var bygget
              og usynlig. Her staar den, hvor hun lige har afsluttet. */}
          {copy.samtykke_trin ? (
            <p className="rum-body-copy rum-booking__note">
              {copy.samtykke_trin}{" "}
              <a className="rum-book" href="/en/samtykke">
                {copy.samtykke_label}
              </a>
            </p>
          ) : null}
        </div>
        <Plade foto={copy.foto} alt={copy.billedtekst} />
      </main>
    </RummetShell>
  );
}
