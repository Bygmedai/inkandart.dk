import type { Metadata } from "next";
import { site } from "@/lib/site";
import { WALKIN, kr, walkinCartUrl } from "@/lib/commerce";
import { WalkinRelic } from "@/components/emerge/WalkinRelic";
import { LangSwitch } from "@/components/i18n/LangSwitch";
import { alternates, t } from "@/lib/i18n";

import { SkipLink } from "@/components/i18n/SkipLink";
const c = t("en").walkin;

export const metadata: Metadata = {
  alternates: { ...alternates("/walk-in"), canonical: "/en/walk-in" },
  title: c.metaTitle,
  description: c.metaDescription,
};

export default function WalkInPageEn() {
  return (
    <>
      <SkipLink lang="en" />
    <main id="main" className="walkin-page" lang="en">
      <div className="walkin-page__inner">
        <p className="walkin-page__top font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          <a href="/en">← {site.name}</a>
          <LangSwitch lang="en" path="/walk-in" />
        </p>
        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          {c.kicker}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium italic">
          {c.title}
        </h1>
        <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
          {c.lede(kr(WALKIN.kr), site.address.street)}
        </p>

        <div className="walkin-page__relic">
          <WalkinRelic />
        </div>

        <ol className="mt-14 list-none p-0 max-w-[54ch]" role="list">
          {c.steps.map((step, i) => (
            <li key={step.t} className="flex gap-4 border-t border-[var(--text)]/10 py-5">
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="m-0 text-[15px] uppercase tracking-[0.08em]">{step.t}</h2>
                <p className="mt-2 text-[var(--text-soft)]">
                  {i === 1
                    ? `${site.address.street}, ${site.address.postalCode} ${site.address.city}. ${step.d}`
                    : step.d}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10">
          <a
            className="inline-flex border border-[var(--gold)] px-5 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]"
            href={walkinCartUrl()}
          >
            {c.cta(kr(WALKIN.kr))}
          </a>
        </p>

        <p className="mt-12 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
          <a href="/gavekort" className="border-b border-[var(--gold)]/40 pb-1 text-[var(--gold)]">
            {c.giftLink}
          </a>
        </p>
      </div>
    </main>
    </>
  );
}
