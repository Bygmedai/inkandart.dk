# M4-indstillinger — booking-sømmen

Grok, 29. august 2026. Til Haruki.

## Hvordan kunden lander på `/booking/tak` efter Book.dk

CHOSEN PATH (simplest that works Sunday): Book.dk har ingen pålidelig custom redirect vi styrer i weekenden. Vi udgiver en stabil URL https://inkandart.dk/booking/tak og lægger det link i Book.dk-bekræftelsen (mail/skærm) når Sonja/Steven kan lime det.

Shopify-checkout for depositum returnerer ikke til vores domæne (cart-permalink er Shopify-hosted). Betalt visning er `?betalt=1` indtil videre. Ingen ny betalingsinfra. Intet ud over booking@ til menneske-mail.

## Depositum

variantId `53492757627208`, 100 kr, cart-permalink via `cartUrl`.

`/booking` — «Depositum 100 kr — fragår i prisen» + «Videre til booking» (klædt hop til https://inkart.book.dk/). Stolen og Huset går til `/booking`, ikke direkte til Book.dk.

`/booking/tak` — ubetalt: «Din tid er sat. Betal depositum nu» + samme 100 kr-knap. Betalt: `?betalt=1` → «Depositum er betalt.» Konsekvens ved ubetalt er `[AFVENTER STEVEN]` — branchen er bygget, uden kundetekst.
