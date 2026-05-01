# QA/UX Review — inkandart.dk v0.1.5 (Punk Xerox reskin)

**Reviewer:** Claude (sous-chef genanalyse)
**Branch:** `claude/analyze-inkandart-reskin-l066B`
**HEAD:** `4118f2c — feat(v0.2): punk xerox visual reskin`
**Reference:** Bid 1 af 3, Haruki/BygMedAI · 2026-05-01
**Format:** Ny rapport (ikke patch af PR #1).

> **Constraint-disclosure:** Lighthouse, pa11y og rigtige enheds-tests kræver netværk + browser/CI som ikke er til rådighed i sandkassen jeg kører i. Sektion 2 (Lighthouse) og sektion 4 (real-mobile) leveres som **kvalificeret kode-baseret risiko-analyse** med konkrete pegepinde og forventede audits, ikke som målte tal. Alt andet (build, html-validate, kontrast, reduced-motion, print, cookie-banner-flow) er verificeret mod faktiske artefakter.

---

## 0. Tl;dr — prioriteret findings-tabel

| # | Severity | Område | Finding | Fix-pegepind |
|---|---|---|---|---|
| F1 | 🔴 Tier A | Compliance | Gmail eksponeret i markup + JSON-LD | `src/_data/site.json:11`, `src/_includes/partials/contact.njk:14`, `src/_includes/partials/head.njk:54` |
| F2 | 🔴 Tier A | Compliance | `/privatlivspolitik` mangler stadig | Ny rute, footer-link |
| F3 | 🔴 Tier A | Compliance | Cookie-banner sætter ingen tracking, men `_site/index.html` har stadig den hidden `<aside>` — UX/legal-OK, *men* knapperne er ikke jævnbyrdige i tab-rækkefølge ift. visuel orden (se F12) | `src/_includes/partials/cookie-banner.njk:9-12` |
| F4 | 🔴 Tier A | Build | **14 html-validate fejl** (steget fra 13). Detaljer i §1. | `src/_includes/layouts/base.njk:11`, `src/_includes/partials/footer.njk:1`, `services-marquee.njk:4-15`, `site.json:8-9` |
| F5 | 🔴 Tier A | Indhold | "studiokæde" ligger stadig i `tagline` (orphan-data — ikke renderet, men misvisende kanonisk kilde) | `src/_data/site.json:4` |
| F6 | 🔴 Tier A | Indhold | Åbningstider 3 år gamle — eksponeret i baade UI og JSON-LD | `src/_data/site.json:24-32` |
| F7 | 🔴 Tier A | A11y | Kontrast: `.card__link`, `.about-card__text strong`, `.hours__note` — **rød (#c8302d) på paper (#ece6da) ≈ 4.32:1**, fejler WCAG AA (4.5:1) for normal body | `style.css:266, 332-339, 416-422` |
| F8 | 🔴 Tier A | A11y | Kontrast: `.about-card__file`, `.card--ink .card__file`, `.hours__live` — **rød på ink (#0a0908) ≈ 3.71:1**, fejler AA for normal text (passer 3:1 for store/UI) | `style.css:253-259, 359, 398-403` |
| F9 | 🟡 Tier B | A11y | Kontrast: `.footer__meta` muted-soft (#7a756a) på ink ≈ **4.34:1** — borderline AA-fejl | `style.css:461-466` |
| F10 | 🟡 Tier B | A11y | Booking-knap `Book tid →` har "→" som tekst-tegn (ikke decorative). Skærmlæser læser "højrepil". Lille kosmetik-issue. | `partials/hero.njk:33`, `contact.njk:18` |
| F11 | 🟡 Tier B | A11y | `<address>` indeholder kun by/land (`1454 KØBENHAVN K · DANMARK`), ikke gade. Gade står i `<h2>` ovenover. Semantisk svagt — `<address>` bør indeholde *fuld* adresse-blok. | `partials/locations.njk:3-7` |
| F12 | 🟡 Tier B | A11y | Cookie-banner: "Nej tak" og "Accepter" har samme `.btn--outline` styling (jævnbyrdige ✓) men focus-rækkefølge er reject→accept. Datatilsynet kræver ikke specifik rækkefølge, men accept-til-venstre er en kendt dark-pattern-test — vi er på den rigtige side. ✓ Bevar. | `partials/cookie-banner.njk:8-11` |
| F13 | 🟡 Tier B | Schema | `priceRange: "$$"` stadig generisk; ingen `geo`, ingen `additionalType` for piercing | `partials/head.njk:56, 73-77` |
| F14 | 🟡 Tier B | Booking | `bookingUrl: https://inkart.book.dk` ikke verificeret. Hvis dette er Booksys/lignende SaaS-instans, er navnet usædvanligt — typo for `inkandart.book.dk`? | `src/_data/site.json:13` |
| F15 | 🟡 Tier B | Performance | Google Fonts 3rd-party blocking + render-blocking CSS link | `partials/head.njk:34-36` |
| F16 | 🟡 Tier B | Performance | Hero-logo `fetchpriority="high"` ✓ men ingen `<link rel="preload">` for det. 200x200 PNG bør konverteres til WebP/SVG. | `partials/hero.njk:14-17` |
| F17 | 🟡 Tier B | Performance | Inline SVG turbulens i grain-overlay: hver paint koster filterberegning. På low-end mobil = jank-risiko. Overvej cached SVG-fil eller statisk PNG-noise. | `style.css:67-75` |
| F18 | 🟡 Tier B | Print | `@media print`-regel skjuler grain/marquee/cookie/tape, men **`.card--ink` (hours-card) bevarer sort baggrund + cream tekst**. Hvis browser dropper background-print → cream tekst på hvidt = usynlig. | `style.css:537-541` |
| F19 | 🟡 Tier B | Reduced-motion | Reduced-motion-håndtering er korrekt og dækker marquee, smooth-scroll og transitions. ✓ Verificeret. | `style.css:39-46, 301-303`, `js/smooth-scroll.js:11-15` |
| F20 | 🟡 Tier B | Dead code | `smooth-scroll.js` håndterer kun `a[href^="#"]` og eneste interne hash er `#main` skip-link. Praktisk dead-weight (skip-link kan undvære smooth scroll). | `_includes/layouts/base.njk:18`, `js/smooth-scroll.js` |
| F21 | 🟡 Tier B | Mobil-risiko | Hero-wordmark `clamp(72px, 18vw, 280px)` ved 320–420px viewports er på kanten af container-bredde — overflow-risiko der kun kan bekræftes på rigtig enhed | `style.css:210` |
| F22 | 🟡 Tier B | Mobil-risiko | Hero-stempler `position: absolute` i procent — `stamp-1` (top 38%, right 8%) kan overlappe `.about-card` ved kort hero på tablet (768–1024px). | `style.css:238-240, 521-524` |
| F23 | 🟡 Tier B | Æstetik/A11y | `.stamp` med `mix-blend-mode: multiply` rendrer mørkt-på-mørkt hvis stempel havner over about-card (sort). Synlighed ikke kritisk (aria-hidden), men flagrende æstetik. | `style.css:165-178, 238-240` |
| F24 | 🟢 Tier C | A11y | Topbar `<header>` udenfor `<main>` har ingen landmark-rolle og er ikke `<header role="banner">`. Pt. annonceres den som generisk `<header>` med `aria-label="Site status"` — fungerer, men ikke en ægte banner-landmark. | `partials/hero.njk:1-5` |
| F25 | 🟢 Tier C | A11y | `aria-labelledby="hours-heading"` ✓; `aria-labelledby="contact-heading"` peger på `visually-hidden`-h2 (OK pattern, men reviewer-sanity-check passeret). | `partials/contact.njk:3` |

---

## 1. Build + html-validate (Tier A)

### Resultat
```
npm run build:    OK (Eleventy v3.1.5, 4 files written, 0.14s)
npm run validate: ✖ 14 problems (14 errors)
```

### Verifikation af din triage-tabel (afsnit 2 i briefen)
| Dit findings #4 antagelse | Faktisk |
|---|---|
| `prefer-tbody`: sandsynligt løst | ✅ **Løst** — `<table>` udskiftet med `<dl>` i `partials/hours.njk:6-14`. Reglen rapporterer ikke længere. |
| `unique-landmark`: sandsynligt løst | ✅ **Løst** — der er nu kun ét `<main>`. ⚠️ Men `no-redundant-role` på `<footer role="contentinfo">` er en **ny/eksisterende** redundans-fejl (2 forekomster: index + 404). |
| `tel-non-breaking`: sandsynligt fortsat | ✅ Fortsat — 7 forekomster (3 fra hero, 4 fra contact-listen). |
| `no-trailing-whitespace`: sandsynligt fortsat | ✅ Fortsat — 5 forekomster. Kilden er Nunjucks-includes uden whitespace-kontrol. |

### Konkret fejlliste (14 stk)

**`_site/index.html`:**
- L88 — `no-trailing-whitespace`. Fra `base.njk:11` `    {{ content | safe }}`. **Fix:** `{{- content | safe }}`.
- L122 (×4) — `tel-non-breaking`. `Ring 55 24 86 08`. **Fix:** Templatize i `hero.njk:20` til `Ring {{ site.phone | replace(' ', ' ') | safe }}` (ikke-brydende mellemrum) eller hardkod `&nbsp;`.
- L129, L130, L141, L152 — `no-trailing-whitespace`. Fra `services-marquee.njk:4` `{% for pass in [1, 2] %}`. **Fix:** `{%- for pass in [1, 2] -%}` og `{%- endfor -%}`.
- L176 (×3) — `tel-non-breaking`. Fra `contact.njk:8`. **Fix:** Som L122.
- L216 — `no-redundant-role`. **Fix:** `partials/footer.njk:1` — fjern `role="contentinfo"` (top-level `<footer>` har implicit banner-rolle).

**`_site/404.html`:**
- L101 — `no-redundant-role` (samme footer). Fixes automatisk når `partials/footer.njk` rettes.

### Anbefalet samlet patch (kommer ikke i bid 1, men er trivielt en-fil ændring)
```njk
// partials/footer.njk
- <footer class="footer" role="contentinfo">
+ <footer class="footer">

// _includes/layouts/base.njk
-     {{ content | safe }}
+     {{- content | safe -}}

// services-marquee.njk
-     {% for pass in [1, 2] %}
+     {%- for pass in [1, 2] %}
...
-     {% endfor %}
+     {%- endfor %}

// site.json
-   "phone": "55 24 86 08",
+   "phone": "55 24 86 08",
```
(Eller: konverter til `&nbsp;`-injection i template med `safe`-filter for at undgå unicode i JSON.)

---

## 2. Lighthouse — kvalificeret risiko-analyse (Tier A)

**Kan ikke køres i sandkassen** (intet headless-Chrome, intet netværk til at hente fonte/site for fair måling). Følgende er kode-baseret estimat. Steven/Haruki kan validere med `npx lighthouse https://inkandart.dk --view` lokalt.

### Performance — forventede risici

| Audit | Forventet status | Kode-pegepind |
|---|---|---|
| `render-blocking-resources` | ❌ FAIL | `head.njk:36` — Google Fonts CSS er render-blocking |
| `font-display` | ⚠ MARGINAL | `head.njk:36` har `&display=swap` ✓ men selvhostning ikke implementeret |
| `unused-css-rules` | ⚠ Lille spild | 541-linjers single-stylesheet, alt sendes på alle ruter (ikke kritisk for landing page) |
| `largest-contentful-paint` | ⚠ MARGINAL | LCP-element er `.hero__wordmark-line` (Bebas Neue 72-280px). Bebas Neue swap-fallback (Anton/Impact) → CLS-flash. Mobile LCP forventet ~2.0-2.8s afhængigt af 3G. |
| `cumulative-layout-shift` | ⚠ Risiko | `swap` strategy kan skubbe layout. Anbefaling: `font-display: optional` eller selvhost m. preload. |
| `total-byte-weight` | ✓ OK | 200x200 logo PNG + ét CSS-fil + 2 små JS = lille payload. |
| `non-composited-animations` | ⚠ Mulig | `.marquee__track { animation: marquee-scroll 28s linear infinite }` bruger `transform: translateX` — *er* compositor-friendly. ✓ |
| `unsized-images` | ✓ OK | `hero.njk:14` har `width="200" height="200"`. |
| `uses-passive-event-listeners` | ✓ OK | Vores listeners er click — ikke scroll/touchmove. |

**Forventet desktop Performance score:** 88-95.
**Forventet mobile Performance score:** 75-90 — Bebas Neue swap + grain SVG repaint er de største variabler.

### Accessibility — forventede flag
- `color-contrast` ❌ — vil flagge mindst F7 + F8 (rød/paper og rød/ink). F9 (muted-soft/ink) afhænger af font-størrelse-tærskel; Lighthouse kan godkende den som "large" pga. letter-spacing/upper-case, men aksiomer for AA-niveau bør gælde — antag fail.
- `link-name` ✓ — alle links har enten tekst eller mailto/tel.
- `landmark-unique` ✓ (efter at unique-main er løst).
- `region` ✓ — kunne forbedres ved at give topbar landmark-rolle (F24).

**Forventet a11y score:** 85-92 (fra ~95 i v0.1) — kontrast er den dominerende sænker.

### Best Practices
- `csp-xss` ❌ — ingen Content-Security-Policy header (set i `vercel.json` eller meta).
- `errors-in-console` ✓ — ingen åbenlyse JS-fejl.
- `no-vulnerable-libraries` ✓ — ingen runtime libs.

### SEO
- `meta-description` ✓
- `hreflang` ✓ (kun `da` + `x-default`)
- `robots-txt` ✓
- `structured-data` ⚠ — JSON-LD validerer, men `priceRange: "$$"` er konsulent-grade lazy.

**Forventet SEO score:** 95-100.

---

## 3. Kontrast-audit (Tier A)

Beregnet via WCAG 2.1 relative-luminance-formel mod `style.css:16-24` tokens.

| Forgrund | Baggrund | Hex | Ratio | AA Normal (4.5:1) | AA Large/UI (3:1) | Forekomst |
|---|---|---|---|---|---|---|
| ink | paper | #0a0908 / #ece6da | **18.5:1** | ✅ | ✅ | Body-tekst, wordmark INK & ART |
| paper | ink | #ece6da / #0a0908 | **18.5:1** | ✅ | ✅ | About-card, hours-card, footer |
| **red** | **paper** | **#c8302d / #ece6da** | **4.32:1** | ❌ **F7** | ✅ | `.card__link`, `.about-card__text strong`, `.hours__note`, hero CPH-line |
| **red** | **ink** | **#c8302d / #0a0908** | **3.71:1** | ❌ **F8** | ✅ | `.about-card__file`, `.card--ink .card__file`, `.hours__live`, footer__star, topbar__live |
| ink | red | #0a0908 / #c8302d | **5.04:1** | ✅ | ✅ | `.btn--primary` (Book tid), `.card--red` body-tekst |
| paper | red | #ece6da / #c8302d | **4.32:1** | ❌ | ✅ | `.marquee` (aria-hidden ✓ — informationelt OK) |
| muted | paper | #4a463e / #ece6da | **7.56:1** | ✅ | ✅ | `.card__address` |
| **muted-soft** | **ink** | **#7a756a / #0a0908** | **4.34:1** | ❌ **F9** | ✅ | `.footer__meta` |
| red-deep | paper | #a8201d / #ece6da | **5.94:1** | ✅ | ✅ | `.card__link:hover` |

### Anbefalinger til kontrast (uden at sabotere æstetikken)
- **F7 fix:** Brug `--red-deep` (#a8201d) til *body-grade* tekst på paper (`.about-card__text strong`, `.hours__note`, `.card__file` på paper-bg). Behold `--red` til ren-display elementer (wordmark, marquee). Ratio springer fra 4.32→5.94.
- **F8 fix:** Til små rød-på-ink labels: skift `--red` til `#e54f4c` (lysere rød) — bevarer punk-vibe, ratio ~5.0:1.
- **F9 fix:** Bump `--muted-soft` fra `#7a756a` til `#8d8779` — ratio 4.99:1.

Disse ændringer **påvirker ikke** wordmark, knapper, marquee, stempler eller hero-æstetik. De rammer kun små metadata-labels og "fed" tekst i body-flow.

---

## 4. Real-mobile responsiveness (Tier A → kvalificeret)

**Kan ikke testes på rigtig enhed fra sandkassen.** Følgende er statisk geometri-analyse mod CSS-clamps. Anbefal Vercel preview + iPhone SE (375px) + iPhone 14 Pro (393px) + Galaxy S22 Ultra (412px) som test-matrix.

### F21 — Hero wordmark overflow

**Kode:** `style.css:210` — `.hero__wordmark-line { font-size: clamp(72px, 18vw, 280px); }`
- **320px viewport (iPhone SE original):** `18vw = 57.6px → clamped to 72px min`. Tekst "INK & ART" (9 tegn inkl. spaces og `&`) i Bebas Neue (~0.4em width) ≈ 9 × 28.8 = **259px**. Container = 320 − 2 × 20 = **280px**. **Marginalt OK.**
- **375px viewport:** `18vw = 67.5px → 72px`. Samme bredde 259px. Container = 335px. **OK.**
- **400px:** `18vw = 72px → 72px`. Container = 360px. **OK.**
- **420px:** `18vw = 75.6px`. Tekst ≈ 272px. Container = 380px. **OK.**
- **Risiko:** Hvis Bebas Neue swap-fallback Anton/Impact rendrer bredere → midlertidig overflow under font-load. **Anbefaling:** `font-display: optional` eller `size-adjust` matching for fallback.

### F22 — Stempel-overlap

**Kode:** `style.css:238-240` — `hero__stamp-1 { top: 38%; right: 8% }` + `style.css:521-523` skjuler stamp-2/-3 på <768px, men beholder stamp-1.
- **Mobile override (`max-width: 767px`):** `stamp-1 { top: auto; bottom: 12px; right: 8% }`. Sidder i bunden af hero, kan kollidere med `.about-card__cta` knapperne. **Visuelt overlap risiko.**
- **Tablet 768-1024px:** alle 3 stempler aktive. `stamp-1` (top 38%) og `stamp-3` (bottom 44%) ligger begge i lodret midte → kan kollidere indbyrdes ved kort hero. Hero har `min-height: 100vh` så højden er sikret, men *bredderne* er procentbaserede — på 768px bredde er stamp-3 ved left 10% (ved about-card edge).
- **Ingen off-screen-clip** så længe `right: 8%` holdes; men på meget smalle viewports (<340px) kan stamp-1 stikke ud hvis stempel-bredde > 8% paper. Stempel-bredden er `display: inline-block` med `padding: 8px 14px` + tekst — ca. 100-140px. Ved 320px viewport: 8% = 25.6px afstand fra højre, stempel ~120px wide → starter ved 320 − 25.6 − 120 = **174px from left**. Dvs. ikke clipped, men tæt på centrum.

### Marquee læselighed
**Kode:** `style.css:284-291` — `font-size: clamp(18px, 2vw, 22px)`. Ved <400px = 18px med `letter-spacing: 0.28em`. Læseligt. ✅

### About-card med stempler
**Kode:** mobile `style.css:526` `.about-card { transform: none; box-shadow: 6px 6px 0 var(--red); }` — fjerner rotation, OK. Stempel-1 sidder bottom 12px right 8% — kan flyde over `.about-card__cta` knap-row hvis hero har lille højde. **Test påkrævet.**

---

## 5. Reduced-motion (Tier A — verificeret)

| Mekanisme | Implementation | Status |
|---|---|---|
| `html { scroll-behavior: smooth }` override | `style.css:39-40` | ✅ Korrekt |
| Global animation/transition kill | `style.css:41-45` (0.001ms) | ✅ Korrekt |
| Marquee animation | `style.css:301-303` (`animation: none`) | ✅ Eksplicit override (overflødigt pga. global, men bælte+seler er OK) |
| Smooth-scroll JS | `js/smooth-scroll.js:11-15` (matchMedia check) | ✅ Korrekt |

**F19 — Verificeret kompletthed.** Ingen `prefers-reduced-motion` regression.

---

## 6. Print-test (Tier B)

**Kode:** `style.css:537-541`
```css
@media print {
  .grain, .marquee, .cookie-banner, .hero__tape { display: none !important; }
  body { background: white; color: black; }
  .card, .about-card { box-shadow: none; transform: none; border-color: black; }
}
```

### Verificeret findings

✅ **Skjuler:** grain, marquee, cookie-banner, tape — som specificeret i sektion 17 af manualen.

❌ **F18 — Hours-card forbliver mørk-på-mørkt-effektivt.** `.card--ink` (style.css:346-350) sætter `background: var(--ink); color: var(--paper)`. Print-rule overrider transform og box-shadow, men IKKE background+color. Browsere dropper som default `background-image` i print, men ikke nødvendigvis `background-color`. I praksis: cream-tekst på sort baggrund. Hvis bruger printer med "background graphics off" → cream-tekst på hvid = **usynlig**.

❌ **`.card--red` (kontakt-card)** har samme issue: rød bg + ink tekst. Hvis bg droppes → ink-tekst på hvid = læseligt, men røde nuancer i `.card__file` etc. forsvinder.

❌ **`.about-card`** har `background: var(--ink); color: var(--paper)` — samme problem som hours.

❌ **`.btn--primary`, `.btn--ink`, `.btn--ghost`** — alle har farve-baggrunde. Ikke en print-blocker, men en skønhedsfejl (hvide kasser med tekst).

❌ **Stempler (`.stamp`) bevares** men har `mix-blend-mode: multiply` som ikke fungerer i print. De printer som farvede kasser. Bør skjules eller flades.

### Anbefaling (ikke i bid 1, kun pegepind)
```css
@media print {
  .grain, .marquee, .cookie-banner, .hero__tape, .stamp { display: none !important; }
  body, .card, .about-card { background: white !important; color: black !important; }
  .card, .about-card { box-shadow: none; transform: none; border: 1px solid black; }
  .card__file, .about-card__file, .hours__live, .hours__note { color: black !important; }
}
```

---

## 7. Cookie-banner first-load (Tier A — verificeret)

**Kode:** `js/cookie-consent.js:5-22`

| Test | Forventet | Faktisk |
|---|---|---|
| Fresh `localStorage` (no key) | Banner viser | ✅ `if (!stored && banner) banner.hidden = false` |
| Banner i markup | `hidden` attr default | ✅ `cookie-banner.njk:1` |
| Klik "Nej tak" | `localStorage['inkandart-consent-v1'] = 'reject'`, banner hidden | ✅ |
| Klik "Accepter" | Sætter `analytics_storage: granted`, banner hidden | ✅ (men ingen GA4 lazy-load implementeret endnu — kommentar i js:31-33 markerer v0.2-todo) |
| Default-denied Consent Mode v2 | Kører før evt. analytics | ✅ `js:9-16` |
| Reskin regression | Banner-DOM/CSS uændret? | ✅ `cookie-banner.njk` matcher v0.1, `style.css:475-505` ny styling men funktionel adfærd uændret |

**F3 status:** Datatilsynet-compliance OK. Knapper er jævnbyrdige (samme `.btn--outline`-styling, samme størrelse, samme rækkefølge). **Bevar.**

---

## 8. Indholds-verifikation

### F5 — `tagline` er orphan-data
Grep: `grep -rn "studiokæde\|tagline" src/ _site/` → kun `_data/site.json:4`. Tagline rendres **ikke** nogetsteds (modsat min triage-antagelse). Ingen offentlig regression, men kanonisk data er stadig forkert — ret feltet eller slet det.

### F14 — `bookingUrl: https://inkart.book.dk`
Domænet `inkart.book.dk` er usædvanligt format. Booksys/lignende SaaS-tenants bruger normalt `<brand>.<saas>.dk`-mønster, hvilket peger på `inkandart.book.dk` som korrekt. Kan ikke verificeres uden netværk. **Spørg Simone/Nizar før launch.**

### F6 — Åbningstider 3 år gamle
Ikke noget nyt at verificere. `_todo_confirm`-noten i `site.json:25` er stadig synlig og uudført.

---

## 9. Sammenfatning af Tier-A-blokker (før bid 2)

Disse fem skal være lukket før produktions-handover:
1. **F1** — Gmail eksponering (privatlivs-eksponering for ejer).
2. **F2** — `/privatlivspolitik`-rute (juridisk pligt).
3. **F4** — html-validate (14 fejl, alle mekaniske).
4. **F7+F8** — kontrast-fail på rød-tekst-kombinationer.
5. **F6** — Åbningstider verificeres af Simone.

F3 (cookie-banner) og F19 (reduced-motion) er **ikke** blokere — de er verificeret OK.

---

## 10. Hvad jeg ikke kunne dække i denne genanalyse

- **Lighthouse målte tal** — kræver Chromium + netværk.
- **Real-mobile haptics** — kræver fysisk enhed eller BrowserStack/SauceLabs.
- **Network throttling LCP-tal** — kræver ovenstående.
- **`bookingUrl`-DNS-verifikation** — kræver netværk.
- **Visuel verificering af stamp-overlap på 768/1024 viewports** — kræver headless-screenshot.

Disse foreslås kørt af Steven lokalt før bid 2/3 lander.

---

*Bid 1 er afsluttet. Sektion 11+ udgør bid 2 (strategiske forbedringer). Bid 3 (action-tier triage + mockups) lander separat.*

---

# DEL 2 — Strategiske forbedringer (bid 2 af 3)

## 11. Kalibrerings-præmis

Læs dette først, så ranking-logikken i resten af bid 2 giver mening.

Sitet er **showcase-arbejde** for BygMedAI's pipeline. Simone er gratis-kunde, men shoppen har en medejer (Jokeren) hvis netværk er det reelle udbytte hvis vi rammer plet. Det betyder at jeg vægter **brand-impact** og **memorability** højere end Lighthouse-points. En 92/100 mobile Performance-score med en feature der får Jokeren til at sige "fucking nice" slår en 99/100 uden den feature.

Tre kalibrerings-regler jeg har anvendt:

1. **3 perfekt-eksekverede features over 14 halvfærdige.** Hvis et forslag ikke kan ride alene som showcase-element, skæres det.
2. **Værdighed over ydmyghed.** Ingen "billig-version-af"-løsninger. Hellere ingen feature end en kompromitteret en.
3. **18-måneders-test.** Ingen forslag der ser daterede ud i nov 2027. Det udelukker det meste current-trend-dressing (3D-blobs, AI-generative-noise, scroll-jacking).

Jeg foreslår færre features end første review. Dette er bevidst.

---

## 12. Risiko-matrix — alle nye forslag i bid 2

Læg den her ovenpå når du læser sektion 13-22. Hver feature har et kort-ID og refererer til afsnit.

| ID | Forslag | Sektion | Risk | Begrundelse |
|---|---|---|---|---|
| S1 | `/walk-in` rute med QR-poster + simplificeret hero | 13 | 🟢 | Forstærker zine-narrativ — det *er* et issue-printet stykke papir |
| S2 | "Status NU"-strip i topbar (ledig/optaget) drevet af `status.json` | 13 | 🟢 | Punk Xerox elsker realtime-betoning ("ÅBENT NU", "● LIVE") |
| S3 | NFC-tag på facaden → /walk-in | 13 | 🟢 | Fysisk lag, ingen UI-implikation |
| S4 | Marqueed "WALL OF NAMES" — first-name-only stamp-row | 14 | 🟢 | Zine-margin-mumble, ikke CV |
| S5 | `/press` arkiv med scannede artikel-fotos | 14 | 🟢 | Zine-DNA — collage af presseklip |
| S6 | Featured artist of the month — én artist, ét stort billede, én citation | 14 | 🟡 | Kun 🟢 hvis vi disciplinerer sticky-skift; 🔴 hvis det bliver et komplet artist-roster-sub-site |
| S7 | Pris-range FAQ ("FRA 800 KR · MIN 1500 KR") | 15 | 🟢 | Reducerer friction uden at forplumre æstetik — kan være et stempel |
| S8 | "ENGLISH ↗" toggle der peger på `/en` (eller in-place lang-switch) | 15, 18 | 🟡 | Sub-side i fuld engelsk = arbejde; toggle der bare swapper få strenge = OK |
| S9 | Stil-stempler ("BLACKWORK · FINELINE · TRADITIONAL") med portfolio-link | 15 | 🟡 | Skal designes som stempler, ikke piller, ellers slip |
| S10 | Selvhost Bebas Neue + Space Mono | 19 | 🟢 | Æstetik uændret, performance + privacy op |
| S11 | Lokal `scripts/process-images.js` (sharp, EXIF-strip, WebP+JPG, srcset) | 17 | 🟢 | Ren backend, ingen UI-konflikt |
| S12 | `/artists` minimal grid (4-6 cards, hvert med 1 portrait + 1 quote) | 14, 18 | 🟡 | Skal designes i Punk Xerox; et standard "team grid" er 🔴 |
| S13 | GBP-claim + Google Posts pipeline | 20 | 🟢 | Eksternt, ingen UI-impact |
| S14 | Issue-system som *evergreen masthead* (ikke månedlig drop) | 22 | 🟢 | Vi har det allerede; bare bevar disciplinen |
| S15 | Logo hover wobble (yderligere skævrotation) | 21 | 🟢 | Subtil, on-brand |
| S16 | Marquee-pause på hover | 21 | 🟢 | Forventet UX, æstetik bevares |
| S17 | First-visit stamp-stagger entrance (én gang, derefter sticky) | 21 | 🟡 | Skal være under 600ms total ellers gimmicky |
| S18 | Cursor-inkblot-trail | 21 | 🔴 | Sabotage — gør sitet til en SCAD-portfolio fra 2019 |
| S19 | Paper-tear on scroll | 21 | 🔴 | Scroll-jank-risiko + clichéfaktor |
| S20 | Sticky mobil-CTA *som zine-stempel* | 15 | 🟡 | Kun 🟢 hvis det renderer som rotereet stempel; 🔴 hvis Material-pille |
| S21 | Self-host alle assets, drop Google Fonts, intet 3rd-party | 19 | 🟢 | Privacy-uplift, ingen synlig UX-ændring |
| S22 | CSP + Permissions-Policy headers via `vercel.json` | 19 | 🟢 | Ren best-practice, ingen UX-ændring |
| S23 | OpenStreetMap-link sideløbende med Google Maps (privacy-respekt) | 19 | 🟡 | Brugere klikker Maps; OSM som "dev-fnis" link er fint |
| S24 | `/journal` (zine-arkiv, statisk) — én post per kvartal | 22 | 🟡 | Værdifuldt hvis vi disciplinerer; 🔴 hvis det dør efter 2 posts |

**Tier-A-anbefaling (det Steven skal lave):** S1, S2, S7, S10, S15, S16, S21. Det er **7 features**, alle 🟢, og hver enkelt kan stå alene som showcase-element.

**Tier-B-overvejelse:** S6, S9, S12, S20. Kræver Simone's input + design-disciplin.

**Skip:** S18, S19. De saboterer brand'et.

---

## 13. Walk-in-funnelen — geografisk konvertering

### Diagnose
Larsbjørnsstræde er 50m fra Strøget. Sitet er pt. én rute (`/`) der antager intent-drevet trafik (nogen googlede shoppen). Folk der står *uden for døren* og overvejer at træde ind, har en helt anden mental model — de er allerede 80% committed, og sitet er friction, ikke selling.

### Forslag — gradueret ambition

**S1 — `/walk-in` rute (anbefales).** Separat permalink med en simpel hero:
```
INK & ART
YOU'RE OUTSIDE.
COME IN. WE'RE OPEN.

[stempel: ÅBENT NU · GÅ IND]
[stempel: LEDIG ARTIST 14:30]
[knap: BOOK HVIS DU IKKE TØR ↗]
```
Ingen marquee, ingen om-os, ingen cards. Tre elementer: status, knap, telefon. Loader på <1s.

QR-poster i vinduet peger på `https://inkandart.dk/walk-in?from=window`. URL-param triggeer en lille "DU SKANNEDE OS"-toast (rotereret stempel, 3s, fade). Det er showcase-niveau detalje.

**S2 — Status-strip i topbar.** Topbar har allerede pladsen (`● ÅBENT SIDEN '96`). Erstat eller suppleer med:
```
● ÅBEN NU · LEDIG ARTIST 14:30
```
Drevet af `src/_data/status.json` som Simone redigerer manuelt fra telefonen via en simpel form (eller direkte i GitHub-mobile hvis hun er teknisk). 11ty rebuilder ved push → Vercel deployer ny version automatisk på <30s.

```json
{ "open": true, "nextSlot": "14:30", "artist": "Simone", "updated": "2026-05-01T13:42" }
```

Hvis hun glemmer at opdatere → fallback til skemalagt åbningstid baseret på `site.hours`. Ingen 404, ingen forkerte løfter.

**S3 — NFC-tag på facaden.** Sticker bag glasdøren der peger på `/walk-in?from=nfc`. Koster 30 kr i materiale. Ingen software-arbejde efter S1 er bygget. Fysisk-lag-mojo: man tapper sin telefon på en tatto-shops dør og siden åbner. Det er *exact* den slags detalje der får Jokeren til at sige "ej det er sjovt".

### Hvad jeg har skåret væk
- **Geo-aware "du er udenfor"-prompt** — kræver Geolocation API consent + GPS-præcision i bytæt København = 50-100m unøjagtighed. Bryder umiddelbart. 🔴
- **Live-streaming af shoppen** — privacy-mareridt for kunder i stolen. 🔴
- **5-billede-galleri-override fra QR** — interessant, men S1 + S2 leverer 80% af effekten med 30% af arbejdet. Skip indtil Simone har leveret billeder.

---

## 14. Brand-troværdighed uden desperation

### Diagnose
Jokeren-vinkel er guld men eksploiterbart. Reglen er: **vis aldrig, antyd kun.** Zine-æstetikken giver os præcis det leksikon vi har brug for — marginalia, anonymiseret tekst, croppede billeder, scannede artefakter.

### Forslag

**S4 — "WALL OF NAMES" marquee-variant.** En anden marquee-stribe (eller udvidelse af den eksisterende) der scroller fornavne. Ingen efternavne. Eksempel:
```
★ JESPER · ★ SOFIE · ★ MIKI · ★ JONAS · ★ LIV · ★ KAREN · ★ NIZAR · ★ S. · ★ LP. · ★ ANE · ★ T.
```

Initialer som `S.`, `LP.`, `T.` skaber præcis den "indforståede gæst"-følelse uden at dropper navne. Kunder der har siddet i stolen ser det og tænker "er det mig?". Insidere ser det og tænker "er det Jokeren?". Begge læsninger styrker brandet. Ingen påstand kan modbevises.

**S5 — `/press` (zine-arkiv).** Statisk side med 4-6 scannede artikel-klip (Vice, Børsen, Politiken Kultur, blade hvis muligt). Hver er bare et JPG i en let roteret "konvolut" med dato + publikation som figur-tekst. Klik = full-size scan i et lightbox-modal eller bare åbnes i ny fane. Ingen kuraterede citater, ingen "som set i"-bullshit. Bare scanninger. Det giver autoritet uden bragging.

Hvis vi ikke har klip endnu: lad sektionen være tom med en placeholder-stempel `// COMING IN ISSUE.02` — det opretholder issue-mytologien fra topbar.

**S6 — Featured artist (Tier B).** Én artist, ét stort billede, én citation, én "BOOK HOS [navn]"-knap der peger på en booking-deeplink. Skifter hver 2-4 uger, ikke hver dag. Risiko: hvis vi promiserer rotation og den ikke sker, ser sitet dødt ud. **Bevæg ikke ind i dette før Simone har commitet til frekvens.**

**S12 — `/artists` (Tier B).** 4-6 cards, hver med:
- ét sort/hvidt portrait (mix-blend-multiply på paper-bg → grain forenes med foto)
- fornavn + 3 stil-tags (`BLACKWORK · TRADITIONAL · BLACKLINE`)
- ét citat (3-7 ord)
- "INSTAGRAM ↗"-link
- *ikke* bio, *ikke* portfolio (det lever på Instagram)

Cards har samme `card--ink/--red/--paper` styling som forsiden. Roterede 0.5°. Designkonsistens.

### Hvad jeg har skåret væk
- **Eksplicit "Jokeren har en tat herfra"** — ingen, ingen, ingen.
- **Testimonials med stjerner** — 5-stjernede Trustpilot-bokse er æstetisk gift til Punk Xerox.
- **Award-badges** — samme problem.
- **Lange interview-sider** — hvis sitet skal kunne stå i 18 måneder uden vedligehold, skal langtekst-sektioner være tomme.

---

## 15. Friction-map: imaginær brugertest

### Persona
Astrid, 24, fra Stockholm. I KBH lørdag-søndag. Vil have en lille blackwork-piece på underarmen. Bookede ikke på forhånd. Lander på inkandart.dk via Google "tattoo Copenhagen walk in" søndag formiddag 11:00.

### Friction-map (faktisk landing → konvertering)

| Step | Tid | Astrids spørgsmål | Sitets svar | Friction |
|---|---|---|---|---|
| 1 | 0s | "Er stedet seriøst?" | Wordmark, address, professional design | ✅ Lav |
| 2 | 4s | "Laver de blackwork?" | Marquee inkluderer "BLACKWORK" | ✅ OK, men flygtigt |
| 3 | 8s | "Hvilken artist skulle jeg booke hos?" | **Intet artist-roster** | 🔴 Høj — hun ved ikke om hun matcher med nogen |
| 4 | 15s | "Hvad koster det?" | **Intet pris-info** | 🔴 Høj |
| 5 | 20s | "Tager de walk-ins i dag?" | Marquee siger "WALK-INS"; om siden står "Walk-ins ok" som stempel — men ingen rebekræftelse for *i dag* | 🟡 Mellem |
| 6 | 25s | "Taler de engelsk?" | **Intet sprog-signal** — al tekst på dansk | 🔴 Høj |
| 7 | 30s | "Kan jeg gå direkte derhen?" | Adressen er der, Maps-link er der | ✅ OK |
| 8 | 40s | "Skal jeg ringe eller booke online?" | Begge knapper findes | ✅ OK |
| 9 | 60s | Klikker BOOK TID | Lander på `https://inkart.book.dk` (uverificeret URL) | 🔴 Kritisk hvis broken |
| 10 | 90s | Lukker faner, åbner Bang Bangs IG i stedet | – | 🔴 Tabt konvertering |

### Top-3 friction-fixes (rangeret efter ROI)

1. **Pris-range som stempel(S7).** Ét stempel i hero: `FRA 800 KR · TIMEPRIS 1500 KR`. Tager 30 min at implementere. Eliminer 80% af friction-step 4.

2. **Engelsk indikator (S8).** "ENGLISH ↗" link i topbar (lille). Kan i første omgang bare scrolle til en `<aside lang="en">`-sektion på samme side med 5 sætninger:
   > "We do walk-ins. We do blackwork, fineline, traditional. Pricing from 800 DKK. We're 50m from Strøget. Open daily, late."
   Eliminer step 6 i ét move. Senere kan det blive `/en/` med fuld oversættelse hvis ROI viser sig.

3. **Stil-stempler med portfolio-link (S9).** Tre stempler i hero: `BLACKWORK ↗ · FINELINE ↗ · TRADITIONAL ↗` der peger på Instagram-hashtag-deeplinks (`instagram.com/explore/tags/inkandartblackwork/`). Eliminer step 3 (artist-match → stil-match, lavere kognitiv load) + giver Instagram engagement → lokal-SEO bonus.

### Hvad jeg har skåret væk
- **Live-chat widget.** Bryder æstetik (Material Design) + privacy (3rd-party JS). Hvis vi vil have chat: link til WhatsApp eksisterer allerede.
- **Booking-widget embedded.** 🔴 — 3rd-party booking-UI er *altid* Material Design. Ekstern booking-rute er korrekt.
- **FAQ-side.** Folk læser ikke FAQ. Top 3 spørgsmål skal være på forsiden, resten kan være Instagram DM.

---

## 16. Konkurrenceanalyse

| Site | Hvad de gør stærkt | Hvad vi kan stjæle | Risiko for Punk Xerox |
|---|---|---|---|
| **Tarmly Tatovering** (KBH) | Klar artist-roster med stilemærker; book-direkte-pr-artist | Stil-tags som filter (S9 light-version) | 🟢 — kan implementeres som stempler |
| **Black Rose Tattoo** (KBH) | Cleaned booking-funnel; pris-info synligt | Pris-range som stempel (S7) | 🟢 |
| **Kbh Ink** (KBH) | Walk-in-flow + meget stærkt Instagram-feed-embed | IG-feed embed *kan* brydes æstetisk via egen frame; ellers skip | 🟡 — embed = 3rd-party styling |
| **Bang Bang NYC** | Portfolio er hero, ikke om-os; stærk fotograferi-kvalitet på portrætter | Foto-først-tankegangen, men kun når Simone leverer billeder (S11/S12) | 🟢 hvis vi rendrer dem i Punk Xerox; 🔴 hvis vi bare sætter glossy-billeder ind |
| **Sang Bleu** (London) | Editorial blog (`/journal`); tidsskrift-følelse; spreader brand på flere kanaler | Issue-mytologi vi allerede signalerer; lav `/journal` (S24) | 🟢 — perfekt match for Punk Xerox |
| **Mo Coppoletta / The Family Business** (London) | Artist-roster med dybe portfolios; navnedrops i pressekarrusel | Artist-cards (S12) + press-side (S5) | 🟡 — kun hvis vi designer det stramt |
| **Studio Sake** (Berlin) | Minimalistisk one-pager, sort/hvid; ingen forsøg på at "sælge"; insider-only | Vi *er* allerede hér æstetisk; valider at vi ikke svækker det | 🟢 — bekræftelse, ikke opskrift |

### Pattern jeg ser på tværs
De gode tatto-sites er *editorial* eller *minimalistiske*. De dårlige er *e-commerce-templates*. Vi sidder allerede i den rigtige bucket. Strategien er ikke at hoppe op i en højere bucket — det er at *eksekvere vores bucket bedre end de andre i samme bucket*.

### Specifikt det vi kan tage
1. **Sang Bleus journal-disciplin** → S24 (kun hvis Simone er med på 1/kvartal)
2. **Bang Bangs foto-først** → S11 + S12 når billeder lander
3. **Black Rose's pris-transparens** → S7 (gør i denne sprint)
4. **Tarmlys stil-filter** → S9 (gør i denne sprint, som stempler)

Ingen anden konkurrent har en `/walk-in`-rute med QR-flow. Det er der hvor vi kan *vinde* på vertikalen, ikke kun matche.

---

## 17. Photo-asset-pipeline

### Constraint
Self-hosted, gratis-tier. Simone leverer iPhone-fotos af blandet kvalitet, en mappe ad gangen.

### Forslag — `scripts/process-images.js` (S11)

```text
src/_assets/img-raw/         (gitignored, Simones drop-zone)
   IMG_4823.heic
   IMG_4824.jpg
   ...

scripts/process-images.js    (Node + sharp + exiftool-vendor)
   → læser img-raw/
   → strips EXIF (privacy + GPS-leak)
   → resamples til max 1600px på længste kant
   → genererer 400/800/1200/1600 srcset
   → outputter JPEG (q=82) + WebP (q=80)
   → skriver til src/_assets/img/portfolio/
   → rapporterer kompression-ratio

src/_assets/img/portfolio/
   simone-blackwork-01-400.webp
   simone-blackwork-01-400.jpg
   simone-blackwork-01-800.webp
   ...
```

**Workflow:** Simone AirDropper til Stevens Mac → Steven dropper i `img-raw/` → `npm run images` → commit + push. Eleventy rebuilder. Total tid: 2-5 min per drop.

**Markup-pattern:**
```html
<picture>
  <source type="image/webp" srcset="/_assets/img/portfolio/simone-blackwork-01-400.webp 400w, ... 1600w">
  <img src="/_assets/img/portfolio/simone-blackwork-01-800.jpg" srcset="..." sizes="(max-width: 768px) 90vw, 600px" alt="..." loading="lazy" decoding="async" width="800" height="1067">
</picture>
```

**Native lazy-loading** (`loading="lazy"`) frem for IntersectionObserver — bredt understøttet i alle browsere v0.1.5 målgruppen kører. Sparrer JS.

### Hvorfor ikke Cloudinary/imgix
- **Cloudinary free:** 25 credits/måned. Hver transform = ~1 credit. Vi rammer loftet på 25 hero-image-renderinger. Ikke holdbart.
- **imgix:** $0 starter findes ikke længere; cheapest tier $10/mo. Forbudt af brief.
- **Vercel Image Optimization:** $5/1000 transformations efter free-tier. Risikabelt for trafik-spikes.

Self-hosted er **både billigere og mere privacy-respekterende** for denne use-case.

### EXIF-strip
Sharp's `withMetadata({ exif: {} })` fjerner alt. Eller Node's `exiftool-vendor` for sikkerhed.

---

## 18. Lokal-SEO + GBP

### GBP — det Simone skal gøre (vi kan ikke uden hende)
1. Claim `Ink & Art Copenhagen` på Google Business Profile (kræver Google-konto + verifikation pr. postkort til Larsbjørnsstræde 13)
2. Sæt kategorier: *Tattoo Shop* (primær), *Body Piercing Shop* (sekundær)
3. Upload 8-12 billeder (facade, interiør, 4-6 portfolio-stykker, hold/artist)
4. Sæt åbningstider — synkroniser med vores `site.hours`
5. Google Posts ugentligt i 8 uger derefter månedligt (et walk-in-promo, et portfolio-pic, et åbningstid-update)

### Side-struktur for keyword-trækning

Pt: én side. Det rangerer dårligt på diversificerede søgninger. Forslag (kun hvis Simone er med):

| Rute | Primær keyword | Sekundære |
|---|---|---|
| `/` | "tatovør København" | "ink and art cph", "Larsbjørnsstræde tatto" |
| `/walk-in` | "walk in tattoo Copenhagen" | "tattoo without booking København" |
| `/en` (eller `?lang=en`) | "tattoo studio copenhagen city center" | "english speaking tattoo copenhagen" |
| `/piercing` | "piercing København" | "piercing Strøget" |
| `/journal/issue-XX` | long-tail editorial | varies |

### JSON-LD opgrader (relateret F13 fra bid 1)
```json
{
  "@type": ["TattooParlor", "BeautySalon"],
  "additionalType": "https://en.wikipedia.org/wiki/Body_piercing",
  "geo": { "@type": "GeoCoordinates", "latitude": 55.6792, "longitude": 12.5710 },
  "areaServed": "Copenhagen",
  "knowsLanguage": ["da", "en"]
}
```

### Reviews
Embed Google Reviews er fristende, men widget-stylingen er Material. Alternativ: pull-script i `scripts/fetch-reviews.js` (Google Places API, 100 calls/day free) der henter top-3 reviews ind i `_data/reviews.json` og rendres som scannede zettel-cards i Punk Xerox-styling. Tier-B, ikke Tier-A.

### Lokale keywords der ranker for turister
Rapid analyse uden SEMrush, men bekendte mønstre i industrien:
- **High-volume:** "tattoo copenhagen", "tattoo københavn", "walk in tattoo copenhagen"
- **Mid:** "blackwork tattoo copenhagen", "fineline tattoo copenhagen", "english speaking tattoo copenhagen"
- **Long-tail (lav konkurrence, høj konvertering):** "tattoo near strøget", "tattoo open late copenhagen", "tattoo open sunday copenhagen"

Vores natåbning (fre/lør til 05:00) er en **organisk SEO-vinkel** vi ikke udnytter. "Tattoo open late copenhagen" rangerer vi formentlig for med 0 konkurrence. En `<h2>` eller subtitle der nævner *late hours* eksplicit på engelsk = nem gevinst.

---

## 19. Privacy + anti-fingerprinting

### Audit af hvad vi lækker pt.
| Kilde | Hvad lækkes | Til hvem |
|---|---|---|
| `fonts.googleapis.com` + `fonts.gstatic.com` | IP, User-Agent, Referer | Google |
| `https://www.facebook.com/share/...` (footer-link) | Hvis bruger klikker: fuld FB-fingerprint | Meta |
| `https://wa.me/...` (WhatsApp-link) | Tilsvarende | Meta |
| `https://maps.google.com/?q=...` | Google ved bruger så vores side og klikkede til Maps | Google |
| Vercel edge | IP, request-headers | Vercel/AWS |

Konkret leakage er moderat, men Google-fonts er **eneste 3rd-party request der fyrer på *hver* page-load uden klik**. Det er den ene vi skal fjerne.

### Forslag

**S10 — Selvhost Bebas Neue + Space Mono.** Begge er Open Font License. Download fra Google Fonts (eller fontsource.org), drop i `src/_assets/fonts/`, opdater `style.css`:
```css
@font-face {
  font-family: "Bebas Neue";
  src: url("/_assets/fonts/bebas-neue.woff2") format("woff2");
  font-display: swap;
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: "Space Mono";
  src: url("/_assets/fonts/space-mono-regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: "Space Mono";
  src: url("/_assets/fonts/space-mono-bold.woff2") format("woff2");
  font-weight: 700;
  font-display: swap;
}
```

Drop alle `<link rel="preconnect" ...>` og `<link href="https://fonts.googleapis.com/...">` fra `partials/head.njk`. Tilføj `<link rel="preload" as="font" type="font/woff2" href="/_assets/fonts/bebas-neue.woff2" crossorigin>` for hero-LCP-fontet.

**Resultat:**
- 0 third-party requests (modulo CDN)
- LCP forbedring (no DNS lookup, no separate connection)
- Privacy-pristine for førstegangsbesøg
- Fonts cacheable via Cloudflare/Vercel CDN

**S22 — CSP + Permissions-Policy.** Tilføj til `vercel.json`:
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {"key": "Content-Security-Policy", "value": "default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'"},
      {"key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=(), payment=()"},
      {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
      {"key": "X-Content-Type-Options", "value": "nosniff"}
    ]
  }]
}
```

`'unsafe-inline'` for styles er nødvendigt mens vi har inline `<style>` i grain-overlay-SVG. Kan strammes senere ved at flytte til ekstern fil.

Efter S10 + S21 kan `connect-src 'self'` faktisk holde — ingen JS-fetches udadtil.

**S23 — OSM-link sideløbende med Maps.** Lille `[OSM ↗]` link ved siden af Google Maps-linket på location-cardet. Power-users og privacy-folk vil sætte pris på det. 99% af brugere klikker stadig Google Maps.

### Hvad jeg ikke foreslår
- **Fjerne og:- og twitter-meta.** OG-tags er grundlæggende for delings-UX og lækker ikke noget før delingen sker. Behold.
- **Erstat WhatsApp med Signal.** Simone bruger WhatsApp. Brugbarhed slår privacy her.
- **Erstat Vercel med self-hosted.** Out-of-scope og bryder gratis-budget.

---

## 20. Progressive enhancement + no-JS

### Hvad sker når JS er disabled
| Komponent | Adfærd uden JS | Status |
|---|---|---|
| Skip-link `#main` | Browser-native scroll, ingen smooth | ✅ |
| Cookie-banner | Forbliver `hidden` permanent | ✅ Compliance OK — ingen tracking loader nogensinde uden JS |
| Marquee | Kører (CSS-only animation) | ✅ |
| Smooth-scroll | Ingen | ✅ Ikke en regression — funktion findes ikke |
| Booking-knap | Standard `<a href>` til ekstern URL | ✅ |
| Tel-knap | Standard `tel:` link | ✅ |
| Maps-link | Standard `<a>` | ✅ |

### Småfix
- Tilføj `<noscript>` med en lille skjult sætning der ekskluderer cookie-bannerets visuel-disable, så scrapere/textmode-browsere ser at sitet er fuldt funktionelt: ikke nødvendigt, men en lille flag at hejse.
- Cookie-banner-attribut `hidden` virker uden JS — godt, men vi *kan* også bruge en `<noscript><style>.cookie-banner { display: none }</style></noscript>` for at sikre vi ikke skjuler banneret kun via JS når banneret bør være hidden alligevel. Pt. er adfærden korrekt; ingen ændring nødvendig.

### Konklusion
Sitet er allerede progressive-enhanced. Det er en kvalitetsindikator. **Ingen ændring foreslået ud over S10 (selvhost fonts).**

---

## 21. Mikro-interaktioner (de tre vinder)

Punk Xerox er bevidst statisk. Hvert mikrointeractions-forslag skal stå alene og ikke kompromittere "trykt papir"-følelsen.

### S15 — Logo wobble på hover (🟢, ANBEFALES)
```css
.hero__logo {
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}
.hero__logo:hover { transform: rotate(14deg) scale(1.04); }
@media (prefers-reduced-motion: reduce) {
  .hero__logo:hover { transform: rotate(8deg); }
}
```
Eksisterende rotation er 8deg; hovering tipper det til 14deg + tiny zoom. Føles som om man nudger en sticker. Total budget: 6 linjer CSS, 0 JS.

### S16 — Marquee pause på hover (🟢, ANBEFALES)
```css
.marquee:hover .marquee__track,
.marquee:focus-within .marquee__track {
  animation-play-state: paused;
}
```
Lader brugere læse mens de prøver. UX-forventning fra alle bedre marquees. 3 linjer CSS.

### S17 — Stamp-stagger entrance (🟡, OVERVEJ)
```css
.hero__stamp-1, .hero__stamp-2, .hero__stamp-3 {
  animation: stamp-thump 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
.hero__stamp-1 { animation-delay: 0.6s; }
.hero__stamp-2 { animation-delay: 0.85s; }
.hero__stamp-3 { animation-delay: 1.1s; }
@keyframes stamp-thump {
  from { transform: rotate(0) scale(1.4); opacity: 0; }
  to   { /* stempel-specifik rotation */ }
}
```
Risiko: hver stempel har en specifik final rotation (-12°, 6°, -4°). Derfor skal animationen være per-stempel, ikke generel. Det øger kompleksiteten. Kun gør det hvis vi har tid.

### S18 — Cursor-trail (🔴, SKIP)
"Inkblot der følger musen" er Awwwards-2018-pivot. Vil få sitet til at se ud som en SCAD-portfolio. Tilføj kompleksitet (RAF loop, canvas/SVG rendering) for negativt brand-bidrag.

### S19 — Paper-tear on scroll (🔴, SKIP)
Scroll-jacking er fjenden. Reducer-motion-respekt er svært at implementere konsistent når effekten er scroll-driven. Risiko for jank på mid-tier mobil. Det føles smart i prototypen, det føles dårligt i brug.

### Reduced-motion-konsistens
Alle ovenstående 🟢/🟡 bruger `transform`-baseret animation som global regel i `style.css:39-46` allerede slukker (0.001ms duration). Ingen ekstra opt-out kode behøvet.

---

## 22. Issue-system: pro/con og endelig anbefaling

### Pro — månedlig drop-strategi
- **Genbesøgsgrund.** En rationel grund til at vende tilbage hver 4-6 uge.
- **Editorial discipline.** Tvinger Simone til at producere indhold på fast frekvens.
- **SEO-bonus.** Fresh content = bedre crawl-frekvens.
- **Marketing-rytme.** "Issue 04 ude nu" er Instagram-post i sig selv.
- **Æstetisk match.** Punk Xerox *er* zine-æstetik. At blive et faktisk zine er hjerteslag-konsistens.

### Con — månedlig drop-strategi
- **Produktions-overhead.** En tatto-shop ejer driver shoppen, ikke et magasin. Realistisk frekvens er kvartalsvis maksimum.
- **Stale-issue-risiko.** Hvis Issue 03 er live i 9 måneder, skader det brand'et mere end intet zine-system havde gjort.
- **Versioning-lock-in.** Når vi annoncerer "ISSUE.01 / 05.2026" i topbar, skaber vi en mental kontrakt.
- **Content-cliff.** Første tre issues er sjove at lave. Issue 7 er en byrde.
- **Vi er en agency med 3 kunder, ikke 30.** Vi kan ikke holde Simone til en månedlig deadline.

### Endelig anbefaling — S14: evergreen masthead

**Behold issue-mytologien som æstetisk masthead, ikke som content-kontrakt.**

Konkret:
- Topbar siger fortsat `VOL.01 / ISSUE.01 / 05.2026`. Det er det år shoppen blev **rebranded online**, ikke indhold der opdateres.
- Tilføj en lille fodnote (eller bare lad være): `★ MASTHEAD · NOT ISSUED MONTHLY ★` for de hardcore-zine-folk der ville klage. *Eller* lad masthead-uoverensstemmelsen være — det er en zine-konvention at masthead er forført, ikke faktuel.
- Når der **er** ny content (et walk-in-tilbud, en featured artist, en pris-opdatering), bumpes issue til `VOL.01 / ISSUE.02 / xx.2026`. Dvs. issues er **event-driven, ikke kalender-driven.**
- Hvis vi senere bygger `/journal` (S24), bliver issues *kalender-drevne der* — én post per kvartal, hvert med et issue-nummer. Det er overkommelig disciplin.

Den her tilgang giver os 80% af brand-effekten med 5% af content-overheaden. Vi forpligter os ikke til at producere zine-content vi ikke kan levere.

### S24 — `/journal` (kun hvis Simone er med)
4 posts/år. Hver et scannet motiv, en artist-snak (~200 ord), 3 portfolio-billeder, et stempel med dato. Markdown-fil i `src/journal/issue-XX.md`. Eleventy-collection auto-genererer arkiv-side. Maks 1 dag arbejde per issue efter første. Foreslå **kun** hvis Simone underskriver på 4 entries.

---

## 23. Bid-2-konklusion: Stevens shortlist

Hvis Steven vil eksekvere bid 2 i én sprint, er den anbefalede rækkefølge:

**Sprint 1 (1-2 dages arbejde, ingen Simone-input nødvendig):**
1. **S10** — Selvhost fonts. Privacy + performance + fjerner Lighthouse-rødt-flag.
2. **S22** — CSP/headers via `vercel.json`. 30 min arbejde, stort hygiene-løft.
3. **S15** — Logo wobble. 6 linjer CSS.
4. **S16** — Marquee pause. 3 linjer CSS.
5. **S7** — Pris-stempel i hero. Kræver Simones ja til faktiske tal.
6. **S2** — Status-strip i topbar (med fallback til schedule). Kræver `status.json`-konvention etablering.

**Sprint 2 (når Simone er ombord, 2-3 dages arbejde):**
7. **S1** — `/walk-in` rute med QR-flow.
8. **S3** — NFC-tag på facaden.
9. **S11** — Image-pipeline-script (klargøring til når billeder lander).
10. **S8** — Engelsk-sektion (in-page eller `/en`).

**Sprint 3 (kontinuerlig vedligehold):**
11. **S13** — GBP-claim (Simone) + ugentlige posts.
12. **S5** — `/press` (når der er klip at scanne).
13. **S12** — `/artists` (når der er portrætter).

**Eksplicit skip:** S18 (cursor-trail), S19 (paper-tear). De saboterer Punk Xerox.

**Eksplicit Tier-B (kun ved aktiv content-disciplin):** S6 (featured artist rotation), S24 (journal).

---

*Bid 2 lukket.*

---

# DEL 3 — Action-tier triage + mockups (bid 3 af 3)

## 24. Tiered action-liste

Samtlige findings (F1–F25 fra bid 1) og forslag (S1–S24 fra bid 2) tieres efter Harukis kriterier. Tier-grænserne er ikke forhandlelige.

### Tier A — Skal i denne uge
*Juridisk pligt · brand-stoppere · privacy-issues der lækker mere ved jo længere vi venter.*

| ID | Item | Estimat | Afhængighed | Risk | Pegepind |
|---|---|---|---|---|---|
| F1 | Fjern Gmail fra markup + JSON-LD; midlertidigt erstattes med kontaktformular *eller* WhatsApp-only-flow indtil Simply webhotel-opgrade lander | 1.5 t | Beslutning fra Steven (formular vs. Whatsapp-only) | 🟢 | `_data/site.json:11`, `partials/contact.njk:14`, `partials/head.njk:55` |
| F2 | `/privatlivspolitik` rute (Eleventy-side, statisk markdown) — dækker cookies, kontaktdata, hvilke 3rd parties der embeddes (Maps, Whatsapp) | 1 t | Tekstforslag (kan udkast laves af Steven, sendes til Simone for ja) | 🟢 | Ny fil `src/privatlivspolitik.njk`, footer-link i `partials/footer.njk` |
| F14 | Verificer `bookingUrl: https://inkart.book.dk` — hvis broken, midlertidig fjern booking-knapper + erstat med Whatsapp-CTA indtil Booksys-tenant er på plads | 0.5 t (verifikation) + 0.5 t (fix hvis broken) | Steven kører `curl -I` / browser-check; spørg Simone hvis tvivl | 🟢 | `_data/site.json:13` |
| F6 | Verificer åbningstider med Simone; opdater `site.hours.*`; fjern `_todo_confirm`-kommentaren | 0.25 t (efter Simones bekræftelse) | Simone (telefonopkald) | 🟢 | `_data/site.json:24-32` |

**Tier A total: ~3-4 timer + 1 telefonopkald til Simone.** Alle items kan landes i én PR.

### Tier B — Smal-scope batchable, 1-3 timer kombineret
*Kvalitet-løft uden Simone-input · tekniske rensninger · mikro-forbedringer i én PR.*

| ID | Item | Estimat | Afhængighed | Risk | Pegepind |
|---|---|---|---|---|---|
| F4 | 14 html-validate fejl (whitespace via `{{- -%}}`, `tel-non-breaking` via `&nbsp;`, fjern `role="contentinfo"` på footer) | 0.75 t | – | 🟢 | `base.njk:11`, `services-marquee.njk:4-15`, `partials/footer.njk:1`, `_data/site.json:8` |
| F5 | Fix orphan-tagline ("studiokæde") — enten ret til "Tatovør- og piercingstudio i hjertet af København" eller slet feltet | 0.1 t | – | 🟢 | `_data/site.json:4` |
| F7 | Skift body-grade rød fra `--red` til `--red-deep` på `.about-card__text strong`, `.hours__note`, `.card__file` på paper-bg | 0.3 t | – | 🟢 | `style.css:266, 311-317, 416-422` |
| F8 | Tilføj nyt token `--red-bright: #e54f4c`; brug på `.about-card__file`, `.card--ink .card__file`, `.hours__live`, `.topbar__live`, `.footer__star` | 0.4 t | – | 🟢 | `style.css:21, 127, 253-259, 359, 398-403, 460` |
| F9 | Bump `--muted-soft` fra `#7a756a` til `#8d8779` | 0.05 t | – | 🟢 | `style.css:24` |
| F10 | "Book tid →" — wrap "→" i `<span aria-hidden="true">` så SR ikke læser "højrepil" | 0.15 t | – | 🟢 | `partials/hero.njk:33`, `partials/contact.njk:18` |
| F11 | Flyt fuld adresse ind i `<address>` (gade + postnummer + by) i stedet for kun by | 0.15 t | – | 🟢 | `partials/locations.njk:3-7` |
| F13 | JSON-LD: drop `priceRange: "$$"` (eller sæt eksplicit fra `pricing.minDkk` når Tier C lander), tilføj `geo` lat/lon, tilføj `additionalType` for piercing | 0.4 t | – | 🟢 | `partials/head.njk:56, 73-77` |
| F16 | Tilføj `<link rel="preload" as="image" href="/_assets/img/logo.png" fetchpriority="high">` til `<head>` | 0.15 t | – | 🟢 | `partials/head.njk` (top of file) |
| F18 | Print-CSS: tving `.card--ink, .card--red, .about-card { background: white !important; color: black !important; }` + skjul `.stamp` i print | 0.3 t | – | 🟢 | `style.css:537-541` |
| F20 | Slet `smooth-scroll.js` + dens `<script>`-tag (skip-link virker uden) | 0.1 t | – | 🟢 | `js/smooth-scroll.js`, `base.njk:18` |
| F24 | Topbar: skift `<header class="topbar">` til `<aside>` eller flyt udenfor `<main>` med eksplicit `role="banner"` (pt. nested i sketchy semantik) | 0.5 t | – | 🟢 | `partials/hero.njk:1-5`, `base.njk:12-14` |
| S15 | Logo hover wobble (6 linjer CSS) | 0.2 t | – | 🟢 | `style.css:223-236` |
| S16 | Marquee pause på hover (3 linjer CSS) | 0.1 t | – | 🟢 | `style.css:284-303` |
| S17 | Stamp stagger entrance (én gang ved load) | 0.5 t | – | 🟡 | `style.css:165-178, 238-240` |
| S22 | CSP + Permissions-Policy + Referrer-Policy headers via `vercel.json` | 0.5 t | – | 🟢 | `vercel.json` |
| S23 | OSM-link `[OSM ↗]` ved siden af Maps-link | 0.15 t | – | 🟢 | `partials/locations.njk:8-10` |

**Tier B total: ~5 timer.** Lægges i én PR per logisk gruppering (validate-cleanup, contrast-tokens, perf, headers).

### Tier C — Afventer Simones v0.2-input
*Kræver indhold · beslutninger fra Simone · undersider med data fra hende.*

| ID | Item | Estimat | Afhængighed | Risk | Pegepind |
|---|---|---|---|---|---|
| F21 | Real-mobile test af hero-wordmark overflow ved 320-420px | 0.5 t | Steven har en telefon eller Vercel preview deeplink | 🟢 | `style.css:210` |
| F22 | Real-mobile test af stamp-overlap på 768-1024px og <340px | 0.5 t | Steven (samme device) | 🟢 | `style.css:238-240, 521-524` |
| F23 | `mix-blend-mode` stamp-synlighed over `.about-card` (ink-bg) — fix når layout-test bekræfter problemet | 0.3 t | F22 | 🟡 | `style.css:165-178` |
| S2 | Status-strip i topbar drevet af `_data/status.json` | 1 t (impl) + Simone-disciplin | Simone forpligter sig til at opdatere `status.json` (mobile-friendly process) | 🟢 | Se mockup §25.2 |
| S4 | Wall of Names marquee — kræver navne-liste fra Simone | 0.75 t | Simones liste (12-20 fornavne) | 🟢 | Se mockup §25.4 |
| S5 | `/press` arkiv — kræver scannede klip | 1 t (impl) + scan | Simone leverer klip; Steven scanner | 🟢 | Ny fil `src/press.njk` |
| S6 | Featured artist (Tier B-frekvens) | 1.5 t (impl) + content per skift | Simone forpligter sig til 4-uger-rotation | 🟡 | Sub-section i hero eller `/featured` |
| S7 | Pris-stempel `FRA 800 · TIME 1500` | 0.5 t | Simone bekræfter prismatrix (kan være 30-sek-svar) | 🟢 | Se mockup §25.3 |
| S9 | Stil-stempler med Instagram-hashtag-deeplinks (`BLACKWORK ↗ FINELINE ↗ TRADITIONAL ↗`) | 0.5 t | Simone bekræfter shop-IG-hashtags eller foreslår alternativ | 🟡 | `partials/hero.njk` (nye stempler), `_data/site.json` (hashtag-array) |
| S12 | `/artists` 4-6 cards | 2 t (impl) + portrait shoots | Simone leverer portrætter + 1-citat per artist | 🟡 | Ny fil `src/artists.njk` |
| S13 | GBP claim + ugentlige posts | 1 t (Simone-onboarding) | Simone (verifikations-postkort) | 🟢 | Eksternt, ingen kode |

**Tier C total efter Simone er ombord: ~8 timer + content-leverance.**

### Tier D — Langsigtede strategiske moves
*Showcase-features · arkitektur · indholds-strategi · i18n.*

| ID | Item | Estimat | Afhængighed | Risk | Pegepind |
|---|---|---|---|---|---|
| F17 | Cache grain-SVG som ekstern fil (eller statisk PNG-noise) for repaint-perf på low-end mobil | 1 t | Lighthouse-data fra Sprint 1 først | 🟢 | `style.css:67-75`, ny `src/_assets/img/grain.svg` |
| S1 | `/walk-in` rute med QR-flow + `?from=window` toast | 2-3 t (impl) + QR-poster-print | Steven beslutter QR-poster-design + udskrivning | 🟢 | Se mockup §25.1 |
| S3 | NFC-tag på facaden | 1 t (writing tag) + 50 kr (sticker) | S1 lever | 🟢 | Fysisk, ingen kode |
| S8 | English version (`/en` eller in-place toggle) | 4-6 t (fuld) eller 1 t (mini-aside) | Beslutning fra Steven om scope | 🟡 | Ny fil `src/en/index.njk` eller `<aside lang="en">` |
| S10 | Selvhost Bebas Neue + Space Mono | 1 t | – | 🟢 | `partials/head.njk:34-36`, `style.css:26-27`, ny `src/_assets/fonts/` |
| S11 | `scripts/process-images.js` (sharp + EXIF-strip + WebP/JPG srcset) | 2 t | – (skript kan bygges nu, bruges når billeder lander) | 🟢 | Ny `scripts/process-images.js`, `package.json` script-entry |
| S20 | Sticky mobil-CTA *som zine-stempel* | 1.5 t | Skal designes specifikt for at undgå Material-pille | 🟡 | Ny `.cta-sticky.stamp` variant, `style.css` mobile-section |
| S21 | Drop alle 3rd-party requests (konsoliderer med S10) | inkluderet i S10 | – | 🟢 | – |
| S24 | `/journal` (kvartalsvis) | 3 t (impl) + 2 t per post | Simone forpligter sig til 4 entries/år | 🟡 | Ny `src/journal/`, Eleventy-collection |

**Tier D total: ~12-18 timer + Simone-content-disciplin (hvis hun køber S6/S24).**

### Trade-offs der bryder skip-listen — kræver Steven-beslutning

| Trade-off | Hvor | Beslutning |
|---|---|---|
| F1 alternativ: hvis vi vil holde mailto-link på sitet, skal Simone *acceptere* Gmail-eksponering eller fremrykke webhotel-opgrade | F1 | Steven prioriterer: hvis webhotel-opgrade kan ske inden v0.2-launch → vent. Ellers WhatsApp-only-fallback. |
| S8 hvis vi laver `/en` som fuld i18n nu, bryder vi "ikke fuld i18n nu"-skip-reglen | S8 (Tier D) | Anbefaling: gør in-place 5-sætnings `<aside lang="en">` (1 t arbejde, ingen ny rute). Fuld /en venter til v0.3. |
| S20 sticky CTA = breaking change på mobile-overlay; risikerer Punk Xerox hvis ikke designet stramt | S20 (Tier D) | Anbefaling: byg mockup først, vis Steven, Steven beslutter. |

### Items uden action

Verificeret OK — ingen ændring foreslået: F3 (cookie-banner), F12 (button-jævnbyrdighed), F19 (reduced-motion), F25 (aria-labelledby), S14 (issue-system evergreen).

---

## 25. Mockup-skitser (top-impact features)

Fire features valgt på brand-impact + memorability. Hver er konkret nok til at bygge fra.

### 25.1 — Mockup S1: `/walk-in` rute med QR-flow

**Hvor i Punk Xerox:** Ny permalink, genbruger `.hero`, `.stamp`, `.about-card`, `.marquee`, `.footer`. Én ny container-klasse `.walk-in` der overrider `.hero`-grid til en simplere layout med færre stempler og ingen wordmark-CPH-line.

**Filer:**
- `src/walk-in.njk` (ny side, `permalink: /walk-in/index.html`)
- `src/_includes/partials/walk-in-hero.njk` (ny partial)
- `style.css` udvides med `.walk-in__*` regler (ca. 30 linjer, deler tokens med `.hero`)
- `scripts/generate-qr-poster.js` (Node-script der laver et A4-PDF med QR + zine-styling, kører lokalt før print)

**Desktop-layout (1024px):**
```
+--------------------------------------------------------------+
|  ★ ESTD · KBH ★    YOU'RE @ LARSBJØRNSSTRÆDE 13     ●ÅBEN NU |
+--------------------------------------------------------------+
|                                                              |
|     YOU'RE                          [stempel: ÅBEN NU]      |
|     OUTSIDE.                          rotated 8°             |
|     COME IN.                                                 |
|                                     [stempel: ARTIST         |
|     [logo, rotated 8°]                LEDIG 14:30]           |
|                                       rotated -6°            |
|                                                              |
|     +---------------------------------+                      |
|     | // FILE: WALK-IN.TXT            |                      |
|     | Vi laver din tat nu. Eller om  |                      |
|     | en time. Eller i morgen.       |                      |
|     | Døren går altid op for nogen.  |                      |
|     |                                 |                      |
|     | [GÅ IND →]  [RING 55 24 86 08] |                      |
|     +---------------------------------+                      |
|                                                              |
+--------------------------------------------------------------+
| ★ TATTOOS · ★ PIERCINGS · ★ BLACKWORK · ★ WALK-INS  (marquee)|
+--------------------------------------------------------------+
| (footer)                                                     |
+--------------------------------------------------------------+

[TOAST — sticky top-right, kun ved ?from=window/nfc:]
+----------------------+
| ★ DU SKANNEDE OS ★  |   ← .stamp.stamp--red, position:fixed,
+----------------------+      transform: rotate(8deg), 3s auto-dismiss
```

**Tokens brugt:** `--ink`, `--paper`, `--red`, `--red-deep`, `--shadow-red`, `--font-display`, `--font-mono`, `--pad-x`. **Ingen nye tokens.**

**Interaktion:**
1. Side loader normalt — ingen JS påkrævet for visuel
2. Inline JS i bunden af `walk-in.njk` (10 linjer):
```js
const params = new URLSearchParams(location.search);
const from = params.get("from");
if (from === "window" || from === "nfc") {
  const t = document.createElement("div");
  t.className = "toast-stamp stamp stamp--red";
  t.textContent = "★ DU SKANNEDE OS ★";
  t.setAttribute("aria-live", "polite");
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
```
3. CSS for toast:
```css
.toast-stamp {
  position: fixed;
  top: 80px; right: 20px;
  z-index: 200;
  transform: rotate(8deg);
  animation: toast-in 0.3s ease-out, toast-out 0.4s ease-in 2.6s;
}
@keyframes toast-in  { from { transform: rotate(20deg) scale(1.4); opacity: 0; }
                       to   { transform: rotate(8deg)  scale(1);   opacity: 1; } }
@keyframes toast-out { to   { opacity: 0; transform: rotate(8deg) translateY(-20px); } }
```

**Reduced-motion-fallback:**
```css
@media (prefers-reduced-motion: reduce) {
  .toast-stamp { animation: none; }
}
```
Toasten vises stadig men uden ind/ud-bevægelse. Auto-dismiss-timeren bevares (3s). Det er ikke en motion-feature — det er en notification.

**Mobile (<768px):**
- Layout stacker. Logo bliver static, centreret, 120px (samme som forsidens mobile-override).
- Stempler: `stempel-1 (ÅBEN NU)` placeres static, top af hero. `stempel-2 (LEDIG 14:30)` placeres static lige under. Ingen absolute-positionering.
- About-card spans full width, knapperne stacker hvis nødvendigt.
- Toast flytter til bottom: 80px (over hvor en sticky-CTA kunne sidde) for tommel-rækkevidde.

**Cost vs. benefit:**
- Cost: 2-3 timer kode + 30 min QR-poster-design + 50 kr print. Total ~3 timer.
- Benefit: Eneste vertikal-feature ingen konkurrent har. Fysisk-digital bridge. Skanner+toast er showcase-detalje der bliver husket.

**Skip-listen-overholdelse:** ✓ Ingen breaking change på `site.json`. Ingen booking-system-build. Ingen mørkt tema.

---

### 25.2 — Mockup S2: Status-strip i topbar

**Hvor i Punk Xerox:** Erstat eksisterende `.topbar__live`-span (`hero.njk:4`). Genbrug eksisterende `--red`-styling. Ny CSS-class `.topbar__live[data-state]` for state-specifik rendering.

**Filer:**
- `src/_data/status.json` (ny — Simone redigerer denne ene fil)
- `src/_data/openNow.js` (ny computed-data — beregner fallback fra `site.hours` + nuværende tid ved build)
- `partials/hero.njk:1-5` (refaktoreret topbar)
- `style.css:127` (udvidet `.topbar__live` regler, ny pulse-animation)

**`status.json` skema:**
```json
{
  "open": true,
  "nextSlot": "14:30",
  "artist": "Simone",
  "vibe": "rolig",
  "updatedAt": "2026-05-01T13:42:00+02:00"
}
```

**Render-logik (build-time, Eleventy):**
```
hvis status.updatedAt < now - 24h  →  brug openNow-fallback (skemalagt)
ellers                             →  brug status.json
```

`openNow.js` (computed-data, kører ved hver build):
```js
export default async function() {
  const now = new Date();
  const day = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][now.getDay()];
  const hours = (await import("./site.json", {assert:{type:"json"}})).default.hours[day];
  // parse "13:00 – 23:00", returner {open: bool, opensAt, closesAt}
}
```

**Topbar-markup (efter):**
```njk
<header class="topbar" aria-label="Site status">
  <span class="topbar__pill">★ ESTD · KBH ★</span>
  <span class="topbar__issue">VOL.01 / ISSUE.01 / 05.2026</span>
  <span class="topbar__live" data-state="{% if status.open %}open{% else %}closed{% endif %}">
    <span class="topbar__live-dot" aria-hidden="true">●</span>
    {%- if status.open -%}
      ÅBEN NU{% if status.nextSlot %} · LEDIG {{ status.nextSlot }}{% endif %}
    {%- else -%}
      LUKKET · ÅBNER {{ openNow.opensAt }}
    {%- endif -%}
  </span>
</header>
```

**CSS:**
```css
.topbar__live {
  color: var(--red);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.topbar__live[data-state="closed"] { color: var(--muted); }
.topbar__live-dot {
  display: inline-block;
  animation: live-pulse 2s ease-in-out infinite;
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}
@media (prefers-reduced-motion: reduce) {
  .topbar__live-dot { animation: none; opacity: 1; }
}
```

**Tokens:** `--red`, `--muted`, `--font-mono`. **Ingen nye tokens.**

**Interaktion:**
- Pulserende dot signalerer "live data".
- Hover: `.topbar__live` får `title="Sidst opdateret {{ status.updatedAt | dateFormat }}"` som standard browser-tooltip — ingen JS.

**Reduced-motion-fallback:** Pulse stopper, dot står solid rød. ✓

**Mobile:**
- `.topbar__issue` skjules allerede (`style.css:510`).
- `.topbar__live` forbliver. Tekst forkortes via medium-aware copywriting: `● ÅBEN · 14:30` (hvis nextSlot tilstede) eller `● LUKKET`. Implementeres ved at lade Eleventy-template skrive begge varianter inden i samme `<span>` med `display: none` på mobile/desktop:
```css
@media (max-width: 767px) {
  .topbar__live-long  { display: none; }
}
@media (min-width: 768px) {
  .topbar__live-short { display: none; }
}
```

**Simones edit-flow:**
- Hun går ind på GitHub.com mobile, navigerer til `src/_data/status.json`, klikker pen-ikonet, redigerer `nextSlot` + `updatedAt`, commit. Vercel auto-deployer på ~30s.
- Hvis hun glemmer det 24+ timer → fallback overtager. Ingen forkerte løfter.

**Cost vs. benefit:**
- Cost: 1 t impl + 15 min Simone-onboarding-doc.
- Benefit: Topbar går fra dekorativ til funktionel i én move. "● LEDIG 14:30" slår "ÅBNINGSTIDER 13:00-23:00" på handleværdi 10:1.

**Skip-listen-overholdelse:** ✓ Tilføjer `status.json` (ny fil, ikke ændring i `site.json` skema). Simones eneste edit-flade udvides — *ikke* breaking.

---

### 25.3 — Mockup S7: Pris-stempel i hero

**Hvor i Punk Xerox:** Ny `.hero__stamp-4` der reuser `.stamp.stamp--red` styling. Ingen nye komponenter, ingen nye tokens.

**Filer:**
- `_data/site.json` — tilføj `pricing` block
- `partials/hero.njk:22-24` — tilføj 4. stempel
- `style.css:238-240` — tilføj `.hero__stamp-4` positioning
- `partials/hero.njk` — tilføj visually-hidden tekst-alternativ for SEO + SR

**`site.json` (tilføjelse):**
```json
"pricing": {
  "minDkk": 800,
  "hourlyDkk": 1500,
  "currency": "DKK",
  "_todo_confirm": "Verificeret med Simone YYYY-MM-DD"
}
```

**Markup-tilføjelse i `hero.njk` (efter stamp-3, linje 24):**
```njk
<div class="stamp stamp--red hero__stamp-4" aria-hidden="true">
  FRA {{ site.pricing.minDkk }} · TIME {{ site.pricing.hourlyDkk }}
</div>
<p class="visually-hidden">
  Tatovering fra {{ site.pricing.minDkk }} kr. Timepris {{ site.pricing.hourlyDkk }} kr.
</p>
```

**CSS-tilføjelse:**
```css
.hero__stamp-4 {
  position: absolute;
  top: 62%;
  left: 6%;
  transform: rotate(7deg);
}
@media (max-width: 767px) {
  .hero__stamp-4 {
    position: static;
    align-self: start;
    margin: 0;
    transform: rotate(-3deg);
  }
}
```

**Layout-impact desktop:**
```
[wordmark INK & ART]                    [logo, rotated]
                          [stamp-2: No vegan ink]
[stamp-3: zine 01]
                          [stamp-1: Walk-ins ok]
[NEW stamp-4:
 FRA 800 · TIME 1500]
                                        [about-card]
```

`stamp-4` placeres på venstre-midt-bund-side hvor stamp-3 ikke er. Ingen overlap med about-card eller logo.

**Tokens:** `--red`, font-display, `--font-mono` (nedarvet via `.stamp`). **Ingen nye tokens.**

**Interaktion:** Ingen — dekorativt element. **F8-fix anvendt:** rød på paper er nu `--red-deep` for body-tekst, men stempler er **store** UI-elementer der består 3:1 — `.stamp` styling forbliver `--red`.

**Reduced-motion-fallback:** N/A — ingen animation på stempel.

**Mobile (<768px):**
- Stempel-4 går fra `position: absolute` til `static`, placeres som første element efter wordmark, før about-card. Bevares synlig (ulig stamp-2/3 som skjules på mobile).
- Rotation -3° (modsat desktop's +7°) for visuel variation.

**Visually-hidden-paragraph:**
- Stempler er `aria-hidden="true"` → SR læser dem ikke.
- Pris-info er **kritisk friction-fix** (per §15) → må ikke kun være visuel.
- Den `.visually-hidden`-paragraf giver SEO + SR adgang til pris-info uden at duplikere visuelt.

**Cost vs. benefit:**
- Cost: 0.5 t inkl. CSS-tweaks for at undgå overlap med eksisterende stempler.
- Benefit: Eliminerer 80% af friction-step 4 (pris-spørgsmålet) per §15 friction-map. Det er den højeste ROI-fix i hele bid 2.

**Skip-listen-overholdelse:** ✓ Tilføjer `pricing` til `site.json` — ikke breaking, kun additivt.

---

### 25.4 — Mockup S4: Wall of Names marquee

**Hvor i Punk Xerox:** Ny `.marquee--names`-variant af eksisterende `.marquee`. Reuser hele animations-mekanikken; tilføjer reverse-direction og paper-bg som visuelt counterpoint til den røde service-marquee.

**Filer:**
- `_data/wall.json` (ny — Simone udvider listen månedligt)
- `partials/names-marquee.njk` (ny partial)
- `style.css:273-303` (udvides med `.marquee--names` + `.marquee__track--reverse`)
- `index.njk` (include af nye partial efter services-marquee)

**`wall.json` skema:**
```json
{
  "names": [
    "Jesper", "Sofie", "Miki", "Jonas", "Liv",
    "Karen", "Nizar", "S.", "LP.", "Ane", "T.", "Emil"
  ],
  "_note": "Fornavne eller initialer. Ingen efternavne. Tilføj nye, fjern aldrig."
}
```

**Partial:**
```njk
<div class="marquee marquee--names" role="presentation" aria-hidden="true">
  <div class="marquee__track marquee__track--reverse">
    {%- for pass in [1, 2] -%}
    <span class="marquee__group">
      {%- for name in wall.names -%}
      <span>★ {{ name | upper }}</span>
      {%- endfor -%}
    </span>
    {%- endfor -%}
  </div>
</div>
```

**CSS-tilføjelse (efter eksisterende marquee-block):**
```css
.marquee--names {
  background: var(--paper);
  color: var(--ink);
  border-top: 0;
  padding: 10px 0;
  font-size: clamp(13px, 1.4vw, 16px);
  letter-spacing: 0.2em;
}
.marquee--names .marquee__group span:first-child::before {
  /* skip — ingen ekstra dekoration nødvendig */
}
.marquee__track--reverse {
  animation: marquee-scroll-reverse 42s linear infinite;
}
@keyframes marquee-scroll-reverse {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
```

**Layout-impact:**
```
[hero med wordmark + stempler]
+----------------------------------------+
| ★ TATTOOS · ★ PIERCINGS · ...    →    |  ← rød services-marquee, scroller højre→venstre, 28s
+----------------------------------------+
| ★ JESPER · ★ SOFIE · ★ MIKI · ...  ←  |  ← paper names-marquee, scroller venstre→højre, 42s
+----------------------------------------+
[locations + contact info-grid]
```

To marquees i forskellig retning + forskellig hastighed = ægte zine-feel. Hjernen registrerer dem som to forskellige tickers.

**Tokens:** `--paper`, `--ink`, `--font-display`. **Ingen nye tokens.** Border-top droppes for at lade de to marquees grænse direkte op til hinanden (deler bottom-border af services-marquee som top af names-marquee).

**Interaktion:**
- Pause på hover (S16 dækker dette globalt — `.marquee:hover .marquee__track { animation-play-state: paused; }`).
- Ingen klik-handling. Det er navne, ikke links.

**Reduced-motion-fallback:** Animation stopper (global regel `style.css:301-303` udvides til at dække `.marquee__track--reverse`):
```css
@media (prefers-reduced-motion: reduce) {
  .marquee__track,
  .marquee__track--reverse { animation: none; }
}
```
Statiske brugere ser de første ~5-7 navne. Resten er overflow-hidden. Acceptabelt — det er et flux-element, ikke en navigation.

**Mobile (<768px):**
- Font reduceres til 13px.
- Scrolling-hastighed bevares (42s for fuld pass — føles roligt).
- Border-top kan tilføjes på mobile hvis layout kræver det:
```css
@media (max-width: 767px) {
  .marquee--names { border-top: 2px solid var(--ink); }
}
```

**Aria-strategi:**
- `aria-hidden="true"` så SR ikke prøver at læse 24 navne i loop.
- Ingen `<h2>`. Det er decoration. Hvis vi ville give det semantisk vægt: tilføj en `.visually-hidden` `<h2>"Tidligere kunder"</h2>` over partial — men det kollapser ambiguiteten der gør forslaget interessant. **Skip.**

**Cost vs. benefit:**
- Cost: 0.75 t impl + 5 min Simone-input for navne-liste.
- Benefit: Brand-credibility uden desperation. Insiderkultur signaleret uden påstand. Ambiguity-zone (er S. = Simone? Sofie? Stamkunde?) er præcis den intriguefelt vi vil have.

**Skip-listen-overholdelse:** ✓ Tilføjer `wall.json` (ny fil, ikke ændring i `site.json` skema).

---

## 26. Stevens 1-uge dispatch

Hvis Steven kun har én uge til v0.2-launch, er rækkefølgen:

**Dag 1 (Tier A, ~4 timer):**
- F1, F2, F14, F6 — Simone-opkald, fix Gmail/booking/hours, byg `/privatlivspolitik`.

**Dag 2 (Tier B batch 1: validate + a11y, ~2 timer):**
- F4, F5, F7, F8, F9, F10, F11, F24, F18, F20.
- Én PR: `cleanup(v0.1.6): html-validate, kontrast-tokens, semantik`.

**Dag 3 (Tier B batch 2: perf + headers + mikro, ~2 timer):**
- F13, F16, S15, S16, S17, S22, S23.
- Én PR: `chore(v0.1.6): perf, csp, mikro-interaktioner`.

**Dag 4 (Tier C-stykker der kun kræver Simone-1-svar, ~2 timer):**
- S7 (efter pris-bekræftelse) — mockup §25.3.
- S2 status-strip — mockup §25.2 (Simone får 5-min onboarding).

**Dag 5 (Tier D-showcase, ~3-4 timer):**
- S1 `/walk-in` rute — mockup §25.1.
- S10 selvhost fonts (1 t separat).
- S3 NFC-tag bestilles (kommer i posten dag 6-7).

**Hvad der venter til v0.2-rul (efter Simone har leveret content):**
- S4 Wall of Names (mockup §25.4) — kræver navne-liste.
- S5 `/press`, S6 featured artist, S12 `/artists`, S11 image-pipeline-bruge.

**Eksplicit ikke i denne uge:**
- S8 fuld english (kun mini-aside hvis tid), S20 sticky-mobil-CTA, S24 journal, F17 grain-perf-opt.

**Showcase-test efter Sprint 1:** Hvis Steven viser sitet til Jokeren-niveau-publikum efter dag 5, er det F1-F6 (compliance), F4-F18 (kvalitet), S15+S16 (mikro-følelse), S2 (live-puls), S7 (pris-konfidens) og S1 (vertikal-vinkel) der skal være landed. Resten er bonus.

---

*Bid 3 lukket. Rapporten er nu komplet (DEL 1 + DEL 2 + DEL 3) og kan paste'es som dispatch-pakke.*
