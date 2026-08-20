# inkandart.dk

Landing site for **Ink & Art Copenhagen** — tatovør- og piercingstudio på
Larsbjørnsstræde 13, København K.

**Live:** https://inkandart.dk

---

## Documentation

Den fulde tekniske dokumentation lever i [`docs/`](docs/README.md):

- [`docs/KROG-EMERGE-v0.1-LOCK.md`](docs/KROG-EMERGE-v0.1-LOCK.md) — Låst design-spec
- [`docs/architecture.md`](docs/architecture.md) — Next.js-stack, CSP, cutover
- [`docs/routes-migration.md`](docs/routes-migration.md) — 308-matrix + 410
- [`docs/runbook.md`](docs/runbook.md) — Local, content, deploy
- [`docs/security-deps-v0.1.md`](docs/security-deps-v0.1.md) — High-severity classification

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
npm ci
npm run dev        # http://localhost:3000
npm run typecheck && npm test && npm run build
```

Content: `lib/site.ts`, `lib/aftercare.ts`, `lib/legend.ts`, `public/`.

Live ruter: `/`, `/aftercare`, `/privatlivspolitik`. Øvrige gamle URL'er: se [`docs/routes-migration.md`](docs/routes-migration.md).

---

## Owner

Steven Wensley · steven@bygmedai.dk · [bygmedai.dk](https://www.bygmedai.dk)
