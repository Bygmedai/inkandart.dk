# Bestilling — visuelt design, Ink & Art
Til: **Claude Design** (visuel motor / plugins)
Fra: Steven, Ink & Art Cph · Larsbjørnsstræde 13, København
Dato: 27. august 2026
Bygger (kode, tokens, rum): Grok Bot. Du laver billedet. Byggeren implementerer bagefter.

---

## 1. Opgaven
Lav det **visuelle system** til Ink & Art på tværs af:

1. **Site** (huset)
2. **Webshop** (hylden: print, hoodie, t-shirt, gavekort)
3. **App** senere (Blackbook, hvem sidder, nat-plakat) — designes nu så den ikke bliver et fjerde brand

Akse, låst: **Stolen er galleriet.** Nat-galleri. Værket er en plade på væggen. Merch er editionen af værket. Natten er en plakat ved døren. UI er næsten usynligt.

Skrot: det nuværende live site (Emerge: ticker, clipart-kranier, torn-paper-collage, sort “scroll to emerge”, oxblood/guld, “BOOK TID” som hero). Det er en revamp vi ikke tager alvorligt.

Skrot også: byggerens HTML-skal (sort/hvid trådramme, Oswald, tomme kasser). Det er **ikke** looket. Det er kun rum-navne.

---

## 2. Hvad du skal levere
Ikke et moodboard-essay. **Billeder + ét stramt system.**

1. **Look-and-feel, 6–8 skærme** (desktop + mobil), fuld pixel, ikke wireframe:
   - Site: første skærm (hus, ikke port)
   - Stolen (artist som plade/kort)
   - Mærket (værk som galleri-plade + hylde med ét print)
   - Natten (plakat; plus tom-tilstand “ingen nat i aften”)
   - Gaden (nr. 13, walk-in som ritual nede i rummet)
   - Shop: ét produkt (hoodie/print) som edition, ikke souvenir
   - Checkout/booking **skin** (samme rum — ikke hvidt SaaS)
2. **Komponentark** (foto, ikke Figma-grå):
   - Plade, Plakat, Kort, Hylde, Skilt, Dør (Blackbook)
3. **Typeprøve** — de to stemmer i brug på rigtig tekst (se §5)
4. **Farve i rummet** — tokens fra §5, vist på foto, ikke som palet-cirkler
5. **Anti-ark:** 4 billeder af hvad vi **ikke** er (generisk tattoo-shop, Emerge-collage, Berghain-kopi, AI-slop)
6. **Plakaten i tre snit fra samme system:** dør (A3-print), feed (4:5), story (9:16). Samme nat, tre beskæringer — den skal kunne sættes op fra en telefon uden designer.
7. **Gavekortet som objekt:** fysisk kort (85×54 mm) + dets digitale tvilling i shoppen. Samme grammatik som Plade — det er den vare, der findes i shoppen i dag.

Filer: PNG/WebP, 1440px bredde til desktop, 390px til mobil. Ét PDF-board til review.

---

## 3. Sted og stemme (ikke Berlin)
Vi holder til i **København. Pisserenden. Larsbjørnsstræde 13.**

Berlin/Tresor/Berghain er **kun** plakat-grammatik: sort bund, kondenseret type, ét signal, ingen pynt. Det er **ikke** stedet, ikke ruinen, ikke “vi er Berghain”.

Foto og gade: København. Dansk lys. Fortov, kælder, skilt, cykler. Module er et sted i byen, ikke et logo.

Tekst på dansk. Kort. Ingen marketing. Ingen “unique universe”-sætninger på skærmen.

Tilladt at bruge (hvis det sidder i rummet, ikke som site-identitet):
- Pisserenden / nr. 13
- “Vi dekorerer ikke. Vi committer.” (Nizar — kun hvis det står ved ham)

Forbudt på skærmen: “Stolen er galleriet” som hero-slogan, “brand før salg”, “gonzo”, “tokens er låst”, “ikke Emerge”. Det er brief, ikke copy.

