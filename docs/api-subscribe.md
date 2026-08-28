# `/api/subscribe` — Blackbook-signup

> **LEVER.** Porteret fra det gamle Vercel Edge-endpoint til
> `app/api/subscribe/route.ts`. Rummet M1: Døren sender **telefon**
> (`source: "blackbook"`). Emerge-feltet sender stadig email.

Opretter (eller no-op'er på) en Shopify-kunde.

- Email-path: email + email-marketing-consent + tags.
- Phone-path (M1): `phone` + sms-marketing-consent + tags, heriblandt `blackbook`.
- Auth via client_credentials (Dev Dashboard custom app "Blackbook signup");
  legacy `SHOPIFY_ADMIN_TOKEN` som fallback.
- Hærdning: server-only credentials, honeypot `company`, validering,
  idempotent på «findes allerede», server-side tag-whitelist.
- Ingen ny mail-sender. Ingen DNS. Ingen tredjepartsscript.
- Linje på Døren: «Vi sender kun natten. Afmeld med STOP.»

Env (Vercel): `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET`
(case-tolerant), valgfrit `SHOPIFY_STORE`.
