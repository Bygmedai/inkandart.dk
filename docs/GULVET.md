# Gulvet — husets oplæringsmåned og logbog

`/gulvet`, bag husets kode. Bygget S579 (3. september 2026).

## Hvad det er

Sonja er både store manager og SoMe manager. Ingen af delene har eksisteret i
huset før, så der findes ingen opgavebeskrivelse. Første måned handler om at
lave den: seksten opgaver hvor huset skriver **hvad vi tror**, og hun finder ud
af om det passer. Plus guider til Book.dk og Shopify, et kort over kundens veje
gennem huset, og et forslag til en content-plan.

Og et sted at skrive. Det er den egentlige grund til at siden findes: husets
walk-in-tal har aldrig været målt — «80-160 om måneden» var et gæt.

## Hvorfor på sitet, og ikke i et dokument eller en artefakt

Første udgave lå som en Claude-artefakt. To ting holdt ikke:

- **Sonja kunne ikke skrive i den.** Det kræver en Claude-konto med
  redigeringsadgang. Emma og Anna ligeså.
- **Steven kunne ikke selv se dataene.** Han skulle bede en agent hente dem ud.

Her deler den dør med teamguiden — samme kode, samme cookie — og dataene ligger
i en database han selv kan åbne. Det er S550-reglen: kanon skal ligge et sted
principalen kan holde styr på.

## Sådan hænger det sammen

```
/gulvet (page.tsx)          server, force-dynamic, noindex
  └─ tokenErGyldigt()       samme vagt som /personale og /afstemning
  └─ loadGulvet()           content/gulvet.yml — programmet, guiderne, tallene
  └─ hentFund/hentFremdrift lib/gulvet.ts → Supabase REST
  └─ <GulvetFlade>          klient: faner, formular, ROI-regner

/api/gulvet (route.ts)      POST nyt fund · PATCH svar eller klaret opgave
  └─ tokenErGyldigt()       ingen vej til databasen uden husets kode
  └─ rensFund()             validering FØR databasen, så en constraint
                            aldrig bliver til en 500 hos Sonja
```

## Env

To variabler i Vercel, begge **server-side, aldrig `NEXT_PUBLIC_`**:

| Navn | Værdi |
|---|---|
| `GULVET_SUPABASE_URL` | `https://iqvzreclhvukijcivlhz.supabase.co` |
| `GULVET_SUPABASE_KEY` | service_role-nøglen fra samme projekt |

Uden dem er logbogen **slukket, ikke åben**: programmet og guiderne virker
stadig, og fladen siger højt at intet bliver gemt. Samme valg som i
`lib/vagt.ts` — en knap der lader som om den gemte er værre end en der siger
den ikke kan.

`AFSTEMNING_KODE` er allerede sat; gulvet bruger den samme dør.

## Databasen

Projekt `ads-orchestrator-inkandart-pilot` (eu-west-1), tabellerne
`gulvet_fund` og `gulvet_fremdrift`. Ikke et nyt projekt: to tabeller er ikke
et projekt værd. Navnene er præfikset så de aldrig forveksles med
annonce-tabellerne.

**RLS er slået til uden politikker.** Det betyder at hverken `anon` eller
`authenticated` kan læse eller skrive — kun `service_role`, og den nøgle bor
kun server-side. Verificeret med både positiv og negativ kontrol ved
oprettelsen: en rigtig række gik ind, og negativt antal, for lang tekst og et
ugyldigt opgave-id blev alle tre afvist af databasen selv.

## Sådan retter huset indholdet

`content/gulvet.yml`. Opgaver, guider og tal ligger som data, ikke som kode, så
Nizar og Simone kan rette i Decap uden en PR — præcis som `piercing-priser.yml`
og `aftercare.yml`.

Guiderne er **blokke**, ikke HTML: `overskrift · tekst · advarsel · tabel ·
sti · opskrift · liste · kort · diagram`. `**fed**` virker i tekst, trin,
punkter og tabelceller. En ukendt type droppes stille af loaderen — og
`tests/gulvet.test.mjs` fanger det, så en guide ikke kan forsvinde uset.

**Priser, åbningstider og tjeklister står ikke her.** De bor i teamguiden på
`/personale`, og gulvet linker derhen. Én sandhed, to sider.

## Tallene har en dato

Alt i «hvad vi tror» er målt **3. september 2026** i Book.dk, Shopify og
Instagram. En måling har en dato. Er de mere end en måned gamle, så mål igen
før nogen bygger på dem.
