import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { MaerketFlade } from "@/components/rummet/MaerketFlade";
import { loadHouse } from "@/lib/content";
import { hentHylden } from "@/lib/hylden-data";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Shop · Ink & Art",
  description: "Prints og arbejde fra studiet. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { ...alternates("/maerket"), canonical: "/maerket" },
};

function oneParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

export default async function MaerketPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <RummetShell tone="salg">
      <MaerketFlade
        house={loadHouse()}
        hylden={await hentHylden()}
        artistId={oneParam(params.artist)}
        lang="da"
      />
    </RummetShell>
  );
}
