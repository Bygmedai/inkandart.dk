# Driver den sorte baggrund cashflow?
**29. august 2026 · Haruki.** Stevens spørgsmål: wireframet er godkendt, men hvilken baggrundsfarve driver mest cashflow? Research, ikke fornemmelser: baggrundene er **målt** på konkurrenternes sider (CSS og rendering, i dag), og læsbarhedsforskningen er hentet ved kilden.

## 0 · Svaret i fem linjer

**Sort er rigtigt for husets brand-flader og forkert for husets salgsflader.** De bedste i verden kører ikke ét eller andet — de kører **begge dele, delt på funktion**: sort dør, hvid butik. To af de stærkeste sammenlignelige brands gør det uafhængigt af hinanden, og den ene er den danske aktør der reelt sælger prints i volumen. Anbefalingen er derfor ikke «lys sitet op» — det er **behold Rummets sorte identitet, og lad Mærket (Hylden + produktsiden) stå på lys bund.** Ét skift, tre flader, resten uændret.

## 1 · Målt hos de bedste — forside kontra shop

| Brand | Forside | Shop / produkt | Kilde |
|---|---|---|---|
| **Sang Bleu** (London/LA — kategoriens mest respekterede) | **`#000` sort** | **`#f1f1f1` lys** | CSS målt 29/8 |
| **Royal Tattoo** (Helsingør — ~300 prints, siden 1983) | **sort** | **hvid** | renderet og set 29/8 |
| Bang Bang (NYC) | sort | *ingen permanent shop* — kun drops | renderet 29/8 |
| Monmon Cats (Horitomo, IP-brand) | mørk `#444` | mørk `#444` | CSS målt |
| Kintaro Publishing (kunstforlag) | hvid | hvid | CSS målt |
| Conspiracy Inc (Uncle Allan) | hvid | hvid | CSS målt |
| Sailor's Ink (vores modanker) | mørk `#1A1819` | *ingen webshop* | CSS målt |
| Betty Zoo (KBH) | hvid | — | CSS målt |
| Gagosian (galleri-referencen) | hvid | — | theme-color målt |
| Supreme (drop-referencen) | lys `#f2f2f2` | — | theme-color målt |

**Læs tabellen sådan:** de to eneste brands i feltet der både har et stærkt sort brand OG en rigtig, permanent butik — Sang Bleu og Royal Tattoo — **skifter til lys bund i butikken**. Bang Bang har det sorte brand og har valgt ikke at have en permanent butik overhovedet. De der er lyse hele vejen (Kintaro, Conspiracy) er dem hvis produkt ER billedet. Ingen i feltet sælger prints i volumen på sort.

Og galleri-argumentet peger samme vej: den «white cube» vi låner troværdighed fra er **hvid**. Gagosian er hvid. Museer hænger værker på lyse vægge, fordi værket skal være det mørkeste i rummet.

## 2 · Hvorfor — mekanikken, ikke smagen

**Læsbarhed.** Nielsen Norman Groups forskningsgennemgang er entydig for normaltseende: *«positive contrast polarity was better for both visual-acuity tasks and for proofreading tasks»* (Ergonomics 2013), og **jo mindre skriften er, jo større er lys-fordelen**. Mekanismen er pupilkontraktion: mere lys → mindre pupil → færre sfæriske aberrationer → skarpere fokus på detaljer uden at trætte øjet. Et 2017-studie fandt at lys tilstand var **signifikant bedre om aftenen** for hurtig skimning på mobil. Det er præcis vores kunde: en telefon om aftenen, der skal læse en pris, en størrelse og en fragtgrænse.

Modvægten, ærligt: folk med grå stær og uklare øjenmedier læser **bedre** på mørk bund, og der er indicier for at vedvarende lys-læsning kan hænge sammen med nærsynethed. Mørk bund er altså ikke en fejl — den er bare dårligere til småt, tal-tungt salgsindhold.

**Produktfotoet.** Vores egen måling fra i går siger det samme uden teori: Stolen er husets mindst sorte flade **udelukkende fordi Emmas foto har lys baggrund**. Tatoveringsfotos er overvejende mørk hud og sort blæk. På sort bund flyder de sammen med fladen; på lys bund skæres de ud. Det er derfor kategorien har konvergeret mod hvid produktbaggrund — ikke mode, men kontrast.

**Cashflow-leddet.** Der findes ingen troværdig offentlig A/B-test der siger «mørk konverterer X % dårligere» — den der påstår det, sælger noget. Kæden der faktisk er dokumenteret er indirekte og stærk nok: mindre skrift + mørk bund → dårligere læsbarhed → pris, variant, fragtgrænse og knap koster mere at afkode → færre gennemførte køb. Prisen og «Læg i kurv» er de mindste, vigtigste elementer på siden.

## 3 · Hvad jeg indstiller

**Behold sort på Huset, Stolen, Natten, Gaden.** Det er identiteten, det er kategoriens grammatik for brand-flader, det er ratificeret, og Huset beviste i går at sort virker når billederne er store nok (78 % → 55 % nær-sort, og fladen blev stærkere, ikke svagere).

**Skift Mærket til lys bund** — Hylden, produktsiden og kurv/checkout-overgangen. Hud (`#e8dcc8`) på nat bliver til nat-tekst på hud-lys, samme palet vendt om: `--hud` som bund, `--nat` som skrift, blod til prisen. Det er husets farver, ikke en fremmed hvid — og det giver Shopify-checkoutet (som kun kan styles let) en naturlig overgang i stedet for et spring fra sort til Shopifys lyse standard.

**Gevinsten er dobbelt:** Væggens billeder får den kontrast et galleri giver dem, og skiftet i sig selv *betyder* noget — du går fra huset ud i butikken. Det er den samme dramaturgi som en fysisk butik med mørkt studie og oplyst disk.

**Prisen, ærligt:** to farvesæt at vedligeholde, og en overgang der skal designes så den ikke føles som to sites. Det er Claudias opgave, og den er lille sammenlignet med at bygge Mærket om senere.

## 4 · Hvis du vil have bevis frem for indstilling

Vi kan måle det i stedet for at diskutere det, når der er trafik: samme Mærket-flade i to versioner, split 50/50 på Shopify-siden, mål «add to cart»-raten. Men det kræver trafik vi ikke har endnu — og på nul salg er kategori-evidensen ovenfor det bedste grundlag der findes. Jeg foreslår: byg det lyse Mærket nu, og lad A/B-testen være noget vi gør når der er noget at teste på.

---
*Kilder: baggrunde målt 29/8 med curl/CSS-udtræk (sangbleu.com, kintaropublishing.com, conspiracyinc.bigcartel.com, monmoncats.com, sailors-ink.dk, bettyzoo.dk, gagosian.com, supremenewyork.com) og renderet i browser (bangbangforever.com, royaltattoo.com + royaltattoo.com/shop). Læsbarhed: Nielsen Norman Group, «Dark Mode vs. Light Mode: Which Is Better?» (Ergonomics 2013; Applied Ergonomics 2017; Scientific Reports 2018). Egne målinger af Rummet 28.–29/8.*
