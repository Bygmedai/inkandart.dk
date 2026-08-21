import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/gavekort/til-dig" },
  title: "Det venter på dig · Ink & Art",
  description:
    "Nogen har givet dig blæk. Koden er i mailen eller på kortet. Brug den når der betales.",
  openGraph: {
    title: "Det venter på dig",
    description: "Nogen har givet dig blæk. Ink & Art, Larsbjørnsstræde 13.",
  },
};

export default function TilDigPage() {
  return (
    <main id="main" className="gift-page">
      <div className="gift-page__inner">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          <a href="/">← {site.name}</a>
        </p>
        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Til dig
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium italic">
          Det venter på dig.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
          Nogen har givet dig et gavekort til Ink &amp; Art. Koden er i en mail,
          eller skrevet på kortet. Den er pengene. Resten er stolen.
        </p>

        <ol className="mt-12 list-none p-0 max-w-[54ch]" role="list">
          <li className="flex gap-4 border-t border-[var(--text)]/10 py-5">
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">01</span>
            <div>
              <h2 className="m-0 text-[15px] uppercase tracking-[0.08em]">Find koden</h2>
              <p className="mt-2 text-[var(--text-soft)]">
                I indbakken, eller på det printede kort. Uden den kan vi ikke veksle.
              </p>
            </div>
          </li>
          <li className="flex gap-4 border-t border-[var(--text)]/10 py-5">
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">02</span>
            <div>
              <h2 className="m-0 text-[15px] uppercase tracking-[0.08em]">Kom forbi</h2>
              <p className="mt-2 text-[var(--text-soft)]">
                {site.address.street}, {site.address.postalCode} {site.address.city}.{" "}
                <a href={`tel:${site.phoneIntl}`} className="border-b border-[var(--gold)]/40">
                  {site.phone}
                </a>
              </p>
            </div>
          </li>
          <li className="flex gap-4 border-t border-[var(--text)]/10 py-5">
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">03</span>
            <div>
              <h2 className="m-0 text-[15px] uppercase tracking-[0.08em]">Vælg selv</h2>
              <p className="mt-2 text-[var(--text-soft)]">
                Tatovering, piercing eller smykker. Hos den artist du selv vælger.
                Rest gemmes.
              </p>
            </div>
          </li>
        </ol>

        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
          <a href="/gavekort/giv" className="border-b border-[var(--gold)]/40 pb-1 text-[var(--gold)]">
            Giv et selv →
          </a>
        </p>
      </div>
    </main>
  );
}
