# inkandart.dk

Landing site for **Ink & Art Copenhagen** — tatovør- og piercingstudio på
Larsbjørnsstræde 13, København K.

**Live:** https://inkandart.dk

---

## Documentation

Den fulde tekniske dokumentation lever i [`docs/`](docs/README.md):

- [`docs/emerge-v0.1.md`](docs/emerge-v0.1.md) — Låst Emerge-spec + Next.js 15-stack
- [`docs/README.md`](docs/README.md) — Index + Sprint 1 changelog
- [`docs/architecture.md`](docs/architecture.md) — Ældre 11ty-arkitektur (ikke længere build-target)
- [`docs/runbook.md`](docs/runbook.md) — Stevens operationelle playbook (artists, billeder, deploys, rollback)
- [`docs/api-status.md`](docs/api-status.md) — `/api/status` kontrakt + Booksys-swap-plan
- [`docs/ux-journey.md`](docs/ux-journey.md) — Cross-page UX-mønstre (topbar, lang-toggle, hero-stempler)

---

## Stack

- Next.js 15 (App Router) + React 19 — Emerge v0.1
- Tailwind + shadcn Button-primitive · GSAP ScrollTrigger · Framer Motion · Lenis
- [Vercel](https://vercel.com/) — hosting + auto-deploy fra `main`
- Self-hosted fonts (Cormorant Garamond, Space Grotesk, Space Mono)

Detaljer: [`docs/emerge-v0.1.md`](docs/emerge-v0.1.md).

---

## Quickstart

```bash
nvm use            # Node 20
npm install
npm run dev        # http://localhost:3000
npm run build      # Next.js production build
```

---

## Single source of truth: `src/_data/`

| Fil | Indhold |
|---|---|
| `site.json` | Brand-niveau data (navn, adresse, telefon, hours, social links) |
| `i18n.json` | UI-strenge DA + EN |
| `booking.json` | Booking-config (mock pt., real efter Simone leverer) |

For at opdatere content: rediger filerne (lokalt eller direkte på GitHub),
commit til `main`, Vercel auto-rebuilder ~30 s.

---

## Routes (efter Sprint 1, v0.2.0)

| DA | EN |
|---|---|
| `/` | `/en/` |
| `/walk-in/` | `/en/walk-in/` |
| `/artister/` | `/en/artists/` |
| `/artister/<slug>/` × 6 | `/en/artists/<slug>/` × 6 |
| `/privatlivspolitik/` | `/en/privacy/` |
| `/404.html` | (delt) |

23 sider total. Build < 0.3 s.

---

## Action-items fra Simone (kontent-leverancer pending)

| Item | Status |
|---|---|
| Bekræfte åbningstider | ✅ Bekræftet 2026-05-01 |
| 3-5 fotos af tatto-arbejde, atmosfære, artister | ⏳ Pending |
| Logo i SVG/high-res PNG (currently JPG-conversion) | ⏳ Pending |
| Bekræfte telefon `55 24 86 08` | ✅ Bekræftet 2026-05-01 |
| Email `kontakt@inkandart.dk` (Simply webhotel-upgrade) | ⏳ Decision pending |
| Update Instagram bio til `inkandart.dk` (currently `inknart.dk`) | ✅ Simone bekræftede 2026-05-01, Simone-action |
| **Booksys API-detaljer** (endpoint, auth, deeplink-pattern) | ⏳ Steven har skrevet til Simone |
| **6 artist-portrætter + bios + portfolio** | ⏳ Pending — workflow klar i [runbook.md](docs/runbook.md#tilføj-en-ny-artist) |

---

## Sprint 2 — kandidater (ikke besluttet)

Se [`docs/README.md` → Sprint 2 — kandidater](docs/README.md#sprint-2--kandidater).

Hovedpunkter: real Booksys API-swap, R2 image migration, `@vercel/og` runtime
OG-images, `/walk-in?from=window` toast, cookie-banner re-evaluering.

---

## Owner

Steven Wensley · steven@bygmedai.dk · [bygmedai.dk](https://www.bygmedai.dk)
