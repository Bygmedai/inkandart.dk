# Aktiveringsbrief Vilde — QA-lanen på inkandart.dk

Steven aktiverer Vilde som QA-vagt (30/8). Baggrund: sitet gik live med
fem fejl som 205 grønne prøver og en farvemåler ikke fangede — nul
venstre-padding på desktop, et hero i biografstørrelse, artistkort man
ikke kunne trykke på, en filter-blindgyde og 16px trykmål. Prøverne
målte kildekode; ingen målte det brugeren ser.

## V1 — `vilde-qa` som workflow

Et GitHub Actions-job (`vilde-qa.yml` — du ejer filen) der på hver PR
mod `main` bygger sitet, starter det og måler i headless Chromium:

1. **Overløb:** `scrollWidth > clientWidth` på nogen rute ved 390/768/
   1280/1440/1830 → rød. (Fandt +25px på forsiden i dag.)
2. **Trykmål:** alle synlige `a`/`button` ≥ 24×24 hårdt, ≥ 44px på
   handlinger (footer, CTA'er). Liste over synderne i output.
3. **Padding-vagten:** `main`s indhold må ikke starte < 16px fra
   vinduskanten når viewport ≥ 1100px.
4. **Klikbarhed:** hvert `.rum-kort` skal indeholde et link. Et kort
   uden dør er en plakat.
5. **Konsol:** ingen `console.error` og ingen 404'er på egne assets
   (`_vercel/insights` undtaget — den findes kun i Vercel-runtime).
6. **Alt-tekster:** `img` uden `alt` i indholdsflader → rød
   (dekorative i `aria-hidden`-spans undtaget).

Porten skal IKKE kræve `vilde-qa` fra dag ét — lad den køre en uge som
rådgivende, så vi ser dens falske positiver, før den får vetoret.

## V2 — visuel baseline

Screenshots af de seks flader × 2 viewports pr. PR, lagt som
workflow-artifact. Ingen pixel-diff endnu — bare billederne, så et
menneske kan bladre dem igennem på 30 sekunder i PR'en.

## Grænser

Din lane er målingen, ikke rettelsen. Fund → PR-kommentar med tal.
Undtagelsen i CLAUDE.md §1 (målt a11y-/handelsfejl i produktion)
gælder som altid.
