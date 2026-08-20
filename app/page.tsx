import type { Metadata } from "next";
import { SceneV05 } from "@/components/emerge/SceneV05";

export const metadata: Metadata = {
  // Self-referential canonical — bevidst pr. side, ikke i layout: layout-metadata
  // arves, og en root-canonical ville stemple undersiderne som kopier af forsiden.
  alternates: { canonical: "/" },
};

/* Emerge v0.5 — Claudias landskab: Hero · Under gaden · Work · Artist · Booking.
   Én sammenhængende scene; sektionsgrænserne bæres af kant-lagene i scenen selv. */
export default function HomePage() {
  return (
    <main id="main">
      <SceneV05 />
    </main>
  );
}
