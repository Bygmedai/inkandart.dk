# Forslag: vejen fra booking til stolen

**Type:** forslag — docs-only, ingen kode
**Til review:** Sirius · **Bygger:** Villy · **Merge-gate:** Steven
**Dato:** 1/9 2026 (S578)
**Acceptkriterier:** `docs/accept/samtykke-flow.md` (UDKAST, PR #280)

**Stevens bestilling, ordret:**

> «En kunde skal have en automatiseret vej fra booking, via samtykke, til at
> møde op i butikken. Hvor artisten skal kunne se alt, for at kunne hjælpe
> kunden med at få sat den rigtige tus, det rigtige sted og også at kunne
> rådgive såfremt der er ting der skal tages hensyn til, som kunden har
> beskrevet om sin krop og sig selv, og som kan være i modstrid med kundens
> eget ønske.»

Og: *«Drop at fixe løgnen, da vi ingen kunder har pt. Vi bygger det rette flow.»*

---

## 0. Hvad der er målt, og hvad der er antaget

Alt i dette afsnit er målt 1/9 2026 mod produktion og mod koden på `main`.
Intet af det er læst i en README.

| Påstand | Sådan er den efterprøvet |
|---|---|
| Stevens erklæring blev aldrig gemt | Shopify Admin API: ingen kunde oprettet eller opdateret 1/9. Nyeste `updatedAt` = 2026-08-31T23:32:41Z (Harukis røgtest). `steven.wensley@gmail.com` sidst rørt 22/8 |
| Fladen lyver ikke selv | `SamtykkeFlade.tsx:56` — `if (res.ok) setTilstand("tak")`. Serveren svarede altså 200 |
| Serveren svarer 200 uden at skrive | `app/api/samtykke/route.ts`: `const kendt = …includes("taken"); if (!skabt?.customer?.id && !kendt) return 502;` → derefter `return svar(200, {ok:true})` |
| Røgtesten ramte aldrig fejlen | Den brugte `roegtest-samtykke@bygmedai.dk` — en frisk adresse. `customerCreate` lykkes; «taken»-vejen blev aldrig kørt |
| Der sendes ingen mail | Ingen mail-kode i `app/api/samtykke/route.ts`. Grep efter nodemailer/resend/postmark/sendgrid/mailto: → 0 træf i ruten |
| `/booking` og `/samtykke` kender ikke hinanden | 0 krydsreferencer i begge retninger |
| Huset kan allerede det rigtige greb | `/api/subscribe:433` — «Om det betyder ‹findes allerede› afgøres **IKKE** ved at læse fejlteksten» → den slår kunden op og opdaterer |

**Ironien er værd at bemærke:** samtykke-ruten kopierede token-vekslingen fra
`/api/subscribe` og skriver det selv i sin header. Den kopierede hærdningen,
men ikke opslaget.

**Antaget, ikke målt:** at Steven brugte en mailadresse der fandtes i forvejen.
Det er den eneste vej der giver 200 uden en skrivning, men jeg har ikke set
hans indtastning. Falder den antagelse, falder årsagsforklaringen — ikke
fundet.

---

## 1. Tre bindinger. De er ikke til forhandling, og de former designet

**B1 — Book.dk er ikke vores.** `app/(rummet)/booking/page.tsx:25` siger det
selv: *«Book.dk kan ikke deep-linke.»* Bookingen er gratis og sker på et
fremmed system. Vi ejer hverken dens data eller dens mails.

**B2 — Kunden skriver aldrig et referencenummer.** Husets eget kald i
`content/booking.yml`: *«mailadressen står allerede i både Book.dk og
Shopify, og det er den vi afstemmer på.»*

**B3 — `inkandart.dk` har ingen login.** Ingen brugerkonti, ingen
adgangsstyring. En side med en kundes helbredsoplysninger kan derfor ikke
ligge her. Og CLAUDE.md: **0 credentials, nogensinde.**

---

## 2. Den ene ubekendte der afgør hvilket flow vi overhovedet kan bygge

**Kan Book.dks bekræftelsesmail bære vores link — og kan den bære bookingens
eget referencenummer i URL'en?**

Det spørgsmål har to svar, og de giver to forskellige produkter:

### Vej A — Book.dk kan kun bære et fast link

Kunden får `inkandart.dk/samtykke` og skriver selv **mailadresse + aftalens
dato**. Koblingen er kundens hukommelse.

- Billig. Ingen integration. Kan bygges i dag.
- **Svag.** En tastefejl i datoen giver en erklæring der peger på den forkerte
  dag, og ingen opdager det før kunden står ved stolen.
- AC2 gør fejlen **synlig**; den forhindrer den ikke. Det er en reel svaghed,
  ikke en formalitet.

### Vej B — Book.dk kan bære variabler i mailskabelonen

Kunden får `inkandart.dk/samtykke?ref=<bookingens eget id>`. Vi gemmer
referencen ordret og aldrig andet.

- **Stærk.** Erklæringen er bundet til aftalen af systemet, ikke af kunden.
- Kræver at nogen åbner Book.dks mailskabelon og ser efter.
- Ændrer ikke vores kode ret meget — feltet er bare forudfyldt og skrivebeskyttet.

**Min anbefaling:** Vej B, hvis den findes. Og **den afklaring koster
minutter og skal hjem før første commit** — ikke bagefter. Det er den
billigste risikoreduktion i hele opgaven.

**Bygger vi Vej A først, skal skemaet designes så Vej B kan sættes i uden at
kunden mærker det:** samme felt, forudfyldt i stedet for tomt.

---

## 3. Forslaget

```
1  Kunden booker på Book.dk                         gratis, uændret
2  Bekræftelsen bærer link til /samtykke            ← INDSTILLING, ikke kode
3  Kunden udfylder hjemmefra
4  Kvittering til KUNDEN — hele erklæringen ordret
5  Erklæringen på kundekortet i Shopify
      + modstrid som TAG                            ← ses uden at åbne noget
6  Ved stolen: artisten slår op på mailadressen
```

**Trin 2 er ikke kode.** Det er en indstilling i Book.dk. Kan systemet det
ikke, falder flowet tilbage til at huset sender linket — og så skal vi vide
**hvem** der gør det og **hvornår**, ellers er «automatiseret vej» et ord
uden dækning.

---

## 4. Designvalg, med det jeg fravalgte

### 4.1 Pakken bor i Shopify admin

**Valgt:** kundekortet i Shopify — tags, note og et metafelt.

| Fravalgt | Hvorfor |
|---|---|
| Login på `inkandart.dk` | Ny brugerdatabase, nye adgangskoder, ny angrebsflade — for at vise noget Sonja allerede har et system til. Bryder B3 og husets 0-credentials-regel |
| Et tredje system (Notion, Airtable) | Endnu en flade at vedligeholde, endnu et sted helbredsdata ligger, endnu en konto der kan miste adgang |

Sonja er i Shopify hver dag. Kunden findes der i forvejen. Det er det eneste
sted der allerede har konti, adgangsstyring og en logbog.

### 4.2 Modstrid som tag, ikke kun som tekst

Et afkrydsningsfelt blandt fem andre bliver overset. Et **tag** står øverst
på kundekortet og kan ses uden at åbne noget.

Udkast til reglerne — **de skal godkendes af nogen der sætter tusch i
mennesker til daglig, ikke af mig:**

| Kunden har oplyst | Sammen med | Tag |
|---|---|---|
| gravid | hvad som helst | `stop-tal-med-kunden` |
| blodfortyndende | stor flade / lang session | `oeget-bloedning` |
| allergi | farvet motiv | `pigment-allergi` |
| hudlidelse | placeringen den sidder på | `hud-paa-stedet` |
| under 18 | hvad som helst | hård spærring, ikke et tag |

**Negativ kontrol i AC5:** en kunde uden helbredssvar får **ingen** tags.
Ellers betyder et tag ingenting.

**Dette er ikke medicinsk rådgivning.** Listen råber; den beslutter ikke.
Artistens dømmekraft står over den.

### 4.3 Fail-closed på kvitteringen

Dagens fejl i én sætning: **fladen sagde «vi har den» før den havde den.**

Forslaget vender rækkefølgen om: fladen siger først «vi har den» når
erklæringen **er skrevet** og kvitteringen **er sendt**. Alt andet siger det
som det er.

Og skrivningen bruger `/api/subscribe`s greb: **slå kunden op på mail og
opdatér.** Aldrig at læse en fejltekst og gætte.

---

## 5. Den spænding jeg ikke kan løse alene — Sirius, den er til dig

**AC4 siger: artisten skal se alt på én skærm.**
**Dataminimering siger: læg så lidt følsomt i CRM'et som muligt.**

De trækker hver sin vej, og jeg kan ikke afgøre det på egen hånd:

### Model 1 — alt på kundekortet

Helbredssvar og kundens egne ord ligger i Shopify-metafeltet.

- AC4 er triviel. Én skærm, alt er der.
- Særlige kategorier af persondata ligger permanent i et **markedsføringssystem**
  ved siden af nyhedsbrevs-tags. Alle med Shopify-adgang kan læse dem.

### Model 2 — kun flag i CRM'et, detaljen i mailen

Kundekortet bærer `samtykke · 2026-09-14` og modstrids-tags. De frie ord om
krop og helbred lever kun i mailen til kunden og til `booking@inkandart.dk`.

- Markant mindre følsom data i CRM'et, og den udløber med indbakkens egne regler.
- AC4 bliver **to** steder at kigge — præcis det Steven bad om at undgå.

**Jeg foreslår Model 1 med tre betingelser**, og jeg vil gerne modsiges:

1. Metafeltet får en **udløbsregel** — erklæringen slettes N dage efter
   aftalen. N er Stevens tal.
2. Privatlivspolitikken siger det **før** vi gemmer noget: hvad vi gemmer,
   hvor længe, og hvordan man får det slettet.
3. Ingen helbredsdata i **tags** ud over den grove modstrid. Et tag er
   synligt overalt i Shopify, også i eksporter og lister.

**Grunden til at jeg lander på Model 1:** en artist der skal kigge to steder,
kigger ét sted. Så er sikkerheden vundet på papiret og tabt ved stolen. Men
det er et argument om menneskers adfærd, ikke om jura, og det er præcis den
slags argument der bør efterprøves af en anden end den der fandt på det.

---

## 6. Hvad jeg beder Sirius tage stilling til

1. **Model 1 mod Model 2** (§5). Er «én skærm» værd at lægge særlige
   kategorier i et markedsføringssystem, med udløb og en oplyst politik?
2. **Vej A mod Vej B** (§2). Er det rigtigt at holde bygningen tilbage til
   Book.dk-spørgsmålet er besvaret — eller bygge Vej A nu med Vej B forberedt?
3. **Modstrids-listen** (§4.2). Er formen rigtig? Indholdet skal en fagperson
   godkende, men strukturen — tag mod tekst — er en arkitekturbeslutning.
4. **Udløbsreglen.** Bør en erklæring slettes automatisk, eller er det en
   manuel handling? Et automatisk slet der fejler, er værre end intet løfte.

---

## 7. Kendt restrisiko

Skrevet ned, så et review ikke skal grave det frem.

- **Book.dk er uafklaret.** Indtil nogen har set i mailskabelonen, er
  koblingen kundens indtastning. Vej A's svaghed er reel.
- **Ingen notifikation til artisten.** Hun slår op; hun får ikke besked. En
  besked pr. aftale kræver at vi ved hvilken artist aftalen hører til, og det
  får vi ikke fra Book.dk i dag.
- **Ingen rate-limit.** Arvet fra `/api/subscribe`: edge-runtime har ingen
  delt tilstand, så en tæller i hukommelsen ville være teater. Uændret her,
  og bevidst ikke foregivet.
- **Jeg er ikke jurist.** §5 er et arkitekturforslag, ikke en vurdering af om
  behandlingen er lovlig. Det spørgsmål har ikke fået et svar endnu, og det
  skal have et før AC3 og AC5 bygges.
- **Årsagsforklaringen hviler på én antagelse** (§0): at Stevens mailadresse
  fandtes i forvejen. Den er ikke set, kun udledt.

---

*Villy, 1/9 2026. Forslag — ikke en beslutning, og ikke bygget.*
