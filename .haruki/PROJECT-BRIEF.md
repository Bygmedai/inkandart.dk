# 🐙 INKANDART — Project Brief til Haruki

> **Læs dette FØRST hver gang Inkandart-arbejde aktiveres.** Maks 60 sek læsning.
> Filen lever i Pisserende-Suiten-repoet fordi Inkandart er pilot-tenant.
> Synkroniseres til `Bygmedai/inkandart.dk/.haruki/PROJECT-BRIEF.md` når repo-transfer er done.

**Sidste opdatering:** S404 (2026-05-04)

---

## 30-sekunders kontekst

**Hvad:** `inkandart.dk` — site for Ink & Art Copenhagen, tatovør- og piercingstudio på Larsbjørnsstræde 13, KBH K. Live på inkandart.dk.

**Type:** Pro-bono pilot der danner baseline for **Pisserende Suiten** (multi-tenant tatovør-shop suite). Værdi-frame 25-30k kr ex moms; fakturapris 0 kr — venneordning.

**Kunden:** Simone Chimere (han/ham — IKKE hun, common pitfall). Ejer + lead artist. Kontakt: chimerasimone@gmail.com, primær telefon: 55 24 86 08, IG: @ink.and.art.cph.

**Æstetik:** Punk Xerox — riso-grain, hard-shadow (8/8/0), slight rotation, file-headers, multiply blend. *"Pisserende siden '96"*-tone (rå, ærlig, bandeord velkomne).

---

## Aktuel status (S404)

