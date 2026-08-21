/**
 * Dansk er kanonisk. Engelsk er en parallel flade — ikke en oversættelse.
 *
 * Stevens kald (S568): «egen stemme, samme ånd». «TUSSE · IKKE TERAPI»
 * oversættes ikke, den genskrives så den rammer lige så hårdt. Det praktiske
 * — priser, adresse, aftercare — skal derimod være ordret præcist.
 *
 * HEGNET: `Copy` udledes af `da`. Mangler en nøgle i `en`, er det en
 * TYPEFEJL, ikke en halvfærdig side i produktion. Man kan ikke udgive en
 * halvt oversat flade her; buildet nægter.
 *
 * Ruter: dansk bor på roden (`/walk-in`), engelsk på `/en/walk-in`. Ingen
 * eksisterende rute flyttes — tre andre agenter bygger i samme repo, og en
 * omlægning af rute-træet ville kollidere med dem alle.
 */

export const LOCALES = ["da", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "da";

/** `/walk-in` på dansk, `/en/walk-in` på engelsk. Roden er dansk. */
export function localePath(lang: Locale, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === DEFAULT_LOCALE ? p : `/en${p === "/" ? "" : p}`;
}

/** Gensidige hreflang-par + x-default. Google kræver at de peger på hinanden. */
export function alternates(path: string) {
  return {
    canonical: localePath("da", path),
    languages: {
      "da-DK": localePath("da", path),
      "en": localePath("en", path),
      "x-default": localePath("da", path),
    },
  };
}

const da = {
  langName: "Dansk",
  nav: { work: "Work", artist: "Artist", gift: "Gavekort", booking: "Booking →" },
  dock: { book: "Book", call: "Ring", gift: "Gavekort" },
  giftRelicAria: "Gavekort — giv blæk videre",
  scene: {
    scroll: "Scroll down to emerge",
    /** Under gaden — gadens eget bånd. Dansk ER pointen her: det er stedet. */
    gadeLegend:
      "MIDT I PISSERENDEN  —  DUERNE HAR OGSÅ BLÆK  —  RENDESTENEN LØBER IKKE MED VAND  —  KANTSTENEN ER VORES VENTEVÆRELSE  —  ",
    gadeCaption: "Larsbjørnsstræde — midt i Pisserenden",
    artistLine1: "Vi dekorerer ikke.",
    artistLine2: "Vi committer.",
    findUs: "Midt i Pisserenden — du finder os",
    flash: "Flash →",
    callAria: (phone: string) => `Ring til Ink & Art, ${phone}`,
    screens: { hero: "Hero", street: "Under gaden", work: "Work", artist: "Artist", booking: "Booking" },
  },

  otherLangName: "English",
  skipToContent: "Gå til indhold",
  backTo: "←",

  walkin: {
    kicker: "Walk-in",
    title: "To små. I aften.",
    lede: (kr: string, street: string) =>
      `To små tatoveringer for ${kr} kr. Ingen booking. Betal her, vis kvitteringen på ${street} — eller betal i studiet.`,
    steps: [
      { t: "Betal beløbet", d: "MobilePay, kort eller wallet. Checkout ligger hos Shopify." },
      { t: "Kom forbi", d: "Vis kvitteringen." },
      { t: "Sæt dig", d: "To små. Walk-in — når stolen er ledig." },
    ],
    cta: (kr: string) => `Betal ${kr} kr →`,
    giftLink: "Gavekort →",
    metaTitle: "Walk-in · Ink & Art",
    metaDescription:
      "To små tatoveringer for 900 kr. Ingen booking. Kom forbi Larsbjørnsstræde 13 og vis kvitteringen.",
  },
} as const;

/**
 * Formen er dansk — HELE VEJEN NED.
 *
 * Første udgave af det her hegn mappede kun topniveauet, så en manglende
 * NESTET nøgle slap igennem. Fundet med negativ kontrol: jeg fjernede
 * `scene.findUs` fra den engelske ordbog, og buildet blev grønt. Et hegn
 * der kun dækker den yderste ring er ikke et hegn.
 *
 * `Widen` beholder strukturen og løsner literalerne, så engelsk må have
 * sine egne ord — men ikke sine egne huller.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends (...a: infer A) => infer R
        ? (...a: A) => R
        : T extends readonly (infer U)[]
          ? Widen<U>[]
          : { [K in keyof T]: Widen<T[K]> };

type Copy = Widen<typeof da>;

const en: Copy = {
  langName: "English",
  nav: { work: "Work", artist: "Artist", gift: "Gift cards", booking: "Booking →" },
  dock: { book: "Book", call: "Call", gift: "Gift cards" },
  giftRelicAria: "Gift cards — pass the ink on",
  scene: {
    scroll: "Scroll down to emerge",
    // Gadenavnene oversættes IKKE — Pisserenden er stedet, ikke en beskrivelse.
    // Kun sætningerne omkring dem skifter sprog.
    gadeLegend:
      "DEEP IN PISSERENDEN  —  EVEN THE PIGEONS HAVE INK  —  THE GUTTER DOESN'T RUN WITH WATER  —  THE KERB IS OUR WAITING ROOM  —  ",
    gadeCaption: "Larsbjørnsstræde — deep in Pisserenden",
    artistLine1: "We don't decorate.",
    artistLine2: "We commit.",
    findUs: "Deep in Pisserenden — you'll find us",
    flash: "Flash →",
    callAria: (phone: string) => `Call Ink & Art, ${phone}`,
    screens: { hero: "Hero", street: "Under the street", work: "Work", artist: "Artist", booking: "Booking" },
  },

  otherLangName: "Dansk",
  skipToContent: "Skip to content",
  backTo: "←",

  walkin: {
    kicker: "Walk-in",
    // Ikke «Two small. Tonight.» — det lyder som en menu. Dette er samme
    // knappe, konkrete tonefald som det danske.
    title: "Two small ones. Tonight.",
    lede: (kr: string, street: string) =>
      `Two small tattoos for ${kr} DKK. No booking. Pay here and show the receipt at ${street} — or pay in the studio.`,
    steps: [
      { t: "Pay the amount", d: "Card or wallet. Checkout is handled by Shopify." },
      { t: "Come by", d: "Show the receipt." },
      { t: "Sit down", d: "Two small ones. Walk-in — when the chair is free." },
    ],
    cta: (kr: string) => `Pay ${kr} DKK →`,
    giftLink: "Gift cards →",
    metaTitle: "Walk-in · Ink & Art Copenhagen",
    metaDescription:
      "Two small tattoos for 900 DKK. No booking. Come by Larsbjørnsstræde 13 and show the receipt.",
  },
};

export const copy = { da, en } as const;

export function t(lang: Locale) {
  return copy[lang] as typeof da;
}
