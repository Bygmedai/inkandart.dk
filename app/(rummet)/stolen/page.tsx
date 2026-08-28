import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { BookDoor } from "@/components/rummet/BookDoor";
import { guestState, loadHouse } from "@/lib/content";

export const metadata: Metadata = {
  title: "Stolen · Ink & Art",
  description: "Hvem der sidder i stolen. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { canonical: "/stolen" },
};

export default function StolenPage() {
  const guest = guestState(loadHouse().artists);
  return (
    <RummetShell>
      <main id="main" className="rum-room">
        <p className="rum-label">Rummet</p>
        <h1 className="rum-room__title rum-poster">Stolen</h1>
        <div className="rum-room__slot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/slots/S-04.jpg" alt="S-04, stolen" />
          <span className="rum-demo">DEMO S-04</span>
        </div>
        {guest.kind === "empty" ? (
          <div className="rum-empty" style={{ marginTop: 28, maxWidth: 560 }}>
            <p className="rum-empty__title rum-poster">Ingen gæst i stolen</p>
          </div>
        ) : (
          <p className="rum-room__note rum-body-copy">
            {guest.kind === "named" ? guest.artist.fornavn : "Gæst · navn følger"}
          </p>
        )}
        <p className="rum-room__note rum-body-copy">
          Artistkortet kommer i næste rum. Book tid herunder.
        </p>
        <p style={{ marginTop: 24 }}>
          <BookDoor />
        </p>
      </main>
    </RummetShell>
  );
}
