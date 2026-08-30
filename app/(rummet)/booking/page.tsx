import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { BookDoor } from "@/components/rummet/BookDoor";
import { cartUrl, RESERVATIONS } from "@/lib/commerce";
import { artistById, loadBookingCopy, loadHouse } from "@/lib/content";

export const metadata: Metadata = {
  title: "Booking · Ink & Art",
  description: "Book tid. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { canonical: "/booking" },
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
  const depositum = RESERVATIONS.find((r) => r.id === "plads");

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
          <ol className="rum-booking__trin">
            <li>
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
            <li>
              <BookDoor
                label={copy.door_label}
                className="rum-book rum-book--row rum-booking__go"
              />
            </li>
          </ol>
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
