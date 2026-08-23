# Acceptkriterier — skabelon

**Reglen (ratificeret S568):** Ingen agent melder «done». En agent melder
«klar til Stevens accept». Accept er Stevens handling, udført mod kriterier
der er skrevet **før** bygningen — af agenten, i Stevens sprog, godkendt af
Steven før første commit («sniffer»-leddet). Til sidst betjener Steven selv
produktet mod kriterierne (accept-leddet). Alt imellem de to led er
agenternes.

**Hvorfor:** «Acceptance is an act of the buyer» (FAR 46). Leverandørens
egen erklæring om færdighed er testimoni, ikke accept. Målt: agenter melder
succes på ødelagte systemer, og QA-agenter der har læst en autoritets dom
er allerede kompromitterede (66,5 % flip alene af en påstand i konteksten).

## Sådan skrives de

- 5–8 kriterier, formen **Givet / Når / Så** — i kundens eller Stevens
  perspektiv. Aldrig i kodens.
- Mindst ét kriterium med **tidsdimension** (Geopol-lektien: «Givet en
  vilkårlig dag D: briefingen handler om dag D og er forskellig fra D-1» —
  den sætning havde fanget 47-dages-fejlen på dag ét).
- Mindst én **negativ kontrol**: noget der SKAL fejle/afvises, så et grønt
  resultat beviser noget.
- Hvert kriterium skal kunne efterprøves af Steven **uden at læse kode** —
  ved at åbne produktet, klikke, se.

## Filens livscyklus

1. Agent skriver udkast her i `docs/accept/<navn>.md` — FØR bygning.
2. Steven sniffer: «virker de i den fysiske verden?» Justering → godkendt.
3. Byggeren bygger mod dem. Blind QA tester mod dem — uden at kende
   forfatter eller andres vurderinger.
4. Premortem (frisk agent, adversarielt mandat) før accept.
5. Steven betjener produktet mod kriterierne. Accept eller retur.

Status skrives øverst: `UDKAST` → `GODKENDT (dato)` → `ACCEPTERET (dato)` /
`RETUR (dato, grund)`.
