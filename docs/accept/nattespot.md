# Accept: Natten kan sælge noget

Status: **UDKAST (2026-08-31)** — afventer Stevens sniff
Bygger: Villy. Skrevet før bygning, jf. CLAUDE.md §6 og `docs/PROCES.md`.

Det vi køber: at de timer huset holder åbent, som ingen anden tatovør i
København holder åbent, kan tage imod penge.

---

## Hvorfor netop denne flade

Målt i produktion 30/8, alle sider på sitet:

| flade | købslinks |
|---|---|
| `/shop` · `/maerket` · `/gavekort` (+ EN) | 16 |
| `/walk-in` (+ EN) | 4 |
| `/booking` (+ EN) | 2 |
| **`/natten`** | **0** |
| **`/gaden`** | **0** |
| **forsiden** | **0** |

Butikken har haft **én ordre nogensinde** (`#1001`, 13/7, 200 kr — en
eventbillet). Betalingen virker; der er bare ikke noget at købe på de
flader der bærer husets egen fortælling.

`/natten` siger i dag: *«DJ, drinks og flash-tattoos i kælderen, når huset
holder åbent til natten.»* Og så: *«Ingen nat i aften.»* Fladen fortæller
om noget der sker, og beder om en mailadresse. Den beder aldrig om en
beslutning.

---

## Hvad en Nattespot er

En holdt plads i stolen **torsdag, fredag eller lørdag efter kl. 22** —
de timer hvor alle andre studier har lukket.

**Stevens kald 31/8:**

| | |
|---|---|
| Depositum | **300 kr**, betales online |
| Resten | aftales i studiet, som resten af huset |
| Kapacitet | siden siger «begrænset antal» — **ingen nedtælling** |
| Vindue | torsdag · fredag · lørdag, **efter kl. 22** |

De 300 kr er et kraftigere no-show-filter end husets 100 kr, uden at kræve
fuld forudbetaling. Det er hele pointen: en nat-plads der ikke bliver brugt,
er en tom stol kl. 02 som ingen kan sælge bagefter.

**Hvorfor depositum og ikke fast pris:** huset aftaler pris i studiet på alt
andet end walk-in-tilbuddet. En opfundet fastpris ville være det første tal
på sitet der ikke kommer fra jer.

---

## Sådan bygges det

1. **Ny Shopify-vare** — «Nattespot — hold en plads · 300,-», ACTIVE,
   publiceret til Webshop-kanalen. Lager ikke sporet (som husets øvrige
   depositummer), så en plads aldrig fejler ved kassen på et lagertal.
   **Oprettes først når Steven har godkendt dette dokument.**
2. `lib/commerce.ts` — variant-ID'et lægges til som egen blok, append-only
   med råb. Tal og ID her, ord i i18n.
3. `content/natten.yml` + `natten.en.yml` — copy'en, så Sonja kan rette den
   i Decap uden en udvikler.
4. `/natten` og `/en/natten` — én sektion med knappen, på begge sprog.
5. Prøver: knappen findes på begge sprog, beløbet er ét sted, og et dødt
   variant-ID giver ingen knap.

**Lane-varsel.** Min QA-brief (S574) siger at jeg ikke rører `app/`,
`components/`, `content/` eller `lib/`. Steven har 31/8 bedt mig bygge
dette, hvilket går forud — men Grok ejer Shopify-katalogpleje og Haruki
ejer EN-fladen, så begge råbes an i PR-teksten. Er én af jer uenig, så
sig til før jeg bygger, ikke efter.

---

## Kriterierne

1. **Givet** at jeg står på `/natten` en helt almindelig tirsdag, **når** jeg
   leder efter hvad jeg kan købe, **så** kan jeg se hvad en Nattespot er,
   hvornår den gælder, og holde en plads — uden at ringe og uden at skrive
   mig op til noget.

2. **Givet** at jeg trykker på knappen, **når** jeg lander hos Shopify,
   **så** står der **300 kr** — det samme beløb som siden lovede. Et beløb
   der skifter undervejs er en fejl, ikke en detalje.

3. **Givet** at jeg er engelsk turist på `/en/natten`, **når** jeg trykker
   den samme knap, **så** lander jeg i den samme kurv til det samme beløb,
   og der står ikke ét dansk ord på knappen.

4. **Givet** at jeg læser siden før jeg betaler, **så** ved jeg at de 300 kr
   **trækkes fra prisen**, og at resten aftales i studiet. Det står før
   betalingen, ikke i en kvittering bagefter.

5. **Tid — Givet en vilkårlig nat N:** siden lover kun *torsdag, fredag og
   lørdag efter kl. 22*. Den lover aldrig en bestemt dato, et bestemt antal
   pladser eller en bestemt artist — for det ved vi ikke på forhånd, og en
   overdrivelse her bliver til en skuffelse ved døren kl. 02.

6. **Negativ kontrol:** sætter nogen varen på draft i Shopify, **så**
   forsvinder knappen fra siden. Den bliver ikke stående og fejler først
   ved kassen. En død købsknap er værre end ingen knap (rails §4).

7. **Givet** at jeg står på gaden kl. 01 med telefonen i den ene hånd,
   **når** jeg vil holde en plads, **så** kan jeg ramme knappen med
   tommelfingeren (mindst 44 px), og den virker uden JavaScript.

---

## Sådan efterprøves det uden at læse kode

```bash
# knappen findes på begge sprog
curl -s https://inkandart.dk/natten     | grep -c 'myshopify.com/cart/'   # ≥ 1
curl -s https://inkandart.dk/en/natten  | grep -c 'myshopify.com/cart/'   # ≥ 1

# varen lever — husets protokol, med negativ kontrol
curl -s -o /dev/null -w '%{http_code}\n' "https://d1qp54-0w.myshopify.com/cart/<ID>:1"        # 302
curl -sL -o /dev/null -w '%{http_code}\n' "https://d1qp54-0w.myshopify.com/cart/<ID>:1"       # 200
curl -s -o /dev/null -w '%{http_code}\n' "https://d1qp54-0w.myshopify.com/cart/99999999999999:1"  # 410
```

Og til sidst det der tæller: **Steven betjener den selv.** Åbn `/natten` på
telefonen, hold en plads, betal 300 kr, og se ordren lande i Shopify.

---

## Tre ting der ikke bygges

- **Ingen nedtælling af pladser.** Stevens kald. En tæller der siger «2
  tilbage» når der er nul, er værre end ingen tæller.
- **Ingen kalender.** Book.dk ejer tider. Det her holder en plads; tiden
  aftales bagefter — samme model som piercing-depositummet der virker i dag.
- **Ingen artist lovet.** Vi ved ikke hvem der sidder kl. 02 om tre uger.

---

## Det ene jeg mangler fra dig

**Copy'en til fladen.** Jeg kan skrive et udkast, men natten er husets
stemme, ikke min — og §4 siger at sitet aldrig må love mere end disken kan
holde. Sig til om du selv skriver den, eller om jeg lægger et udkast i
`natten.yml` som du retter i Decap.
