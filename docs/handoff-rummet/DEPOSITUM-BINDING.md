# Depositum ↔ booking: hvordan de to systemer peger på hinanden

**Skrevet:** 30/8 2026 · **Baggrund:** Sirius' QA, P0-1 · **Ejer af processen:** [AFVENTER STEVEN — Sonja eller Simone]

## Problemet, kort

Kunden betaler depositum i **Shopify** og booker sin tid i **Book.dk**.
De to systemer kender ikke hinanden. Før i dag kunne huset derfor ikke
svare på «har hun betalt?», og `/booking/tak?betalt=1` viste «Depositum
er betalt» alene ud fra adresselinjen — enhver kunne skrive den selv.

## Hvorfor der ikke er bygget en integration

Målt 30/8 i Book.dk's eget adminpanel (`app.book.dk`):

- Der er **ingen API** i produktet.
- Under **Apps → Integrationer** står **Webhooks** som *«Kommer snart —
  under udvikling»*.
- Der er heller ingen betalingsmodul; `settings/payments.php` er
  abonnementsbetaling til Book.dk selv, ikke kundebetaling.

Der er altså intet at integrere imod. Ingen kode kan få de to systemer
til at tale sammen, før Book.dk selv åbner den dør.

## Løsningen: den reference begge systemer allerede kan bære

**Shopify-ordrenummeret.** Kunden får det på kvitteringen; Book.dk har et
kommentarfelt på bookingen. Kunden skriver nummeret med — og så peger de
to poster på hinanden uden ny infrastruktur, uden en database der skal
passes, og uden noget der kan komme ud af sync.

### Kundens vej

1. **Betal depositum** → Shopify sender kvittering med ordrenummer (fx #1042).
2. **Book tid i Book.dk** → skriv `#1042` i kommentarfeltet.
3. **I tvivl?** På `/booking/tak` kan hun skrive nummeret og få svaret fra
   Shopify: betalt, ikke betalt endnu, eller ukendt.

Trin 3 virker uden JavaScript — det er den flade Sonja står med ved
disken, hvis en kunde spørger.

### Hvad systemet nu KAN bevise

`lib/depositum.ts` spørger Shopify Admin og svarer kun «betalt» når
**alle tre** er sande: ordren findes, den er `PAID`, og den indeholder
mindst én depositum-variant. En betalt ordre på et print tæller altså
ikke som en holdt tid.

Det fejler lukket: en timeout, en manglende credential eller et uventet
svar giver «vi kan ikke slå op lige nu» — aldrig «betalt».

### Hvad det IKKE kan — sagt højt

Vi kan **ikke læse Book.dk-kalenderen**. Derfor kan koden ikke finde
«betalt, men ikke booket». Det er en menneskeopgave:

## Afstemning — den ugentlige rutine

**Hvem:** [AFVENTER STEVEN]. **Hvornår:** en fast dag om ugen, og altid
inden en nat eller et drop.

1. Åbn Shopify → **Ordrer**, filtrér på depositum-varerne.
2. Åbn Book.dk-kalenderen for samme periode.
3. For hver depositum-ordre: findes ordrenummeret i en bookings
   kommentarfelt?
   - **Ja** → intet at gøre.
   - **Nej** → ring til kunden. Hun har betalt for en tid hun ikke har
     booket. Det er den fejl der koster os en kunde, ikke penge.
4. For hver booking med et nummer der ikke findes i Shopify: skriv til
   kunden og få det rigtige nummer. (Typisk en tastefejl.)

Fandt du en fejl der gentager sig, så skriv den ned her i filen — ikke
i en besked.

## Det Book.dk skal have sat op

Én ting mangler i admin, og den skal sættes af et menneske:

- **Kommentarfeltet** skal være synligt i online booking
  (`Indstillinger → Online booking → Hvilke felter skal udfyldes`), med
  en hjælpetekst der beder om ordrenummeret. Alternativt et dedikeret
  felt via **«Tilføj nyt felt»** — det er renere, fordi nummeret så står
  i sin egen kolonne.

Og én ting mere, som ikke handler om bindingen men blev fundet samme
dag: Book.dk's egne bookingbetingelser siger **24 timers afbestilling**,
mens husets godkendte betingelser på sitet siger **48 timer**. To
forskellige løfter til den samme kunde. Det skal rettes i
`Indstillinger → Online booking → Betingelser for booking`.

## Når Book.dk åbner webhooks

Så kan trin 3 automatiseres: en booking-webhook + Shopifys
`orders/paid`-webhook matcher på nummeret, og afstemningen bliver en
liste i stedet for en rutine. Referencen er den samme — kun arbejdet
flytter fra et menneske til en maskine. Byg ikke en database før den dag;
den ville kun være et tredje sted sandheden kan gå i stykker.
