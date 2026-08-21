"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/**
 * Mobil-dock — stille Book · Ring · Gavekort, fast i bunden på mobil.
 *
 * Krog-lock: CTA'en venter, den skriger ikke. Men på mobil venter den for
 * længe — stolen findes først ~1.200 px nede. Dock'en dukker op EFTER hero
 * (aldrig sticky i hero) og trækker sig igen når man når booking-finalen, så
 * den aldrig dækker den rigtige afslutning.
 *
 * Observerer scenen (#emerge + #booking) — rører den ikke. Kun mobil (CSS
 * skjuler ≥768px). Uden JS: dock'en står bare skjult (default), intet tab.
 * Gavekort er guld — den fangede krone; Book/Ring er de stille studie-stier.
 */
export function MobileDock() {
  const [heroOut, setHeroOut] = useState(false);
  const [bookingIn, setBookingIn] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("emerge");
    const sentinel = document.querySelector("[data-dock-sentinel]");
    const observers: IntersectionObserver[] = [];

    if (hero) {
      const io = new IntersectionObserver(
        ([e]) => setHeroOut(!e.isIntersecting),
        { threshold: 0 },
      );
      io.observe(hero);
      observers.push(io);
    }
    if (sentinel) {
      // Tuck når booking-zonens top-anker (1px sentinel) når 75% ned i viewporten.
      // Binært på et punkt — sektionshøjden er irrelevant (SceneV05 kan ændre
      // booking-zonen frit uden at flytte tuck-punktet).
      const io = new IntersectionObserver(
        ([e]) => setBookingIn(e.isIntersecting),
        { threshold: 0, rootMargin: "0px 0px -25% 0px" },
      );
      io.observe(sentinel);
      observers.push(io);
    }
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  const shown = heroOut && !bookingIn;

  return (
    <nav
      className={`mobile-dock${shown ? " is-shown" : ""}`}
      aria-label="Hurtige handlinger"
      aria-hidden={!shown || undefined}
    >
      <a
        className="mobile-dock__item"
        href={site.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Book tid (åbner i nyt vindue)"
        tabIndex={shown ? undefined : -1}
      >
        Book
      </a>
      <a
        className="mobile-dock__item"
        href={`tel:${site.phoneIntl}`}
        aria-label={`Ring til Ink & Art, ${site.phone}`}
        tabIndex={shown ? undefined : -1}
      >
        Ring
      </a>
      <a
        className="mobile-dock__item mobile-dock__item--gold"
        href="/gavekort"
        tabIndex={shown ? undefined : -1}
      >
        Gavekort
      </a>
    </nav>
  );
}
