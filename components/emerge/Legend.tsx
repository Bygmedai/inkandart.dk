import { LEGEND_LINES } from "@/lib/legend";

function Band({ reverse }: { reverse?: boolean }) {
  const line = LEGEND_LINES.join(" · ") + " · ";
  return (
    <div className={`legend-band overflow-hidden whitespace-nowrap py-3.5 ${reverse ? "bg-[var(--skin)]/80" : ""}`}>
      <div className={`legend-track ${reverse ? "legend-track--slow" : ""}`} aria-hidden="true">
        <span className={`pr-[2.4em] font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] ${reverse ? "text-[var(--text)]/40" : "text-[var(--gold)]"}`}>
          {line}
          {line}
        </span>
        <span className={`pr-[2.4em] font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] ${reverse ? "text-[var(--text)]/40" : "text-[var(--gold)]"}`}>
          {line}
          {line}
        </span>
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <section id="legend" tabIndex={-1} className="legend-fade border-y border-[var(--text)]/10 bg-[var(--void)] py-0 outline-none">
      <h2 className="sr-only">The legend</h2>
      <Band />
      <Band reverse />
    </section>
  );
}