---

## 4. Forretning (så designet bærer cash, uden at lukke salget)
Hvid omsætning. Kunstnere med **egen stil**. Merch på **værket** (print 349, tee 299, hoodie 599 — edition, artist-navn, titel, år). Fri fragt over 499 — hoodien er ankeret; det må stå ved varen, ikke som banner.

Ophold vises **deskriptivt**: fast · gæst · uge — som navn og periode (“i huset til 14/9”), aldrig som hierarki. Trappen, VIP-økonomien og hvem der tjener hvad kommer **aldrig på skærmen** — det bor i artist-pakken. Kortet skal få kunden til at booke gæsten, før hun rejser; ikke fortælle hvem der er nederst.

Natten: én plakat, Blackbook som dør. Booking og Shopify er motor (depositum og gavekort kører i shoppen i dag) — du designer **skin**, du bygger ikke ny kasse.

Første skærm sælger ikke Groupon. Den viser **hvem der er i huset**, **ét værk**, **om der er nat**. Blackbook findes. Walk-in og gavekort er ritual i Gaden, ikke hero.

Tom hylde er ærlig. Ingen fake produkter, ingen fake DJ, ingen fake gæst.

---

## 5. Tokens (låst palet — brug dem, opfind ikke en ny)
| Token | Hex | Brug |
|---|---|---|
| nat | `#070707` | Bund overalt |
| hud | `#E8DCC8` | Tekst, wall-label |
| blod | `#B91C1C` | Pris, live, Blackbook-prik |
| strobe | `#C8FF3D` | **Kun Natten.** Én gang pr. nat-skærm. Aldrig på tatoveringsfoto. |
| beton | `#8A8580` | Tid, small print, tom-tilstand |

Regler i rummet: **blod kun i store snit** (pris, LIVE, prikken) — aldrig under ~20 px på nat; alt small print og tid i beton; strobe aldrig som brødtekst-farve.

Type (karakter; licens kan vælges):
- **Poster:** ultra-kondenseret grotesque, caps. Plakat, rum-navn, pris.
- **Chair:** humanist grotesque. Wall-label, brød.

Kandidater (byggeren afgør licens): Poster — Druk eller Tungsten; gratis fallback: Anton. Chair — Schibsted Grotesk eller Instrument Sans (begge gratis).

Læsbarhed er et krav, ikke et hensyn: **brød aldrig i caps**, chair med høj x-højde og åbne former, minimum 16 px. Flere i huset læser dårligt — sitet skal kunne læses af dem, der arbejder i det.

Ingen script. Ingen tattoo-font. Ingen ticker. Ingen guld. Ingen afrundede hjørner. `radius: 0`.

Komponenter: **Plade** (ét foto, titel·navn·år) · **Plakat** · **Kort** (artist · periode) · **Hylde** (edition) · **Skilt** (pris i blod) · **Dør** (Blackbook, én linje).

Pladen og hylden deler label: **titel · artist · år** — på væggen og på varen. Det er samme værk; labelen følger med. Data kommer fra husets værkarkiv, så formatet er fast, ikke frit.

---

## 6. Billedlov
1. Rene billedflader. Ét motiv = én kasse. Ingen collage.
2. Kun foto eller tryk. Ingen AI-figurer, stock-tatoveringer, SVG-flash, clipart.
3. Gonzo = kameraet for tæt på (hud, nål, sved, gade). Ikke “edgy illustration”.
4. Techno = lys, plakat, strobe som signal. Ikke laser-stock, ikke kranium.
5. Ink = huden. Art = titel, navn, årstal som galleri.
6. Autentisk = det kunne være skudt i kælderen på nr. 13. Generisk = det kunne være et hvilket som helst studio i Europa.
7. Zonen ved stolen fotograferes **ren**: lys, stål, handske, film — klinisk skarpt er en del af gonzoen. Patinaen, den rå mur og mørket bor i venteområdet, gaden og natten. Byg ikke looket på rå mur bag stolen — det billede kan rummet ikke levere.

