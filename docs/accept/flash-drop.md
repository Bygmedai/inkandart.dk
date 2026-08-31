# Accept: Blackbook betaler for sig selv

Status: **GODKENDT i princippet (2026-08-30)** — vej A valgt af Steven.
Afventer stadig priser og motiver fra Emma, og efter-købet fra Nizar + Emma.
Skrevet af Villy før bygning, jf. CLAUDE.md §6 og `docs/PROCES.md`.

Det vi køber: at Emmas tegninger er solgt før nålen rører hud — og at
mailisten holder op med at være en omkostning uden indtægt.

---

## Målt 30/8, før noget bygges

**`/flash` siger «snart».** Fladen findes, forklarer hvad flash er, har en
«Sådan virker et drop»-sektion og en Blackbook-tilmelding. Den mangler kun
motiver og en dato.

**Blackbook er næsten tom.** Jeg talte de otte kunder i hånden, fordi
Shopifys `customersCount(query:)` ignorerede filteret og svarede «8» på
alt — også på totalen:

| tag | antal | heraf tests/interne |
|---|---|---|
| `blackbook` | 4 | 2 |
| **`blackbook-drops`** | **2** | **1 (Steven)** |
| `newsletter` | 5 | 3 |
| `flash-waitlist` | 1 | 0 |

**Den liste der skal modtage droppet har i praksis én udefrakommende
abonnent.** Det er ikke et argument mod at bygge — det er argumentet for
hvad første drop er til for. Stevens kald 30/8: *«Byg alligevel — droppet
er grunden til at melde sig til.»*

**Kanalen findes allerede.** Segmentet `Blackbook`
(`customer_tags CONTAINS 'blackbook'`) ligger i Shopify, og alle otte har
`emailMarketingConsent: SUBSCRIBED`. Der skal altså ikke bygges en
mailmotor — Shopify Email kan sende til segmentet i dag. **Selve afsendelsen
er et menneskes arbejde, ikke kodens.** Det skal stå her, så ingen tror at
sitet sender noget.

---

## Det svære punkt — læs dette først

Stevens svar 30/8: *«Flash kan dimensioneres. Motivet er det samme. Men
størrelsen bestemmer prisen.»*

Det støder mod den anden regel i idéen: **hvert motiv sælges én gang.**

Shopify tæller lager **pr. variant**. Giver vi et motiv tre
størrelses-varianter med lager 1 på hver, kan det samme motiv sælges tre
gange. Der findes ingen indbygget «ét på tværs af varianter». Vælger vi
det forkerte her, sælger vi det samme unikke motiv til tre personer — og
det er en fejl kunden opdager, ikke CI.

**Stevens kendelse 30/8:** *«Emma vælger str på en flash, så den kun findes
én gang og fjernes når den er solgt.»* — **vej A.**

Det opløser konflikten helt: er størrelsen en egenskab ved motivet og ikke et
valg hos kunden, findes der kun én variant, og Shopifys lager på 1 gør
præcis det den skal. Ingen automatik at passe, intet vindue hvor to kan købe
det samme.

Til reference, de veje der IKKE blev valgt:

| vej | hvorfor ikke |
|---|---|
| B — tre varianter, huset tager varen ned | kunden kan skalere, men der er et vindue på minutter hvor to kan købe samme motiv |
| C — tre varianter + Shopify Flow | lukker vinduet, men er en ny automatik der skal passes |

### Emma skal kunne køre det fra sin telefon

Stevens tilføjelse: *«hvis det er teknisk muligt at vælge via telefonen.»*

Det er det — og det kræver ingen kode. Shopifys mobil-app kan oprette varen,
sætte pris og størrelse, lægge den i kollektionen og tage den ned igen.
**Der bygges derfor ikke et redigeringsværktøj.** Emmas arbejdsgang er fire
tryk i en app hun i forvejen kan have på telefonen, og sitet læser resultatet.

Det er også hvorfor vej A er den rigtige på mere end ét plan: B og C ville
have krævet at nogen huskede en ekstra handling, eller at en automatik kørte
rigtigt, klokken 23 en fredag.

---

## Arkitekturen

1. **Kollektion `flash-drop-01` i Shopify.** Hvert motiv én vare:
   `productType: "Flash"`, pris efter størrelse, **lager sporet, antal 1,
   policy DENY**. Det er første gang huset sporer lager — alt andet står
   `tracked: false` — og det er med vilje: her ER knapheden ægte, og
   Shopify skal håndhæve den i stedet for os.
