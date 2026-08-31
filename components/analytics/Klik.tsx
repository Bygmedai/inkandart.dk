"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { doemKlik } from "@/lib/klik";

/**
 * Klik-events til Vercel Analytics (Haruki #245 C).
 *
 * Målt 31/8: 650 besøg og 1.427 visninger på 30 dage — og «No custom
 * events». Vi ser hvem der kommer, ikke hvem der klikker.
 *
 * HVORFOR ÉN DELEGERET LYTTER OG IKKE ET onClick PR. LINK: husets regel er
 * at handelsflader ikke må være klientkomponenter — de skal virke uden JS
 * (CLAUDE.md §5). Et `onClick` på «Tag den →» ville gøre `/flash` og
 * `/shop` til klientflader for en målings skyld.
 *
 * Her er linkene uændrede, server-renderede `<a>`. Denne ø lytter på
 * document. Uden JS virker købet stadig; vi mister kun tallet, og det er
 * den rigtige ting at miste.
 *
 * Sidegevinst: de fleste flader kendes på deres href, så ingen andres fil
 * skal røres — og et Book.dk-link nogen tilføjer i morgen tælles med af
 * sig selv.
 *
 * Dommen selv bor i lib/klik.ts, uden runtime-imports, så den kan prøves.
 */
export function KlikVagt() {
  useEffect(() => {
    function paaKlik(e: MouseEvent) {
      const maal = e.target;
      if (!(maal instanceof Element)) return;
      const a = maal.closest("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;

      const d = doemKlik({
        href: a.getAttribute("href") || "",
        data: {
          event: a.dataset.hzEvent,
          handle: a.dataset.hzHandle,
          pris: a.dataset.hzPris,
          artist: a.dataset.hzArtist,
        },
        pathname: location.pathname,
        search: location.search,
      });
      if (!d) return;

      try {
        track(d.navn, d.props);
      } catch {
        // En måling må aldrig kunne stå i vejen for et køb.
      }
    }
    document.addEventListener("click", paaKlik, { capture: true });
    return () => document.removeEventListener("click", paaKlik, { capture: true });
  }, []);
  return null;
}
