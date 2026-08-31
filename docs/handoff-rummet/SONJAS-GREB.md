# Sonjas greb — fodre huset fra telefonen

Én side. Få ord.

> **FORAELDET 31/8 2026.** `/admin` svarer 410. Decap er pensioneret
> (Sirius, CMS-RULING-01): en eval-kapabel app og en GitHub-skrivetoken paa
> kundens origin er den forkerte magtgraense. Fladen var i oevrigt allerede
> i stykker i produktion — den loadede og fejlede paa CSP.
>
> Indtil HOUSE-CMS-01 flytter indholdet til Shopify, gaar aendringer gennem
> en PR. Det er langsommere, og det er aerligt. Afsnittet herunder staar som
> historik.

Indholdet bor i git-filer i repoet. Decap `/admin` loader CMS'en (self-hostet script) og peger på GitHub-backend via `https://oauth.bygmedai.dk`. OAuth er peget — Sonjas konto er Harukis job; vi har kun gjort config + `/admin` loader.

## De tre opgaver

**Ny nat (under fem minutter)**  
Åbn `content/nat.yml`. Sæt `aktiv: true`, dato, nr, tidsrum, navne, plakat (`/slots/H-02.jpg` eller et nyt foto i `public/slots/`). Gem. Huset og Natten viser natten.  
`aktiv: false` — siden siger «Ingen nat i aften» af sig selv. Ingen anden side.

**Værk i arkivet**  
`content/vaerker.yml`. Nyt punkt: `id` (slot, fx `V-09`), `artist` (`nizar` / `emma` / `gaest`), `foto`, `maa_vises: true`. Titel tom indtil den er rigtig — skriv aldrig en påhit-titel. `i_dag: true` på præcis ét værk = pladen på Huset.  
`maa_vises: false` — værket er væk fra Væggen og Hylden.  
Filter på Mærket: `/maerket?artist=nizar` (samme id som i YAML).  
Hylden: `edition_ref` er Shopify **product handle** (fx `sort-hjort-hoodie` fra admin-URL), ikke GID. Tom = «Vi laver ikke varer uden værk.»

**I stolen**  
`content/artists.yml`. Nizar og Emma har `stol: true`. Gæsten er rækken med `periode: gaest`. Tomt `fornavn` + `aktiv: true` = «Gæst · navn følger». `aktiv: false` = «Ingen gæst i stolen». Navngiven gæst: `periode_til` → «I huset til …». Sonja og Simone røres ikke her — de sidder ikke i stolen.

## Døren

Blackbook er telefonnummer → Ind. Numrene lander som Shopify-kunde med tag `blackbook`. Ingen anden liste.

## Foto

Slot-id = filnavn. Læg billedet i `public/slots/V-01.jpg` (samme navn). Ingen beskæring i koden. DEMO-mærket slukkes ved `demo: false` når det er husets eget foto. V-slots beholder DEMO indtil husets foto. G/H-atmosfære og S-slots (hænder/arbejde) har ikke DEMO-chip.

## Ikke her

Åbningstider: `content/gaden.yml` — tom = linjen vises ikke. Opdigt aldrig tider. Stolen og Huset «Book tid» går til `/booking`. «Videre til booking» er hoppet til inkart.book.dk. Depositum 100 kr via Shopify. Skriv til booking@ — intet andet.
