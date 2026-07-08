# QA-brief til Vilde — MODULE x Kinky Sundays

**Fra:** Haruki · **Til:** Vilde (adversarial QA) · **Repos:** inkandart.dk (primær), inkandart-webshop (sekundær)
**Opgave:** Find fejl, huller og uoverensstemmelser jeg har overset i Kinky Sundays-arbejdet. Vær adversarisk, evidens-baseret, konkret (citér fil + linje). Rapportér KUN reelle fund.

> Note: din auto-trigger springer markdown-only PRs over. Kør denne som directed audit mod `main` (eller via `workflow_dispatch`), og læs de nævnte filer direkte — de er allerede merged.

## Hvad der er bygget (scope)
- **Tosproget event-landing** (én skabelon, to sprog):
  - Krop: `src/_includes/partials/kinky-body.njk` (renderer fra `d = kinkyDa if lang=='da' else kinky`)
  - EN-side: `src/kinky-sundae.njk` → `/kinky-sundays/` (lang en)
  - DA-side: `src/kinky-sundays-da.njk` → `/kinky-sundays/da/` (lang da)
  - Layout: `src/_includes/layouts/kinky.njk` (lang-aware: html lang, skip-link, og:locale)
  - Copy-data: `src/_data/kinky.json` (EN) + `src/_data/kinkyDa.json` (DA)
  - CSS: `src/_assets/css/kinky-sundae.css`
  - Capture: `src/_assets/js/subscribe.js` + `api/subscribe.js` (Vercel Edge; email → Shopify-kunde m. samtykke; server-side tag-whitelist på `source`)
  - OG: `src/_assets/img/kinky-sundays-og.png`
- **Shopify (live):** presale-billet 200 (variant 53477074731336), House of Friends-kode `HOUSEOFFRIENDS` (−100, kun presale), pakker: Lounge 1.500 (cap 4), Premium table 3/4/5k (cap-gab, se nedenfor), Ambassador VIP Suite 10.000 (cap 1). Alle publiceret til Webshop, requiresShipping=false.

## Målrettet tjekliste (find MINE fejl her)
1. **Sprog-paritet:** gennemgå `kinkyDa.json` mod `kinky.json` felt-for-felt. Manglende/uoversatte felter? Engelsk tekst tilbage på DA-siden (ud over bevidste låneord: Techno, Ink, Kink, Presale, Lounge, DKK, Safer space)? Er `lang`-toggle-links korrekte begge veje? `og:locale`/`<html lang>` rigtige?
2. **Copy-compliance mod Simones plan:** ingen "Sundae" (skal være "Sundays"); lockup MODULE-først overalt; INGEN låst dato offentligt (skal være TBA/placeholder); tid 09:00 (ikke 10:00); priser presale 200 / dør 280; INGEN formulering der antyder tatovering på venue; "Orbit" fjernet fra offentlig copy.
3. **Checkout-korrekthed:** peger alle `/cart/…`-links på de rigtige variant-ID'er? Pakke-`href`'er? Er buy-knappen = 200 (ikke 150)? Premium-produktside-link gyldigt?
4. **CSP:** ingen inline `<script>`/`<style>`; ekstern JS kun `subscribe.js` under `script-src 'self'`; `form-action`/`connect-src 'self'`.
5. **A11y (WCAG 2.1 AA):** buy-knap + pakke-links (`target=_blank` + `rel`), form-felter m. label, honeypot `aria-hidden`, sprog-toggle, pris-kort, kontrast på `--dim` tekst mod mørk baggrund.
6. **Commercials mod masterark:** priser + HoF-scope (kun presale, ikke pakker); pakke-caps (Lounge 4 / VIP 1). **Kendt gab:** Premium table er "2 borde i alt" men produktet har 3 pris-tiers → Shopify capper pr. variant, ikke total.
7. **Timing/dato-gab:** presale + pakker er **ACTIVE/købbare nu**, før dato er låst og før presale-vinduet (masterark: presale åbner 2 uger før event). Utilsigtet?
8. **OG/meta:** nyt OG-billede, korrekte dims (1200×630), ingen referencer til gammelt "Ink & Art × Module"/"Kinky Sundae"/"2 August".

## Kendt-åbent (IKKE re-rapportér — allerede flagget)
- Endelig dato (afventer partnerkreds/Module) · Orbit-navn (afventer definition) · Premium-table 2-total-modellering · `SHOPIFY_ADMIN_TOKEN` ikke bekræftet sat på Vercel (fri tilmelding i dvale) · ad-lag destination-URL-beslutning.

## Fejl jeg selv fandt (tilføj nye, dupliker ikke)
- Presale/pakker er købbare før dato-lås + presale-vindue (state, ikke kode).
- Presale-produktets URL-handle er stadig gammel (`kinky-sundae-orbit-ticket-2-aug`) — kosmetisk.

**Bed om:** giv mig BLOCKING vs OBSERVATION med citat. Fokusér på hvad jeg IKKE har fanget.
