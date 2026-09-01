# Forslag: vejen fra booking til stolen

**Type:** forslag — docs-only, ingen kode
**Version:** v2, revideret efter Sirius' review af PR #280
**Bygger:** Villy · **Review:** Sirius · **Beslutning:** Steven
**Acceptkriterier:** `docs/accept/samtykke-flow.md` (UDKAST v2)

**Stevens bestilling, ordret:**

> «En kunde skal have en automatiseret vej fra booking, via samtykke, til at
> møde op i butikken. Hvor artisten skal kunne se alt … også at kunne rådgive
> såfremt der er ting der skal tages hensyn til, som kunden har beskrevet om
> sin krop og sig selv, og som kan være i modstrid med kundens eget ønske.»

---

## 0. Hvad der er målt, og hvad der er antaget

Alt i dette afsnit er efterprøvet 1/9 2026 mod produktion og mod koden på
`main`. Intet af det er læst i en README.

| Påstand | Sådan er den efterprøvet |
|---|---|
| Stevens erklæring blev aldrig gemt | Shopify Admin API: ingen kunde oprettet eller opdateret 1/9. Nyeste `updatedAt` = 2026-08-31T23:32:41Z (Harukis røgtest). Bekræftet af Stevens eget skærmbillede: ingen tag, ingen note, intet metafelt |
| Fladen lyver ikke selv | `SamtykkeFlade.tsx:56` — `if (res.ok) setTilstand("tak")`. Serveren svarede altså 200 |
| Serveren svarer 200 uden at skrive | `app/api/samtykke/route.ts`: `const kendt = …includes("taken"); if (!skabt?.customer?.id && !kendt) return 502;` → derefter `return svar(200, {ok:true})` |
| Røgtesten ramte aldrig fejlen | Den brugte `roegtest-samtykke@bygmedai.dk` — en frisk adresse. `customerCreate` lykkes; «taken»-vejen blev aldrig kørt |
| Der sendes ingen mail | Ingen mail-kode i ruten. Grep efter nodemailer/resend/postmark/sendgrid/mailto: → 0 træf |
| `/booking` og `/samtykke` kender ikke hinanden | 0 krydsreferencer i begge retninger |
| Huset kan allerede det rigtige greb | `/api/subscribe:433` — «Om det betyder ‹findes allerede› afgøres **IKKE** ved at læse fejlteksten» → den slår kunden op og opdaterer |

**Antaget, ikke målt:** at Steven brugte en mailadresse der fandtes i forvejen.
Det er den eneste vej der giver 200 uden en skrivning, men jeg har ikke set
hans indtastning.

---

## 1. Tre bindinger. De former designet

**B1 — Book.dk er ikke vores.** `app/(rummet)/booking/page.tsx:25`:
*«Book.dk kan ikke deep-linke.»*

**B2 — Kunden skriver aldrig et referencenummer.** `content/booking.yml`:
*«mailadressen står allerede i både Book.dk og Shopify, og det er den vi
afstemmer på.»*

**B3 — `inkandart.dk` har ingen login.** Ingen brugerkonti, ingen
adgangsstyring. Og CLAUDE.md: **0 credentials, nogensinde.**

---

## 2. Sirius' review — hvad der holder

Jeg har vurderet punkterne enkeltvis. **Syv af dem holder**, og et af dem er
skarpere end min egen analyse:

**2.1 Tags er selv helbredsoplysninger.** Mit v1-forslag om
`blodfortyndende`, `gravid`, `pigment-allergi` som Shopify-tags var forkert.
Et tag er synligt i lister, i søgning, i eksporter og for enhver app med
kunde-scope. **Trukket tilbage uden forbehold.**

**2.2 Vej A er ikke en tastefejlsrisiko — det er en identitetsfejl.** Dette
er reviewets bedste fund, og jeg gik forbi det. Med mail + dato kan
**enhver der kender en kundes mailadresse** aflevere helbredsoplysninger på
den kundes profil. Jeg skrev at AC2 gjorde en tastefejl «synlig». Det er
den forkerte ramme. Han har ret.

**2.3 «Ren kunde tier» er en farlig nul-tilstand.** Det stikker, fordi det
er præcis den fejltype jeg selv har jagtet hele dagen: en tom skærm ser ens
ud, uanset om kunden er rask eller om erklæringen mangler. Fire eksplicitte
tilstande i stedet.

**2.4 Gyldighed skal skilles fra sletning.** Et fejlet oprydningsjob må
aldrig forlænge en gyldighed. Rigtigt og vigtigt.

**2.5 AC8 var for svag.** Privat fane måler kun anonym adgang. De rigtige
risici er en uautoriseret medarbejder, et genbrugt link, og lækage i URL,
emnefelt, analytics og logs.

