# Architecture — Emerge v0.1

**Canon:** Next.js 15 App Router. The 11ty lock is superseded (Sirius revised ruling, PR #132).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Style | Tailwind v4 + one shadcn Button primitive. Everything else is custom CSS. |
| Motion | GSAP ScrollTrigger (layers, emerge), Framer Motion (loader), Lenis (smooth scroll) |
| Hosting | Vercel. Framework preset: Next.js. Output directory: unset. Build: `next build`. |
| Fonts | Self-hosted Cormorant Garamond, Space Grotesk, Space Mono (OFL) |

## Routes

Live pages: `/`, `/aftercare`, `/privatlivspolitik`.

Retired 11ty URLs are explicit **308** mappings in `lib/redirects.ts`. Unknown `/en/*` paths return **410**. There is no catch-all from English onto the Danish home.

See `docs/routes-migration.md`.

## CSP

`lib/csp.ts` is the runtime policy. `unsafe-inline` is a v0.1 exception for GSAP/Framer/Next, with:

- no `dangerouslySetInnerHTML`
- no user-controlled HTML
- no third-party script origins
- `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`

CI (`tests/csp.test.mjs`) guards the contract.

## Progressive emerge

Content is visible without JavaScript. `public/emerge-boot.js` adds `html.emerge-js` only when our script runs; then unseen sections may rise from ink.

## What we deleted at cutover

`src/` (11ty), `eleventy.config.js`, `api/` (walk-in status mock), `scripts/images.js`, `scripts/poster.js`. Git is the archive.
