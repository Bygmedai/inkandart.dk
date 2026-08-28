import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";

export const metadata: Metadata = {
  title: "Betingelser · Ink & Art",
  alternates: { canonical: "/betingelser" },
};

export default function BetingelserPage() {
  return (
    <RummetShell>
      <main id="main" className="rum-legal">
        <p className="rum-label">Huset</p>
        <h1 className="rum-poster">Betingelser</h1>
        <p className="rum-body-copy">
          Teksten afventer. [TAL BEKRÆFTES]
        </p>
      </main>
    </RummetShell>
  );
}
