import Link from "next/link";
import { site } from "@/lib/site";

/* Brandet 404 — den gamle version havde sin egen; Next's rå engelske default
   er et blindt punkt for vildfaren trafik. Mørk, stille, og med de to veje
   der betyder noget: ind i landskabet eller direkte til stolen. */
export default function NotFound() {
  return (
    <main
      id="main"
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        color: "#e8e0d5",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div>
        <p aria-hidden="true" style={{ margin: 0, fontFamily: "var(--font-mono), monospace", fontSize: "11px", letterSpacing: ".4em", textTransform: "uppercase", color: "rgba(232,224,213,.4)" }}>404</p>
        <h1 style={{ margin: "14px 0 0", fontFamily: "var(--font-display), serif", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.15 }}>
          Siden er væk. Mærket består.
        </h1>
        <div style={{ marginTop: "40px", display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap", fontFamily: "var(--font-mono), monospace", fontSize: "11px", letterSpacing: ".3em", textTransform: "uppercase" }}>
          <Link href="/" style={{ color: "#e8e0d5", borderBottom: "1px solid rgba(232,224,213,.3)", paddingBottom: "4px" }}>
            Ind i landskabet
          </Link>
          <Link href="/gavekort" style={{ color: "#e8e0d5", borderBottom: "1px solid rgba(201,162,39,.35)", paddingBottom: "4px" }}>
            Gavekort
          </Link>
          <a href={site.bookingUrl} style={{ color: "#c9a227", borderBottom: "1px solid rgba(201,162,39,.45)", paddingBottom: "4px" }}>
            Booking →
          </a>
        </div>
      </div>
    </main>
  );
}
