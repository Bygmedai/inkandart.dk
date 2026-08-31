import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RummetShell } from "@/components/rummet/Shell";
import { Plade } from "@/components/rummet/Plade";
import { Bio } from "@/components/rummet/Bio";
import { ArtistGalleri } from "@/components/rummet/Galleri";
import {
  artistById,
  loadPiercingEn,
  loadHouse,
  loadKontakt,
  periodeLabel,
  profiledArtists,
  visibleVaerkerForArtist,
} from "@/lib/content";
import { alternates, t } from "@/lib/i18n";

/**
 * The artist's own page, in English.
 *
 * One rule decides the shape of this file: **we never translate a bio.**
 * A bio is a person's own words about themselves — putting a machine's
 * English in their mouth is the same failure as inventing one. So the
 * artist gets an English bio only when they have written one
 * (`bio_en` in artists.yml); otherwise the Danish stands, marked
 * lang="da", with a quiet line saying so. Honest beats smooth.
 */

export function generateStaticParams() {
  const house = loadHouse();
  return profiledArtists(house.artists).map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const house = loadHouse();
  const artist = artistById(house.artists, id);
  if (!artist || !artist.fornavn) return {};
  const kontakt = loadKontakt();
  return {
    title: `${artist.fornavn} · Ink & Art`,
    description: [
      artist.haandvaerk_en || artist.haandvaerk,
      `${kontakt.adresse}, ${kontakt.by}.`,
    ]
      .filter(Boolean)
      .join(" · "),
    alternates: {
      ...alternates(`/stolen/${artist.id}`),
      canonical: `/en/stolen/${artist.id}`,
    },
  };
}

export default async function ArtistPageEn({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = loadHouse();
  const artist = profiledArtists(house.artists).find((a) => a.id === id);
  if (!artist) notFound();

  const works = visibleVaerkerForArtist(house.vaerker, artist.id);
  const kontakt = loadKontakt();
  const c = t("en").rummet;
  const craft = artist.haandvaerk_en || artist.haandvaerk;

  return (
    <RummetShell lang="en">
      <main id="main" lang="en" className="rum-room rum-artist">
        <p className="rum-label">
          <a href="/en/stolen" className="rum-artist__tilbage">
            {c.backToStolen}
          </a>
        </p>
        <div className="rum-artist__fold">
          <ArtistGalleri
            artist={artist}
            pause={c.galleriPause}
            afspil={c.galleriAfspil}
          />
          <div className="rum-artist__om">
            <h1 className="rum-room__title rum-poster">{artist.fornavn}</h1>
            {craft ? <p className="rum-chair__craft">{craft}</p> : null}
            <p className="rum-label rum-chair__meta">{periodeLabel(artist, c.periode)}</p>
            {artist.bio_en ? (
              <Bio tekst={artist.bio_en} />
            ) : artist.bio ? (
              <>
                <Bio tekst={artist.bio} lang="da" />
                <p className="rum-label rum-artist__insta">{c.bioIsDanish}</p>
              </>
            ) : null}
            {artist.instagram ? (
              <p className="rum-artist__insta">
                <a
                  href={`https://www.instagram.com/${artist.instagram}/`}
                  rel="noopener noreferrer"
                >
                  @{artist.instagram}
                </a>
              </p>
            ) : null}
            <div className="rum-huset__cta">
              {artist.booking ? (
                <a href={`/en/booking?artist=${artist.id}`} className="rum-book">
                  {c.bookTid}
                </a>
              ) : (
                <a href="/gaden" className="rum-book">
                  {c.walkIn}
                </a>
              )}
              <a className="rum-tel" href={`tel:${kontakt.telefon_e164}`}>
                Call — {kontakt.telefon_vist}
              </a>
            </div>
          </div>
        </div>

        {artist.haandvaerk.toLowerCase().includes("piercer") ? (
          <section className="rum-artist__piercing" aria-labelledby="piercing">
            {(() => {
              const pi = loadPiercingEn();
              return (
                <>
                  <h2 id="piercing" className="rum-label">
                    {pi.titel}
                  </h2>
                  <p className="rum-body-copy rum-artist__bio">{pi.tekst}</p>
                  {pi.priser ? (
                    <p className="rum-label rum-artist__priser">{pi.priser}</p>
                  ) : null}
                </>
              );
            })()}
          </section>
        ) : null}

        {works.length > 0 ? (
          <section className="rum-artist__arkiv" aria-labelledby="arkiv">
            <h2 id="arkiv" className="rum-label">
              {c.works}
            </h2>
            <div className="rum-vaeg">
              {works.map((v) => (
                <article key={v.id} className="rum-vaeg__item">
                  <Plade vaerk={v} artist={artist} />
                </article>
              ))}
            </div>
            <p className="rum-kort__arkiv">
              <a href={`/maerket?artist=${artist.id}`}>{c.seeOnWall}</a>
            </p>
          </section>
        ) : (
          <section className="rum-artist__arkiv">
            <div className="rum-empty">
              <p className="rum-empty__title rum-poster">{c.worksComing}</p>
              <p
                className="rum-body-copy"
                style={{ marginTop: 12, color: "var(--beton)" }}
              >
                {c.comeBy(kontakt.adresse)}
              </p>
            </div>
          </section>
        )}
      </main>
    </RummetShell>
  );
}
