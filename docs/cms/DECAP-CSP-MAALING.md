# Decaps CSP-krav — målt, som fallback-bevis

**Sirius' dispatch punkt 1 (CMS-RULING-01) · Villy · 31/8 2026**

> «Mål Decaps fulde CSP-krav som fallback-evidens. Ændr ingen header, deploy
> intet og fortolk ikke målingen som tilladelse til at lempe apex.»

**Ingen header er ændret. Intet er udrullet.** Dette dokument er input til
Plan B, ikke en begrundelse for at røre apex.

---

## Metode

Produktionens egne bytes — `index.html`, `decap-cms.js` (5.122.242 bytes) og
`config.yml` — hentet fra apex før nedlæggelsen og serveret fra en lokal rig
der efterligner Vercels statiske håndtering (`/admin` → `admin/index.html`).
Rig'en sætter én CSP-header og intet andet. Målt i Chromium; brud aflæst på
`console` og `pageerror`.

Stierne i `index.html` er rettet til rod-absolutte før målingen, så vi måler
CSP'en og ikke fejlen fra #248.

## Resultat

| CSP | Resultat | Brud |
|---|---|---|
| **Apex uændret** | «Error loading the CMS configuration» | `unsafe-eval` mangler i `script-src` |
| **Apex + `'unsafe-eval'`** | **«Log ind med GitHub»** — booter rent | **ingen** |

**Ét direktiv.** Ikke `blob:`, ikke en ny script-origin, ikke `worker-src`,
ikke et bredere `connect-src`. Tilføj `'unsafe-eval'` til `script-src`, og
Decap kommer op.

## Loftet på målingen — læs dette før du bruger tallet

**Jeg har kun målt op til login-skærmen.** Alt bag GitHub-login er ikke
observeret: editor-fladen, medie-biblioteket, billed-upload og preview.

Decaps mediebibliotek laver efter alt at dømme object-URL'er til previews,
hvilket typisk kræver `blob:` i `img-src`. **Jeg har ikke set det ske, og
jeg påstår det ikke.** Sirius' egen regel for Plan B er at CMS'et kun må få
de direktiver der faktisk er målt — «hverken bredere eller *fordi Decap nok
bruger det*». Den regel gælder også for mig.

**Skal listen være komplet, kræver det et login.** Det er en credential, og
den hører ikke i denne session. Det er en bevidst mangel, ikke en forglemmelse.

## Hvad tallet betyder for Plan B

Hvis Shopify-spiken falder, og Decap genopstår på `cms.inkandart.dk`:

- Start med apex-CSP'en **plus `'unsafe-eval'`**, intet andet.
- Kør så en login-session igennem og mål resten. Tilføj kun det der bryder.
- `'unsafe-eval'` må **aldrig** følge med tilbage til apex. At det er ét
  direktiv gør det ikke småt — det er præcis det direktiv der gør en
  XSS til kodeudførelse, og det er hele grunden til at fladen flyttede.

## Hvad tallet IKKE betyder

At det kun er ét direktiv, er ikke et argument for mulighed A. Sirius'
ramme står: spørgsmålet er ikke hvor bred headeren er, men **hvem der får en
token, hvad den kan skrive, og hvilket runtime den ligger i.** En GitHub-
skrivetoken i en redaktørs browser på kundens origin er lige forkert med ét
lempet direktiv som med fem.

*Målt 31/8 2026. Bytesene stammer fra apex samme dag, før `/admin` blev
nedlagt.*
