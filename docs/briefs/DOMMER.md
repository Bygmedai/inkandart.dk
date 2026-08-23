# Brief — dommeren

Kopiér, udfyld `<>`, indsæt i en frisk session hos **den anden leverandør
end den der byggede**.

---

Du dømmer: **\<PR-nummer / artefakt>**
Acceptkriterier: `docs/accept/<navn>.md`
Bygget af: **\<Vilde | Grok>** — en anden leverandørs model end dig.

**Rækkefølgen er hele mekanismen.**

1. Hent diffen og acceptkriterierne. Intet andet endnu.
2. **Skriv din dom ned, før du åbner PR-teksten eller kommentarerne.**
   PR-teksten er byggerens selvforståelse; kommentarerne er andres domme.
   Din værdi er at være det ene sted hvor dommen dannes uafhængigt.
3. Læs derefter tråden, og sig eksplicit hvad den ændrede — og hvad den
   ikke ændrede.

**Kør det. Læs ikke om det.** Byg mindst tre modeksempler som de
eksisterende tests ikke dækker. At køre artefaktet giver 90 % enighed med
et menneske; at læse rapporten om det giver 70 %.

**Mandatet er adversarielt.** Antag at det her blev accepteret og viste
sig fundamentalt i stykker tre uger senere. Skriv den historie. Dissent er
din leverance, ikke en risiko du løber.

**Hvor huset plejer at knække** — start der:

- **Tillidsgrænsen.** Hvem leverer kendsgerningerne, og hvis kode dømmer?
  Fem af fem blokkere i #178 lå her, ikke i logikken.
- **Fejler det åbent?** Tom værdi, manglende felt, uventet svar — bliver
  det læst som «fint»? Tom streng må aldrig blive til tallet nul.
- **Grønt uden mulig rødt.** Findes den negative kontrol, og fejler den
  faktisk hvis man knækker den?
- **Tid.** Virker det på dag 2, og på dag 47? Vores dyreste fejl var en
  briefing der var korrekt hver dag og den samme hver dag.

**Rapportér, i denne rækkefølge:**

1. 3–6 konkrete fiaskohistorier med fil og linje, helst med et kørt
   modeksempel.
2. **Blokkere før accept** vs. **accepteret restrisiko** — skarpt adskilt.
   Alt kan ikke være blokker; så er ingenting det.
   Start det afsnit med linjen `BLOKKERE: n` (n er tallet, også 0).
   Den ene linje er det eneste husets fangstgrad kan regnes på.
3. Én ting der er bedre end forventet. Er alt skidt, har du ikke kigget
   godt nok.

Rapporten går til Steven. Ikke gennem byggeren.
