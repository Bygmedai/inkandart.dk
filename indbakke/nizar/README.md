# Indbakke — Nizars nye billeder

**Læg filerne her.** På GitHub: åbn denne mappe på grenen
`claude/villy-nizar-billeder` → **Add file → Upload files** → træk billederne
ind → **Commit changes** (direkte på grenen, ikke en ny gren).

Filnavne, størrelse og format er ligegyldige — «WhatsApp Image … (1).jpeg»
er fint. Jeg omdøber dem til husets navne bagefter.

## Hvad der sker bagefter (Villy)

1. Jeg ser hvert billede igennem og skriver en liste i PR'en: hvad det
   viser, og hvor jeg foreslår det skal hen.
2. **Du svarer på det jeg ikke må gætte:**
   - Er det **Nizars arbejde**, eller er det **ham selv**?
     (Et menneskes identitet afgøres ikke af en billedsammenligning.)
   - Er der en **kundes ansigt** på? Så skal kunden have sagt ja.
   - Er motivet **hans eget design** (flash), eller kundens forlæg?
3. Jeg gør dem web-klare (maks. 1600 px, ~100–300 kB), giver dem husets navne
   (`public/slots/V-xx.jpg` for værker, `S-xx.jpg` for billeder af ham) og
   lægger dem ind i `content/vaerker.yml` med billedtekst: motiv + teknik,
   aldrig en titel.
4. Mappen her tømmes i samme PR. Prøven `tests/indbakke.test.mjs` er rød, så
   længe der ligger et billede her — så kan PR'en ikke merges, før alt er
   gennemgået.

Nizars galleri på hans side er fuldt (portræt + fire, loftet er fem). Nye
billeder af hans **arbejde** kommer på væggen og hans side som værker; nye
billeder af **ham selv** kræver at vi vælger hvilke der skal ud.

Appen henter værkerne fra sitet (`/api/huset`), så det der lander her,
kommer også i appen — uden en ekstra PR.
