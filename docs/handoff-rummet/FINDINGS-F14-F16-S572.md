# Findings — F14–F16 (Haruki, 29. august 2026)

Målt på `rummet-m2` @ `ec3f21e`, egen build kørt lokalt (`next build` + `next start`),
Playwright/Chromium, viewports 1440×900 og 390×844. Build ren. **177/177 tests grønne.**

**Rettelse til min egen forrige måling:** den kørte mod en `.next` fra før F14 blev
hentet ned. `/booking` svarede `data-tone="nat"` mens kilden sagde `salg` — tallene
var altså en stale build, ikke en regression. De er kasseret. Alt herunder er målt
på en genbygget server, hvor hver rute er verificeret til at levere sin egen tone.

---

## 1 · Gate-tal pr. flade (første viewport)

Nær-sort = RGB-sum < 66. Lys = RGB-sum > 500. Loft 60 % ved 1440, 62 % ved 390.
Salgsflader måles på lys-andel, gulv 60 %.

| Flade | vp | nær-sort | lys | middel | dom |
|---|---|---|---|---|---|
| huset | 1440 | 44,3 % | 14,2 % | 76,4 | **GRØN** |
| huset | 390 | 41,5 % | 16,7 % | 86,4 | **GRØN** |
| stolen | 1440 | 63,4 % | 8,9 % | 45,8 | RØD (+3,4) |
| stolen | 390 | 53,3 % | 18,5 % | 72,1 | **GRØN** |
| maerket | 1440 | 18,1 % | **63,0 %** | 155,6 | **GRØN** |
| maerket | 390 | 24,1 % | **63,9 %** | 150,2 | **GRØN** |
| booking | 1440 | 11,4 % | **60,7 %** | 163,3 | **GRØN** (1,4 over gulv) |
| booking | 390 | 15,1 % | **49,1 %** | 146,7 | RØD |
| natten | 1440 | 51,6 % | 1,6 % | 38,9 | **GRØN** |
| natten | 390 | 79,0 % | 3,2 % | 25,2 | RØD (+17) |
| gaden | 1440 | 53,7 % | 1,6 % | 35,2 | **GRØN** |
| gaden | 390 | 80,0 % | 3,0 % | 23,0 | RØD (+18) |

**F14–F16 virker.** Mærket og Booking står på hud på begge viewports; Huset og Stolen
har fået lyse slots. Det er de fire røde herunder der står tilbage.

---

## 2 · Blokkere

**B1 · `/booking` har ingen overskrift overhovedet.**
Målt: `h1` = 0, og hele overskriftslisten er tom (`h1,h2,h3` → `[]`) på begge
viewports. Alle andre rum har deres `<h1 class="rum-room__title rum-poster">`.
Det er husets pengeside: en fremmed lander på en rød depositum-linje og en lille
tekstlink uden at få at vide hvor han er. Skærmlæser får ingen indgang til siden.
**Fix:** `<h1 className="rum-room__title rum-poster">Booking</h1>` øverst i `main`,
som på Stolen/Mærket/Natten/Gaden.

**B2 · Forsiden (`/`) har ingen `h1`.**
Målt: `h1` = 0; første overskrift er `H2: Nizar Saad`. Forsiden for en lokal
forretning uden `h1` er både et brud på overskriftshierarkiet (a11y) og en målbar
SEO-svaghed — `<title>` bærer i dag alene. `Nylavet` er en `<p class="rum-label">`,
ikke en overskrift.
**Fix:** giv Huset en `h1`. Den må gerne være visuelt diskret (fx seglet/wordmarken
i `.rum-huset__maerke` som `h1`, eller en `h1` med husets navn), men den skal
findes i træet. Foreslå ordlyden — jeg godkender copy.

