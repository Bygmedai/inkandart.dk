import type { Metadata, Viewport } from "next";
import { HusetsRod } from "@/components/rod/HusetsRod";
import "../globals.css";

/** The English root. The language is the only difference from `(da)`. */
export const metadata: Metadata = {
  title: "Ink & Art Copenhagen — tattoos & piercing in Pisserenden",
  description:
    "Tattoos and piercing in Pisserenden. Larsbjørnsstræde 13, Copenhagen K.",
  metadataBase: new URL("https://inkandart.dk"),
  openGraph: {
    title: "Ink & Art Copenhagen — tattoos & piercing",
    description:
      "Tattoos and piercing in Pisserenden. Larsbjørnsstræde 13, Copenhagen K.",
    images: [
      { url: "/og-inkandart-2026.jpg", width: 1200, height: 630,
        alt: "Ink & Art Copenhagen — tattoos & piercing, Larsbjørnsstræde 13" },
    ],
  },
};

export const viewport: Viewport = { themeColor: "#070707" };

export default function EngelskRod({ children }: { children: React.ReactNode }) {
  return <HusetsRod lang="en">{children}</HusetsRod>;
}
