# Kendte fund — Growth Ops

Fund der allerede er meldt til Steven, og som ikke skal genopdages hver dag.
Daily Growth Ops læser filen før den skriver sin rapport (arbejdspakken §0)
og melder kun ændringer: rettet, værre eller ny side ramt.

**Ret filen via PR.** Er et fund rettet, flyttes det til «Lukket» med commit
eller PR — det slettes ikke. Har et fund ingen ejer, står der «?» indtil
Steven har sagt hvem.

Senest gennemgået: 16/11 2026 (Daily Growth Ops, mod main `178e596`). Forrige: 13/10 (Villy, fra QA 7/10).

**Shopify blev lukket 4/11 (S639, #367).** Shop, gavekort, walk-in-siden, flash og
Blackbook 308'er nu til forsiden eller `/booking`. Syv af de gamle fund handlede
om de flader og er flyttet til «Lukket». Til gengæld står der tekst tilbage på
de levende sider, som lover det Shopify gjorde — se 14, 15 og 18.

## Åbne

| # | Område | Fund | Målt | Ejer | Venter på |
|---|---|---|---|---|---|
| 7 | Konvertering | «Book tid» på `/stolen/nizar` ligger 1.241 px nede på en telefon (skærmen er 844). `/stolen/emma`: 1.131 px. | 16/11 (uændret siden 7/10) | ? | Steven |
| 8 | Måling | Vercels Web Analytics-API svarede «not found» for projektet 7/10, så der er ingen besøgstal. Ikke genmålt 16/11. Delen om `?ref=` på kurv-links er bortfaldet med Shopify. | 7/10 | Vercel er Stevens | Steven |
| 11 | SEO | `/booking` og `/natten` har meta description på 41 og 42 tegn («Book tid. Ink & Art, Larsbjørnsstræde 13.»). | 16/11 (uændret) | ? | — |
| 13 | QA-dækning | Book.dk-undtagelsen i `scripts/qa/undtagelser.mjs` udløb 12/10. Vagten fandt 0 forekomster 7/10 og 16/11 — undtagelsen kan fjernes. | 16/11 (uændret) | Villy (gates) | — |
| 14 | Sandhed | `/faq` og `/en/faq`: «Hvordan fungerer gavekort? Købt online leveres koden pr. mail med det samme.» Der kan ikke købes gavekort online længere; `/gavekort` 308'er til forsiden. Kilde: `content/faq.yml` linje 46–49 og `content/faq.en.yml` linje 44–47. | 16/11 | ? (`content/faq*.yml`) | Steven: sælges gavekort stadig ved disken? Ellers skal spørgsmålet ud |
| 15 | Sandhed | Depositum loves tre steder, men betalingen gik gennem Shopify og knappen er fjernet (#367): `/booking` «linket ligger i din bekræftelsesmail» (`content/booking.yml` `depositum_trin`, da + en), `/faq` «Betal depositum (fra 100 kr) på bookingsiden» (da + en), `/gaden` «Depositum fra 100 kr» (da + en). Jeg fandt ingen betalingsvej på sitet; om Book.dk selv tager depositum, kan jeg ikke se herfra. | 16/11 | ? (`content/`) | Steven: hvordan betales depositum nu — eller er det afskaffet? |
| 16 | Trust | `shop.inkandart.dk` svarer `503` med `x-vercel-error: DEPLOYMENT_PAUSED` (6 af 6 målinger, to adresser, 16/11 07:05 UTC). Reglen i `lib/redirects.ts` der sender subdomænet til forsiden virker først, når domænet peger på hub-projektet. Gamle links og Google-resultater til butikken rammer en fejlside. | 16/11 | Villy (host-redirects); Vercel er Stevens | Steven: flyt domænet til hub-projektet i Vercel |
| 17 | QA-dækning | `node scripts/kundevagt.mjs` er 4 grønne, 7 røde mod produktion, fordi den stadig leder efter kurv-links på `/shop` og `/gavekort`. En vagt der altid er rød, bliver ikke læst. `scripts/qa/vagt.mjs` måler stadig fladerne Shop, Vareside og Gavekort (de følger redirecten og måler forsiden), og tre handlings-selektorer rammer intet: `.rum-produkt__koeb button`, `.rum-door__go`, `.rum-dock__book`. Afløser det gamle fund 12. | 16/11 | Villy (gates) | — |
| 18 | Compliance | Privatlivspolitikken og betingelserne (da + en) nævner stadig Shopify som databehandler for betaling, ordrer og mailliste, og beskriver webshop-køb, 14 dages fortrydelse og online-gavekort (`content/privatliv*.yml`, `content/betingelser*.yml`). Juridisk tekst — rettes ikke af rutinen. | 16/11 | Steven | Steven |
| 19 | Performance | Forsiden (`/` og `/en`) henter `hero/nizar.mp4` på 2.271 kB på en 390 px-telefon — 86 % af sidens 2.653 kB. Videoen har `autoplay`, så `preload="metadata"` holder den ikke tilbage. LCP er plakaten (1,3 s i denne måling), så det koster data, ikke første indtryk. | 16/11 | ? (forsiden) | — |
| 20 | Konvertering | `/faq` har intet link til `/booking` i brødteksten — heller ikke under «Hvordan booker jeg?». Eneste vej videre er telefonnummeret i foden. `/piercing` har kun «Ring på», ingen booking. | 16/11 | ? | — |

### Uden for dette repo (meldes, rettes ikke herfra)

| # | Fund | Målt | Hvor |
|---|---|---|---|
| A | Appen kan ikke bygges siden 6/10 (`expo-router` 58 mod Expo SDK 57). Rettelsen ligger klar. | 8/10 | `Bygmedai/inkandart-webshop` #175 og #173 |
| B | Appens «Åbent/Lukket» regner efter telefonens ur, ikke Københavns. En telefon på britisk eller amerikansk tid viser forkert. | 7/10 | `inkandart-webshop/app/data/forside.ts` (`computeOpen`) |

## Under arbejde

Intet. Ingen åbne PRs 16/11.

## Lukket

| Fund | Lukket af |
|---|---|
| 1 · Demovarerne Dolk, Ouroboros og Signetring som varesider | #367: `/shop/dolk` svarer 308 til forsiden (målt 16/11), og siderne er ude af sitemap'et. Koden bygger dem stadig — oprydning udestår |
| 2 · `/flash`: «udsolgt i denne uge» om noget der aldrig var til salg | #367: `/flash` 308'er til `/booking` |
| 3 · Forhåndsafkrydset nyhedsmail-felt i Shopify-kassen | Bortfaldet: Shopify lukket 4/11 (S639) |
| 4 · Kassen hedder «Inkandart» uden logo | Bortfaldet: Shopify lukket 4/11 (S639) |
| 5 · Walk-in-tilbuddet havde ingen interne links | #367: `/walk-in` 308'er til `/booking` |
| 6 · Gavekortene stod ikke i menuen | #367: `/gavekort` 308'er til forsiden |
| 9 · Pyntekortet sagde «fra 500 kr» | #367: `/gavekort` kan ikke nås |
| 10 · `/gavekort/til-dig` manglede `og:image` | #367: svarer 308 til forsiden (målt 16/11) |
| 12 · Købsknap-selektoren rammer intet | Videreført som fund 17 |
| Ingen strukturerede data (JSON-LD) i HTML'en | #362: `"streetAddress"` står 1 gang på alle 28 sider i sitemap'et (målt 16/11) |
| Billeder af en tidligere medarbejder i Nizars karussel | inkandart.dk #359 |
| Ornamentale værker Nizar ikke laver, på hans side | inkandart.dk #360 |
| `/en` havde dobbelt hreflang (da og da-DK) — meldt i en tidligere måling | Ikke genfundet 7/10: kun `da-DK`, `en`, `x-default` |
