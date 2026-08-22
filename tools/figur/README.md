# Figur-pipeline — Ink & Art

Sådan laves en collage-figur. Fem trin, reproducerbart, ingen browser.

## Først: værktøjerne

Opskriften kunne ikke køres som den stod — `svgo` og `cairosvg` er ikke
installeret som standard, og installationen stod ingen steder (Villy, S569).

    pip install cairosvg pillow
    npm i -g svgo

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

    # 5. eksportér som WebP — 2x den STØRSTE størrelse figuren vises i
    ./export.py assets/figur/v06/rose.svg public/emerge/v06 --vist 470
    #   -> rose-940.webp  (filnavnet er pixelbredden, så reglen kan efterses)

## 2×-reglen — den er ikke kosmetik

Filen skal være **dobbelt så bred som den største størrelse figuren vises i**.
Ikke et rundt tal, ikke "cirka" — mål figuren på den levende side.

Hvorfor det står så skarpt: svalen blev eksporteret i 240px og vist i 240px,
altså 1×, mens rose og kranie lå på 2×. På en almindelig 2×-skærm blev svalen
skaleret dobbelt op ved siden af en v05-SVG der er knivskarp ved enhver
opløsning — og svalen var netop den figur der skulle bedømmes. En sammenligning
må ikke være skæv på grund af eksporten. Målt på den levende forside:

| figur | største visning | fil |
|---|---|---|
| rose | 470px | `rose-940.webp` |
| kranie | 340px | `skull-680.webp` |
| svale | 149px | `swallow-298.webp` |

`export.py` afviser desuden en SVG hvis hjørnerne ikke er gennemsigtige —
en uigennemsigtig baggrund bliver til en synlig kasse i collagen.

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


## Hvor stort figurerne faktisk vises (målt i browseren, S569)

Detaljen i et linoleumssnit skalerer med snittets størrelse. Det er ikke en
begrænsning ved Recraft, det er hvad et gouge kan: en 14px glød **er** et
massivt mærke i et rigtigt tryk. Så sættet har tre klasser, og de skal ikke
have samme behandling:

| klasse | målt bredde | figurer | behandling |
|---|---|---|---|
| bærer siden | 250–780px | ouroboros, røg, slange, maskine, rose, daggert, splat-rød, nål, splat-sort, skilt | fuld v06, flere runder |
| læselig | 100–250px | kranie, røg-blob, svale, flaske, ring, fuglemor | fuld v06 |
| grænsen | 70–99px | lampe, barbell, rotte, terning | v06, men prompt uden fin skravering |
| mærker | under 70px | kop, cigaret, gnist, dråber, glød | **bliv flade — bevidst valg** |
| rammeværk | 543–1618px | wire, skyline, kanter | rør dem ikke, det er papirets kant |

`spark.svg` er den mest brugte fil i sættet (18 kaldsteder) og renderes i 23px.
Skravering ved den størrelse bliver til mudder, ikke til volumen.

**Skift hele sættet på én gang.** Ni figurer i linoleumssnit ved siden af
toogtyve flade udklip læser som uafsluttet — værre end begge rene sæt.