**2.6 AC6 manglede tidsvindue, tidszone, flytning og flerdags-sessioner.**

**2.7 Acceptkriterier må ikke navngive et system.** v1 skrev «Shopify» ind i
tre af dem. Det var en implementering forklædt som et krav.

Alle syv er ført ind i `docs/accept/samtykke-flow.md` v2.

**Om de juridiske henvisninger:** jeg tager rammen — helbredsoplysninger er
en særlig kategori, og principperne i artikel 5 gælder. Jeg har ikke
efterprøvet de konkrete sider, og jeg vejer dem ikke. **Det gør en jurist —
hverken han eller jeg.**

---

## 3. Fire steder hvor jeg ikke følger ham

### K1 — Model 3 gør huset selv til databehandler for helbredsdata

Sirius afviser Shopify som journal (rigtigt) og mail som alternativ
(rigtigt) — og foreskriver så en **selvbygget vault** med
adgangsbegrænsede medarbejderroller, servergenererede engangs-tokens,
sletning med retry, overvågning og revisionsspor.

Det ville blive **det mest sikkerhedskritiske system huset ejer.** Bygget af
fire agenter i højt tempo, uden en sikkerhedsansvarlig, i et repo hvis
hårdeste skinne er *0 credentials, nogensinde*, på et site der i dag ikke
har så meget som ét login.

Og bemærk hans egen liste over hvad juraen skal afgøre: den indeholder
**databehandlerforhold**. En selvbygget vault har ingen databehandler at
pege på — **vi bliver den selv**, for særlige kategorier af persondata.

Han fjerner én risiko og installerer en større uden at veje den. Det er
ikke en indvending mod hans diagnose; det er en indvending mod hans recept.

### K2 — Han låser arkitekturen i samme åndedrag som han siger «jura først»

Hvis behandlingsgrundlag, artikel 9-undtagelse, adgangskreds,
databehandlerforhold og opbevaringsfrist alle er ubesvarede — og det er
hans egne ord — så er **Model 3 lige så for tidlig som Model 1.**

Det juridiske svar kan selv afgøre hvor data må ligge. Falder det ud til at
det eneste holdbare grundlag kræver en databehandler med en aftale, er en
selvbygget vault ude, uanset hvor pænt den er tegnet.

Man kan ikke sige «ingen kode før jura» og samtidig fastlægge arkitekturen.

### K3 — Ingen af hans fire Book.dk-spørgsmål spørger om vi allerede ejer løsningen

Alle fire handler om **integration**: variabler, webhooks, tokens. Ingen af
dem spørger om Book.dk simpelthen skal **holde** erklæringen.

Målt i dag, ordret fra `book.dk/funktioner/journalsystem`:

> «Med vores intuitive **journalsystem** får du nem adgang til al
> kundeinformation og **behandlingshistorik** samlet ét sted.»

> «Systemet understøtter også **digital underskrift**, så du nemt kan
> **indhente samtykke** fra dine klienter.»

> «Sikker opbevaring af **personfølsomme data** med fokus på datasikkerhed
> og overholdelse af alle GDPR-krav.»

> «Alle data er **krypteret** både under transmission og lagring.»

> «Du kan tilpasse systemet til netop dine behov med **skabeloner**,
> quick-notes og genveje.»

Og forsiden kalder produktet: *«Professionelt Booking, Kasse &
journalsystem.»*

**Huset betaler allerede for et journalsystem med digital underskrift til
samtykke, krypteret opbevaring af personfølsomme data og skabeloner — i det
system hvor bookingen i forvejen bor.**

### Model 0 — erklæringen bor der hvor bookingen bor

```
Book.dk: booking  →  journalpost på DEN booking  →  digital underskrift
                                ↓
                  artistens skærm ER journalen (har allerede logins)
                                ↓
              Shopify: rører aldrig en helbredsoplysning
```

Hvad Model 0 løser, uden at vi bygger noget:

| | |
|---|---|
| ~~**Identitetsbindingen**~~ | ~~intrinsisk~~ — **FALSIFICERET 1/9, se nedenfor.** Journalposten hænger på **kunden**, ikke på bookingen |
| **«Én skærm»** | journalen ER skærmen, og den har allerede medarbejderlogins og roller |
| **Ingen helbredsdata i Shopify** | de kommer aldrig i nærheden |
| **Databehandlerforholdet** | Book.dk er den naturlige modpart. Vi bliver ikke selv behandler |
| **Ny angrebsflade** | ingen. Ingen vault, ingen nye konti, intet nyt sted hvor helbredsdata kan lække |

