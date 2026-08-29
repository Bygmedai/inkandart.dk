import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { BookDoor } from "@/components/rummet/BookDoor";
import { cartUrl } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Booking · Ink & Art",
  description: "Book tid. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { canonical: "/booking" },
};

export default function BookingPage() {
  return (
    <RummetShell tone="salg">
      <main id="main" className="rum-room rum-booking">
        <div className="rum-booking__koeb">
          <h1 className="rum-room__title rum-poster">Booking</h1>
          <p style={{ marginTop: 24 }}>
            <BookDoor
              label="Videre til booking"
              className="rum-book rum-book--row rum-booking__go"
            />
          </p>
          <p style={{ marginTop: 24 }}>
            <a
              className="rum-book rum-book--row rum-booking__pris"
              href={cartUrl("53492757627208")}
              rel="noopener noreferrer"
            >
              Depositum 100 kr — fragår i prisen
            </a>
          </p>
        </div>
        <div className="rum-booking__plade">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slots/H-01.jpg" alt="Booking" />
        </div>
      </main>
    </RummetShell>
  );
}
