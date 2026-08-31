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
export async function Fredagsflash() {
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
    >
      <h2
        id="fredagsflash"
        className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]"
      >
        Fredagsflash
      </h2>
      <p className="mt-4 max-w-[52ch] text-[var(--text-soft)]">
        Hver {FREDAGSFLASH.dag} {FREDAGSFLASH.aabner}–{FREDAGSFLASH.lukker}. Ét ark, to
        priser: {kr(FREDAGSFLASH.lilleKr)} / {kr(FREDAGSFLASH.mellemKr)}.{" "}
        <strong className="font-normal text-[var(--text)]">Kom, peg, sæt dig.</strong>
      </p>

      {kanKoebes ? (
        <p className="mt-5">
          <a
            href={fredagsflashCartUrl()}
            data-hz-event="plads_klik"
            aria-label={`Hold en plads til fredagsflash — ${FREDAGSFLASH.depositumKr} kroner i depositum`}
            className="inline-flex border border-[var(--gold)]/40 px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--gold)] transition-colors hover:border-[var(--gold)]"
          >
            Hold en plads · {kr(FREDAGSFLASH.depositumKr)} kr
          </a>
          <span className="ml-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-mute)]">
            trækkes fra i stolen
          </span>
        </p>
      ) : (
        <p className="mt-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-mute)]">
          Udsolgt i denne uge — kom alligevel, listen ved døren er åben
        </p>
      )}
    </section>
  );
}
