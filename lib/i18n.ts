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
/**
 * Ruter der FAKTISK findes under /en. Alt andet falder tilbage til dansk.
 *
 * S568-fejlen: `localePath` byggede glad `/en/gavekort`, uanset at ruten
 * ikke fandtes — og `app/en/[...slug]/route.ts` svarer 410 GONE på ukendte
 * engelske stier. Forsiden /en havde FIRE døde døre i produktion: tre til
 * /en/gavekort (nav, gaverelikvie, mobil-dock) og én til /en/blackbook.
 *
 * Vilde skrev en test mod netop det, men den læser kildetekst — og et
 * computed `localePath(lang, "/gavekort")` er usynligt for et regex.
 * Derfor bor hegnet nu i funktionen: den KAN ikke længere pege på en dør
 * der ikke findes. «Hellere dansk end 410.»
 *
 * Når en ejer porterer sin side, tilføjes stien her — og linkene følger
 * automatisk med.
 */
export const EN_ROUTES: ReadonlySet<string> = new Set([
  "/",
  "/walk-in",
  "/shop",
  "/betingelser",
  "/faq",
  "/privatlivspolitik",
]);

/** `/walk-in` på dansk, `/en/walk-in` på engelsk — hvis ruten findes. */
export function localePath(lang: Locale, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return p;
  const bare = p.split(/[#?]/)[0];
  if (!EN_ROUTES.has(bare)) return p; // ingen engelsk side endnu → dansk
  return `/en${bare === "/" ? "" : bare}${p.slice(bare.length)}`;
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
  /** Fuglemors skaermlaeser-linje (Groks motiv, ordene bor her). */
  morSr: "En due i tagrenden. Hun ryger, hun kigger, og hun holder af gaden.",
  /** Kridtet paa kantstenen — stod foer hardkodet dansk i komponenten. */
  kerb: {
    legend: "Kantstenen er vores venteværelse",
    slots: { plads: "Hold min plads", heldag: "Hele dagen" },
    ariaSlots: {
      plads: "Reservér en tid med 100 kroner i depositum",
      heldag: "Reservér en heldags-session med 1.000 kroner i depositum",
    },
    note: "Trækkes fra prisen. Tiden aftaler vi bagefter —",
    book: "book",
    eller: "eller ring",
    bookAria: "Book tid hos Ink & Art (åbner i nyt vindue)",
    ringAria: (navn: string, tlf: string) => `Ring til ${navn}, ${tlf}`,
  },

  otherLangName: "English",
  skipToContent: "Gå til indhold",
  backTo: "←",

  /**
   * Rummets skal — nav, footer og Blackbook-døren (S574).
   *
   * Sirius' fund #5: den engelske oplevelse havde dansk skal. En turist
   * på /en mødte «Betingelser · Privatliv» i footeren og blev sendt til
   * de danske sider. Skallen taler nu det sprog siden er skrevet i.
   *
   * Rumnavnene — Stolen, Mærket, Natten, Gaden — oversættes ALDRIG.
   * De er husets egennavne, ikke etiketter (kanon siden S568).
   */
  rummet: {
    roomsLabel: "Rum",
    blackbookLine: "Vi sender kun natten. Afmeld nederst i mailen.",
    blackbookEmail: "Email",
    blackbookGo: "Tilmeld",
    blackbookBusy: "…",
    blackbookOk: "Du er i bogen.",
    blackbookFejl: "Noget gik galt — prøv igen.",
    terms: "Betingelser",
    privacy: "Privatliv",
    faq: "FAQ",
  },

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
    wallTitle: "På væggen.",
    wallIntro:
      "Husets motiver som prints og objekter — trykt og støbt i små oplag. Når et er væk, er det væk. Blackbook ser de næste først.",
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
    note: "Vil du have besked når de næste hænger?",
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
  morSr: "A pigeon in the gutter. She smokes, she watches, and she loves this street.",
  kerb: {
    legend: "The kerb is our waiting room",
    slots: { plads: "Hold my spot", heldag: "The whole day" },
    ariaSlots: {
      plads: "Reserve a slot with a 100 kroner deposit",
      heldag: "Reserve a full-day session with a 1.000 kroner deposit",
    },
    note: "Comes off the price. We agree the time afterwards —",
    book: "book",
    eller: "or call",
    bookAria: "Book a time at Ink & Art (opens in a new window)",
    ringAria: (navn: string, tlf: string) => `Call ${navn}, ${tlf}`,
  },

  otherLangName: "Dansk",
  skipToContent: "Skip to content",
  backTo: "←",

  /** The room names stay Danish — they are the house's proper nouns. */
  rummet: {
    roomsLabel: "Rooms",
    blackbookLine: "We only send the night. Unsubscribe at the bottom of the mail.",
    blackbookEmail: "Email",
    blackbookGo: "Sign up",
    blackbookBusy: "…",
    blackbookOk: "You're in the book.",
    blackbookFejl: "Something went wrong — try again.",
    terms: "Terms",
    privacy: "Privacy",
    faq: "FAQ",
  },

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
    wallTitle: "On the wall.",
    wallIntro:
      "House motifs as prints and objects — printed and cast in small runs. When one is gone, it is gone. Blackbook sees the next ones first.",
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
    note: "Want word when the next ones go up?",
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
