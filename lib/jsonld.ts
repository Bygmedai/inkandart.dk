/**
 * Husets strukturerede data (schema.org JSON-LD) — Villy, 13/10 2026.
 * Accept: docs/accept/json-ld.md (Steven 13/10: «Ja, du må bygge JSON-LD»).
 *
 * HVORFOR HER, OG IKKE I public/seo-ld.js. Skemaet lå i en statisk fil der
 * blev sprøjtet ind af et script efter hydrering. Det serveren sendte,
 * havde altså 0 ld+json — Bing, sociale forhåndsvisninger og kortapper, der
 * læser rå HTML, så intet. Og filen kunne ikke importere content/, så
 * tider og telefon stod der som håndskrevne kopier, holdt i sync af to
 * tests. 14/9 viste kopien Google de gamle nattider.
 *
 * Nu bygges skemaet af de samme kilder som siderne viser:
 *   content/kontakt.yml       telefon, email, adresse, by, Instagram
 *   content/aabningstider.yml husets tider
 *   lib/site.ts               navn, url, postnummer (findes kun dér)
 * Ret tallet ét sted, og skemaet følger med (kriterium 5).
 *
 * BYGGES IKKE (accept, «To ting der IKKE bygges»):
 *   - aggregateRating / review: vi har ingen anmeldelsesdata. Selvskrevne
 *     stjerner er en løgn på vores egen forside.
 *   - Product / Offer: pris og lager lever i Shopify og ville drive.
 */
import type { Kontakt } from "./content";
import type { Tidsrum } from "./tider";

/**
 * REN, som lib/huset.ts: ingen runtime-imports. Data ind som argumenter, så
 * modulet kan prøves med `node --test` uden Next's alias-opslag. Roden
 * (components/rod/HusetsRod.tsx) loader og kalder.
 */
export type JsonLdInput = {
  kontakt: Kontakt;
  tider: Tidsrum[];
  /** Fra lib/site.ts: navn, url og postnummer (findes kun dér). */
  site: { fullName: string; url: string; address: { postalCode: string } };
};

const URL = "https://inkandart.dk";
export const STUDIO_ID = `${URL}/#studio`;
export const WEBSITE_ID = `${URL}/#website`;

const DAG: Record<string, string> = {
  man: "Monday",
  tir: "Tuesday",
  ons: "Wednesday",
  tor: "Thursday",
  fre: "Friday",
  loer: "Saturday",
  son: "Sunday",
};

/** «13» → «13:00», «02» → «02:00», «22:30» → «22:30». */
export function klokkeslaet(t: string): string {
  return t.includes(":") ? t.padStart(5, "0") : `${t.padStart(2, "0")}:00`;
}

/**
 * Husets tider som OpeningHoursSpecification. Lukker huset efter midnat
 * (tor 13–02), står `closes` tidligere end `opens` — sådan skriver
 * schema.org en åbningstid der går over midnat.
 */
export function aabningstider(tider: Tidsrum[]) {
  return tider.map((t) => {
    const dage = t.dage.map((d) => {
      const en = DAG[d];
      if (!en) throw new Error(`jsonld: ukendt dag «${d}» i aabningstider.yml`);
      return en;
    });
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dage.length === 1 ? dage[0] : dage,
      opens: klokkeslaet(t.fra),
      closes: klokkeslaet(t.til),
    };
  });
}

/**
 * Studiet. ÉT sted med ét @id på begge sprog — to @id for samme butik ville
 * fortælle Google at der ligger to på Larsbjørnsstræde 13 (kriterium 3).
 */
export function studio({ kontakt: k, tider, site }: JsonLdInput) {
  // «Larsbjørnsstræde 13, kælderen» → gadeadressen er det før kommaet.
  // «kælderen» er en vejvisning til kunden, ikke en del af postadressen.
  const gade = k.adresse.split(",")[0].trim();
  return {
    "@type": "TattooParlor",
    "@id": STUDIO_ID,
    name: site.fullName,
    url: site.url,
    image: `${site.url}/og-inkandart-2026.jpg`,
    telephone: k.telefon_e164,
    email: k.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: gade,
      postalCode: site.address.postalCode,
      addressLocality: k.by,
      addressCountry: "DK",
    },
    openingHoursSpecification: aabningstider(tider),
    sameAs: k.instagram ? [`https://www.instagram.com/${k.instagram}/`] : [],
  };
}

/** Hele grafen: studiet og sitet, bundet sammen med @id. */
export function husetsGraf(d: JsonLdInput) {
  const { site } = d;
  return {
    "@context": "https://schema.org",
    "@graph": [
      studio(d),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: site.url,
        name: site.fullName,
        inLanguage: ["da", "en"],
        publisher: { "@id": STUDIO_ID },
      },
    ],
  };
}

/**
 * JSON der er sikker at lægge i et <script>-element.
 *
 * `JSON.stringify` alene er IKKE nok: en streng med «</script>» lukker
 * elementet, og U+2028/U+2029 er linjeskift i ældre JS-parsere. Derfor
 * skrives <, >, & og de to linjeskift som \uXXXX — gyldig JSON, som en
 * parser læser tilbage til præcis de samme tegn. Data er i dag vores egne
 * YAML-felter, men den dag nogen føder det her et navn fra Shopify, skal
 * det ikke være farligt.
 */
export function sikkerJson(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
