import type { Metadata } from "next";
import { site } from "@/lib/site";
import { GiftCardOffer } from "@/components/emerge/GiftCard";

export const metadata: Metadata = {
  alternates: { canonical: "/gavekort" },
  title: "Gavekort · Ink & Art",
  description:
    "Giv blæk videre. Et gavekort til Ink & Art Copenhagen — veksles til tatovering, piercing og smykker.",
};

const steps = [
  {
    t: "Vælg beløb",
    d: "Betal trygt med MobilePay, kort eller wallet. Checkout ligger hos Shopify — vi rører aldrig dine betalingsoplysninger.",
  },
  {
    t: "Koden kommer med det samme",
    d: "Gavekortet sendes som en kode på mail. Videresend den, eller print den ud og læg den i et kort.",
  },
  {
    t: "Veksles i studiet",
    d: "Modtageren bruger koden på tatovering, piercing eller smykker — hos den artist de selv vælger. Rest gemmes til næste gang.",
  },
];

export default function GavekortPage() {
  return (
    <main id="main" className="mx-auto max-w-[68ch] px-[var(--gutter)] py-24">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        <a href="/">← {site.name}</a>
      </p>
      <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        Gavekort
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium">
        Giv blæk videre.
      </h1>
      <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
        Et gavekort til Ink &amp; Art bindes ikke til én bestemt idé. Det kan veksles
        til tatovering, piercing og smykker — hos den artist man selv vælger. Køb det
        her; det lander som en kode i indbakken med det samme.
      </p>

      <GiftCardOffer />

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(24px,4vw,36px)] font-medium">
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

      <aside className="mt-12 border border-[var(--text)]/15 p-6">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Et ønske?
        </p>
        <p className="mt-3 text-[var(--text-soft)]">
          Skal det være et bestemt beløb, eller vil du købe flere på én gang? Skriv til
          os — så finder vi ud af det.
        </p>
        <a
          className="mt-5 inline-flex border border-[var(--oxblood)] bg-[var(--oxblood)] px-5 py-3 font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.16em] text-[var(--text)]"
          href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Skriv på WhatsApp
        </a>
      </aside>
    </main>
  );
}
