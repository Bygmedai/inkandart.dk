/**
 * Flash — færdigtegnede motiver til fast pris, først til mølle.
 *
 * Listen er bevidst tom indtil artisterne leverer flash i det aftalte format
 * (se docs/FLASH-LEVERANCE.md) og varen er oprettet i Shopify. Så snart en post
 * har et `variantId`, kan kunden købe den direkte via Shopify-checkout; uden
 * `variantId` falder kortet tilbage til reservation via WhatsApp — aldrig et
 * dødt køb.
 *
 * Indtil da fungerer /flash som teaser der driver Blackbook-tilmeldinger
 * (medlemmer ser drops først).
 */
export type FlashSize = "S" | "M" | "L";

export type FlashPiece = {
  id: string;
  title: string;
  artist: string;
  size: FlashSize;
  priceKr: number;
  /** Motiv-fil: /flash/{id}.webp (transparent, høj opløsning). */
  img: string;
  /** Shopify ProductVariant-ID (numerisk) — sat når varen er oprettet. */
  variantId?: string;
  /** One-off: sælges kun én gang. */
  oneOff?: boolean;
  /** One-off der allerede er solgt (vises udtonet, ikke købbart). */
  claimed?: boolean;
};

export const flash: FlashPiece[] = [];

export const SIZE_LABEL: Record<FlashSize, string> = {
  S: "Lille",
  M: "Mellem",
  L: "Stor",
};
