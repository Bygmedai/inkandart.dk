import localFont from "next/font/local";
import Script from "next/script";

const display = localFont({
  src: [
    { path: "../../fonts/CormorantGaramond-500-latin.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/CormorantGaramond-Italic-500-latin.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [{ path: "../../fonts/SpaceGrotesk-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-body",
  display: "swap",
});

const mono = localFont({
  src: [{ path: "../../fonts/SpaceMono-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Emerge-leftovers: Cormorant + Space Grotesk (+ mono), grain og boot.
 * Rummet laster dette layout aldrig.
 */
export default function EmergeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
    >
      <Script src="/emerge-boot.js" strategy="beforeInteractive" />
      <div className="grain" aria-hidden="true" />
      {children}
    </div>
  );
}
