import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { BookDoor } from "@/components/rummet/BookDoor";
import { BookRummet } from "@/components/rummet/BookRummet";
import { artistById, loadBookingCopy, loadHouse } from "@/lib/content";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Booking · Ink & Art",
  description: "Book tid. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { ...alternates("/booking"), canonical: "/booking" },
};

function oneParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

/**
 * Bookingsiden er en trappe med to trin, ikke to konkurrerende links:
 * depositum først (det holder tiden og fragår i prisen), dernæst hoppet
 * til Book.dk. Ordene bor i content/booking.yml.
 *
 * Kommer kunden fra en artists side (?artist=emma), siger siden det —
 * konteksten må ikke forsvinde i klikket. Book.dk kan ikke deep-linke
 * til en medarbejder, så vi lover ikke et forvalg vi ikke kan holde;
 * kunden vælger selv artisten i kalenderen.
 */
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const copy = loadBookingCopy();
  const house = loadHouse();
  const artist = artistById(house.artists, oneParam(params.artist));

  return (
    <RummetShell tone="salg">
      <main id="main" className="rum-room rum-booking">
        <div className="rum-booking__koeb">
          <h1 className="rum-room__title rum-poster">Booking</h1>
          {artist && artist.fornavn ? (
            <p className="rum-label rum-booking__hos">
              Hos {artist.fornavn}
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

            S579 (4/9): betalingsknappen er VÆK fra denne side. Målt i
            Vercel: 10 af 13 klik på sitet i uge 36 var netop den knap,
            og ingen af dem endte i et køb — kunden røg fra en mørk side
            ud på en hvid Shopify-kasse for 100 kr uden at have booket
            noget, og vendte om. Depositummet lever nu kun EFTER
            bookingen: på /booking/tak og i Book.dks bekræftelsesmail,
            som linker dertil. Her står kun sætningen der forklarer det.

            Kunden skriver ikke et referencenummer nogen steder. Book.dk
            og Shopify deler allerede kundens mailadresse; det er den vi
            afstemmer på.
          */}
          <ol className="rum-booking__trin">
            <li>
              {copy.book_trin ? (
                <p className="rum-body-copy rum-booking__trin-note">
                  {copy.book_trin}
                </p>
              ) : null}
              <BookRummet lang="da" />
              <BookDoor
                label={copy.door_fuld_label || copy.door_label}
                className="rum-book rum-book--row rum-booking__go rum-booking__go--fuld"
              />
            </li>
            {copy.samtykke_trin ? (
              <li>
                <p className="rum-body-copy rum-booking__trin-note">
                  {copy.samtykke_trin}
                </p>
                <a className="rum-book rum-book--row" href="/samtykke">
                  {copy.samtykke_label}
                </a>
              </li>
            ) : null}
            {copy.depositum_trin ? (
              <li>
                <p className="rum-body-copy rum-booking__trin-note">
                  {copy.depositum_trin}
                </p>
              </li>
            ) : null}
          </ol>
          {copy.konsultation ? (
            <p className="rum-body-copy rum-booking__note">{copy.konsultation}</p>
          ) : null}
          {copy.note ? (
            <p className="rum-body-copy rum-booking__note">{copy.note}</p>
          ) : null}
        </div>
        <div className="rum-booking__plade">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={copy.foto} alt={copy.billedtekst} />
        </div>
      </main>
    </RummetShell>
  );
}
