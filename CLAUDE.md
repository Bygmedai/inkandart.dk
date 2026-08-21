# CLAUDE.md — rails for agenter i `inkandart.dk`

Tre agenter arbejder i dette repo samtidig. Indtil nu har vi holdt os fra
hinandens filer via beskeder gennem Steven. Det virkede, fordi vi huskede
aftalen — og det er præcis den slags der holder indtil den ikke gør.
Her står den i stedet.

**Sandhed i artefakter, ikke i hukommelse.** Er en aftale kun i en tråd,
findes den ikke.

---

## 1. Lanes — hvem rører hvad

| Agent | Ejer | Rører ikke |
|---|---|---|
| **Vilde** | `lib/commerce.ts` · layout · `/flash`-struktur · mobil-dock | `Gift*`-komponenter, `/gavekort`-copy |
| **Grok** | **animationerne** (`Mor*`, `Crew*`, `lib/mor.ts`, `lib/crew.ts`, `lib/voice.ts`, scenens liv) · `Gift*` · `Walkin*` · `/gavekort` · `/walk-in` · Shopify-katalogpleje (drafts) | `SceneV05.tsx` ud over egne slot-linjer · andres zoner · `lib/i18n.ts` |
| **Villy** | «Under gaden»-zonen · `Kerb*` · `/shop`-kataloget · reservations-tråden (inkl. piercing) · **host-redirects** · perf/SEO/a11y-gates | `Gift*`, `Walkin*`, `/gavekort`, `/walk-in`, animations-CSS |
| **Haruki** | **EN+DA-fladen** (`lib/i18n.ts`, `LangSwitch`, `/en/*`-rutetræet, hreflang-mønstret) · review, merge, CI, `docs/` · `/en/*`-rækkerne i `lib/redirects.ts` | bygger ikke i andres lanes uden aftale |

**Ratificeret S567**, opdateret **S568** efter Stevens omfordeling: Grok bygger
animationer, Haruki sikrer at vi har både en engelsk og en dansk version.
Ændres lanen, ændres denne tabel i samme PR — ellers er den ikke ændret.

### To grænser der er nye i S568 — læs dem, de er de eneste steder vi kan kollidere

