import type { Metadata } from "next";
import { site } from "@/lib/site";
import { GiftNoteCard } from "@/components/emerge/GiftNoteCard";
import { giftNoteQuery, readGiftNote } from "@/lib/gift-note";

import { SkipLink } from "@/components/i18n/SkipLink";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Dit gavekort · Ink & Art",
  description: "Et kort at give. Print det, eller send linket.",
};

export default async function KortPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const note = readGiftNote(await searchParams);
  const cardPath = `/gavekort/kort${giftNoteQuery(note)}`;
  const share = `https://wa.me/?text=${encodeURIComponent(
    `${note.til ? `Til ${note.til}. ` : ""}Nogen har givet dig blæk.\n${site.url}${cardPath}\n${site.url}/gavekort/til-dig`,
  )}`;

  return (

    <>

      <SkipLink lang="da" />
    <main id="main" className="gift-page gift-page--kort">
      <div className="gift-page__inner">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)] gift-print-hide">
          <a href="/gavekort/giv">← Hilsen</a>
        </p>
        <h1 className="sr-only">Gavekort</h1>

        <div className="gift-kort-stage">
          <GiftNoteCard note={note} />
        </div>

        <p className="gift-print-hint gift-print-hide">
          Print kortet (Ctrl+P). Skriv koden fra din mail på linjen. Eller send
          linket — koden sender du selv.
        </p>

        <p className="gift-share gift-print-hide">
          <a href={share} target="_blank" rel="noopener noreferrer" aria-label="Send kortet i WhatsApp (åbner i nyt vindue)">
            Send kortet i WhatsApp →
          </a>
          <a href="/gavekort/til-dig">Til den der får det →</a>
        </p>
      </div>
    </main>
    </>
  );
}
