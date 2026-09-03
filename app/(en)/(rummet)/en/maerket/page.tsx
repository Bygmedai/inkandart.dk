import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { MaerketFlade } from "@/components/rummet/MaerketFlade";
import { loadHouse } from "@/lib/content";
import { hentHylden } from "@/lib/hylden-data";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Shop · Ink & Art",
  description: "Prints and work from the studio. Ink & Art, Larsbjørnsstræde 13, Copenhagen.",
  alternates: { ...alternates("/maerket"), canonical: "/en/maerket" },
};

function oneParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

/** The shop in English — the customer's words come from i18n (Shop · Prints · Work, S579). */
export default async function MaerketPageEn({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <RummetShell lang="en" tone="salg">
      <MaerketFlade
        house={loadHouse()}
        hylden={await hentHylden()}
        artistId={oneParam(params.artist)}
        lang="en"
      />
    </RummetShell>
  );
}
