# Accept: galleri-slots på artistsiden

Status: **UDKAST (2026-08-31)** — afventer Stevens `GODKENDT`
Bygger: Villy. Skrevet før bygning, jf. CLAUDE.md §6 og `docs/PROCES.md`.

Det vi køber: at en artist kan have **flere end ét** billede på sin side,
og at billederne skifter af sig selv — uden at nogen skal røre kode for at
lægge det næste på.

---

## Hvorfor

`/stolen/[id]` renderer i dag præcis ét fotografi:

```tsx
<img src={artist.foto} alt={artist.billedtekst || artist.fornavn} />
```

Der er ingen slot at lægge nummer to i. Da Steven 31/8 spurgte om der lå
flere billeder af Nizar i repoerne, var svaret målt: **ét reelt nyt motiv**
(`public/artists/nizar/portrait.jpg`, ubrugt) — og ingen plads at vise det.

Det er den rigtige rækkefølge at bygge slotten først. Fotograferingen er
Stevens kald; slotten skal stå klar den dag billederne kommer, og den skal
kunne fyldes fra Decap af et menneske uden en agent.

## Det bredformat vi har, tvinger et designvalg

`portrait.jpg` er **1179×753** — bredformat. Slotten er 4∶5. En naiv
`object-fit: cover` beskærer den midterste tredjedel og skærer Nizar
halvt væk i højre kant.

Derfor får hver slot et valgfrit **fokuspunkt** (`fokus`, som
`object-position`). Uden det er slot-systemet teknisk færdigt og praktisk
ubrugeligt på det materiale huset faktisk har.

## Rotation uden JavaScript

Rotationen er ren CSS: billederne ligger i stak, hver med sin egen
`animation-delay`. Pauseknappen er en `<label>` for en skjult checkbox, så
den virker med JavaScript slået fra — samme regel som købsfladerne (§5).

WCAG 2.2.2 kræver en pause-mulighed for indhold der bevæger sig i mere end
5 sekunder. Den er derfor ikke pynt; den er en betingelse for at fladen må
rotere overhovedet.

## Loft: 5 slots

CSS'en har ét `@keyframes` pr. antal (2–5). Det er dumt og læsbart frem
for smart og skrøbeligt. Loftet håndhæves **hvor redaktøren kan se det**
(Decap: max 4 ekstra billeder), ikke som en tavs afkortning.

---

## Kriterier

Alle skal kunne afgøres af et menneske i en browser, uden at læse kode.

**A1 — én slot ser ud som i dag (negativ kontrol).**
Givet Emma, som kun har ét foto,
når `/stolen/emma` åbnes,
så vises præcis ét billede, der er ingen pauseknap, og intet bevæger sig.

**A2 — den roterer (tid).**
Givet Nizar, som har to slots,
når `/stolen/nizar` står åben uden at nogen rører noget,
så er billedet efter 12 sekunder ikke det samme som ved 0 sekunder.

**A3 — den kan stoppes (tid).**
Givet rotationen kører,
når «Pause billederne» trykkes,
så står det samme billede stille 12 sekunder senere, og knappen hedder nu
«Afspil billederne».

**A4 — den virker uden JavaScript.**
Givet JavaScript er slået fra i browseren,
når `/stolen/nizar` åbnes,
så roterer billederne stadig, og pauseknappen virker stadig.

**A5 — «reducér bevægelse» skjuler ingenting.**
Givet operativsystemet står på reducér bevægelse,
når `/stolen/nizar` åbnes,
så bevæger intet sig, **alle** slots står samtidig som stillbilleder, og
pauseknappen er væk — der er intet at pause.

**A6 — engelsk flade er engelsk.**
Givet `/en/stolen/nizar`,
når siden åbnes,
så står pauseknappen på engelsk, og hvert billedes alt-tekst er den tekst
redaktøren selv skrev — vi oversætter ikke en billedtekst for hende.

**A7 — en redaktør kan fylde slotten. — KAN IKKE OPFYLDES ENDNU (31/8).**
Givet et menneske uden adgang til kode,
når hun lægger et billede i «Flere billeder» på en artist og udgiver,
så står billedet i rotationen på artistens side.

Decap-fladen er nedlagt (Sirius, CMS-RULING-01), og der findes ingen
afløser endnu. Slotten virker — men vejen ind i den er en PR, indtil
HOUSE-CMS-01 forbinder `artist.galleri` fra Shopify. Skrevet her frem for
at lade kriteriet staa som om det var opfyldt.

**A8 — loftet stopper hende hvor hun kan se det (negativ kontrol).**
Givet en redaktør der prøver at lægge et **femte** ekstra billede på,
når hun redigerer i Decap,
så lader feltet hende ikke — og lægger nogen det alligevel direkte i YAML,
vises det ikke, og `npm test` siger det.

---

## Uden for denne leverance

- **Kortene på `/stolen`** roterer ikke. Seks kort der alle skifter
  samtidig er støj, ikke liv.
- **Ingen nye fotografier.** Slotterne er tomme indtil nogen fotograferer.
  Det er ikke en mangel ved leverancen; det er dens præmis.
- **Væggen/`Plade`** røres ikke. Værker er ikke portrætter.
