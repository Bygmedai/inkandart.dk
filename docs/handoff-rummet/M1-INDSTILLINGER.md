# M1-indstillinger — Rummet

Grok, 28. august 2026. Til Haruki.

## Content-mekanisme: Decap-ready git-filer (valg b)

Ikke Shopify metaobjects i M1.

**Hvorfor**

1. Org'et har allerede `decap-oauth-worker`. OAuth er en konfiguration, ikke et nyt system.
2. Ingen Storefront-secrets i git. Preview skal kunne bygge uden Shopify-env — YAML i `content/` læses ved build. Metaobjects kræver Storefront-nøgle, og så dør preview.
3. Samme modeller (`vaerk`, `artist`, `nat`) som U7's Shopify-admin-flow. Flytningen til metaobjects senere er et skift af lager, ikke af felter.
4. Indhold bor **ikke** i `lib/*.ts`. `lib/content.ts` er kun loader + tom-tilstandsflag.

Filer:

- `content/artists.yml`
- `content/vaerker.yml`
- `content/nat.yml`
- `public/admin/config.yml` (stien er ægte; OAuth er ikke koblet i denne PR)

Tom-tilstande er data: `nat.aktiv=false` → «Ingen nat i aften»; ingen `edition_ref` → «Vi laver ikke varer uden værk.»; gæst inaktiv → «Ingen gæst i stolen»; gæst aktiv uden navn → «Gæst · navn følger».

## Blackbook

Eksisterende `POST /api/subscribe` (Shopify-kunde). Udvidet med `phone`.

- Felt: `<input type="tel">` på Døren. Honeypot `company` uændret.
- Lagring: Shopify customer + tag `blackbook` (source `blackbook`).
- SMS-consent sættes når der er telefon. Ingen ny mail-sender, ingen DNS, ingen tredjepartsscript.
- Linje: «Vi sender kun natten. Afmeld med STOP.»
- Døren forsvinder aldrig. Succes-copy er den eksisterende «Du er i bogen.»

## Book.dk

Klædt hop, ikke embed. `BOOK TID` → `https://inkart.book.dk/`. Vi bygger ikke Book.dk om. `booking@inkandart.dk` er hellig.

## Fonte

Anton (poster) + Instrument Sans (brød), self-hostet woff2 latin + latin-ext i `app/fonts/`, `next/font/local`, `display: swap`. CSP `font-src 'self'` holdes. Cormorant/Space Grotesk bruges ikke på Rummet-flader.

## Hvad M1 ikke er

Stolen-gitter, Mærket-vægshop, Natten-plakatsystem, booking S8. Stubs er ærlige: rum-navn, ét slot, tom-tilstand fra data.
