# Sættet — hvilke figurer skal gennem v06, og hvad de skal hedde i prompten

Skrevet efter et kontaktark af de 17 kandidater (Villy, S569). Tallene er
målt i browseren på den levende forside; beskrivelserne er af de figurer der
**faktisk findes**, ikke af hvad kategorien plejer at se ud som — det var
netop den fejl der gjorde Harukis første svale generisk.

Kør hver figur som: `KARAKTER-blok` + `HÅNDVÆRK-blok` (uændret fra README.md).

---

## Klar til at køre — de seks der giver mest

| # | figur | målt | hvorfor |
|---|---|---|---|
| 1 | `smoke` | **755px** | Er i dag en grå ellipse. Næststørste element på siden. Største kvalitetshul overhovedet — og røg er dét linoleumssnit gør bedst. |
| 2 | `ouroboros` | **781px** | Største figur. I dag en segmenteret ring der ikke helt bider sig selv. |
| 3 | `snake` | 532px | Flad stribet slange, lille rød tunge. |
| 4 | `machine` | 509px | Tatoveringsmaskinen, skematisk. Læses OK, men fortjener stål og vægt. |
| 5 | `dagger` | 470px | Daggert med én bloddråbe. Symmetrisk og livløs. |
| 6 | `needle` | 329px | Nålepatron. Meget tynd — skal have vægt uden at blive tyk. |

### KARAKTER-blokke

**smoke** — `A slow curl of cigarette smoke rising and folding back on itself, thicker and heavier at the bottom where it leaves the source, thinning and tearing apart at the top, one lazy S-curve, not a cloud and not a puff.`

**ouroboros** — `A thick old snake curled into a closed ring, actually biting its own tail — jaw locked, not merely touching. Heavy overlapping scales, blunt broad head, one flat unblinking eye. Weary rather than menacing, like it has been doing this a very long time.`

**snake** — `A lean snake mid-slither in a loose S, head raised and turned toward the viewer, forked tongue out, belly plates catching the light while the back stays dark. Alert and about to move, not coiled and not posed.`

**machine** — `A coil tattoo machine seen from the side, brass frame and two wound coils, armature bar and tube, one bead of ink at the needle tip. Solid and heavy, a tool that has been used — not a diagram.`

**dagger** — `A short heavy dagger point-down, wide fuller down the blade, wrapped grip, plain crossguard slightly asymmetric as if hand-forged. One drop of blood gathering at the tip. Blunt and honest, not ornamental.`

**needle** — `A tattoo needle grouping, bar and soldered pins, seen at a slight angle so the tips read as separate. Thin object, but with real weight in the bar. Precise, surgical, clean.`

---

## Køres som ét eksperiment først — teksturerne

`splat-red` (343px), `splat-black` (268px), `smoke-blob` (222px) er ikke
figurer, de er atmosfære. Linoleumssnit kan gøre dem meget bedre eller gøre
dem beskidte. **Kør én af dem, se på den, beslut så om de andre to følger.**

**splat-black** — `A splash of spilled ink caught mid-spread, one heavy irregular body with a ragged torn edge and a few satellite droplets thrown clear. Wet and accidental, never a symmetrical blob.`

---

## Rør dem ikke

| figur | hvorfor |
|---|---|
| `sign` (267px) | **Indeholder læsbar tekst** — «LARSBJØRNSSTRÆDE · PISSERENDEN». HÅNDVÆRK-blokken siger `no text`, og en regenerering ville ødelægge gadenavnet. Skiltet er stedet, ikke en figur. |
| `bird-mor` (100px) | **Groks Fuglemor.** Hans lane, hans figur, hans MOR-hjerte. Spørg ham først. |
| `hoop` · `barbell` · `dice` | Geometriske genstande. En ring er en ring; skravering gør dem grumsede frem for rigere. |
| `wire` · `skyline` · `edge-*` | Rammeværk, ikke figurer. Det er papirets kant. |
| `spark` · `ember` · `drop-*` · `cup` · `cigarette` | Under 70px. Se 2×-reglen og klassetabellen i README.md — de skal blive flade. |

## Måske, hvis de seks lykkes

`rat` (76px) og `bottle` (117px) og `lamp` (94px) ligger på grænsen. `rat` er
den svageste figur i hele sættet — men den vises i 76px, hvor gevinsten er
lille. Tag den kun med hvis den skal vokse.

---

## Rækkefølge

1. Kør **smoke** først, alene, fire udkast. Det er den største gevinst og den
   bedste test af om HÅNDVÆRK-blokken holder på noget der ikke er et dyr.
2. Er den god: kør de fem andre, fire udkast hver.
3. Kør **splat-black** som teksturprøve.
4. `finish.py` → `export.py --vist <målt tal fra tabellen>` på hver.
5. **Skift hele sættet på én gang.** Halvt ombyttet læser som uafsluttet.

Budget ved fire udkast: 150 credits pr. figur. Syv figurer ≈ 1.050 af 4.250.
