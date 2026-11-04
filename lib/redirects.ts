/** Explicit 308 migration matrix. No /en/* catch-all to the Danish home. */
export type Redirect = {
  source: string;
  destination: string;
  statusCode: 308;
};

export type MigrationRow = {
  from: string;
  to: string;
  reason: string;
};

export const ROUTE_MIGRATION: MigrationRow[] = [
  { from: "/artister/", to: "/#artists", reason: "Artist index is a home section" },
  { from: "/artister/nizar/", to: "/#artist-nizar", reason: "Named artist anchor" },
  { from: "/artister/:slug/", to: "/#artists", reason: "Unknown artist slugs land on the hands" },
  { from: "/find-din-tatovering/", to: "/#artists", reason: "Match-wizard retired" },
  { from: "/del-din-ide/", to: "/#booking", reason: "Idea intake is the quiet form" },
  { from: "/en/privacy/", to: "/en/privatlivspolitik/", reason: "Gammel EN-sti → den engelske side (S574: siden findes nu)" },
  { from: "/en/artists/", to: "/#artists", reason: "EN artists index" },
  { from: "/en/artists/nizar/", to: "/#artist-nizar", reason: "EN named artist" },
  { from: "/en/artists/:slug/", to: "/#artists", reason: "EN unknown artist" },
  { from: "/en/find-your-tattoo/", to: "/#artists", reason: "EN wizard retired" },
  { from: "/en/share-your-idea/", to: "/#booking", reason: "EN intake → chair" },
  { from: "/stolen/anna/", to: "/stolen/", reason: "Anna er ikke længere i huset (Steven 28/9)" },
  // S639 (Steven, 4/11): Shopify er lukket. Shop, gavekort, walk-in, flash og
  // tilmeldingen solgte eller skrev gennem Shopify. Ingen besøgende må lande
  // på en død kasse, så alle stier sendes til et levende sted.
  { from: "/shop/", to: "/", reason: "Shopify lukket (S639)" },
  { from: "/shop/:path*", to: "/", reason: "Shopify lukket (S639)" },
  { from: "/en/shop/", to: "/en", reason: "Shopify lukket (S639)" },
  { from: "/en/shop/:path*", to: "/en", reason: "Shopify lukket (S639)" },
  { from: "/maerket/", to: "/", reason: "Mærket var /shop — Shopify lukket (S639)" },
  { from: "/maerket/:path*", to: "/", reason: "Shopify lukket (S639)" },
  { from: "/en/maerket/", to: "/en", reason: "Shopify lukket (S639)" },
  { from: "/en/maerket/:path*", to: "/en", reason: "Shopify lukket (S639)" },
  { from: "/gavekort/", to: "/", reason: "Gavekort solgtes i Shopify — lukket (S639)" },
  { from: "/gavekort/:path*", to: "/", reason: "Shopify lukket (S639)" },
  { from: "/en/gavekort/", to: "/en", reason: "Shopify lukket (S639)" },
  { from: "/en/gavekort/:path*", to: "/en", reason: "Shopify lukket (S639)" },
  { from: "/walk-in/", to: "/booking/", reason: "Walk-in var en Shopify-checkout (S639)" },
  { from: "/en/walk-in/", to: "/en/booking/", reason: "Walk-in var en Shopify-checkout (S639)" },
  { from: "/flash/", to: "/booking/", reason: "Fredagsflash-depositum var Shopify (S639)" },
  { from: "/en/flash/", to: "/en/booking/", reason: "Fredagsflash-depositum var Shopify (S639)" },
  { from: "/blackbook/", to: "/", reason: "Tilmeldingen skrev til Shopify (S639)" },
  { from: "/en/blackbook/", to: "/en", reason: "Tilmeldingen skrev til Shopify (S639)" },
];

/**
 * Vej B (Steven, S568): webshoppen er pensioneret som storefront — kataloget
 * bor i hub'en på /shop — Rummets hylde, ikke Emerge-butikken. Den gamle butik var en SPA uden egne stier, så alle
 * stier lander samme sted: fladt, ærligt, 308.
 *
 * Reglen er host-gated og dermed INERT indtil shop.inkandart.dk peges på
 * dette projekt — indtil da bærer webshop-repoets vercel.json den samme 308.
 * Wildcard-sourcen må ALDRIG stå uden sin host-vagt: uden den ville hele
 * hub'en redirecte til /shop. Testen håndhæver parret.
 */
export const HOST_MIGRATION: MigrationRow[] = [
  {
    from: "shop.inkandart.dk/:path*",
    to: "https://inkandart.dk/",
    reason: "Shopify lukket — webshoppen er væk (S639)",
  },
];

export type HostRedirect = Redirect & {
  has: [{ type: "host"; value: string }];
};

export const hostRedirects: HostRedirect[] = [
  {
    source: "/:path*",
    has: [{ type: "host", value: "shop.inkandart.dk" }],
    destination: "https://inkandart.dk/",
    statusCode: 308,
  },
];

function slashPair(source: string, destination: string): Redirect[] {
  const trimmed = source.replace(/\/$/, "");
  return [
    { source: trimmed, destination, statusCode: 308 },
    { source: `${trimmed}/`, destination, statusCode: 308 },
  ];
}

export const nextRedirects: Redirect[] = [
  ...slashPair("/artister/nizar", "/#artist-nizar"),
  ...slashPair("/artister/:slug", "/#artists"),
  ...slashPair("/artister", "/#artists"),
  ...slashPair("/find-din-tatovering", "/#artists"),
  ...slashPair("/del-din-ide", "/#booking"),
  ...slashPair("/en/privacy", "/en/privatlivspolitik"),
  ...slashPair("/en/artists/nizar", "/#artist-nizar"),
  ...slashPair("/en/artists/:slug", "/#artists"),
  ...slashPair("/en/artists", "/#artists"),
  ...slashPair("/en/find-your-tattoo", "/#artists"),
  ...slashPair("/en/share-your-idea", "/#booking"),
  // Anna forlod huset 28/9 — hendes side sender til stolen, ikke til en 404.
  ...slashPair("/stolen/anna", "/stolen"),
  // S639 (Steven, 4/11): Shopify er lukket — se ROUTE_MIGRATION.
  ...slashPair("/shop", "/"),
  ...slashPair("/shop/:path*", "/"),
  ...slashPair("/en/shop", "/en"),
  ...slashPair("/en/shop/:path*", "/en"),
  ...slashPair("/maerket", "/"),
  ...slashPair("/maerket/:path*", "/"),
  ...slashPair("/en/maerket", "/en"),
  ...slashPair("/en/maerket/:path*", "/en"),
  ...slashPair("/gavekort", "/"),
  ...slashPair("/gavekort/:path*", "/"),
  ...slashPair("/en/gavekort", "/en"),
  ...slashPair("/en/gavekort/:path*", "/en"),
  ...slashPair("/walk-in", "/booking"),
  ...slashPair("/en/walk-in", "/en/booking"),
  ...slashPair("/flash", "/booking"),
  ...slashPair("/en/flash", "/en/booking"),
  ...slashPair("/blackbook", "/"),
  ...slashPair("/en/blackbook", "/en"),
];
