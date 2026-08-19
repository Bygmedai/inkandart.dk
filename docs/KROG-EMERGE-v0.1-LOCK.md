# DESIGN SPEC: INK & ART – EMERGE v0.1

**Til:** Grok bygge-agent / Haruki  
**Fra:** Krog (Creative Director)  
**Status:** LÅST TIL FØRSTE BUILD  
**Dato:** 20. august 2026  
**Samlet:** 20. august 2026 — briefen kom i to omgange; dette er den samlede låste tekst.

---

## 1. Kerneidé (én sætning)

Brugeren scroller ikke ned på en tatovørside.  
Brugeren *dukker op* i et landskab af blæk, hvor legender allerede ruller, og hvor hvert valg er permanent.

## 2. Hvad der stjæles (og hvad der dræbes)

**Stjæles fra Medicine Festival:**
- Scroll-drevet emergens (“SCROLL DOWN TO EMERGE”)
- Langsomme, uendelige tekststrømme (rullende legende)
- Atmosfærisk lagdeling (forgrund / midtergrund / baggrund)
- Rolig, næsten rituel tone – ingen hustle

**Dræbes:**
- Pastelfarver, svampe, ugler, natur-romantik
- Generisk “book now”-sprog
- Statiske portfolio-grids uden dybde
- Alt der lugter af “Copenhagen’s best tattoo studio”

## 3. Visuel retning (låst)

**Farvepalette**
- Primær: `#0A0A0A`
- Sekundær: `#1C1210`
- Accent 1: `#8B1E1E` (oxblood)
- Accent 2: `#C9A227` (mat guld)
- Accent 3: `#2A3A3A` (kold grønlig blå – kun sparsomt)
- Tekst: `#E8E0D5`
- Rullende tekst: `#C9A227` eller `#E8E0D5` med lav opacity på baggrundslag

**Typografi**
- Display / logo: Playfair Display eller Cormorant Garamond; body Inter eller Space Grotesk
- Rullende legende: monospace eller stram sans, uppercase, letter-spacing 0.15–0.25em, langsom
- Ingen afrundede knapper. Skarpe kanter. Minimal padding.

**Illustration / billedstil**
- Hero: lagdelt hud-landskab (behandlede mørke hudfotos + blæklinjer, eller custom illustration — anatomisk, mørk, blæk-tung)
- Ingen lyse, rene studio-fotos i hero. Portfolio må gerne være skarpt. Hero er mytisk.

## 4. UX-flow (låst)

1. Loading: Kort, sort skærm med poetisk linje (“The mark is already waiting”) + langsom fade.
2. Hero: Full-bleed lagdelt landskab. Centreret logo “INK & ART”. Nederst: “SCROLL DOWN TO EMERGE”.
3. Mens man scroller:
   - Baggrundslag bevæger sig langsommere end forgrund.
   - Rullende legende-bånd glider ind fra siderne eller kører uendeligt.
   - Indhold (artists, work, booking) “dukker op” – ikke bare fade-in, men stiger op af blækket.
4. Ingen sticky header i starten. Header dukker først op efter første emerge.
5. Booking-CTA er aldrig skrigende. Den ligger stille og venter.

## 5. Rullende legende – tekst (låst til v0.1)

- THE SKIN REMEMBERS WHAT THE MIND FORGETS
- EVERY LINE IS A DECISION YOU CANNOT TAKE BACK
- WE WRITE THE STORIES PEOPLE CARRY FOREVER
- INK IS THE ONLY HONEST BIOGRAPHY
- THE MARK IS ALREADY WAITING
- PERMANENCE IS THE POINT

Hastighed: 20–40 sekunder for en fuld cyklus. Pause on hover. Gradient-fade i kanterne.

## 6. Teknisk stack (låst – ingen diskussion)

- Next.js 15 (App Router)
- React 19
- Tailwind + shadcn/ui (kun primitives — resten custom)
- Framer Motion
- GSAP + ScrollTrigger
- Lenis (valgfrit, anbefalet)
- CSS infinite marquee
- Ingen Webflow. Ingen Framer Sites. Ejet kode.

**Performance:** Lighthouse Performance ≥ 90 desktop. WebP/AVIF + lazy. Ingen autoplay-video i hero.

## 7. Side-struktur (v0.1 scope)

Loading · Hero · Rullende legende (min. to bånd) · Artists · Selected Work · Studio / About · Booking · Footer.

Ingen blog. Ingen shop. Ingen testimonials.

## 8. Build-order (Rille 1–3)

1. Scaffold + hero + ét legend-bånd  
2. GSAP på lag, andet bånd, artists emerge  
3. Work + booking + loading + mobil

## 9. Hard stops

Ingen pastelfarver. Ingen “Book your appointment today”. Ingen fladt portfolio-grid. Ingen auto-playing musik eller tunge partikler. Tekst må aldrig føles som marketing.

## 10. Succeskriterium

En fremmed lander, scroller langsomt, og føler at de er trådt ind et sted hvor blæk allerede er i gang.
