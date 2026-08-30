# Planen: alle sider, alle knapper, alle integrationer virker

Skrevet af Haruki 30/8 aften, efter Stevens tredje fund-runde på én dag.
Bestilling: *«Jeg vil have at du lægger en fyldig plan for at alle sider,
alle knapper, alle integrationer virker … med fokus på UX og det visuelle.»*

## 0. Hvorfor det bliver ved med at ske — og hvad der ændres

Tre fund-runder, samme tre rødder:

**A. Struktur før mening.** Vi har bygget sider der *findes* før de
*siger noget*: Natten uden forklaring, booking uden trappe, Emma uden
sine egne ord — som lå i det afleverede materiale hele tiden.
*Ændring:* ingen flade er færdig før den består «fremmed-testen»: en
person der aldrig har hørt om huset skal kunne svare på «hvad er det
her, og hvad kan jeg gøre?» inden for ét skærmbillede.

**B. QA måler geometri, ikke rejser.** 205 grønne prøver og en
farvemåler så ikke et link man ikke kunne trykke på. Vilde lukker
geometri-hullet; rejserne mangler.
*Ændring:* K-turene nedenfor (kundens tur) køres som browserprotokol
med skærmbilleder FØR noget meldes færdigt — og hver PR der rører en
flade skal gå sin egen tur.

**C. Afleveret materiale uden kvittering.** Emmas docx blev staget og
halvt brugt. *Ændring:* når Steven afleverer materiale, kvitteres med
en LISTE over hvert element og hvor det landede — det uudnyttede står
som «ikke brugt, fordi …».

## 1. Kundens ture — de syv rejser der SKAL virke

Hver tur køres i browser, mobil + desktop, med skærmbillede per trin.
En tur er grøn når alle trin er set, ikke når koden er læst.

