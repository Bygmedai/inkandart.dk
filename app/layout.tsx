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

/**
 * Titel og beskrivelse er der hvor et menneske og en søgemaskine først
 * spørger «hvad er det her?». Indtil S568 svarede vi «Et sted hvor blæk
 * allerede skriver» — smukt, og ubrugeligt: ordet «tatovering» stod kun i
 * to aria-labels, «piercing» stod slet ikke på siden, og to beta-testere
 * spurgte «er det en tatoveringsbutik?». Stemningen bærer stadig; fagene
 * står nu foran den.
 */
export const metadata: Metadata = {
  title: "Ink & Art Copenhagen — tatovering & piercing i Pisserenden",
  description:
    "Tatoveringer og piercinger i hjertet af Pisserenden. Walk-in på to små for 900 kr, book en tid, eller giv et gavekort. Larsbjørnsstræde 13, København K.",
  metadataBase: new URL("https://inkandart.dk"),
  openGraph: {
    title: "Ink & Art Copenhagen — tatovering & piercing",
    description:
      "Tatoveringer og piercinger i Pisserenden. Walk-in, booking og gavekort. Larsbjørnsstræde 13, København K.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-[var(--void)] text-[var(--text)] antialiased" style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
        <Script src="/emerge-boot.js" strategy="beforeInteractive" />
        <Script src="/seo-ld.js" strategy="afterInteractive" />
        <a href="#main" className="skip-link">
          Gå til indhold
        </a>
        <div className="grain" aria-hidden="true" />
        {children}
        {/* Vercel Web Analytics — cookieløs, ingen PII, samme oprindelse (/_vercel/insights/*).
            Uden denne komponent sker der intet, selv om Analytics er slået til i dashboardet. */}
        <Analytics />
      </body>
    </html>
  );
}
