---
description: Skriv acceptkriterier FØR bygning — i Stevens sprog
---

Skriv acceptkriterier for: **$ARGUMENTS**

Læs `docs/accept/SKABELON.md` først. Skriv derefter et udkast til
`docs/accept/<kort-navn>.md` med status `UDKAST`.

Reglerne, kort:

- 5–8 kriterier i formen **Givet / Når / Så**, i kundens eller Stevens
  perspektiv. Aldrig i kodens.
- Mindst ét med **tidsdimension** — Geopol-lektien: «Givet en vilkårlig
  dag D: briefingen handler om dag D og er forskellig fra D-1.»
- Mindst én **negativ kontrol**: noget der SKAL fejle, så et grønt
  resultat beviser noget.
- Hvert kriterium skal kunne efterprøves af Steven **uden at læse kode** —
  ved at åbne produktet, klikke, se.
- Skriv til sidst hvad der er **uden for købet** — kendt restrisiko, så
  accepten er informeret og ikke blind.

Kriterier skrevet efter bygningen beskriver det byggede, ikke det ønskede.
Derfor: før første commit.
