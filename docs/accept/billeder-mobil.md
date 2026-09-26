# Accept: Billederne i en størrelse der passer til telefonen

Status: **UDKAST**

Det vi køber: en telefon henter billeder i telefonstørrelse, ikke i
skrivebordsstørrelse. Siderne ser ud præcis som i dag, men de åbner hurtigere
på mobildata. Det gælder især de sider, der skal overbevise en ny kunde om
kvaliteten: artisterne, shoppen og gaden.

Med i samme køb: det bibliotek der laver de mindre billeder (sharp), løftes
til den version hvor de to kendte sikkerhedshuller er lukket. De nye
mobilbilleder bliver altså lavet med den rettede version.

## Sådan ser det ud i dag (målt i produktion 2026-09-24, efter #344)

Alle billeder på hver side, lagt sammen. Samme filer hentes på en telefon og
på en stor skærm; **ingen side har en mobilversion af noget billede.**

| side | billeder | i alt | største |
|---|---|---|---|
| forsiden | 6 | 1.365 KB | 325 KB |
| `/stolen` | 5 | 1.293 KB | 325 KB |
| `/stolen/nizar` | 9 | 1.802 KB | 350 KB |
| `/shop` | 20 | 4.240 KB | 362 KB |
| `/gaden` | 1 | 531 KB | 531 KB |
| `/booking` | 1 | 265 KB | 265 KB |

Lighthouse, som måler hastighed på hver PR, kigger kun på forsiden, `/aftercare`
og `/privatlivspolitik`, og kun i skrivebordsbredde. Ingen artist-side og
ingen telefon bliver målt.

Sikkerhedstjekket (`npm audit`) melder i dag **1 alvorlig** fejl: sharp 0.35.3.

## Kriterierne

1. **Givet** at jeg åbner Nizars side på min telefon, **når** siden er
   færdig, **så** har den hentet **under halvdelen** af de 1.802 KB billeder
   den henter i dag. Det samme gælder `/stolen`, `/shop` og `/gaden`. Tallene
   før og efter står i PR'en, målt på samme måde som tabellen ovenfor.

2. **Givet** at jeg holder telefonen op ved siden af en skærm med den gamle
   version, **når** jeg sammenligner Nizars side, forsiden og `/shop`, **så**
   kan jeg ikke se forskel: samme billeder, samme beskæring, samme skarphed.
   Intet billede er blevet sløret eller kornet.

3. **Givet** at jeg åbner Nizars side på en stor skærm (1440 px), **så** er
   billederne lige så skarpe som i dag. En mindre fil må aldrig blive til et
   udvisket billede på en stor skærm.

4. **Tid. Givet** at et nyt foto kommer ind i en PR en vilkårlig dag D, **når**
   den PR er ude på sitet, **så** har fotoet også en mobilversion. Ingen skal
   huske at køre noget. Det sker ved hver udrulning, ikke én gang for alle.

5. **Givet** at en fremtidig PR lægger et foto på en side uden en
   mobilversion, **så** går et tjek rødt i den PR, og det siger hvilket
   billede og hvilken fil.

6. **Negativ kontrol.** Tjekket fra punkt 5 **skal være rødt på `main` i dag**,
   med alle kortene fra tabellen ovenfor nævnt. Er det grønt før ændringen,
   måler det ingenting.

7. **Givet** at en mobilversion af en eller anden grund mangler, **så** viser
   siden det originale billede. Aldrig et brudt billede, aldrig et tomt felt.

8. **Givet** en PR, **når** jeg kigger på dens tjek, **så** har Lighthouse
   også målt Nizars side i telefonbredde, ikke kun forsiden på skrivebord.

**sharp.** I PR'en står sikkerhedstjekkets svar før (1 alvorlig) og efter
(0 alvorlige). Det er det eneste punkt du ikke selv kan betjene; det er et
bevis jeg lægger frem, ikke noget du kan klikke på.

## Uden for købet (kendt restrisiko)

- **Groks og Vildes flader** (`/gavekort`, `/walk-in`, `/flash` og deres
  relikvier) er ikke med. De er deres lanes. Tjekket fra punkt 5 gælder kun
  de sider der er med her, så det ikke går rødt i deres PR'er.
- **Hero-videoen** på forsiden ændres ikke. Den er dit valg om Nizars video
  og venter på dit svar om første billede.
- **Chateau-siden** er ikke med. Den er en anden adresse og et andet projekt.
- **Lighthouse-hastigheden forbliver en advarsel**, ikke en spærring. At
  gøre den til en spærring er en beslutning om Porten, og den er din.
- **Udrulningen tager lidt længere**, fordi mobilbillederne laves under
  hver udrulning. Tallet står i PR'en.
- **Ingen nye billeder.** Det er de samme billeder i mindre filer, ikke
  bedre fotos. /natten har stadig intet foto.
