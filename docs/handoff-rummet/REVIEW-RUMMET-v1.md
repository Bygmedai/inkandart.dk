# Review — «Rummet v1» (Claudias design)
UX-gennemgang før byg. Læst som fil, ikke kun som billeder — alle 15 boards, al copy, alle mål.
27. august 2026.

**Dommen: byg det.** Systemet holder — grammatikken (samme label på væg og vare), de ærlige tom-tilstande, Skiltets ét-tal-regel, den ærlige Book.dk-tekst og shoot-listen med slot-id'er 1:1 er præcis bestillingen. Seks ting skal blokeres før byg, én søm skal designes færdig, og ni byg-noter til Grok.

---

## Blokkere — indhold der ikke må gå live som det står

1. **Opdigtede mennesker.** «Nizar Haddad», «Emma Ravn», gæsten «Kaya Lind», DJ'erne «Kraftværk» og «Bjørk Nyholm» — efternavne og hele personer er digtet. Bestillingen siger ingen fake gæst, ingen fake DJ. Fint som dummy i et board, men: mærk demo-data som fotos mærkes (`DEMO` i beton), og brug kun fornavne på virkelige folk indtil de selv har godkendt navnetræk. Sonja står som DJ 22–00 — også ubekræftet.
2. **Opdigtede åbningstider.** Gaden viser «Walk-in tors–lør 14–18 · Booket man–lør 11–19». De tal findes ikke — husets tider er ikke engang bekræftet internt endnu. Samme skilt, tallene skiftes når de er besluttet.
3. **Emma står med «piercing».** Ikke bekræftet at det er hendes håndværk. Spørg, eller drop ordet.
4. **«Sætter alle priser i huset»** på Nizars kort. Sandt — men det er intern styring, ikke kunde-copy. Kunden skal ikke vide *hvem* der prissætter; kortet skal sige hvad han laver. Væk.
5. **Tal der er beslutninger, ikke design:** depositum 500 (Nizars/Øs bord), gavekort «gyldigt 3 år» og «ikke på depositum» (politik ingen har besluttet), «2 pladser tilbage» (kræver at nogen vedligeholder det — ellers rådner det), «du får natten 48 timer før» (fint, matcher planen — men det er et løfte; hold det). Mærk dem `[TAL BEKRÆFTES]`.
6. **«Økologisk bomuld · trykt i EU»** — kun hvis den valgte Printful-blank faktisk er øko. Tjek varen før påstanden.

## Sømmen der mangler — depositum-håndoff (S8)

S8 viser to trin: Døren (vores rum) → Book.dk klædt på. Ærligt og rigtigt. Men flowet slutter ved «BEKRÆFT TID», og depositum «betales i shoppen» — i et andet system. Det tredje trin findes ikke, og det er dér pengene tabes:

**Design S8-3 · Kvitteringen:** tid bekræftet → én skærm i vores rum: «Din tid er sat. Betal depositum nu» (blod-tal, én knap til shoppen) → betalt-tilstand. Plus linjen om hvad der sker hvis depositum ikke betales inden X timer. Uden den skærm bliver depositum et håb, ikke en proces.

Og S8-2 skal læses som **farve-spec, ikke layout**: Book.dk's rigtige widget bestemmer strukturen (ydelse → person → tid). Claudias kalender-mock må ikke loves — det siger hendes egen note også; Grok skal bygge efter Book.dk's DOM, ikke efter boardet.

## UX-fund pr. skærm

**S1 Huset.** Prioriteringen er rigtig (værk → i huset → nat → dør). Men boardet er i brevformat (~1440×1860) — det er **to skærmhøjder**, ikke «første skærm». Definér folden: ved 1440×800 skal værket + «I huset»-toppen + nat-linjen være synlige. Grok skal have det som krav, ellers ender Blackbook under folden på alle skærme.

**S7 Shop.** Navigationen mister Blackbook (erstattet af KURV). Døren skal aldrig forsvinde — Kurv og Blackbook kan sameksistere; vis kun kurven når der ligger noget i den.

**S2 Stolen.** «6 værker i arkivet» skal linke til Mærket filtreret på artisten — det er hele pointen med krydslinket.

**Dørene er inkonsistente.** Mobil-døren har den rigtige linje: «Vi sender kun natten. Afmeld med STOP.» Desktop-dørene (S1, S4, S5) mangler den. Samme dør overalt — én linje, ét felt, samme løfte.

**Mobil.** Natten, Døren og Huset findes — men ingen mobilnavigation er tegnet (kun modal-luk), og Stolen/Mærket/Gaden/Shop har ingen mobilboards. Enten tre boards mere, eller én regel til Grok (fx: rum-navne som bundlinje, Blackbook-prikken altid synlig). Uden det opfinder byggeren mobilen selv.

**Footer findes ikke.** Ingen skærm har bund: CVR, betingelser, privatliv, kontakt. En webshop uden handelsbetingelser og fortrydelse sælger ikke — og checkout skal linke til dem. Det behøver ikke fylde: **én betonlinje i bunden af hvert rum** — «Ink and Art Cph · CVR · Betingelser · Privatliv · booking@inkandart.dk». Design den én gang.

## Byg-noter til Grok

1. Boardene er malede — **ingen `<input>`, `<button>`, `:focus` findes**. Byg rigtig semantik: `input type="tel"` med label på dørene, knapper som knapper.
2. **Fokus-tilstand skal designes ind:** forslag 2px hud-outline med 2px offset; på Natten må den være strobe. Ellers er tastatur/oplæsning blind.
3. **Labels op fra 10–11px til 12px minimum** på skærm (S8 og mobil har 10px). Brød holder 16px-reglen fint. Gavekortets 9px er tryk — okay.
4. **BOOK TID →** er et 15px-span i kortets bundlinje — gør hele rækken til link, minimum 44px høj. Samme for størrelsesvælgeren S/M/L/XL i shoppen.
5. **Alt-tekst = værk-labelen** («Sort hjort, Nizar Haddad, 2026») på alle plader. Gratis SEO og skærmlæser i ét — og det ER galleri-grammatikken.
6. Boards ligger på **#171717 — token er #070707.** Byg på tokenen.
7. Strobe-disciplinen holder i designet (én pr. nat-flade) — behold den som lint-regel i koden.
8. Radius 0 holder overalt; de runde former findes kun i anti-arkets parodier. Lad dem blive der.
9. Toggle-tilstandene (natIAften, hyldeFyldt) er tegnet — byg dem som rigtige datatilstande fra dag ét, ikke som to versioner af siden.

## Det der er rigtigt — lås det

- **Skiltet, ordret:** «Ét tal. Ikke ‘fra’, ikke i timen.» Og prisen sidder på værket, aftalt med Nizar.
- **Hylde-tom, ordret:** «Vi laver ikke varer uden værk.» Det er den bedste linje i hele designet.
- **Label-grammatikken** væg → vare: samme titel·navn·år på pladen, hylden og produktsiden. Det er galleri-påstanden gjort til system.
- **Book.dk-ærligheden:** designet indrømmer selv hvad der kan farves og hvad der ikke kan. Sjældent.
- **Shoot-listen** med slot-id'er der matcher boards 1:1 — og som selv siger at produktfotos (P-01–P-04) mangler. Tilføj de fire til Sonjas liste.
- **Plakaten i tre snit** med «fire felter, ingen designer» — det er succeskriteriet fra bestillingen, leveret.
- **Anti-arket** rammer alle fire, inklusive kæden.

---

*Rækkefølge: blokkerne og S8-3 tilbage til Claudia i én runde. Byg-noterne direkte til Grok — de kræver ikke nye boards.*
