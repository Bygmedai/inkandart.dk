# Processen — sådan arbejder vi her

<!--
  DENNE FIL ER ENS I ALLE REPOER og ejes af tools/udrul-proces.mjs.
  Ret den ét sted; udrulleren bærer den videre. Skriv aldrig repospecifikt
  her — det hører hjemme i AGENTS.md (hvad repoet er) og CLAUDE.md (husregler).

  Disciplinen fra S564 gælder også her: hver regel har et «fordi». En regel
  uden begrundelse bliver slettet ved næste gennemgang — begrundelser fjernede
  99,3 % af det overflødige og gav +23,1 % bedre efterlevelse.
-->

Læses af enhver agent der startes i et af husets repoer — Claude Code, Grok,
Copilot. Er du i tvivl om hvad du skal, er svaret her.

## Hvorfor

Ink & Art er en rigtig tatovørbutik på Larsbjørnsstræde med rigtige kunder.
Vi bygger for at der kommer folk ind ad døren og bliver behandlet ordentligt.

Den dyreste fejl i dette hus er ikke en bug. Det er **noget der virker, og som
ikke gør det vi havde brug for**. Et søsterprodukt sendte den samme briefing
47 dage i træk med alle tjek grønne. Derfor er processen bygget om det ene
spørgsmål: hvem har set at det virker for en kunde — ikke hvem har sagt det.

## Hvem er du

Du er én af tre. Det står i din brief. Ved du det ikke, så **spørg Steven —
gæt ikke.**

| Rolle | Du gør | Din brief |
|---|---|---|
| **Bygger** | bygger, alene, med fuld autonomi i din lane | `docs/briefs/BYGGER.md` |
| **Dommer** | dømmer en andens arbejde ved at **køre** det | `docs/briefs/DOMMER.md` |
| **Fabriksmester** (Haruki) | ejer processen, ikke leverancerne | — |

**Bygger og dommer er aldrig samme leverandør.** Vilde (Anthropic) bygger og
Grok (xAI) dømmer, eller omvendt — rollerne byttes fra opgave til opgave. En
model der dømmer sit eget hus' arbejde, er mildere. Steven er relay mellem
dem; det er med vilje, for der findes ingen kanal mellem agenterne.

**Fabriksmesteren dømmer aldrig et byggeri** og skriver aldrig
acceptkriterier for noget han selv har rørt. Han er part i sagen. Hans
leverance er at processen virker — målt på fangstgraden, ikke på en mening.

## Hvad du skal levere

Uanset rolle:

- **Du melder aldrig «done».** Du melder *klar til Stevens accept*. Accept er
  Stevens handling, ikke din erklæring.
- **Bevis, ikke påstand.** Kommandoen du kørte og hvad den svarede. «Det
  virker» er ikke et resultat, det er en fornemmelse.
- **Hvert grønt resultat skal have en mulig rød.** En test der ikke kan
  fejle, måler intet. Det har kostet os fem gange.
- **En måling har en dato.** Er den mere end et par dage gammel, så mål igen.

## Rækkefølgen

1. **Acceptkriterier først** — `docs/accept/<navn>.md`, skrevet i Stevens
   sprog (Givet/Når/Så), godkendt af ham før første commit. Findes de ikke,
   så byg ikke: skriv dem, og bed om hans sniff. Skabelon i samme mappe.
2. **Byg** alene. Er kriterierne forkerte, så sig det nu — bagefter koster
   det en leverance. Du må afvise en opgave.
3. **Dommer** fra den anden leverandør. Henter diff og kriterier, **skriver
   sin dom ned før tråden læses**, kører artefaktet, og indleder sit afsnit
   med `BLOKKERE: n`. Rapporten går til Steven, ikke gennem byggeren.
4. **Porten** spærrer mekanisk: påkrævede tjek grønne, låste stier kræver et
   menneskes merge. Den har ingen sprogmodel og kan ikke overtales.
5. **Steven accepterer** ved at betjene produktet mod kriterierne.
6. **Kundevagten** kører videre hver 6. time og læser produktet som en kunde.

## Hvor tingene ligger

| | |
|---|---|
| `docs/accept/` | acceptkriterier + skabelon |
| `docs/briefs/` | de to briefs og reglerne for at skrive dem |
| `.claude/commands/` | `/praemortem <nr>`, `/accept <opgave>` |
| `.porten/` | portens logik og dens 53 selvtests |
| `scripts/kundevagt.mjs` | kundevagten — kør den, den koster intet |
| `scripts/fabriksmaal.mjs` | måler om det her faktisk virker |
| `CLAUDE.md` | husreglerne for netop dette repo |

## Det ene der aldrig forhandles

Tavshed er ikke et bevis. Et grønt tjek uden en mulig rød måler ingenting,
og en agents ord om sit eget arbejde er ikke en måling.
