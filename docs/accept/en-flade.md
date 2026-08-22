# Accept: Den engelske flade (/en)

Status: **UDKAST — afventer Stevens sniff**

Det vi køber: en turist på Larsbjørnsstræde (op til 70 % af walk-in) kan
forstå, vælge og handle — uden at møde dansk han ikke bad om, og uden
døde døre.

1. **Givet** en engelsktalende kunde på forsiden, **når** han skifter til
   EN, **så** er alt han kan SE og KLIKKE på engelsk — tekst, knapper,
   aria-labels (skærmlæser-tekst), fejlbeskeder.
2. **Givet** en kunde der lander direkte på `/en`, **når** siden åbner,
   **så** melder siden sig som engelsk til browser, søgemaskine og
   skærmlæser (`html lang="en"`). *Målt 2026-08-22: siger `lang="da"` i dag
   — det er en kendt mangel, den indgår i købet.*
3. **Givet** en delt eller gammel engelsk adresse uden engelsk side
   (fx `/en/gavekort`), **når** kunden åbner den, **så** lander han på den
   danske side — aldrig på en fejlside. *Målt 2026-08-22: 410 i dag —
   rettes i denne leverance.*
4. **Givet** en kunde på `/en/walk-in`, **når** han vil booke eller købe,
   **så** virker handlingen hele vejen: knappen findes, kurven åbner, og
   det han betaler for stemmer med det han valgte.
5. **Negativ kontrol:** en opdigtet engelsk adresse (`/en/xyzzy`) svarer
   «borte» (410) — vi folder ikke vrøvl ind på forsiden i stilhed.
6. **Tid/drift:** når en NY dansk side fødes uden engelsk søster, dør dens
   engelske adresse ikke — den 308'er til dansk fra dag ét (hegnet i
   `localePath` + redirect-matricen holder det, testen fejler ellers).
7. **Steven-leddet:** Steven åbner `/en` på sin telefon og går kunderejsen
   walk-in → book og gavekort → kurv uden at møde dansk eller en død dør.
