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
  └─ <GulvetFlade>          klient: fire faner, formular, ROI-regner
       └─ lib/gulvet-tal.ts   REN aritmetik — testbar uden JSX, uden env

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

## Fanen «Overblik» (tilføjet S579, anden runde)

Uden den er «Skriv» en kirkegård. Man holder op med at skrive ned, hvis det man
skriver aldrig bliver regnet sammen eller svaret på. Fanen gør tre ting:

1. **Døren.** Lægger vagt-tallene sammen: hvor mange kom ind, hvor mange købte,
   lukkerate, salg på gulvet, kroner pr. person ind ad døren. Under
   `overblik.vagter_min` vagter nægter siden at regne et månedstal og siger
   «stikprøve» i stedet. Et gennemsnit af to vagter er et gæt med decimaler.
2. **Spørgsmål der venter.** Sonja skriver spørgsmålet, huset svarer *på siden*.
   Før den her runde fandtes `skrivSvar()` i lib og i ruten, men der var ingen
   knap — spørgsmål kunne kun stilles, aldrig besvares.
3. **Måneden, opgave for opgave.** Hvert fund bærer nu et opgavemærke
   (`gulvet_fund.opgave`, «o1»…«o16»), sat automatisk til den opgave hun står
   i. Så kan hver opgaves løfte — feltet `b:` i gulvet.yml — gøres op mod det
   der faktisk kom med tilbage. En opgave der er hakket af uden ét fund vises
   rødt: *klaret — men der kom intet med tilbage.*

Plus en tabel pr. område hvor **alle** slags står, også dem med nul. Et område
ingen har rørt er den mest brugbare linje i tabellen.

Ingen tal på fanen kommer udefra. Hvert eneste er talt af nogen i huset.

### Skemaændring

```sql
alter table public.gulvet_fund add column opgave text;
alter table public.gulvet_fund add constraint gulvet_fund_opgave_form
  check (opgave is null or opgave ~ '^o[0-9]{1,3}$');
alter table public.gulvet_fund add column svar_paa timestamptz;
```

Kørt 3. september 2026. Begge kolonner er nullable, så gamle rækker er
uberørte.

### Husets tal står i gulvet.yml

`tal.timepris` (140) og `tal.stoletime` (1.000) blev flyttet ud af koden, så
Nizar kan rette dem i Decap. De bruges begge to steder: i ROI-regneren og i
overblikkets «hvad det er værd».
