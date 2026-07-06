# IA_HUB_MATURITY_00 — Route & Canon Lock

**Type:** docs-only (no code changes in this PR)
**Repo:** `Bygmedai/inkandart.dk` (target · 11ty brand-hub)
**Canon:** `Bygmedai/inkandart-webshop` — **primary surface `app/`** (Expo/React-Native app · the most-matured expression of the brand). CSS-translation reference: `src/` `design.css` (Vite storefront — *same tokens*, expressed as web CSS).
**Build owner:** Haruki · **Architecture owner:** Sirius · **Merge gate:** Steven
**Method:** 11ty-native maturation. NOT a React port, NOT a shop clone, NOT an all-pages rewrite.
**Grounding:** Every route below is verified against the *built artefact* (`npx @11ty/eleventy` → `_site/**/*.html`), not the README. Every token/copy claim is read from the actual stylesheets and `i18n`, not from prose.

---

## 0. Purpose

Sirius' ruling: mature every inkandart.dk subpage so it matches the app/webshop's UX rhythm, copy tone and visual language — while inkandart.dk stays the 11ty public brand-hub (SEO, studio, walk-in, artists, booking, location, intake, bridges). This PR locks the map before any pixel moves. Its whole value is *truth over feeling* — so it exists precisely to catch "navigation as wishlist" and stale assumptions before we design against them.

**Canon surface (refined per Steven, S522):** within `inkandart-webshop` the **app (`app/`) is the primary canon** — it is the fuller, more-matured build (richer home narrative, more surfaces: aftercare · wizard · drop/event detail · Studio tab · a real `data/` content layer). The web storefront `src/` is a slimmer web cut of the *same design language*. Verified: `app/constants/theme.ts` tokens are **identical** to `src/styles/design.css` (dark `#131210` / `#f3efe7` / accent `#d8321b`, same Grenze/Epilogue/Fustat, same prototype `Univers.html [data-theme=mork]`). So we take **content · IA · copy · section-narrative · intent from the app**, and use `src/design.css` only as the practical **CSS-translation reference** (the app is React-Native StyleSheet, not browser CSS). This refines Sirius' ruling (which cited web-storefront patterns) without conflicting with it — same DNA, fuller source. Sirius to ratify.

---

## 1. Truth corrections (assumption vs shipped reality)

Three canon-facing beliefs did not survive contact with the code. Recording them so we build from reality:

| Claim (source) | Reality (verified) | Consequence |
|---|---|---|
| "inkandart.dk uses Bebas Neue + Space Mono" (`README.md` → Stack) | `src/_assets/css/style.css :root` declares `--black:'Grenze Gotisch'; --disp:'Epilogue'; --body:'Fustat'`. Bebas/Space Mono `.woff2` files exist but are **unreferenced** in CSS. | README is **stale**. Font foundation already matches canon. Bebas/SpaceMono = dead files → cleanup candidate (not a PR-0 action). |
| "Canon is ecru `#f4f2ec` + vermilion + dark footer" (`inkandart-webshop/BRIEF.md`, `README.md`) | Shipped `inkandart-webshop/src/styles/design.css :root` is **dark-first**: `--paper:#131210; --ink:#f3efe7; --foot:#0a0908; --accent:#d8321b`. | BRIEF describes the *older DNA*; the **shipped** storefront is dark cinematic. Canon = dark. |
| DA/EN parity might be broken (only `src/en/privacy.njk` exists on disk) | Build emits full EN parity — every DA page paginates to a `/en/` sister (13 EN HTML files incl. artists). | Parity is **intact**. No action needed. |
| "Web storefront `src/` is canon" (implied by Sirius citing Home=Hero·Manifest·Entries·OrbitDoor) | `app/` is the **fuller, more-matured** build (richer home, aftercare/wizard/drop/event surfaces, `data/` content layer); `app/theme.ts` == `src/design.css` tokens. | **App = primary canon** for content/IA/copy; `src/design.css` = CSS-translation reference. |

