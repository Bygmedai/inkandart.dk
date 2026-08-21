import type { Metadata } from "next";
import { aftercare } from "@/lib/aftercare";
import { site } from "@/lib/site";

import { SkipLink } from "@/components/i18n/SkipLink";
export const metadata: Metadata = {
  alternates: { canonical: "/aftercare" },
  title: "Aftercare · Ink & Art",
  description: aftercare.lead,
};

export default function AftercarePage() {
  return (
    <>
      <SkipLink lang="da" />
    <main className="mx-auto max-w-[68ch] px-[var(--gutter)] py-24">
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        <a href="/">← {site.name}</a>
      </p>
      <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
        {aftercare.file}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium">
        {aftercare.title}
      </h1>
      <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">{aftercare.lead}</p>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(24px,4vw,36px)] font-medium">
          {aftercare.tattooTitle}
        </h2>
        <ol role="list" className="mt-6 list-none p-0">
          {aftercare.tattoo.map((step, i) => (
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

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(24px,4vw,36px)] font-medium">
          {aftercare.piercingTitle}
        </h2>
        <ol role="list" className="mt-6 list-none p-0">
          {aftercare.piercing.map((step, i) => (
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
          {aftercare.reassureLabel}
        </p>
        <p className="mt-3 text-[var(--text-soft)]">{aftercare.reassure}</p>
        <a
          className="mt-5 inline-flex border border-[var(--oxblood)] bg-[var(--oxblood)] px-5 py-3 font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.16em] text-[var(--text)]"
          href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {aftercare.writeCta}
        </a>
      </aside>
    </main>
    </>
  );
}
