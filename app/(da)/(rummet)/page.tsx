import type { Metadata } from "next";
import Link from "next/link";
import { RummetShell } from "@/components/rummet/Shell";
import { ArtistKort } from "@/components/rummet/ArtistKort";
import { Door } from "@/components/rummet/Door";
import { Segl } from "@/components/rummet/Segl";
import {
  loadHouse,
  loadHusetForside,
  loadKontakt,
  chairArtists,
  guestState,
  activeNat,
  visibleCountForArtist,
} from "@/lib/content";
import { loadAabningstider } from "@/lib/content";
import { formatTider } from "@/lib/tider";
import { alternates, t } from "@/lib/i18n";

const _fold = loadHusetForside();
const _kontakt = loadKontakt();

export const metadata: Metadata = {
  alternates: alternates("/"),
  title: `Ink & Art Copenhagen — ${_fold.titel.toLowerCase()}`,
  description: `${_fold.titel}. ${_kontakt.adresse.split(",")[0]}, ${_kontakt.by}.`,
};

/**
 * Forsiden. Ordene og heroen bor i content/huset.yml, kontakten i
 * content/kontakt.yml, artisterne i artists.yml. Denne fil er kun layout —
 * står der et tal eller et navn herinde, er det en fejl.
 */
export default function HusetPage() {
  const house = loadHouse();
  const fold = loadHusetForside();
  // Butikkens tider — ét sted, content/aabningstider.yml. Foer stod de
  // i seks filer i to formater og drev fra hinanden.
  const husetsTider = formatTider(loadAabningstider(), t("da").rummet.tider);
  const kontakt = loadKontakt();
  const chairs = chairArtists(house.artists);
  const guest = guestState(house.artists);
  const nat = activeNat(house.nats);

  return (
    <RummetShell door={false}>
      <main id="main" className="rum-huset">
        <header className="rum-huset__intro">
          <p className="rum-label">Studiet</p>
          <h1 className="rum-huset__title rum-poster">{fold.titel}</h1>
          <p className="rum-huset__lede rum-body-copy">{fold.lede}</p>
          {husetsTider ? (
            <p className="rum-label rum-huset__tider">{husetsTider}</p>
          ) : null}
          <div className="rum-huset__cta">
            <a id="booking" href="/booking" className="rum-book">
              {fold.cta_book}
            </a>
            <a className="rum-tel" href={`tel:${kontakt.telefon_e164}`}>
              Ring på — {kontakt.telefon_vist}
            </a>
          </div>
        </header>

        <section id="work" className="rum-huset__hero">
          {fold.kicker ? (
            <p className="rum-label rum-huset__kicker">{fold.kicker}</p>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fold.hero_foto} alt={fold.hero_billedtekst} />
          <Segl size={180} placement="above" className="rum-huset__segl" />
        </section>

        <section className="rum-huset__side">
          <p className="rum-label" id="artists">
            I stolen
          </p>

          <div className="rum-huset__chairs">
            {chairs.map((a) => (
              <ArtistKort
                key={a.id}
                artist={a}
                workCount={visibleCountForArtist(house.vaerker, a.id)}
                compact
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
                compact
              />
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/booking" className="rum-book">
              {fold.cta_book}
            </a>
          </div>

          <div className="rum-nat">
            <p className="rum-label">{t("da").rummet.tonightLabel}</p>
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
                    {t("da").rummet.guestDj}
                  </p>
                )}
                <Link href="/natten" className="rum-nat__go">
                  {t("da").rummet.seePoster}
                </Link>
              </div>
            ) : (
              <div className="rum-empty" style={{ marginTop: 16 }}>
                <p className="rum-empty__title rum-poster">
                  {t("da").rummet.noEvent}
                </p>
                <p className="rum-body-copy" style={{ marginTop: 12, color: "var(--beton)" }}>
                  {t("da").rummet.noEventLine}
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
