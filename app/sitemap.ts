import type { MetadataRoute } from "next";
import { loadHouse, profiledArtists } from "@/lib/content";

// /afstemning er husets egen side — den står bevidst IKKE her, og den
// er noindex. Et sitemap er en invitation.
export default function sitemap(): MetadataRoute.Sitemap {
  const artistPages = profiledArtists(loadHouse().artists).map((a) => ({
    url: `https://inkandart.dk/stolen/${a.id}`,
    lastModified: new Date(),
  }));
  return [
    ...artistPages,
    { url: "https://inkandart.dk/", lastModified: new Date() },
    { url: "https://inkandart.dk/stolen", lastModified: new Date() },
    { url: "https://inkandart.dk/booking", lastModified: new Date() },
    { url: "https://inkandart.dk/natten", lastModified: new Date() },
    { url: "https://inkandart.dk/gaden", lastModified: new Date() },
    { url: "https://inkandart.dk/en", lastModified: new Date() },
    { url: "https://inkandart.dk/en/shop", lastModified: new Date() },
    { url: "https://inkandart.dk/aftercare", lastModified: new Date() },
    { url: "https://inkandart.dk/gavekort", lastModified: new Date() },
    { url: "https://inkandart.dk/gavekort/giv", lastModified: new Date() },
    { url: "https://inkandart.dk/gavekort/til-dig", lastModified: new Date() },
    { url: "https://inkandart.dk/walk-in", lastModified: new Date() },
    { url: "https://inkandart.dk/en/walk-in", lastModified: new Date() },
    { url: "https://inkandart.dk/shop", lastModified: new Date() },
    { url: "https://inkandart.dk/flash", lastModified: new Date() },
    { url: "https://inkandart.dk/en/flash", lastModified: new Date() },
    { url: "https://inkandart.dk/piercing", lastModified: new Date() },
    { url: "https://inkandart.dk/en/piercing", lastModified: new Date() },
    { url: "https://inkandart.dk/privatlivspolitik", lastModified: new Date() },
    { url: "https://inkandart.dk/betingelser", lastModified: new Date() },
    // Samtykke stod ikke her. CLAUDE.md §5: «Ny side: med i app/sitemap.ts».
    // Overset i #270, og jeg fangede den ikke i QA'en 1/9.
    { url: "https://inkandart.dk/samtykke", lastModified: new Date() },
    { url: "https://inkandart.dk/en/samtykke", lastModified: new Date() },
    { url: "https://inkandart.dk/en/betingelser", lastModified: new Date() },
    { url: "https://inkandart.dk/faq", lastModified: new Date() },
    { url: "https://inkandart.dk/en/faq", lastModified: new Date() },
    { url: "https://inkandart.dk/en/privatlivspolitik", lastModified: new Date() },
    { url: "https://inkandart.dk/en/booking", lastModified: new Date() },
    { url: "https://inkandart.dk/en/stolen", lastModified: new Date() },
    { url: "https://inkandart.dk/en/gaden", lastModified: new Date() },
    { url: "https://inkandart.dk/en/aftercare", lastModified: new Date() },
    { url: "https://inkandart.dk/en/natten", lastModified: new Date() },
    ...profiledArtists(loadHouse().artists).map((a) => ({
      url: `https://inkandart.dk/en/stolen/${a.id}`,
      lastModified: new Date(),
    })),
  ];
}
