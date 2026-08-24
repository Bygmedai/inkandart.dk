# Accept: Google kan læse butikken uden at køre vores JavaScript

Status: **UDKAST (2026-08-24)** — afventer Stevens sniff
Bygger: **Grok**. Skrevet af Villy før bygning, jf. CLAUDE.md §6.

Det vi køber: at en turist der googler «tattoo copenhagen» ser vores
**adresse, telefon og åbningstider** direkte i resultatet — og at vi selv
bestemmer hvad der står, i stedet for at Google gætter det ud fra brødtekst.

---

## Sådan ser det ud i dag (målt 2026-08-24 i produktion)

Ni sider hentet med `curl` mod apex-domænet. Kolonnen der tæller er
`application/ld+json` i **det HTML serveren sender**:

| side | status | `ld+json` i HTML | henviser til `seo-ld.js` |
|---|---|---|---|
| `/` | 200 | **0** | ja |
| `/shop` | 200 | **0** | ja |
| `/walk-in` | 200 | **0** | ja |
| `/flash` | 200 | **0** | ja |
| `/gavekort` | 200 | **0** | ja |
| `/blackbook` | 200 | **0** | ja |
| `/en` | 200 | **0** | ja |
| `/en/shop` | 200 | **0** | ja |
| `/en/walk-in` | 200 | **0** | ja |

**Nul strukturerede data i det serveren sender.** Alt ligger i
`public/seo-ld.js`, som `app/layout.tsx` indlæser med
`strategy="afterInteractive"` — altså efter hydrering. Skemaet findes først
i DOM'en, aldrig i HTML'en.

### En fælde jeg gik i, så I ikke skal

Mit første forsøg målte `https://www.inkandart.dk/…` og fandt 0 ld+json
**og** 0 henvisninger til `seo-ld.js` — hvilket så ud som om scriptet slet
ikke var deployet. Det var forkert: `www` svarer **308** til apex, og jeg
målte redirect-kroppen på 15 bytes. Mål mod `https://inkandart.dk` uden
`www`, ellers måler I «Redirecting…».

### Hvorfor jeg er uenig i rapportens «Low»

Google kører JavaScript, så skemaet *bliver* i praksis læst — deraf «Low».
Men tre ting gør det til den forkerte afvejning her:

1. **Det er NAP-data for et fysisk sted.** Adresse, telefon, åbningstider.
   Det er den mest bundsolide, mindst foranderlige information vi har, og
   den er den eneste der er gjort betinget af at et script kører.
2. **Ikke kun Google læser det.** Bing, DuckDuckGo, sociale forhåndsvisninger,
   AI-assistenter og kortapper henter rå HTML. De renderer ikke.
3. **Det koster ingenting at gøre rigtigt.** Data er statisk, kilden findes
   allerede i `lib/site.ts`, og der er ingen teknisk forhindring (se næste
   afsnit). Når prisen for at flytte det er ~40 linjer, er «Low» ikke et
   argument for at lade være.

Det er min vurdering, ikke en måling. Steven bestemmer.

---

## Design

### Den forhindring der ikke findes længere

Doc-blokken i `public/seo-ld.js` siger at filen ligger der «CSP-rent:
statisk fil under `script-src 'self'`, ingen React-HTML-sinks». Den
begrundelse holder ikke mod den CSP produktionen faktisk sender i dag:

```
script-src 'self' 'unsafe-inline'
```

`'unsafe-inline'` er der allerede. Og en `<script type="application/ld+json">`
er i øvrigt en **datablok**, ikke eksekverbar kode — `script-src` gælder den
ikke. Der er altså ingen CSP-grund til at holde skemaet ude af HTML'en.

Det skal stadig **måles**, ikke antages (kriterium 6).

### Hvad der bygges

**1. `lib/jsonld.ts` — én kilde, ingen afskrift.**
Rene funktioner der bygger skema-objekter ud fra `lib/site.ts`. NAP-data må
ikke skrives af. Står telefonnummeret to steder, driver de fra hinanden —
præcis som væg-copy'en gjorde det i PR #197, ét ord ad gangen.

**2. En server-komponent der udsender blokken.**

```tsx
// components/seo/JsonLd.tsx — server-komponent, ingen "use client"
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Data er vores egne literaler, men escapes alligevel: den dag nogen
      // føder den her et produktnavn fra Shopify, skal den ikke være farlig.
      dangerouslySetInnerHTML={{ __html: sikkerJson(data) }}
    />
  );
}
```

`sikkerJson()` = `JSON.stringify(data)` med `<`, `>`, `&`, `U+2028` og
`U+2029` erstattet af deres `\uXXXX`-form. Det er den eneste grund til at
`dangerouslySetInnerHTML` er forsvarlig her, og den skal stå som kommentar i
koden — ikke kun i dette dokument.

**3. `app/layout.tsx`:** `<JsonLd data={studio()} />` i `<head>`, og
`<Script src="/seo-ld.js" …>` **fjernes**. `public/seo-ld.js` slettes.
To kilder til samme sandhed er værre end den dårlige af dem.

**4. Grafen — `@id`, ikke gentagelse.**

| node | `@id` | hvor |
|---|---|---|
| `TattooParlor` | `https://inkandart.dk/#studio` | hver side, begge sprog |
| `WebSite` | `https://inkandart.dk/#website` | hver side |
| `WebPage` | side-URL + `#page` | hver side, `inLanguage` da/en |

Studiet er **ét sted**, også på `/en`. Samme `@id`, samme adresse, samme
telefonnummer. Kun `WebPage`-noden skifter sprog. To forskellige `@id` for
det samme studie ville fortælle Google at der ligger to butikker på
Larsbjørnsstræde 13.

