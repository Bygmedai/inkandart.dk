# Accept: Forsiden får udgange (og holder op med at spilde de første tre sekunder)

Status: **UDKAST — afventer Stevens sniff**

Det vi køber: at en fremmed der lander på inkandart.dk **kan komme videre
dér hvor de får lyst** — og at siden ikke bruger sine første sekunder og sin
halve længde på at sige ingenting. Ikke en kortere side. En side med døre i.

## Sådan ser det ud i dag (målt 2026-08-23 på den levende forside)

| | mobil | desktop |
|---|---|---|
| Fra sidste knap til den næste | 2.897 px = **3,4 skærme** | 3.020 px = **3,4 skærme** |
| Andel af siden uden én handling | **52 %** | **51 %** |
| «Selected work» | 42 billeder · **0 links** | |
| «The artist» | 31 billeder · **0 links** | |
| Sort skærm før man ser noget | | **2.778 ms** |
| Walk-in-skiltet oven på «Scroll down to emerge» | 0 px² | **4.612 px² = 46 % af teksten** |

## Kriterierne

1. **Givet** at jeg åbner inkandart.dk på min telefon, **når** siden loader,
   **så** ser jeg husets segl og «BOOK TID» inden for **ét sekund** — ikke en
   sort skærm med «The mark stays».

2. **Givet** at jeg har scrollet gennem de udvalgte tatoveringer og synes godt
   om dem, **når** jeg når bunden af «Selected work», **så** kan jeg booke
   derfra — uden at scrolle videre for at lede.

3. **Givet** at jeg lige har læst om Nizar, **når** jeg når bunden af hans
   afsnit, **så** kan jeg booke hos ham med ét tryk.

4. **Givet** at jeg scroller hele forsiden igennem, **når** jeg tæller
   afstanden mellem to steder jeg kan handle, **så** er der aldrig mere end
   **halvanden skærm** uden en knap. (I dag: 3,4 skærme.)

5. **Givet** at jeg kigger på forsiden på en bærbar, **når** jeg læser
   «Scroll down to emerge», **så** er den ikke dækket af walk-in-skiltet.

6. **Tid — Givet en vilkårlig dag D:** hver købsknap på forsiden fører til
   noget der kan købes **den dag**. Ikke noget der var til salg da vi byggede
   det. Verificeres ved at trykke på dem, ikke ved at læse koden.

7. **Negativ kontrol:** de nye knapper skal kunne SES at gøre en forskel.
   Åbnes den nuværende forside side om side med den nye, skal midterstykket
   gå fra **nul** klikbare ting til mindst to. Er tallet det samme, har vi
   ikke bygget noget.

## Uden for købet (kendt restrisiko)

- Længden på forsiden. Vi skærer ikke i stemningen; vi sætter døre i den.
  Vil du have den kortere, er det en separat beslutning.
- At Nizar og Simone kan lide redesignet. Kriterierne her måler om siden
  *virker* kommercielt — ikke om den er godkendt. Det er en anden samtale,
  og den vinder vi ikke med tal alene.
