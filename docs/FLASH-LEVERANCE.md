# Flash — leveranceformat (til artister)

Så et stykke flash kan sælges direkte på `inkandart.dk/flash` og afregnes gennem
Shopify. Formålet: ren ekstra indtjening, uden at det tager tid fra stolen. Jo
mere færdigt flash der ligger klar, jo mere kan sælges.

## Per motiv skal vi bruge

1. **Tegningen** i høj opløsning — PNG med **transparent baggrund** (helst også
   vektor: SVG/PDF). Sort linework; farvet version separat hvis motivet er i farver.
   Mindst ~2000 px på den lange kant.
2. **Titel** (kort, fx "Slange & dolk").
3. **Størrelse** — S / M / L (styrer prisbåndet).
4. **Fast pris** (kr).
5. **One-off?** — sælges motivet kun én gang, eller må det gentages?

## Ophavs-dokumentation (så vi kan sælge det som "artistens eget")

Vi skal kunne dokumentere at artisten selv har tegnet motivet — men det skal
passe til den enkeltes måde at arbejde på. **Afklar først: hvad tegnes flash i?**
(Procreate, andet program, eller i hånden på papir?)

Ud fra det vælges den nemmeste dokumentation:

- **Procreate:** app'en optager automatisk en timelapse mens man tegner — den er
  det stærkeste og nemmeste bevis.
- **Andet program:** kildefilen med lag (PSD/native) eller undo-historik.
- **I hånden:** et par fotos af skitsen undervejs.

Plus **én linje** fra artisten: *"mit eget design — I må gerne sælge det."* Det er
den juridisk vigtige del (bekræfter både ophav og salgsret).

Vi gemmer filen + dokumentationen tidsstemplet. Ikke blockchain — bare en rimelig,
billig bevisrække: hvem tegnede det, at vi må sælge det, og hvornår vi fik det.

## Teknisk (BygMedAI)

Hvert motiv bliver en post i `lib/flash.ts` (`FlashPiece`) med filen i
`public/flash/{id}.webp`, og en Shopify-vare hvis `variantId` sættes → køb direkte
via cart-permalink. Uden `variantId` falder kortet tilbage til reservation via
WhatsApp. Tomt katalog → `/flash` står som teaser der driver Blackbook.
