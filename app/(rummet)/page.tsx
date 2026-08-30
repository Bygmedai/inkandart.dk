import type { Metadata } from "next";
import Link from "next/link";
import { RummetShell } from "@/components/rummet/Shell";
import { Plade } from "@/components/rummet/Plade";
import { Door } from "@/components/rummet/Door";
import { Segl } from "@/components/rummet/Segl";
import {
  loadHouse,
  artistById,
  chairArtists,
  guestState,
  activeNat,
  featuredVaerk,
} from "@/lib/content";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  alternates: alternates("/"),
  title: "Ink & Art Copenhagen — tatovering & piercing i Pisserenden",
  description:
    "Tatovering og piercing i Pisserenden. Larsbjørnsstræde 13, København K.",
};

export default function HusetPage() {
  const house = loadHouse();
  const featured = featuredVaerk(house.vaerker);
  const featuredArtist = featured ? artistById(house.artists, featured.artist) : undefined;
  const chairs = chairArtists(house.artists);
  const guest = guestState(house.artists);
  const nat = activeNat(house.nats);

  return (
    <RummetShell door={false}>
      <main id="main" className="rum-huset">
        <header className="rum-huset__intro">
          <p className="rum-label">Huset</p>
          <h1 className="rum-huset__title rum-poster">
            Tatovering og piercing i Pisserenden
          </h1>
          <p className="rum-huset__lede rum-body-copy">
            Larsbjørnsstræde 13, kælderen. Walk-in når der er en fri stol — ellers book.
          </p>
          <div className="rum-huset__cta">
            <a id="booking" href="/booking" className="rum-book">
              Book tid
            </a>
            <a className="rum-tel" href="tel:+4555248608">
              Ring på — 55 24 86 08
            </a>
          </div>
        </header>
        <section id="work" className="rum-huset__plade">
          <p className="rum-label rum-huset__kicker">Nylavet</p>
          {featured ? (
            <Plade vaerk={featured} artist={featuredArtist} />
          ) : (
            <div className="rum-empty">
              <p className="rum-empty__title rum-poster">Ingen værk i dag</p>
            </div>
          )}
        </section>

        <section className="rum-huset__side">
          <div className="rum-huset__maerke">
            <Segl size={220} placement="beside" />
          </div>
          <p className="rum-label" id="artists">
            I stolen
          </p>

          <div className="rum-huset__chairs">
            {chairs.map((a) => (
              <article
                key={a.id}
                id={a.id === "nizar" ? "artist-nizar" : undefined}
                className="rum-kort rum-chair"
              >
                <div className="rum-kort__foto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.foto} alt={a.fornavn} />
                </div>
                <div className="rum-kort__body">
                  <h2 className="rum-chair__navn rum-poster">{a.fornavn}</h2>
                  {a.haandvaerk ? <p className="rum-chair__craft">{a.haandvaerk}</p> : null}
                  <p className="rum-label rum-chair__meta">Fast</p>
                </div>
              </article>
            ))}

            {guest.kind === "empty" ? (
              <div className="rum-empty">
                <p className="rum-empty__title rum-poster">Ingen gæst i stolen</p>
              </div>
            ) : (
              <article className="rum-kort rum-chair">
                <div className="rum-kort__foto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guest.artist.foto}
                    alt={guest.kind === "named" ? guest.artist.fornavn : "Gæst"}
                  />
                </div>
                <div className="rum-kort__body">
                  <h2 className="rum-chair__navn rum-poster">
                    {guest.kind === "named" ? guest.artist.fornavn : "Gæst · navn følger"}
                  </h2>
                  {guest.kind === "named" && guest.artist.haandvaerk ? (
                    <p className="rum-chair__craft">{guest.artist.haandvaerk}</p>
                  ) : null}
                  <p className="rum-label rum-chair__meta">
                    {guest.kind === "named" && guest.artist.periode_til
                      ? `I huset til ${guest.artist.periode_til}`
                      : "Gæst"}
                  </p>
                </div>
              </article>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/booking" className="rum-book">
              Book tid
            </a>
          </div>

          <div className="rum-nat">
            <p className="rum-label">I aften</p>
            {nat ? (
              <div className="rum-nat__card rum-nat__card--live">
                <p className="rum-nat__title rum-poster">{nat.nr || nat.dato || "Nat"}</p>
                <p className="rum-label rum-nat__meta">
                  {[nat.dato, nat.tidsrum].filter(Boolean).join(" · ")}
                </p>
                {nat.navne.length ? (
                  <p className="rum-chair__craft" style={{ marginTop: 10 }}>
                    {nat.navne.join(" · ")}
                  </p>
                ) : (
                  <p className="rum-chair__craft" style={{ marginTop: 10 }}>
                    Gæste-DJ
                  </p>
                )}
                <Link href="/natten" className="rum-nat__go">
                  Se plakaten
                </Link>
              </div>
            ) : (
              <div className="rum-empty" style={{ marginTop: 16 }}>
                <p className="rum-empty__title rum-poster">Ingen nat i aften</p>
                <p className="rum-body-copy" style={{ marginTop: 12, color: "var(--beton)" }}>
                  Næste nat står i Blackbook.
                </p>
              </div>
            )}
          </div>

          <div className="rum-huset__door">
            <Door variant="inline" />
          </div>
        </section>
      </main>
    </RummetShell>
  );
}
