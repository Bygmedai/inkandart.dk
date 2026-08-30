# Byggebrief Grok — S574: resten af hardcodingen ud, hylden på Shopify

Skrevet af Haruki 30/8 efter Stevens QA af det nye site. Mønsteret er sat
i PR #212: ord og tal bor i `content/*.yml`, koden er layout. Din opgave
er at føre samme princip igennem resten — og at gøre hylden klar til de
100 varer Sonja lægger op.

## G1 — hylden læser Shopify-kollektioner, ikke YAML

`content/hylden.yml` var altid en bro (står i filens eget hoved). Byg
den rigtige kilde:

- `lib/storefront.ts` får `productsInCollection(handle)` — Storefront
  API'ets `collectionByHandle { products }`. Læs pris, billede, titel og
  `availableForSale` direkte fra Shopify.
- Mærkets hylde viser kollektionen `hylden` (opret den i Shopify admin;
  Sonja styrer sortimentet derfra — hun skal ALDRIG røre en YAML-fil
  for at sætte en vare til salg).
- `hylden.yml` beholdes som fallback når Storefront-env mangler, med
  en kommentar om at den udgår. Fejler kaldet → fallback, aldrig en
  tom disk uden forklaring.
- Produktbilleder kommer fra Shopify CDN. `VareKort` skal tåle eksterne
  URLs (next.config: `images.remotePatterns` er ikke i spil — vi bruger
  `<img>`; men CSP'en i `next.config.ts` skal have `cdn.shopify.com`
  i `img-src`. Tjek `tests/csp.test.mjs` og opdatér den MED ændringen).
- Prøver: kollektions-parseren mod et optaget svar-fixture; fallback-
  stien; at en vare uden `availableForSale` filtreres fra.

## G2 — resten af Rummets flader på samme content-mønster

`stolen`, `natten`, `gaden`, `booking` har stadig inline-copy. Flyt
den til `content/` efter huset.yml-mønstret (én fil per flade eller
felter i eksisterende filer, hvor de hører naturligt hjemme —
`gaden.yml` findes allerede). Kontakt kommer fra `kontakt.yml` — det
er allerede håndhævet af en prøve for de fem vigtigste filer; udvid
prøven til de flader du rører.

## G3 — appen (PR #147-briefet står stadig)

A1–A5 fra `app/docs/BRIEF-APP-KANON-v0.5.md` i webshop-repoet.
Uændret. Tag den EFTER G1 — hylden er cashflow, appen er identitet.

## Rækkefølge og regler

G1 → G2 → G3, én PR per punkt, mod `main`. CI kører nu på alle
grene. Porten kræver `check` grøn. Målinger i PR-teksten som altid —
og husk: variant- og kollektionsmålinger har en dato.
