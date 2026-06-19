# Brief til Haruki — book.dk-opsætning (booking på inkandart.dk)

**Fra:** Vilde · **Til:** Haruki · **På vegne af:** Steven
**Mål:** Få booking live på inkandart.dk via **book.dk**. Simones login er modtaget. Selve opsætningen *inde i book.dk* er din; site-koden er bygget færdig og venter kun på data herfra.

---

## TL;DR
Site-siden er **100% bygget og data-drevet**. Alle "Book tid"-flader (generel CTA, per-artist, match-wizard) bruger to datafiler + et `booksysId` pr. artist. Når du har sat book.dk op og melder **4 datapunkter** tilbage (base-URL, deep-link-format, artist-id-mapping, evt. availability-API), opdaterer vi de filer → PR → live. Ingen ny kode nødvendig.

> **Note om "via MCP":** der er pt. **ingen book.dk-MCP** i vores connector-sæt. Opsætningen sker i **book.dk's eget admin-UI** med Simones login (evt. via browser/computer-use). Det er stadig din opgave — bare så forventningen er rigtig.

---

## Hvad der allerede er bygget (site-siden — klar)
- **Generelle CTA'er** (hero, kontakt) → `site.bookingUrl`, åbner i nyt faneblad.
- **Per-artist "Book hos [navn]"** på hver artist-side → `booking.deepLinkPattern` med artistens `booksysId` (`src/_includes/layouts/artist.njk`).
- **Match-wizard** ("Find din tatovering") → samme deep-link-mønster, nu single-source via `data-booking-pattern` (kilde: `booking.json`) i `artist-match.js`.
- **Privatlivspolitik** (DA+EN) nævner allerede ekstern booking i nyt faneblad.
- Alt er **data-drevet** — go-live = ændring i data, ikke i templates/logik.

## Hvad du skal sætte op i book.dk (med Simones login)
1. **Bekræft kontoen + subdomænet.** ⚠️ Afklar: er det `inkart.book.dk` eller `inkandart.book.dk`? (Vi gætter pt. `inkart.book.dk`.)
2. **Opret de 6 medarbejdere/kalendere** og notér book.dk's **rigtige** id'er (vores er placeholder-gæt):

   | Artist | slug | nuv. placeholder-id | book.dk-id (udfyld) |
   |---|---|---|---|
   | Simone Chimera (direktør) | simone | 1 | |
   | Nizar Saad (ejer) | nizar | 2 | |
   | Maja Holm | maja | 3 | |
   | Jonas Bek | jonas | 4 | |
   | Liv Sørensen | liv | 5 | |
   | Emil (piercer) | emil | 6 | |

3. **Services/behandlinger:** tatovering, piercing, walk-in, touch-up, custom, flash — med varighed + pris hvor relevant.
4. **Åbningstider** (kopiér fra `site.json.hours`): man–søn 13:00–23:00, ons til 23:30, **tor til 02:00, fre/lør til 05:00** (nightshift), lør fra 14:00.
5. **Per-artist deep-link:** bekræft book.dk's faktiske URL-format for at lande på en specifik artists kalender (vores gæt: `?artist={id}`).
6. **(Valgfrit) Availability/status-API** til live "åben nu / book"-status — endpoint + auth, hvis book.dk tilbyder det.

## Data-kontrakten — meld disse tilbage, så går vi live
1. **Endelig base-URL** → `src/_data/site.json` (`bookingUrl`) + `src/_data/booking.json` (`baseUrl`).
2. **Endeligt deep-link-pattern** → `src/_data/booking.json` (`deepLinkPattern`, fx `https://…/?artist={booksysId}`). Propagerer automatisk til artist-sider **og** wizard.
3. **Artist-id-mapping** (tabellen ovenfor) → `booksysId` i `src/_artists/*.md` (6 filer) + `src/_assets/js/artist-match.js` (5 tattoo-artister; Emil er ikke i wizard).
4. **(Valgfrit) Availability-endpoint + auth** → `src/_data/booking.json` (`statusEndpoint`, auth) hvis live-status skal tændes; ellers forbliver `fallbackStrategy: "scheduled"`.

### Ét spørgsmål der kan spare os arbejde
**Understøtter book.dk slug-baserede deep-links** (fx `?artist=simone` i stedet for `?artist=1`)? Hvis ja, slipper vi helt for at synkronisere numeriske id'er — så er artist-`slug` nok, og go-live bliver endnu enklere.

## Filer der ændres ved go-live (alle data, ingen logik)
- `src/_data/site.json` — `bookingUrl`
- `src/_data/booking.json` — `baseUrl`, `deepLinkPattern`, `provider` (fra `booksys-mock`), evt. `statusEndpoint`
- `src/_artists/*.md` — `booksysId` (6 filer)
- `src/_assets/js/artist-match.js` — `booksysId` (5 artister) — *bortfalder hvis slug-deep-links*

## Ansvarsdeling
- **Vilde:** al site-kode — **gjort**, data-drevet, klar.
- **Haruki:** opsætning i book.dk + melde data-kontrakten (4 punkter) tilbage.
- **Derefter:** data opdateres → PR → Stevens merge → live.

## Åbne spørgsmål (findes også i `booking.json._pendingFromSimone`)
- `inkart.book.dk` vs `inkandart.book.dk`?
- API-doc / eksempel-response for `/availability`?
- Auth-mønster (Bearer / OAuth / signed query)?
- Per-artist deep-link-format?
- Slug- vs id-baserede deep-links?
