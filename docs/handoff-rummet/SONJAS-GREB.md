# Sonjas greb — fodre huset fra telefonen

Én side. Få ord.

M1: indholdet bor i tre filer i repoet. Decap `/admin` er sat op mod dem, men OAuth er ikke koblet endnu — indtil da redigeres filerne (eller en PR). Når worker'en peger her, er det samme felter i browseren.

## De tre opgaver

**Ny nat (under fem minutter)**  
Åbn `content/nat.yml`. Sæt `aktiv: true`, dato, nr, tidsrum, navne, plakat (`/slots/H-02.jpg` eller et nyt foto i `public/slots/`). Gem. Huset og Natten viser natten.  
`aktiv: false` — siden siger «Ingen nat i aften» af sig selv. Ingen anden side.

**Værk i arkivet**  
`content/vaerker.yml`. Nyt punkt: `id` (slot, fx `V-09`), `artist` (`nizar` / `emma` / `gaest`), `foto`, `maa_vises: true`. Titel tom indtil den er rigtig — skriv aldrig en påhit-titel. `i_dag: true` på præcis ét værk = pladen på Huset.  
Hylden: først når `edition_ref` er sat. Ellers: «Vi laver ikke varer uden værk.»

**I huset**  
`content/artists.yml`. Nizar og Emma har `stol: true`. Gæsten er rækken med `periode: gaest`. Tomt `fornavn` + `aktiv: true` = «Gæst · navn følger». `aktiv: false` = «Ingen gæst i stolen». Sonja og Simone røres ikke her — de sidder ikke i stolen.

## Døren

Blackbook er telefonnummer → Ind. Numrene lander som Shopify-kunde med tag `blackbook`. Ingen anden liste.

## Foto

Slot-id = filnavn. Læg billedet i `public/slots/V-01.jpg` (samme navn). Ingen beskæring i koden. DEMO-mærket slukkes ved `demo: false` når det er husets eget foto.

## Ikke her

Priser, åbningstider, depositum, CVR: `[TAL BEKRÆFTES]` indtil Steven/Nizar. Booking: knappen går til inkart.book.dk. Skriv til booking@ — intet andet.
