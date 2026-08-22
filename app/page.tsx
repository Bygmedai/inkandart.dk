import type { Metadata } from "next";
import { SceneV05 } from "@/components/emerge/SceneV05";
import { MobileDock } from "@/components/emerge/MobileDock";
import { alternates } from "@/lib/i18n";

import { SkipLink } from "@/components/i18n/SkipLink";
export const metadata: Metadata = {
  // Self-referential canonical — bevidst pr. side, ikke i layout: layout-metadata
  // arves, og en root-canonical ville stemple undersiderne som kopier af forsiden.
  alternates: alternates("/"),
};

/* Emerge v0.5 — Claudias landskab: Hero · Under gaden · Work · Artist · Booking.
   Én sammenhængende scene; sektionsgrænserne bæres af kant-lagene i scenen selv. */
export default function HomePage() {
  return (
    <>
      <SkipLink lang="da" />
    <main id="main">
      <SceneV05 />
      <MobileDock />
    </main>
    </>
  );
}
