/**
 * Hvad QA-vagten måler. Ét sted, så workflow og script ikke kan drifte fra
 * hinanden — og så en ny rute tilføjes ét sted i stedet for tre.
 *
 * De seks rum er husets flader (UDRULNING-31-08.md). De to dynamiske ruter
 * er min tilføjelse: #212 gav artisterne egne sider og Mærket varesider, og
 * ingen browser-prøve rørte dem. En rute uden vagt er en rute hvor det
 * næste overløb får lov at stå.
 */

/** De seks flader. Screenshots tages af netop disse, i denne rækkefølge. */
export const RUM = [
  { navn: "Huset", rute: "/" },
  { navn: "Stolen", rute: "/stolen" },
  { navn: "Natten", rute: "/natten" },
  { navn: "Gaden", rute: "/gaden" },
  { navn: "Maerket", rute: "/maerket" },
  { navn: "Booking", rute: "/booking" },
];

/**
 * Måles, men fotograferes ikke. Holdes adskilt fordi briefen bestiller
 * screenshots af seks flader — ikke otte. Skal en af dem med i billed-
 * bladringen, flyttes den op i RUM; så følger begge dele med.
 */
export const EKSTRA = [
  { navn: "Artistside", rute: "/stolen/nizar" },
  { navn: "Vareside", rute: "/maerket/dolk" },
  // Flash blev en koebsflade med flash-droppet (S574). En rute der tager
  // imod penge uden en vagt er en rute hvor det naeste overloeb faar lov.
  { navn: "Flash", rute: "/flash" },

  // S578. Fuld QA fandt fire fejl paa fladen; ingen af dem gik roede her,
  // fordi vagten ikke saa paa de ruter. Porten var groen paa #267 og #270
  // fordi den ikke kiggede der — ikke fordi der ikke var noget at se.
  //
  // De nyeste kundevendte flader. /gavekort tager imod penge og havde
  // ingen vagt — samme klasse hul som de to nye.
  { navn: "Piercingpriser", rute: "/piercing" },
  { navn: "Samtykke", rute: "/samtykke" },
  { navn: "Gavekort", rute: "/gavekort" },

  // Og den engelske flade, som INGEN vagt roerte. En turist moedte de
  // samme layouts som en dansker, uden at én proeve saa dem.
  //
  // Reglen er ikke listen herunder — den er i
  // «QA-vagten ser begge sprog» (tests/qa-daekning.test.mjs): har en
  // vagtet dansk flade en engelsk tvilling i EN_ROUTES, skal tvillingen
  // ogsaa vagtes. Tilfoejer nogen en engelsk side og glemmer den her,
  // gaar den proeve roed. Ellers ville listen bare drifte igen.
  { navn: "EN Huset", rute: "/en" },
  { navn: "EN Stolen", rute: "/en/stolen" },
  { navn: "EN Natten", rute: "/en/natten" },
  { navn: "EN Gaden", rute: "/en/gaden" },
  { navn: "EN Maerket", rute: "/en/maerket" },
  { navn: "EN Booking", rute: "/en/booking" },
  { navn: "EN Artistside", rute: "/en/stolen/nizar" },
  { navn: "EN Flash", rute: "/en/flash" },
  { navn: "EN Piercingpriser", rute: "/en/piercing" },
  { navn: "EN Samtykke", rute: "/en/samtykke" },
];

export const FLADER = [...RUM, ...EKSTRA];

/** Bredder fra briefen. 900px højde er nok til at layoutet folder ud. */
export const BREDDER = [390, 768, 1280, 1440, 1830];

/** Screenshot-bredderne. To er nok til at et menneske kan bladre dem. */
export const SKUD_BREDDER = [390, 1440];

/** Under denne bredde gælder padding-vagten ikke — mobilen har sin egen gutter. */
export const PADDING_FRA = 1100;
export const PADDING_MIN = 16;

/** Trykmål: hårdt gulv for alt, højere gulv for handlinger (WCAG 2.2 SC 2.5.8). */
export const TAP_MIN = 24;
export const HANDLING_MIN = 44;

/**
 * Hvad der tæller som en handling. Bundet til husets egne klasser — og
 * scriptet råber hvis en af dem ikke matcher noget som helst, for et hegn
 * der måler nul er værre end intet hegn (lært fire gange i S568).
 */
export const HANDLINGER = [
  ".rum-footer a",
  ".rum-book",
  ".rum-booking__koeb a, .rum-booking__koeb button",
  ".rum-produkt__koeb button",
  ".rum-door__go",
  ".rum-dock__book",
  ".rum-huset__cta a",
];

/**
 * Hver selektor herover SKAL ramme `a` eller `button`. Første udkast
 * pegede på `.rum-produkt__koeb` og `.rum-booking__koeb` — begge er en
 * `form`/`div` der omkranser knappen. Den ene matchede nul (og råbte);
 * den anden matchede ét stort element og bestod hver gang uden nogensinde
 * at måle en knap. Det er den værste slags hegn: grønt, og tomt.
 * `vagt.mjs` råber nu om begge tilfælde.
 */
