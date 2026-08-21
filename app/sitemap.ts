import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://inkandart.dk/", lastModified: new Date() },
    { url: "https://inkandart.dk/aftercare", lastModified: new Date() },
    { url: "https://inkandart.dk/gavekort", lastModified: new Date() },
    { url: "https://inkandart.dk/gavekort/giv", lastModified: new Date() },
    { url: "https://inkandart.dk/gavekort/til-dig", lastModified: new Date() },
    { url: "https://inkandart.dk/walk-in", lastModified: new Date() },
    { url: "https://inkandart.dk/flash", lastModified: new Date() },
    { url: "https://inkandart.dk/blackbook", lastModified: new Date() },
    { url: "https://inkandart.dk/privatlivspolitik", lastModified: new Date() },
  ];
}
