# Accept: Vejen fra booking til stolen

Status: **UDKAST v2** — revideret efter Sirius' review af PR #280
Bygger: Villy. Skrevet før bygning, jf. CLAUDE.md §6 og `docs/PROCES.md`.

Det vi køber: at en kunde kommer ind ad døren med sin erklæring allerede
udfyldt — og at artisten kan se det hun har brug for, **inklusive der hvor
kundens krop siger noget andet end kundens ønske.**

**Kriterierne navngiver med vilje ikke et system.** v1 skrev «Shopify» ind i
AC2, AC4 og AC7. Det var en implementering forklaedt som et krav — Sirius
pegede paa det, og han har ret. Et acceptkriterium skal kunne overleve at vi
skifter mening om hvor tingene bor.

---

## Hvad der er ændret fra v1

| AC | Sirius' indvending | Min vurdering, og hvad jeg gjorde |
|---|---|---|
| AC1 | Behold, men bevis med rigtig mail og unik token | Skærpet: linket skal være **engangs og personligt** |
| AC2 | Dato er ikke binding | **Han har ret.** Skrevet om: identitetsbinding, ikke dato |
| AC3 | Omskriv — ingen helbredsdata i klartekst i mail | **Skrevet om.** Uforanderlig kopi, hentet sikkert |
| AC4 | Behold udfaldet, skift stedet | Systemnavn fjernet; kravet er «én adgangsbegrænset visning» |
| AC5 | «Ren kunde tier» er en farlig nul-tilstand | **Han har ret, og det er min egen fejltype.** Fire tilstande, aldrig tavshed |
| AC6 | Præciser — tidsvindue, tidszone, flytning, flerdags | **Præciseret** |
| AC7 | Behold, udvid | Udvidet med skrivefejl og statussynk |
| AC8 | Privat fane er ikke nok | **Enig.** Uautoriseret medarbejder, token-genbrug, laekage i URL/emne/logs |

**Det skarpeste i hans review, og noget jeg selv gik forbi:** i v1's Vej A kan
**enhver der kender en kundes mailadresse** aflevere helbredsoplysninger på
den kundes profil. Jeg beskrev det som en tastefejlsrisiko. Det er en
identitetsfejl, og den er alvorligere. AC2 er skrevet om på den baggrund.

---

## Acceptkriterier

### AC1 — Kunden skal ikke lede efter erklæringen

**Givet** en kunde der lige har booket en tid
**Når** bekræftelsen lander i hendes indbakke
**Så** står der et link der hører til **hendes** aftale og kun den, og hun
kan udfylde erklæringen derfra uden at skrive en URL.

*Steven efterprøver:* book en tid med din egen mail. Åbn bekræftelsen. Klik.
Du skal ende på erklæringen. Send derefter det samme link til en anden
enhed du ikke har booket fra — det skal **ikke** virke to gange.

### AC2 — Erklæringen kan ikke havne på den forkerte kunde

**Givet** at kunden aldrig skriver et referencenummer
**Når** hun sender erklæringen
**Så** er den bundet til **den konkrete aftale** af systemet — ikke af noget
kunden har tastet.

**Negativ kontrol:** kend en anden kundes mailadresse og forsøg at aflevere
en erklæring på hende. Det skal være **umuligt**, ikke bare svært.
Et ændret, gættet eller udløbet link må aldrig pege på en anden booking.

*Steven efterprøver:* tag linket fra din egen bekræftelse, ret ét tegn i
det, og åbn det. Du skal afvises. Prøv derefter at bruge dit eget link
igen efter du har sendt erklæringen — også afvist.

### AC3 — Kunden har sin egen kopi, og den kan ikke ændres bagefter

**Givet** en kunde der har udfyldt erklæringen
**Når** hun trykker send
**Så** kan hun bagefter få **præcis den version hun sendte** — ordret,
uforanderlig — uden at bede huset om den.

**Og:** hendes helbredsoplysninger står **ikke i klartekst** i en mail eller
i en fælles postkasse. Hentningen er adgangsbegrænset og tidsbegrænset.

*Steven efterprøver:* udfyld med din egen mail. Kan du hente din egen
erklæring? Står der helbredsoplysninger i selve mailen eller i emnefeltet?
Det sidste skal være **nej**.

### AC4 — Artisten ser hele pakken i én adgangsbegrænset visning

**Givet** en artist der står med kunden ved stolen
**Når** hun åbner dagens aftale
**Så** ser hun på **én** skærm: motiv, placering, størrelse, farve eller
sort, helbredssvarene og kundens egne ord. Ingen leden i to systemer.

**Visningen er adgangsbegrænset.** «Én skærm» er et krav til arbejdsgangen,
ikke en tilladelse til at lægge journal i et markedsføringssystem.

*Steven efterprøver:* stå ved disken med telefonen. Kan du på under et
minut svare på «hvor skal den sidde, hvor stor, og er der noget vi skal
tage hensyn til?» uden at åbne mere end ét sted — og uden at nogen uden
adgang kunne have gjort det samme?

### AC5 — Skærmen siger altid hvad den ved. Den tier aldrig

**Givet** en aftale i dag
**Når** artisten åbner den
**Så** står der **altid** én af fire tilstande, tydeligt og med ord:

| | |
|---|---|
| `MANGLER` | der er ingen erklæring |
| `GYLDIG` | erklæringen dækker denne aftale |
| `GENNEMGANG KRÆVES` | kunden har oplyst noget der taler imod ønsket |
| `UDLØBET` | erklæringen dækker ikke denne aftale længere |

