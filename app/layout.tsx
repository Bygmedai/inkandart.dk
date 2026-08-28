import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = localFont({
  src: [
    { path: "./fonts/CormorantGaramond-500-latin.woff2", weight: "500", style: "normal" },
    { path: "./fonts/CormorantGaramond-Italic-500-latin.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [{ path: "./fonts/SpaceGrotesk-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-body",
  display: "swap",
});

const mono = localFont({
  src: [{ path: "./fonts/SpaceMono-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
});

const poster = localFont({
  src: [
    { path: "./fonts/Anton-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Anton-latin-ext.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-poster",
  display: "swap",
});

const chair = localFont({
  src: [
    { path: "./fonts/InstrumentSans-latin.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/InstrumentSans-latin-ext.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/InstrumentSans-Italic-latin.woff2", weight: "400 700", style: "italic" },
    { path: "./fonts/InstrumentSans-Italic-latin-ext.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-chair",
  display: "swap",
});

/**
 * Titel og beskrivelse svarer på «hvad er det her?».
 * Walk-in-prisen er [TAL BEKRÆFTES] indtil Nizar sætter tallet.
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
    <html
      lang="da"
      className={`${display.variable} ${body.variable} ${mono.variable} ${poster.variable} ${chair.variable}`}
    >
      <body className="bg-[var(--void)] text-[var(--text)] antialiased" style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
        <Script src="/emerge-boot.js" strategy="beforeInteractive" />
        <Script src="/seo-ld.js" strategy="afterInteractive" />
        <div className="grain" aria-hidden="true" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
