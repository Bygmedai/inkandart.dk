import { FREDAGSFLASH, fredagsflashCartUrl, kr } from "@/lib/commerce";
import { variantLager } from "@/lib/lager";

/**
 * Fredagsflash på /flash (Haruki #245 B1).
 *
 * Huset kører hver fredag: ét ark, to stole, 450 / 800. Køen er på papir.
 * Siden skal to ting — sige at det findes, og tage 300 kr for en plads.
 *
 * Knappen renderer KUN når varianten kan bevise at der er en plads tilbage.
 * Det er samme dom som flash-droppet bruger (`lagerstatus` i lib/lager.ts),
 * med vilje: en knap der fejler i checkout er værre end ingen knap
 * (CLAUDE.md §4 — ingen død handling).
 *
 * Produktet er DRAFT indtil Steven tænder det. Et draft-produkt findes ikke
 * på Storefront, så `variantLager` svarer «ubevist», og blokken står uden
 * knap. Det er ikke en fejl der skal fikses; det er den rigtige tilstand
 * indtil huset har sagt ja til reservation.
 */
/**
 * Sætningerne, ét sted pr. sprog. TALLENE staar ikke her — de kommer fra
 * FREDAGSFLASH i lib/commerce.ts, saa Nizar kan bede om «19–01» uden at
 * nogen leder i tre filer (#245 B2).
 *
 * [ORD-TJEK Steven] — den engelske copy er min oversaettelse, ikke husets
 * egen stemme paa engelsk. Ret frit.
 */
const TEKST = {
  da: {
    titel: "Fredagsflash",
    hver: (dag: string, fra: string, til: string) => `Hver ${dag} ${fra}–${til}.`,
    ark: (lille: string, mellem: string) => `Ét ark, to priser: ${lille} / ${mellem}.`,
    kom: "Kom, peg, sæt dig.",
    hold: (pris: string) => `Hold en plads · ${pris} kr`,
    aria: (pris: number) => `Hold en plads til fredagsflash — ${pris} kroner i depositum`,
    traekkes: "trækkes fra i stolen",
    udsolgt: "Udsolgt i denne uge — kom alligevel, listen ved døren er åben",
  },
  en: {
    titel: "Friday flash",
    hver: (_dag: string, fra: string, til: string) => `Every Friday, ${fra}–${til}.`,
    ark: (lille: string, mellem: string) => `One sheet, two prices: ${lille} / ${mellem}.`,
    kom: "Come, point, sit down.",
    hold: (pris: string) => `Hold a spot · ${pris} kr`,
    aria: (pris: number) => `Hold a spot for Friday flash — ${pris} kroner deposit`,
    traekkes: "deducted in the chair",
    udsolgt: "Sold out this week — come anyway, the list at the door is open",
  },
} as const;

export async function Fredagsflash({ lang = "da" }: { lang?: "da" | "en" }) {
  const t = TEKST[lang];
  const lager = await variantLager(FREDAGSFLASH.handle);
  const kanKoebes = lager.status === "ledig";

  if (!kanKoebes) {
    console.warn(
      `[fredagsflash] knappen renderer ikke — ${lager.grund || lager.status}`,
    );
  }

  return (
    <section
      className="mt-12 border border-[var(--text)]/15 p-7"
      aria-labelledby="fredagsflash"
      lang={lang}
    >
      <h2
        id="fredagsflash"
        className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]"
      >
        {t.titel}
      </h2>
      <p className="mt-4 max-w-[52ch] text-[var(--text-soft)]">
        {t.hver(FREDAGSFLASH.dag, FREDAGSFLASH.aabner, FREDAGSFLASH.lukker)}{" "}
        {t.ark(kr(FREDAGSFLASH.lilleKr), kr(FREDAGSFLASH.mellemKr))}{" "}
        <strong className="font-normal text-[var(--text)]">{t.kom}</strong>
      </p>

      {kanKoebes ? (
        <p className="mt-5">
          <a
            href={fredagsflashCartUrl()}
            data-hz-event="plads_klik"
            aria-label={t.aria(FREDAGSFLASH.depositumKr)}
            className="inline-flex border border-[var(--gold)]/40 px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)] transition-colors hover:border-[var(--gold)]"
          >
            {t.hold(kr(FREDAGSFLASH.depositumKr))}
          </a>
          <span className="ml-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-mute)]">
            {t.traekkes}
          </span>
        </p>
      ) : (
        <p className="mt-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-mute)]">
          {t.udsolgt}
        </p>
      )}
    </section>
  );
}
