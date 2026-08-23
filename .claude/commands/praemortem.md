---
description: Præmortem på en PR — adversarielt mandat, rapport til Steven
---

Du er frisk kritiker på denne PR: **$ARGUMENTS**

Du har fuld adgang til repoet, og det er meningen — repo-viden er det der
gør dig kompetent. Det du IKKE må gøre, er at danne din dom oven på en
andens.

## Rækkefølgen er hele mekanismen

1. **Hent diffen og acceptkriterierne først.** `gh pr diff <nr>` og
   `docs/accept/<navn>.md`. Intet andet endnu.
2. **Læs IKKE PR-teksten, kommentarerne eller review-trådene, før du har
   skrevet din egen dom ned.** PR-teksten er byggerens selvforståelse;
   kommentarerne er andres domme. Målt: en påstået dom i konteksten vender
   en bedømmer i 66,5 % af tilfældene — før noget autoritetsstempel
   overhovedet er sat på. Din værdi ligger i at være det eneste sted i
   huset hvor dommen dannes uafhængigt.
3. **Skriv din dom ned** (i din svartekst) — så må du læse tråden og
   tilføje det den ændrer. Sig eksplicit hvad der ændrede sig og hvorfor.

## Selve mandatet

**PRÆMORTEM.** Det er tre uger senere. Det her blev accepteret og viste sig
fundamentalt i stykker på en måde alle checks overså. Skriv historien.

Arbejdsform — **udførelse, ikke mening**:

- Kør det hvor du kan. Byg mindst tre egne modeksempler som de
  eksisterende tests IKKE dækker. Et kørt modeksempel slår en læst mening.
  (Målt: at køre artefaktet giver 90 % enighed med mennesker, at læse
  rapporten om det giver 70 %.)
- Angrib den antagelse bygherren er mest tryg ved. Spørg altid: hvem
  leverer kendsgerningerne, og hvis kode dømmer? Fem af fem blokkere i
  #178 lå i den tillidsgrænse — ikke i logikken.
- Tavshed er ikke et bevis. Et grønt tjek uden en mulig rød måler intet.

## Rapportér

1. **3–6 konkrete fiaskohistorier** med fil og linje, helst med et kørt
   modeksempel.
2. **Blokkere før accept** vs. **accepteret restrisiko** — skarpt adskilt.
   Indled afsnittet med `BLOKKERE: n` (også hvis n er 0) — fangstgraden i
   `scripts/fabriksmaal.mjs` kan ikke regnes uden den linje.
3. **Én ting der er bedre end forventet.** Hvis alt er skidt, har du ikke
   kigget godt nok.

Brug pladsen på det der knækker. Rapporten går til Steven — ikke gennem
byggeren.
