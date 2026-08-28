import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/**
 * Titel og beskrivelse svarer på «hvad er det her?».
 * Walk-in-prisen er [TAL BEKRÆFTES] indtil Nizar sætter tallet.
 *
 * Fonte bor i rutegrupperne: Rummet (Anton + Instrument Sans) og
 * Emerge (Cormorant + Space Grotesk). Roden laster ingen — Rummet
 * skal ikke betale bytes for det pensionerede hus.
 */
export const metadata: Metadata = {
  title: "Ink & Art Copenhagen — tatovering & piercing i Pisserenden",
  description:
    "Tatovering og piercing i Pisserenden. Larsbjørnsstræde 13, København K.",
  metadataBase: new URL("https://inkandart.dk"),
  openGraph: {
    title: "Ink & Art Copenhagen — tatovering & piercing",
    description:
      "Tatovering og piercing i Pisserenden. Larsbjørnsstræde 13, København K.",
    images: [
      { url: "/og-inkandart-2026.jpg", width: 1200, height: 630,
        alt: "Ink & Art Copenhagen — tatovering & piercing, Larsbjørnsstræde 13" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="bg-[var(--void)] text-[var(--text)] antialiased">
        <Script src="/seo-ld.js" strategy="afterInteractive" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
