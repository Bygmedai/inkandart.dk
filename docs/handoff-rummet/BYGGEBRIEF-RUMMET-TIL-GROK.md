# Byggebrief — Rummet, inkandart.dk
Til: **Grok** (bygger) · Fra: Haruki (lead og test) · 27. august 2026
Design: Claudias «Rummet v1» + rettelser fra reviewet. Steven ejer beslutninger om penge og indhold; Nizar ejer alle priser.

Sådan arbejder vi: du bygger i milepæle og leverer en preview-URL + kort changelog pr. milepæl. Jeg tester og sender fund tilbage, nummererede. Testkriterierne er interne — du får fundene, ikke checklisten. Er du i tvivl om noget, spørger du mig i stedet for at gætte; opfind aldrig indhold, tal eller åbningstider.

---

## 0. Platformen (fakta, ikke til diskussion)
- inkandart.dk kører **Next.js 15 (App Router) på Vercel** med auto-deploy fra main — dette repo. Rummet bygges her; de fire rum er routes.
- **Commerce er Shopify** (store `d1qp54-0w`): kurv og checkout ligger hos Shopify, og webshop-sporet har eget repo (`inkandart-webshop`). Produktdata hentes via Storefront API — vi bygger aldrig egen kasse.
- Booking kører på **Book.dk** (inkart.book.dk). Den skinnes — logo, farver, type — men dens layout og DOM er dens egne. Du bygger **overgangen og rammen**, aldrig en ny bookingmotor.
- Alle beskeder og bookinger samles i **booking@inkandart.dk**. Intet flow må omgå den.
- Shopify checkout kan kun styles med logo, farver og type. Design inden for det.
- Emerge-fontene (Cormorant Garamond, Space Grotesk) udgår — Rummet kører Anton + Instrument Sans, self-hosted som i dag.

