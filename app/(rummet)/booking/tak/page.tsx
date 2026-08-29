import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { cartUrl } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Booking · Ink & Art",
  alternates: { canonical: "/booking/tak" },
};

function oneParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

export default async function BookingTakPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const betalt = oneParam(params.betalt) === "1";

  if (betalt) {
    return (
      <RummetShell>
        <main id="main" className="rum-room">
          <p className="rum-body-copy rum-room__note">Depositum er betalt.</p>
        </main>
      </RummetShell>
    );
  }

  // [AFVENTER STEVEN] konsekvens ved ubetalt
  return (
    <RummetShell>
      <main id="main" className="rum-room">
        <h1 className="rum-room__title rum-poster">
          Din tid er sat. Betal depositum nu
        </h1>
        <p style={{ marginTop: 24 }}>
          <a
            className="rum-book rum-book--row"
            href={cartUrl("53492757627208")}
            rel="noopener noreferrer"
          >
            Depositum 100 kr — fragår i prisen
          </a>
        </p>
      </main>
    </RummetShell>
  );
}
