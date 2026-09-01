# Accept: det engelske spor hele vejen

Status: **UDKAST** — afventer Stevens sniffer
Bygger: Villy. Skrevet før bygning, jf. CLAUDE.md §6.

Det vi køber: at **hverken kunden eller artisten** møder et sprog de ikke
læser — på den ene flade hvor misforståelse gør fysisk skade.

---

## Hvorfor nu

**Steven, 1/9:** *«Vi har 40 % udenlandske kunder og 50 % af vores
artister er fra udlandet.»*

Det vælter en antagelse jeg selv skrev ind i koden samme morgen:

> «Husets brev er altid dansk — det læses af studiet.»

Jeg skrev den som **rettelse** af en sprogblanding, og hardkodede dermed
noget der ikke passer. Målt på husets brev om en engelsk kunde i dag:

```
⚠ GENNEMGANG KRÆVES — tal med kunden før I går i gang
  · Kunden har oplyst at hun er gravid. Tag snakken før I går i gang.
  · Blodfortyndende medicin oplyst … Regn med mere blødning og længere heling.
  · Allergi oplyst … Spørg hvad allergien gælder, før I vælger pigment.
```

**Sikkerhedsadvarslerne — hele pointen med funktionen — er ulæselige for
halvdelen af artisterne.**

## Hvorfor det ikke løses af kundens sprog

Det oplagte greb er «husets brev følger kundens sprog». Det virker ikke:

| | |
|---|---|
| udenlandsk artist, **dansk** kunde | ~30 % af aftalerne — og hun får stadig dansk |
| dansk artist, udenlandsk kunde | hun ville få engelsk |

Med 50 % udenlandske artister og 60 % danske kunder er det almindeligste
uheld netop den første række. **Brevet skal bære begge sprog, altid.**

---

## Acceptkriterier

### AC1 — Enhver der står ved stolen kan læse advarslen

**Givet** et hus hvor halvdelen af artisterne ikke læser dansk
**Når** en artist åbner husets brev
**Så** står modstriden på **både dansk og engelsk** — uanset hvilket sprog
kunden udfyldte skemaet på.

**Negativ kontrol:** søg efter «REVIEW REQUIRED» i et brev om en **dansk**
kunde. Det skal stå der. Ellers følger brevet kundens sprog igen.

*Steven efterprøver:* udfyld skemaet på dansk med «gravid». Åbn husets
brev. Kan Nizar læse advarslen uden at oversætte?

### AC2 — De to sprog blandes ikke

**Givet** at brevet bærer begge sprog
**Når** man læser det
**Så** er hver blok **hel**: dansk først, en tydelig streg, engelsk under.
Aldrig en dansk overskrift med en engelsk linje under.

*Steven efterprøver:* det var præcis den fejl vi rettede i morges —
«⚠ GENNEMGANG KRÆVES» efterfulgt af «ABOUT YOUR BODY · You take…».
Den må ikke komme igen i en ny form.

### AC3 — Emnefeltet kan scannes af begge

**Givet** en artist der kigger i indbakkelisten uden at åbne noget
**Når** hun ser emnet
**Så** kan hun se om der skal gennemgås — på et ord hun kender.

**Og stadig:** ingen helbredsord i emnet.

*Steven efterprøver:* to breve i listen, ét rent og ét med modstrid.
Kan en engelsktalende se forskel uden at åbne dem?

### AC4 — Kundens eget brev er ét sprog, hendes eget

**Givet** en kunde der udfyldte på engelsk
**Når** hun får sin kopi
**Så** er den **helt** engelsk. Hun skal ikke se husets danske ord.

*Allerede opfyldt i dag — målt: nul danske ord i det engelske kundebrev.
Kriteriet står her, så det ikke går tabt når brevet bliver tosproget.*

### AC5 — Begge sider står i sitemappet

**Givet** at `/samtykke` og `/en/samtykke` er rigtige sider
**Når** man ser i `app/sitemap.ts`
**Så** står de begge der.

*Ingen af dem gør det i dag. CLAUDE.md §5: «Ny side: med i
`app/sitemap.ts`.» Overset i #270, og jeg fangede den ikke.*

---

## Uden for købet

**To sprog gør brevet dobbelt så langt.** Det er prisen, og den betales
på en telefon ved en disk. Alternativet — at vælge sprog pr. artist —
kræver at vi kan matche `kunstner`, som er et fritekstfelt kunden selv
taster, og det holder ikke for en walk-in.

**Modstrids-teksterne er ikke medicinsk rådgivning** — hverken på dansk
eller engelsk. Den engelske ordlyd skal godkendes af en der sætter tusch
i mennesker, ligesom den danske.

**Kun de to sprog.** Huset har kunder på flere, men vi lover ikke mere
end vi kan holde.