**`lib/redirects.ts` deles nu af to lanes.** Haruki ejer `/en/*`-rækkerne
(en engelsk rute holder op med at 308'e i samme commit som siden findes).
Villy ejer `hostRedirects` — reglerne der tager et helt subdomæne. De rører
ikke hinanden: den ene er stier, den anden er værter. **Wildcard-sourcen
`/:path*` må ALDRIG stå uden sin `has: [{ type: "host" }]`-vagt** — uden den
sender vi hele hub'en ét sted hen. Testen håndhæver parret.

**EN-porten af en side er sideejerens, ikke Harukis.** Haruki leverer
mønsteret (`lib/i18n.ts` + `LangSwitch` + `alternates()`); ejeren af fladen
porterer sin egen. `/en/shop` er altså Villys, `/en/gavekort` er Groks —
så vi ikke bygger den samme side to gange. En engelsk rute uden en engelsk
side skal blive ved med at 308'e til dansk: **hellere dansk end 404.**

### Slot-reglen — sådan deler fire agenter én scenefil

`SceneV05.tsx` er den flade alle vil lægge objekter i. Derfor er den tynd:
hvert kommercielt objekt er sin egen komponent med én ejer, og scenen kender
kun **én linje** pr. objekt (`<GiftRelic />`, `<WalkinRelic />`,
`<KerbReservation />`, `<MorBird />`, `<CrewBit />`). Så bliver en kollision
til en triviel merge i stedet for en dag tabt.

- I `SceneV05` må du kun tilføje eller ændre **din egen slot-linje**.
- `lib/commerce.ts` er **append-only med råb**: læg din blok til, rør ikke
  andres, og sig det i PR-teksten (Groks form i #146 er standarden). Pas på
  `/**`-linjen når du løser en rebase-konflikt — to blokke deler den, og den
  har allerede kostet to agenter en fejlsøgning.
- **Verificér variant-ID'er med positiv OG negativ kontrol** før du lover en
  handel. En **levende** variant svarer `302` på et bart kald (`200` hvis du
  følger redirect med `curl -L`); en **død** svarer `410` med det samme.
  Mål altså 302-eller-fulgt-200 mod 410 — ikke «200 mod 410» (Haruki, S568).
  Fire piercing-varianter var 410 i august 2026 — de indgår derfor ikke.
- **Ingen CSS-`transform` på en slot der er `[data-depth]`-deltager.**
  Motoren ejer transform på de bokse; centrering laves med boks-model
  (`left`/`right`/`margin-inline`). Lært i #146, bekræftet i kridt-slotten.
- **`globals.css` har ingen «hale».** Fire lanes appender til den samme fil.
  Afslut din blok med din egen `@media (prefers-reduced-motion: reduce)` —
  smelt den aldrig sammen med naboens. En naiv «behold begge sider» spiser
  én krøllet parentes, og resten af filen ligger inde i en media query der
  aldrig lukker (#152: `Syntax error: Unclosed block` — og en hel CSS-blok
  gik tabt i den følgende konfliktløsning uden at efterlade spor i diffen).
- **Mål aldrig CSS med et udsnit der slutter ved filens ende.**
  `css.slice(css.indexOf(sel))` er et hegn der flytter sig når naboen bygger.
  Bind udsnittet til reglens egne krøllede parenteser (`ruleBody()` i
  `tests/reservation.test.mjs`) — og læg en negativ kontrol ved siden af.
- **Et objekt må ikke lande oven på en handling.** Bevægelige elementer i en
  andens zone skal måles med `elementFromPoint` i selve overlap-rektanglet,
  ikke kun geometrisk: kravet er **0 px² «æder tap» mod `.kerb__mark`** og
  andre købsflader. Husk parallax-svinget mellem to slots med forskellig
  `data-depth`: forskellen giver ±45 px relativ drift, så en position har
  brug for ~5 % luft — ikke 2 %.

**Krydser du en grænse:** stop og spørg ejeren. Et hurtigt spørgsmål koster
minutter; en kollision i to agenters ucommittede arbejde koster en dag.

### Udseende er din — plads er sektionsejerens

Grænsen går ikke ved filen, men ved hvad ændringen gør. Vildes formulering
efter #141 (ratificeret S567):

> «Relikviets udseende er din lane; dets plads i min sektion er min.»

| Du må | Du skal spørge sektionsejeren |
|---|---|
| komponentens eget udtryk, farver, motiv, indre layout | sektionshøjder, padding, margin i en andens zone |
| tilføje `<DinKomponent />` i et slot | flytte eller ændre det omgivende layout for at gøre plads |

**Hvorfor det ikke bare er territorium:** i #141 blev `#booking` 18svh
højere for at give plads til relikviet. Ingen så, at mobil-dock'ens tuck er
koblet til netop den sektions højde. Målt bagefter:

```
booking 100svh → dock tucker 499 px før sektionen
booking 128svh → 459 px          (ændringen flyttede den 40 px)
booking 180svh → 419 px
```

Tuck-punktet flytter sig ~1 px pr. svh — lydløst, uden at nogen test går
rød. Intet gik i stykker, fordi det blev regressionstestet før merge. Men
det blev opdaget, ikke besluttet.

**Beskriv indgrebet som det er.** «Ét slot» og «ét slot plus tre
layout-værdier i booking-zonen» udløser to forskellige reviews.

---

## 2. Rebase efter squash-merge — stående aftale

Når en PR bygger på en anden PR's branch, og basen squash-merges, ender
child-PR'en i konflikt. Det er mekanik, ikke nogens fejl.

**Haruki må rebase en anden agents branch, når begge gælder:**

1. Konflikten skyldes en squash-merge, ikke uenighed om indhold
2. Ejeren har ikke pushet oven på det head Haruki så

**Sådan:** `rebase --onto origin/main <gammel-base>`, verificér at den er
ren, kør tests, og push med `--force-with-lease` mod det kendte head — så
rammer den kun hvis ejeren ikke har flyttet sig.

**Og sig det højt** i review-teksten med både gammelt og nyt SHA, så ejeren
kan finde tilbage. Har ejeren lokalt arbejde:
`git fetch origin && git reset --hard origin/main`

*Aftalt S567 — Grok: «Rigtigt kald. Næste gang må du gerne gøre det igen.»*

---

## 3. Handel: sitet rører aldrig penge

**Vej B (Steven, S568):** Vite-webshoppen er pensioneret som storefront.
Kataloget bor i hub'en på `/shop`; `shop.inkandart.dk` bliver en 308 dertil
(P2). Webshop-repoet arkiveres — intet slettes.

Betalingen bor i Shopify (`d1qp54-0w.myshopify.com`, DKK). Sitet afleverer
kurven via cart-permalink; checkout bliver hos Shopify.

- **Ingen betalingslogik, ingen credentials, ingen kortdata** i dette repo.
- Al Shopify-URL-konstruktion hører hjemme i `lib/commerce.ts` — ét sted.
- **Variant-ID'er er live-data.** Ændrer nogen produktet i Shopify, går
  linket i stykker uden at CI opdager det. Ændrer du dem, så verificér mod
  den rigtige butik og læg beviset i PR'en.

**Verifikation der tæller** (brugt i review af #136):

```bash
curl -sI -L "https://d1qp54-0w.myshopify.com/cart/<variantId>:1"   # 200
curl -sI -L "https://d1qp54-0w.myshopify.com/cart/99999999999999:1" # 410
```

Den negative kontrol er ikke pynt. Uden den beviser 200 ingenting.

---

## 4. Hvad der aldrig må lyve

Sitet er en brandflade for et rigtigt studie med rigtige kunder. En
overdrivelse her bliver til en skuffelse ved disken.

- **Lov ikke en kapacitet vi ikke har.** Gavekort-copy'en siger «vis den i
  studiet», ikke «indløs den i studiet» — fordi ægte in-person-indløsning
  kræver en POS-transaktion, og det er ikke afklaret endnu.
- **Tom hylde skal se tom ud.** `/flash` siger «det første drop lander
  snart» i stedet for at vise en tom liste som om noget var udsolgt.
- **Ingen død handling.** Et flash-motiv uden `variantId` falder tilbage til
  reservation via WhatsApp — aldrig en købsknap der ikke kan købe.

---

## 5. Før du åbner en PR

- `npm test` og `npm run build` grønne lokalt
- Rører du en rute: opdatér `lib/redirects.ts` **og** dens test i samme commit
- Ny side: med i `app/sitemap.ts`
- Nyt OG-billede: hent det i runtime og bekræft at det er et ægte billede i
  den lovede størrelse — `ImageResponse` består build og fejler i drift
- Ingen `use client` på handelsflader; de skal virke uden JS

---

*Ratificeret S567 (2026-08-21). Ændringer sker via PR, ikke via besked.*
