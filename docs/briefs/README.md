# Briefs — husets to vigtigste dokumenter

To roller, to briefs: **byggeren** og **dommeren**. De skal aldrig være
samme agent, og fra S569 aldrig samme leverandør: Vilde (Anthropic) bygger
og Grok (xAI) dømmer, eller omvendt. To firmaers modeller er naturligt i
konkurrence, og selv-præference er identitetsdrevet — en model der dømmer
sit eget hus' arbejde, er mildere. Rollerne byttes fra opgave til opgave.

## Reglerne for at skrive dem

Briefen giver agenten **det den ikke selv kan udlede** — og intet andet.

- **Kort.** Målt: kontekstfiler skrevet af en model gjorde agenter
  *dårligere* (−0,5 til −2 %) og kostede 20–23 % mere; menneskeskrevne
  hjalp ~4 %. Vercel komprimerede 40 KB til 8 KB og beholdt fuld effekt.
  En brief der vokser, virker mindre. Slet før du tilføjer.
- **Ingen titler, ingen persona-oppustning.** 162 personaer testet: at
  kalde en agent «ekspert» forbedrer ikke dens præstation — det får kun
  de andre til at bøje sig for den. Rollen beskriver arbejdet, ikke rang.
- **Ingen domme fra andre.** En påstået dom i konteksten vender en
  bedømmer i 66,5 % af tilfældene, før noget autoritetsstempel er sat på.
- **Ingen moral.** «Vær grundig» flytter intet. En kørt kommando gør.
- **Gentag ikke CLAUDE.md.** Den læses automatisk. Briefen er det der er
  særligt ved *denne* opgave.

Måler vi at en brief er blevet dyrere uden at blive bedre
(`scripts/fabriksmaal.mjs`), skæres den ned.
