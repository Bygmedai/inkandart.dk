# Brief — Villy / Claude Code: kundens sprog

Du bygger: **synlig copy og nav på Rummet + Emerge `/shop`**, så en førstegangskunde (DA og EN) forstår døren med det samme.

Opgaven er sprog. Ikke nyt layout, ikke nye rum, ikke Shopify-admin.

Steven 3. sep 2026: væk fra internt hus-sprog. Hen mod genkendeligt tattoo-sprog. Samme dør på dansk og engelsk.

Målt på live `inkandart.dk` og `origin/main@13b707b`. Andre københavnske shops (Iron & Ink, Fabel, Black Atlas, Tattoo Ole) siger studie / artister·kunstnere / book / walk-in / flash / shop·webshop. Ingen af dem siger Stolen, Hylden, Natten, Mærket, Væggen, Gaden eller Blackbook som nav.

---

## Ordbog — låst. Brug disse ord. Find ikke på nye.

| Intern (kode, URL, CSS — bliver) | DA, synlig | EN, synlig | Hvorfor |
|---|---|---|---|
| Stolen | Artister | Artists | Stolen er møblet. Kunden leder efter hvem der tegner. |
| Mærket | Shop | Shop | Ét ord, begge sprog. Webshop/butik er det alle andre bruger. |
| Hylden (sektion) | Prints | Prints | Hylden er lager-sprog. Sektionen sælger prints og objekter. |
| Væggen (sektion) | Arbejde | Work | Standard på tattoo-sites. Væggen er intern. |
| Natten | Aftener | Nights | Natten er et koncept. Kunden leder efter en dato. |
| Gaden | Find os | Find us | Gaden er poesi. Siden er adresse, tlf, walk-in. |
| Blackbook | Skriv dig op | Join the list | Blackbook er kunstnerens bog. CTA'en er allerede verbet. |
| Huset (kundens rum-label) | Studiet | Studio | Huset er internt. Alle shops siger studie/studio. |
| Nattespot | Walk-in om natten | Late walk-in | Nattespot er opfundet. Kunden skal høre walk-in. |
| «Gaden sælger.» / «The street sells.» | Shop | Shop | Emerge-rester. Kunden skal ikke møde en anden butik. |
| «The house» | Studio | Studio | Samme som Huset. |
| «Rum» / «Rooms» (aria på nav) | Menu | Menu | Aria, ikke poesi. |

**Behold (lånord, kunden kan dem allerede):**
walk-in, book / Book tid, flash, depositum / deposit, gæst / guest, piercing, Gavekort / Gift cards, Pisserenden (stednavn — oversæt ikke).

**Knap-tekst i døren** (`blackbookGo`) er allerede rigtig: «Skriv mig op» / «Sign me up». Rør den ikke. Det er *navnet* over feltet og i nav'en der skal skiftes.

---

## Hvad du IKKE rører

- URL-slugs: `/stolen`, `/maerket`, `/natten`, `/gaden`, `/blackbook`, `/shop`. Ingen 301 i denne leverance, medmindre du tager `/shop` som nedenfor. Historiske stier må gerne hedde Stolen i filsystemet.
- CSS-klasser (`rum-stolen`, `rum-maerket`, `rum-door__name`, `.kerb`, …). Filnavne. Komponentnavne (`MaerketFlade`, `StolenPage`).
- Shopify-collection-handle `hylden`. `content/hylden.yml` handles. `lib/storefront.ts`.
- `.porten/`, `.github/`, workflows, kanon-filer, tokens, `rummet.css` layout.
- `ArtistKort.tsx` / `VareKort.tsx` **layout**. Kun den synlige streng «på Væggen» i ArtistKort.
- Teamguide og afstemning bag koden: personalet må stadig sige Huset. Kundens flade må ikke.
- Priser, åbningstider, DJ-navne, events. Opdigt intet. Walk-in-**pris** (900, «Two small… 900») må **ikke** stå online — K7. Hvis du møder den i EN `/shop` eller `lib/i18n.ts` `walkin`/`shop.doors.walkin`, så fjern beløbet. Tjenesten walk-in må nævnes.
- Billedtekst under fotos. DEMO-chips. Du genskaber dem ikke.
- App-repoet `inkandart-webshop`. Det er et andet brief.

