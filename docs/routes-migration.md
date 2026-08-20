# Route migration matrix (308)

Source of truth: `lib/redirects.ts`. Tests: `tests/redirects.test.mjs`.

| Gammel rute | Ny destination |
|---|---|
| `/walk-in/` | `/#booking` |
| `/artister/` | `/#artists` |
| `/artister/nizar/` | `/#artist-nizar` |
| `/artister/:slug/` | `/#artists` |
| `/flash/` | `/#work` |
| `/find-din-tatovering/` | `/#artists` |
| `/del-din-ide/` | `/#booking` |
| `/en/` | `/` |
| `/en/privacy/` | `/privatlivspolitik/` |
| `/en/aftercare/` | `/aftercare/` |
| `/en/walk-in/` | `/#booking` |
| `/en/artists/` | `/#artists` |
| `/en/artists/nizar/` | `/#artist-nizar` |
| `/en/artists/:slug/` | `/#artists` |
| `/en/flash/` | `/#work` |
| `/en/find-your-tattoo/` | `/#artists` |
| `/en/share-your-idea/` | `/#booking` |
| øvrige `/en/*` | **410 Gone** |

Preserved: `/aftercare/` (sikkerhedsindhold).
