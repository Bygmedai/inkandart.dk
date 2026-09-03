import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { ArtistKort } from "@/components/rummet/ArtistKort";
import { Segl } from "@/components/rummet/Segl";
import { alternates , t} from "@/lib/i18n";
import {
  chairArtists,
  guestState,
  loadHouse,
  loadHusetForsideEn,
  visibleCountForArtist,
  loadKontakt,
} from "@/lib/content";
import { loadAabningstider } from "@/lib/content";
import { formatTider } from "@/lib/tider";

const _fold = loadHusetForsideEn();
const _kontakt = loadKontakt();

export const metadata: Metadata = {
  ...{ alternates: { ...alternates("/"), canonical: "/en" } },
  title: `Ink & Art Copenhagen — ${_fold.titel.toLowerCase()}`,
  description: `${_fold.titel}. ${_kontakt.adresse.split(",")[0]}, Copenhagen.`,
};

/**
 * The English front page — Rummet design, own voice (huset.en.yml).
 * K6 (S574): en engelsk turist så det pensionerede Emerge-design.
 *
 * Nav-ordene kommer fra lib/i18n.ts — kundens ord, ikke husets (S579).
 * Døre uden engelsk side går til dansk — hellere dansk end 404 (husregel). Artistkortene er bevidst simple her:
 * foto + navn + håndværk, dør til den danske profil.
 */
export default function HomePageEn() {
  const fold = loadHusetForsideEn();
  // Butikkens tider — ét sted, content/aabningstider.yml. Foer stod de
  // i seks filer i to formater og drev fra hinanden.
  const husetsTider = formatTider(loadAabningstider(), t("en").rummet.tider);
  const kontakt = loadKontakt();
  const house = loadHouse();
  const chairs = chairArtists(house.artists);
  const guest = guestState(house.artists);

  return (
    <RummetShell lang="en" door={false}>
      <main id="main" lang="en" className="rum-huset">
        <header className="rum-huset__intro">
          <p className="rum-label">Studio</p>
          <h1 className="rum-huset__title rum-poster">{fold.titel}</h1>
          <p className="rum-huset__lede rum-body-copy">{fold.lede}</p>
          {husetsTider ? (
            <p className="rum-label rum-huset__tider">{husetsTider}</p>
          ) : null}
          <div className="rum-huset__cta">
            <a id="booking" href="/en/booking" className="rum-book">
              {fold.cta_book}
            </a>
            <a className="rum-tel" href={`tel:${kontakt.telefon_e164}`}>
              {fold.phone_line} — {kontakt.telefon_vist}
            </a>
          </div>
          {fold.walk_in_line ? (
            <p className="rum-body-copy rum-huset__walkin">{fold.walk_in_line}</p>
          ) : null}
        </header>

        <section className="rum-huset__hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fold.hero_foto} alt={fold.hero_billedtekst} />
          <Segl size={180} placement="above" className="rum-huset__segl" />
        </section>

        <section className="rum-huset__side">
          <p className="rum-label" id="artists">
            {fold.chairs_label}
          </p>
          <div className="rum-huset__chairs">
            {chairs.map((a) => (
              <ArtistKort
                key={a.id}
                artist={a}
                workCount={visibleCountForArtist(house.vaerker, a.id)}
                compact
                lang="en"
              />
            ))}
            {guest.kind === "named" ? (
              <ArtistKort
                artist={guest.artist}
                workCount={visibleCountForArtist(house.vaerker, guest.artist.id)}
                guestKind="named"
                compact
                lang="en"
              />
            ) : null}
          </div>
          <div style={{ marginTop: 20 }}>
            <a href="/en/booking" className="rum-book">
              {fold.cta_book}
            </a>
          </div>
        </section>
      </main>
    </RummetShell>
  );
}
