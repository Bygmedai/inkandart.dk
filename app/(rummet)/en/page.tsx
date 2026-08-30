import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { Segl } from "@/components/rummet/Segl";
import { alternates } from "@/lib/i18n";
import {
  chairArtists,
  guestState,
  loadHouse,
  loadHusetForsideEn,
  loadKontakt,
} from "@/lib/content";

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
 * Rum-navnene i nav'en (Stolen, Mærket…) er husets egennavne og
 * oversættes ikke. Døre uden engelsk side går til dansk — hellere
 * dansk end 404 (husregel). Artistkortene er bevidst simple her:
 * foto + navn + håndværk, dør til den danske profil.
 */
export default function HomePageEn() {
  const fold = loadHusetForsideEn();
  const kontakt = loadKontakt();
  const house = loadHouse();
  const chairs = chairArtists(house.artists);
  const guest = guestState(house.artists);

  return (
    <RummetShell door={false}>
      <main id="main" lang="en" className="rum-huset">
        <header className="rum-huset__intro">
          <p className="rum-label">The house</p>
          <h1 className="rum-huset__title rum-poster">{fold.titel}</h1>
          <p className="rum-huset__lede rum-body-copy">{fold.lede}</p>
          {fold.tider ? (
            <p className="rum-label rum-huset__tider">{fold.tider}</p>
          ) : null}
          <div className="rum-huset__cta">
            <a id="booking" href="/booking" className="rum-book">
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
              <article key={a.id} className="rum-kort">
                <a
                  href={`/stolen/${a.id}`}
                  className="rum-kort__link"
                  aria-label={`${a.fornavn} — profile`}
                >
                  <div className="rum-kort__foto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.foto} alt={a.billedtekst || a.fornavn} />
                  </div>
                </a>
                <div className="rum-kort__body">
                  <h2 className="rum-chair__navn rum-poster">
                    <a href={`/stolen/${a.id}`}>{a.fornavn}</a>
                  </h2>
                  {a.haandvaerk ? (
                    <p className="rum-chair__craft">{a.haandvaerk}</p>
                  ) : null}
                </div>
              </article>
            ))}
            {guest.kind === "named" ? (
              <article className="rum-kort">
                <div className="rum-kort__foto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={guest.artist.foto} alt={guest.artist.fornavn} />
                </div>
                <div className="rum-kort__body">
                  <h2 className="rum-chair__navn rum-poster">{guest.artist.fornavn}</h2>
                </div>
              </article>
            ) : null}
          </div>
          <div style={{ marginTop: 20 }}>
            <a href="/booking" className="rum-book">
              {fold.cta_book}
            </a>
          </div>
        </section>
      </main>
    </RummetShell>
  );
}
