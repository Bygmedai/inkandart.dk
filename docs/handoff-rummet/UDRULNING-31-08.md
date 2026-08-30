# Udrulning mandag 31. august 2026

Skrevet søndag 30/8 af Haruki. Alt herunder er målt eller prøvet, ikke antaget.

## Rækkefølgen

Stakken er: `haruki/*` → `rummet-m2` → `rummet-m1` → `main`.
Den skal merges nedefra og op, i denne orden:

1. **#211** `haruki/porten-ser-check` → `rummet-m2`
   Skal ind først. Den er grunden til at `check` overhovedet kører på de
   stablede PR'er. Indtil den er inde, kan Porten ikke se sin evidens på
   #205 og #202, og dømmer fail-closed.
2. **#205** `haruki/hylden-som-disk` → `rummet-m2`
   Uden den sælger Mærket kun gavekort.
3. **#202** `rummet-m2` → `rummet-m1`
4. **#201** `rummet-m1` → `main` ← denne merge er go-live.

Efter hver merge: vent til `check` og `porten` er grønne på den næste,
før du merger videre. Porten venter 721s på manglende checks — bliver
den utålmodig, er der noget galt, ikke bare langsomt.

## Env i Vercel (sat 30/8, verificeret)

Projekt `inkandart-dk` (`prj_RaATmqi4YdHxPYmDytMZ8UYUwWKJ`):

| Navn | Scope | Type |
|---|---|---|
| `SHOPIFY_STOREFRONT_TOKEN` | production, preview | encrypted |
| `NEXT_PUBLIC_SHOPIFY_DOMAIN` | production, preview, development | plain |

Storefront-tokenet er samme offentlige nøgle som webshoppen allerede kører
på. Den er læse-adgang til publicerede produkter og ligger i forvejen i
klientkode — den er ikke en hemmelighed. Admin-token og client secret er
rørt af ingen.

Domænet har desuden en fallback i `lib/storefront.ts`, så en manglende
env ikke kan tømme Hylden i stilhed igen.

## Rollback

Øvet søndag 30/8 kl. 12:47. Fuld tur-retur tog ~20 sekunder, ingen
nedetid — alle ruter svarede 200 undervejs.

```bash
# nuværende production
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PRJ&teamId=$TEAM&target=production&limit=3"

# rul tilbage
curl -s -X POST -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Length: 0" \
  "https://api.vercel.com/v10/projects/$PRJ/promote/$DEPLOYMENT?teamId=$TEAM"
```

Sidste kendte gode production før Rummet:
`dpl_GGTTqueivERCtL1FsLS7ptTn6Fhd` (`fa5a6410`, Emerge med fodnoten).
Det er den, der skal frem igen, hvis mandagen går skævt.

Vercel svarer 409 hvis man promoter den deployment der allerede er live.
Det er ikke en fejl — det er svaret på "er jeg allerede rullet tilbage".

## Målt søndag 30/8, sidste runde

Porten måler `<main>` i synsfeltet, ikke hele siden — nav og dock er
altid sorte og hører ikke til dommen.

| Flade | 1440 | 390 |
|---|---|---|
| Huset (nat, ≤60/62% sort) | 56,6% ✅ | 40,3% ✅ |
| Stolen (nat) | 57,4% ✅ | **73,7% ❌** |
| Natten (nat) | 30,9% ✅ | 49,2% ✅ |
| Gaden (nat) | 36,2% ✅ | 53,3% ✅ |
| Mærket (salg, ≥60% lys) | 63,0% ✅ | 73,8% ✅ |
| Booking (salg) | 76,9% ✅ | 77,6% ✅ |

**11 af 12 porte grønne.**

Den røde er Stolen på telefon. Den er ikke et layoutproblem: rummet er
sort hele vejen ned, så at flytte indhold op henter bare det næste mørke
portræt ind i billedet. Prøvet og målt. Den port åbner sig med Sonjas
billeder, ikke med CSS.

## Købskæden, røgprøvet søndag 30/8

`/maerket` → varekort med live pris fra Shopify → `/maerket/dolk` →
"Læg i kurv — 250 kr" → POST `/api/rummet/cart` → 303 til
`d1qp54-0w.myshopify.com/cart/c/...` → cookie sat → tælleren viser 1.

Priserne på hylden kommer fra Storefront og er ikke skrevet i YAML:
Dolk 250, Ouroboros 250, Signetring 1.200. Butikken har 13 publicerede
produkter i alt, heraf fem depositum- og reservationsprodukter.
