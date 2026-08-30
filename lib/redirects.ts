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
  { from: "/en/flash/", to: "/flash/", reason: "EN flash → flash-siden (DA-kanonisk)" },
  { from: "/en/gavekort/", to: "/gavekort/", reason: "Hellere dansk end 410 — §1-reglen. Målt 410 i prod 2026-08-22" },
  { from: "/en/gavekort/giv/", to: "/gavekort/giv/", reason: "Hellere dansk end 410" },
  { from: "/en/gavekort/til-dig/", to: "/gavekort/til-dig/", reason: "Hellere dansk end 410" },
  { from: "/en/blackbook/", to: "/blackbook/", reason: "Hellere dansk end 410" },
  { from: "/en/find-your-tattoo/", to: "/#artists", reason: "EN wizard retired" },
  { from: "/en/share-your-idea/", to: "/#booking", reason: "EN intake → chair" },
];

/**
 * Vej B (Steven, S568): webshoppen er pensioneret som storefront — kataloget
 * bor i hub'en på /shop. Den gamle butik var en SPA uden egne stier, så alle
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
    to: "https://inkandart.dk/shop",
    reason: "Vej B: kataloget bor i hub'en (S568)",
  },
];

export type HostRedirect = Redirect & {
  has: [{ type: "host"; value: string }];
};

export const hostRedirects: HostRedirect[] = [
  {
    source: "/:path*",
    has: [{ type: "host", value: "shop.inkandart.dk" }],
    destination: "https://inkandart.dk/shop",
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
  ...slashPair("/en/flash", "/flash"),
  ...slashPair("/en/gavekort/giv", "/gavekort/giv"),
  ...slashPair("/en/gavekort/til-dig", "/gavekort/til-dig"),
  ...slashPair("/en/gavekort", "/gavekort"),
  ...slashPair("/en/blackbook", "/blackbook"),
  ...slashPair("/en/find-your-tattoo", "/#artists"),
  ...slashPair("/en/share-your-idea", "/#booking"),
];
