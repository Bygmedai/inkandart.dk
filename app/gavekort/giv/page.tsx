import type { Metadata } from "next";
import { site } from "@/lib/site";

import { SkipLink } from "@/components/i18n/SkipLink";
export const metadata: Metadata = {
  alternates: { canonical: "/gavekort/giv" },
  title: "Giv det videre · Ink & Art",
  description:
    "Skriv til, fra og en hilsen. Print kortet eller send det. Koden lander i din mail når du har købt.",
};

export default function GivPage() {
  return (
    <>
      <SkipLink lang="da" />
    <main id="main" className="gift-page">
      <div className="gift-page__inner">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          <a href="/gavekort">← Gavekort</a>
        </p>
        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Giv det videre
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium italic">
          Skriv det på kortet.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
          Køb beløbet først — koden lander i din mail. Her skriver du til hvem,
          fra hvem, og en hilsen. Print det, eller send linket. Koden kommer
          aldrig i URL&apos;en. Den skriver du selv på kortet.
        </p>

        <form className="gift-give" action="/gavekort/kort" method="get">
          <label className="gift-give__field">
            <span>Til</span>
            <input type="text" name="til" maxLength={48} autoComplete="off" />
          </label>
          <label className="gift-give__field">
            <span>Fra</span>
            <input type="text" name="fra" maxLength={48} autoComplete="name" />
          </label>
          <label className="gift-give__field">
            <span>Hilsen</span>
            <textarea name="hilsen" rows={4} maxLength={240} />
          </label>
          <button type="submit">Se kortet →</button>
        </form>

        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
          <a href="/gavekort" className="border-b border-[var(--gold)]/40 pb-1 text-[var(--gold)]">
            Køb beløbet først →
          </a>
        </p>
        <p className="mt-4 text-[13px] text-[var(--text-mute)] max-w-[48ch]">
          {site.address.street}. Modtageren bruger koden når der betales.
        </p>
      </div>
    </main>
    </>
  );
}
