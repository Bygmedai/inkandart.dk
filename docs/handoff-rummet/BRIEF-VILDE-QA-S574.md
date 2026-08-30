# Aktiveringsbrief Vilde — QA-vagten på inkandart.dk

Steven aktiverer dig som QA-vagt (30/8).

## Orientér dig FØRST — byg intet før du har læst

Rækkefølgen er en del af opgaven. Sitet gik live i dag med fem fejl
som 205 grønne prøver ikke fangede, og din værdi står og falder med
at du forstår HVORFOR de slap igennem, før du bygger nye vagter.

1. `CLAUDE.md` — lanes, grænser og undtagelsen for målte fejl i
   produktion. Din lane er målingen, ikke rettelsen.
2. `docs/PROCES.md` — accept, dommer/bygger-adskillelse, Porten.
3. PR #212 — dagens fem fund og rettelserne. Læs PR-teksten og
   diffen; det er din baseline for hvad der skal fanges.
4. `docs/handoff-rummet/UDRULNING-31-08.md` — hvordan huset måler
   (porte, viewports, `<main>`-reglen).
5. `docs/handoff-rummet/BRIEF-GROK-S574.md` — hvad Grok bygger i
   samme uge, så du ved hvad der flytter sig under dig.
6. Kør sitet lokalt (`npm ci && npm run build && npx next start`) og
   klik selv de seks flader igennem på 390 og 1440, før du skriver
   en linje. Du skal have SET fejlklassen for at kunne måle den.

## Derefter: `vilde-qa` som workflow

Et Actions-job (`.github/workflows/vilde-qa.yml` — din fil) der på
hver PR mod `main` bygger sitet, starter det og måler i headless
Chromium. Hjælpescripts i `scripts/qa/` — også dine.

1. **Overløb:** `scrollWidth > clientWidth` på nogen rute ved
   390/768/1280/1440/1830 → rød. (Fandt +25px på forsiden i dag.)
2. **Trykmål:** synlige `a`/`button` ≥ 24×24 hårdt; handlinger
   (footer, CTA'er) ≥ 44px. Navngiv synderne i output.
3. **Padding-vagt:** `main`s indhold starter aldrig < 16px fra
   vindueskanten ved ≥ 1100px.
4. **Klikbarhed:** hvert `.rum-kort` indeholder et link — et kort
   uden dør er en plakat.
5. **Konsol:** ingen `console.error`, ingen 404 på egne assets
   (`_vercel/insights` undtaget — den findes kun hos Vercel).
6. **Alt-tekster:** `img` uden `alt` i indholdsflader → rød
   (dekorative i `aria-hidden` undtaget).
7. **Visuel baseline:** screenshots af de seks flader × 390/1440
   som workflow-artifact. Ingen pixel-diff — bare billederne, så et
   menneske kan bladre dem på 30 sekunder.

Rådgivende den første uge — Porten skal IKKE kræve `vilde-qa` før vi
har set dens falske positiver. OBS: `.github/workflows/` er en låst
sti, så din PR skal håndmerges af Steven. Det er porten der virker,
ikke en fejl.

## Hvad du IKKE rører

`app/**`, `components/**`, `content/**`, `lib/**`. Finder du en fejl
dér, er leverancen en PR-kommentar med tal — undtagelsen i CLAUDE.md
§1 gælder kun målte handels-/a11y-fejl i PRODUKTION, og selv da kun
farve, trykfelt eller placering.

## Basen

Byg på `main` efter #212. Dine filer (`vilde-qa.yml`, `scripts/qa/`)
findes ikke i forvejen, så du kolliderer ikke med Grok — han er i
`lib/storefront.ts` og Mærket, og han må omvendt ikke røre dine.