---

## Hvad du GØR

Synlig tekst, `aria-label`, `<title>` / OG, og tests der låser de gamle egennavne.

Kanon-kommentarerne der siger «rumnavnene oversættes ALDRIG» / «the name itself stays» er fejlen. Slet eller omskriv dem, så næste agent ikke bygger dem tilbage.

### 1. Nav og dock — kundens fire døre

`components/rummet/Nav.tsx`

I dag er `ROOMS` hardkodet DA på begge sprog:

```
Stolen · Mærket · Natten · Gaden
```

og Blackbook er hardkodet i `aria-label` + `.rum-nav__book-word`.

Flyt labels ind i `lib/i18n.ts`. Samme hrefs.

| href | DA | EN |
|---|---|---|
| `/stolen` | Artister | Artists |
| `/maerket` | Shop | Shop |
| `/natten` | Aftener | Nights |
| `/gaden` | Find os | Find us |

Blackbook-ordet i nav + dock + `aria-label`: **Skriv dig op** / **Join the list**. Label in Name (WCAG 2.5.3) skal stadig holde — synligt ord og aria-label er det samme.

Kommentar i Nav om «rumnavnene er husets egennavne og oversættes ikke» skal væk.

### 2. i18n — ét sted for sætningerne

`lib/i18n.ts`

Skift:

| nøgle | nu | skal være |
|---|---|---|
| `rummet.roomsLabel` | Rum / Rooms | Menu / Menu |
| `rummet.backToStolen` | Stolen / Stolen | Artister / Artists |
| `rummet.seeOnWall` | Se dem på Væggen i Mærket / See them on the Wall in Mærket | Se dem under Arbejde i shoppen / See them under Work in the shop |
| `rummet.shelfLabel` | Hylden / Hylden | Prints / Prints |
| `rummet.shelfEmpty` | (tjek DA) / There is nothing on the shelf right now. | Ingen prints lige nu. / No prints right now. |
| `rummet.wallLabel` | Væggen / Væggen | Arbejde / Work |
| `rummet.meetIn` | Mød X i Stolen / Meet X in Stolen | Mød X hos artisterne / Meet X with the artists |
| `rummet.noEventLine` | …Skriv dig op i Blackbook. / …Sign up to Blackbook. | …Skriv dig op. / …Join the list. |
| `shop.noteLink` | Skriv dig i Blackbook → / Sign the Blackbook → | Skriv dig op → / Join the list → |
| `shop.metaTitle` | Gaden sælger · … / The street sells · … | Shop · Ink & Art |
| `shop.metaDescription` | «alt det gaden sælger» / «everything the street sells» | Shop-sætning uden gaden. Ingen 900. |
| `shop.title` | Gaden sælger. / The street sells. | Shop / Shop |
| `shop.doors.walkin` | Two small ones. Tonight. 900,- — no booking. | Walk-in uden pris. K7. |
| `walkin.lede` / `walkin.metaDescription` | nævner 900 kr / 900 DKK | Fjern beløbet. Walk-in som tjeneste må blive. |
| `kerb.legend` | Kantstenen / The kerb is our waiting room | Kun hvis den vises på en kundeflade. Drop kerb/kantsten. |

`scene.gadeLegend` med KANTSTENEN / THE KERB: Emerge-hero. Hvis `/` Rummet ikke viser den, rør den ikke.

Gavekort-nøgler: behold.

### 3. Sidetitler og h1 — samme ord som nav

Kunden må ikke komme ind på «Artister» og møde h1 «Stolen».