2. **`/flash` læser kollektionen** via `productsInCollection()`, som
   allerede findes (Groks lane, S574).
3. **Solgt skal SES, ikke forsvinde.** Hylden filtrerer i dag varer uden
   `availableForSale` fra. For flash er det forkert: «når et motiv er væk,
   er det væk — og siden siger det». Et solgt motiv bliver stående, tonet
   ned, med ordet på sig. Det er halvdelen af beviset for at knapheden er
   ægte.
4. **Køb via cart-permalink**, som resten af huset. Ingen betalingslogik
   her (rails §3).
5. **`/en/flash` findes ikke** — den 308'er til dansk i dag. Droppet skal
   have en engelsk flade, eller også skal 308'en blive. Harukis lane.

---

## Kriterierne

1. **Givet** at jeg står på `/flash` mens et drop er åbent, **når** jeg
   kigger, **så** kan jeg se hvert motiv, hvad det koster, og om det er
   ledigt — uden at klikke mig ind på noget.

2. **Givet** at jeg køber et motiv, **når** jeg genindlæser siden, **så**
   står motivet der stadig, mærket som taget. Det forsvinder ikke: at se
   hvad der er væk, er halvdelen af grunden til at komme igen næste gang.

3. **Givet** at et motiv er taget, **når** jeg prøver at købe det alligevel
   — også ved at gemme linket og komme tilbage senere — **så** kan jeg
   ikke. Ingen død købsknap (rails §4).

4. **Givet** at jeg lige har set droppet, **når** jeg vil vide hvornår det
   næste kommer, **så** kan jeg skrive mig i Blackbook fra samme side, og
   det står hvad jeg får: motiverne 24 timer før alle andre.

5. **Tid — Givet en vilkårlig dag D:** siger siden at et drop er åbent, så
   ER der motiver at købe. Er der ingen, siger den at der ikke er nogen —
   aldrig en tom liste der ligner udsolgt, og aldrig «snart» oven på et
   drop der faktisk kører.

6. **Negativ kontrol:** sælges det sidste motiv, **så** skifter siden til
   «droppet er slut» — den bliver ikke stående med ti nedtonede kort og en
   overskrift der siger at droppet er åbent.

7. **Givet** at jeg er engelsk turist, **når** jeg lander på flash, **så**
   møder jeg enten en engelsk side eller den danske — aldrig en 404, og
   aldrig halvt oversat.

---

## Sådan efterprøves det uden at læse kode

```bash
# motiverne er på siden, og de har priser
curl -s https://inkandart.dk/flash | grep -c 'myshopify.com/cart/'

# et solgt motiv staar stadig paa siden, men kan ikke koebes
curl -s -o /dev/null -w '%{http_code}\n' "https://d1qp54-0w.myshopify.com/cart/<SOLGT>:1"   # 410
curl -s -o /dev/null -w '%{http_code}\n' "https://d1qp54-0w.myshopify.com/cart/<LEDIG>:1"   # 302
```

Og til sidst: **Steven køber et motiv selv** og ser det blive mærket taget.

---

## Hvad der IKKE bygges

- **Ingen mailmotor.** Shopify Email sender til Blackbook-segmentet.
  Afsendelsen er Sonjas eller Stevens hånd, ikke kodens.
- **Ingen nedtælling til droppet åbner.** Et ur der tæller ned til et
  tidspunkt vi selv kan flytte, er en løgn med sekunder på.
- **Ingen venteliste pr. motiv.** Ét motiv, én køber. En venteliste på noget
  unikt lover noget vi ikke kan holde.

---

## Åbne punkter — de her blokerer

| # | hvad | hvem |
|---|---|---|
| 1 | **Priserne.** Størrelserne og hvad de koster. Jeg opfinder ikke husets priser. | Emma |
| 2 | **Hvad sker der efter købet?** Stevens svar 30/8: *«Skal afklares med Nizar og Emma.»* Indtil det er afklaret, må copy'en **ikke** love hverken en tid eller en frist. | Nizar + Emma |
| 3 | ~~Vej A, B eller C~~ — **afgjort 30/8: vej A.** | ~~Steven~~ ✅ |
| 4 | **Ti motiver og en dato.** Hvert motiv: billede, størrelse, pris. | Emma |

Punkt 2 er det eneste der kan gøre siden usand: sælger vi et motiv uden at
kunne sige hvad der så sker, står kunden med en kvittering og intet svar.
Copy'en skrives derfor **efter** det svar, ikke før.
