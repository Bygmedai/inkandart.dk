/**
 * Katalog-drafts: Dolk, Ouroboros, Signetring.
 *
 * Publiceres IKKE før Steven har bekræftet priserne (250/250/1.200 er
 * juni-placeholders). Scriptet `scripts/shopify-prepare-drafts.mjs` skriver
 * copy + billeder og tvinger status=draft. Piercing-varianterne røres ikke.
 */

export const PIERCE_DEAD = [
  "53511714570568",
  "53511714996552",
  "53511715422536",
  "53511715881288",
] as const;

export type ShopDraft = {
  key: "dolk" | "ouroboros" | "signetring";
  /** Title-match mod Shopify-draft. */
  match: RegExp;
  title: string;
  type: "Print" | "Smykke";
  /** Placeholder — skriv IKKE til Shopify før Steven siger til. */
  pricePlaceholder: 250 | 1200;
  plate: string;
  bodyHtml: string;
};

export const SHOP_DRAFTS: ShopDraft[] = [
  {
    key: "dolk",
    match: /dolk|dagger/i,
    title: "Dolk",
    type: "Print",
    pricePlaceholder: 250,
    plate: "public/emerge/shop/dolk.png",
    bodyHtml: `<p>Dolk. Den ligger og venter på en væg.</p><p>Ikke et våben. Et mærke. Bladet, grebet, nitten — det vi tegner når nogen siger de vil have noget der holder.</p><p>Tryk. Signeret. Nummeret står bagpå.</p>`,
  },
  {
    key: "ouroboros",
    match: /ouroboros|slangen der bider/i,
    title: "Ouroboros",
    type: "Print",
    pricePlaceholder: 250,
    plate: "public/emerge/shop/ouroboros.png",
    bodyHtml: `<p>Slangen der bider sig selv i halen. Den er færdig, og den er lige begyndt.</p><p>Vi har tegnet den så længe at den er blevet et husdyr. Nu får den en væg.</p><p>Tryk. Signeret. Nummeret står bagpå.</p>`,
  },
  {
    key: "signetring",
    match: /signet|signetring/i,
    title: "Signetring",
    type: "Smykke",
    pricePlaceholder: 1200,
    plate: "public/emerge/shop/signetring.png",
    bodyHtml: `<p>En signet. Ikke et segl til breve — et segl til hånden.</p><p>Den sidder hvor du kan se den. Den siger du har valgt.</p><p>Sølv. Lavet til at blive grebet.</p>`,
  },
];
