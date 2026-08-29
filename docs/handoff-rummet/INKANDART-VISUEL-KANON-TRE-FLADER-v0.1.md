# Husets visuelle kanon — tre flader, ét system
**v0.4 · 29. august 2026 · Haruki. Ratificeret af Steven 29/8 (interim-billedreglen i K5, prisreglen i K7, billedtekst-afløseren i K5(b) og email-afmeldingen i K8).**
**Stevens kendelse 29/8:** *«Webshop og app skal bygges helt om. Det nye design trumfer det gamle. Sørg for at vi får den rette visuelle stil på tværs, uden at de tre skal ligne hinanden 1:1.»*

Dette dokument afløser `inkandart-webshop/DESIGN-GUIDE.md` og `INKANDART-DESIGN-MANUAL-AND-SPEC.md` som farve- og formkilde. De gamle guider **pensioneres, ikke opdateres** — de bar Emerge-designet, og Emerge er død. Rummet er husets sprog nu, på alle tre flader.

---

## 1 · Princippet, i én sætning

**Baggrunden følger opgaven, ikke platformen.**

Alt hvor huset *fortæller* — rum, artister, nætter, gaden, brand — står på **nat**.
Alt hvor huset *sælger* — værk med pris, hylde, kurv, checkout — står på **hud-lys**.

Derfor kommer de tre flader til at se forskellige ud uden at være tre brands: de har hver deres blanding af de to opgaver. Sitet er mest fortælling. Webshoppen er mest salg. Appen er mest medlemskab. Samme regel, tre resultater.

*Belægget for salgs-siden af reglen ligger i `BAGGRUNDSFARVE-OG-CASHFLOW-RESEARCH-v0.1`: Sang Bleu kører sort forside og `#f1f1f1` shop, Royal Tattoo sort forside og hvid shop, og ingen i kategorien sælger prints i volumen på sort. Læsbarhedsforskningen peger samme vej for småt, tal-tungt indhold på telefon om aftenen.*

## 2 · Kernen — gælder alle tre flader, uden undtagelse

| # | Regel |
|---|---|
| K1 | **Paletten.** `--nat #070707` · `--hud #e8dcc8` · `--blod #b91c1c` · `--beton #8a8580` · `--strobe #c8ff3d`. Ingen andre farver uden Stevens ord. Én sort i huset — `#0a0a0a` og `#070706` er historie. |
| K2 | **Typen.** Anton til plakat og overskrift, Instrument Sans til brød og UI. Ingen tredje familie. Brød aldrig i caps, brød aldrig under 16 px, labels aldrig under 12 px. |
| K3 | **Radius 0.** Overalt. Runde former findes kun i anti-arkets parodier. |
| K4 | **Seglet er ét mærke, én fil** (`logo-segl.svg`). Størrelse og placering er fladens valg; formen og farven er ikke. Præcis ét prominent segl pr. skærm — aldrig to i samme hjørne. |
| K5 | **Billedloven.** Husets egne billeder er målet og standarden. **Interim-regel (godkendt af Steven 29/8-2026):** indtil husets eget shoot er inde, må **Grok-genererede billeder gå live** — på disse vilkår: *(a)* stemnings- og rum-billeder (gaden, natten, interiør, hænder i arbejde) må stå umærkede; *(b)* **et genereret motiv må aldrig krediteres som en navngiven artists værk** — håndhæves i `Plade.tsx`, hvor artisten kun vises når værket har en titel, og interim-plader har ingen. `DEMO`-chippen er afløst af en beskrivende billedtekst (Stevens kendelse 29/8-2026); *(c)* **ingen genererede ansigter koblet til ægte navne** — artist-slots bruger arbejdsbilleder (hænder, station, ryg) indtil ægte portrætter findes; *(d)* interim-billeder udskiftes 1:1 på slot-filnavn når shootet lander, og reglen udløber dér. Mindst ét lyst billede pr. sektion — det er målt, at det er dét, der løfter en flade. Alt-tekst = værk-labelen. |
| K6 | **Sproget.** Ordlisten i `DANSK-TATTOO-SPROG v0.3`. Dansk, kort, fagsprog, ingen superlativer, ingen bureau-lugt. Tom-tilstande er ærlige og ordret som ratificeret. |
| K7 | **Prisreglen (Stevens kendelse 29/8 — afløser den gamle ét-tal-regel).** *Et tal må kun stå på fladen, hvis kunden kan betale det i samme øjeblik uden at tale med en artist.* **Må stå:** depositum (100 kr, husets ét-tal), gavekort, merch og prints. **Må ALDRIG stå:** sessionspriser, timepriser, pris pr. værk på Væggen, «fra»-priser, prislister pr. artist — prisen aftales med artisten. **Walk-in-tilbuddet annonceres kun fysisk i og uden for butikken**, aldrig på site, webshop, app eller booking. Skiltet under et værk bærer identitet (titel · artist · år), ikke pris. Mangler et tilladt tal, udelades linjen — `[TAL BEKRÆFTES]` er byggepladsens sprog og går aldrig live. |
| K8 | **Blackbook-døren findes på alle flader** og forsvinder aldrig — heller ikke i kurven. Én linje: «Vi sender kun natten. Afmeld nederst i mailen.» Kanalen er email (Stevens kendelse 29/8-2026); afmeldingsløftet skal altid matche den mekanik huset faktisk har — skifter kanalen, skifter linjen med. |
| K9 | **Tilgængelighedsgulvet.** Mål ≥ 44 px, synlig fokus-tilstand, tekstkontrast ≥ 4,5:1 (pris og knap ≥ 7:1). Gælder også appen. |
| K10 | **Ingen opdigtet virkelighed.** Ingen fiktive navne, tider, tal eller anmeldelser — på nogen flade. |