**Det Model 0 sandsynligvis ikke kan:** råbe modstriden op. Automatisk at
sammenholde «blodfortyndende» med «stor flade» er næppe en færdig funktion i
et salon-journalsystem. **Det er formentlig hele vores byggeopgave** — og
den kan vise sig at være en skabelon og en husregel frem for kode.

**Hvad jeg IKKE ved, og som afgør det hele.** Alt ovenfor står på Book.dks
egne markedsføringssider. Jeg har ingen konto. Jeg kan ikke efterprøve:

- om journalen kan bære **vores felter** (motiv, placering, størrelse,
  helbred i egne ord) — siden nævner skabeloner, ikke frie felter
- om **kunden** kan få sin egen kopi
- om artisten kan åbne den **på en telefon ved stolen**
- om der findes en **databehandleraftale**
- hvad «GDPR-overholdelse» konkret dækker

Og ét direkte hul: **siden nævner ingen sletteprocedure.** Kun automatisk
backup. Mod Sirius' krav om opbevaringsbegrænsning er det et åbent
spørgsmål, ikke et svar.

**Derfor er Model 0 ikke en konklusion. Det er en måling der mangler** — og
den koster tyve minutter inde i en konto vi allerede betaler for. Den bør
foretages før nogen tegner en vault.

### MÅLT 1/9 — og Model 0 holder ikke som beskrevet

Steven åbnede kontoen. Jeg tog fejl på tre punkter, og de er mine egne.

**Journalen findes**, men den er en fane på **kundekortet** — ikke en app, og
ikke en del af bookingen. Faneraekken er `Kunde · Kundegrupper · Journal ·
Aftaler`.

| Vi har brug for | Journalen er |
|---|---|
| et skema **kunden** udfylder hjemmefra | et **fritekstfelt personalet** skriver i: «Skriv journal indlæg her…» |
| strukturerede felter (motiv, placering, helbred) | brødtekst med fed/kursiv, billeder og lydoptagelse |
| binding til **den konkrete aftale** | binding til **kunden**. «Journal» og «Aftaler» er adskilte faner |
| digital underskrift | **ikke set nogen steder i dialogen** |

**Den tungeste rettelse er bindingen.** Jeg skrev ovenfor at Model 0 løser
identitetsbindingen «intrinsisk, fordi journalposten hænger på bookingen».
**Det er forkert.** Den hænger på kunden. AC2 og AC6 ville ikke være opfyldt
— præcis den svaghed reviewet pegede på, og jeg påstod at have løst den
uden at have set produktet.

**Og den digitale underskrift — mit eget afgørende spørgsmål — ses ikke.**

**Model 0 er dermed ikke en vej som beskrevet.** Den er højst et sted at
lægge et referat, ikke et sted at indhente en erklæring.

**To ting fra målingen står stadig:**

- **Kundekortet har et CPR-felt.** Systemet er bygget til at bære følsomme
  personoplysninger, og der er formentlig en databehandleraftale. Det taler
  fortsat for K1 — mod at huset selv bygger et helbredsdata-system.
- **«Se minside som ‹kundens navn›»** — der findes en kundevendt flade.
  Det er det eneste sted tilbage hvor et kundeudfyldt skema kunne bo, og
  det er ikke undersøgt.

**Hvad der stadig ikke er målt:** om digital underskrift findes et andet
sted i produktet, hvad «minside» kan, og om der findes en API der kan
skrive til journalen.

### K4 — «Byg ikke Vej A» fjerner en nødvej uden at nævne en anden

Hans spørgsmål 4 er det rigtige: *hvem sender invitationen, hvis intet kan
automatiseres?* Men reviewet forbyder den eneste nødvej der var beskrevet,
og sætter ikke en anden i stedet. Så står vi uden flow hvis Book.dk siger nej.

**Mit svar:** nødvejen er ikke at kunden taster sin egen mail. Det er at
**huset udsteder linket.**

Book.dks notifikation lander allerede i `booking@inkandart.dk` med kundens
navn — det ses i Stevens indbakke: *«Book.dk Booking Service · Ny booking
notifikation — Reeve Jensen.»* Adressen kommer altså **fra bookingsystemet,
ikke fra den der åbner formularen.** Et engangslink udstedt af os til den
adresse bevarer identitetsbindingen uden at Book.dk skal kunne noget som
helst med skabeloner.

Det er svagere end Model 0 og svagere end en ægte token fra Book.dk. Det er
**ikke** Vej A.

---

## 4. Hvad der skal måles nu — revideret rækkefølge

Sirius' fire spørgsmål er gode, men de starter ét trin for sent.

