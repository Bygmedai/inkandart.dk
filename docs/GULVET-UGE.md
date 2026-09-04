# Gulvets ugentlige opsamling — sådan kører den

Hver mandag kl. 07 (København) læser Haruki alt der er skrevet på `/gulvet`
i den forgangne uge, henter systemernes tal, og skriver **tre til fem
konklusioner** ind i tabellen `gulvet_analyse`. De vises øverst på fanen
«Overblik» som «Huset lærte». Sonja og Steven ser det samme.

Det er den anden halvdel af værktøjet. Den første halvdel — at hun skriver —
er en kirkegård uden den her.

## Hvad kørslen gør

1. **Henter ugens data** med `scripts/gulvet-uge.py hent` — alle fund fra
   ugen, de åbne spørgsmål, fremdriften, og de tre forrige opsamlinger så
   den ikke gentager sig selv. Døren-tallene (`doer_*`) regnes her.
2. **Henter Shopify** gennem Shopify-connectoren (ikke fra scriptet):
   `FROM sessions SHOW sessions, sessions_that_reached_checkout,
   sessions_that_completed_checkout SINCE <fra> UNTIL <til>` og
   `FROM sales SHOW orders, total_sales SINCE <fra> UNTIL <til>`.
   Lægges i `tal` som `shop_sessions`, `shop_kasse`, `shop_koeb`, `shop_salg`.
3. **Instagram**, hvis Supermetrics har Instagram Insights logget ind:
   følgere og antal opslag → `ig_foelgere`, `ig_opslag`. Ellers udelades.
4. **Skriver konklusionerne.** Regler:
   - Tre til fem sætninger. Hver sætning bærer ét tal eller ét citat fra det
     Sonja skrev. Ingen sætning uden belæg.
   - Et tal fra en enkelt vagt er en observation, ikke en tendens. Sig det.
   - Sammenlign med forrige uge når der er en. Sig «første uge» når der ikke er.
   - Ét ubesvaret spørgsmål ældre end syv dage nævnes altid, med alder.
   - Husets sprog: tørt, konkret, ingen udråbstegn, ingen «fantastisk».
   - `naeste` er ÉN handling for næste uge, som en person kan gøre. Ikke tre.
5. **Skriver rækken** med `scripts/gulvet-uge.py skriv opsamling.json`.
6. **Sender Steven** de samme sætninger som besked. Ikke mere.

## JSON-formen scriptet tager imod

```json
{
  "uge": "2026-W37", "fra": "2026-09-07", "til": "2026-09-13", "af": "Haruki",
  "tal": { "doer_vagter": 3, "doer_ind": 117, "doer_koebte": 28, "doer_salg": 4900,
           "shop_sessions": 9, "shop_kasse": 4, "shop_koeb": 0 },
  "konklusioner": ["…", "…", "…"],
  "naeste": "…"
}
```

Tilladte nøgler i `tal` står i scriptet (`TAL_NOEGLER`). En ukendt nøgle er
en fejl — fladen kender kun de navngivne.

## Hemmeligheder

Scriptet læser Bitwarden-adgangstokenet fra `BWS_ACCESS_TOKEN` eller
`/tmp/.bws_token` og henter Supabase-tokenet dér. Intet printes. Shopify
går gennem connectoren. Der ligger ingen nøgler i repoet, og ingen på sitet
ud over de to `GULVET_*` der allerede er der.

## Hvis den ikke kører

Fanen viser «Første opsamling kommer mandag morgen» så længe tabellen er tom,
og ellers den seneste række med dato. Står der en uge der er mere end otte
dage gammel, er kørslen faldet. Kør den i hånden efter listen ovenfor.