**Net:** fonts already compatible; accent already identical; the real visual gap is **theme inversion (light hub → dark canon)**, not typography.

---

## 2. Route inventory — DA/EN (verified from `_site/`)

All routes below were emitted by a clean build. Every DA page has a working EN sister.

| # | DA route | EN route | Page source | Status |
|---|---|---|---|---|
| 1 | `/` | `/en/` | `src/index.njk` | live |
| 2 | `/walk-in/` | `/en/walk-in/` | `src/walk-in.njk` | live |
| 3 | `/artister/` | `/en/artists/` | `src/artister.njk` | live |
| 4 | `/artister/<slug>/` ×6 | `/en/artists/<slug>/` ×6 | `src/_artists/*.md` → `layouts/artist.njk` | live (emil, jonas, liv, maja, nizar, simone) |
| 5 | `/flash/` | `/en/flash/` | `src/flash.njk` | live |
| 6 | `/find-din-tatovering/` | `/en/find-your-tattoo/` | `src/find-din-tatovering.njk` | live |
| 7 | `/del-din-ide/` | `/en/share-your-idea/` | `src/del-din-ide.njk` | live |
| 8 | `/privatlivspolitik/` | `/en/privacy/` | `src/privatlivspolitik.njk` · `src/en/privacy.njk` | live (legal) |
| 9 | `/404.html` | (shared) | `src/404.njk` | live |

Total: **27 HTML files** (incl. artist deep pages, both langs). Build ~0.18 s.

---

## 3. Nav audit — linked vs existing

**Topbar (`partials/topbar.njk`)** is NOT a persistent menu. It is a **per-page contextual status strip** (back-link + page label + live/status line). It links only to home + artists-index (as a back target). No wishlist links.

**Footer (`partials/footer.njk`)** is the hub's only real navigation. Audit:

| Footer link | Target | Resolves? |
|---|---|---|
| Walk-in | `/walk-in/` · `/en/walk-in/` | ✅ built |
| Artister | `/artister/` · `/en/artists/` | ✅ built |
| Flash | `/flash/` · `/en/flash/` | ✅ built |
| Find | `/find-din-tatovering/` · `/en/find-your-tattoo/` | ✅ built |
| Lead (Del din idé) | `/del-din-ide/` · `/en/share-your-idea/` | ✅ built |
| Shop ↗ | `site.shopUrl` = `https://shop.inkandart.dk` | external — verify live (PR-6) |
| App ↗ | `site.appUrl` = `https://app.inkandart.dk` | external — verify live (PR-6) |
| Instagram / Facebook / WhatsApp | `site.json` | external — verify live (PR-6) |
| Privacy | `/privatlivspolitik/` · `/en/privacy/` | ✅ built |

**Linked-but-missing (internal): NONE.** No wishlist navigation. The one item to eyeball later: `site.bookingUrl = "https://inkart.book.dk"` (Booksys swap still pending per README) — verify in PR-3/PR-6, do not assume it's live.

---

## 4. Page → canon mapping

Canon surfaces: **App (`app/`, primary)** — tabs Forside · Artister · Studio · Events · Shop + stack aftercare · wizard · artist/[id] · drop/[id] · event/[id]; App Forside modules: hero · manifest · live-status · Ny her? · Lige nu · Menneskene · Universet · Fra værkstedet · Orbit-join. **Web storefront (`src/`, CSS reference)** — Home (Hero→Manifest→Entries→OrbitDoor), Artister, Book, Shop, Univers, Events; shared `SiteBar` + `Footer`; `design.css` primitives.

