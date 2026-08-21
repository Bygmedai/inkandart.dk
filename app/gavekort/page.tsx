import type { Metadata } from "next";
import { site } from "@/lib/site";
import { GiftCardOffer } from "@/components/emerge/GiftCard";

export const metadata: Metadata = {
  alternates: { canonical: "/gavekort" },
  title: "Gavekort · Ink & Art",
  description:
    "Giv blæk videre. Et gavekort til Ink & Art Copenhagen — veksles til tatovering, piercing og smykker. Koden lander i indbakken med det samme.",
  openGraph: {
    title: "Giv blæk videre · Gavekort",
    description:
      "Et gavekort til Ink & Art. Koden lander i indbakken — hos dig, eller hos den du giver den til.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giv blæk videre · Gavekort",
    description:
      "Et gavekort til Ink & Art. Koden lander i indbakken — hos dig, eller hos den du giver den til.",
  },
};

const legend =
  "GIV BLÆK VIDERE   —   THE MARK STAYS. EVERYTHING ELSE FADES   —   WHAT YOU CARRY IS WHAT YOU CHOSE   —   ";

const steps = [
  {
    t: "Vælg beløb",
    d: "Betal med MobilePay, kort eller wallet. Checkout ligger hos Shopify — vi rører aldrig dine betalingsoplysninger.",
  },
  {
    t: "Koden kommer med det samme",
    d: "Gavekortet sendes som en kode på mail. Til dig — eller direkte til den du giver den til, hvis du sender som gave.",
  },
  {
    t: "Veksles når der betales",
    d: "Koden er pengene. Brug den på tatovering, piercing eller smykker — hos den artist man selv vælger. Rest gemmes til næste gang.",
  },
];

export default function GavekortPage() {
  return (
    <main id="main" className="gift-page">
      <div className="gift-page__wash" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="gift-page__swallow"
        src="/emerge/v05/swallow.svg"
        alt=""
        width={120}
        height={104}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="gift-page__dagger"
        src="/emerge/v05/dagger.svg"
        alt=""
        width={90}
        height={160}
        aria-hidden="true"
      />

      <div className="gift-page__inner">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          <a href="/">← {site.name}</a>
        </p>

        <div className="legend-fade gift-page__legend" aria-hidden="true">
          <div className="legend-track legend-track--slow">
            <span>{legend}</span>
            <span>{legend}</span>
          </div>
        </div>

        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Gavekort
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium italic">
          Giv blæk videre.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
          Et gavekort til Ink &amp; Art bindes ikke til én bestemt idé. Det kan
          veksles til tatovering, piercing og smykker — hos den artist man selv
          vælger. Køb det her; koden lander i indbakken med det samme.
        </p>

        <GiftCardOffer />

        <aside className="gift-redeem" aria-labelledby="gavekort-redeem">
          <p
            id="gavekort-redeem"
            className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]"
          >
            Har du fået et kort?
          </p>
          <p className="mt-3 max-w-[48ch] text-[var(--text-soft)]">
            Koden er i din mail. Brug den når der betales — i shoppen, eller vis
            den i studiet. Rest bliver stående til næste gang. Hos den artist du
            selv vælger.
          </p>
        </aside>

        <section className="mt-16" aria-labelledby="gavekort-how">
          <h2
            id="gavekort-how"
            className="font-[family-name:var(--font-display)] text-[clamp(24px,4vw,36px)] font-medium"
          >
            Sådan virker det
          </h2>
          <ol className="mt-6 list-none p-0">
            {steps.map((step, i) => (
              <li key={step.t} className="flex gap-4 border-t border-[var(--text)]/10 py-5">
                <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="m-0 text-[15px] uppercase tracking-[0.08em]">{step.t}</h3>
                  <p className="mt-2 text-[var(--text-soft)]">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="mt-12 border border-[var(--text)]/15 p-6" aria-labelledby="gavekort-wish">
          <p
            id="gavekort-wish"
            className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]"
          >
            Et ønske?
          </p>
          <p className="mt-3 text-[var(--text-soft)]">
            Skal det være et bestemt beløb, eller vil du købe flere på én gang?
            Skriv til os — så finder vi ud af det.
          </p>
          <a
            className="mt-5 inline-flex border border-[var(--oxblood)] bg-[var(--oxblood)] px-5 py-3 font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.16em] text-[var(--text)]"
            href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Skriv til os på WhatsApp (åbner i nyt vindue)"
          >
            Skriv på WhatsApp
          </a>
        </aside>
      </div>
    </main>
  );
}