| # | Tur | Trin | Status 30/8 |
|---|---|---|---|
| K1 | **Book hos en artist** | Forside → artistkort → artistside (bio!) → Book tid → /booking «Hos {navn}» → depositum → Shopify-checkout → Book.dk | Virker efter #217 til og med checkout-siden. Selve betalingen + bekræftelsesmail = U2, Stevens tur |
| K2 | **Køb en vare** | /maerket → varekort → vareside → Læg i kurv → Shopify-checkout | ✅ målt 30/8, priser fra Storefront, kollektion live |
| K3 | **Gavekort** | /gavekort → beløb → checkout → modtager-flow (/gavekort/til-dig) | Permalinks målt 302 ✅ — men fladen er Emerge-design, og modtager-mailen er aldrig set. Tur mangler |
| K4 | **Walk-in-kunden** | Google/QR → /walk-in → adresse, tider, hvad man kan få | Fladen er Emerge. Åbningstider er TOMME (gaden.yml) — en walk-in-kunde kan ikke se hvornår der er åbent. BLOKKER, kræver de rigtige tider fra Nizar/Simone |
| K5 | **Natten/Blackbook** | /natten → forstå konceptet → skriv dig op → få mail | Siden fikset i #217. Selve mail-flowet (subscribe → Shopify → velkomstmail?) aldrig set ende-til-ende |
| K6 | **Engelsk kunde** | /en → ??? | /en er stadig HELE det gamle Emerge-design. En engelsk turist ser et andet site end en dansk. Skal porteres eller ærligt 308'es |
| K7 | **Sonja redigerer** | /admin → GitHub-login via oauth.bygmedai.dk → ret huset.yml → se det live | Decap-config komplet (#214) — men SELVE LOGINET er aldrig prøvet af et menneske. Skal testes med Sonja i denne uge |

## 2. Side-for-side: UX + visuelt

Gennemgået 30/8. ✅ = i orden efter dagens PR'er · 🔧 = konkret opgave · 🎨 = venter på Sonjas shoot

| Side | Tilstand | Mangler |
|---|---|---|
| / Huset | ✅ efter #212 | 🎨 hero er neonskiltet — Sonjas shoot kan give et bedre; vælges i huset.yml |
| /stolen | ✅ | 🎨 Nizars portræt er 51 % sort (Stolen 390-porten rød) |
| /stolen/[id] | ✅ efter #217 | 🔧 Nizar + Anna bio (deres egne ord — Sonja samler ind); 🎨 Annas portræt (150px-avatar er fravalgt, kortet viser hendes arbejde) |
| /maerket | ✅ kollektion live | 🔧 Sonjas 100 varer ind i kollektionen `hylden` (hendes opgave, Shopify admin); grupperings-UX når der ER 100 varer (filter/grupper pr. productType) — Grok |
| /maerket/[handle] | ✅ | 🔧 salgslinje fra Shopify-description (Groks #213-opfølgning — landet?) |
| /natten | ✅ efter #217 | 🔧 ORD-TJEK intro (Steven); næste nats dato ind når den kendes |
| /gaden | 🔧 | **Åbningstider tomme.** Siden udelader dem ærligt, men K4-kunden har brug for dem. Kræver de rigtige tal — ind via Decap |
| /booking | ✅ efter #217 | U2-turen (Steven) er den endelige dom |
| /booking/tak | 🔧 | «[AFVENTER STEVEN] konsekvens ved ubetalt» står stadig i koden — beslutning mangler |
| /walk-in, /flash, /gavekort, /shop | 🔧 | **Emerge-øen.** Fire flader i det pensionerede design, stadig live og linket. Beslutning pr. flade: portér til Rummet eller luk med redirect. Forslag i §4 |
| /en/* | 🔧 | Hele Emerge på engelsk. Min lane. Forslag: minimal EN-Rummet (forside + booking + walk-in) i denne uge, resten 308 til dansk |
| /aftercare, /betingelser, /privatlivspolitik | ✅ indhold | 🔧 visuel efersyn i Rummet-dragt (er de stadig Emerge-stylede?) — tjekkes i K-turene |
| app.inkandart.dk | 🔧 | Emerge-identitet. Groks brief A1–A5 ligger klar; efter hylden |

## 3. Integrationer — målt, med dato

| Integration | Sidst målt | Status |
|---|---|---|
| Shopify Storefront (priser, kollektion) | 30/8 | ✅ 3 varer, billeder, publiceret til begge kanaler |
| Cart-API → checkout | 30/8 live | ✅ 303 + kurv-tæller |
| Gavekort/depositum-varianter | 30/8 | ✅ alle 302, negativ kontrol 410 |
| Book.dk (inkart.book.dk) | 30/8 | ✅ 200. Personale sat op 30/8 — men: Touch-up-ydelsen er slukket for ALLE (huset lover gratis touch-up); «Emma Windinnalls» ≠ «Emma Winding»; Annas profilmail er book@ ikke booking@; en «Fra 1. sep (Planlagt)»-periode ligger ulæst på Annas tider |
| Subscribe/Blackbook-API | 30/8 | ✅ afviser pænt — men succes-flowet (rigtig mail) aldrig set |
| Decap CMS | 30/8 config | 🔧 login-turen aldrig kørt af et menneske (K7) |
| Vercel deploy + rollback | 30/8 | ✅ rollback øvet, 20 sek |
| vilde-qa i CI | 30/8 | ✅ kører på hver PR. 🔧 Vilde: env-linjer så købsknappen måles |
| DNS/redirects (www, shop., app.) | 30/8 | ✅ |
| Mails (booking@, bekræftelser) | — | ❌ ALDRIG målt herfra. Del af U2/K3/K5 |

## 4. Rækkefølgen — hvem gør hvad

**Nu (søndag aften / mandag, butikken lukket):**
1. **Steven:** merge #217 · ORD-TJEK Natten-intro (ret i Decap) ·
   beslut «konsekvens ved ubetalt» · U2-turen når du vil
2. **Haruki:** K-turene 1–5 som browserprotokol med skærmbilleder →
   fundliste samme aften · derefter K6-forslaget (EN-Rummet minimal)
3. **Grok:** salgslinjen (#213-opfølgning) → derefter Mærket-UX til
   100 varer (grupper/filter) → derefter app-briefet
4. **Vilde:** env-linjerne i vilde-qa → derefter K-turene som
   automatiseret protokol (hendes lane: målingen af rejserne)

**Denne uge:**
5. **Sonja:** varer i kollektionen `hylden` · Decap-login prøves (K7,
   med Haruki på sidelinjen) · foto-shoot efter guiden (åbner Stolen-
   porten + bedre hero) · Anna/Nizar-bio samles ind
6. **Simone/Nizar → Sonja:** de rigtige åbningstider ind i gaden.yml
   via Decap (løsner K4-blokkeren)
7. **Haruki:** Emerge-øens afvikling som beslutningsoplæg: pr. flade
   «portér / luk» med hvad hver koster — Steven beslutter, ejerne
   bygger i egne lanes
8. **Book.dk-beslutninger (Steven/Simone):** Touch-up tændes? Emma-
   navnet rettes? Annas profilmail? «Fra 1. sep»-perioden?

**Reglen der binder det hele:** en flade er færdig når dens K-tur er
gået i browser med skærmbilleder — ikke når dens prøver er grønne.
Prøver fanger regressioner; kun turen fanger mening.
