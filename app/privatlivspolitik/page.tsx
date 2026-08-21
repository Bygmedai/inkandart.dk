import type { Metadata } from "next";
import { site } from "@/lib/site";

import { SkipLink } from "@/components/i18n/SkipLink";
export const metadata: Metadata = {
  alternates: { canonical: "/privatlivspolitik" },
  title: "Privatlivspolitik · Ink & Art",
};

export default function PrivacyPage() {
  return (
    <>
      <SkipLink lang="da" />
    <main className="mx-auto max-w-[68ch] px-[var(--gutter)] py-24">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        <a href="/">← {site.name}</a>
      </p>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium">
        Privatlivspolitik
      </h1>
      <div className="mt-8 space-y-4 text-[var(--text-soft)]">
        <p>
          Ink &amp; Art Copenhagen, {site.address.street}, {site.address.postalCode} {site.address.city}.
          Vi indsamler kun det du selv giver os — navn, kontakt og det du skriver om din idé.
        </p>
        <p>
          Booking sker via vores bookingsystem. Nyhedsbreve og formularer bruges til at svare dig,
          ikke til at sælge dine data. Du kan bede om sletning når som helst.
        </p>
        <p>
          Vi måler besøg med Vercel Web Analytics. Det er cookieløst: der sættes ingen
          cookies, der bruges ingen fingerprinting, og din IP-adresse gemmes ikke. Vi ser
          kun hvilke sider der bliver besøgt, og hvor besøget kom fra — aldrig hvem du er.
        </p>
        <p>Sidst opdateret 2026-08-21.</p>
      </div>
    </main>
    </>
  );
}
