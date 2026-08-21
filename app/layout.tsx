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

export const metadata: Metadata = {
  title: "Ink & Art Copenhagen",
  description: "Et sted hvor blæk allerede skriver. Larsbjørnsstræde 13, København.",
  metadataBase: new URL("https://inkandart.dk"),
  openGraph: {
    title: "Ink & Art Copenhagen",
    description: "Et sted hvor blæk allerede skriver.",
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
