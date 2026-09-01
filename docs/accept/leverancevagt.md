# Accept: Vagten der ser om brevet kom frem

Status: **UDKAST v2** — revideret efter Harukis review af PR #283
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

### AC1b — Vagten dækker det døgn den påstår

**Givet** at `GET /emails` uden `limit` giver **20** breve og
`has_more: true` — målt på husets konto
**Når** vagten kører
**Så** ser den på **hele** vinduet, eller også siger den at den ikke gjorde.

**Negativ kontrol:** er det ældste brev på siden **nyere** end vinduets
start, har vagten ikke set hele døgnet. Så er den **rød** — ikke grøn med
«100 breve målt», hvilket ville lyde som dækning.

*Steven efterprøver:* en dag med mange breve. Rapporten skal enten sige
hvor gammelt det ældste var, eller gå rød.

*v1 lovede «inden for et døgn» og leverede «de 20 nyeste, uanset
hvornår». På kontoen som den ser ud i dag dækker 20 breve fire døgn, så
den så rigtig ud — og prøveriggen kunne ikke fange det, fordi den svarer
med det man giver den. Harukis fund.*

### AC3 — Rapporten bærer ingen kundedata

**Givet** at listen fra Resend indeholder modtagerens adresse og emnet —
og at emnet bærer kundens navn
**Når** vagten **skriver sin rapport**
**Så** står der **hverken navn, adresse eller emne** i den. Kun brevets
id, dets tilstand og hvornår det blev sendt.

**Forskellen mellem at se og at skrive.** v1 forbød vagten at *læse*
afsenderen. Det gjorde filteret i AC3b umuligt at bygge — kriteriet
blandede to ting sammen. Vagten **må læse** hvad den skal bruge; den må
bare aldrig **rapportere** det.

Id'et er en henvisning ind i et system der allerede har adgangsstyring.
En CI-log er det ikke.

**Negativ kontrol:** søg efter `@` og efter ordet `Samtykke` i rapporten.
Nul træf.

*Steven efterprøver:* åbn kørslen i Actions. Kan du se hvem brevene var
til? Så er kriteriet faldet.

### AC3b — Vagten går rød på husets post, ikke på andres

**Givet** at Resend-teamet deles med andre kunder
**Når** en anden kundes brev fejler
**Så** siger husets vagt **ingenting**. Den ser kun på breve sendt fra
husets eget domæne.

*Steven efterprøver:* `kontak@bygmedai.dk` står `suppressed` i teamet
lige nu. Husets vagt må ikke gå rød på den.

### AC4 — Nøglen må ikke kunne mere end den skal

**v1 bad om en read-only nøgle. Den findes ikke.** Resends egen
dokumentation har to niveauer og kun to:

> **full_access** — «Can create, delete, get, and update any resource.»
> **sending_access** — «Can only send emails.»
> **domain_id** — «Restrict an API key to send emails **only from** a
> specific domain.»

`domain_id` gælder altså **kun** afsendelse. Haruki oprettede en
`full_access`-nøgle med `domain_id` sat; Resend accepterede den og lod
domænelåsen ligge. Nøglen kunne læse breve fra alle domæner i teamet,
åbne ét brevs fulde `html` og `text`, liste domæner og liste API-nøgler.
Han slettede den igen.

**Givet** at den eneste nøgle der kan læse, er en hovednøgle til hele
teamet
**Når** man overvejer at lægge den i `inkandart.dk`s GitHub-secrets
**Så** gør man det **ikke** — før teamet er skilt ad, så nøglen kun kan
nå husets egen post.

*Steven efterprøver:* opret nøglen i et selvstændigt Ink and Art-team.
Prøv den mod et andet domæne. Den skal afvises.

**Vagten kan merges uden nøglen.** Uden den fejler den åbent og melder
ikke alt vel. Det er hemmeligheden der skal vente, ikke koden.

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

**Hvem læser rapporten?** En fejlet planlagt workflow sender en mail fra
GitHub til den der ejer repoet. **Sonja læser den ikke.** Rapporten er
kun værd noget hvis nogen ser den, og hvem det er, er Stevens kald —
ikke noget koden kan afgøre. Harukis spørgsmål, og det er det rigtige.
