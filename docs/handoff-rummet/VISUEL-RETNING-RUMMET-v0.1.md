# Visuel retning — Rummet: billederne frem, sortet ned, mærket op
**28.–29. august 2026 · Haruki, efter Stevens ordre.** Tillæg til `BESTILLING-CLAUDE-DESIGN-v2.md` og byggebriefen. Ændrer ikke arkitekturen, rum-navnene, tokens' farver eller ét-tal-reglen. Ændrer **vægtningen**: hvor meget plads billedet får, hvor stort mærket er, og hvor meget bar bund der må stå tilbage.

**Stevens ord (29/8):** *«Pt er det alt for sort. Logo skal også have en del anden prominent plads og det skal være meget større. Sørg for at billedmaterialet får en mere fremtrædende plads.»*

---

## 1 · Hvad der faktisk er galt — målt, ikke fornemmet

Målt på M2-previewet bygget lokalt (commit `cf4a2a5`), Chromium, første viewport 1440×900 og 390×844. «Nær-sort» = pixel under RGB 22,22,22.

| Flade | Nær-sort i første skærm (1440) | Billedareal i første skærm | Tom højremargin |
|---|---|---|---|
| **Mærket** | **81,8 %** | 23,7 % | 30 % |
| **Gaden** | **79,8 %** | 30,1 % | **55 %** |
| **Huset** | **78,0 %** | 29,3 % | — |
| Natten | 71,7 % | 30,1 % | 55 % |
| Stolen | 62,3 % | 37,0 % | 30 % |
| Huset · mobil 390 | 68,4 % | 48,2 % | — |
| Stolen · mobil 390 | 56,6 % | 44,5 % | — |

**Tre mekaniske årsager — ikke smagssager:**

1. **`max-width: 1100px`** på indholdssøjlen (`rummet.css` l. 486 og 633), mens nav'en er fuld bredde. På 1440 står 30 % af skærmen tom til højre; på 1920 er det 43 %. Øjet ser en side der er skubbet til venstre i et sort felt.
2. **`max-width: 560px`** på rum-slottet (l. 496, 711, 718). Gadens og Nattens ene billede kan aldrig blive større end 560 px uanset skærm → 55 % tom højremargin. Det er den værste enkeltlinje i filen.
3. **Artist-thumbs på Huset er 102×128 px** (`grid-template-columns: 104px 1fr`, l. 274/284). Husets mennesker — det eneste rigtige indhold vi har — vises som frimærker ved siden af en 558 px værk-plade.

**Og en fjerde, som beviser fotosporet:** Stolen er husets mindst sorte flade (62,3 %) **udelukkende fordi Emmas foto har lys baggrund**. Samme layout med to mørke fotos ville ligge på ~75 %. Lys i billedet gør mere for fladen end nogen CSS-ændring. Det skal med i Sonjas shoot-brief: **mindst ét lyst billede pr. rum.**

## 2 · Reglerne — det Grok skal bygge efter

**R1 · Rummet er fuld bredde.** Indholdssøjlen går fra `max-width: 1100px` til `min(100vw - 2×gutter, 1680px)` på galleri-flader (Huset, Stolen, Mærket, Natten, Gaden). Brødtekst og lister beholder deres læsebredde (`46ch`/`68ch`) **inde i** den brede flade — det er kun billedgitrene og heroen der får den fulde bredde. Politiksider (aftercare, privatliv, betingelser) er uændret.

**R2 · `max-width: 560px` på rum-slottet slettes.** Et rums hovedbillede er **full-bleed**: fra kant til kant vandret, mindst 62 svh højt. Rumnavnet må ligge oven i billedet (Anton, hud, med skygge/gradient hvor der er brug for læsbarhed) i stedet for over et tomt felt. Gælder Gaden og Natten i M3 og gælder deres M2-stubs nu.

**R3 · Ét billede pr. rum rører viewportens kanter.** Ingen flade må åbne med en ramme der flyder i sort. Huset: værk-pladen bliver husets hero. Stolen: artistgitteret starter højere og fylder bredden. Mærket: Væggens første række er bred nok til at fylde skærmen.

