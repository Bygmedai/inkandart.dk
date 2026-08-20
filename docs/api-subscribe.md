# `/api/subscribe` — Blackbook-signup (porteret ved Emerge-cutover)

> **LEVER.** Porteret 1:1 fra det gamle Vercel Edge-endpoint til
> `app/api/subscribe/route.ts` (Haruki-review S566 F2; Stevens valg 20/8:
> portér — leadlisten er et aktiv). UI: stille email-felt i booking-zonen
> (`BlackbookSignup` i `SceneV05.tsx`), `source: "emerge"`.

Opretter (eller no-op'er på) en Shopify-kunde med email-marketing-consent.
Auth via client_credentials (Dev Dashboard custom app "Blackbook signup");
legacy `SHOPIFY_ADMIN_TOKEN` respekteres som fallback. Hærdning uændret:
server-only credentials, honeypot, email-validering, idempotent på "taken",
server-side tag-whitelist.

Env (Vercel, uændrede navne): `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET`
(case-tolerant læsning), valgfrit `SHOPIFY_STORE`.