**B3 · `.rum-label` måler 2,7:1 på hud. AA kræver 4,5.**
Målt: farve `rgb(138,133,128)` (`--beton` #8a8580) på `.rum-main`-baggrund
`rgb(232,220,200)` (hud), 12 px, vægt 400 → **2,7:1**. Rammer «**Hylden**» og
«**Væggen**» på `/maerket` — præcis de to labels M2-briefen gjorde til shoppens
afkodning for en fremmed. Rammer begge viewports.
**Årsag:** `[data-tone="salg"]` rebinder `--rum-line` og `--text`, men ikke
`--beton`. Beton er tegnet til nat (#8a8580 på #070707 = 5,51:1 — fint) og følger
med over på hud uden at blive vendt.
**Fix:** bind beton i samme blok. `#5f5a54` måler **5,04:1** på hud og holder
stadig hierarkiet under den sorte brødtekst (14,87:1). Værdien er målt, ikke valgt
efter øjemål — brug den eller mål din egen.

**B4 · Gavekort-tallene står nøgne på salgsfladen.**
`GavekortKoeb` viser `500 · 1.000 · 2.000` med `aria-label="Gavekort … kr"` per
link, men **ingen synlig label**. En seende fremmed ser tre tal placeret under den
tomme hylde («Vi laver ikke varer uden værk.») og over værk-væggen — de læses som
priser på værkerne nedenunder. Skærmlæseren er dækket; øjet er ikke.
Kanon K7 siger et tal kun må stå hvis kunden kan betale det i samme øjeblik. Det
kan han her — men reglens formål er at et tal aldrig må være tvetydigt.
**Fix:** synlig `Gavekort`-label over rækken, samme `rum-label`-rolle som «Hylden»
og «Væggen» (og altså med B3's farve).

---

## 3 · Fejl der ikke er blokkere, men skal med i denne runde

**F1 · Mobil-loftet på Natten og Gaden brydes af layout, ikke af foto.**
Det er en rettelse af min egen tidligere dom. Målt billeddækning i folden:

| flade | 1440 | 390 |
|---|---|---|
| natten | 63,5 % | **20,7 %** |
| gaden | 63,5 % | **20,7 %** |

På desktop er de ~63 % foto — den sorthed er fotografisk og består med rette.
På mobil er kun 20,7 % foto, mens 79–80 % er nær-sort. Resten er bar baggrund.
**Årsag:** `.rum-room__slot { aspect-ratio: 16 / 9 }` har ingen mobil-override.
Ved 390 bliver rumfotoet en 342×192 strimmel, mens `.rum-plade__frame` overalt
ellers står på 4/5. Fotoet bærer folden på desktop og forsvinder på mobil.
**Fix:** giv `.rum-room__slot` 4/5 (eller 1/1) under mobil-breakpointet, samme
mønster som `.rum-plade__frame` allerede bruger. Regnet på 390 flytter 4/5 ~236 px
foto ind i folden ≈ 24 point — det bringer begge under loftet. Jeg måler efter.

**F2 · `/booking` ved 390 falder under lys-gulvet (49,1 % mod 60).**
Siden **står** korrekt på hud — det er ikke tonen der er gal. Lys-andelen trækkes
ned af sort nav-bånd foroven, sort dock forneden og et foto hvis motiv er en sort
stol. Ved 1440 måler samme side 60,7 %.
**Anbefaling:** dette er et mål-artefakt så længe siden ellers er tom (se F3).
Løs F3 først, så måler jeg igen før jeg kalder det rødt.

**F3 · `/booking` har omvendt handlingshierarki og en tom venstrespalte.**
Depositum-linket er rødt og stort; «Videre til booking» — sidens egentlige
hovedhandling — er en lille tekstlink under det. Venstre spalte er ~750 px høj og
rummer ~120 px indhold; resten er tom hud. Sammen med B1 betyder det, at pengesiden
hverken har en titel eller en tydelig knap.
**Fix:** hovedhandlingen skal være den visuelt tungeste; depositum-linjen er
konteksten under den, ikke over. Og luk hullet — spalten skal ikke reservere højde
den ikke bruger.

**F4 · Tap-mål under 44 px på husets telefonnummer.**
`/gaden`: `Ring på — 55 24 86 08`, `href="tel:+4555248608"`, målt **161×20 px**,
`display: inline`, `padding: 0`. Det er den ene handling en kunde bruger når han
står i gaden og ikke kan finde døren. Kanon K9 og a11y-gulvet siger ≥ 44 px.
**Fix:** `display: inline-block` + lodret padding, eller samme `rum-book--row`
-behandling som de andre handlinger.

**F5 · Copy-gentagelse på `/gaden`.**
«Ring på — 55 24 86 08» og to linjer senere «Tatovering og piercing. Ring på.»
Samme opfordring to gange på fem linjer. Den nederste kan undværes eller
omformuleres — spørg mig, digt ikke.

---

## 4 · Verificeret OK

- Tone pr. rute rendres som kilden siger: `/maerket` og `/booking` = `salg`,
  øvrige = `nat`. Ingen arv, ingen scatter.
- Alle seks ruter svarer 200. Build ren. 177/177 tests grønne.
- Ingen kontrastfejl fundet på nat-fladerne (0 fund på huset, stolen, natten, gaden).
- Ingen opdigtede tal. Depositum 100 kr og gavekort 500/1.000/2.000 er alle
  beløb kunden kan betale i samme øjeblik — kanon K7 overholdt.
- Seglet står i nav'en på alle rum; Blackbook-døren findes på alle sider.
- `/maerket` løser M2-kravet: en fremmed ser inden for første viewport at det er
  her man køber — Hylden, gavekort, Væggen og værkerne er alle i folden.

---

## 5 · To ændringer i `ec3f21e` der ikke var briefet — de er Stevens kald

De er ikke fejl, og jeg beder ikke om at få dem rullet tilbage. De ændrer kanon,
og kanon ændres af Steven. Jeg har sendt dem til ham parallelt med denne
kommentar. **Byg videre imens** — jeg melder tilbage her når han har svaret.

1. **Blackbook gik fra telefon til email**, og den kanon-låste linje
   «Vi sender kun natten. Afmeld med STOP.» blev forkortet til «Vi sender kun
   natten.» Forkortelsen er efter min vurdering *rigtig* — «STOP» lover en
   SMS-mekanik huset ikke har når kanalen er email. Men linjen var låst, og
   `/api/subscribe` tager stadig både `email` og `phone`, så døren er ikke brudt.
2. **DEMO-chippen er væk**, erstattet af beskrivende `billedtekst`. K5(b)'s formål
   holder — ingen genereret plade krediteres en navngiven artist, fordi
   `Plade.tsx` kun viser artisten når `titel` er sat, og ingen af dem er det.
   Men markøren der fortalte kunden at billedet ikke er et rigtigt husværk, er
   væk. Det er den del Steven skal tage stilling til.
