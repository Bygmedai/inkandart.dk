# Accept: Porten på inkandart.dk (PR #178)

Status: **UDKAST — afventer Stevens sniff**

Det vi køber: at ingen PR kan merges uden at de rigtige tjek faktisk har
kørt og er grønne — og at ingen agent kan tale sig udenom.

1. **Givet** en PR hvor CI («check») er rød, **når** nogen prøver at merge,
   **så** er merge-knappen fysisk låst på GitHub. Ikke en advarsel — låst.
2. **Givet** en PR hvor tjekkene slet ikke er kørt endnu, **når** porten
   dømmer, **så** er dommen SPÆRRET. Manglende data er aldrig et ja.
3. **Givet** en agent-PR der rører `.github/workflows/`, **når** porten
   dømmer, **så** kræves et menneske (Steven) uanset hvor grønt alt andet er.
   **Rettet 2/9 (S579):** kravet opfyldes af **Stevens godkendelse på netop
   det commit der dømmes** — og *så* bliver porten grøn. Før var den rød for
   evigt, også efter godkendelsen; Steven: *«Det giver jo ikke en mening at
   have en port der aldrig kan blive grøn.»* En port der er rød efter
   mennesket har gjort det den bad om, lærer folk at merge hen over rødt.
   **Negative kontroller, alle skal give SPÆRRET:** godkendelse på et ældre
   commit · godkendelse fra en konto der ikke står på listen (F4: allowliste,
   ikke «ligner et menneske») · godkendelse fra forfatteren selv · godkendt
   og derefter *ændringer krævet* · trukket tilbage · en rød check, uanset
   godkendelse. Listen over hvem der må låse op ligger på `main`
   (`scripts/porten-frigivelse.mjs`), så en PR ikke kan skrive sig selv ind.
4. **Givet** en ren dependabot-opdatering med grøn CI, **når** porten
   dømmer, **så** går den igennem uden yderligere — støj er også en fejl.
5. **Negativ kontrol:** en test-PR med en bevidst rød test kan IKKE merges
   af en agent. Verificeres én gang ved opsætning, med skærmbillede.
6. **Tid:** porten fælder sin dom inden 10 minutter efter sidste push —
   ellers er den flaskehals, ikke vagt.
7. **Steven-leddet:** Steven kan åbne en vilkårlig PR og se portens dom som
   én kommentar med grunde i klartekst — ikke jura, ikke JSON.

Uden for købet (kendt restrisiko, besluttes separat): porten bor i samme
repo som dem den dømmer; en PR kan foreslå ændringer af porten selv — den
klasse fanges af kriterium 3 (menneske på workflow-ændringer).