| inkandart.dk page | Current shape | Canon reference | Maturation intent |
|---|---|---|---|
| `/` | hero → services-marquee → manifest → studio-gallery → locations → hours | **App Forside** (fuller): hero · manifest · live-status · **Ny her?** · Lige nu (event) · Menneskene (featured artist) · Universet · Fra værkstedet (drop) · Orbit-join | Adopt the app's richer narrative: keep hero+manifest; add **live open-status**, a **welcome/"ny her?"** beat, a **what's-on-now** teaser, **featured artist**, **Universet** (6 vectors), a **flash/drop** teaser, and a warm **orbit/lead close**; push locations/hours lower; de-dupe marquee |
| `/walk-in/` | video hero + status/price stamps + about-card + WhatsApp/call + live status | **App Studio/Book** (practical surface) | Keep WhatsApp/call/live-status; adopt Book tone (direct, late-open, no bureaucracy); tighten booking CTA hierarchy |
| `/artister/` + deep | real 6-artist grid (markdown) + deep pages | **App Artister** + `artist/[id]` | Keep real artist data (hub is the *truth source* — canon artist page is placeholder); align cards to canon plate/card grammar; CTA order: portfolio → book → find-your-artist |
| `/flash/` | flash grid (placeholder cards, `flash.json`) | **App Shop/drop** "product-as-hero" | Adopt visual energy; **stay intake, not commerce** (no cart) |
| `/find-din-tatovering/` | 3-question match wizard → artist + price + booking deeplink | **App wizard** "find your artist" | Warm the copy; strengthen match→book handoff |
| `/del-din-ide/` | WhatsApp lead form | **App Orbit-join** (warm lead capture) | Adopt orbit warmth; keep 48h-reply promise; no commerce |
| `/privatlivspolitik/` | legal | (no canon) | Token-only alignment; leave content |

Hub has **no** `Univers`/`Events`/`Shop` pages — those are commerce/culture-motor surfaces owned by the shop/app. Hub reaches them via **bridge links** (shop ↗, app ↗), not by duplicating them.

---

## 5. Visual token delta (hub → canon)