**5. Billedet:** peg på `/og-inkandart-2026.jpg`, ikke `/og-image.jpg`.
Begge svarer 200 og er byte-identiske i dag (`md5 c46514f6…`), men layoutet
migrerede bevidst væk fra det gamle filnavn fordi sociale platforme cacher
pr. URL. Skemaet skal ikke trække det tilbage.

### To ting der IKKE bygges

- **Ingen `aggregateRating` eller `review`.** Vi har ingen anmeldelsesdata i
  repoet. Selvskrevne stjerner er præcis det Google straffer for, og det
  ville være en løgn på vores egen forside.
- **Ingen `Product`/`Offer` på `/shop` i denne omgang.** De 11 købbare
  varianter *kunne* markeres op, men pris og lagerstatus lever i Shopify og
  ville drive fra `lib/commerce.ts`. Forkert pris i et søgeresultat er værre
  end ingen pris. Tages op separat når det kan hentes, ikke skrives af.

---

## Blokering der skal afklares FØR bygning

**Åbningstiderne er ikke verificeret.** De står i `seo-ld.js` som arv fra det
gamle site:

```
man, tir, søn   13:00–23:00
ons             13:00–23:30
tor             13:00–02:00
fre             13:00–05:00
lør             14:00–05:00
```

De står **intet andet sted** — ikke på nogen side, ikke i `lib/site.ts`.
Ingen kunde kan se dem, så ingen har opdaget hvis de er forkerte.

Åbningstider i skema er ikke pynt: Google viser dem i knowledge-panelet med
«Åbent nu» / «Lukket». Er de forkerte, sender vi folk til en lukket dør — og
et sted der siger det står åbent til 05:00 om lørdagen skal helst mene det.

**Steven: bekræft tiderne mod Google Business Profile, eller sig til, så
bygger Grok uden `openingHoursSpecification`.** Ingen tider er bedre end
forkerte tider. Manglende data er aldrig et ja.

---

## Kriterierne

1. **Givet** at jeg åbner `https://inkandart.dk` og vælger «vis kildekode»
   (altså det serveren sendte, ikke det browseren byggede), **når** jeg
   søger efter `streetAddress`, **så** står Larsbjørnsstræde 13 der. Uden at
   noget script har kørt.
   *(Søg på `streetAddress`, ikke på gadenavnet: adressen står allerede som
   synlig tekst på forsiden, så et fund af gadenavnet beviser ingenting.)*

2. **Givet** at jeg indsætter `https://inkandart.dk` i Googles Rich Results
   Test, **når** den er færdig, **så** genkender den et lokalt forretningssted
   med navn, adresse og telefonnummer — og rapporterer **0 fejl**.

3. **Givet** at jeg står på den engelske forside `/en`, **når** Google læser
   den, **så** er det **samme** studie som på den danske. Ét sted, én adresse,
   ét telefonnummer — ikke to butikker i samme gade.

4. **Givet** at jeg slår telefonnummeret op i skemaet, **når** jeg ringer til
   det, **så** ringer telefonen i butikken. Samme nummer som står på siden.

5. **Tid — Givet en vilkårlig dag D:** ændrer nogen adressen eller
   telefonnummeret ét sted i repoet, **så** ændrer det sig samme sted i
   skemaet. Der findes ikke en kopi der kan blive stående med det gamle
   nummer. (Efterprøves ved at bede byggeren ændre nummeret midlertidigt og
   se begge steder følge med.)

6. **Negativ kontrol A — CSP:** **Givet** at jeg åbner forsiden med
   udviklerkonsollen fremme, **når** siden er indlæst, **så** står der
   **ingen** CSP-advarsel. Påstanden om at inline-skema er tilladt skal
   måles på den rigtige side, ikke læses i en spec.

7. **Negativ kontrol B — én kilde:** **Givet** at bygningen er færdig,
   **når** jeg henter `https://inkandart.dk/seo-ld.js`, **så** svarer den
   **404**. Findes den gamle fil stadig, har vi to skemaer der kan sige
   hver sit — og så beviser de grønne kriterier ovenfor ingenting.

8. **Givet** at åbningstiderne er med, **når** jeg sammenligner dem med vores
   Google Business Profile, **så** er de ens, minut for minut. Er de det
   ikke, skal de ud af skemaet i stedet for at blive gættet.

---

## Sådan efterprøves det uden at læse kode

```bash
# 1 — skemaet er i det serveren sender (ikke i DOM'en bagefter)
curl -s https://inkandart.dk/ | grep -c 'application/ld+json'   # forventet: ≥ 1
curl -s https://inkandart.dk/ | grep -c '"streetAddress"'       # forventet: ≥ 1
#
# Bemærk: grep efter «Larsbjørnsstræde» duer IKKE som prøve. Adressen står
# allerede som synlig tekst på forsiden — den kommando svarer 1 i dag, hvor
# der er nul skema. `"streetAddress"` findes kun i skemaet.

# 2 — alle sider, begge sprog
for u in / /shop /walk-in /flash /gavekort /blackbook /en /en/shop /en/walk-in; do
  printf '%-16s %s\n' "$u" "$(curl -s https://inkandart.dk$u | grep -c 'application/ld+json')"
done

# 3 — negativ kontrol: den gamle fil er væk
curl -s -o /dev/null -w '%{http_code}\n' https://inkandart.dk/seo-ld.js   # forventet: 404

# 4 — Googles egen dom
#    https://search.google.com/test/rich-results  →  0 fejl
```

Mål mod `inkandart.dk` **uden** `www`. `www` svarer 308, og så tæller I
redirect-kroppen.
