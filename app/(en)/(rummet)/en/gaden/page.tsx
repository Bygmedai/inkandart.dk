import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { GadenFlade } from "@/components/rummet/GadenFlade";
import { loadGadenEn, loadKontakt } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _k = loadKontakt();

export const metadata: Metadata = {
  title: "Find us · Ink & Art",
  description: `${_k.adresse}, ${_k.by}. Tattoo and piercing, walk-in when a chair is free.`,
  alternates: { ...alternates("/gaden"), canonical: "/en/gaden" },
};

/** The street — where a tourist standing on the pavement decides. */
export default function GadenPageEn() {
  return (
    <RummetShell lang="en">
      <GadenFlade gaden={loadGadenEn()} lang="en" />
    </RummetShell>
  );
}
