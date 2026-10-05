import {
  chairArtists,
  guestState,
  loadAabningstider,
  loadHouse,
  loadKontakt,
  loadSkema,
  loadTeamguide,
  loadTeamguideEn,
  profiledArtists,
  visibleVaerkerForArtist,
} from "@/lib/content";
import { foto } from "@/lib/foto";
import { byggHuset } from "@/lib/huset";
import { site } from "@/lib/site";

/**
 * GET /api/huset — huset som data til appen. Se lib/huset.ts for hvorfor.
 *
 * Alt her står allerede offentligt på sitet. Ingen kundedata, ingen
 * nøgler — derfor åben CORS uden credentials. Appens kald er et simpelt
 * GET uden egne headers, så der kommer ingen preflight og intet OPTIONS.
 * Statisk: bygges én gang pr. udrulning fra content/*.yml, så appen er
 * opdateret samtidig med sitet.
 */
export const dynamic = "force-static";

const CORS = {
  "Access-Control-Allow-Origin": "*",
};

/** Absolut URL, i telefonstørrelse (800w) når varianten findes. */
function billede(src: string): string {
  if (!src) return "";
  const w800 = foto(src, "100vw").srcSet?.split(", ").find((s) => s.endsWith(" 800w"))?.split(" ")[0];
  return `${site.url}${w800 ?? src}`;
}

export function GET(): Response {
  const house = loadHouse();
  const profiler = new Set(profiledArtists(house.artists).map((a) => a.id));
  const gaest = guestState(house.artists);
  const tg = loadTeamguide();
  const tgEn = loadTeamguideEn();
  const huset = byggHuset({
    stolen: chairArtists(house.artists).filter((a) => profiler.has(a.id)),
    gaest: gaest.kind === "named" ? gaest.artist : undefined,
    vaerkerFor: (id) => visibleVaerkerForArtist(house.vaerker, id),
    kontakt: loadKontakt(),
    whatsapp: site.whatsapp,
    booking: site.bookingUrl,
    aabningstider: loadAabningstider(),
    skema: loadSkema(undefined, house.artists),
    priserTattoo: { da: tg.priser_tattoo, en: tgEn.priser_tattoo },
    priserFlash: { da: tg.priser_flash, en: tgEn.priser_flash },
    billede,
  });
  return Response.json(huset, { headers: CORS });
}
