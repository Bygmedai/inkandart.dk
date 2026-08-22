import type { Metadata } from "next";

/**
 * Figur-lab — intern side. Ikke linket, ikke indekseret.
 *
 * Formålet er ét spørgsmål: er v06 tydeligt bedre end v05, set med øjnene,
 * i de størrelser figurerne faktisk bruges i? Ikke i en zoomet detalje.
 * Send URL'en til Johnson og Nizar. Får vi et ja, laver Grok ombytningen
 * på de 32 kaldsteder.
 */
export const metadata: Metadata = {
  title: "Figur-lab · intern",
  robots: { index: false, follow: false, nocache: true },
};

type Fig = { navn: string; v05: string; v06: string; bredder: number[]; note: string };

const figurer: Fig[] = [
  {
    navn: "svale",
    v05: "/emerge/v05/swallow.svg",
    v06: "/emerge/v06/swallow-240.webp",
    bredder: [54, 120, 240],
    note: "Flyver på tværs af forsiden i 40–54px og sidder på gavekortet i 120px. Personligheden skal overleve i det små: kompakt krop, stort hoved, rød strube, kløftet hale.",
  },
  {
    navn: "rose",
    v05: "/emerge/v05/rose.svg",
    v06: "/emerge/v06/rose-940.webp",
    bredder: [180, 320, 470],
    note: "Det største element på siden — op til 470px nede i venstre hjørne. Det er den her Johnson så først.",
  },
  {
    navn: "kranie",
    v05: "/emerge/v05/skull.svg",
    v06: "/emerge/v06/skull-680.webp",
    bredder: [140, 240, 340],
    note: "Kørt uden rød. Rød i øjenhulerne læste som blod, ikke som skygge — forkert tone for en butik hvor folk kommer ind fra gaden.",
  },
];

export default function FigurLab() {
  return (
    <main id="main" style={{ background: "#171310", color: "#ddd2bf", minHeight: "100svh", padding: "clamp(24px,5vw,64px)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,6vw,64px)", margin: "0 0 8px", fontWeight: 500 }}>
        Figur-lab
      </h1>
      <p style={{ maxWidth: "62ch", lineHeight: 1.6, opacity: 0.8, margin: "0 0 48px" }}>
        v05 til venstre, v06 til højre, i de størrelser figurerne faktisk vises i.
        Forskellen ligger i tre ting: varierende stregvægt, indre skravering der
        giver volumen, og ét lys fra øverste venstre hjørne på tværs af hele sættet.
        v05 havde én flad flade og den samme 2,4px kontur hele vejen rundt om hver
        eneste figur.
      </p>

      {figurer.map((f) => (
        <section key={f.navn} style={{ marginBottom: 72, borderTop: "1px solid #3a322b", paddingTop: 24 }}>
          <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.65, margin: "0 0 8px" }}>
            {f.navn}
          </h2>
          <p style={{ maxWidth: "62ch", lineHeight: 1.6, opacity: 0.7, fontSize: 15, margin: "0 0 28px" }}>{f.note}</p>

          <div style={{ display: "flex", gap: "clamp(24px,4vw,56px)", flexWrap: "wrap", alignItems: "flex-end" }}>
            {f.bredder.map((b) => (
              <div key={b}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-end", minHeight: b * 1.1 }}>
                  {(["v05", "v06"] as const).map((v) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={v} src={f[v]} alt={`${f.navn} ${v} ${b}px`} style={{ width: b, height: "auto", display: "block" }} />
                  ))}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.45, marginTop: 10, display: "flex", gap: 20 }}>
                  <span style={{ width: b }}>v05 · {b}px</span>
                  <span style={{ width: b }}>v06 · {b}px</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p style={{ maxWidth: "62ch", lineHeight: 1.6, opacity: 0.55, fontSize: 14 }}>
        v06 leveres som WebP i dobbelt visningsstørrelse. Teksturen fra træsnittet
        er hele pointen, og den koster 500–600 kB pr. figur som SVG mod 100–130 kB
        som WebP. Opskriften ligger i <code>tools/figur/</code> — den kan køres igen
        for resten af sættet.
      </p>
    </main>
  );
}
