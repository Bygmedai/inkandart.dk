# Accept: Vagten der ser om brevet kom frem

Status: **UDKAST** — afventer Stevens sniffer
Bygger: Villy. Skrevet før bygning, jf. CLAUDE.md §6.

Det vi køber: at et brev der **ikke** kom frem, bliver opdaget af huset —
i stedet for af en kunde der står ved disken uden en erklæring.

---

## Hvorfor

`/api/samtykke` er fail-closed mod mailudbyderen: fejler kaldet, siger
fladen det. Men **et 2xx fra Resend betyder «accepteret til afsendelse»,
ikke «landet i indbakken».** Sirius pegede på grænsen; Haruki fandt den i
naturen samme dag:

> Et brev fra en anden af husets ruter til `kontak@bygmedai.dk` — en
> stavefejl, der mangler et t. Resend svarede 2xx. Status er
> `suppressed`. Ingen fik det at vide, og det har kørt sådan i ukendt tid.

Tre huller, ét kald: en afvisning hos modtageren, en kundes tastefejl, en
fuld postkasse. Resend fører `last_event` pr. brev.

**Det her er ikke et hvælv.** Det er ét læsekald én gang i døgnet.

---

## Acceptkriterier

### AC1 — Et brev der ikke kom frem, bliver fanget inden for et døgn

**Givet** et brev huset har sendt, som er endt `bounced`, `suppressed`,
`complained` eller `failed`
**Når** vagten kører
**Så** går den rød og siger hvor mange, og hvilken tilstand de står i.

*Steven efterprøver:* send en erklæring til en adresse med en tastefejl.
Kør vagten dagen efter. Den skal være rød.

### AC2 — En grøn vagt betyder at der er målt noget

**Givet** at vagten svarer grønt
**Når** man ser på hvad den målte
**Så** står der **hvor mange breve** den så på.

**Negativ kontrol:** kan vagten ikke nå Resend, eller får den nul breve
tilbage, er den **rød** — ikke grøn. En vagt der intet måler, må aldrig
ligne en vagt der intet fandt.

*Steven efterprøver:* fjern læsenøglen og kør den. Den skal fejle, ikke
melde alt vel.

### AC3 — Rapporten bærer ingen kundedata

**Givet** at listen fra Resend indeholder modtagerens adresse og emnet —
og at emnet bærer kundens navn
**Når** vagten skriver sin rapport
**Så** står der **hverken navn, adresse eller emne** i den. Kun brevets
id, dets tilstand og hvornår det blev sendt.

Id'et er en henvisning ind i et system der allerede har adgangsstyring.
En CI-log er det ikke.

**Negativ kontrol:** søg efter `@` og efter ordet `Samtykke` i rapporten.
Nul træf.

*Steven efterprøver:* åbn kørslen i Actions. Kan du se hvem brevene var
til? Så er kriteriet faldet.

### AC4 — Sendenøglen kan ikke læse

**Givet** at nøglen `/api/samtykke` sender med, er sending-only og låst
til ét domæne
**Når** man forsøger at bruge den til at liste breve
**Så** afvises den.

Vagten bruger sin **egen** læsenøgle. De to må aldrig blive den samme.

*Steven efterprøver:* prøv sendenøglen mod `GET /emails`. Den skal give
401 eller 403.

---

## Uden for købet

**Vagten ser kun bagud.** Den fanger et brev der allerede er gået galt —
den forhindrer det ikke. Kunden har set «TAK» i mellemtiden.

**Den kræver en ny nøgle.** En læsenøgle i Vercel eller i GitHub-secrets.
Den skal være **read-only**, og den skal ikke kunne sende.

**Et døgns forsinkelse er et valg.** Hyppigere ville koste kald uden at
ændre hvad nogen kan nå at gøre — Sonja læser ikke en rapport klokken tre
om natten.

**Ingen automatisk oprydning.** Vagten råber; den sletter og gensender
ingenting.