| fil | nu | skal |
|---|---|---|
| `app/(da)/(rummet)/stolen/page.tsx` title + h1 | Stolen | Artister |
| `app/(en)/(rummet)/en/stolen/page.tsx` title + h1 + kommentaren «oversættes ikke» | Stolen | Artists |
| `app/(da)/(rummet)/stolen/[id]/page.tsx` rum-label | Stolen | Artister |
| `app/(en)/…/stolen/[id]/page.tsx` via `backToStolen` | Stolen | Artists (via i18n) |
| `components/rummet/MaerketFlade.tsx` h1 | Mærket | Shop (fra i18n, begge sprog) |
| `app/(da\|en)/…/maerket/page.tsx` title + description «Væggen og hylden» | Mærket | Shop · Ink & Art. Description: prints og arbejde. |
| `app/(da\|en)/…/maerket/[handle]/page.tsx` title `· Mærket ·` | Mærket | Shop |
| `app/(da)/…/maerket/vaerk/[id]/page.tsx` title | Mærket | Shop |
| `components/rummet/NattenFlade.tsx` h1 | Natten | Aftener / Nights (i18n) |
| `app/(da\|en)/…/natten/page.tsx` title + EN-kommentar «the name stays» | Natten | Aftener / Nights |
| `content/gaden.yml` `titel` | Gaden | Find os |
| `content/gaden.en.yml` `titel` | Gaden | Find us |
| `app/(da\|en)/…/gaden/page.tsx` title | Gaden · Ink & Art | Find os · / Find us · Ink & Art |
| `app/(da)/(rummet)/page.tsx` rum-label | Huset | Studiet |
| `app/(en)/(rummet)/en/page.tsx` | The house | Studio |
| `app/(da)/(rummet)/{faq,betingelser,piercing,privatlivspolitik}/page.tsx` rum-label | Huset | Studiet |
| `app/(en)/…/` samme | The house | Studio |
| `app/(da)/(rummet)/blackbook/page.tsx` title | Blackbook · Ink & Art | Skriv dig op · Ink & Art |
| `components/rummet/Door.tsx` `.rum-door__name` | Blackbook | Skriv dig op / Join the list (i18n) |
| `components/rummet/ProduktFlade.tsx` crumb | Mærket | Shop |
| `components/rummet/VaerkFlade.tsx` crumb | Mærket · Værk | Shop |
| `components/rummet/GadenFlade.tsx` link-tekst | Mærket | Shop (i18n) |
| `components/rummet/NattenFlade.tsx` link-tekst | Gaden | Find os / Find us (i18n) |
| `components/rummet/ArtistKort.tsx` «på Væggen» | Væggen | Arbejde (i18n — kortet viser i dag kun DA) |
| `components/rummet/HusetsSider.tsx` | Husets sider | Intern. Behold. |

EN forside-kommentar i `app/(en)/(rummet)/en/page.tsx`: «Rum-navnene i nav'en (Stolen, Mærket…) er husets egennavne» — slet.

`components/rummet/Shell.tsx` samme løgn — slet.

### 4. YAML Sonja retter i

`content/natten.yml` / `content/natten.en.yml`

- `intro`: «annonceres her og i Blackbook» → «her og når du skriver dig op»
- `tom_linje`: drop Blackbook-navnet, behold handlingen
- `spot_titel`: Nattespot → Walk-in om natten / Late walk-in
- `spot_linje` må gerne blive (den forklarer allerede walk-in efter 22). Ikke opfinde nye dage.

`content/privatliv.yml` + `.en.yml`: overskriften «Når du skriver dig op til Blackbook» → «Når du skriver dig op». Brødtekst: Blackbook-tilmeldinger → tilmeldinger / mailing-list signups.

`content/huset.yml` / `huset.en.yml`: ingen kundevendt «Huset» i synlige felter. Rør ikke billedtekst-politikken.

### 5. `/shop` — Emerge-butikken der stadig er live

