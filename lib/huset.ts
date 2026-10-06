import type { Artist, Kontakt, Skema, Vaerk, Ydelse } from "./content";
import type { Tidsrum } from "./tider";

/**
 * Huset som data — det appen henter fra /api/huset (Villy, 5/10).
 *
 * Accept: inkandart-webshop docs/accept/app-gennemgang.md, punkt 2, 3, 5, 6.
 * Steven 5/10: appen skal vise de samme artister som sitet, og ingen skal
 * huske at rette et andet sted. Derfor har appen ingen egen liste: den
 * henter artister, ugeskema, kontakt, åbningstider og priser herfra.
 *
 * Ren funktion: alt kommer ind som argumenter, så den kan prøves uden
 * Next. Ruten (app/api/huset/route.ts) sætter den sammen med loaderne.
 */

export type HusetInput = {
  stolen: Artist[];
  gaest?: Artist;
  vaerkerFor: (id: string) => Vaerk[];
  kontakt: Kontakt;
  whatsapp: string;
  booking: string;
  aabningstider: Tidsrum[];
  skema: Skema;
  priserTattoo: { da: Ydelse[]; en: Ydelse[] };
  priserFlash: { da: Ydelse[]; en: Ydelse[] };
  /** Sti i public/ → absolut URL (helst i telefonstørrelse). */
  billede: (src: string) => string;
};

export const HUSET_VERSION = 1;

function priser(p: { da: Ydelse[]; en: Ydelse[] }) {
  return p.da.map((y, i) => ({ da: y.ydelse, en: p.en[i]?.ydelse || y.ydelse, pris: y.pris }));
}

export function byggHuset(d: HusetInput) {
  const artist = (a: Artist) => ({
    id: a.id,
    navn: a.fornavn,
    periode: a.periode,
    haandvaerk: { da: a.haandvaerk, en: a.haandvaerk_en || a.haandvaerk },
    // Tom engelsk bio = appen viser den danske. Vi oversætter ikke et menneske.
    bio: { da: a.bio, en: a.bio_en },
    foto: d.billede(a.foto),
    billedtekst: a.billedtekst,
    instagram: a.instagram,
    tiktok: a.tiktok,
    booking: a.booking,
    vaerker: d.vaerkerFor(a.id).map((v) => ({ id: v.id, foto: d.billede(v.foto), tekst: v.billedtekst })),
  });

  return {
    version: HUSET_VERSION,
    kontakt: {
      telefon_vist: d.kontakt.telefon_vist,
      telefon_e164: d.kontakt.telefon_e164,
      whatsapp: d.whatsapp,
      email: d.kontakt.email,
      adresse: d.kontakt.adresse,
      by: d.kontakt.by,
      instagram: d.kontakt.instagram,
      booking: d.booking,
    },
    aabningstider: d.aabningstider,
    artister: [...d.stolen.map(artist), ...(d.gaest ? [artist(d.gaest)] : [])],
    skema: d.skema,
    priser: { tattoo: priser(d.priserTattoo), flash: priser(d.priserFlash) },
  };
}

export type Huset = ReturnType<typeof byggHuset>;
