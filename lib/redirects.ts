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
  { from: "/en/privacy/", to: "/privatlivspolitik/", reason: "Legal page is Danish-canonical" },
  { from: "/en/aftercare/", to: "/aftercare/", reason: "Aftercare preserved" },
  { from: "/en/artists/", to: "/#artists", reason: "EN artists index" },
  { from: "/en/artists/nizar/", to: "/#artist-nizar", reason: "EN named artist" },
  { from: "/en/artists/:slug/", to: "/#artists", reason: "EN unknown artist" },
  { from: "/en/flash/", to: "/flash/", reason: "EN flash → flash-siden (DA-kanonisk)" },
  { from: "/en/find-your-tattoo/", to: "/#artists", reason: "EN wizard retired" },
  { from: "/en/share-your-idea/", to: "/#booking", reason: "EN intake → chair" },
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
  ...slashPair("/en/privacy", "/privatlivspolitik"),
  ...slashPair("/en/aftercare", "/aftercare"),
  ...slashPair("/en/artists/nizar", "/#artist-nizar"),
  ...slashPair("/en/artists/:slug", "/#artists"),
  ...slashPair("/en/artists", "/#artists"),
  ...slashPair("/en/flash", "/flash"),
  ...slashPair("/en/find-your-tattoo", "/#artists"),
  ...slashPair("/en/share-your-idea", "/#booking"),
];
