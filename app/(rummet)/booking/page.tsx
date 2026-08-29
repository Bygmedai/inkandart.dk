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
    <RummetShell>
      <main id="main" className="rum-room">
        <h1 className="rum-room__title rum-poster">Booking</h1>
        <p style={{ marginTop: 28 }}>
          <a
            className="rum-book rum-book--row"
            href={cartUrl("53492757627208")}
            rel="noopener noreferrer"
          >
            Depositum 100 kr — fragår i prisen
          </a>
        </p>
        <p style={{ marginTop: 24 }}>
          <BookDoor label="Videre til booking" />
        </p>
      </main>
    </RummetShell>
  );
}
