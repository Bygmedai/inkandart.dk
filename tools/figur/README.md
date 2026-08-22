# Figur-pipeline — Ink & Art

Sådan laves en collage-figur. Fire trin, reproducerbart, ingen browser.

    export RECRAFT_KEY_FILE=/tmp/.recraft_key   # hentes fra Bitwarden, ALDRIG fra repo/chat

    # 1. tegn (raster, fuld stilkontrol)
    node rc.mjs gen --n 4 --style any --model recraftv4_1 --o /tmp/rose \
      --p "<KARAKTER-blok> <HÅNDVÆRK-blok>"

    # 2. se på dem. vælg én. det er hele trinnet.

    # 3. vektoriser — adskiller baggrunden som én flade
    curl -s -X POST https://external.api.recraft.ai/v1/images/vectorize \
      -H "Authorization: Bearer $(cat $RECRAFT_KEY_FILE)" \
      -F "file=@/tmp/rose-1.png" -F "response_format=url"

    # 4. efterbehandl: fjern baggrund, snap til husets palet, beskær, svgo
    python3 finish.py rose_raw.svg rose.svg          # --mono = uden rød

    # 5. eksportér som WebP i 2x visningsstørrelse (teksturen overlever ikke som SVG-vægt)

## Hvorfor prompten ser ud som den gør

Det der gik galt første gang: jeg bad om kategorien ("old-school tattoo flash
swallow") og fik kategorien tilbage — gennemsnittet af alle svaler på internettet.
Generisk. Den oprindelige svale havde personlighed, fordi Grok havde tegnet en
*bestemt* fugl.

Så prompten har to faste blokke:

**KARAKTER** — den her fugl, ikke en fugl. Kropsbygning, holdning, hvad den er
i gang med, hvad den føler. "Stocky and cocky, oversized blocky head, one small
high-set eye, leaning forward like it is late for something."

**HÅNDVÆRK** — konstant på tværs af hele sættet, så figurerne hører sammen:

> Hand-cut linocut print. Bone-white cut marks carved out of solid black,
> strongly varying line weight — heavy thick contour where the form turns away
> from the light, fine thin cuts where light strikes, dense parallel hatching and
> stipple for volume and depth, single light source from the upper left, visible
> gouge marks and hand-cut imperfection, gritty ink texture. Strictly three
> colours: near-black, warm bone white, deep blood red. No gradients, no glow,
> no drop shadow, no text, no frame. NOT a flat vector icon, NOT clip art, NOT cute.
> Plain flat dark background, centred, whole figure visible.

Varierende stregvægt + indre skravering + ét lys er hele forskellen på v05 og v06.
v05 var én flad flade og én 2,4px kontur hele vejen rundt på hver eneste figur —
det er dét der læses som amatør, ikke wobble-filteret.

## Palet (finish.py snapper alt hertil)

    sort     #17110e      ben      #b8ac97      ben-lys  #ddd2bf
    blod     #8b1e1e      messing  #d9a12a

## Priser (målt, ikke gættet)

| kald | credits |
|---|---|
| `gen --style any` (raster, recraftv4_1) | 35 pr. billede |
| `gen --style vector_illustration` | 80 pr. billede |
| `gen --style-id <trænet stil>` (recraftv3) | 80 pr. billede |
| `vectorize` | 10 |
| `removeBackground` | 10 |

## Blindgyder — så I ikke bruger credits på dem igen

- **Trænet stil (`create-style`) virker ikke til det her.** Stilen lærte
  "linocut-fugl" og gav siddende, naturalistiske fugle tilbage. Motivet vandt
  over positionen. Rasterprompt + vektorisering holder posen.
- **recraftv4_1 tager ikke substyles og ikke negative prompts.** Læg begrænsningerne
  i prompten som positive sætninger ("NOT clip art").
- **Egne stilarter er låst til recraftv3.** v4.1 + `style_id` = 400.
- **`removeBackground` på raster** beholder de kolde lyserøde toner og den neonrøde
  gore. Vejen over vektorisering + paletsnap giver husets varme ben-tone.
- **Lavere opløsning før vektorisering sparer intet** — vektorisatoren skalerer
  op til 2048 uanset hvad. 512px ind gav 510 kB ud, samme som 1024px.
