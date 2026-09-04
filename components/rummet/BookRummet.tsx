import type { Locale } from "@/lib/i18n";

const BOOK_DK = "https://inkart.book.dk/";

/**
 * Book.dk inde i rummet — bookingen som en del af /booking, ikke et hop.
 *
 * Målt som kunde 4/9 (S580, Stevens fund): kunden gik fra /booking til
 * inkart.book.dk, bookede, og stod så på Book.dks egen «Tak for din
 * booking» uden nogen vej tilbage. Trin 2 (samtykket) og trin 3
 * (depositummet) lå på en side hun havde forladt; det eneste link var i
 * en mail hun måske først læser i morgen. Book.dk kan ikke sende kunden
 * videre efter bookingen — der findes ingen «redirect efter booking».
 *
 * Så bookingen kommer herind i stedet. Book.dk tillader det udtrykkeligt
 * (deres embed-kode er en iframe; svaret bærer `frame-ancestors *`, og
 * deres session-cookie er `SameSite=None; Partitioned` — lavet til
 * netop tredjeparts-rammer). Version 2 af deres bookingside er «ideel
 * til indlejring»: fast top og bund, ét trin ad gangen. Når kunden har
 * bekræftet, står «Tak for din booking» i rammen, og trin 2 står lige
 * under den — på samme side, på husets domæne.
 *
 * Rammen får højde af skærmen (dvh), ikke af indholdet: Book.dk siger
 * ikke hvor højt det er, og en fast 1000px (deres forslag) skubber
 * «Videre»-knappen under folden på en telefon. Fald-tilbage-linket
 * (BookDoor) står under rammen for dem der hellere vil have Book.dk i
 * sit eget vindue — og for browsere der nægter rammen.
 *
 * Server-komponent. Ingen JS: en iframe virker uden.
 */
export function BookRummet({ lang = "da" }: { lang?: Locale }) {
  const titel = lang === "en" ? "Book your time — Ink & Art" : "Book din tid — Ink & Art";
  return (
    <div className="rum-bookrum">
      <iframe
        className="rum-bookrum__ramme"
        src={BOOK_DK}
        title={titel}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
