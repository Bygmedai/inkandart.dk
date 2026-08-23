# Accept: røgprøve — går Porten ægte grøn?

Status: **UDKAST** · Formål: én måling, ikke en leverance.

Det vi køber: svaret på det ene spørgsmål der har blokeret hele udrulningen —
**kan Porten sige ÅBEN på en rigtig PR?** Den har aldrig gjort det. Hver
grøn kørsel til dato var triviel: udløst af `check_suite` på `main`, hvor
der ikke er nogen PR at dømme, så den returnerer uden at fejle.

1. **Givet** denne PR (én linje i en dokumentfil, ingen kode, ingen låst sti),
   **når** CI og hemmelighedsscanningen er færdige, **så** skriver Porten
   ÅBEN i sin kvittering — ikke SPÆRRET.
2. **Givet** at Vercel Agent Review nu er slået til på forbrugsbetaling,
   **når** den kører på denne PR, **så** afgiver den en brugbar dom —
   ikke «Review skipped — insufficient Credit».
3. **Negativ kontrol:** dommen skal aflæses i **loggen**, ikke på farven.
   Et grønt Porten-run der siger «Ingen åben PR knyttet til hændelsen»
   tæller ikke. Det er præcis den fejl der næsten fik mig til at gøre
   Porten påkrævet på fire repoer.

Går 1 og 2 igennem: Porten sættes som påkrævet check, ét repo ad gangen.
Fejler 2: vi bygger vores egen udførende anmelder — kørt build og testsuite
der skriver `<!-- porten-alvor -->` — og bliver uafhængige af leverandørens
prismodel.
