import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { BookDoor } from "@/components/rummet/BookDoor";
import { cartUrl, RESERVATIONS } from "@/lib/commerce";
import { artistById, loadBookingCopyEn, loadHouse, loadKontakt } from "@/lib/content";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Booking · Ink & Art",
  description: "Book a time at Ink & Art, Larsbjørnsstræde 13, Copenhagen.",
  alternates: { ...alternates("/booking"), canonical: "/en/booking" },
};

function oneParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

/**
 * The booking page in English — the money path (Sirius #5: «start with
 * the road that earns»). Same ladder as the Danish page: deposit first,
 * then the hop to Book.dk. The words live in content/booking.en.yml.
 *
 * Book.dk itself is a Danish surface. We say so plainly instead of
 * letting an English customer discover it mid-click — an honest line
 * costs less than a broken expectation at the counter.
 */
export default async function BookingPageEn({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const copy = loadBookingCopyEn();
  const house = loadHouse();
  const kontakt = loadKontakt();
  const artist = artistById(house.artists, oneParam(params.artist));
  const depositum = RESERVATIONS.find((r) => r.id === "plads");

  return (
    <RummetShell lang="en" tone="salg">
      <main id="main" lang="en" className="rum-room rum-booking">
        <div className="rum-booking__koeb">
          <h1 className="rum-room__title rum-poster">Booking</h1>
          {artist && artist.fornavn ? (
            <p className="rum-label rum-booking__hos">
              With {artist.fornavn}
              {artist.haandvaerk ? ` · ${artist.haandvaerk}` : ""}
            </p>
          ) : null}
          {copy.lede ? (
            <p className="rum-body-copy rum-booking__lede">{copy.lede}</p>
          ) : null}
          {/*
            S574 (Steven, 30/8): trappen er vendt om. Depositummet stod
            som trin 1 og spærrede ALLE kunder for at beskytte mod
            udeblivelser på de få lange sessioner — en udeblivelse på en
            25-minutters tatovering koster nærmest ingenting, en på en
            7-timers dag koster artisten en arbejdsdag. Nu: book gratis
            i ét flow, og betal kun hvor det tæller.

            Kunden skriver ikke et referencenummer nogen steder. Book.dk
            og Shopify deler allerede kundens mailadresse; det er den vi
            afstemmer på.
          */}
          <ol className="rum-booking__trin">
            <li>
              <BookDoor
                label={copy.door_label}
                className="rum-book rum-book--row rum-booking__go"
              />
            </li>
            {copy.samtykke_trin ? (
              <li>
                <p className="rum-body-copy rum-booking__trin-note">
                  {copy.samtykke_trin}
                </p>
                <a className="rum-book rum-book--row" href="/en/samtykke">
                  {copy.samtykke_label}
                </a>
              </li>
            ) : null}
            {copy.depositum_trin ? (
              <li>
                <p className="rum-body-copy rum-booking__trin-note">
                  {copy.depositum_trin}
                </p>
                {depositum ? (
                  <a
                    className="rum-book rum-book--row rum-booking__pris"
                    href={cartUrl(depositum.variantId)}
                    rel="noopener noreferrer"
                  >
                    {copy.depositum_label}
                  </a>
                ) : null}
              </li>
            ) : null}
          </ol>
          {copy.konsultation ? (
            <p className="rum-body-copy rum-booking__note">{copy.konsultation}</p>
          ) : null}
          {copy.note ? (
            <p className="rum-body-copy rum-booking__note">{copy.note}</p>
          ) : null}
          <p className="rum-body-copy rum-booking__note">
            Our booking calendar is in Danish. If that is easier over the
            phone, call{" "}
            <a
              className="rum-tel rum-tel--i-tekst"
              href={`tel:${kontakt.telefon_e164}`}
            >
              {kontakt.telefon_vist}
            </a>{" "}
            — we speak English in the shop.
          </p>
        </div>
        <div className="rum-booking__plade">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={copy.foto} alt={copy.billedtekst} />
        </div>
      </main>
    </RummetShell>
  );
}
