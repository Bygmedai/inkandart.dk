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
  "/booking",
  "/stolen",
  "/gaden",
  "/aftercare",
  "/natten",
  // #245 A4 (Villy — RAAB til Haruki, din fil): /en/flash er nu en aegte
  // side. Uden denne raekke 308'er LangSwitch og hreflang den til dansk,
  // selv om siden findes.
  "/flash",
  // /en/piercing er en aegte side (S577). Uden raekken her 308'er
  // LangSwitch og hreflang den til dansk, selv om den findes.
  "/piercing",
  // Samtykkeerklaeringen findes paa begge sprog fra foerste commit — en
  // engelsk kunde skal kunne udfylde den hjemmefra som alle andre.
  "/samtykke",
  // Teamguiden findes paa begge sprog bag husets kode. Uden raekken her
  // 308'er sprogskifteren en engelsk medarbejder til den danske guide.
  "/personale",
]);

/**
 * Rute-FAMILIER der findes på engelsk (S574). En artistside er ikke én
 * rute men én pr. artist, og EN_ROUTES kan ikke liste dem: sættet er en
 * konstant, og at læse content/ her ville trække node:fs ind i hver
 * klient-bundle der importerer i18n (LangDoor, Nav).
 *
 * Præfikset er sandt ved konstruktion: /en/stolen/[id] genereres af
 * samme generateStaticParams som den danske. Kommer der en artist til,
 * findes begge sider i samme commit.
 */
export const EN_ROUTE_PREFIXES: readonly string[] = ["/stolen/", "/shop/"];

function hasEnglish(bare: string): boolean {
  return EN_ROUTES.has(bare) || EN_ROUTE_PREFIXES.some((p) => bare.startsWith(p));
}

