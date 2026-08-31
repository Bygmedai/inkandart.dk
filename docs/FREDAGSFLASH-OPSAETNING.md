# Fredagsflash: de to ting der ikke er kode

**#245 B3 og B4 · Villy, S576 · 31/8 2026**

B1 og B2 er bygget og merget (#249, #253). De to sidste punkter i Harukis
brief kan **ikke** løses i dette repo, og det er ikke en mangel — det er
hvor grænsen går. Her står nøjagtig hvad der skal klikkes, og hvorfor det
skal være et menneske der gør det.

---

## Målt 31/8, før noget blev foreslået

| | |
|---|---|
| Webhooks i butikken | **0** (`webhookSubscriptions` → tom) |
| Mail sendt fra repoet | **ingen** — hverken resend, nodemailer, sendgrid eller postmark |
| Installerede apps | **kan ikke læses** — `appInstallations` svarer «access denied» |
| `/cart/53935797338440:1` | **410** — samme som en død variant (negativ kontrol: `99999999999999` → 410) |

Det sidste er ikke en fejl. Produktet er DRAFT, og et upubliceret produkt
har ingen levende variant. Det er derfor Fredagsflash-blokken på `/flash`
står uden knap, og det er den rigtige tilstand indtil huset har sagt ja.

**Rækkefølgen er derfor: tænd produktet → B3 → B4.** B4's betingelse
læser B3's tag; gøres B4 først, viser den ingenting.

---

## B3 · Ordre-tag `fredagsflash`

**Hvorfor ikke kode:** Shopify Flow-automatiseringer bygges i Flows egen
flade. Der er ingen Admin-API til at oprette dem — hverken for mig eller
for nogen anden.

### Opskriften

1. **Shopify admin → Apps → Flow.** Er den ikke installeret: App Store →
   «Flow» (gratis, fra Shopify selv).
2. **Ny workflow.**
3. **Trigger:** `Order created`
4. **Betingelse:** `Order → Any line item → Product → Tags` **contains**
   `fredagsflash`
5. **Handling:** `Add order tags` → `fredagsflash`
6. **Slå den til.**

**Betingelsen læser produktets TAG, ikke variant-ID'et.** Det er et
bevidst valg: produktet bærer allerede tagget (målt 31/8 —
`["booking","depositum","flash","fredag","fredagsflash"]`), og et
variant-ID er live-data der går i stykker uden at nogen opdager det, hvis
produktet bliver duplikeret eller genoprettet. Tagget overlever begge dele
og dækker automatisk næste fredagsprodukt.

---

## B4 · Kvitteringsteksten

**Hvorfor ikke kode:** mailen er Shopifys egen ordrebekræftelse. Der er
ingen Admin-API til notifikations-skabeloner, og repoet sender ikke selv
mail.

### Opskriften

**Shopify admin → Settings → Notifications → Customer notifications →
Order confirmation → Edit code.** Indsæt i kroppen:

```liquid
{% if order.tags contains 'fredagsflash' %}
  <p>Din plads gælder den kommende fredag. Mød op inden kl. 22 — ellers
  går pladsen videre til køen. Forhindret? Skriv senest torsdag, så
  flytter vi den.</p>
{% endif %}
```

Betingelsen er ikke pynt: uden den får hver eneste kunde der køber et
print at vide at deres plads gælder fredag.

**Skal B4 virke før B3:** byt betingelsen ud med

```liquid
{% assign fredag = false %}
{% for line in order.line_items %}
  {% if line.variant_id == 53935797338440 %}{% assign fredag = true %}{% endif %}
{% endfor %}
{% if fredag %} … {% endif %}
```

— men så er du tilbage ved et variant-ID der er live-data. Tag-vejen er
den holdbare.

### Ordlyden skal matche produktet

Produktbeskrivelsen siger i dag (målt 31/8):

> Pladsen gælder den fredag du har valgt — mød op inden kl. 22, ellers går
> pladsen videre til køen. Bliver du forhindret, så skriv til os senest
> torsdag, så flytter vi pladsen til en anden fredag.

To steder der siger det samme, driver fra hinanden. **Ændrer nogen det ene,
skal det andet med i samme omgang** — det er den eneste vedligeholdelses-
regel her.

---

## Den tredje vej, og hvorfor jeg ikke tog den

Vi kunne bygge tagget selv: en `orders/create`-webhook til en rute i dette
repo, som kalder `tagsAdd`.

Det ville kræve **en Admin-API-token med skriveadgang tilgængelig for
sitet**. I dag holder sitet kun en læse-only Storefront-nøgle. At give den
offentlige flade en Admin-skrivenøgle er en ny angrebsflade og en
arkitekturbeslutning — ikke en opgave.

Den ligger hos **Sirius**, som allerede har CSP-spørgsmålet om `/admin` på
bordet. To beslutninger om hvor meget magt den offentlige flade skal have,
bør tages af den samme person på samme tid.

*Villy, S576. Ændres opsætningen, ændres denne fil i samme omgang.*
