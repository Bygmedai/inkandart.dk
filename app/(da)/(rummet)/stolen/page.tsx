import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { ArtistKort } from "@/components/rummet/ArtistKort";
import {
  chairArtists,
  guestState,
  loadHouse,
  visibleCountForArtist,
} from "@/lib/content";
import { alternates, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Artister · Ink & Art",
  description: "Hvem der sidder i stolen. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { ...alternates("/stolen"), canonical: "/stolen" },
};

export default function StolenPage() {
  const house = loadHouse();
  const chairs = chairArtists(house.artists);
  const guest = guestState(house.artists);

  return (
    <RummetShell>
      <main id="main" className="rum-room rum-stolen">
        <h1 className="rum-room__title rum-poster">Artister</h1>

        <div className="rum-stolen__grid">
          {chairs.map((a) => (
            <ArtistKort
              key={a.id}
              artist={a}
              workCount={visibleCountForArtist(house.vaerker, a.id)}
            />
          ))}

          {guest.kind === "empty" ? (
            <div className="rum-empty">
              <p className="rum-empty__title rum-poster">{t("da").rummet.noGuest}</p>
            </div>
          ) : (
            <ArtistKort
              artist={guest.artist}
              workCount={visibleCountForArtist(house.vaerker, guest.artist.id)}
              guestKind={guest.kind}
            />
          )}
        </div>
        <p className="rum-fact">{t("da").rummet.walkInLine}</p>
      </main>
    </RummetShell>
  );
}
