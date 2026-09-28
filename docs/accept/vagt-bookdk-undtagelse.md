# Accept: QA-vagten står ikke rød på Book.dk's egen fejl

Status: **GODKENDT (2026-09-28)** — Harukis brief, videresendt af Steven.

Det vi køber: at en rød vagt betyder noget igen. I dag er `vilde-qa` rød på
alle PR'er af en fejl hos Book.dk, som ingen af os kan rette. En vagt der
altid er rød, lærer alle at overse rødt.

## Sådan ser det ud i dag (målt 2026-09-28)

Book.dk's bookingside henter `assets/js/ob-therapy-groups.js` og
`assets/css/ob-therapy-groups.css`. Begge svarer 404 — på inkart.book.dk og
på andre Book.dk-kunder (allanfrisor, arik, herrefrisoren,
leanderhairstudio), og filerne findes heller ikke på app.book.dk. Bookingen
virker for kunden hele vejen til kalenderen. Book.dk har fået en fejlmelding.

Vagten giver **30 fund**: `/booking` og `/en/booking` × 5 bredder × 3
beskeder.

## Kriterierne (Harukis)

1. **Givet** vagten kørt mod `main` i dag, **så** er de 30 kendte fund væk,
   og der er ellers ingen fund.

2. **Givet** at beskederne undtages, **så** forsvinder de ikke i stilhed: de
   står i rapporten med antal, fx «Book.dk ob-therapy-groups 404 undtaget: 30
   (udløber 12/10)». Når Book.dk har rettet fejlen, viser noten 0 og siger,
   at undtagelsen kan fjernes.

3. **Negativ kontrol:** enhver anden `console.error` fra inkart.book.dk —
   en anden fil, en anden besked — er stadig et fund.

4. **Tid:** undtagelsen har en udløbsdato i koden, 2026-10-12. Med datoen sat
   til i går kommer de 30 fund tilbage. Vist én gang, datoen sat tilbage.

5. Intet andet i vagten ændrer adfærd: samme flader, bredder og regler, og
   ellers «Ingen fund».

## Uden for købet

- Book.dk-indlejringen på `/booking`, CSP og alt andet i vagten.
- Workflow-filen røres ikke; `ADVISORY` forbliver slået fra.
- Fejlen hos Book.dk selv. Den er meldt til dem; undtagelsen udløber, så
  nogen skal tage stilling igen 12/10, hvis den ikke er rettet.
