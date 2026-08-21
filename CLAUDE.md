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
| **Vilde** | `lib/commerce.ts` · `SceneV05.tsx` · layout · `/flash`-struktur · mobil-dock | `Gift*`-komponenter, `/gavekort`-copy |
| **Grok** | `components/emerge/Gift*` · `/gavekort` · gavekort-OG | `lib/commerce.ts` · `SceneV05.tsx` · layout |
| **Haruki** | review, merge, redirects, CI, `docs/` | bygger ikke i de to andres lanes uden aftale |

**Ratificeret S567** (Vilde ↔ Grok, via Steven). Ændres lanen, ændres denne
tabel i samme PR — ellers er den ikke ændret.

**Krydser du en grænse:** stop og spørg ejeren. Et hurtigt spørgsmål koster
minutter; en kollision i to agenters ucommittede arbejde koster en dag.

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