Ved `GENNEMGANG KRÆVES` står **hvad** modstriden er, **øverst og med ord** —
ikke som et afkrydsningsfelt under fem andre.

**v1 sagde: «en ren kunde viser ingen advarsel».** Sirius kaldte det en
farlig nul-tilstand. Han har ret, og det stikker: det er praecis den
fejltype jeg selv har jagtet hele dagen — en tom skærm ser ens ud, uanset om
kunden er rask eller om erklæringen mangler. Nul-tilstanden er fjernet.

*Steven efterprøver:* åbn tre aftaler — én uden erklæring, én med en ren, og
én med «blodfortyndende» og et stort motiv. De skal se **forskellige** ud, og
du skal kunne se forskel uden at læse småt.

### AC6 — Gyldighed hænger på aftalens tidsvindue, ikke på en dato

**Givet** en aftale med et konkret tidsvindue i **Europe/Copenhagen**
**Når** artisten åbner den
**Så** gælder erklæringen kun for **det** vindue.

- Flyttes aftalen, følger gyldigheden med — eller falder til `UDLØBET`.
- Strækker sessionen sig over flere dage, dækker erklæringen hele forløbet.
- En erklæring fra en tidligere aftale står som **tidligere**, aldrig som
  dagens.

**Og gyldighed er ikke det samme som sletning.** Efter aftalen skal
erklæringen afvises ved opslag, **også hvis et sletningsjob har fejlet.**
En fejlet oprydning må aldrig forlænge en gyldighed.

*Steven efterprøver:* flyt en aftale til næste uge og åbn den i dag. Den
skal ikke stå som dagens. Åbn en aftale fra i går — `UDLØBET`.

### AC7 — Den siger aldrig «vi har den» uden at have den

**Givet** en kunde der udfylder erklæringen
**Når** hun trykker send
**Så** får hun kun en kvittering hvis erklæringen **kan findes og åbnes af
den rigtige rolle** bagefter.

Tre veje skal prøves, og alle tre skal opføre sig ens:

1. en kunde der **allerede findes** — som Stevens profil gjorde 1/9
2. skrivningen til erklærings-arkivet **fejler**
3. statussynkroniseringen til det system der viser driftsstatus **fejler**

I alle tre tilfælde: enten står erklæringen der bagefter, **eller også siger
fladen det.** Aldrig «TAK» uden dækning.

*Steven efterprøver:* udfyld med `steven.wensley@gmail.com` — adressen der
fejlede 1/9. Find erklæringen bagefter. Det er den præcise fejl vi målte, og
den skal være død.

### AC8 — Helbredsoplysninger lækker ingen steder

**Givet** at erklæringen indeholder oplysninger om en kundes krop og helbred
**Når** nogen uden ret adgang forsøger at nå dem
**Så** findes der ingen vej.

**Fem negative kontroller. Alle skal fejle:**

| forsøg | skal |
|---|---|
| privat browserfane, ikke logget ind | afvises |
| **en medarbejder uden den rolle** der må se erklæringer | afvises |
| et **ændret** engangslink | afvises |
| et **udløbet** eller **allerede brugt** link | afvises |
| helbredsord i URL, mailemne, analytics, fejllog eller søgbare mærkater | **findes ikke** |

Den sidste er ikke et klik — den kræver at nogen søger efter ordene der
hvor de ikke må stå.

*Steven efterprøver:* bed om at få vist en søgning på «blodfortyndende» i
kundelister, eksporter og logs. Nul træf, eller kriteriet er faldet.

---

## Uden for købet — kendt restrisiko

**Der er ingen juridisk afgørelse endnu.** Behandlingsgrundlag,
artikel 9-undtagelse, adgangskreds, databehandlerforhold og
opbevaringsfrist mangler alle et svar. Sirius' pointe staar: en afkrydsning
kaldes ikke automatisk et gyldigt samtykke — og det er en jurist, ikke
han eller jeg, der afgoer det. **Intet af AC3,
AC4, AC5 eller AC8 kan bygges før det svar findes.** Jeg er ikke jurist,
og dette punkt er ikke mit at lukke.

**Hvor erklæringen skal bo, er ikke afgjort.** Se
`docs/dispatches/SAMTYKKE-FLOW-FORSLAG.md` §8: huset betaler allerede for
et system med journal og digital underskrift. Om det kan bære opgaven, er
ikke målt — og det skal måles før nogen bygger et nyt sted at lægge
helbredsdata.

**Book.dks tekniske evner er stadig uafklarede.** Kan systemet udstede en
engangs-token pr. booking, og kan det melde ved oprettelse, flytning og
aflysning? Uden det svar kan AC1, AC2 og AC6 ikke bygges som skrevet.

**Ingen notifikation til artisten.** Hun åbner dagens aftale; hun får ikke
besked. En besked pr. aftale kræver at vi ved hvilken artist aftalen hører
til.

**Ingen rate-limit.** Arvet fra `/api/subscribe`: edge-runtime har ingen
delt tilstand, så en tæller i hukommelsen ville være teater. Bevidst ikke
foregivet.

**Modstrids-listen er ikke medicinsk rådgivning.** Den må flagge til
menneskelig vurdering — **aldrig afgøre om en kunde må tatoveres.** Den
skal godkendes af nogen der sætter tusch i mennesker til daglig.

**Depositum-leddet røres ikke.**

---

*v1 skrevet 1/9 (S578). v2 samme dag efter Sirius' review af PR #280.
Kriterierne skal sniffes af Steven før første commit.*
