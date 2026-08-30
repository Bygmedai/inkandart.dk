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
