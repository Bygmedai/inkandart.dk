# Accept: Husets mærke i toppen af hver underside

Status: **GODKENDT (2026-08-23)**

Det vi køber: at man altid kan se hvis hus man er i, og altid kan komme hjem
— fra enhver side, med ét tryk på Nizars segl.

## Sådan ser det ud i dag (målt 2026-08-23)

Fire forskellige mønstre øverst på undersiderne, og to blindgyder:

| mønster | sider |
|---|---|
| `gade__top` med sprogskifter | `/shop`, `/en/shop` |
| `walkin-page__top` | `/walk-in`, `/en/walk-in` |
| et bart «← Ink & Art» i 11px | `/flash`, `/aftercare`, `/blackbook`, `/gavekort`, `/gavekort/til-dig`, `/privatlivspolitik` |
| **ingenting** | `/gavekort/giv`, `/gavekort/kort` |

**`/gavekort/giv` og `/gavekort/kort` har ingen vej hjem overhovedet.** Det er
midt i gavekort-flowet. En kunde der lander der, er fanget.

Ingen af siderne bærer husets mærke. Kun forsiden gør.

## Kriterierne

1. **Givet** at jeg står på en hvilken som helst underside, **når** jeg kigger
   øverst, **så** ser jeg husets segl — det samme mærke som på døren i
   Larsbjørnsstræde.

2. **Givet** at jeg trykker på seglet, **så** kommer jeg til forsiden. Fra
   enhver underside. Også de to jeg i dag sidder fast på.

3. **Givet** at jeg er på min telefon, **når** jeg trykker på seglet, **så**
   rammer jeg det i første forsøg — mærket er mindst 44×44 px.

4. **Givet** at jeg er på en engelsk side, **når** min skærmlæser læser
   seglet op, **så** er teksten engelsk — og den fører til den engelske
   forside, ikke den danske.

5. **Givet** at jeg kigger på en underside, **når** jeg sammenligner seglet
   med sidens egen overskrift, **så** er seglet tydeligt mindre. Det er et
   anker, ikke en overskrift — sidens eget emne skal stadig vinde.

6. **Tid — Givet en vilkårlig dag D:** hver underside har **præcis ét** segl i
   toppen. Ikke to, fordi nogen tilføjede et mere. Ikke nul, fordi en ny side
   glemte det.

7. **Negativ kontrol:** i dag kan man ikke komme hjem fra `/gavekort/giv` og
   `/gavekort/kort`. Efter ændringen skal det tal være **nul** sider uden vej
   hjem. Er det stadig to, har vi ikke bygget noget.

## Uden for købet (kendt restrisiko)

- `/figur-lab` er en intern side der ikke er linket. Den får ikke masthead —
  den skal ikke ligne en kundeside.
- Sprogskifteren på `/shop` og `/walk-in` bliver hvor den er. Mastheaden
  erstatter vejen hjem, ikke sprogvalget.
