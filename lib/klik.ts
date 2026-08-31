/**
 * Hvilket event er et klik? (Haruki #245 C)
 *
 * Ren funktion, ingen runtime-imports, så dommen kan prøves uden en browser.
 * Ledningen — den delegerede lytter — bor i components/analytics/Klik.tsx.
 *
 * INGEN PII. Kun tre egenskaber er tilladt, og alle tre er offentlige:
 * handle, pris, artist. Telefonnumre, mailadresser og fritekst når aldrig
 * herind, hverken fra et href eller fra DOM'en.
 */

export const TILLADTE_EGENSKABER = ["handle", "pris", "artist"] as const;

/**
 * Ring-events kun hvor Haruki bad om dem. En tel:-linje står i footeren på
 * hver eneste side; talte vi dem alle, ville signalet fra de to steder hvor
 * et opkald ER en beslutning drukne.
 */
export const RING_RUTER = ["/booking", "/en/booking", "/gaden", "/en/gaden"];

export type KlikEvent = { navn: string; props: Record<string, string | number> };

export type KlikInput = {
  /** href præcis som det står i attributten. */
  href: string;
  /** data-hz-*-attributter, uden præfiks: { event, handle, pris, artist }. */
  data: Record<string, string | undefined>;
  /** Sidens sti, uden query. */
  pathname: string;
  /** Sidens query, med «?». Bruges kun til at finde artisten. */
  search?: string;
};

function egenskaber(data: KlikInput["data"]): Record<string, string | number> {
  const ud: Record<string, string | number> = {};
  for (const navn of TILLADTE_EGENSKABER) {
    const v = data[navn];
    if (typeof v !== "string" || !v.trim()) continue;
    const t = v.trim();
    // En data-attribut er altid tekst. Prisen skal vaere et TAL, ellers kan
    // Vercel ikke summere den — og en pris man ikke kan summere er en pris
    // man ikke kan bruge til noget.
    ud[navn] = navn === "pris" && /^\d+(\.\d+)?$/.test(t) ? Number(t) : t;
  }
  return ud;
}

/**
 * Artisten, når den kan læses af noget offentligt.
 *
 * Tre steder, i den rækkefølge — og det andet er ikke pynt: artistsiden
 * linker til `/booking?artist=nizar`, og Book.dk-linket står FØRST på
 * booking-siden. Uden query-leddet mister vi artisten i præcis det flow
 * hvor den betyder noget (målt lokalt 31/8: `book_klik` uden egenskaber).
 */
export function artistFra(href: string, pathname: string, search = ""): string {
  for (const kilde of [href, search]) {
    const q = kilde.match(/[?&]artist=([^&#]+)/);
    if (q) {
      try {
        return decodeURIComponent(q[1]);
      } catch {
        return q[1];
      }
    }
  }
  const m = pathname.match(/^\/(?:en\/)?stolen\/([^/]+)$/);
  return m ? m[1] : "";
}

export function doemKlik(input: KlikInput): KlikEvent | null {
  const { href, data, pathname, search = "" } = input;

  // Eksplicit navn vinder. Bruges hvor href'en ikke kan skelne — en
  // fredagsflash-plads og et print er begge en cart-permalink.
  if (data.event && data.event.trim()) {
    return { navn: data.event.trim(), props: egenskaber(data) };
  }

  if (!href) return null;

  if (href.startsWith("tel:")) {
    // Nummeret selv kommer aldrig med. Det er husets eget og siger intet
    // vi ikke ved — men vanen med at lade et href blive til en property
    // er præcis den der en dag sender noget andet af sted.
    return RING_RUTER.includes(pathname) ? { navn: "ring_klik", props: {} } : null;
  }

  if (href.includes("book.dk")) {
    const a = artistFra(href, pathname, search);
    return { navn: "book_klik", props: a ? { artist: a } : {} };
  }

  if (href.includes("/cart/")) {
    return { navn: "koeb_klik", props: egenskaber(data) };
  }

  return null;
}