/** `/walk-in` på dansk, `/en/walk-in` på engelsk — hvis ruten findes. */
export function localePath(lang: Locale, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return p;
  const bare = p.split(/[#?]/)[0];
  if (!hasEnglish(bare)) return p; // ingen engelsk side endnu → dansk
  return `/en${bare === "/" ? "" : bare}${p.slice(bare.length)}`;
}

/** Findes denne sti på engelsk? Bruges af sprogdøren, så den ikke lyver. */
export function enExists(path: string): boolean {
  const bare = (path.startsWith("/") ? path : `/${path}`).split(/[#?]/)[0];
  return hasEnglish(bare);
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
    legend: "Hold din plads",
    slots: { plads: "Hold min plads", heldag: "Hele dagen" },
    /**
     * Skærmlæser-navnet BEGYNDER med det ord der står på knappen (WCAG
     * 2.5.3, Label in Name). Før stod der «Reservér en tid …» på en knap
     * hvor man kunne LÆSE «Hold min plads» — så kunne en der styrer med
     * stemmen ikke sige det hun så. Resten af sætningen forklarer hvad
     * beløbet er; det er den del skærmlæseren tilføjer.
     */
    ariaSlots: {
      plads: "Hold min plads — en tid, 100 kroner i depositum",
      heldag: "Hele dagen — en heldags-session, 1.000 kroner i depositum",
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
   * Kundens ord i nav'en (Artister, Shop, Aftener, Find os) er etiketter og
   * skifter sprog (S579). URLerne /stolen, /shop, /natten, /gaden er kundens doere.
   */
  rummet: {
    roomsLabel: "Menu",
    /**
     * Kundens fire døre. S579 (Steven, 3/9): væk fra husets interne navne på
     * kundens skærm. Stolen, Mærket, Natten og Gaden bliver ved med at være
     * ruter, CSS og kode — men det ORD kunden læser skal være det ord hun
     * leder efter. Målt: ingen københavnsk shop siger «Stolen» i sin nav.
     */
    rooms: [
      { href: "/stolen", label: "Artister" },
      { href: "/shop", label: "Shop" },
      { href: "/natten", label: "Aftener" },
      { href: "/gaden", label: "Find os" },
    ],
    /** Tilmeldingsdøren. Før hed den Blackbook — kunstnerens bog — men døren
        ER en tilmelding, og knappen sagde det allerede. */
    listName: "Skriv dig op",
    studioLabel: "Studiet",
    artistsLabel: "Artister",
    shopLabel: "Shop",
    nightsLabel: "Aftener",
    findUsLabel: "Find os",
    seeWork: (n: string, one: boolean) => (one ? `Se ${n} arbejde` : `Se ${n} arbejder`),
    /**
     * Blackbook (S574, copy-audit 30/8). Den gamle linje — «Vi sender kun
     * natten» — sagde intet om hvad mailen indeholder, og lød som en
     * natklub. En liste skal forklare sit udbytte på én sætning.
     * ERSTATTER en linje Steven ratificerede 29/8; sig til hvis den skal
     * tilbage.
     */
    blackbookLine:
      "Nye flash, gæsteartister og aftener i huset. Vi skriver kun, når der er en dato, et drop eller en plads at fortælle om.",
    blackbookEmail: "Email",
    blackbookPlaceholder: "din@mail.dk",
    blackbookGo: "Skriv mig op",
    blackbookBusy: "…",
    blackbookOk: "Tak. Du hører fra os, når der er noget konkret.",
    blackbookFejl: "Noget gik galt — prøv igen.",
    blackbookAfmeld: "Du kan afmelde når som helst.",
    terms: "Betingelser",
    privacy: "Privatliv",
    faq: "FAQ",
    /** Artisterne og artistsiderne. Kundens ord, ikke rummets (S579). */
    backToStolen: "Artister",
    works: "Arbejder",
    worksComing: "Billeder på vej",
    seeOnWall: "Se dem under Arbejde i shoppen",
    bookTid: "Book tid",
    walkIn: "Walk-in — kom forbi",
    noGuest: "Ingen gæsteartist annonceret lige nu",
    guestPending: "Gæst · navn følger",
    /**
     * Perioden i stolen (Villy, S576 — RAAB til Haruki, din fil).
     * periodeLabel() returnerede haardkodet dansk, saa «Fast» stod paa
     * ALLE engelske artist-flader: /en, /en/stolen og hver artistside.
     * Maalt 31/8 i bygget HTML: 6 forekomster paa listen alene.
     */
    periode: {
      fast: "Fast",
      gaest: "Gæst",
      til: (dato: string) => `I studiet til ${dato}`,
    },
    /**
     * Artistens tider (Villy, S576 — RAAB til Haruki, din fil).
     * Ugedage er ikke nogens ord; de er etiketter og maa oversaettes her.
     * Klokkeslettene staar i artists.yml og er artistens egne.
     */
    tider: {
      label: "I studiet",
      og: "og",
      // Dagene staar som de ser ud MIDT i en saetning. Dansk skriver
      // ugedage med lille; engelsk med stort. Komponenten stort-skriver
      // kun linjens foerste tegn — saa bliver begge sprog rigtige af
      // samme regel. «Tirsdag og Onsdag» var forkert dansk (maalt 31/8).
      dag: {
        man: "mandag", tir: "tirsdag", ons: "onsdag", tor: "torsdag",
        fre: "fredag", loer: "lørdag", son: "søndag",
      },
    },
    walkInLine: "Walk-in når der er en fri stol — ellers book.",
    /**
     * Nattespot (Villy, S574). Skaermlaeser-saetningen for koebsknappen.
     * Laa foerst haardkodet paa dansk i NattenFlade — og fulgte derfor med
     * ud paa /en, hvor en engelsk kunde fik «300 kroner i depositum» laest
     * op. Knappen ER etiketten for den der ikke kan se den. Maalt 30/8.
     */
    spotAria: (handling: string, pris: string) =>
      `${handling} — ${pris} kroner i depositum`,
    comeBy: (adresse: string) => `Kom forbi ${adresse} og se arbejdet i virkeligheden.`,
    bioIsDanish: "Artistens egne ord, på dansk.",
    /**
     * Galleri-slotten paa artistsiden (Villy, S575 — RAAB til Haruki, din
     * fil). Knappen er WCAG 2.2 SC 2.2.2's pause-mulighed, ikke pynt.
     * Den laa naesten haardkodet paa dansk; det er praecis den fejlklasse
     * der gav danske aria-labels paa /en (rapporteret paa #232).
     */
    galleriPause: "Pause billederne",
    galleriAfspil: "Afspil billederne",
    giftCard: "Gavekort",
    /* Shoppen. Prints og Arbejde er kundens ord for hylden og væggen (S579). */
    shelfLabel: "Prints",
    shelfEmpty: "Ingen prints lige nu.",
    wallLabel: "Arbejde",
    artistFilter: "Artist",
    noWorksFrom: (navn: string) => `Ingen arbejder fra ${navn} endnu.`,
    meetIn: (navn: string) => `Mød ${navn} hos artisterne`,
    orSee: " — eller ",
    wholeWall: "se alt arbejdet",
    /* Natten. Uden navne på plakaten står der en gæste-DJ, ikke et navn
       vi ikke har fået. */
    guestDj: "Gæste-DJ",
    /* Forsidens aften-felt. En tom kalender er en tom kalender — ikke
       en mytologi om noget der venter. */
    tonightLabel: "I aften",
    noEvent: "Ingen aften planlagt lige nu",
    noEventLine: "Vil du have næste dato? Skriv dig op.",
    seePoster: "Se plakaten",
  },

  shop: {
    metaTitle: "Shop · Ink & Art",
    metaDescription:
      "Gavekort, walk-in, flash, reservationer og husets prints — samlet ét sted. Ink & Art Copenhagen, Larsbjørnsstræde 13.",
    kicker: "Shop",
    title: "Shop",
    intro: "Alt herunder betales hos Shopify — MobilePay, kort eller wallet. Blækket betales i studiet,",
    doors: {
      gavekort: "Giv blæk videre. Fem beløb, sendes eller printes.",
      walkin: "To små. I aften. Ingen booking.",
      flash: "Færdigtegnede motiver til fast pris. Først til mølle.",
    },
    reservations: "Reservationer",
    wallLabel: "Prints",
    wallTitle: "Prints og objekter.",
    wallIntro:
      "Husets motiver som prints og objekter — trykt og støbt i små oplag. Når et er væk, er det væk. Skriv dig op, så ser du de næste først.",
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
      /** Begynder med knappens eget ord — se kerb.ariaSlots (WCAG 2.5.3). */
      aria: (sted: string, pris: string) =>
        `Hold plads — piercing i ${sted}, ${pris} kroner i depositum`,
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
        `Hold tiden — en flash-tid ${sted}, ${pris} kroner i depositum`,
    },
    note: "Vil du have besked når de næste hænger?",
    noteLink: "Skriv dig op →",
  },
  walkin: {
    kicker: "Walk-in",
    title: "To små. I aften.",
    lede: (street: string) =>
      `To små tatoveringer. Ingen booking. Betal her, vis kvitteringen på ${street} — eller betal i studiet.`,
    steps: [
      { t: "Betal beløbet", d: "MobilePay, kort eller wallet. Checkout ligger hos Shopify." },
      { t: "Kom forbi", d: "Vis kvitteringen." },
      { t: "Sæt dig", d: "To små. Walk-in — når stolen er ledig." },
    ],
    cta: (kr: string) => `Betal ${kr} kr →`,
    giftLink: "Gavekort →",
    metaTitle: "Walk-in · Ink & Art",
    metaDescription:
      "To små tatoveringer. Ingen booking. Kom forbi Larsbjørnsstræde 13 og vis kvitteringen.",
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
    legend: "Hold your spot",
    slots: { plads: "Hold my spot", heldag: "The whole day" },
    ariaSlots: {
      plads: "Hold my spot — a slot, 100 kroner deposit",
      heldag: "The whole day — a full-day session, 1.000 kroner deposit",
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

  rummet: {
    roomsLabel: "Menu",
    rooms: [
      { href: "/stolen", label: "Artists" },
      { href: "/shop", label: "Shop" },
      { href: "/natten", label: "Nights" },
      { href: "/gaden", label: "Find us" },
    ],
    listName: "Join the list",
    studioLabel: "Studio",
    artistsLabel: "Artists",
    shopLabel: "Shop",
    nightsLabel: "Nights",
    findUsLabel: "Find us",
    seeWork: (n: string, one: boolean) => (one ? `See ${n} piece` : `See ${n} pieces`),
    blackbookLine:
      "New flash, guest artists and studio events. We only write when there is a date, a drop or a spot to share.",
    blackbookEmail: "Email",
    blackbookPlaceholder: "you@mail.com",
    blackbookGo: "Sign me up",
    blackbookBusy: "…",
    blackbookOk: "Thank you. You'll hear from us when there is something concrete.",
    blackbookFejl: "Something went wrong — try again.",
    blackbookAfmeld: "You can unsubscribe at any time.",
    terms: "Terms",
    privacy: "Privacy",
    faq: "FAQ",
    backToStolen: "Artists",
    works: "Work",
    worksComing: "Photos on the way",
    seeOnWall: "See them under Work in the shop",
    bookTid: "Book a time",
    walkIn: "Walk-in — come by",
    noGuest: "No guest artist announced right now",
    guestPending: "Guest · name to follow",
    periode: {
      fast: "Resident",
      gaest: "Guest",
      til: (dato: string) => `In the studio until ${dato}`,
    },
    tider: {
      label: "In the studio",
      og: "and",
      dag: {
        man: "Monday", tir: "Tuesday", ons: "Wednesday", tor: "Thursday",
        fre: "Friday", loer: "Saturday", son: "Sunday",
      },
    },
    walkInLine: "Walk-in when a chair is free — otherwise book.",
    spotAria: (handling: string, pris: string) =>
      `${handling} — ${pris} DKK deposit`,
    comeBy: (adresse: string) => `Come by ${adresse} and see the work for real.`,
    bioIsDanish: "The artist's own words, in Danish.",
    galleriPause: "Pause the photos",
    galleriAfspil: "Play the photos",
    /** Gavekortet hedder Gavekort i huset — men på engelsk skal en
        turist kunne se HVAD døren er. */
    giftCard: "Gift card",
    shelfLabel: "Prints",
    shelfEmpty: "No prints right now.",
    wallLabel: "Work",
    artistFilter: "Artist",
    noWorksFrom: (navn: string) => `No work from ${navn} yet.`,
    meetIn: (navn: string) => `Meet ${navn} with the artists`,
    orSee: " — or ",
    wholeWall: "see all the work",
    guestDj: "Guest DJ",
    tonightLabel: "Tonight",
    noEvent: "No evening planned right now",
    noEventLine: "Want the next date? Join the list.",
    seePoster: "See the poster",
  },

  shop: {
    metaTitle: "Shop · Ink & Art",
    metaDescription:
      "Gift cards, walk-in, flash, deposits and the house prints — in one place. Ink & Art Copenhagen, Larsbjørnsstræde 13.",
    kicker: "Shop",
    title: "Shop",
    intro: "Everything below is paid at Shopify — MobilePay, card or wallet. The ink itself is paid in the studio,",
    doors: {
      gavekort: "Pass the ink on. Five amounts, sent or printed.",
      walkin: "Two small ones. Tonight. No booking.",
      flash: "Ready-drawn pieces at a fixed price. First come, first served.",
    },
    reservations: "Deposits",
    wallLabel: "Prints",
    wallTitle: "Prints and objects.",
    wallIntro:
      "House motifs as prints and objects — printed and cast in small runs. When one is gone, it is gone. Join the list and you see the next ones first.",
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
        `Hold a slot — a piercing in ${sted}, ${pris} kroner deposit`,
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
        `Hold the slot — a flash slot ${sted}, ${pris} kroner deposit`,
    },
    note: "Want word when the next ones go up?",
    noteLink: "Join the list →",
  },
  walkin: {
    kicker: "Walk-in",
    // Ikke «Two small. Tonight.» — det lyder som en menu. Dette er samme
    // knappe, konkrete tonefald som det danske.
    title: "Two small ones. Tonight.",
    lede: (street: string) =>
      `Two small tattoos. No booking. Pay here and show the receipt at ${street} — or pay in the studio.`,
    steps: [
      { t: "Pay the amount", d: "Card or wallet. Checkout is handled by Shopify." },
      { t: "Come by", d: "Show the receipt." },
      { t: "Sit down", d: "Two small ones. Walk-in — when the chair is free." },
    ],
    cta: (kr: string) => `Pay ${kr} DKK →`,
    giftLink: "Gift cards →",
    metaTitle: "Walk-in · Ink & Art Copenhagen",
    metaDescription:
      "Two small tattoos. No booking. Come by Larsbjørnsstræde 13 and show the receipt.",
  },
};

export const copy = { da, en } as const;

export function t(lang: Locale) {
  return copy[lang] as typeof da;
}
