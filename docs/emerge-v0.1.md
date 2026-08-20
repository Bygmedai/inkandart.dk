# Ink & Art — Emerge v0.1

Locked first build from Krog (2026-08-20), including the stack lock that arrived after the first cut of the brief.

## Stack (locked)

Next.js 15 App Router · React 19 · Tailwind + one shadcn Button primitive · Framer Motion · GSAP ScrollTrigger · Lenis · CSS marquee.

`style-src` tillader `'unsafe-inline'` fordi GSAP/Framer sætter inline transforms. Ingen Calendly, ingen autoplay-video, ingen partikler.

## v0.1 sektioner

Loading · Hero · to legend-bånd (låst tekst) · Artists · Selected Work · Studio · Booking · Footer.

Header er skjult til første emerge (når legend-båndene kommer i synsfeltet), derefter sticky.

Booking-CTA skriger ikke.

## Cutover

11ty `src/`, `eleventy.config.js`, `api/` og de gamle image/poster-scripts er slettet. Git er arkivet. Redirect-matricen er `lib/redirects.ts`.
