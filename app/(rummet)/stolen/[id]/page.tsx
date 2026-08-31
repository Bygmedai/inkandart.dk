import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RummetShell } from "@/components/rummet/Shell";
import { Plade } from "@/components/rummet/Plade";
import { Bio } from "@/components/rummet/Bio";
import { Tider } from "@/components/rummet/Tider";
import { ArtistGalleri } from "@/components/rummet/Galleri";
import {
  artistById,
  loadPiercing,
  loadHouse,
  loadKontakt,
  periodeLabel,
  profiledArtists,
  visibleVaerkerForArtist,
} from "@/lib/content";
import { alternates, t } from "@/lib/i18n";

/**
 * Artistens egen side. Alt her kommer fra artists.yml og vaerker.yml —
 * får huset en ny artist, findes siden i samme commit som datalinjen.
 * Ingen bio bliver digtet: felter uden indhold udelades.
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
    description: [artist.haandvaerk, `${kontakt.adresse}, ${kontakt.by}.`]
      .filter(Boolean)
      .join(" · "),
    alternates: {
      ...alternates(`/stolen/${artist.id}`),
      canonical: `/stolen/${artist.id}`,
    },
  };
}

export default async function ArtistPage({
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
  const c = t("da").rummet;

  return (
    <RummetShell>
      <main id="main" className="rum-room rum-artist">
        <p className="rum-label">
          <a href="/stolen" className="rum-artist__tilbage">
            Stolen
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
            {artist.haandvaerk ? (
              <p className="rum-chair__craft">{artist.haandvaerk}</p>
            ) : null}
            <p className="rum-label rum-chair__meta">{periodeLabel(artist)}</p>
            {artist.bio ? <Bio tekst={artist.bio} /> : null}
            <Tider tider={artist.tider} t={c.tider} />
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
                <a href={`/booking?artist=${artist.id}`} className="rum-book">
                  Book tid
                </a>
              ) : (
                <a href="/gaden" className="rum-book">
                  Walk-in — kom forbi
                </a>
              )}
              <a className="rum-tel" href={`tel:${kontakt.telefon_e164}`}>
                Ring på — {kontakt.telefon_vist}
              </a>
            </div>
          </div>
        </div>

        {artist.haandvaerk.toLowerCase().includes("piercer") ? (
          <section className="rum-artist__piercing" aria-labelledby="piercing">
            {(() => {
              const pi = loadPiercing();
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
              Arbejder
            </h2>
            <div className="rum-vaeg">
              {works.map((v) => (
                <article key={v.id} className="rum-vaeg__item">
                  <Plade vaerk={v} artist={artist} />
                </article>
              ))}
            </div>
            <p className="rum-kort__arkiv">
              <a href={`/maerket?artist=${artist.id}`}>Se dem på Væggen i Mærket</a>
            </p>
          </section>
        ) : (
          <section className="rum-artist__arkiv">
            <div className="rum-empty">
              <p className="rum-empty__title rum-poster">
                Billeder på vej
              </p>
              <p className="rum-body-copy" style={{ marginTop: 12, color: "var(--beton)" }}>
                Kom forbi {kontakt.adresse} og se arbejdet i virkeligheden.
              </p>
            </div>
          </section>
        )}
      </main>
    </RummetShell>
  );
}
