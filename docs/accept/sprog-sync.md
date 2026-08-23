# Accept: Den engelske side taler engelsk

Status: **GODKENDT (2026-08-23)** — Stevens «ja go på det»

Det vi køber: at en engelsk kunde kan læse hele siden — især de knapper der
tager imod penge — og at Google forstår at de to sprog er samme side.

## Sådan ser det ud i dag (målt 2026-08-23 i produktion)

| fund | hvor | lane |
|---|---|---|
| `/shop` har **ingen** hreflang; `/en/shop` peger på begge. Parret er ensrettet. | `app/shop/page.tsx` | min |
| Kridtet taler dansk midt i den engelske side — **på selve depositum-knapperne** | `KerbReservation` + `lib/commerce.ts` | min |
| Fuglemors stemme er dansk på `/en` | `lib/mor.ts` | Groks |

De danske strenge en engelsk kunde møder i dag:

```
Kantstenen er vores venteværelse
Hold min plads 100,-      Hele dagen 1.000,-
Trækkes fra prisen. Tiden aftaler vi bagefter — book eller ring
En due i tagrenden. Hun ryger, hun kigger, og hun holder af gaden.
```

## Kriterierne

1. **Givet** at jeg er engelsk kunde på `/en/shop`, **når** jeg kigger på
   knapperne der tager imod penge, **så** står der engelsk på dem. Ikke ét
   dansk ord.

2. **Givet** at jeg er på `/en`, **når** jeg læser siden fra top til bund,
   **så** møder jeg ingen dansk sætning. Stednavne er undtaget:
   Pisserenden og Larsbjørnsstræde er stedet, ikke en beskrivelse.

3. **Givet** at jeg står på `/shop`, **når** Google læser siden, **så**
   peger den på den engelske udgave — og den engelske peger tilbage. Begge
   veje, ellers tæller parret ikke.

4. **Givet** at jeg klikker en depositum-knap på den engelske side, **så**
   lander jeg i den samme Shopify-kurv som fra den danske. Prisen er den
   samme. En oversat pris er en fejl, ikke en stemme.

5. **Tid — Givet en vilkårlig dag D:** de to sprog har samme antal
   købsknapper. Tilføjer nogen en vare på dansk uden at gøre det på
   engelsk, skal det fanges — ikke opdages af en kunde.

6. **Negativ kontrol:** fjernes en engelsk streng, skal bygningen fejle —
   ikke rendere et tomt felt. Ordbogstypen skal håndhæve det, og vidnet
   skal bevise at den gør.

7. **Steven-leddet:** du kan åbne `/en/shop` på telefonen og læse hele
   siden uden at møde et dansk ord på noget du kan trykke på.

## Uden for købet

- De fem engelske ruter der 308'er til dansk (`/en/flash`, `/en/gavekort`,
  `/en/blackbook`, `/en/aftercare`, `/en/privatlivspolitik`). De er som
  designet — hellere dansk end 404 — og hører til deres egne sideejere.
- «TUSSE · IKKE TERAPI» på gadens tapede plakat. Det er et skilt i gaden,
  ikke sidens stemme — samme kategori som Pisserenden.
