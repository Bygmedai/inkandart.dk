import localFont from "next/font/local";
import "@/components/rummet/rummet.css";

const poster = localFont({
  src: [
    { path: "../../fonts/Anton-latin.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/Anton-latin-ext.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-poster",
  display: "swap",
});

const chair = localFont({
  src: [
    { path: "../../fonts/InstrumentSans-latin.woff2", weight: "400 700", style: "normal" },
    { path: "../../fonts/InstrumentSans-latin-ext.woff2", weight: "400 700", style: "normal" },
    { path: "../../fonts/InstrumentSans-Italic-latin.woff2", weight: "400 700", style: "italic" },
    { path: "../../fonts/InstrumentSans-Italic-latin-ext.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-chair",
  display: "swap",
});

/**
 * Rummet-fonte: Anton (plakat) + Instrument Sans (brød).
 * data-rummet holder Emerge-scatter, grain og emerge-boot ude.
 */
export default function RummetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-rummet=""
      className={`${poster.variable} ${chair.variable}`}
      style={{ fontFamily: "var(--font-chair), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