**R4 · Mennesker vises stort.** Artist-thumbs på Huset går fra 104 px til **mindst 220 px** i den brede kolonne (kort med billede over navn, ikke liste med frimærke). På Stolen: 3 kort pr. række fra 1200 px, hvert billede fylder sin kolonne.

**R5 · Væggen fylder skærmen.** Mærkets værk-gitter: 2 kolonner < 700 px · 3 kolonner 700–1200 · **4 kolonner over 1200 px**, hvert billede i fuld kolonnebredde (i dag: 286 px i en 1100 px-søjle).

**R6 · Sort-loftet er en målbar port, ikke en smagsdom.** **Højst 60 % nær-sort i første viewport ved 1440×900, og højst 62 % ved 390×844** — målt med samme metode som §1 (pixel under RGB 22,22,22, første skærm, DEMO-fotos indsat). Jeg kører målingen; du behøver ikke bygge værktøjet. Fladen er ikke færdig før den er under loftet.

**R7 · Én bund.** `app/globals.css` sætter `--void: #0a0a0a`, `rummet.css` sætter `--nat/--void: #070707`. Body rendrer i dag **#0a0a0a**, ikke den ratificerede nat. Ret globals' void til `#070707` (eller scope Rummets bund så den vinder på body). Én sort, ikke to.

## 3 · Mærket — logoet

Seglet findes i nav'en i dag som **28×28 px** ved siden af en 21 px wordmark. Det er et anker, ikke et mærke. Stevens ordre er at det skal være **meget større og et andet, mere fremtrædende sted**. Byg:

**M1 · Nav'en:** seglet 28 → **44 px** (matcher tap-målet der allerede står i CSS'en), wordmark 21 → **26 px**, uændret placering. Det er hygiejne, ikke løsningen.

**M2 · Husets masthead — det egentlige greb:** seglet som **grafisk element øverst på Huset**, 180–260 px, over eller ved siden af værk-pladen, i hud på nat. Ikke et ikon i et hjørne: husets mærke, i den størrelse en tatovør ville sætte sit eget. Det er det første en fremmed ser, og det er dét Steven mangler.

**M3 · Ét navn.** Fladen bruger i dag tre skrivemåder: «Ink and Art» (nav), «Ink and Art Cph» (footer), «Ink & Art Copenhagen» (title + seglets alt-tekst). Vælg **én** familie og skriv den samme alle steder. Mit forslag: **«Ink & Art»** kort, **«Ink & Art Copenhagen»** langt (title, OG, seglets alt), **«Ink and Art Cph ApS»** kun i footerens juridiske linje.

*Præcis størrelse og placering på M2-masthead'en er Claudias finish; reglen — stort, øverst, husets mærke — er Stevens og står fast.*

## 4 · Det der ikke ændrer sig

Rum-navnene (Stolen · Mærket · Natten · Gaden). Ét-tal-reglen og `[TAL BEKRÆFTES]`. De ærlige tom-tilstande og deres ordlyd. Blackbook-døren der aldrig forsvinder. Radius 0. Strobe kun på nat-flader. Ingen opdigtede navne, tal eller tider. DEMO-mærkning indtil husets egne fotos er inde. Anton + Instrument Sans.

## 5 · Konsekvens for fotosporet (Sonja)

Shoot-listens slot-id'er er uændrede — men billederne skal nu bære mere flade, så tre krav lægges til briefen: **(a)** mindst ét lyst billede pr. rum (beviset står i §1) · **(b)** hero-slots skydes liggende **og** stående, så de kan bruges full-bleed på både mobil og desktop · **(c)** motivet skal tåle beskæring i 4:5 og 16:9 uden at miste sit emne.

---
*Målemetode, så den kan gentages: repoet bygget lokalt (`npm ci && npm run build && next start`), Chromium via Playwright, fuld-side- og fold-screenshots ved 1440×900 og 390×844, nær-sort talt pixelvis. Script og screenshots ligger i sessionens arbejdsmappe.*
