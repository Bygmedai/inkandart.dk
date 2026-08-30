# Byggebrief Grok — S574: Hylden læser Shopify, ikke YAML

Skrevet af Haruki 30/8. Én opgave. Den er vigtig, fordi Sonja lægger
100 varer op i denne uge, og de skal kunne sælges uden at nogen rører
en fil i repoet.

## Opgaven

Mærkets hylde skal læse Shopify-kollektionen `hylden` via Storefront
API — og `content/hylden.yml` bliver en fallback.

1. `lib/storefront.ts`: ny funktion `productsInCollection(handle)`.
   Storefront-query `collectionByHandle` → titel, handle, pris,
   `availableForSale`, første billede (URL + alt). Samme fejlmønster
   som resten af filen: fejl → `{ ok: false, products: [] }`, aldrig
   et throw.
2. Kollektionen `hylden` oprettes i Shopify admin (du har katalogpleje-
   lanen). Læg de tre eksisterende varer i den: dolk, ouroboros,
   signetring. Sonjas nye varer kommer i samme kollektion — det ER
   hendes redigeringsflade.
3. `app/(rummet)/maerket/page.tsx` + `app/(rummet)/maerket/[handle]/`
   læser kollektionen først. Svarer Storefront ikke, falder de tilbage
   til `hylden.yml` som i dag. En vare uden `availableForSale`
   filtreres fra — ingen død købsknap (CLAUDE.md §4).
4. Billeder kommer fra Shopify CDN. CSP'en i `next.config.ts` skal
   have `https://cdn.shopify.com` i `img-src` — opdatér
   `tests/csp.test.mjs` i SAMME commit.
5. Prøver: kollektions-parser mod et fixture-svar; fallback-stien når
   env mangler; `availableForSale: false` filtreres; gruppering
   (Prints/Smykker) læses fra produktets `productType`.

## Hvad du IKKE rører

`content/huset.yml`, `content/kontakt.yml`, artistsiderne
(`app/(rummet)/stolen/**`), `components/rummet/ArtistKort.tsx`,
`.github/**`, `scripts/qa/**`. Forsiden og QA-vagten er andres
arbejde i samme uge — grænserne står i BRIEF-VILDE-QA-S574.md og
CLAUDE.md §1.

## Basen

Byg på `main` EFTER #212 er inde. Er #212 ikke merget når du starter,
så vent — den flytter Mærkets side-struktur, og bygger du på den
gamle, kolliderer vi på `maerket/page.tsx`.

## Målinger i PR-teksten

Kollektionskaldets svartid, antal varer hentet, fallback prøvet ved
at fjerne env lokalt, og de tre variant-ID'er målt 302/410 med dato.
Appen (webshop-repoets BRIEF-APP-KANON-v0.5.md) venter til denne er
inde.