## 1. Arkitekturkrav — Sonja er admin
Alt indhold, der skifter, skal kunne fodres **fra en telefon, uden dig og uden designer**. Det er et arkitekturkrav, ikke et ønske. I en Next.js-kodebase betyder det: **indhold bor aldrig i `lib/*.ts` eller i komponenter** — det bor i data, Sonja kan redigere i en browser. Din indstilling i M1, vælg og begrund én mekanisme: (a) **Shopify metaobjects** som fælles datakilde for site og shop via Storefront API, eller (b) **Decap CMS** (org'et har allerede `decap-oauth-worker`) med git-baseret redigering. Datamodellen er den samme uanset:

- `vaerk` — titel · artist(ref) · år · arkivnr · foto · må_vises (bool) · edition_ref (valgfri)
- `artist` — fornavn · håndværk (én linje) · periode (fast / gæst til DATO) · foto · aktiv
- `nat` — nr · dato · navne (linjer) · tidsrum · plakatfoto · aktiv (bool)
- Varer = Shopify-produkter med reference til `vaerk` (labelen titel·navn·år hentes fra værket — én kilde på tværs af site og shop).

Tom-tilstandene («Ingen nat i aften», «Hylden er tom», «Ingen gæst i stolen») er **datatilstande** — de rendrer automatisk når `aktiv=false` eller listen er tom. Aldrig to versioner af en side.

## 2. User cases — det her bygger vi
Hver case skal kunne gennemføres på mobil (390) og desktop (1440). Casen er færdig, når en fremmed kan gøre det uden hjælp.

**U1 · Walk-in-kunden på gaden.** Som forbipasserende i Pisserenden vil jeg på telefonen se om der er åbent, hvor døren er, og om walk-in kan lade sig gøre i dag — så jeg går ned ad trappen i stedet for videre. *Flow:* Google/IG → Gaden → adresse, åbent-status, walk-in-vindue, «ring på»-linjen. *Edge:* lukket = ærlig lukket-tilstand, ikke tavshed. **Åbningstider og walk-in-vinduer leveres af Steven — byg med `[TAL BEKRÆFTES]` indtil da.**

**U2 · Kunden med et motiv.** Som kunde der har set husets arbejde vil jeg finde den rigtige artist, se hendes værker og booke med depositum — så tiden er min. *Flow:* Huset/Stolen → artistkort → «N værker i arkivet» linker til Mærket filtreret på artisten → BOOK TID → S8-1 Døren (Skiltet: ét tal, depositum fragår) → S8-2 Book.dk klædt på → **S8-3 Kvitteringen: «Din tid er sat. Betal depositum nu» → shoppens depositum-vare → betalt-tilstand.** *Edge:* depositum ikke betalt → tydelig konsekvens-linje (teksten leverer Steven). Bekræftelser lander hos kunden OG i booking@.

**U3 · Gæstens deadline.** Som kunde vil jeg se at gæsten kun er i huset til en dato — så jeg booker før hun rejser. *Flow:* Stolen → gæstekort med periode → book. Perioden kommer fra `artist.periode`, aldrig hårdkodet.

**U4 · Merch-køberen.** Som kunde/fan vil jeg købe editionen af et værk — så jeg ejer stregen. *Flow:* Mærket (væggen) → værk → Hylden → produktside (edition, nummereret, samme label som væggen) → kurv → checkout. Fri fragt-grænsen (499) vises ved varen. *Edge:* hyldeTom-tilstand med Claudias linje ordret: «Vi laver ikke varer uden værk.»

**U5 · Gavekortsgiveren.** Som gavekøber vil jeg købe et gavekort der ikke ligner en Shopify-standardvare — så gaven føles som huset. *Flow:* Gaden/Hylden → gavekort (digital tvilling af det fysiske kort) → checkout → modtager-mail. Beløb 500/1.000/2.000/frit. Regler (gyldighed, depositum-brug) står som `[AFVENTER STEVEN]`.

**U6 · Nattegæsten.** Som en der så plakaten vil jeg på listen — så jeg ser næste nat først. *Flow:* Natten/enhver Dør → ét telefonfelt → IND → bekræftelse i samme rum. Samme dør på alle sider, samme linje: «Vi sender kun natten. Afmeld med STOP.» *Edge:* ingen nat → S5-tilstanden med sidste nat + Blackbook som eneste CTA. **Teknisk indstilling ønskes i M1:** enkleste lagring af numre (fx Shopify customer + tag `blackbook`) — du indstiller, jeg godkender. Ingen tredjeparts-scripts uden godkendelse.

**U7 · Sonja fodrer huset (admin-casen — vigtigst af alle).** Som den der driver butikken vil jeg kunne: sætte en ny nat op (dato, navne, foto — plakaten samler sig selv i tre snit), lægge et værk i arkivet, aktivere en hylde-vare, og rette «i huset»-listen — **fra telefonen, på under fem minutter pr. opgave, uden at røre kode.** *Flow:* Shopify admin → metaobject → gem → live. Skriv en énsides «Sonjas greb»-note som del af leverancen (skærmbilleder, få ord).

**U8 · Artist-kandidaten.** Som artist der hører om huset vil jeg se hvem der sidder der og hvordan værker vises — så jeg vil sidde der selv. *Flow:* Stolen + Mærket bærer casen; kontakt = booking@ i footeren. Ingen «join os»-side.

## 3. Ufravigelige regler (fra bestilling + review)
1. Tokens: nat `#070707` som bund overalt (ikke #171717 — det var boardets ramme). Hud, blod, beton, strobe som spec'et. **Strobe kun på nat-flader, én gang pr. flade. Blod aldrig under 20 px.** Radius 0.
2. **Ét tal i rummet.** Aldrig «fra», aldrig i timen, aldrig «skriv for pris». Tal kommer fra Steven/Nizar — mangler det, står `[TAL BEKRÆFTES]`, ikke et opfundet tal.
3. **Ingen opdigtet virkelighed.** Ingen fiktive navne, DJs, tider, antal. Demo-indhold mærkes `DEMO` i beton. Claudias «Nizar Haddad / Emma Ravn / Kaya Lind»-navne er dummy — brug fornavne indtil Steven leverer godkendte navnetræk.
4. **Blackbook-døren forsvinder aldrig** — heller ikke i shoppen. Kurv vises kun med indhold, ved siden af døren.
5. **Footer-linjen på alle sider**, én linje i beton: Ink and Art Cph · CVR · Betingelser · Privatliv · booking@inkandart.dk. Politiksiderne er Shopify-standard, klædt i rummet.
6. Rigtig semantik: knapper er `<button>`/`<a>`, dørens felt er `<input type="tel">` med label. Synlig fokus-tilstand (2 px hud-outline, offset 2; strobe på nat-flader). Interaktive mål ≥ 44 px. Labels ≥ 12 px, brød ≥ 16 px, aldrig brød i caps.
7. Alt-tekst på plader = værk-labelen («Sort hjort, Nizar, 2026»).
8. S1's fold ved 1440×800: værket + toppen af «I huset» + nat-linjen synlige. Mobilnav: rum-navnene som bundlinje, Blackbook-prikken altid synlig.
9. Fotoslots bygges 1:1 efter Claudias shoot-liste (slot-id = filnavn), så Sonjas billeder kan skiftes ind uden redesign.
10. Sproget er dansk, kort, uden superlativer. Copy ud over Claudias boards skriver jeg — spørg, digt ikke.

## 4. Milepæle
- **M1 · Fundamentet.** Rum-routes, tokens, nav + footer, datamodellen (din valgte mekanisme), Huset (S1) med ægte datatilstande. Plus dine indstillinger: content-mekanisme (metaobjects kontra Decap), Blackbook-lagring, Book.dk-overgang (embed kontra klædt hop). *Jeg tester U1-delvist + fundament.*
- **M2 · Stolen og Mærket.** Artistkort, værk-væg, filter-link, Hylden + produktside + gavekort. *Jeg tester U2 (til S8-1), U3, U4, U5.*
- **M3 · Natten og Gaden.** Plakat fra `nat`-data i tre snit, tom-tilstand, Døren overalt, Gaden. *Jeg tester U6, U1 færdig, U7 på nat+værk.*
- **M4 · Booking-sømmen.** S8-1→2→3 hele vejen, inkl. depositum-varen og kvitteringstilstanden. *Jeg tester U2 ende-til-ende + U7 komplet + U8.*

Intet går live før alle fire er gennem test. Vercel preview-deploys pr. PR er preview-kanalen — main er hellig, for den auto-deployer til inkandart.dk.

## 5. Det du får og ikke får
Du får: Claudias boards, dette brief, alle fund fra test, hurtige svar på spørgsmål.
Du får ikke: testchecklisten (intern), lov til at gætte tal, tider eller navne, eller lov til at bygge booking- eller mail-infrastruktur uden om booking@.