`app/(da)/(emerge)/shop/page.tsx` h1 «Gaden sælger.» + title.
`lib/i18n.ts` `shop.*` EN «The street sells» + **900 kr på walk-in-døren**.

To tilladte udfald — vælg ét og skriv det i PR'en:

**A (foretrukket):** 308 `/shop` → `/maerket` og `/en/shop` → `/en/maerket`. Kunden har én shop. Emerge-copy dør.

**B:** Behold `/shop`, men h1/title/intro bliver Shop, og 900 forsvinder. Ingen «gaden sælger», ingen kerb som kundeflade.

Flash-sider (`app/(da|en)/(emerge)/**/flash/page.tsx`): «Blackbook» i brødtekst → skriv-dig-op-sproget. Komponentnavn `BlackbookSignup` må blive.

Gavekort-sider: ordet Gavekort er rigtigt. Rør ikke.

### 6. Tests der vil blive røde med vilje

De låser det gamle kanon. Opdater dem til de nye kundord. Testen skal stadig kunne fejle — negativ kontrol ved siden af.

Primært `tests/rummet.test.mjs`:

- `className="rum-label">Huset</`
- `Stolen</h1>` + «rummets navn oversættes ikke»
- `shelfLabel: "Hylden"` / `wallLabel: "Væggen"`
- `noEventLine: "…Blackbook."`
- `arbejder på Væggen`
- «S574 Natten og Mærket på engelsk — husets navne står»

Også `tests/shop.test.mjs` («Huset skal have en dør til Mærket» — href `/maerket` er rigtig; *teksten* Mærket skifter) og `tests/i18n.test.mjs` hvis den kræver egennavne.

Hegn der måler **kode-identifikatorer** (`loadHylden`, `NattenFlade`, `onHuset`, `HusetsRod`) rører du ikke.

Ny hegn-test, ét sted: nav-labels på DA og EN er Artister/Artists, Shop/Shop, Aftener/Nights, Find os/Find us — og at «Stolen», «Mærket», «Natten», «Gaden», «Blackbook», «Hylden», «Væggen» **ikke** længere står som synlig tekst i Nav, Door, rum-h1 eller rum-label på kundesider. Testen skal fejle hvis nogen skriver Stolen tilbage i `ROOMS`.

### 7. Bevis

Kør den test-kommando huset allerede bruger. Paste kommando + tal i PR'en.

Manuel tjek, skriv i PR-teksten:

1. DA `/` — rum-label Studiet, ikke Huset. Nav: Artister, Shop, Aftener, Find os.
2. EN `/en` — Studio. Artists, Shop, Nights, Find us. Ingen Stolen i nav.
3. `/stolen` og `/en/stolen` — h1 matcher nav.
4. `/maerket` — h1 Shop, sektioner Prints + Arbejde.
5. `/natten` — h1 Aftener / Nights. Ingen Nattespot-ord.
6. `/gaden` — h1 Find os / Find us.
7. Blackbook-dør: overskrift Skriv dig op / Join the list.
8. `/shop` og `/en/shop`: enten 308 til Mærket, eller Shop uden 900 og uden «street sells».
9. Skærmlæser: Book/Blackbook-dublet må ikke komme tilbage (S578). Ét synligt navn, ét aria-label, samme streng.

---

## Accept

Klar til Stevens accept når:

- En førstegangskunde kan pege på hver nav-dør og sige hvad der er bag, på dansk og engelsk, uden at kende huset.
- Intern jargon (Stolen, Hylden, Natten, Mærket, Væggen, Gaden, Blackbook, Huset, Nattespot) er væk fra kundens skærm, title og aria.
- URL'er, CSS og Shopify-handle er uændrede.
- Ingen walk-in-pris online.
- Tests grønne, og den nye nav-hegn kan blive rød.

Du melder ikke done. Du melder klar til Stevens accept, med kommandoen og hvad den svarede.

Kort til sidst i PR: hvad du byggede, hvad du beviste det med, og hvad du er mest utryg ved.
