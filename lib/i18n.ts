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
    /* Kundens ord (S568): «knapperne skal være større og mere tydelige».
       Verbet skal være et verbum — ikke «Booking». */
    bookCta: "Book tid",
    /** Doeren i bunden af Nizars afsnit — kriterium 3. Personlig med vilje:
        man har lige moedt manden, saa knappen skal naevne ham. */
    bookArtist: "Book hos Nizar",
    /** Doeren i bunden af «Selected work» — kriterium 2. */
    bookWork: "Book tid",
    trade: "Tatovering & piercing",
    shop: "Shop →",
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

  /** Seglet i toppen af undersiderne er baade maerke og vej hjem. */
  mastheadAria: "Ink & Art Copenhagen — til forsiden",
  otherLangName: "English",
  skipToContent: "Gå til indhold",
  backTo: "←",

  shop: {
    metaTitle: "Gaden sælger · Ink & Art",
    metaDescription:
      "Gavekort, walk-in, flash, reservationer og husets prints — alt det gaden sælger, samlet ét sted. Ink & Art Copenhagen, Larsbjørnsstræde 13.",
    kicker: "Shop",
    title: "Gaden sælger.",
    intro: "Alt herunder betales hos Shopify — MobilePay, kort eller wallet. Blækket betales i studiet,",
    doors: {
      gavekort: "Giv blæk videre. Fem beløb, sendes eller printes.",
      walkin: "To små. I aften. 900,- — ingen booking.",
      flash: "Færdigtegnede motiver til fast pris. Først til mølle.",
    },
    reservations: "Reservationer",
    wallLabel: "Væggen",
    wallTitle: "Snart på væggen.",
    wallIntro:
      "Husets motiver som prints og objekter — trykt og støbt i små oplag. De hænger her, når de er klar. Blackbook ser dem først.",
    prints: {
      dolk: "Et af husets motiver, trykt i hånden på tykt papir.",
      ouroboros: "Slangen der bider sig selv i halen. Lille oplag.",
      signetring: "Støbt i sterlingsølv efter en af husets tegninger.",
    },
    soon: "Snart",
    buyAria: (navn: string, pris: string) => `Køb ${navn}, ${pris} kroner`,
    /**
     * Piercing — huset har solgt det i Shopify siden juli, men ordet stod
     * ikke ét sted på sitet. Beta-testen ("Er det en tatto shop?") var det
     * samme hul set fra kundens side. Copy'en siger hvad depositummet ER —
     * en holdt plads, ikke en booket tid (rails §4).
     */
    piercing: {
      label: "Piercing",
      title: "Vi piercer også.",
      intro:
        "Nålen er ikke kun til blæk. Hold din plads med 100,- i depositum — beløbet trækkes fra prisen. Tiden aftaler vi bagefter.",
      slots: {
        ore: "Øre",
        krop: "Krop",
        ansigt: "Ansigt",
        mund: "Mund",
      },
      /**
       * Skærmlæser-udgaven af stednavnet. Knappen viser «Øre» fordi et kort
       * skal kunne skimmes; en oplæst sætning skal kunne HØRES, og «Reservér
       * piercing — Øre — med 100 kroner» er ikke en sætning. Derfor bøjer vi
       * ordet her i stedet for at genbruge etiketten.
       */
      ariaSlots: {
        ore: "øret",
        krop: "kroppen",
        ansigt: "ansigtet",
        mund: "munden",
      },
      koeb: "Hold plads",
      aria: (sted: string, pris: string) =>
        `Reservér piercing i ${sted} med ${pris} kroner i depositum`,
    },
    /** Flash-tider: depositummet holder en TID, aldrig et bestemt motiv. */
    flashDepositum: {
      label: "Flash-tid",
      title: "Hold en flash-tid.",
      intro:
        "Motiverne lægges op løbende, men tiden kan holdes nu. Depositummet trækkes fra prisen på tatoveringen.",
      slots: {
        shoppen: "I shoppen · Larsbjørnsstræde 13",
        module: "På Module",
      },
      /** Samme grund: etiketten har et «·» i sig, en sætning må ikke. */
      ariaSlots: {
        shoppen: "i shoppen på Larsbjørnsstræde 13",
        module: "på Module",
      },
      koeb: "Hold tiden",
      aria: (sted: string, pris: string) =>
        `Hold en flash-tid ${sted} med ${pris} kroner i depositum`,
    },
    note: "Vil du have besked når væggen fyldes?",
    noteLink: "Skriv dig i Blackbook →",
  },
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
    bookCta: "Book now",
    bookArtist: "Book with Nizar",
    bookWork: "Book a time",
    trade: "Tattoo & piercing",
    shop: "Shop →",
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

  mastheadAria: "Ink & Art Copenhagen — home",
  otherLangName: "Dansk",
  skipToContent: "Skip to content",
  backTo: "←",

  shop: {
    metaTitle: "The street sells · Ink & Art",
    metaDescription:
      "Gift cards, walk-in, flash, deposits and the house prints — everything the street sells, in one place. Ink & Art Copenhagen, Larsbjørnsstræde 13.",
    kicker: "Shop",
    title: "The street sells.",
    intro: "Everything below is paid at Shopify — MobilePay, card or wallet. The ink itself is paid in the studio,",
    doors: {
      gavekort: "Pass the ink on. Five amounts, sent or printed.",
      walkin: "Two small ones. Tonight. 900,- — no booking.",
      flash: "Ready-drawn pieces at a fixed price. First come, first served.",
    },
    reservations: "Deposits",
    wallLabel: "The wall",
    wallTitle: "Soon on the wall.",
    wallIntro:
      "House motifs as prints and objects — printed and cast in small runs. They hang here when they are ready. Blackbook sees them first.",
    prints: {
      dolk: "One of the house motifs, hand-printed on heavy paper.",
      ouroboros: "The snake that bites its own tail. Small run.",
      signetring: "Cast in sterling silver after one of the house drawings.",
    },
    soon: "Soon",
    buyAria: (navn: string, pris: string) => `Buy ${navn}, ${pris} kroner`,
    piercing: {
      label: "Piercing",
      title: "We pierce too.",
      intro:
        "The needle isn't only for ink. Hold your slot with a 100,- deposit — it comes off the price. We agree the time afterwards.",
      slots: {
        ore: "Ear",
        krop: "Body",
        ansigt: "Face",
        mund: "Mouth",
      },
      ariaSlots: {
        ore: "the ear",
        krop: "the body",
        ansigt: "the face",
        mund: "the mouth",
      },
      koeb: "Hold a slot",
      aria: (sted: string, pris: string) =>
        `Reserve a piercing in ${sted} with a ${pris} kroner deposit`,
    },
    flashDepositum: {
      label: "Flash slot",
      title: "Hold a flash slot.",
      intro:
        "Pieces go up as they're drawn, but the slot can be held now. The deposit comes off the price of the tattoo.",
      slots: {
        shoppen: "In the shop · Larsbjørnsstræde 13",
        module: "At Module",
      },
      ariaSlots: {
        shoppen: "in the shop on Larsbjørnsstræde 13",
        module: "at Module",
      },
      koeb: "Hold the slot",
      aria: (sted: string, pris: string) =>
        `Hold a flash slot ${sted} with a ${pris} kroner deposit`,
    },
    note: "Want word when the wall fills up?",
    noteLink: "Sign the Blackbook →",
  },
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
