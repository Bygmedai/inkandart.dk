# M2-indstillinger — Stolen og Mærket

Grok, 28. august 2026. Til Haruki.

## edition_ref = Shopify product handle

Ikke GID.

Sonja kan taste handle fra admin-URL (`…/products/sort-hjort-hoodie`). GID er uigennemsigtig og let at lime forkert. Decap-hintet siger det samme.

YAML-modellen er uændret. Tom `edition_ref` på alle værker er den rigtige ops — Hylden siger «Vi laver ikke varer uden værk.» Demo-handles er ikke opdigtet.

## Storefront-env

| Navn | Rolle |
|---|---|
| `SHOPIFY_STOREFRONT_TOKEN` | server-only |
| `NEXT_PUBLIC_SHOPIFY_DOMAIN` | offentligt butiksdomæne (findes allerede i commerce) — **API-kald**: Storefront og Admin bliver på myshopify |
| `NEXT_PUBLIC_SHOPIFY_KASSE` | kassen — det domæne kunden ser: cart-permalinks og produkt-URL'er (#291, 2/9). Ikke sat → falder tilbage til DOMAIN |

Begge skal være sat. Mangler én: `{ products: [], ok: false }`. Intet throw. Preview bygger uden Shopify-env.

Modulet: `lib/storefront.ts`. Token committes aldrig.

## Hylden uden env

YAML uden `edition_ref` → tom hylde, strengen ovenfor.

YAML med handle men uden token/domain → samme tomme hylde (ingen «Shopify mangler»-linje). Produktsiden `/maerket/[handle]` findes stadig fra YAML, men uden købsknap når varianten ikke kan hentes.

## Kurv-indikator uden env

Client-komponent ved siden af Blackbook-prikken (nav + dock). Henter `GET /api/rummet/cart`. Uden env, uden cookie, eller `count < 1` → renderer `null`. Ingen «0». Døren forsvinder ikke.

Med env: Storefront-cart (cookie `rummet_cart`). Checkout er Shopify `checkoutUrl` eller cart-permalink. Ingen hjemmelavet kasse.

## Gavekort U5 — frit

Beløb på Mærket: **500 / 1.000 / 2.000** via eksisterende variant-ID'er i `GIFT_CARDS` + cart-permalink. 100 / 250 / 1500 / 3000 / 4000 vises ikke her.

«frit»: der findes ikke en custom-amount-variant i Shopify og ingen custom-mekanik på `/gavekort` der rammer en rigtig SKU. M2 er et klædt hop til `GIFT_CARD_PRODUCT_URL` (`gavekort-100-til-ink-and-art`). Den produktside er password-gated i huset i dag. Gyldighed/depositum vises ikke (`[AFVENTER STEVEN]` — skjult, ikke kundetekst).

## Foreslåede titler (Haruki godkender)

| Flade | title | description |
|---|---|---|
| Stolen | `Stolen · Ink & Art` (uændret) | `Hvem der sidder i stolen. Ink & Art, Larsbjørnsstræde 13.` |
| Mærket | `Mærket · Ink & Art` | `Væggen og hylden. Ink & Art, Larsbjørnsstræde 13.` |
| Produkt | `{vaerkLabel} · Mærket · Ink & Art` | ingen ny description |

## Spørgsmål til Haruki

1. «frit» hopper til den password-gatede gavekort-produktside. Venter vi på en live custom-SKU, eller er hoppet nok i M2?
2. Væggens Skiltet er `[TAL BEKRÆFTES]` indtil Nizar leverer ét tal pr. værk. Hvor bor tallet, når det kommer — YAML-felt, eller et andet sted? Ikke opfundet her.
3. Håndværk ud over «Tattovør» er stadig [AFVENTER]. YAML rørt ikke.
4. Navngiven gæst uden `periode_til`: periodelinjen er «Gæst» (samme som Huset). Bekræft.
5. Hylden uden Storefront-env bruger den samme tomme streng, også hvis et handle senere sættes. Bekræft at det er degraden — ikke en ny linje.
6. Titlerne i tabellen ovenfor.
