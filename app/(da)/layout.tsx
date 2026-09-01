import type { Metadata, Viewport } from "next";
import { HusetsRod } from "@/components/rod/HusetsRod";
import "../globals.css";

/** Den danske rod. Sproget er den eneste forskel fra `(en)`. */
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

export const viewport: Viewport = { themeColor: "#070707" };

export default function DanskRod({ children }: { children: React.ReactNode }) {
  return <HusetsRod lang="da">{children}</HusetsRod>;
}
