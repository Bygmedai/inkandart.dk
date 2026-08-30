import type { MetadataRoute } from "next";
import { loadHouse, profiledArtists } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const artistPages = profiledArtists(loadHouse().artists).map((a) => ({
    url: `https://inkandart.dk/stolen/${a.id}`,
    lastModified: new Date(),
  }));
  return [
    ...artistPages,
    { url: "https://inkandart.dk/", lastModified: new Date() },
    { url: "https://inkandart.dk/stolen", lastModified: new Date() },
    { url: "https://inkandart.dk/maerket", lastModified: new Date() },
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
    { url: "https://inkandart.dk/privatlivspolitik", lastModified: new Date() },
    { url: "https://inkandart.dk/betingelser", lastModified: new Date() },
    { url: "https://inkandart.dk/en/betingelser", lastModified: new Date() },
  ];
}