- **main HEAD:** `22069009fa` (post-PR #18 merge)
- **v0.2 Sprint 1 LIVE:** /walk-in/, /artister/ (6 stub-artister), DA+EN i18n, /api/status Edge function
- **G25-godkendt:** Stevens GO i chat S404: *"hvis den skal se ud som på det jeg vedhæftede, så er det godkendt"*
- **Vercel:** READY på prod, fra1-region, ssoProtection re-aktiveret efter G25
- **Open PRs:** PR #19 — Vilde-on-PR fix (pull_request_target + workflow_dispatch), awaiting Stevens merge

---

## Kanoniske constraints (NON-NEGOTIABLE)

Læs `kunder/ink-and-art-cph/DESIGN-MANUAL-v0.1.5.md` §0.5 før noget design-arbejde. Hovedpunkter:

1. **Tokens kun.** Aldrig hardcoded farver/fonts/spacing/skygger. Brug `:root` CSS-variabler.
2. **Card-variants kun:** `.card.card--paper`, `.card.card--ink`, `.card.card--red`. Ingen nye uden manual-update.
3. **Punk Xerox-mønstre:** file-header (`// FILE: …`), stempler, hard-shadow 8/8/0, rotation -12° til +6°, multiply blend, riso-grain altid.
4. **Mobile-first.** Desktop i `@media (min-width: 768px)`.
5. **Kontrast §2.1:** Body-tekst på paper = `--red-deep` (5.85:1). Body på ink = `--red-on-ink` (5.85:1). `--red` KUN decorative/large (4.31:1, fail på small text).
6. **Reduced-motion respect.** Alle animationer slukkes under `prefers-reduced-motion: reduce`.
7. **CSP-conform §11.8.** Self-hosted everything; ingen Google Fonts CDN, ingen tracking pixels, ingen external scripts.
8. **Ingen Material Design-elementer.** Ingen rounded > 8px, ingen ripple, ingen FAB.

---

## Active spor / next-action-stack

### 🟢 Klar til execution
- **Merge PR #19** (Vilde-fix) — afventer Stevens review
- **Lighthouse-fix-PR** (color-contrast P0, manual-violation per `02-CONFORMITY-SWEEP-PR17`)

### 🟡 Hand-blocked
- **Simone-svar** på book.dk reconcile (BESKED-TIL-SIMONE-S404-book-reconcile.md sendt). 4 spørgsmål: tider/telefon-fix i book.dk, services-config (Tatovering/Piercing/Konsultation × varighed × pris), shop-level vs per-artist, email-strategi
- **Anders-intro:** Drafted, sandsynligvis sendt af Simone. Anders styrer book.dk's API-side
- **Simone-content:** 6 artist-stubs venter på navn + IG + tags + bio + 3-5 portfolio-billeder per stk

### 🟠 Aktiv parking
- **Wall-of-names** (Vilde S4-S5): scaffold ready, awaits 30+ samtykke-batch fra Simone
- **/walk-in/ Phase 2** (live booking-availability): blokeret af services-config + book.dk read-API
- **a11y/perf-fixes:** aria-allowed-role, csp-xss (false positive), target-size, total-byte-weight — separate fix-PR

---

## Tekniske kerne-fakta

- **Stack:** 11ty 3.x + Vercel + Edge functions
- **Repo:** `Bygmedai/inkandart.dk` (transferet S404 fra `Bygmedai/inkandart.dk`)
- **Hosting:** Vercel (team `stevenwensley-a11ys-projects`, region fra1)
- **DNS:** inkandart.dk peger på Vercel
- **Domain-email:** `kontakt@inkandart.dk` afventer Simply webhotel-opgrade
- **Booking:** book.dk (subdomæne `inkart.book.dk`). Intern UI: app.book.dk/calendar med Simones login
- **Booksys-mock:** `api/_lib/booksys-mock.js` returnerer deterministisk slot-array indtil real API
- **Vilde QA:** GitHub Action på alle PRs (efter PR #19 merge)
- **Secrets:** ANTHROPIC_API_KEY (Vilde-on-PR)

---

## Kritiske divergenser at huske

| Felt | Sitet (correct) | book.dk (forældet — Simone skal opdatere) |
|---|---|---|
| Telefon | 55 24 86 08 | 60536068 |
| Mandag | 13:00–23:00 | LUKKET |
| Tirs/ons | 13:00–23:00 | 11:00–19:00 |
| Torsdag | 13:00–23:00 | 17:00–02:00 |

**OBS:** /api/status bruger site.json's tider og siger "ÅBEN NU mandag kl 15" — book.dk ville sige LUKKET. Truthfulness-issue indtil Simone opdaterer book.dk.

---

## Nøgle-filer at læse on-demand

| Hvis spor er... | Læs disse filer |
|---|---|
| Design/visual | `kunder/ink-and-art-cph/DESIGN-MANUAL-v0.1.5.md` (§0.5, §2.1, §12.2) |
| v0.2 spec | `kunder/ink-and-art-cph/v02-DESIGN-SPEC.md` |
| Suite-extraction | `Bygmedai/pisserende-suiten/01-pre-arbejde/01-EXTRACT-MAP-v0.1.md` |
| Tema-arbejde | `Bygmedai/pisserende-suiten/01-pre-arbejde/02-TEMA-TOKEN-AUDIT-v0.1.md` |
| Booking-adapter | `Bygmedai/pisserende-suiten/01-pre-arbejde/03-BOOKING-ADAPTER-SPIKE-v0.1.md` |
| Lighthouse-fixes | `Bygmedai/pisserende-suiten/02-pilot-fixes/01-LIGHTHOUSE-AUDIT-v0.1.md` |
| Vilde-on-PR | `Bygmedai/pisserende-suiten/02-pilot-fixes/03-VILDE-ON-PR-REPAIR-v0.1.md` |
| Kommunikation | `kunder/ink-and-art-cph/Ink kommunikation.docx`, `BESKED-TIL-SIMONE-*.md`, `RAPPORT-TIL-SIMONE-*.md` |

---

## Tone-of-voice for Simone-kommunikation

Per memory `feedback_jeg_ikke_vi_i_udadvendte_tekster.md` og `feedback_kommunikation_skal_være_menneske_venlig.md`:

- **"Jeg" ikke "vi"** (Stevens BygMedAI = én-mand, "vi" lyder fake)
- **Direkte, kollegial.** Ingen marketing-vatten. *"Skriv tilbage når du har 10 min. Ingen hast — sitet kører fint."*
- **Bias mod kortere.** Få punkter, klart formuleret.
- **Tør tone-of-voice match brand.** Bandeord OK i citater (når Simone selv banded). "Pisserende siden '96" er hans formulering, ikke marketing-pige.
- **Værdi-frame altid:** "Pris hvis det havde været et regulært projekt: ~25-30k. Det er din venneordning."

Format: `BESKED-TIL-SIMONE-<scope>.md` i `kunder/ink-and-art-cph/` mappen som blockquote-template Steven kan paste i Messenger.

---

## Historisk progression

- **v0.1 LIVE S395-S396:** 7 PRs merged (#1-7), showcase-niveau på 8 timer
- **v0.1.7 → v0.1.8 S398:** target=_blank-fix + Vilde v2-modning (review + execution)
- **v0.2 spec drafted S397:** A→B sequence (artister → walk-in → wall-of-names) — bekræftet af Steven
- **S401 autonomous-run:** PR #16 (artists.json scaffold) — superseded af #17
- **S402-S403:** Stevens egne autonomous PR'er #17 (Sprint 1 full-stack) + #18 (docs)
- **S404 (denne session):** PR #17+#18 merged + ssoProtection-cleanup + book.dk research + Pisserende Suiten pre-arbejde

---

## Don't-do-list

1. **Ikke "Inkandart Suite"** — det hedder **Pisserende Suiten** per Stevens GO S404
2. **Ikke Simone som "hun"** — han er en mand
3. **Ikke marketing-tone i Simone-kommunikation** — direkte, kollegial, kort
4. **Ikke fjerne Punk-Xerox-elementer** uden manual-update + Steven GO
5. **Ikke push direct til main** — alt via PR
6. **Ikke claim "fixed" / "live"** uden Vercel READY-status verify
7. **Ikke gæt på Simones netværk** — hvis 2. tenant-pipeline diskuteres, afventer Stevens beslutning
8. **Ikke skrive workflow-changes uden Stevens GO** (CI-config = project-level per `feedback_project_level_config_kraever_eksplicit_GO.md`)

---

## Hvis Steven siger "vi skal arbejde på Inkandart"

1. Læs denne brief
2. Tjek main HEAD-SHA via GitHub API for current state
3. Tjek `git log --oneline -5` på lokal clone hvis det er relevant
4. Tjek åbne PRs (`gh pr list` eller GitHub API)
5. Tjek Simone-status: er der nye filer i `kunder/ink-and-art-cph/` med ny dato? Er der ny kommunikation?
6. Brief Steven med: hvad jeg ved, hvad der halter, hvad jeg anbefaler

---

— Haruki, S404. Opdater dette brief når status ændrer sig markant.