| Token | Hub `style.css` | Canon `design.css` | Action |
|---|---|---|---|
| `--paper` | `#f4f2ec` (light ecru) | `#131210` (near-black) | **Invert → dark-first** (core delta) |
| `--paper-2` | `#ece9e0` | `#1c1a16` | invert |
| `--ink` | `#141414` | `#f3efe7` | invert |
| `--ink-soft` / `--ink-mute` | dark greys | `#b8b2a6` / `#7d776c` | invert |
| `--rule` | `rgba(20,20,20,…)` | `rgba(243,239,231,…)` | invert |
| `--foot` | `#0f0f0e` | `#0a0908` | ~match (nudge) |
| `--accent` | `#d8321b` | `#d8321b` | ✅ identical |
| `--stage` | `1320px` | `1380px` | align to 1380 |
| `--gutter` | `clamp(20px,5vw,72px)` | `clamp(20px,5vw,72px)` | ✅ identical |
| Fonts | Grenze Gotisch / Epilogue / Fustat | Grenze Gotisch / Epilogue / Fustat | ✅ identical (self-hosted — **keep**, do NOT adopt canon's Google Fonts) |

*(Canon tokens are unified across surfaces: `app/constants/theme.ts` dark set == `src/design.css` — so "app vs web storefront" is not a token conflict, only a completeness difference.)*

**Shared class vocabulary to introduce (11ty-safe), lifted from canon `design.css`:** `.stage`, `.display`, `.black`, `.eyebrow`, `.accent`, `.tlink` / `.tlink--ghost`, `.hlink` / `.hlink--solid`, `.announce` (marquee), `.nav` / `.brand`, `.hero__mark`, dark-footer grammar. The hub currently uses page-scoped BEM (`.walk-in__`, `.artists-index__`, `.flash__`, `.find__`, `.lead__`, `.stamp`) — PR-1 adds the canon primitives *alongside* these, it does not rip out BEM.

**Privacy guardrail:** hub keeps **self-hosted fonts**. The webshop pulls Google Fonts as a prototype deviation; the hub must not inherit that (it would send visitor IPs to Google and break the data-sovereignty posture we just cleaned up estate-wide on bygmedai.dk).

---

## 6. Copy-tone delta

Canon voice (app is primary — `app/data/forside.ts` carries the curated *blød tone* ship-default; web `src/i18n.tsx` mirrors it). Key lines:
- Hero: *"Håndværk i bunden, kultur i toppen. Blæk, metal og musik du kan tage med hjem — **et tilhørsforhold, ikke en transaktion**."*
- Manifest: *"Vi er en kulturmotor med håndværk i bunden. Vi sælger ikke en service — vi sælger et tilhørsforhold."*
- Universe: *"Universet — seks vektorer, ét knudepunkt."*
- Studio: *"Døren går altid op for nogen."*
- Orbit: *"Kom i orbit."* (warm lead/close)
- App-only welcome beat: *"Ny her?"* + *"Kom som du er — gå som en del af noget."* (onboarding warmth a stranger-facing hub wants)

Hub voice today leans **punk-xerox dossier**: `MATCH.TXT`, `fileLabel`, `★ 3 QUESTIONS`, `★ 48H REPLY`, heavy stamps. Direction: **adopt** canon warmth (belonging, culturemotor, "døren går op for nogen"), **reduce** stamp/file-code noise on subpages. `adopt` copy tone; `adapt` visual tokens; `translate` UX patterns to 11ty; **do not port** React; **do not invent** artist/product/event facts.

---

## 7. PR sequence

| PR | Name | Scope | Type |
|---|---|---|---|
| **PR-0** | ROUTE_AND_CANON_LOCK | this document | docs-only |
| PR-1 | TOKEN_BRIDGE | dark-first tokens + shared canon primitives (`.stage/.display/.black/.eyebrow/.tlink/.hlink/.announce`), keep self-hosted fonts, no content/route rewrites | CSS-led |
| PR-2 | HOMEPAGE | mature `/` toward Hero → Manifest → Entries → OrbitDoor: add entries grid, sharpen manifest, add orbit close, lower locations/hours, de-dupe marquee | template |
| PR-3 | WALKIN_BOOK | mature `/walk-in/` toward canon **Book** tone; keep WhatsApp/call/live-status; tighten booking CTA; verify `bookingUrl` | template |
| PR-4 | ARTISTS | `/artister/` + deep pages: keep real data, align cards to canon plate grammar, CTA hierarchy | template |
| PR-5 | INTAKE_ROUTES | `/flash/`, `/find-din-tatovering/`, `/del-din-ide/` warmed toward canon; stay intake (no commerce) | template |
| PR-6 | CROSS_REPO_LINK_QA | verify hub→shop / hub→app / booking / social bridges + shop→hub (studio↗) + DA/EN parity + no dead links | QA |

One bounded concern per PR. No all-pages PR. No cross-repo change in one PR.

---

## 8. Red zones (require a new Sirius ruling)

- React port / Vite migration of inkandart.dk
- Shopify / cart / checkout logic on the hub
- Duplicating the shop's product catalog in the hub
- Changing booking-provider semantics
- DNS / domain / Vercel routing changes
- Analytics / cookie-consent model changes
- Removing the DA/EN route strategy
- Adopting Google Fonts (breaks self-hosted privacy posture)
- Inventing artist / product / event facts
- Changing both repos in the same PR

---

## 9. Per-PR acceptance gate

- `npm run build` green
- `npm run validate` (html-validate) green where relevant
- DA/EN parity verified (each touched DA page has a working EN sister)
- No broken internal links
- No new external dependency unless explicitly approved
- No cart/checkout logic on the hub
- Self-hosted fonts preserved (no Google Fonts)
- Visual smoke evidence or a concise handback
- PR body names which canon pattern was translated

---

## 10. First action

Await Steven/Sirius acceptance of this lock. Then PR-1 (TOKEN_BRIDGE) only. No visual changes before the lock is accepted.
