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
  title: "Stolen · Ink & Art",
  description: "Who sits in the chair. Ink & Art, Larsbjørnsstræde 13, Copenhagen.",
  alternates: { ...alternates("/stolen"), canonical: "/en/stolen" },
};

/**
 * Stolen på engelsk. Rummets navn oversættes ikke — det hedder Stolen,
 * også for en turist. Kortene er de samme; kun etiketterne skifter sprog,
 * og de kommer fra i18n gennem ArtistKort.
 */
export default function StolenPageEn() {
  const house = loadHouse();
  const chairs = chairArtists(house.artists);
  const guest = guestState(house.artists);
  const c = t("en").rummet;

  return (
    <RummetShell lang="en">
      <main id="main" lang="en" className="rum-room rum-stolen">
        <h1 className="rum-room__title rum-poster">Stolen</h1>

        <div className="rum-stolen__grid">
          {chairs.map((a) => (
            <ArtistKort
              key={a.id}
              artist={a}
              workCount={visibleCountForArtist(house.vaerker, a.id)}
              lang="en"
            />
          ))}

          {guest.kind === "empty" ? (
            <div className="rum-empty">
              <p className="rum-empty__title rum-poster">{c.noGuest}</p>
            </div>
          ) : (
            <ArtistKort
              artist={guest.artist}
              workCount={visibleCountForArtist(house.vaerker, guest.artist.id)}
              guestKind={guest.kind}
              lang="en"
            />
          )}
        </div>
        <p className="rum-fact">{c.walkInLine}</p>
      </main>
    </RummetShell>
  );
}
