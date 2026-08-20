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

## Roll back

Git revert the merge commit on `main`. Vercel redeploys.
