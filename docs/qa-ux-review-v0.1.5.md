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

*Bid 2 og 3 afventer separat brief fra Steven. Denne rapport er bid 1's dokumentation og lukker mod kanonisk reference til alle § og F-numre.*
