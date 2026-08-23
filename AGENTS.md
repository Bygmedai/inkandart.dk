# AGENTS.md

<!-- Standarden Codex, Jules, Copilot, Cursor, Amp og Claude alle læser.
     Vercel Agent læser den FØRST når den anmelder.
     Hver regel har et «fordi». En regel uden begrundelse slettes. -->

## Hvad dette er

Forsiden og hub'en for Ink & Art Copenhagen — tatovørbutik på Larsbjørnsstræde.
Next.js 15, App Router, statisk hvor det kan lade sig gøre. Handel ligger hos
Shopify; dette repo rører aldrig penge.

## Kommandoer

```bash
npm ci
npm test            # 113 tests, node:test
npm run build       # alle ruter skal blive ved med at være statiske
node scripts/kundevagt.mjs   # læser produktet som en kunde, med negative kontroller
```

## Processen

**Læs `docs/PROCES.md` før du gør noget.** Den fortæller hvilken rolle du har
(bygger, dommer, fabriksmester), hvad du skal levere, og i hvilken rækkefølge.
Den er ens i alle husets repoer.

Kort: ingen melder «done» — man melder *klar til Stevens accept*.
Acceptkriterier skrives før der bygges. Bygger og dommer er aldrig samme
leverandør. Bevis frem for påstand, og hvert grønt resultat skal have en
mulig rød.

## Husreglerne

`CLAUDE.md` — lanes, hvem ejer hvad, og de fælder vi allerede er faldet i.
