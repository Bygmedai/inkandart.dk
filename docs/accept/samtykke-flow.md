# Accept: Vejen fra booking til stolen

Status: **UDKAST** — afventer Stevens sniffer
Bygger: Villy. Skrevet før bygning, jf. CLAUDE.md §6 og `docs/PROCES.md`.

Det vi køber: at en kunde kommer ind ad døren med sin erklæring allerede
udfyldt — og at artisten kan se det hun har brug for, **inklusive der hvor
kundens krop siger noget andet end kundens ønske.**

---

## Hvorfor nu

Målt i produktion 1/9, efter at Steven selv udfyldte erklæringen:

| | |
|---|---|
| Erklæringen på Stevens Shopify-profil | **ingen.** Ingen tag, ingen note, intet metafelt |
| Kundekort berørt i butikken den dag | **0** — nyeste er 31/8 23:32, Harukis røgtest |
| Mail til kunden | ingen — der findes ingen mail-kode i ruten |
| Mail til artisten | ingen — samme |
| Krydsreferencer mellem `/booking` og `/samtykke` | **0 i begge retninger** |

Fladen sagde «Vi har den. Du behøver ikke gøre mere». Den havde den ikke.

Årsagen er kendt: ruten opretter en kunde, og fejler det med «email
already taken», svarer den alligevel `ok` uden at skrive noget. Harukis
røgtest brugte en frisk mailadresse og ramte derfor aldrig den vej de
fleste rigtige kunder går.

**Steven, 1/9:** *«Drop at fixe løgnen, da vi ingen kunder har pt. Vi
bygger det rette flow.»* Så lappen springes over med vilje — men den
fejl står som negativ kontrol i AC7, så den ikke kan overleve bygningen.

---

## Tre ting der binder hænderne — de skal med, ellers lover vi noget vi ikke kan

**1. Book.dk er ikke vores.** Bookingen sker på et fremmed system, og
`app/(rummet)/booking/page.tsx:25` siger det selv: *«Book.dk kan ikke
deep-linke.»* Vi kan ikke sende kunden fra en bekræftelse til en
forudfyldt erklæring, og vi kan ikke aflæse aftalens tid maskinelt uden
en afklaring vi ikke har.

**2. Kunden skriver aldrig et referencenummer.** Det er husets eget kald
(`content/booking.yml`): *«mailadressen står allerede i både Book.dk og
Shopify, og det er den vi afstemmer på.»* Så koblingen er **mailadresse +
dato**, ikke et nummer.

**3. `inkandart.dk` har ingen login.** Der er ingen brugerkonti og ingen
adgangsstyring på sitet. En side der viser en kundes helbredsoplysninger
kan derfor ikke ligge her. Pakken må bo i et system der allerede har
konti — i praksis Shopify admin, hvor Sonja er hver dag.

---

## Sådan bør flowet være

```
1  Kunden booker på Book.dk                        (gratis, som i dag)
2  Bekræftelsen bærer et link til /samtykke        ← indstilling, ikke kode
3  Kunden udfylder hjemmefra
      · mailadressen hun bookede med
      · aftalens dato
      · motiv, placering, størrelse, farve/sort
      · helbred i egne ord + afkrydsning
4  Kvittering til KUNDEN med hele erklæringen      ← hun ejer sin underskrift
5  Erklæringen lander på kundekortet i Shopify     ← Sonja og artisten
      · modstrid mellem helbred og ønske som TAG   ← ses uden at åbne noget
6  Ved stolen: artisten slår kunden op på mail
      · én skærm: ønske, krop, modstrid, egne ord
```

**Leddet der ikke er kode, er led 2.** Linket i Book.dks bekræftelsesmail
er en indstilling Sonja eller Steven sætter. Kan Book.dk ikke det, falder
flowet tilbage til at huset sender linket — og så skal vi vide hvem der
gør det, og hvornår.

---

## Acceptkriterier

### AC1 — Kunden skal ikke lede efter erklæringen

**Givet** en kunde der lige har booket en tid
**Når** bekræftelsen lander i hendes indbakke
**Så** står der et link til erklæringen, og hun kan udfylde den derfra
uden at åbne sitet og finde den selv.

*Steven efterprøver:* book en tid med din egen mail. Åbn bekræftelsen.
Klik. Du skal ende på erklæringen uden at have skrevet en URL.

### AC2 — Erklæringen ved hvilken aftale den hører til

**Givet** at kunden aldrig skriver et referencenummer
**Når** hun sender erklæringen
**Så** står aftalens dato på den, og på kundekortet i Shopify kan du se
hvilken dag den gælder — ikke bare hvornår den blev udfyldt.

*Steven efterprøver:* udfyld med en dato to uger frem. Åbn kundekortet.
Begge datoer skal stå der, og de skal være forskellige.

### AC3 — Kunden har sin egen kopi

**Givet** en kunde der har udfyldt erklæringen
**Når** hun trykker send
**Så** får hun en mail med **hele erklæringen, hendes egne svar ordret** —
og huset har den samme. Hun skal kunne fremvise sin underskrift uden at
bede om den.

