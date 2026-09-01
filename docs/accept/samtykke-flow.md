# Accept: Vejen fra booking til stolen

Status: **UDKAST v3** — skåret ned efter Stevens kald 1/9
Bygger: Villy. Skrevet før bygning, jf. CLAUDE.md §6.

Det vi køber: at kunden kommer ind ad døren med sit skema udfyldt — og at
artisten ved hvor motivet skal sidde, hvor stort, og **om kunden har
oplyst noget der taler imod det hun ønsker.**

---

## Hvorfor v3 er meget mindre end v2

**Steven, 1/9:** *«Vi skal overholde loven, ikke være selv-politi og bygge
Fort Knox.»* Og: *«Vi skal ikke have digital underskrift.»*

Han har ret, og drivet var mit. Kæden:

1. Book.dks salgsside skrev «digital underskrift» → **jeg gjorde det til
   et krav.** Det er der ingen lov der siger.
2. Sirius' review afviste Shopify → jeg overtog rammen «det her er farligt».
3. Jeg skrev otte kriterier med **fem negative kontroller**,
   engangs-tokens, tidszonevinduer og lækagekontrol i fejllogs.

Ingen af de tre skridt kom fra en lov. **Artikel 32 kræver sikkerhed
«passende i forhold til risikoen» — passende, ikke maksimal.** Et
papirskema i en aflåst skuffe har været branchestandard i årtier.

v3 er fem kriterier. Der er ingen underskrift, ingen tokens, ingen vault,
og Shopify rører ikke en helbredsoplysning.

**Det ene fra v2 der overlever som teknisk krav** er billigt og rigtigt:
helbredsord må ikke stå som søgbare mærkater i et markedsføringssystem.
Det er ikke Fort Knox — det er at lægge tingene i den rigtige skuffe.

---

## Sådan er flowet

```
1  Kunden booker paa Book.dk                     uaendret
2  Bekraeftelsen baerer et link til /samtykke     ← indstilling, ikke kode
3  Kunden udfylder hjemmefra
      navn · mail · aftalens dato · artist
      motiv · placering · stoerrelse · farve/sort
      helbred: afkrydsning + egne ord
4  Serveren sender TO mails
      → booking@inkandart.dk   hele erklaeringen
      → kunden                 hendes egen kopi, ordret
5  Kvittering vises KUN hvis begge gik afsted
6  Ved stolen: artisten soeger kundens navn i indbakken
```

**Vi gemmer ingenting selv.** Ingen database, ingen vault, ingen
Shopify-skrivning. Postkassen er stedet — den har allerede adgangsstyring,
den ligger hos en databehandler, og Steven bestemmer selv hvor længe der
gemmes.

**Modstriden regnes ud på serveren** og står to steder: som et neutralt
mærke i emnefeltet (`GENNEMGANG`) og **med ord øverst i mailen**. Aldrig et
helbredsord i et emnefelt.

---

## Acceptkriterier

### AC1 — Kunden skal ikke lede efter skemaet

**Givet** en kunde der lige har booket en tid
**Når** bekræftelsen lander i hendes indbakke
**Så** står der et link til skemaet, og hun kan udfylde det derfra uden at
skrive en URL.

*Steven efterprøver:* book en tid med din egen mail. Åbn bekræftelsen. Klik.

### AC2 — Huset får den, og kunden får sin egen kopi

**Givet** en kunde der har udfyldt skemaet
**Når** hun trykker send
**Så** ligger hele erklæringen i `booking@inkandart.dk`, og hun har selv
den samme i sin egen indbakke — hendes svar ordret.

**Og fladen siger kun «vi har den» hvis begge mails gik afsted.** Fejler
én af dem, siger siden det, og kunden ved at hun skal gøre noget.

*Steven efterprøver:* udfyld med din egen mail. Begge mails skal ligge der.
Sluk derefter for mail-nøglen og send igen — siden skal sige at det gik galt,
**ikke** «TAK».

### AC3 — Artisten kan finde dagens erklæring på under et minut

**Givet** en vilkårlig dag **D**, og en kunde med en aftale på dag D
**Når** artisten søger kundens navn i den fælles postkasse på sin telefon
**Så** finder hun erklæringen, og **hun kan se hvilken dag den gælder** —
en erklæring fra en tidligere aftale må ikke kunne forveksles med dagens.

*Steven efterprøver:* stå ved disken med telefonen. Udfyld to skemaer for
samme navn med to forskellige aftaledatoer. Kan du på under et minut se
hvilken der er dagens, uden at åbne dem begge?

### AC4 — Modstrid råbes op, og en ren erklæring ser tydeligt anderledes ud

**Givet** en kunde der har oplyst noget der taler imod det hun ønsker —
blodfortyndende og en stor flade, en hudlidelse netop dér hvor motivet skal
sidde, en allergi og et farvet motiv, graviditet
**Når** artisten åbner mailen
**Så** står modstriden **øverst og med ord**, ikke som et afkrydsningsfelt
under fem andre.

**Negativ kontrol:** en kunde der ikke har oplyst noget, giver en mail der
**tydeligt siger at der intet er** — ikke en mail der bare tier. En tom
skærm og en ren skærm skal se forskellige ud.

*Steven efterprøver:* udfyld to skemaer — ét med «blodfortyndende» og et
stort motiv, ét helt rent. Kig kun på emnefelterne i indbakken. Kan du se
forskel uden at åbne dem?

### AC5 — Helbredsord står kun hvor de hører hjemme

**Givet** at skemaet indeholder oplysninger om en kundes krop
**Når** man leder efter dem andre steder end i selve mailen
**Så** findes de ikke.

**Negativ kontrol — tre steder, alle skal give nul:**

| søg efter et helbredsord i | skal give |
|---|---|
| mailens **emnefelt** | 0 |
| **URL'en** på skemaet eller kvitteringen | 0 |
| **Shopify** — tags, noter, metafelter, eksporter | 0 |

*Steven efterprøver:* søg på «blodfortyndende» i Shopify. Nul træf. Kig på
emnefeltet i indbakken — der står `GENNEMGANG`, ikke hvad der er galt.

---

## Uden for købet

**Trin 2 er ikke kode.** Linket i Book.dks bekræftelsesmail er en
indstilling. Kan Book.dk ikke bære det, må huset sende linket — og så skal
det aftales hvem der gør det.

**Kunden taster selv sin aftaledato.** Der er ingen maskinel binding til
bookingen, fordi Book.dk ikke kan levere en. En tastefejl bliver synlig i
AC3, ikke umulig. Det er en bevidst afvejning: en ægte binding ville kræve
et token-system, og det er præcis den Fort Knox vi har fravalgt.

**Vi gemmer ingenting selv, så der er ingen sletteknap hos os.**
Opbevaringen er postkassens, og den er Stevens at styre. Det skal stå i
privatlivspolitikken.

**Fire beslutninger er Stevens, ikke mine:** hvad vi spørger om, hvem der
må se det, hvor længe det gemmes, og hvad vi siger til kunden. En jurist
bør gennemse dem — men de er små, og de blokerer ikke bygningen.

**Modstrids-listen er ikke medicinsk rådgivning.** Den råber; den afgør
ikke om nogen må tatoveres. Den skal godkendes af nogen der sætter tusch i
mennesker til daglig.

**Ingen rate-limit.** Arvet fra `/api/subscribe`; edge-runtime har ingen
delt tilstand, så en tæller i hukommelsen ville være teater.

---

*v1 og v2 skrevet 1/9. v3 samme dag, efter Steven: «Vi skal overholde
loven, ikke være selv-politi og bygge Fort Knox.»*
