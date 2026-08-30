# K-turene 1–5 — fundliste, 30/8 aften

Kørt som browserprotokol på #217-buildet, mobil (390) + desktop (1440),
skærmbillede per trin. Eksterne hop (Shopify-checkout, Book.dk) er målt
på HTTP-niveau — sandkassen kan ikke rendere fremmede domæner.

## Grønt — bevist i aften

- **K1 Book hos artist:** forside → Emmas kort → hendes side (bio) →
  «Book tid» → /booking «Hos Emma Winding» → depositum-klik udløser
  navigation til Shopify (302 målt) → Book.dk-døren (200 målt).
  Alt til og med checkout virker. Selve betalingen + mailen = U2.
- **K2 Køb en vare:** Mærket → vareside → «Læg i kurv» udløser
  checkout-navigation. Priser og billeder fra Shopify-kollektionen.
- **K5 Blackbook (backend):** POST til /api/subscribe i PRODUCTION →
  `{"ok":true}` → kunden findes i Shopify med adressen. Testpost
  slettet igen. Det ENESTE uprøvede led er selve mailen — kræver en
  rigtig indbakke (Steven/Sonja: skriv jer op og se hvad der kommer).

## Fund — kræver handling

**F1 · /betingelser er tom: «Teksten afventer.»** Footeren linker til
den fra hver eneste side, og huset tager depositum og sælger gavekort.
En kunde der klikker «Betingelser» før et køb finder ingenting.
→ Teksten skal skrives (Steven/Simone ejer ordene; jeg lægger den ind
og gør den Decap-redigerbar samme time den findes).

**F2 · /walk-in viser 900 kr på husets egen flade.** Kendelsen 30/8
(«De 900 må godt stå offentligt») faldt om myshopify-butikken. Kanonens
K7 siger stadig: walk-in må omtales, prisen er fysisk. De to kan ikke
begge gælde for /walk-in. → Stevens kald: gælder frigivelsen også
sitet? Ja → K7 opdateres. Nej → prisen af /walk-in (og /en/walk-in).

**F3 · Subscribe-API'et er «unconfigured» lokalt og i preview.**
Virker i production (målt), men Vercel-previews har ikke
Shopify_client_id/secret i preview-scope... det HAR de (målt 30/8
morgen — begge står preview+production). Lokalt = forventet. Ingen
aktion, men noteret så ingen fejlsøger et spøgelse.

**F4 · /aftercare: indholdet bor i venstre tredjedel, resten er sort
tomrum på desktop.** Læsbart, men ser forladt ud. → Lille CSS-opgave
(max-width/centrering eller to spalter for Tatovering/Piercing).

**F5 · Gavekort-tilbuddet er usammenhængende.** Emerge-/gavekort sælger
8 beløb (100–4.000, «vælg frit»); Mærkets gavekortrække viser 3
(500/1.000/2.000). Samme butik, to fortællinger. → Beslutning: ét
kanonisk sæt beløb — og på sigt én flade (Emerge-øen, F6).

**F6 · Emerge-øen (beslutningsoplæg, kort):**
- **/gavekort** — sælger. Portér til Rummet som egen salgsflade
  (Mærket-tone). Ejer: Grok (hans lane). Indtil da: lad den leve.
- **/walk-in** — sælger + er QR-mål. Portér til Rummet. Ejer: Grok.
  Afventer F2-kaldet først.
- **/flash** — «drop lander snart»-flade. Luk med 308 → /maerket
  (varerne bor der nu), eller behold til flash-drops. Stevens kald.
- **/shop** — Emerge-katalog, shop.inkandart.dk peger på den. Luk med
  308 → /maerket når Mærket har grupperings-UX til 100 varer (Grok).
- **/en/*** — hele det gamle design på engelsk. Min lane: minimal
  EN-Rummet (forside + booking + walk-in) i denne uge; resten 308 til
  dansk indtil porteret.

**F7 · Nav'en har ingen dør til aftercare/gavekort.** Rummet-nav'en
viser Stolen/Mærket/Natten/Gaden/Blackbook. Gavekort og aftercare kan
kun findes via footer/gaden/direkte link. Bevidst minimalisme — men
gavekort er en pengeside. → Forslag: gavekort-linje i footeren, ikke
i nav'en. Stevens smag afgør.

## Book.dk-beslutningerne står stadig (fra 30/8 formiddag)

Touch-up slukket for alle · «Emma Windinnalls» ≠ Winding · Annas
profilmail book@ vs booking@ · «Fra 1. sep (Planlagt)»-perioden på
Annas tider. Alle fire er ét klik i app.book.dk — Steven/Simone.