*Steven efterprøver:* udfyld med din egen mail. Mailen skal ligge i
`booking@inkandart.dk`-indbakken **og** hos dig, med samme indhold.

### AC4 — Artisten ser hele pakken ét sted

**Givet** en artist der står med kunden ved stolen
**Når** hun slår kunden op på mailadressen
**Så** ser hun på **én** skærm: motiv, placering, størrelse, farve eller
sort, helbredssvarene og kundens egne ord. Ingen leden i to systemer.

*Steven efterprøver:* stå ved disken med telefonen. Kan du på under et
minut svare på «hvor skal den sidde, hvor stor, og er der noget vi skal
tage hensyn til?» uden at åbne mere end ét sted?

### AC5 — Modstrid råbes op. Den skal ikke opdages

**Givet** en kunde der har oplyst noget om sin krop som taler imod det hun
ønsker — blodfortyndende medicin og en stor flade, en hudlidelse netop
dér hvor motivet skal sidde, en allergi og et farvet motiv, graviditet
**Når** artisten åbner pakken
**Så** står modstriden **øverst og med ord** — ikke som et afkrydsningsfelt
man kan overse under fem andre.

**Negativ kontrol:** en kunde uden helbredssvar viser **ingen** advarsel.
Ellers betyder en advarsel ingenting.

*Steven efterprøver:* udfyld to erklæringer — én med «blodfortyndende» og
et stort motiv, én helt ren. Den første skal råbe. Den anden skal tie.

### AC6 — En erklæring gælder en dag, ikke for evigt

**Givet** en vilkårlig dag **D**, og en kunde med en aftale på dag D
**Når** artisten åbner pakken på dag D
**Så** viser den erklæringen der hører til **dag D**. En erklæring fra en
tidligere aftale står som **tidligere**, ikke som dagens. Og en erklæring
der er ældre end aftalen den påstås at dække, står som **forældet**.

*Steven efterprøver:* udfyld to erklæringer for samme mail med to
forskellige datoer. Ved stolen skal det fremgå hvilken der er dagens —
uden at du skal regne det ud.

### AC7 — Negativ kontrol: den kendte kunde

**Givet** en kunde der **allerede findes** i Shopify — som din egen profil
gjorde 1/9
**Når** hun udfylder erklæringen
**Så** står erklæringen på hendes kort bagefter.

**Og hvis skrivningen fejler, siger fladen det.** Den siger aldrig «Vi har
den» uden at have den.

*Steven efterprøver:* udfyld med `steven.wensley@gmail.com` — adressen der
fejlede i dag. Åbn profilen i Shopify. Erklæringen skal stå der. Det er
den præcise fejl vi fandt, og den skal være død.

### AC8 — Helbredsoplysninger ligger ikke på en åben adresse

**Givet** at erklæringen indeholder oplysninger om en kundes krop og helbred
**Når** nogen uden adgang forsøger at se den
**Så** findes der **ingen offentlig URL** der viser den. Pakken kan kun
åbnes inde i et system med login.

**Negativ kontrol:** åbn pakken i et vindue hvor du ikke er logget ind i
Shopify. Du skal **ikke** kunne se den.

*Steven efterprøver:* prøv at nå en kundes erklæring fra en privat
browserfane. Lykkes det, er kriteriet faldet.

---

## Uden for købet — kendt restrisiko

Så accepten er informeret og ikke blind.

**Book.dk er ikke afklaret.** Om bekræftelsesmailen kan bære vores link, og
om Book.dk kan give os aftalens dato maskinelt, ved vi ikke. Indtil nogen
har set efter, er koblingen **kundens egen indtastning** — hun skriver
mail og dato. Det er svagere end en maskinel binding, og en kunde kan taste
forkert. AC2 gør fejlen synlig; den forhindrer den ikke.

**Ingen notifikation til artisten.** Hun **slår op**; hun får ikke besked.
En besked pr. aftale kræver at vi ved hvilken artist aftalen hører til, og
det får vi ikke fra Book.dk i dag.

**Helbredsoplysninger er følsomme persondata.** Hvor længe de må ligge,
hvem der må se dem, hvad der skal stå i privatlivspolitikken, og hvordan
en kunde får sin slettet — er **Stevens beslutning**, ikke min. Jeg bygger
ikke opbevaringen før den beslutning er taget, og jeg er ikke jurist.
Dette punkt skal have et svar før AC3 og AC5 bygges.

**Modstrids-listen er ikke medicinsk rådgivning.** Den er en liste huset
skriver, den skal godkendes af nogen der sætter tusch i mennesker til
daglig, og den erstatter aldrig artistens egen dømmekraft. Den råber; den
beslutter ikke.

**Ingen rate-limit.** Arvet fra `/api/subscribe`: edge-runtime har ingen
delt tilstand, så en tæller i hukommelsen ville være teater. Uændret her,
og bevidst ikke foregivet.

**Depositum-leddet røres ikke.** De 100 kr for lange sessioner ligger hvor
de ligger. Dette flow handler om erklæringen, ikke om betalingen.

---

*Skrevet 1/9 (S578) efter Stevens ord: «Jeg vil have at du bygger det
fulde flow.» Kriterierne skal sniffes før første commit.*