| # | Spørgsmål | Hvem |
|---|---|---|
| **0** | **Kan Book.dks journal bære erklæringen?** Egne felter, kundens kopi, artistens visning på telefon, sletning, databehandleraftale | Steven eller Sonja, inde i kontoen |
| 1 | Kan Book.dk indsætte booking-ID, dato, mail og artist som variabler? | — kun hvis 0 falder |
| 2 | Kan den kalde webhook/API ved oprettelse, flytning og aflysning? | — kun hvis 0 falder |
| 3 | Kan vi udstede en engangs-token pr. booking? | — kun hvis 0 falder |
| 4 | Hvis nej til alt: huset udsteder linket (K4) | Steven |

**Spørgsmål 0 kan spare hele opgaven.** Det er den billigste måling i
projektet, og den kræver et login jeg ikke har og ikke skal have.

---

## 5. Hvad jeg beder om svar på

1. **Model 0 mod Model 3.** Er det rigtigt at måle Book.dks journal før vi
   tegner en vault? Jeg mener ja, og K1 er min begrundelse.
2. **K2 — rækkefølgen.** Kan arkitekturen fastlægges før det juridiske svar,
   eller skal begge vente?
3. **K4 — nødvejen.** Holder «huset udsteder linket» som identitetsbinding,
   hvis Book.dk ikke kan udstede tokens?
4. **Modstrids-listen.** Sirius og jeg er enige om at den kun må flagge til
   menneskelig vurdering, aldrig afgøre. Formen — status mod fritekst — er
   stadig åben, og indholdet skal en fagperson godkende.

---

## 6. Efterskrift: hvad der blev bygget, og den ene rest der staar tilbage

Flowet er bygget i **#281** — to breve, ingen vault, Shopify roert slet
ikke. Acceptkriterierne v3 foelger med den PR; **dette dokument baerer
dem ikke mere.** Filen fandtes ikke paa `main`, og to aabne PR'er der
hver tilfoejer sin version af den samme fil er en faelde: den forkerte
raekkefoelge lader v2 overskrive den v3 der matcher koden, uden at nogen
proeve gaar roed. Afhaengigheden er fjernet frem for skrevet ned.

### Resten: et sendt brev er ikke et modtaget brev

Resend svarer `2xx` naar brevet er **accepteret til afsendelse**, ikke
naar det er landet. To ting falder derfor uden for vores fail-closed:

| | Resend | ruten | kunden ser |
|---|---|---|---|
| domaenet ikke verificeret | 4xx | **502** | «det gik galt» — korrekt |
| afvist eller bounced hos modtageren | **2xx** | **200 TAK** | «vi har den» — og brevet kom aldrig |

**Det er ikke teoretisk.** Haruki fandt det i husets egen Resend-log 1/9:
et brev fra en anden rute til `kontak@bygmedai.dk` — en stavefejl, der
mangler et t. Resend svarede 2xx. Status er `suppressed`. Ingen fik det
at vide, og det har koert saadan i ukendt tid.

**Lukningen er lille.** Resend foerer `last_event` pr. brev. Ét laesekald
mod `GET /emails`, der flager alt der ikke staar `delivered`, fanger
baade en afvisning, en kundes tastefejl og en fuld postkasse — tre
huller, ét kald. Ingen webhook, intet endepunkt, ingen
signaturvalidering, ingen ny offentlig flade. Den kan koere som en vagt
én gang i doegnet.

Den kraever en **laese**-noegle. Den vi sender med, er med vilje
sending-only og laast til ét domaene, og det skal den blive ved med at
vaere.

*Jeg skrev det foerst som «kraever bounce-webhooks» og lagde det dermed i
samme bunke som den kompleksitet vi netop havde skaaret vaek. Haruki
rettede formuleringen, og han har ret: forskellen afgoer om nogen toer
tage den. Den hoerer til som sit eget lille stykke med sin egen accept.*

---

## 7. Kendt restrisiko

- **Ingen juridisk afgørelse.** Intet af AC3, AC4, AC5 eller AC8 kan bygges
  før den findes. Jeg er ikke jurist.
- **Model 0 er umålt.** Alt om Book.dks journal står på deres egne
  salgssider. Ingen konto, ingen efterprøvning.
- **Book.dks tekniske evner er umålte.** Uden svar kan AC1, AC2 og AC6 ikke
  bygges som skrevet.
- **Ingen notifikation til artisten.** Hun åbner dagens aftale.
- **Ingen rate-limit.** Arvet fra `/api/subscribe`; edge-runtime har ingen
  delt tilstand, så en tæller i hukommelsen ville være teater.
- **Årsagsforklaringen hviler på én antagelse** (§0).

---

*v1 1/9 2026. v2 samme dag efter Sirius' review. Forslag — ikke en
beslutning, og ikke bygget.*

**Kilder til §K3:** [book.dk — journalsystem](https://book.dk/funktioner/journalsystem) · [book.dk — forside](https://book.dk/)