## 3 · De tre flader — job, bund og hvad der bevidst er forskelligt

### Sitet · `inkandart.dk` — huset
**Job:** en fremmed fra Google eller Instagram skal beslutte sig for at gå ned ad trappen. Fortælling først, salg som en dør i huset.
**Bund:** **nat** på Huset, Stolen, Natten, Gaden. **Hud-lys** på Mærket (væg med priser, hylde, produktside).
**Egen form:** rum-navigation, redaktionel rytme, store billeder i 4:5 og liggende hero. Ingen produktgitre uden for Mærket.
**Gate:** ≤ 60 % nær-sort i første viewport ved 1440×900 · ≤ 62 % ved 390×844.

### Webshoppen · `shop.inkandart.dk` — disken
**Job:** en der allerede tror på huset skal købe et print eller en trøje. Produkt først.
**Bund:** **hud-lys som hovedflade.** Nat bruges som ramme — topbjælke, footer, sektionsskel — og til brand-momenter (forsidens hero, et drop). Det er ikke en kopi af Mærket; det er den samme regel med omvendt vægt.
**Egen form:** produktgitter, prisen som første element under billedet, hurtig filtrering, kurv-drawer. Tættere og køligere end sitet — en disk, ikke et rum.
**Gate:** ≥ 60 % lys flade på liste- og produktsider · produktbilledet fylder mindst 60 % af kortets højde · pris-kontrast ≥ 7:1.

### Appen — lommen
**Job:** den der kommer igen. Booking, Blackbook, drops, events, aftercare — og senere vaulten. Bruges i butikken, om aftenen, med én hånd.
**Bund:** **nat som hovedflade.** Det er en medlemsflade, den bruges i mørke rum og på telefon, og den skal føles som huset i lommen. **Undtagelsen er handelsskærmene** — shop-fanen, drop-køb, kurv — som følger produktreglen og står lyst.
**Egen form:** faner i bunden, native overgange, ét emne pr. skærm, tommelfingervenlige mål. Appen må have bevægelse; sitet må ikke.
**Gate:** samme kontrastgulv · handelsskærme ≥ 60 % lys · brandskærme ≤ 65 % nær-sort (telefonen er lille, så loftet er lempeligere end sitets).

## 4 · Hvad der bevidst må være forskelligt

Så det er sagt højt, og ingen bygger 1:1: **layouttæthed · navigationsmodel (rum kontra gitter kontra faner) · baggrundens dominans · billedernes formater og beskæring · bevægelse · hvor tæt priser står.** Det er fladens eget kald, inden for kernen i §2.

**Og hvad der aldrig må være forskelligt:** paletten, typen, radius 0, seglets form, billedloven, sproget, ét-tal-reglen, døren, tilgængelighedsgulvet. Ser en kunde de tre flader i samme uge, skal hun vide at det er det samme hus — ikke tro at det er den samme side.

## 5 · Håndhævelse

Porten er målbar, ikke en smagsdom: jeg måler nær-sort-andel, lys-andel, billedareal og kontrast pr. flade på hver leverance, med samme metode overalt. Ingen bygger måleværktøjet — de melder preview, jeg måler og svarer med tal.

Dertil to lint-regler når webshop og app bygges: **ingen farve uden for paletten** i CSS/tokens, og **ingen brødtekst under 16 px**. De to fanger 90 % af drift.

## 6 · Hvad der sker med de gamle guider

`inkandart-webshop/DESIGN-GUIDE.md` §2 («Baggrund #070706 — altid, al kunst står på sort») og `INKANDART-DESIGN-MANUAL-AND-SPEC.md` er skrevet til Emerge. De **erstattes af en pointer** til dette dokument, så ingen bygger efter dem ved et uheld — det er én linje pr. repo og bør gøres nu, ikke når ombygningen starter. Historikken bevares i git; intet slettes.

**Kanonisk hjem:** `inkandart.dk/docs/handoff-rummet/` sammen med resten af Rummets grundlag, med pointere fra webshop-repoet. Én kilde, to henvisninger.

## 7 · Rækkefølge

Sitet færdiggøres først (M2R → M3 → M4 → live) — det er dét, der har en deadline og et cashflow-formål. Webshop og app bygges om bagefter, i den rækkefølge du bestemmer, **efter denne kanon**. Det eneste der skal gøres i dag er de to pointere i §6, så ingen bygger videre på Emerge-guiderne i mellemtiden.

---
*Bygger på: `VISUEL-RETNING-RUMMET-v0.1` (R1–R7, M1–M3) · `BAGGRUNDSFARVE-OG-CASHFLOW-RESEARCH-v0.1` (målte konkurrentflader + læsbarhedsforskning) · `DANSK-TATTOO-SPROG v0.3` (sproget) · `BESTILLING-CLAUDE-DESIGN-v2` og `BYGGEBRIEF-RUMMET-TIL-GROK` (Rummets grundlov) · målinger af inkandart.dk, inkandart-webshop og appens skærme 29/8-2026.*