**Foto vi har endnu:** ingen. Sonja skyder: 12 værk-plader, 8 stolen (Nizar), 10 gade, 4 hjørne. Indtil da: brug **photoreal placeholders der ligner det shoot** (København, hud, kælder, nat), mærk dem `PLACEHOLDER` diskret i beton — ikke som vandmærke hen over værket. Læg placeholders i **præcis shoot-listens antal og beskæringer**, så de rigtige billeder kan skiftes ind 1:1 uden redesign.

---

## 7. Referencer (stjæl princip, ikke look)
- Lynn Saville — nat, ét lys
- Mischa Fanghaenel, NACHTS — techno tæt på
- Brice Gelot, 120 Film / Steyls Jobstoppers — hud som arkiv
- Vanja Golubovic, Tresor — plakat-system, kadence
- Museumsshop-editions (Perimeter, Walker) — hoodie = værk, ikke logo

Ikke: Berghain-cosplay, McGinley-glamour, Emerge-collage, “Copenhagen tattoo” Google-look.

**Modanker, konkret: sailors-ink.dk** — dansk kæde, generisk udført perfekt. Deres grammatik er anti-arkets billede ét: hvid bund, artist-headshots uden sted, stilart-menu, fra-priser, tryghedscopy (“Danmarks bedste artister”). Alt hvad de gør pænt, gør vi stedligt.

---

## 8. Funktionelt (så byggeren kan kode)
- Site og shop er **samme Shopify-installation** (inkandart.dk). Ét tema, fire rum som sektioner. Appen genbruger tokens senere.
- Fire rum i nav: Stolen · Mærket · Natten · Gaden + Blackbook
- Tom-tilstande designede (ikke lorem, ikke grå kasse): “Ingen gæst i stolen”, “Ingen nat i aften”, “Hylde tom”
- Booking: i dag hopper sitet til **inkart.book.dk** — en hvid side. Design to ting: **overgangen** (en dør i vores rum, ikke et umeldt hop) og **skin** til selve bookingen inden for det, Book.dk kan farve. Book.dk og Shopify-checkout kan kun delvist styles — checkout er logo, farver og type. Design inden for det; byg ikke en ny kasse.
- Shop: samme tokens. Produktkort = Hylde. Checkout-logo/farver som nat/hud/blod.
- **Dør (Blackbook) = ét felt og én linje.** Telefonnummer ind, færdig. Ingen app-badges, ingen formular med fem felter.
- **Skabeloner, ikke enkeltdesigns:** Sonja skal kunne sætte ny plakat, nyt værk og ny hylde op fra en telefon uden designer. En skærm, der kræver en designer hver uge, er tegnet forkert.
- Gadens events annonceres **aldrig** på sitet — de bor i Blackbook. Sitets nat-plakat er indendørs-natten.
- Mobil først på Natten og Dør. Desktop først på Plade-væg.
- Ingen cookie-banner-design. Ingen FAQ-hero.

---

## 9. Tone i dit output
Vis det. Skriv næsten ingenting. Ingen “let’s create a unique immersive experience”. Ingen forklaring af gonzo. Ingen palet-cirkler med labels som hovedleverance. Skærme.

Hvis noget er placeholder: sig det i ét ord på billedet.

---

## 10. Succes
Steven kan se tre screenshots (site, shop, nat) og sige: **samme sted, København, ikke lort, ikke AI-snask.** En fremmed kan ikke forveksle det med et template-tattoo-site eller med Emerge.

Og: **Sonja kan lave næste uges plakat på telefonen uden at spørge nogen.** Kan hun ikke det, er systemet ikke færdigt.

Når du er færdig: send skærmene. Byggeren (Grok) koder. Du designer ikke koden.
