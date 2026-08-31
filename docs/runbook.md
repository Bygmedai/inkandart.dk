# Runbook — Ink & Art Emerge

## Local

```bash
nvm use            # Node 20
npm ci
npm run dev        # http://localhost:3000
npm run typecheck
npm test
npm run build
npm run start
```

## Content

- Artists: `lib/site.ts` + portrait in `public/artists/<slug>/`
- Selected work: `lib/site.ts` + files in `public/work/`
- Aftercare copy: `lib/aftercare.ts`
- Legend lines: `lib/legend.ts` (locked)
- Redirects: `lib/redirects.ts`

## Deploy

Vercel project `inkandart-dk`:

- Framework: **Next.js**
- Output directory: **empty**
- Build command: `next build`
- Install: `npm ci`

Preview is produced by the GitHub integration on this branch. Do not set Output Directory to `_site`.

### En merge er ikke det samme som «live»

**Projektet kører staged rollout.** Det er et bevidst valg af Steven (31/8),
truffet for at spare penge — ikke en fejl, og ikke noget der skal fikses.

Konsekvensen for den der arbejder her: **en merge til `main` betyder ikke at
apex viser din ændring.** Udrulningen kan stå `READY` med
`target: production` i timevis uden at få trafik.

Målt 31/8 (Villy), efter fire merges inden for ti minutter:

```
10 af 10 kald til inkandart.dk/stolen/nizar   → dpl_FBwW…  (build fra 14:24)
udrulninger READY siden 14:25 og 14:31        → serverede ikke
set-cookie: _vcrr_…=dpl_FBwW…|0.2931
```

Tidligere samme dag svarede fem kald fra **to forskellige builds** — så
apex kan også være delt, ikke bare forsinket.

**Sådan verificerer du derfor:**

| | |
|---|---|
| En ændring i en PR | mål mod **PR'ens preview-deployment**. Deterministisk. |
| Noget der skal være live | mål apex **flere gange**, og skriv build-id'et med |
| Build-id'et | `curl -s <url> \| grep -o 'data-dpl-id="[^"]*"'` |

En enkelt måling mod apex siger kun hvad *ét* build svarede. Skriv aldrig
«målt i produktion» uden at have samplet — det er præcis den fejl der kostede
en time 31/8, hvor et sæt merges så ud som om de var forsvundet.

**Skal en bestemt udrulning ud nu** — fx en sikkerhedsrettelse — så skal den
promoveres manuelt i Vercel → Deployments. Det er Stevens gate; en agent
ændrer ikke udrulningsindstillinger.

## Roll back

Git revert the merge commit on `main`. Vercel redeploys.
