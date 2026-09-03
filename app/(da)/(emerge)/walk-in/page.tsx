import type { Metadata } from "next";
import { site } from "@/lib/site";
import { WALKIN, kr, walkinCartUrl } from "@/lib/commerce";
import { WalkinRelic } from "@/components/emerge/WalkinRelic";
import { LangSwitch } from "@/components/i18n/LangSwitch";
import { alternates } from "@/lib/i18n";

import { SkipLink } from "@/components/i18n/SkipLink";
import { Masthead } from "@/components/brand/Masthead";
export const metadata: Metadata = {
  alternates: alternates("/walk-in"),
  title: "Walk-in · Ink & Art",
  description:
    "To små tatoveringer. Ingen booking. Kom forbi Larsbjørnsstræde 13 og vis kvitteringen.",
};

export default function WalkInPage() {
  return (
    <>
      <SkipLink lang="da" />
    <main id="main" className="walkin-page">
      <div className="walkin-page__inner">
        <Masthead lang="da">
          <LangSwitch lang="da" path="/walk-in" />
        </Masthead>
        <p className="mt-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)]">
          Walk-in
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(36px,6vw,64px)] font-medium italic">
          To små. I aften.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[var(--text-soft)]">
          To små tatoveringer. Ingen booking. Betal her,
          vis kvitteringen på {site.address.street} — eller betal i studiet.
        </p>

        <div className="walkin-page__relic">
          <WalkinRelic />
        </div>

        <ol className="mt-14 list-none p-0 max-w-[54ch]" role="list">
          <li className="flex gap-4 border-t border-[var(--text)]/10 py-5">
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">01</span>
            <div>
              <h2 className="m-0 text-[15px] uppercase tracking-[0.08em]">Betal de {kr(WALKIN.kr)}</h2>
              <p className="mt-2 text-[var(--text-soft)]">
                MobilePay, kort eller wallet. Checkout ligger hos Shopify.
              </p>
            </div>
          </li>
          <li className="flex gap-4 border-t border-[var(--text)]/10 py-5">
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">02</span>
            <div>
              <h2 className="m-0 text-[15px] uppercase tracking-[0.08em]">Kom forbi</h2>
              <p className="mt-2 text-[var(--text-soft)]">
                {site.address.street}, {site.address.postalCode} {site.address.city}. Vis kvitteringen.
              </p>
            </div>
          </li>
          <li className="flex gap-4 border-t border-[var(--text)]/10 py-5">
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--gold)]">03</span>
            <div>
              <h2 className="m-0 text-[15px] uppercase tracking-[0.08em]">Sæt dig</h2>
              <p className="mt-2 text-[var(--text-soft)]">
                To små. Walk-in — når stolen er ledig.
              </p>
            </div>
          </li>
        </ol>

        <p className="mt-10">
          <a
            className="inline-flex border border-[var(--gold)] px-5 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]"
            href={walkinCartUrl()}
          >
            Betal {kr(WALKIN.kr)} kr →
          </a>
        </p>

        <p className="mt-12 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em]">
          <a href="/gavekort" className="border-b border-[var(--gold)]/40 pb-1 text-[var(--gold)]">
            Gavekort →
          </a>
        </p>
      </div>
    </main>
    </>
  );
}
