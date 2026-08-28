# Teknisk grundlag — Rummet
Fakta om det, der allerede kører. Intet her er til diskussion; ret aldrig i det uden at spørge Haruki først. 27. august 2026.

## Site (dette repo — Bygmedai/inkandart.dk)
- **Next.js 15 (App Router) + React 19 på Vercel, auto-deploy fra main.** Derfor: alt arbejde på branch + PR; Vercel preview-deploys er testkanalen. Main rører kun det, der er godkendt.
- Det live Emerge v0.1 (Cormorant/Space Grotesk, GSAP, Lenis) er det, Rummet afløser. `docs/`-mappen rummer Emerge-æraens specs — de **arkiveres, slettes ikke**, og `docs/routes-migration.md` (308-matrix + 410) skal respekteres: Rummets routes må ikke knække de gamle redirects.
- Live ruter i dag: `/`, `/aftercare`, `/privatlivspolitik`. Aftercare og privatlivspolitik skal genhuses i Rummet (footer-linjen), ikke tabes.
- Indhold ligger i dag i `lib/site.ts` m.fl. — det mønster udgår; se arkitekturkravet i byggebriefen.

## Shopify (commerce-motoren)
- Store: `d1qp54-0w`. Kurv/checkout hos Shopify; webshop-sporet har eget repo (`inkandart-webshop`, shop.inkandart.dk).
- Produkter i dag: kun depositum- og gavekortvarianter. Nul salg til dato. Ordrenotifikationer går til booking@ (+ Steven).
- Checkout kan kun styles med logo, farver og type. Politiksider (betingelser, privatliv, retur) klædes i rummet og linkes fra footer-linjen.
- Ingen secrets i repoet — Storefront API-nøgler i Vercel env, aldrig i git.

## Book.dk
- Onlinebooking kører på **inkart.book.dk**.
- **Alle** booking- og afbudsnotifikationer er sat op til at lande i **booking@inkandart.dk** (repareret 26/8 — Emma og Nizar havde tomme/slukkede notifikationer). Den kæde er hellig: intet i bygget må omgå eller ændre den.
- Piercing-afdelingen findes i Book.dk men er tom — piercing kan endnu ikke bookes online. Designet skal ikke love det, før den åbnes.
- Book.dk kan farves på logo, farver og type i settings — layout og DOM er deres. Byg overgangen og rammen.

## Mail og DNS
- booking@inkandart.dk hostes hos Simply (webmail.simply.com). Butikkens laptop lever i den indbakke.
- Shopify sender som booking@inkandart.dk — DKIM/CNAME-poster er sat og verificeret 26/8.
- SPF slutter på `-all` og DMARC er `p=reject`: **ingen nye afsender-tjenester** og ingen mail fra andre adresser uden om mig. Ingen DNS-ændringer som del af bygget.

## Fonte og tokens
- Anton (poster) + Instrument Sans (chair) via Google Fonts, `display=swap`. Druk/Tungsten kun hvis licens købes — layoutet må ikke afhænge af det.
- Tokens, regler og komponenter: se bestillingen og tillægget. Nat er `#070707`.

## Arbejdsform i repoet
- Branch pr. milepæl, PR med kort changelog, preview-URL i PR-beskrivelsen.
- Jeg tester på preview og svarer med nummererede fund i PR'en.
- Åbne værdier står i `CONTENT-REGISTER.md` — de hentes dér, aldrig fra fantasien.
