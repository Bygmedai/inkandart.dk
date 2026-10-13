# Kendte fund — Growth Ops

Fund der allerede er meldt til Steven, og som ikke skal genopdages hver dag.
Daily Growth Ops læser filen før den skriver sin rapport (arbejdspakken §0)
og melder kun ændringer: rettet, værre eller ny side ramt.

**Ret filen via PR.** Er et fund rettet, flyttes det til «Lukket» med commit
eller PR — det slettes ikke. Har et fund ingen ejer, står der «?» indtil
Steven har sagt hvem.

Senest gennemgået: 13/10 2026 (Villy, fra QA 7/10).

## Åbne

| # | Område | Fund | Målt | Ejer | Venter på |
|---|---|---|---|---|---|
| 1 | Sandhed | Demovarerne Dolk, Ouroboros og Signetring står som varesider (`/shop/<handle>` og `/en/shop/<handle>`) og i sitemap'et, uden pris og knap. Steven nedlagde dem 30/8 («det er ikke rigtige varer»). Shopify har dem som kladde; siden falder tilbage til `content/hylden.yml`. | 7/10 | Villy (`/shop`) | Steven: må rettes |
| 2 | Sandhed | `/flash` (og `/en/flash`): «Fredagsflash — udsolgt i denne uge». Varen er kladde i Shopify og har aldrig været til salg; komponenten skriver «udsolgt» når Shopify ikke kan bevise en ledig plads. | 7/10 | Vilde (`/flash`), komponenten er Harukis (#245) | Steven: kører fredagsflash hver fredag 18–24, som siden lover? |
| 3 | Compliance | Shopify-kassen har feltet «Send mails til mig om nyheder og tilbud» krydset af på forhånd (målt: afkrydset før kunden rører noget). Et forhåndsafkrydset felt er efter EU-Domstolens praksis ikke et gyldigt samtykke. | 7/10 | Steven (Shopify-indstilling) | Steven |
| 4 | Trust | Kassen hedder «Inkandart» og er Shopifys standardudseende uden logo. | 7/10 | Steven (Shopify-indstilling) | Steven |
| 5 | Konvertering | Walk-in-tilbuddet «2 små · 900» (`/walk-in`) har ingen interne links — ingen side på sitet peger på det. | 7/10 | Grok (`/walk-in`); menu og forside er Vildes | Steven: hvor skal det stå? |
| 6 | Konvertering | Gavekortene står ikke i menuen, ikke på forsiden og ikke på artistsiderne. Kun via Shop, Find os og Flash. | 7/10 | Grok (`/gavekort`); menu og forside er Vildes | Steven |
| 7 | Konvertering | «Book tid» på `/stolen/nizar` ligger ~1.240 px nede på en telefon (skærmen er 844). | 7/10 | ? | Steven |
| 8 | Måling | Vercels Web Analytics-API svarer «not found» for projektet, så der er ingen besøgstal. Kurv-links har ingen `?ref=`, og gavekort-knapperne på `/shop` har `rel="noreferrer"`, så Shopify kan ikke se hvilke ordrer der kom fra sitet. Shopify skriver `ref` fra kurv-linket på ordren (deres dokumentation). | 7/10 | `lib/commerce.ts` er Vildes; `/shop` er Villys; Vercel er Stevens | Steven / Vilde |
| 9 | Copy | Gavekortets pyntekort siger «fra 500 kr», men 100 og 250 sælges. | 7/10 | Grok (`Gift*`) | Grok |
| 10 | SEO | `/gavekort/til-dig` — siden en gavemodtager åbner — mangler `og:image`. | 7/10 | Grok (`/gavekort`) | Grok |
| 11 | SEO | `/booking` og `/natten` har meta description på 45 og 46 tegn. | 7/10 | ? | — |
| 12 | QA-dækning | Vagtens købsknap-selektor `.rum-produkt__koeb button` rammer intet, fordi der ingen levende varesider er. Hul i dækningen, ikke en fejl på siden. | 7/10 | Villy (gates) | Rettes med #1 |
| 13 | QA-dækning | Book.dk-undtagelsen i `scripts/qa/undtagelser.mjs` udløb 12/10. Vagten fandt 0 forekomster 7/10 — Book.dk har rettet fejlen, og undtagelsen kan fjernes. | 7/10 | Villy (gates) | — |

### Uden for dette repo (meldes, rettes ikke herfra)

| # | Fund | Målt | Hvor |
|---|---|---|---|
| A | Appen kan ikke bygges siden 6/10 (`expo-router` 58 mod Expo SDK 57). Rettelsen ligger klar. | 8/10 | `Bygmedai/inkandart-webshop` #175 og #173 |
| B | Appens «Åbent/Lukket» regner efter telefonens ur, ikke Københavns. En telefon på britisk eller amerikansk tid viser forkert. | 7/10 | `inkandart-webshop/app/data/forside.ts` (`computeOpen`) |

## Under arbejde

| Fund | PR |
|---|---|
| Ingen strukturerede data (JSON-LD) i det serveren sender | inkandart.dk #362 (Villy) |

## Lukket

| Fund | Lukket af |
|---|---|
| Billeder af en tidligere medarbejder i Nizars karussel | inkandart.dk #359 |
| Ornamentale værker Nizar ikke laver, på hans side | inkandart.dk #360 |
| `/en` havde dobbelt hreflang (da og da-DK) — meldt i en tidligere måling | Ikke genfundet 7/10: kun `da-DK`, `en`, `x-default` |
